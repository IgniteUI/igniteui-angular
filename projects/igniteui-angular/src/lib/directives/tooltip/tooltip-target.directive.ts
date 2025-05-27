import { useAnimation } from '@angular/animations';
import {
    Directive, OnInit, OnDestroy, Output, ElementRef, Optional, ViewContainerRef,
    Input, EventEmitter, booleanAttribute, TemplateRef, ComponentRef, Renderer2, OnChanges, SimpleChanges,
    EnvironmentInjector,
    createComponent,
    HostListener,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxNavigationService } from '../../core/navigation';
import { IBaseEventArgs } from '../../core/utils';
import {  PositionSettings } from '../../services/public_api';
import { IgxToggleActionDirective } from '../toggle/toggle.directive';
import { IgxTooltipComponent } from './tooltip.component';
import { IgxTooltipDirective } from './tooltip.directive';
import { IgxTooltipCloseButtonComponent } from './tooltip-close-button.component';
import { fadeOut, scaleInCenter } from 'igniteui-angular/animations';
import { TooltipPlacement } from './enums';
import { TooltipPositionStrategy, PositionsMap, parseTriggers } from './tooltip.common';

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
export class IgxTooltipTargetDirective extends IgxToggleActionDirective implements OnChanges, OnInit, OnDestroy {
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
    public showDelay = 200;

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
    public hideDelay = 300;


    /**
     * Where to place the tooltip relative to the target element. Default value is `top`.
     * ```html
     * <igx-icon [igxTooltipTarget]="tooltipRef" placement="bottom-start">info</igx-icon>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     */
    @Input()
    public set placement(value: TooltipPlacement) {
        this._placement = value;

        if (this._overlayDefaults && this.target) {
            this._overlayDefaults.positionStrategy = new TooltipPositionStrategy(this._positionsSettingsByPlacement, this);
        }
    }

    public get placement(): TooltipPlacement {
        return this._placement;
    }

    /** The offset of the tooltip from the target in pixels. Default value is 6. */
    @Input()
    public set offset(value: number) {
        this._offset = value;

        if (this._overlayDefaults && this.target) {
            this._overlayDefaults.positionStrategy = new TooltipPositionStrategy(this._positionsSettingsByPlacement, this);
        }
    }

    public get offset(): number {
        return this._offset;
    }

    /**
     * Controls whether the arrow element of the tooltip is rendered.
     * Set to true to hide the arrow. Default value is `false`.
     *
     * ```typescript
     * // get
     * let isArrowDisabled = this.tooltip.disableArrow;
     * ```
     *
     * ```typescript
     * // set
     * this.tooltip.disableArrow = false;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-icon igxTooltipTarget [disableArrow]="true" [tooltip]="'Infragistics Inc. HQ'">info</igx-icon>
     * ```
     */
    @Input()
    public set disableArrow(value: boolean) {
        if (this.target) {
            this.target.arrow.style.display = value ? 'none' : '';
        }
        this._disableArrow = value;
    }

    public get disableArrow(): boolean {
        return this._disableArrow;
    }

    /**
     * Specifies if the tooltip remains visible until the user closes it via the close button or Esc key.
     *
     * ```typescript
     * // get
     * let isSticky = this.tooltip.sticky;
     * ```
     *
     * ```typescript
     * // set
     * this.tooltip.sticky = true;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-icon igxTooltipTarget [sticky]="true" [tooltip]="'Infragistics Inc. HQ'">info</igx-icon>
     * ```
     */
    @Input()
    public set sticky (value: boolean) {
        const changed = this._sticky !== value;
        this._sticky = value;

        if (changed) {
            this._createCloseTemplate(this._closeTemplate);
            this._evaluateStickyState();
        }
    };

    public get sticky (): boolean {
        return this._sticky;
    }


