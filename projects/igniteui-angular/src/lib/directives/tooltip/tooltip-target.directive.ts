import {
    Directive, OnInit, OnDestroy, Output, ElementRef, ViewContainerRef,
    Input, EventEmitter, booleanAttribute, TemplateRef, ComponentRef, Renderer2,
    EnvironmentInjector,
    createComponent,
    AfterViewInit,
    inject,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxNavigationService } from '../../core/navigation';
import { IBaseEventArgs } from '../../core/utils';
import { PositionSettings } from '../../services/public_api';
import { IgxToggleActionDirective } from '../toggle/toggle.directive';
import { IgxTooltipComponent } from './tooltip.component';
import { IgxTooltipDirective } from './tooltip.directive';
import { IgxTooltipCloseButtonComponent } from './tooltip-close-button.component';
import { parseTriggers, TooltipPositionSettings, TooltipPositionStrategy } from './tooltip.common';

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
export class IgxTooltipTargetDirective extends IgxToggleActionDirective implements OnInit, AfterViewInit, OnDestroy {
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
     * Controls whether to display an arrow indicator for the tooltip.
     * Set to true to show the arrow. Default value is `false`.
     *
     * ```typescript
     * // get
     * let isArrowDisabled = this.tooltip.hasArrow;
     * ```
     *
     * ```typescript
     * // set
     * this.tooltip.hasArrow = true;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-icon igxTooltipTarget [hasArrow]="true" [tooltip]="'Infragistics Inc. HQ'">info</igx-icon>
     * ```
     */
    @Input()
    public set hasArrow(value: boolean) {
        if (this.target && this.target.arrow) {
            this.target.arrow.style.display = value ? '' : 'none';
        }
        this._hasArrow = value;
    }

