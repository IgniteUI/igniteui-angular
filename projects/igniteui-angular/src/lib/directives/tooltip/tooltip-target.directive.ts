import { useAnimation } from '@angular/animations';
import { Directive, OnInit, OnDestroy, Output, ElementRef, Optional, ViewContainerRef, HostListener, Input, EventEmitter, booleanAttribute } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxNavigationService } from '../../core/navigation';
import { IBaseEventArgs } from '../../core/utils';
import { AutoPositionStrategy, HorizontalAlignment, PositionSettings } from '../../services/public_api';
import { IgxToggleActionDirective } from '../toggle/toggle.directive';
import { IgxTooltipComponent } from './tooltip.component';
import { IgxTooltipDirective } from './tooltip.directive';
import { fadeOut, scaleInCenter } from 'igniteui-angular/animations';

export interface ITooltipShowEventArgs extends IBaseEventArgs {
    target: IgxTooltipTargetDirective;
    tooltip: IgxTooltipDirective;
    cancel: boolean;
}
export interface ITooltipHideEventArgs extends IBaseEventArgs {
    target: IgxTooltipTargetDirective;
    tooltip: IgxTooltipDirective;
    cancel: boolean;
}

/**
 * **Ignite UI for Angular Tooltip Target** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tooltip)
 *
 * The Ignite UI for Angular Tooltip Target directive is used to mark an HTML element in the markup as one that has a tooltip.
 * The tooltip target is used in combination with the Ignite UI for Angular Tooltip by assigning the exported tooltip reference to the
 * target's selector property.
 *
 * Example:
 * ```html
 * <button type="button" igxButton [igxTooltipTarget]="tooltipRef">Hover me</button>
 * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
 * ```
 */
@Directive({
    exportAs: 'tooltipTarget',
    selector: '[igxTooltipTarget]',
    standalone: true
})
export class IgxTooltipTargetDirective extends IgxToggleActionDirective implements OnInit, OnDestroy {
    /**
     * Gets/sets the amount of milliseconds that should pass before showing the tooltip.
     *
     * ```typescript
     * // get
     * let tooltipShowDelay = this.tooltipTarget.showDelay;
     * ```
     *
     * ```html
     * <!--set-->
     * <button type="button" igxButton [igxTooltipTarget]="tooltipRef" [showDelay]="1500">Hover me</button>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     */
    @Input()
    public showDelay = 500;

    /**
     * Gets/sets the amount of milliseconds that should pass before hiding the tooltip.
     *
     * ```typescript
     * // get
     * let tooltipHideDelay = this.tooltipTarget.hideDelay;
     * ```
     *
     * ```html
     * <!--set-->
     * <button type="button" igxButton [igxTooltipTarget]="tooltipRef" [hideDelay]="1500">Hover me</button>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     */
    @Input()
    public hideDelay = 500;

    /**
     * Specifies if the tooltip should not show when hovering its target with the mouse. (defaults to false)
     * While setting this property to 'true' will disable the user interactions that shows/hides the tooltip,
     * the developer will still be able to show/hide the tooltip through the API.
     *
     * ```typescript
     * // get
     * let tooltipDisabledValue = this.tooltipTarget.tooltipDisabled;
     * ```
     *
     * ```html
     * <!--set-->
     * <button type="button" igxButton [igxTooltipTarget]="tooltipRef" [tooltipDisabled]="true">Hover me</button>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public tooltipDisabled = false;

    /**
     * @hidden
     */
    @Input('igxTooltipTarget')
    public override set target(target: any) {
        if (target instanceof IgxTooltipDirective) {
            this._target = target;
        }
    }

    /**
     * @hidden
     */
    public override get target(): any {
        if (typeof this._target === 'string') {
            return this._navigationService.get(this._target);
        }
        return this._target;
    }

    /**
    * @hidden
    */
    @Input()
    public set tooltip(content: any) {
        if (!this.target && (typeof content === 'string' || content instanceof String)) {
            const tooltipComponent = this._viewContainerRef.createComponent(IgxTooltipComponent);
            tooltipComponent.instance.content = content as string;

            this._target = tooltipComponent.instance.tooltip;
        }
    }

