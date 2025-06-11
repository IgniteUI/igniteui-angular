import {
    Directive, ElementRef, Input, ChangeDetectorRef, Optional, HostBinding, Inject,
    OnDestroy,
    HostListener,
} from '@angular/core';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { IgxNavigationService } from '../../core/navigation';
import { IgxToggleDirective } from '../toggle/toggle.directive';
import { IgxTooltipTargetDirective } from './tooltip-target.directive';
import { Subject, takeUntil } from 'rxjs';

let NEXT_ID = 0;
/**
 * **Ignite UI for Angular Tooltip** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tooltip)
 *
 * The Ignite UI for Angular Tooltip directive is used to mark an HTML element in the markup as one that should behave as a tooltip.
 * The tooltip is used in combination with the Ignite UI for Angular Tooltip Target by assigning the exported tooltip reference to the
 * respective target's selector property.
 *
 * Example:
 * ```html
 * <button type="button" igxButton [igxTooltipTarget]="tooltipRef">Hover me</button>
 * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
 * ```
 */
@Directive({
    exportAs: 'tooltip',
    selector: '[igxTooltip]',
    standalone: true
})
export class IgxTooltipDirective extends IgxToggleDirective implements OnDestroy {
    /**
     * @hidden
     */
    @HostBinding('class.igx-tooltip--hidden')
    public override get hiddenClass() {
        return this.collapsed;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-tooltip')
    public override get defaultClass() {
        return !this.collapsed;
    }

    /**
     * Gets/sets any tooltip related data.
     * The 'context' can be used for storing any information that is necessary
     * to access when working with the tooltip.
     *
     * ```typescript
     * // get
     * let tooltipContext = this.tooltip.context;
     * ```
     *
     * ```typescript
     * // set
     * this.tooltip.context = "Tooltip's context";
     * ```
     */
    @Input()
    public context;

    /**
     * Identifier for the tooltip.
     * If this is property is not explicitly set, it will be automatically generated.
     *
     * ```typescript
     * let tooltipId = this.tooltip.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public override id = `igx-tooltip-${NEXT_ID++}`;

    /**
     * Get the role attribute of the tooltip.
     *
     * ```typescript
     * let tooltipRole = this.tooltip.role;
     * ```
     */
    @HostBinding('attr.role')
    @Input()
    public set role(value: "tooltip" | "status"){
        this._role = value;
    }
    public get role() {
        return this._role;
    }

    /**
     * Get the arrow element of the tooltip.
     *
     * ```typescript
     * let tooltipArrow = this.tooltip.arrow;
     * ```
     */
    public get arrow(): HTMLElement {
        return this._arrowEl;
    }

    /**
     * @hidden
     */
    public timeoutId;

    /**
     * @hidden
     */
    public tooltipTarget: IgxTooltipTargetDirective;

    private _arrowEl: HTMLElement;
    private _role: 'tooltip' | 'status' = 'tooltip';
    private _destroy$ = new Subject<boolean>();

    /** @hidden */
    constructor(
        elementRef: ElementRef,
        cdr: ChangeDetectorRef,
        @Inject(IgxOverlayService) overlayService: IgxOverlayService,
        @Optional() navigationService: IgxNavigationService) {
        // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
        super(elementRef, cdr, overlayService, navigationService);

        this.onDocumentTouchStart = this.onDocumentTouchStart.bind(this);
        this.overlayService.opening.pipe(takeUntil(this._destroy$)).subscribe(() => {
            document.addEventListener('touchstart', this.onDocumentTouchStart, { passive: true });
        });
        this.overlayService.closed.pipe(takeUntil(this._destroy$)).subscribe(() => {
            document.removeEventListener('touchstart', this.onDocumentTouchStart);
        });

        this._createArrow();
    }

    /** @hidden */
    public override ngOnDestroy() {
        super.ngOnDestroy();

        document.removeEventListener('touchstart', this.onDocumentTouchStart);
        this._destroy$.next(true);
        this._destroy$.complete();
        this._removeArrow();
    }

    /**
     * @hidden
     */
    @HostListener('mouseenter')
    public onMouseEnter() {
        this.tooltipTarget?.onMouseEnter();
    }

    /**
     * @hidden
     */
    @HostListener('mouseleave')
    public onMouseLeave() {
        this.tooltipTarget?.onMouseLeave();
    }

    /**
     * If there is an animation in progress, this method will reset it to its initial state.
     * Optional `force` parameter that ends the animation.
     *
     * @hidden
     * @param force if set to `true`, the animation will be ended.
     */
    public stopAnimations(force: boolean = false): void {
        const info = this.overlayService.getOverlayById(this._overlayId);

        if (!info) return;

        if (info.openAnimationPlayer) {
            info.openAnimationPlayer.reset();
            if (force) {
                info.openAnimationPlayer.finish();
                info.openAnimationPlayer = null;
            }
        }
        if (info.closeAnimationPlayer) {
            info.closeAnimationPlayer.reset();
            if (force) {
                info.closeAnimationPlayer.finish();
                info.closeAnimationPlayer = null;
            }
        }
    }

    private _createArrow(): void {
        this._arrowEl = document.createElement('span');
        this._arrowEl.style.position = 'absolute';
        this._arrowEl.setAttribute('data-arrow', 'true');
        this.element.appendChild(this._arrowEl);
    }

    private _removeArrow(): void {
        this._arrowEl.remove();
        this._arrowEl = null;
    }

    private onDocumentTouchStart(event) {
        this.tooltipTarget?.onDocumentTouchStart(event);
    }
}
