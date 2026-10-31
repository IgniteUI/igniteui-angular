import {
    Directive, Input, HostBinding,
    OnDestroy, inject, HostListener,
    Renderer2,
    AfterViewInit,
} from '@angular/core';
import { takeUntil } from 'rxjs';
import { OverlaySettings, PlatformUtil } from 'igniteui-angular/core';
import { IgxToggleDirective } from '../toggle/toggle.directive';
import { IgxTooltipTargetDirective } from './tooltip-target.directive';
import { observeTooltipLayout } from './tooltip-layout-observer';

let NEXT_ID = 0;

/** The target and the tooltip as measured at the last positioning of an open tooltip. */
interface TooltipLayout {
    targetLeft: number;
    targetTop: number;
    targetWidth: number;
    targetHeight: number;
    width: number;
    height: number;
}

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
    public context: any;

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
    public timeoutId: any;

    /**
     * @hidden
     */
    public tooltipTarget!: IgxTooltipTargetDirective;

    private _arrowEl!: HTMLElement;
    private _role: 'tooltip' | 'status' = 'tooltip';
    private _renderer = inject(Renderer2);
    private _platformUtil = inject(PlatformUtil);
    private _stopLayoutObserver?: () => void;
    private _layout?: TooltipLayout;

    constructor() {
        super();
        this.closed.pipe(takeUntil(this.destroy$)).subscribe(() => this._unobserveLayout());
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        if (this._platformUtil.isBrowser) {
            this._createArrow();
        }
    }

    /** @hidden */
    public override ngOnDestroy() {
        this._unobserveLayout();
        super.ngOnDestroy();

        if (this.arrow) {
            this._removeArrow();
        }
    }

    /**
     * Opens the tooltip. While it is open, it follows changes of its own size and of the size and the
     * position of its target, such as after a theme or a font change.
     *
     * @hidden
     */
    public override open(overlaySettings?: OverlaySettings) {
        super.open(overlaySettings);
        this._observeLayout();
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
            info.closeAnimationPlayer = null!;
        } else if (!this.collapsed) {
            const animation = overlaySettings.positionStrategy!.settings.closeAnimation;
            overlaySettings.positionStrategy!.settings.closeAnimation = null!;
            this.close();
            overlaySettings.positionStrategy!.settings.closeAnimation = animation;
        }
    }

    public markForCheck() {
        this.cdr.markForCheck();
    }

    private _observeLayout(): void {
        this._unobserveLayout();

        const target = this.overlayService.getOverlayById(this._overlayId)?.settings?.target;

        if (this.collapsed || !this._platformUtil.isBrowser || !(target instanceof HTMLElement)) {
            return;
        }

        this._layout = this._measureLayout(target);
        this._stopLayoutObserver = observeTooltipLayout(this.element, target, () => this._updateLayout(target));
    }

    private _unobserveLayout(): void {
        this._stopLayoutObserver?.();
        this._stopLayoutObserver = undefined;
    }

    /**
     * Positions the open tooltip again after a layout change. When only the target moved, a
     * reposition is enough, as for a scroll. When a size changed, the overlay content gets its natural
     * size again and is fitted into the viewport anew, as when the tooltip opens.
     */
    private _updateLayout(target: HTMLElement): void {
        const info = this.overlayService.getOverlayById(this._overlayId);
        const content = this.element.parentElement;

        if (this.collapsed || !info?.settings?.positionStrategy || !content) {
            return;
        }

        const layout = this._measureLayout(target);
        const previous = this._layout;
        const resized = !previous
            || layout.width !== previous.width || layout.height !== previous.height
            || layout.targetWidth !== previous.targetWidth || layout.targetHeight !== previous.targetHeight;
        const moved = !previous || layout.targetLeft !== previous.targetLeft || layout.targetTop !== previous.targetTop;

        if (!resized && !moved) {
            return;
        }

        if (resized) {
            // The overlay fixes the content width when it shows the tooltip. Measure the natural size
            // away from the viewport edges, where the content could shrink, and without the translate
            // that pushed it into the viewport. The open animation scales only the tooltip, not the
            // content, so the content rectangle has the full size, with its fraction.
            Object.assign(content.style, { width: '', transform: '', left: '0px', top: '0px', right: '', bottom: '' });

            const { width, height } = content.getBoundingClientRect();

            if (width) {
                content.style.width = `${width}px`;
            }

            info.settings.positionStrategy.position(content, { width, height }, this.element.ownerDocument, true, target);
        } else {
            this.overlayService.reposition(this._overlayId);
        }

        this._layout = this._measureLayout(target);
    }

    /**
     * Measures the target and the tooltip. The tooltip size is its layout size, which the scale of
     * the open animation does not change.
     */
    private _measureLayout(target: HTMLElement): TooltipLayout {
        const { left, top, width, height } = target.getBoundingClientRect();

        return {
            targetLeft: left,
            targetTop: top,
            targetWidth: width,
            targetHeight: height,
            width: this.element.offsetWidth,
            height: this.element.offsetHeight
        };
    }

    private _createArrow(): void {
        this._arrowEl = this._renderer.createElement('span');
        this._renderer.setStyle(this._arrowEl, 'position', 'absolute');
        this._renderer.setAttribute(this._arrowEl, 'data-arrow', 'true');
        this._renderer.appendChild(this.element, this._arrowEl);
    }

    private _removeArrow(): void {
        this._arrowEl.remove();
        this._arrowEl = null!;
    }
}
