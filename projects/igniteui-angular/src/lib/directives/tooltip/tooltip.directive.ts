import {
    Directive, ElementRef, Input, ChangeDetectorRef, Optional, HostBinding, Inject,
    HostListener
} from '@angular/core';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { IgxNavigationService } from '../../core/navigation';
import { IgxToggleDirective } from '../toggle/toggle.directive';

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
export class IgxTooltipDirective extends IgxToggleDirective {
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
     * Specifies if the tooltip remains visible until the user closes it via the close button or Esc key.
     */
    @Input()
    public sticky = false;

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
    public get role() {
        return 'tooltip';
    }

    /**
     * @hidden
     */
    public timeoutId;

    /**
     * @hidden
     * Returns whether close time out has started
     */
    public toBeHidden = false;

    /**
     * @hidden
     * Returns whether open time out has started
     */
    public toBeShown = false;

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
        @Optional() navigationService: IgxNavigationService) {
        // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
        super(elementRef, cdr, overlayService, navigationService);
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

    protected stopAnimations() {
        const info = this.overlayService.getOverlayById(this._overlayId);

        if (!info) return;

        if (info.openAnimationPlayer) {
            info.openAnimationPlayer.reset();
        }
        if (info.closeAnimationPlayer) {
            info.closeAnimationPlayer.reset();
        }
    }
}
