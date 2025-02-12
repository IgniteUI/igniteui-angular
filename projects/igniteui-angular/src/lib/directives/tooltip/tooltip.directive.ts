import {
    Directive, ElementRef, Input, ChangeDetectorRef, Optional, HostBinding, Inject
} from '@angular/core';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { OverlaySettings } from '../../services/public_api';
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
     * If there is open animation in progress this method will finish is.
     * If there is no open animation in progress this method will open the toggle with no animation.
     *
     * @param overlaySettings setting to use for opening the toggle
     */
    protected forceOpen(overlaySettings?: OverlaySettings) {
        const info = this.overlayService.getOverlayById(this._overlayId);
        const hasOpenAnimation = info ? info.openAnimationPlayer : false;
        if (hasOpenAnimation) {
            info.openAnimationPlayer.finish();
            info.openAnimationPlayer.reset();
            info.openAnimationPlayer = null;
        } else if (this.collapsed) {
            const animation = overlaySettings.positionStrategy.settings.openAnimation;
            overlaySettings.positionStrategy.settings.openAnimation = null;
            this.open(overlaySettings);
            overlaySettings.positionStrategy.settings.openAnimation = animation;
        }
    }

    /**
     * If there is close animation in progress this method will finish is.
     * If there is no close animation in progress this method will close the toggle with no animation.
     *
     * @param overlaySettings settings to use for closing the toggle
     */
    protected forceClose(overlaySettings?: OverlaySettings) {
        const info = this.overlayService.getOverlayById(this._overlayId);
        const hasCloseAnimation = info ? info.closeAnimationPlayer : false;

        if (hasCloseAnimation) {
            info.closeAnimationPlayer.finish();
            info.closeAnimationPlayer.reset();
            info.closeAnimationPlayer = null;
        } else if (!this.collapsed) {
            const animation = overlaySettings.positionStrategy.settings.closeAnimation;
            overlaySettings.positionStrategy.settings.closeAnimation = null;
            this.close();
            overlaySettings.positionStrategy.settings.closeAnimation = animation;
        }
    }
}
