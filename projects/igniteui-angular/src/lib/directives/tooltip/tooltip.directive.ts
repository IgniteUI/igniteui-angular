import {
    Directive, ElementRef, Input, ChangeDetectorRef, Optional, HostBinding, Inject,
    ViewContainerRef, OnInit, OnDestroy,
    HostListener,
} from '@angular/core';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { HorizontalAlignment, OverlaySettings, VerticalAlignment } from '../../services/public_api';
import { IgxNavigationService } from '../../core/navigation';
import { IgxToggleDirective } from '../toggle/toggle.directive';
import { takeUntil } from 'rxjs';

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
export class IgxTooltipDirective extends IgxToggleDirective implements OnInit, OnDestroy {
    private _arrowEl: HTMLElement;
    private _role: "tooltip" | "status" = "tooltip"

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
     * @hidden
     */
    public timeoutId;

    /**
     * @hidden
     */
    public tooltipTarget;

    /**
     * @hidden
     */
    public onShow: (event?: Event) => void;

    /**
     * @hidden
     */
    public onHide: (event?: Event) => void;

    /** @hidden */
    constructor(
        elementRef: ElementRef,
        cdr: ChangeDetectorRef,
        @Inject(IgxOverlayService) overlayService: IgxOverlayService,
        @Optional() navigationService: IgxNavigationService,
        private viewContainerRef: ViewContainerRef) {
        // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
        super(elementRef, cdr, overlayService, navigationService);
    }

    public override ngOnInit() {
        super.ngOnInit();
        this.createArrow();

        this.overlayService.animationStarting.pipe(takeUntil(this.destroy$)).subscribe( () => {
            if(this._overlayId && this._arrowEl) {
                this.positionArrow(this.overlayService.getOverlayById(this._overlayId).settings);
            }
        });
    }


    public override ngOnDestroy() {
        super.ngOnDestroy();
        this.removeArrow();
    }

    /**
     * @hidden
     */
    @HostListener('mouseenter')
    public onMouseEnter() {
        this.onShow();
    }

    /**
     * @hidden
     */
    @HostListener('mouseleave')
    public onMouseLeave() {
        this.onHide();
    }

    /**
     * If there is an animation in progress, this method will reset it to its initial state.
     * Optional `force` parameter that ends the animation.
     *
     * @hidden
     * @param force if set to `true`, the animation will be ended.
     */
    protected stopAnimations(force: boolean = false) {
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

    public positionArrow(settings?: OverlaySettings) {
        const pos = settings?.positionStrategy?.settings;
        if (!pos || !this._arrowEl) return;

        const style = this._arrowEl.style;
        const offset = 4;

        // Reset all directions and transforms
        style.top = '';
        style.bottom = '';
        style.left = '';
        style.right = '';
        style.transform = '';

        if (pos.verticalDirection === VerticalAlignment.Top) {
            style.bottom = `-${offset}px`;
            style.left = '50%';
            style.transform = 'translateX(-50%)';
        } else if (pos.verticalDirection === VerticalAlignment.Bottom) {
            style.top = `-${offset}px`;
            style.left = '50%';
            style.transform = 'translateX(-50%)';
        } else if (pos.horizontalDirection === HorizontalAlignment.Left) {
            style.right = `-${offset}px`;
            style.top = '50%';
            style.transform = 'translateY(-50%)';
        } else if (pos.horizontalDirection === HorizontalAlignment.Right) {
            style.left = `-${offset}px`;
            style.top = '50%';
            style.transform = 'translateY(-50%)';
        }
    }

    private createArrow() {
        this._arrowEl = document.createElement('div');
        this._arrowEl.classList.add('igx-tooltip-arrow');
        this._arrowEl.style.position = 'absolute';
        this._arrowEl.style.width = '8px';
        this._arrowEl.style.height = '8px';
        this._arrowEl.style.backgroundColor = 'inherit';
        this._arrowEl.style.transform = 'rotate(45deg)';
        this._arrowEl.style.display = 'block';
        this.element.appendChild(this._arrowEl);
    }

    private removeArrow() {
        this._arrowEl.remove();
        this._arrowEl = null;
    }
}