    /**
     *  Allows full control over the appearance of the close button inside the tooltip.
     *
     * ```typescript
     * // get
     * let customCloseTemplate = this.tooltip.customCloseTemplate;
     * ```
     *
     * ```typescript
     * // set
     * this.tooltip.customCloseTemplate = TemplateRef<any>;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-icon igxTooltipTarget [closeButtonTemplate]="customClose" [tooltip]="'Infragistics Inc. HQ'">info</igx-icon>
     * <ng-template #customClose>
     *      <button class="my-close-btn">Close Me</button>
     * </ng-template>
     * ```
     */
    @Input('closeButtonTemplate')
    public set closeTemplate(value: TemplateRef<any>) {
        this._closeTemplate = value;
        this._createCloseTemplate(this._closeTemplate);
        this._evaluateStickyState();
    }
    public get closeTemplate(): TemplateRef<any> | undefined {
        return this._closeTemplate;
    }

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

    @Input()
    public set showTriggers(value: string) {
        const newTriggers = parseTriggers(value);
        this._showTriggers = newTriggers;
        this._bindDynamicTriggers(); // Rebind
    }
    public get showTriggers(): string {
        return Array.from(this._showTriggers).join(', ');
    }

    @Input()
    public set hideTriggers(value: string) {
        const newTriggers = parseTriggers(value);
        this._hideTriggers = newTriggers;
        this._bindDynamicTriggers(); // Rebind
    }
    public get hideTriggers(): string {
        return Array.from(this._hideTriggers).join(', ');
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

    private _destroy$ = new Subject<void>();
    private _autoHideDelay = 180;
    private _isForceClosed = false;
    private _disableArrow = false;
    private _offset = 6;
    private _placement: TooltipPlacement = TooltipPlacement.top;
    private _closeButtonRef?: ComponentRef<IgxTooltipCloseButtonComponent>;
    private _closeTemplate: TemplateRef<any>;
    private _sticky = false;
    private _removeEventListeners: (() => void)[] = [];
    private _showTriggers = new Set<string>(['mouseenter', 'touchstart']);
    private _hideTriggers = new Set<string>(['mouseleave', 'click']);

    constructor(
        private _element: ElementRef,
        @Optional() private _navigationService: IgxNavigationService,
        private _viewContainerRef: ViewContainerRef,
        private _renderer: Renderer2,
        private _envInjector: EnvironmentInjector
    ) {
        super(_element, _navigationService);
    }


    /**
     * Handles the logic for show triggers (e.g., 'mouseenter', 'touchstart').
     */
    private _handleShowTrigger = () => {
        if (this.tooltipDisabled) return;
        if (!this.target.collapsed && this.target?.tooltipTarget?.sticky) return;

        this._checkOutletAndOutsideClick();
        this._checkTooltipForMultipleTargets();
        this._evaluateStickyState();
        this._showOnInteraction();
    };

    /**
     * Handles the logic for hide triggers (e.g., 'mouseleave', 'click').
     */
    private _handleHideTrigger = () => {
        if (this.tooltipDisabled) return;

        this._checkOutletAndOutsideClick();
        this._hideOnInteraction();
    };

    /**
     * Handles global document touch interactions (typically for mobile).
     */
    private _handleDocumentTouch = (event: Event) => {
        if (this.tooltipDisabled || this.sticky) return;
        if (this.nativeElement !== event.target && !this.nativeElement.contains(event.target)) {
            this._hideOnInteraction();
        }
    };

    // The IgxToggleActionDirective's onClick method is overridden to prevent the default click behavior
    @HostListener('click')
    public override onClick() {

    }

    /**
     * @hidden
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['disableArrow']) {
            this.target.arrow.style.display = changes['disableArrow'].currentValue ? 'none' : '';
        }
    }

    /**
     * @hidden
     */
    public override ngOnInit() {
        super.ngOnInit();

        this._bindDynamicTriggers();
        this._overlayDefaults.positionStrategy = new TooltipPositionStrategy(this._positionsSettingsByPlacement, this);
        this._overlayDefaults.closeOnOutsideClick = false;
        this._overlayDefaults.closeOnEscape = true;

        this.target.closing.pipe(takeUntil(this._destroy$)).subscribe((event) => {
            const hidingArgs = { target: this, tooltip: this.target, cancel: false };
            this.tooltipHide.emit(hidingArgs);

            if (hidingArgs.cancel) {
                event.cancel = true;
            }
        });

        this.target.onShow = this._showOnInteraction.bind(this);
        this.target.onHide = this._hideOnInteraction.bind(this);
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.hideTooltip();
        this._destroyCloseButton();
        this._clearTriggers();
        this._removeEventListeners.forEach(unlisten => unlisten());
        this._destroy$.next();
        this._destroy$.complete();
    }

    /**
     * Shows the tooltip if not already shown.
     *
     * ```typescript
     * this.tooltipTarget.showTooltip();
     * ```
     */
    public showTooltip() {
        this._showTooltip(false, true);
    }

    /**
     * Hides the tooltip if not already hidden.
     *
     * ```typescript
     * this.tooltipTarget.hideTooltip();
     * ```
     */
    public hideTooltip() {
        this._hideTooltip(false);
    }

    private get _mergedOverlaySettings() {
        return Object.assign({}, this._overlayDefaults, this.overlaySettings);
    }

    private get _positionsSettingsByPlacement(): PositionSettings {
        const positions = PositionsMap.get(this.placement);
        const animations = {
            openAnimation: useAnimation(scaleInCenter, { params: { duration: '150ms' } }),
            closeAnimation: useAnimation(fadeOut, { params: { duration: '75ms' } })
        }
        return Object.assign({}, animations, positions);
    }

    private _checkOutletAndOutsideClick(): void {
        if (this.outlet) {
            this._overlayDefaults.outlet = this.outlet;
        }
    }

    private _hideTooltip(withDelay: boolean): void {
        if (this.target.collapsed) {
            return;
        }

        this.target.timeoutId = setTimeout(() => {
            // Call close() of IgxTooltipDirective
            this.target.close();
        }, withDelay ? this.hideDelay : 0);
    }

    private _showTooltip(withDelay: boolean, withEvents: boolean): void {
        if (!this.target.collapsed && !this._isForceClosed) {
            return;
        }

        if (this._isForceClosed) {
            this._isForceClosed = false;
        }

        if (withEvents) {
            const showingArgs = { target: this, tooltip: this.target, cancel: false };
            this.tooltipShow.emit(showingArgs);

            if (showingArgs.cancel) return;
        }

        this.target.timeoutId = setTimeout(() => {
            // Call open() of IgxTooltipDirective
            this.target.open(this._mergedOverlaySettings);
        }, withDelay ? this.showDelay : 0);
    }


    private _showOnInteraction(): void {
        this._stopTimeoutAndAnimation();
        this._showTooltip(true, true);
    }

    private _hideOnInteraction(): void {
        if (this.target?.tooltipTarget?.sticky) {
            return;
        }
        this._setAutoHide();
    }

    private _setAutoHide(): void {
        this._stopTimeoutAndAnimation();

        this.target.timeoutId = setTimeout(() => {
            this._hideTooltip(true);
        }, this._autoHideDelay);
    }

    /**
     * Used when the browser animations are set to a lower percentage
     * and the user interacts with the target or tooltip __while__ an animation is playing.
     * It stops the running animation, and the tooltip is instantly shown.
     */
    private _stopTimeoutAndAnimation(): void {
        clearTimeout(this.target.timeoutId);
        this.target.stopAnimations();
    }

    /**
     * Used when a single tooltip is used for multiple targets.
     * If the tooltip is shown for one target and the user interacts with another target,
     * the tooltip is instantly hidden for the first target.
     */
    private _checkTooltipForMultipleTargets(): void {
        if (!this.target.tooltipTarget) {
            this.target.tooltipTarget = this;
        }
        if (this.target.tooltipTarget !== this) {
            if (this.target.tooltipTarget.sticky) {
                this.target.tooltipTarget._removeCloseButtonFromTooltip();
            }

            clearTimeout(this.target.timeoutId);
            this.target.stopAnimations(true);

            this.target.tooltipTarget = this;
            this._isForceClosed = true;
        }
    }

    /**
     * Updates the tooltip's sticky-related state, but only if the current target owns the tooltip.
     *
     * This method ensures that when the active target modifies its `sticky` or `closeTemplate` properties
     * at runtime, the tooltip reflects those changes accordingly:
     */
    private _evaluateStickyState(): void {
        if(this?.target?.tooltipTarget === this) {
            if (this.sticky) {
                this._appendCloseButtonToTooltip();
            } else if (!this.sticky) {
                this._removeCloseButtonFromTooltip();
            }
        }
    }

    /**
     * Creates (if not already created) an instance of the IgxTooltipCloseButtonComponent,
     * and assigns it the provided custom template.
     */
    private _createCloseTemplate(template?: TemplateRef<any> | undefined): void {
        if (!this._closeButtonRef) {
            this._closeButtonRef = createComponent(IgxTooltipCloseButtonComponent, {
                environmentInjector: this._envInjector
              });

            this._closeButtonRef.instance.customTemplate = template;
            this._closeButtonRef.instance.clicked.pipe(takeUntil(this._destroy$)).subscribe(() => {
                this._hideTooltip(true);
            });
        } else {
            this._closeButtonRef.instance.customTemplate = template;
        }
    }

    /**
     * Appends the close button to the tooltip.
     */
    private _appendCloseButtonToTooltip(): void {
        if (this?.target && this._closeButtonRef) {
            this._renderer.appendChild(this.target.element, this._closeButtonRef.location.nativeElement);
            this._closeButtonRef.changeDetectorRef.detectChanges();
            this.target.role = "status"
        }
    }

    /**
     * Removes the close button from the tooltip.
     */
    private _removeCloseButtonFromTooltip() {
        if (this?.target && this._closeButtonRef) {
            this._renderer.removeChild(this.target.element, this._closeButtonRef.location.nativeElement);
            this._closeButtonRef.changeDetectorRef.detectChanges();
            this.target.role = "tooltip"
        }
    }

    private _destroyCloseButton(): void {
        if (this._closeButtonRef) {
            this._closeButtonRef.destroy();
            this._closeButtonRef = undefined;
        }
    }


    /**
     * Binds user-defined show/hide triggers to the target element.
     *
     * This method first clears any previously attached event listeners using `_clearTriggers()`.
     * It then iterates through the configured `showTriggers` and `hideTriggers`, mapping each trigger
     * (e.g. 'click', 'mouseenter', 'mouseleave') to the corresponding handler method.
     *
     * For each trigger, it registers an event listener on the native element and stores the listener
     * function in `_removeEventListeners` for proper cleanup later.
     *
     * Additionally, a global 'touchstart' listener is added to the document to handle outside touch
     * interactions for tooltip dismissal on mobile devices.
     */
    private _bindDynamicTriggers(): void {
        const native = this.nativeElement;
        this._clearTriggers();

        const triggerMap: [string, () => void][] = [
            ...[...this._showTriggers].map(trigger => [trigger, this._handleShowTrigger] as [string, () => void]),
            ...[...this._hideTriggers].map(trigger => [trigger, this._handleHideTrigger] as [string, () => void])
        ];


        triggerMap.forEach(([event, handler]) => {
            const unlisten = this._renderer.listen(native, event, handler);
            this._removeEventListeners.push(unlisten);
        });

        // Special case for global document touch
        const unlisten = this._renderer.listen('document', 'touchstart', this._handleDocumentTouch);
        this._removeEventListeners.push(unlisten);
    }

    /**
     * Removes all previously bound event listeners from the target element and document.
     */
    private _clearTriggers(): void {
        this._removeEventListeners.forEach(fn => fn());
        this._removeEventListeners.length = 0;
    }
}