    public get hasArrow(): boolean {
        return this._hasArrow;
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
     * Get the position and animation settings used by the tooltip.
     * ```typescript
     * let positionSettings = this.tooltipTarget.positionSettings;
     * ```
     */
    @Input()
    public get positionSettings(): PositionSettings {
        return this._positionSettings;
    }

    /**
     * Set the position and animation settings used by the tooltip.
     * ```html
     * <igx-icon [igxTooltipTarget]="tooltipRef" [positionSettings]="newPositionSettings">info</igx-icon>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     * ```typescript
     *
     * import { PositionSettings, HorizontalAlignment, VerticalAlignment } from 'igniteui-angular';
     * ...
     * public newPositionSettings: PositionSettings = {
     *     horizontalDirection: HorizontalAlignment.Right,
     *     horizontalStartPoint: HorizontalAlignment.Left,
     *     verticalDirection: VerticalAlignment.Top,
     *     verticalStartPoint: VerticalAlignment.Top,
     * };
     * ```
     */
    public set positionSettings(settings: PositionSettings) {
        this._positionSettings = settings;
        if (this._overlayDefaults) {
            this._overlayDefaults.positionStrategy = new TooltipPositionStrategy(this._positionSettings);
        }
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
     * Which event triggers will show the tooltip.
     * Expects a comma-separated string of different event triggers.
     * Defaults to `pointerenter`.
     * ```html
     * <igx-icon [igxTooltipTarget]="tooltipRef" [showTriggers]="'click,focus'">info</igx-icon>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     */
    @Input()
    public get showTriggers(): string {
        return Array.from(this._showTriggers).join();
    }

    public set showTriggers(value: string) {
        this._showTriggers = parseTriggers(value);
        this.removeEventListeners();
        this.addEventListeners();
    }

    /**
     * Which event triggers will hide the tooltip.
     * Expects a comma-separated string of different event triggers.
     * Defaults to `pointerleave` and `click`.
     * ```html
     * <igx-icon [igxTooltipTarget]="tooltipRef" [hideTriggers]="'keypress,blur'">info</igx-icon>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     */
    @Input()
    public get hideTriggers(): string {
        return Array.from(this._hideTriggers).join();
    }

    public set hideTriggers(value: string) {
        this._hideTriggers = parseTriggers(value);
        this.removeEventListeners();
        this.addEventListeners();
    }

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
     * Specifies a plain text as tooltip content.
     * ```html
     * <igx-icon igxTooltipTarget [tooltip]="'Infragistics Inc. HQ'">info</igx-icon>
     * ```
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

    private _element = inject(ElementRef);
    private _navigationService = inject(IgxNavigationService, { optional: true });
    private _viewContainerRef = inject(ViewContainerRef);
    private _renderer = inject(Renderer2);
    private _envInjector = inject(EnvironmentInjector);

    private _destroy$ = new Subject<void>();
    private _autoHideDelay = 180;
    private _isForceClosed = false;
    private _hasArrow = false;
    private _closeButtonRef?: ComponentRef<IgxTooltipCloseButtonComponent>;
    private _closeTemplate: TemplateRef<any>;
    private _sticky = false;
    private _positionSettings: PositionSettings = TooltipPositionSettings;
    private _showTriggers = new Set(['pointerenter']);
    private _hideTriggers = new Set(['pointerleave', 'click']);

    private _abortController = new AbortController();

    /**
     * @hidden
     */
    public override onClick() {
        if (
            this.target.timeoutId &&
            this.target.collapsed &&
            !this._showTriggers.has('click')
        ) {
            clearTimeout(this.target.timeoutId);
            this.target.timeoutId = null;
        }
    }

    /**
     * @hidden
     */
    public onShow(): void {
        this._checksBeforeShowing(() => this._showOnInteraction());
    }

    /**
     * @hidden
     */
    public onHide() : void {
        if (this.tooltipDisabled || this.target.collapsed) {
            return;
        }

        this._checkOutletAndOutsideClick();
        this._hideOnInteraction();
    }

    /**
     * @hidden
     */
    public override ngOnInit() {
        super.ngOnInit();

        this._overlayDefaults.positionStrategy = new TooltipPositionStrategy(this._positionSettings);
        this._overlayDefaults.closeOnOutsideClick = false;
        this._overlayDefaults.closeOnEscape = true;

        this.target.closing.pipe(takeUntil(this._destroy$)).subscribe((event) => {
            if (this.target.tooltipTarget !== this) {
                return;
            }

            const hidingArgs = { target: this, tooltip: this.target, cancel: false };
            this.tooltipHide.emit(hidingArgs);

            if (hidingArgs.cancel) {
                event.cancel = true;
            }
        });

        this.removeEventListeners();
        this.addEventListeners();
    }

    /**
     * @hidden
     */
    public ngAfterViewInit(): void {
        if (this.target && this.target.arrow) {
            this.target.arrow.style.display = this.hasArrow ? '' : 'none';
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.hideTooltip();
        this.removeEventListeners();
        this._destroyCloseButton();
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
        this._checksBeforeShowing(() => this._showTooltip(false, true));
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

    private addEventListeners(): void {
        const options = { passive: true, signal: this._abortController.signal };

        this.onShow = this.onShow.bind(this);
        for (const each of this._showTriggers) {
            this.nativeElement.addEventListener(each, this.onShow, options);
        }
        this.onHide = this.onHide.bind(this);
        for (const each of this._hideTriggers) {
            this.nativeElement.addEventListener(each, this.onHide, options);
        }
    }

    private removeEventListeners(): void {
      this._abortController.abort();
      this._abortController = new AbortController();
    }

    private _checkOutletAndOutsideClick(): void {
        if (this.outlet) {
            this._overlayDefaults.outlet = this.outlet;
        }
    }

    /**
     * A guard method that performs precondition checks before showing the tooltip.
     * It ensures that the tooltip is not disabled and not already shown in sticky mode.
     * If all conditions pass, it executes the provided `action` callback.
     */
    private _checksBeforeShowing(action: () => void): void {
        if (this.tooltipDisabled) return;
        if (!this.target.collapsed && this.target?.tooltipTarget?.sticky) return;

        this._checkOutletAndOutsideClick();
        this._checkTooltipForMultipleTargets();
        action();
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

        this._evaluateStickyState();

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
     */
    private _checkTooltipForMultipleTargets(): void {
        if (!this.target.tooltipTarget) {
            this.hasArrow = this._hasArrow;
            this.target.tooltipTarget = this;
        }
        if (this.target.tooltipTarget !== this) {
            this.hasArrow = this._hasArrow;
            if (this.target.tooltipTarget.sticky) {
                this.target.tooltipTarget._removeCloseButtonFromTooltip();
            }

            // If the tooltip is shown for one target and the user interacts with another target,
            // the tooltip is instantly hidden for the first target.
            clearTimeout(this.target.timeoutId);
            this.target.forceClose(this._mergedOverlaySettings);

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
}