    /**
     * Gets the respective native element of the directive.
     *
     * ```typescript
     * let tooltipTargetElement = this.tooltipTarget.nativeElement;
     * ```
     */
    public get nativeElement() {
        return this._element.nativeElement;
    }

    /**
     * Indicates if the tooltip that is is associated with this target is currently hidden.
     *
     * ```typescript
     * let tooltipHiddenValue = this.tooltipTarget.tooltipHidden;
     * ```
     */
    public get tooltipHidden(): boolean {
        return !this.target || this.target.collapsed;
    }

    /**
     * Emits an event when the tooltip that is associated with this target starts showing.
     * This event is fired before the start of the countdown to showing the tooltip.
     *
     * ```typescript
     * tooltipShowing(args: ITooltipShowEventArgs) {
     *    alert("Tooltip started showing!");
     * }
     * ```
     *
     * ```html
     * <button type="button" igxButton [igxTooltipTarget]="tooltipRef" (tooltipShow)='tooltipShowing($event)'>Hover me</button>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     */
    @Output()
    public tooltipShow = new EventEmitter<ITooltipShowEventArgs>();

    /**
     * Emits an event when the tooltip that is associated with this target starts hiding.
     * This event is fired before the start of the countdown to hiding the tooltip.
     *
     * ```typescript
     * tooltipHiding(args: ITooltipHideEventArgs) {
     *    alert("Tooltip started hiding!");
     * }
     * ```
     *
     * ```html
     * <button type="button" igxButton [igxTooltipTarget]="tooltipRef" (tooltipHide)='tooltipHiding($event)'>Hover me</button>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     */
    @Output()
    public tooltipHide = new EventEmitter<ITooltipHideEventArgs>();

    private destroy$ = new Subject<void>();

    constructor(private _element: ElementRef,
        @Optional() private _navigationService: IgxNavigationService, private _viewContainerRef: ViewContainerRef) {
        super(_element, _navigationService);
    }

    /**
     * @hidden
     */
    @HostListener('click')
    public override onClick() {
        if (!this.target.collapsed) {
            this.target.forceClose(this.mergedOverlaySettings);
        }
    }

    /**
     * @hidden
     */
    @HostListener('mouseenter')
    public onMouseEnter() {
        if (this.tooltipDisabled) {
            return;
        }

        this.checkOutletAndOutsideClick();
        const shouldReturn = this.preMouseEnterCheck();
        if (shouldReturn) {
            return;
        }

        this.target.tooltipTarget = this;

        const showingArgs = { target: this, tooltip: this.target, cancel: false };
        this.tooltipShow.emit(showingArgs);

        if (showingArgs.cancel) {
            return;
        }

        this.target.toBeShown = true;
        this.target.timeoutId = setTimeout(() => {
            this.target.open(this.mergedOverlaySettings); // Call open() of IgxTooltipDirective
            this.target.toBeShown = false;
        }, this.showDelay);
    }

    /**
     * @hidden
     */
    @HostListener('mouseleave')
    public onMouseLeave() {
        if (this.tooltipDisabled) {
            return;
        }

        this.checkOutletAndOutsideClick();
        const shouldReturn = this.preMouseLeaveCheck();
        if (shouldReturn || this.target.collapsed) {
            return;
        }

        this.target.toBeHidden = true;
        this.target.timeoutId = setTimeout(() => {
            this.target.close(); // Call close() of IgxTooltipDirective
            this.target.toBeHidden = false;
        }, this.hideDelay);


    }

    /**
     * @hidden
     */
    public onTouchStart() {
        if (this.tooltipDisabled) {
            return;
        }

        this.showTooltip();
    }

    /**
     * @hidden
     */
    public onDocumentTouchStart(event) {
        if (this.tooltipDisabled) {
            return;
        }

        if (this.nativeElement !== event.target &&
            !this.nativeElement.contains(event.target)
        ) {
            this.hideTooltip();
        }
    }

