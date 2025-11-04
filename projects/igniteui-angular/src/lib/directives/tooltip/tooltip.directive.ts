import {
    Directive, Input, HostBinding,
    OnDestroy, inject, HostListener,
    Renderer2,
    AfterViewInit,
} from '@angular/core';
import { OverlaySettings } from '../../services/overlay/utilities';
import { IgxToggleDirective } from '../toggle/toggle.directive';
import { IgxTooltipTargetDirective } from './tooltip-target.directive';
import { PlatformUtil } from '../../core/utils';

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
export class IgxTooltipDirective extends IgxToggleDirective implements AfterViewInit, OnDestroy {
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
    private _renderer = inject(Renderer2);
    private _platformUtil = inject(PlatformUtil);

    /** @hidden */
    public ngAfterViewInit(): void {
        if (this._platformUtil.isBrowser) {
            this._createArrow();
        }
    }

    /** @hidden */
    public override ngOnDestroy() {
        super.ngOnDestroy();

        if (this.arrow) {
            this._removeArrow();
        }
    }

    /**
     * @hidden
     */
    @HostListener('pointerenter')
    protected onPointerEnter() {
        if (this.tooltipTarget) {
            this.tooltipTarget.onShow();
        }
    }

    /**
     * @hidden
     */
    @HostListener('pointerleave')
    protected onPointerLeave() {
        if (this.tooltipTarget) {
            this.tooltipTarget.onHide();
        }
    }

    /**
     * If there is an animation in progress, this method will reset it to its initial state.
     * Allows hovering over the tooltip while an open/close animation is running.
     * Stops the animation and immediately shows the tooltip.
     *
     * @hidden
     */
    public stopAnimations(): void {
        const info = this.overlayService.getOverlayById(this._overlayId);

        if (!info) return;

        if (info.openAnimationPlayer) {
            info.openAnimationPlayer.reset();
        }
        if (info.closeAnimationPlayer) {
            info.closeAnimationPlayer.reset();
        }
    }

    /**
     * If there is a close animation in progress, this method will end it.
     * If there is no close animation in progress, this method will close the tooltip with no animation.
     *
     * @param overlaySettings settings to use for closing the tooltip
     * @hidden
     */
    public forceClose(overlaySettings: OverlaySettings) {
        const info = this.overlayService.getOverlayById(this._overlayId);

        if (info && info.closeAnimationPlayer) {
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

    private _createArrow(): void {
        this._arrowEl = this._renderer.createElement('span');
        this._renderer.setStyle(this._arrowEl, 'position', 'absolute');
        this._renderer.setAttribute(this._arrowEl, 'data-arrow', 'true');
        this._renderer.appendChild(this.element, this._arrowEl);
    }

    private _removeArrow(): void {
        this._arrowEl.remove();
        this._arrowEl = null;
    }
}