    /**
     * @hidden
     */
    public override ngOnInit() {
        super.ngOnInit();

        const positionSettings: PositionSettings = {
            horizontalDirection: HorizontalAlignment.Center,
            horizontalStartPoint: HorizontalAlignment.Center,
            openAnimation: useAnimation(scaleInCenter, { params: { duration: '150ms' } }),
            closeAnimation: useAnimation(fadeOut, { params: { duration: '75ms' } })
        };

        this._overlayDefaults.positionStrategy = new AutoPositionStrategy(positionSettings);
        this._overlayDefaults.closeOnOutsideClick = false;
        this._overlayDefaults.closeOnEscape = true;

        this.target.closing.pipe(takeUntil(this.destroy$)).subscribe((event) => {
            if (this.target.tooltipTarget !== this) {
                return;
            }

            const hidingArgs = { target: this, tooltip: this.target, cancel: false };
            this.tooltipHide.emit(hidingArgs);

            if (hidingArgs.cancel) {
                event.cancel = true;
            }
        });

        this.nativeElement.addEventListener('touchstart', this.onTouchStart = this.onTouchStart.bind(this), { passive: true });
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.hideTooltip();
        this.nativeElement.removeEventListener('touchstart', this.onTouchStart);
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Shows the tooltip by respecting the 'showDelay' property.
     *
     * ```typescript
     * this.tooltipTarget.showTooltip();
     * ```
     */
    public showTooltip() {
        clearTimeout(this.target.timeoutId);

        if (!this.target.collapsed) {
            //  if close animation has started finish it, or close the tooltip with no animation
            this.target.forceClose(this.mergedOverlaySettings);
            this.target.toBeHidden = false;
        }
        this.target.tooltipTarget = this;

        const showingArgs = { target: this, tooltip: this.target, cancel: false };
        this.tooltipShow.emit(showingArgs);

        if (showingArgs.cancel) {
            return;
        }

        this.target.toBeShown = true;
        this.target.timeoutId = setTimeout(() => {
            this.target.open(this.mergedOverlaySettings); // Call open() of IgxTooltipDirective
            this.target.toBeShown = false;
        }, this.showDelay);
    }

    /**
     * Hides the tooltip by respecting the 'hideDelay' property.
     *
     * ```typescript
     * this.tooltipTarget.hideTooltip();
     * ```
     */
    public hideTooltip() {
        if (this.target.collapsed && this.target.toBeShown) {
            clearTimeout(this.target.timeoutId);
        }

        if (this.target.collapsed || this.target.toBeHidden) {
            return;
        }

        this.target.toBeHidden = true;
        this.target.timeoutId = setTimeout(() => {
            this.target.close(); // Call close() of IgxTooltipDirective
            this.target.toBeHidden = false;
        }, this.hideDelay);
    }

    private checkOutletAndOutsideClick() {
        if (this.outlet) {
            this._overlayDefaults.outlet = this.outlet;
        }
    }

    private get mergedOverlaySettings() {
        return Object.assign({}, this._overlayDefaults, this.overlaySettings);
    }

    // Return true if the execution in onMouseEnter should be terminated after this method
    private preMouseEnterCheck() {
        // If tooltip is about to be opened
        if (this.target.toBeShown) {
            clearTimeout(this.target.timeoutId);
            this.target.toBeShown = false;
        }

        // If Tooltip is opened or about to be hidden
        if (!this.target.collapsed || this.target.toBeHidden) {
            clearTimeout(this.target.timeoutId);

            //  if close animation has started finish it, or close the tooltip with no animation
            this.target.forceClose(this.mergedOverlaySettings);
            this.target.toBeHidden = false;
        }

        return false;
    }

    // Return true if the execution in onMouseLeave should be terminated after this method
    private preMouseLeaveCheck(): boolean {
        clearTimeout(this.target.timeoutId);

        // If tooltip is about to be opened
        if (this.target.toBeShown) {
            this.target.toBeShown = false;
            this.target.toBeHidden = false;
            return true;
        }

        return false;
    }
}
