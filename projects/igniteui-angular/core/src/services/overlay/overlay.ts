import { AnimationReferenceMetadata } from '@angular/animations';
import { ApplicationRef, ComponentRef, createComponent, ElementRef, EventEmitter, Injectable, Injector, NgZone, OnDestroy, Type, ViewContainerRef, DOCUMENT, inject } from '@angular/core';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { fadeIn, fadeOut, IAnimationParams, scaleInHorLeft, scaleInHorRight, scaleInVerBottom, scaleInVerTop, scaleOutHorLeft, scaleOutHorRight, scaleOutVerBottom, scaleOutVerTop, slideInBottom, slideInTop, slideOutBottom, slideOutTop } from 'igniteui-angular/animations';
import { PlatformUtil } from '../../core/utils';
import { IgxOverlayOutletDirective } from './utilities';
import { IgxAngularAnimationService } from '../animation/angular-animation-service';
import { AnimationPlayer, AnimationService } from '../animation/animation';
import { AutoPositionStrategy } from './position/auto-position-strategy';
import { BaseFitPositionStrategy } from './position/base-fit-position-strategy';
import { ConnectedPositioningStrategy } from './position/connected-positioning-strategy';
import { ContainerPositionStrategy } from './position/container-position-strategy';
import { ElasticPositionStrategy } from './position/elastic-position-strategy';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import { IPositionStrategy } from './position/IPositionStrategy';
import { NoOpScrollStrategy } from './scroll/NoOpScrollStrategy';
import { HideScrollStrategy } from './scroll/hide-scroll-strategy';
import { AnchorVisibleKeyword, anchorVisibleKeyword, IGX_OVERLAY_ANCHORING, supportsNativeAnchoring } from './anchoring/anchoring';
import { acquireAnchorName, addAnchorName, removeAnchorName } from './anchoring/anchor-names';
import {
    connectedDeclarations,
    containerDeclarations,
    flipAnimation,
    isExpressible,
    NATIVE_CONTENT_PROPS,
    NATIVE_WRAPPER_PROPS,
    NativeDeclarations,
    OverlayEngine,
    resolveFlippedAxes,
    SCRIPT_CONTENT_PROPS,
    SCRIPT_WRAPPER_PROPS
} from './anchoring/native-engine';
import {
    AbsolutePosition,
    HorizontalAlignment,
    OffsetMode,
    OverlayAnimationEventArgs,
    OverlayCancelableEventArgs,
    OverlayClosingEventArgs,
    OverlayCreateSettings,
    OverlayEventArgs,
    OverlayInfo,
    OverlaySettings,
    Point,
    PositionSettings,
    RelativePosition,
    RelativePositionStrategy,
    VerticalAlignment
} from './utilities';

/**
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay-main)
 * The overlay service allows users to show components on overlay div above all other elements in the page.
 */
@Injectable({ providedIn: 'root' })
export class IgxOverlayService implements OnDestroy {
    private _appRef = inject(ApplicationRef);
    private document = inject(DOCUMENT);
    private _zone = inject(NgZone);
    protected platformUtil = inject(PlatformUtil);
    private animationService = inject<AnimationService>(IgxAngularAnimationService);
    private _anchoringMode = inject(IGX_OVERLAY_ANCHORING, { optional: true }) ?? 'auto';
    private _nativeSupported?: boolean;
    private _anchorVisible?: AnchorVisibleKeyword | null;

    /**
     * Emitted just before the overlay content starts to open.
     * ```typescript
     * opening(event: OverlayCancelableEventArgs){
     *     const opening = event;
     * }
     * ```
     */
    public opening = new EventEmitter<OverlayCancelableEventArgs>();

    /**
     * Emitted after the overlay content is opened and all animations are finished.
     * ```typescript
     * opened(event: OverlayEventArgs){
     *     const opened = event;
     * }
     * ```
     */
    public opened = new EventEmitter<OverlayEventArgs>();

    /**
     * Emitted just before the overlay content starts to close.
     * ```typescript
     * closing(event: OverlayCancelableEventArgs){
     *     const closing = event;
     * }
     * ```
     */
    public closing = new EventEmitter<OverlayClosingEventArgs>();

    /**
     * Emitted after the overlay content is closed and all animations are finished.
     * ```typescript
     * closed(event: OverlayEventArgs){
     *     const closed = event;
     * }
     * ```
     */
    public closed = new EventEmitter<OverlayEventArgs>();

    /**
     * Emitted before the content is appended to the overlay.
     * ```typescript
     * contentAppending(event: OverlayEventArgs){
     *     const contentAppending = event;
     * }
     * ```
     */
    public contentAppending = new EventEmitter<OverlayEventArgs>();

    /**
     * Emitted after the content is appended to the overlay, and before animations are started.
     * ```typescript
     * contentAppended(event: OverlayEventArgs){
     *     const contentAppended = event;
     * }
     * ```
     */
    public contentAppended = new EventEmitter<OverlayEventArgs>();

    /**
     * Emitted just before the overlay animation start.
     * ```typescript
     * animationStarting(event: OverlayAnimationEventArgs){
     *     const animationStarting = event;
     * }
     * ```
     */
    public animationStarting = new EventEmitter<OverlayAnimationEventArgs>();

    private _componentId = 0;
    private _overlayInfos: OverlayInfo[] = [];
    private _document: Document;
    private _keyPressEventListener!: Subscription;
    private destroy$ = new Subject<boolean>();
    /** The `animationEnd` subscription of each player, so a replaced player can be released. */
    private _playerSubscriptions = new WeakMap<AnimationPlayer, Subscription>();
    private _cursorStyleIsSet = false;
    private _cursorOriginalValue!: string;

    private _defaultSettings: OverlaySettings = {
        excludeFromOutsideClick: [],
        positionStrategy: new GlobalPositionStrategy(),
        scrollStrategy: new NoOpScrollStrategy(),
        modal: true,
        closeOnOutsideClick: true,
        closeOnEscape: false
    };

    constructor() {
        this._document = this.document;
    }

    /**
     * Creates overlay settings with global or container position strategy and preset position settings.
     *
     * @param position Preset position settings. Default position is `center`.
     * @param useContainerStrategy When `true`, uses `ContainerPositionStrategy` which positions the overlay
     * relative to its nearest positioned ancestor container. When `false` or omitted, uses `GlobalPositionStrategy`
     * which positions the overlay relative to the viewport.
     * @returns Non-modal overlay settings based on `GlobalPositionStrategy` or `ContainerPositionStrategy`
     * depending on the value of `useContainerStrategy`.
     */
    public static createAbsoluteOverlaySettings(
        position?: AbsolutePosition, useContainerStrategy?: boolean): OverlaySettings;
    /**
     * @param position Preset position settings. Default position is 'center'
     * @param outlet The outlet container to attach the overlay to
     * @returns Non-modal overlay settings based on Global or Container position strategy and the provided position.
    *
     * @deprecated in version 21.2.0. The outlet parameter is deprecated. Please provide the container or outlet element through the
     * `createAbsoluteOverlaySettings` method when calling `attach` method.
     * Creates overlay settings with global or container position strategy and preset position settings
     */
    public static createAbsoluteOverlaySettings(
        position?: AbsolutePosition, outlet?: IgxOverlayOutletDirective | ElementRef): OverlaySettings;
    public static createAbsoluteOverlaySettings(
        position?: AbsolutePosition, containerOrOutlet?: IgxOverlayOutletDirective | ElementRef | boolean): OverlaySettings {
        const positionSettings = this.createAbsolutePositionSettings(position);
        const strategy = containerOrOutlet ? new ContainerPositionStrategy(positionSettings) : new GlobalPositionStrategy(positionSettings);
        const outlet = containerOrOutlet instanceof ElementRef || containerOrOutlet instanceof IgxOverlayOutletDirective ? containerOrOutlet : null;
        const overlaySettings: OverlaySettings = {
            positionStrategy: strategy,
            scrollStrategy: new NoOpScrollStrategy(),
            modal: false,
            closeOnOutsideClick: true,
            outlet: outlet!
        };
        return overlaySettings;
    }

    /**
     * Creates overlay settings with auto, connected or elastic position strategy and preset position settings
     *
     * @param target Attaching target for the component to show
     * @param strategy The relative position strategy to be applied to the overlay settings. Default is Auto positioning strategy.
     * @param position Preset position settings. By default the element is positioned below the target, left aligned.
     * @returns Non-modal overlay settings based on the provided target, strategy and position.
     */
    public static createRelativeOverlaySettings(
        target: Point | HTMLElement,
        position?: RelativePosition,
        strategy?: RelativePositionStrategy):
        OverlaySettings {
        const positionSettings = this.createRelativePositionSettings(position);
        const overlaySettings: OverlaySettings = {
            target,
            positionStrategy: this.createPositionStrategy(strategy, positionSettings),
            scrollStrategy: new NoOpScrollStrategy(),
            modal: false,
            closeOnOutsideClick: true
        };
        return overlaySettings;
    }

    private static createAbsolutePositionSettings(position?: AbsolutePosition): PositionSettings {
        let positionSettings: PositionSettings;
        switch (position) {
            case AbsolutePosition.Bottom:
                positionSettings = {
                    horizontalDirection: HorizontalAlignment.Center,
                    verticalDirection: VerticalAlignment.Bottom,
                    openAnimation: slideInBottom,
                    closeAnimation: slideOutBottom
                };
                break;
            case AbsolutePosition.Top:
                positionSettings = {
                    horizontalDirection: HorizontalAlignment.Center,
                    verticalDirection: VerticalAlignment.Top,
                    openAnimation: slideInTop,
                    closeAnimation: slideOutTop
                };
                break;
            case AbsolutePosition.Center:
            default:
                positionSettings = {
                    horizontalDirection: HorizontalAlignment.Center,
                    verticalDirection: VerticalAlignment.Middle,
                    openAnimation: fadeIn,
                    closeAnimation: fadeOut
                };
        }
        return positionSettings;
    }

    private static createRelativePositionSettings(position?: RelativePosition): PositionSettings {
        let positionSettings: PositionSettings;
        switch (position) {
            case RelativePosition.Above:
                positionSettings = {
                    horizontalStartPoint: HorizontalAlignment.Center,
                    verticalStartPoint: VerticalAlignment.Top,
                    horizontalDirection: HorizontalAlignment.Center,
                    verticalDirection: VerticalAlignment.Top,
                    openAnimation: scaleInVerBottom,
                    closeAnimation: scaleOutVerBottom,
                };
                break;
            case RelativePosition.Below:
                positionSettings = {
                    horizontalStartPoint: HorizontalAlignment.Center,
                    verticalStartPoint: VerticalAlignment.Bottom,
                    horizontalDirection: HorizontalAlignment.Center,
                    verticalDirection: VerticalAlignment.Bottom,
                    openAnimation: scaleInVerTop,
                    closeAnimation: scaleOutVerTop
                };
                break;
            case RelativePosition.After:
                positionSettings = {
                    horizontalStartPoint: HorizontalAlignment.Right,
                    verticalStartPoint: VerticalAlignment.Middle,
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Middle,
                    openAnimation: scaleInHorLeft,
                    closeAnimation: scaleOutHorLeft
                };
                break;
            case RelativePosition.Before:
                positionSettings = {
                    horizontalStartPoint: HorizontalAlignment.Left,
                    verticalStartPoint: VerticalAlignment.Middle,
                    horizontalDirection: HorizontalAlignment.Left,
                    verticalDirection: VerticalAlignment.Middle,
                    openAnimation: scaleInHorRight,
                    closeAnimation: scaleOutHorRight
                };
                break;
            case RelativePosition.Default:
            default:
                positionSettings = {
                    horizontalStartPoint: HorizontalAlignment.Left,
                    verticalStartPoint: VerticalAlignment.Bottom,
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Bottom,
                    openAnimation: scaleInVerTop,
                    closeAnimation: scaleOutVerTop,
                };
                break;
        }
        return positionSettings;
    }

    private static createPositionStrategy(strategy?: RelativePositionStrategy, positionSettings?: PositionSettings): IPositionStrategy {
        switch (strategy) {
            case RelativePositionStrategy.Connected:
                return new ConnectedPositioningStrategy(positionSettings);
            case RelativePositionStrategy.Elastic:
                return new ElasticPositionStrategy(positionSettings);
            case RelativePositionStrategy.Auto:
            default:
                return new AutoPositionStrategy(positionSettings);
        }
    }

    /**
     * Generates Id. Provide this Id when call `show(id)` method
     *
     * @param component ElementRef to show in overlay
     * @param settings (optional): Display settings for the overlay, such as positioning and scroll/close behavior.
     * @returns Id of the created overlay. Valid until `detach` is called.
     */
    public attach(element: ElementRef, settings?: OverlaySettings): string;
    /**
     * Generates Id. Provide this Id when call `show(id)` method
     *
     * @note The component is created in the root scope and the overlay is attached to the document body.
     * Prefer the `viewContainerRef` overload when a local injection context is needed.
     *
     * @param component Component Type to show in overlay
     * @param settings (optional): Create settings for the overlay, such as positioning and scroll/close behavior.
     * Includes also an optional `Injector` to add to the created dynamic component's injectors.
     * @returns Id of the created overlay. Valid until `detach` is called.
     */
    public attach(component: Type<any>, settings?: OverlayCreateSettings): string;
    // TODO: change third parameter to OverlayCreateSettings and allow passing of Injector and so on.
    /**
     * Generates an Id. Provide this Id when calling the `show(id)` method
     *
     * @param component Component Type to show in overlay
     * @param viewContainerRef Reference to the container where created component's host view will be inserted
     * @param settings (optional): Display settings for the overlay, such as positioning and scroll/close behavior.
     */
    public attach(component: Type<any>, viewContainerRef: ViewContainerRef, settings?: OverlaySettings): string;
    public attach(
        componentOrElement: ElementRef | Type<any>,
        viewContainerRefOrSettings?: ViewContainerRef | OverlayCreateSettings,
        settings?: OverlaySettings): string {
        const info: OverlayInfo | null = this.getOverlayInfo(componentOrElement, viewContainerRefOrSettings, settings);

        if (!info) {
            console.warn('Overlay was not able to attach provided component!');
            return null!;
        }

        info.id = (this._componentId++).toString();
        info.visible = false;
        // Emit the contentAppending event before appending the content
        const eventArgs = { id: info.id, elementRef: info.elementRef, componentRef: info.componentRef, settings: info.settings };
        this.contentAppending.emit(eventArgs);
        // Append the content to the overlay
        info.settings = eventArgs.settings!;
        this._overlayInfos.push(info);
        const elementRect = info.elementRef!.nativeElement.getBoundingClientRect();
        info.initialSize = { width: elementRect.width, height: elementRect.height };
        // Get the size before moving the container into the overlay so that it does not forget about inherited styles.
        this.getComponentSize(info);
        info.wrapperElement = this.getWrapperElement();
        const contentElement = this.getContentElement(info.wrapperElement, info.settings.modal!);

        this.insertWrapper(info);
        contentElement.appendChild(info.elementRef!.nativeElement);

        // Update the container size after wrapping/moving if there is size.
        if (info.size) {
            info.elementRef!.nativeElement.parentElement.style.setProperty('--ig-size', info.size);
        }
        this.contentAppended.emit({ id: info.id, componentRef: info.componentRef });
        info.settings.scrollStrategy!.initialize(this._document, this, info.id);
        info.settings.scrollStrategy!.attach();
        this.addOutsideClickListener(info);
        this.addResizeHandler();
        this.addCloseOnEscapeListener(info);
        this.buildAnimationPlayers(info);
        return info.id;
    }

    /**
     * Remove overlay with the provided id.
     *
     * @param id Id of the overlay to remove
     * ```typescript
     * this.overlay.detach(id);
     * ```
     */
    public detach(id: string) {
        const info: OverlayInfo = this.getOverlayById(id);

        if (!info) {
            console.warn('igxOverlay.detach was called with wrong id: ', id);
            return;
        }
        info.detached = true;
        this.finishAnimations(info);
        info.settings!.scrollStrategy!.detach();
        this.releaseAnchor(info);
        // Dispose position strategy if it has a dispose method
        if (typeof (info.settings!.positionStrategy as any).dispose === 'function') {
            (info.settings!.positionStrategy as any).dispose();
        }
        this.removeOutsideClickListener(info);
        this.removeResizeHandler();
        this.cleanUp(info);
    }

    /**
     * Remove all the overlays.
     * ```typescript
     * this.overlay.detachAll();
     * ```
     */
    public detachAll() {
        for (let i = this._overlayInfos.length; i--;) {
            this.detach(this._overlayInfos[i].id!);
        }
    }

    /**
     * Shows the overlay for provided id.
     *
     * @param id Id to show overlay for
     * @param settings Display settings for the overlay, such as positioning and scroll/close behavior.
     */
    public show(id: string, settings?: OverlaySettings): void {
        const info: OverlayInfo = this.getOverlayById(id);
        if (!info) {
            console.warn('igxOverlay.show was called with wrong id: ', id);
            return;
        }
        const eventArgs: OverlayCancelableEventArgs = { id, componentRef: info.componentRef, cancel: false };
        this.opening.emit(eventArgs);
        if (eventArgs.cancel) {
            return;
        }
        if (settings) {
            const newScrollStrategy = settings.scrollStrategy && info.settings!.scrollStrategy !== settings.scrollStrategy;
            if (newScrollStrategy && info.settings!.scrollStrategy) {
                info.settings!.scrollStrategy.detach();
            }

            settings.positionStrategy ??= info.settings!.positionStrategy;
            settings.scrollStrategy ??= info.settings!.scrollStrategy;
            info.settings = { ...info.settings, ...settings };

            if (newScrollStrategy) {
                info.settings.scrollStrategy!.initialize(this._document, this, info.id!);
                info.settings.scrollStrategy!.attach();
            }
        }
        this.updateSize(info);
        // Show the overlay using Popover API BEFORE positioning
        // This ensures the element is in the top layer when position calculations happen
        if (info.wrapperElement?.isConnected && typeof info.wrapperElement.showPopover === 'function') {
            try {
                info.wrapperElement.showPopover();
            } catch (_) {
                // Popover API call failed, element may already be showing
            }
        }
        const strategy = info.settings!.positionStrategy!;
        const contentElement: HTMLElement = info.elementRef!.nativeElement.parentElement;
        const engine = this.resolveEngine(info);
        if (info.engine && info.engine !== engine) {
            this.switchEngine(info);
        }
        info.engine = engine;
        if (engine === 'script') {
            strategy.position(
                contentElement,
                { width: info.initialSize!.width, height: info.initialSize!.height },
                this._document,
                true,
                info.settings!.target);
        } else {
            this.applyNative(info);
            if (engine === 'native-container') {
                (strategy as ContainerPositionStrategy).applyLayout(contentElement);
            }
        }
        if (engine === 'native-connected' && strategy.constructor === AutoPositionStrategy) {
            this.resolveFlips(info);
        } else {
            delete info.flippedAxes;
        }
        this.updateAnimationPlayers(info);
        this.trackHide(info, contentElement, true);
        this.addModalClasses(info);
        if (this.getOpenAnimation(info)) {
            // TODO: should we build players again. This was already done in attach!!!
            // this.buildAnimationPlayers(info);
            this.playOpenAnimation(info);
        } else {
            //  to eliminate flickering show the element just before opened fires
            info.wrapperElement!.style.visibility = '';
            info.visible = true;
            this.opened.emit({ id: info.id!, componentRef: info.componentRef });
        }
    }

    /**
     * Hides the component with the ID provided as a parameter.
     * ```typescript
     * this.overlay.hide(id);
     * ```
     */
    public hide(id: string, event?: Event) {
        this._hide(id, event);
    }

    /**
     * Hides all the components and the overlay.
     * ```typescript
     * this.overlay.hideAll();
     * ```
     */
    public hideAll() {
        for (let i = this._overlayInfos.length; i--;) {
            this.hide(this._overlayInfos[i].id!);
        }
    }

    /**
     * Repositions the component with ID provided as a parameter.
     *
     * @param id Id to reposition overlay for
     * ```typescript
     * this.overlay.reposition(id);
     * ```
     */
    public reposition(id: string) {
        const overlayInfo = this.getOverlayById(id);
        if (!overlayInfo || !overlayInfo.settings) {
            console.warn('Wrong id provided in overlay.reposition method. Id: ', id);
            return;
        }
        if (!overlayInfo.visible) {
            return;
        }
        const contentElement = overlayInfo.elementRef!.nativeElement.parentElement;
        if (overlayInfo.engine && overlayInfo.engine !== 'script') {
            if (this.resolveEngine(overlayInfo) === overlayInfo.engine) {
                // The browser keeps native overlays in place. Only settings changes need a write.
                // DISCUSS(#17765): native content follows a scroll at the next rendering frame, while the script
                // engine moved it synchronously in the scroll handler. Code that scrolls and measures in the same
                // task sees the old position (the toggle #3636 spec needed a frame wait). Not in plan §17 yet.
                this.applyNative(overlayInfo);
                if (overlayInfo.engine === 'native-container') {
                    (overlayInfo.settings.positionStrategy as ContainerPositionStrategy).applyLayout(contentElement);
                }
                this.trackHide(overlayInfo, contentElement);
                return;
            }
            // The current settings no longer fit this engine (e.g. a pair position-area cannot express):
            // position by script until the next show() picks the engine again.
            this.switchEngine(overlayInfo);
            overlayInfo.engine = 'script';
            this.updateAnimationPlayers(overlayInfo);
        }
        this.trackHide(overlayInfo, contentElement);
        const contentElementRect = contentElement.getBoundingClientRect();
        overlayInfo.settings.positionStrategy!.position(
            contentElement,
            {
                width: contentElementRect.width,
                height: contentElementRect.height
            },
            this._document,
            false,
            overlayInfo.settings.target);
    }

    /**
     * Offsets the content along the corresponding axis by the provided amount with optional offsetMode that determines whether to add (by default) or set the offset values
     *
     * @param id Id to offset overlay for
     * @param deltaX Amount of offset in horizontal direction
     * @param deltaY Amount of offset in vertical direction
     * @param offsetMode Determines whether to add (by default) or set the offset values with OffsetMode.Add and OffsetMode.Set
     * ```typescript
     * this.overlay.setOffset(id, deltaX, deltaY, offsetMode);
     * ```
     */
    public setOffset(id: string, deltaX: number, deltaY: number, offsetMode?: OffsetMode) {
        const info: OverlayInfo = this.getOverlayById(id);

        if (!info) {
            return;
        }

        switch (offsetMode) {
            case OffsetMode.Set:
                info.transformX = deltaX;
                info.transformY = deltaY;
                break;
            case OffsetMode.Add:
            default:
                info.transformX! += deltaX;
                info.transformY! += deltaY;
                break;
        }

        const transformX = info.transformX;
        const transformY = info.transformY;

        const translate = `translate(${transformX}px, ${transformY}px)`;
        info.elementRef!.nativeElement.parentElement.style.transform = translate;
    }

    /** @hidden */
    public repositionAll = () => {
        for (let i = this._overlayInfos.length; i--;) {
            this.reposition(this._overlayInfos[i].id!);
        }
    };

    /** @hidden */
    public ngOnDestroy(): void {
        this.detachAll();
        this.removeCloseOnEscapeListener();
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /** @hidden @internal */
    public getOverlayById(id: string | undefined): OverlayInfo {
        if (!id) {
            return null!;
        }
        const info = this._overlayInfos.find(e => e.id === id);
        return info!;
    }

    private _hide(id: string, event?: Event) {
        const info: OverlayInfo = this.getOverlayById(id);
        if (!info) {
            console.warn('igxOverlay.hide was called with wrong id: ', id);
            return;
        }
        const eventArgs: OverlayClosingEventArgs = { id, componentRef: info.componentRef, cancel: false, event };
        this.closing.emit(eventArgs);
        if (eventArgs.cancel) {
            return;
        }
        if (info.engine === 'native-connected' &&
            info.settings!.positionStrategy!.constructor === AutoPositionStrategy &&
            info.visible &&
            !info.openAnimationPlayer?.hasStarted()) {
            // The browser may have flipped the content since show(); close from the side it is on now.
            this.resolveFlips(info);
            if (this.getCloseAnimation(info) !== info.builtCloseAnimation && !info.closeAnimationPlayer?.hasStarted()) {
                this.buildCloseAnimationPlayer(info);
            }
        }
        this.removeModalClasses(info);
        if (this.getCloseAnimation(info)) {
            this.playCloseAnimation(info, event);
        } else {
            this.closeDone(info);
        }
    }

    /**
     * Creates overlayInfo. Sets the info's `elementRef`, `componentRef`and `settings`. Also
     * initialize info's `ngZone`, `transformX` and `transformY`.
     * @param component ElementRef or Type. If type is provided dynamic component will be created
     * @param viewContainerRefOrSettings (optional): If ElementRef is provided for `component` this
     * parameter is OverlaySettings. Otherwise it could be ViewContainerRef or OverlayCreateSettings and will be
     * used when dynamic component is created.
     * @param settings (optional): OverlaySettings when `ViewContainerRef` is provided.
     * @returns OverlayInfo
     */
    private getOverlayInfo(
        component: ElementRef | Type<any>,
        viewContainerRefOrSettings?: ViewContainerRef | OverlayCreateSettings,
        settings?: OverlaySettings): OverlayInfo | null {
        const info: OverlayInfo = { ngZone: this._zone, transformX: 0, transformY: 0 };
        let overlaySettings = settings;
        if (component instanceof ElementRef) {
            info.elementRef = component;
            overlaySettings = viewContainerRefOrSettings as OverlaySettings;
        } else {
            let dynamicComponent: ComponentRef<any>;
            if (viewContainerRefOrSettings instanceof ViewContainerRef) {
                const viewContainerRef = viewContainerRefOrSettings as ViewContainerRef;
                dynamicComponent = viewContainerRef.createComponent(component);
            } else {
                const environmentInjector = this._appRef.injector;
                const createSettings = viewContainerRefOrSettings as OverlayCreateSettings | undefined;
                let elementInjector: Injector | undefined;
                if (createSettings) {
                    ({ injector: elementInjector, ...overlaySettings } = createSettings);
                }
                dynamicComponent = createComponent(component, { environmentInjector, elementInjector });
                this._appRef.attachView(dynamicComponent.hostView);
            }
            if (dynamicComponent.onDestroy) {
                dynamicComponent.onDestroy(() => {
                    if (!info.detached && this._overlayInfos.indexOf(info) !== -1) {
                        this.detach(info.id!);
                    }
                })
            }

            // If the element is newly created from a Component, it is wrapped in 'ng-component' tag - we do not want that.
            const element = dynamicComponent.location.nativeElement;
            info.elementRef = { nativeElement: element };
            info.componentRef = dynamicComponent;
        }
        info.settings = Object.assign({}, this._defaultSettings, overlaySettings);
        return info;
    }

    private placeElementHook(element: HTMLElement): HTMLElement {
        if (!element.parentElement) {
            return null!;
        }
        const hook = this._document.createElement('div');
        hook.style.display = 'none';
        element.parentElement.insertBefore(hook, element);
        return hook;
    }

    /**
     * Determines the correct placement strategy for the overlay wrapper and inserts it into the DOM.
     * Places a hook to mark the element's original DOM position whenever a parent exists.
     * The absence of a hook indicates the element had no parent and was appended to the body.
     */
    private insertWrapper(info: OverlayInfo) {
        const element = info.elementRef!.nativeElement;
        if (element.parentElement) {
            info.hook = this.placeElementHook(element);
        }

        // TODO: This check for ContainerPositionStrategy is temporary and should be removed once a proper long-term
        // solution for container-based positioning is in place.
        if (info.settings!.positionStrategy instanceof ContainerPositionStrategy) {
            this.insertWrapperInContainer(info);
        } else {
            this.appendWrapperTo(info, this.getWrapperParent(info));
        }
    }

    /** Resolves the DOM node that should host the wrapper element. */
    private getWrapperParent(info: OverlayInfo): HTMLElement {
        if (info.settings!.outlet) {
            return info.settings!.outlet.nativeElement || info.settings!.outlet;
        }
        return info.hook?.parentElement || this._document.body;
    }

    /**
     * Appends the wrapper to the given parent. When a hook exists and lives under the same
     * parent, the wrapper is inserted right before the original element to preserve DOM order.
     */
    private appendWrapperTo(info: OverlayInfo, parent: HTMLElement) {
        const ref = info.hook?.parentElement === parent ? info.elementRef!.nativeElement : null;
        parent.insertBefore(info.wrapperElement!, ref);
    }

    /**
     * Creates an absolutely-positioned container div around the wrapper for ContainerPositionStrategy.
     */
    private insertWrapperInContainer(info: OverlayInfo) {
        const parent = info.settings!.outlet?.nativeElement ||
                       info.settings!.outlet ||
                       info.hook?.parentElement ||
                       this._document.body;

        // TODO: container styles could be moved to CSS class
        const container = this._document.createElement('div');
        container.style.position = 'absolute';
        container.style.inset = '0';
        container.style.pointerEvents = 'none';
        container.appendChild(info.wrapperElement!);
        parent.appendChild(container);
        info.containerElement = container;
    }

    private getWrapperElement(): HTMLElement {
        const wrapper: HTMLElement = this._document.createElement('div');
        wrapper.classList.add('igx-overlay__wrapper');
        // Use Popover API to place element in top layer, eliminating need for z-index
        wrapper.setAttribute('popover', 'manual');
        return wrapper;
    }

    private getContentElement(wrapperElement: HTMLElement, modal: boolean): HTMLElement {
        const content: HTMLElement = this._document.createElement('div');
        if (modal) {
            content.classList.add('igx-overlay__content--modal');
            content.addEventListener('click', (ev: Event) => {
                ev.stopPropagation();
            });
        } else {
            content.classList.add('igx-overlay__content');
        }
        content.addEventListener('scroll', (ev: Event) => {
            ev.stopPropagation();
        });

        //  hide element to eliminate flickering. Show the element exactly before animation starts
        wrapperElement.style.visibility = 'hidden';
        wrapperElement.appendChild(content);
        return content;
    }

    private updateSize(info: OverlayInfo) {
        if (info.componentRef) {
            //  if we are positioning component this is first time it gets visible
            //  and we can finally get its size
            info.componentRef.changeDetectorRef.detectChanges();
            info.initialSize = info.elementRef!.nativeElement.getBoundingClientRect();
        }

        // set content div width only if element to show has width
        if (info.initialSize!.width !== 0) {
            info.elementRef!.nativeElement.parentElement.style.width = info.initialSize!.width + 'px';
        }
    }

    private closeDone(info: OverlayInfo) {
        info.visible = false;
        if (info.wrapperElement) {
            // to eliminate flickering show the element just before animation start
            info.wrapperElement.style.visibility = 'hidden';
            // Hide from popover top layer if element is connected, showing, and API is available
            if (info.wrapperElement.isConnected &&
                typeof info.wrapperElement.hidePopover === 'function' &&
                info.wrapperElement.matches(':popover-open')) {
                try {
                    info.wrapperElement.hidePopover();
                } catch (_) {
                    // Hide failed, element may not be in popover state
                }
            }
        }
        // A closed overlay leaves nothing on its target.
        this.releaseAnchor(info);
        const scrollStrategy = info.settings?.scrollStrategy;
        if (scrollStrategy instanceof HideScrollStrategy) {
            scrollStrategy._onHidden();
        }
        if (!info.closeAnimationDetaching) {
            this.closed.emit({ id: info.id!, componentRef: info.componentRef, event: info.event });
        }
        delete info.event;
    }

    private cleanUp(info: OverlayInfo) {
        this.hideDynamicComponent(info);
        this.removeWrapper(info);
        this.restoreHook(info);
        this.destroyComponent(info);
        this.unregisterOverlay(info);
        this.releaseResources(info);
    }

    /**
     * Hides a dynamically created component before unwrapping it, as Angular may remove its host after `destroyComponent`.
     */
    private hideDynamicComponent(info: OverlayInfo) {
        if (info.componentRef) {
            info.elementRef!.nativeElement.style.display = 'none';
        }
    }

    /**
     * Reverses the wrapper insertion performed by `insertWrapper`, restoring the element to its original DOM position.
     */
    private removeWrapper(info: OverlayInfo) {
        const child: HTMLElement = info.elementRef!.nativeElement;
        if (!info.hook) {
            // No hook means element had no parent and was appended to body.
            // Just remove the wrapper; the dynamic component will be destroyed in cleanUp.
            info.wrapperElement?.parentElement?.removeChild(info.wrapperElement);
        } else if (info.settings!.positionStrategy instanceof ContainerPositionStrategy) {
            // Unwrap from container: move element back, then remove both wrapper and container div
            const container = info.wrapperElement?.parentElement;
            if (container) {
                container.insertBefore(child, info.wrapperElement!);
                container.removeChild(info.wrapperElement!);
                container.remove();
            }
        } else if (info.settings!.outlet) {
            const outlet = info.settings!.outlet?.nativeElement || info.settings!.outlet;
            // if same element is shown in other overlay outlet will not contain
            // the element and we should not remove it from outlet
            if (outlet.contains(child)) {
                outlet.removeChild(child.parentNode!.parentNode);
            }
        } else {
            // Unwrap in-place: move element back to wrapper's position, then remove wrapper
            if (info.wrapperElement?.parentElement) {
                info.wrapperElement.parentElement.insertBefore(child, info.wrapperElement);
                info.wrapperElement.parentElement.removeChild(info.wrapperElement);
            }
        }
    }

    /**
     * Restores the element to its original position via the hook, then removes the hook. Must run
     * before `destroyComponent`.
     */
    private restoreHook(info: OverlayInfo) {
        if (info.hook) {
            info.hook.parentElement!.insertBefore(info.elementRef!.nativeElement, info.hook);
            info.hook.parentElement!.removeChild(info.hook);
            delete info.hook;
        }
    }

    /**
     * Destroys the dynamically created component, if any.
     */
    private destroyComponent(info: OverlayInfo) {
        if (info.componentRef) {
            this._appRef.detachView(info.componentRef.hostView);
            if (!info.componentRef.hostView.destroyed) {
                info.componentRef.destroy();
            }
            delete info.componentRef;
        }
    }

    /**
     * Removes the overlay from the tracked list and cleans up global listeners when none remain.
     */
    private unregisterOverlay(info: OverlayInfo) {
        const index = this._overlayInfos.indexOf(info);
        this._overlayInfos.splice(index, 1);

        if (this._overlayInfos.length === 0) {
            this.removeCloseOnEscapeListener();
        }
    }

    /** Releases all resources attached to the overlay info. */
    private releaseResources(info: OverlayInfo) {
        delete info.elementRef;
        delete info.settings;
        delete info.initialSize;
        info.openAnimationDetaching = true;
        info.openAnimationPlayer?.destroy();
        delete info.openAnimationPlayer;
        info.closeAnimationDetaching = true;
        info.closeAnimationPlayer?.destroy();
        delete info.closeAnimationPlayer;
        delete (info as any).ngZone;
        delete info.wrapperElement;
        delete info.engine;
        delete info.anchorName;
        delete info.anchorElement;
        delete info.containerElement;
        delete info.flippedAxes;
        delete info.builtOpenAnimation;
        delete info.builtCloseAnimation;
    }

    private playOpenAnimation(info: OverlayInfo) {
        //  if there is opening animation already started do nothing
        if (info.openAnimationPlayer?.hasStarted()) {
            return;
        }
        if (info.closeAnimationPlayer?.hasStarted()) {
            const position = info.closeAnimationPlayer.position;
            info.closeAnimationPlayer.reset();
            info.openAnimationPlayer!.init();
            info.openAnimationPlayer!.position = 1 - position;
        }
        this.animationStarting.emit({ id: info.id!, animationPlayer: info.openAnimationPlayer!, animationType: 'open' });

        //  to eliminate flickering show the element just before animation start
        info.wrapperElement!.style.visibility = '';
        info.visible = true;
        info.openAnimationPlayer!.play();
    }

    private playCloseAnimation(info: OverlayInfo, event?: Event) {
        //  if there is closing animation already started do nothing
        if (info.closeAnimationPlayer?.hasStarted()) {
            return;
        }
        if (info.openAnimationPlayer?.hasStarted()) {
            const position = info.openAnimationPlayer.position;
            info.openAnimationPlayer.reset();
            info.closeAnimationPlayer!.init();
            info.closeAnimationPlayer!.position = 1 - position;
        }
        this.animationStarting.emit({ id: info.id!, animationPlayer: info.closeAnimationPlayer!, animationType: 'close' });
        info.event = event;
        info.closeAnimationPlayer!.play();
    }

    //  TODO: check if applyAnimationParams will work with complex animations
    private applyAnimationParams(wrapperElement: HTMLElement, animationOptions: AnimationReferenceMetadata | undefined) {
        if (!animationOptions) {
            wrapperElement.style.transitionDuration = '0ms';
            return;
        }
        if (!animationOptions.options || !animationOptions.options.params) {
            return;
        }
        const params = animationOptions.options.params as IAnimationParams;
        if (params.duration) {
            wrapperElement.style.transitionDuration = params.duration;
        }
        if (params.easing) {
            wrapperElement.style.transitionTimingFunction = params.easing;
        }
    }

    private documentClicked = (ev: MouseEvent) => {
        //  if we get to modal overlay just return - we should not close anything under it
        //  if we get to non-modal overlay do the next:
        //   1. Check it has close on outside click. If not go on to next overlay;
        //   2. If true check if click is on the element. If it is on the element we have closed
        //  already all previous non-modal with close on outside click elements, so we return. If
        //  not close the overlay and check next
        for (let i = this._overlayInfos.length; i--;) {
            const info = this._overlayInfos[i];
            if (info.settings!.modal) {
                return;
            }
            if (info.settings!.closeOnOutsideClick) {
                const target = ev.composed ? ev.composedPath()[0] : ev.target;
                const overlayElement = info.elementRef!.nativeElement;
                // check if the click is on the overlay element or on an element from the exclusion list, and if so do not close the overlay
                const excludeElements = info.settings!.excludeFromOutsideClick ?
                    [...info.settings!.excludeFromOutsideClick, overlayElement] : [overlayElement];
                const isInsideClick: boolean = excludeElements.some(e => e.contains(target as Node));
                if (isInsideClick) {
                    return;
                    //  if the click is outside click, but close animation has started do nothing
                } else if (!(info.closeAnimationPlayer?.hasStarted())) {
                    this._hide(info.id!, ev);
                }
            }
        }
    };

    private addOutsideClickListener(info: OverlayInfo) {
        if (info.settings!.closeOnOutsideClick) {
            if (info.settings!.modal) {
                fromEvent<Event>(info.elementRef!.nativeElement.parentElement.parentElement, 'click')
                    .pipe(takeUntil(this.destroy$))
                    .subscribe((e: Event) => this._hide(info.id!, e));
            } else if (
                //  if all overlays minus closing overlays equals one add the handler
                this._overlayInfos.filter(x => x.settings!.closeOnOutsideClick && !x.settings!.modal).length -
                this._overlayInfos.filter(x => x.settings!.closeOnOutsideClick && !x.settings!.modal &&
                    x.closeAnimationPlayer?.hasStarted()).length === 1) {

                // click event is not fired on iOS. To make element "clickable" we are
                // setting the cursor to pointer
                if (this.platformUtil.isIOS && !this._cursorStyleIsSet) {
                    this._cursorOriginalValue = this._document.body.style.cursor;
                    this._document.body.style.cursor = 'pointer';
                    this._cursorStyleIsSet = true;
                }
                this._document.addEventListener('click', this.documentClicked, true);
            }
        }
    }

    private removeOutsideClickListener(info: OverlayInfo) {
        if (info.settings!.modal === false) {
            let shouldRemoveClickEventListener = true;
            this._overlayInfos.forEach(o => {
                if (o.settings!.modal === false && o.id !== info.id) {
                    shouldRemoveClickEventListener = false;
                }
            });
            if (shouldRemoveClickEventListener) {
                if (this._cursorStyleIsSet) {
                    this._document.body.style.cursor = this._cursorOriginalValue;
                    this._cursorOriginalValue = '';
                    this._cursorStyleIsSet = false;
                }
                this._document.removeEventListener('click', this.documentClicked, true);
            }
        }
    }

    private addResizeHandler() {
        const closingOverlaysCount =
            this._overlayInfos
                .filter(o => o.closeAnimationPlayer?.hasStarted())
                .length;
        if (this._overlayInfos.length - closingOverlaysCount === 1) {
            this._document.defaultView!.addEventListener('resize', this.repositionAll);
        }
    }

    private removeResizeHandler() {
        const closingOverlaysCount =
            this._overlayInfos
                .filter(o => o.closeAnimationPlayer?.hasStarted())
                .length;
        if (this._overlayInfos.length - closingOverlaysCount === 1) {
            this._document.defaultView!.removeEventListener('resize', this.repositionAll);
        }
    }

    private addCloseOnEscapeListener(info: OverlayInfo) {
        if (info.settings!.closeOnEscape && !this._keyPressEventListener) {
            this._keyPressEventListener = fromEvent<KeyboardEvent>(this._document, 'keydown').pipe(
                filter((ev: KeyboardEvent) => ev.key === 'Escape' || ev.key === 'Esc')
            ).subscribe((ev) => {
                const visibleOverlays = this._overlayInfos.filter(o => o.visible);
                if (visibleOverlays.length < 1) {
                    return;
                }
                const targetOverlayInfo = visibleOverlays[visibleOverlays.length - 1];
                if (targetOverlayInfo.visible && targetOverlayInfo.settings!.closeOnEscape) {
                    this.hide(targetOverlayInfo.id!, ev);
                }
            });
        }
    }

    private removeCloseOnEscapeListener() {
        if (this._keyPressEventListener) {
            this._keyPressEventListener.unsubscribe();
            this._keyPressEventListener = null!;
        }
    }

    private addModalClasses(info: OverlayInfo) {
        if (info.settings!.modal) {
            const wrapperElement = info.elementRef!.nativeElement.parentElement.parentElement;
            wrapperElement.classList.remove('igx-overlay__wrapper');
            this.applyAnimationParams(wrapperElement, this.getOpenAnimation(info) ?? undefined);
            requestAnimationFrame(() => {
                wrapperElement.classList.add('igx-overlay__wrapper--modal');
            });
        }
    }

    private removeModalClasses(info: OverlayInfo) {
        if (info.settings!.modal) {
            const wrapperElement = info.elementRef!.nativeElement.parentElement.parentElement;
            this.applyAnimationParams(wrapperElement, this.getCloseAnimation(info) ?? undefined);
            wrapperElement.classList.remove('igx-overlay__wrapper--modal');
            wrapperElement.classList.add('igx-overlay__wrapper');
        }
    }

    private buildAnimationPlayers(info: OverlayInfo) {
        this.buildOpenAnimationPlayer(info);
        this.buildCloseAnimationPlayer(info);
    }

    private buildOpenAnimationPlayer(info: OverlayInfo) {
        const animation = this.getOpenAnimation(info);
        info.builtOpenAnimation = animation;
        this.disposePlayer(info.openAnimationPlayer);
        delete info.openAnimationPlayer;
        if (animation) {
            info.openAnimationPlayer = this.buildPlayer(animation, info, () => this.openAnimationDone(info));
        }
    }

    private buildCloseAnimationPlayer(info: OverlayInfo) {
        const animation = this.getCloseAnimation(info);
        info.builtCloseAnimation = animation;
        this.disposePlayer(info.closeAnimationPlayer);
        delete info.closeAnimationPlayer;
        if (animation) {
            info.closeAnimationPlayer = this.buildPlayer(animation, info, () => this.closeAnimationDone(info));
        }
    }

    private buildPlayer(animation: AnimationReferenceMetadata, info: OverlayInfo, done: () => void): AnimationPlayer {
        const player = this.animationService.buildAnimation(animation, info.elementRef!.nativeElement);
        this._playerSubscriptions.set(player, player.animationEnd.pipe(takeUntil(this.destroy$)).subscribe(done));
        return player;
    }

    /**
     * Releases a player that is being replaced. Unsubscribes first: destroying a player completes it,
     * and its done handler would otherwise finish the open or close of the overlay.
     */
    private disposePlayer(player: AnimationPlayer | undefined) {
        if (!player) {
            return;
        }
        this._playerSubscriptions.get(player)?.unsubscribe();
        this._playerSubscriptions.delete(player);
        player.destroy();
    }

    /**
     * Rebuilds the players whose animation changed since they were built (script Auto flip mutates the
     * strategy settings; native Auto resolves the animations per show). A running player is kept,
     * because the open/close hand-off needs the player that is playing.
     */
    private updateAnimationPlayers(info: OverlayInfo) {
        if (this.getOpenAnimation(info) !== info.builtOpenAnimation && !info.openAnimationPlayer?.hasStarted()) {
            this.buildOpenAnimationPlayer(info);
        }
        if (this.getCloseAnimation(info) !== info.builtCloseAnimation && !info.closeAnimationPlayer?.hasStarted()) {
            this.buildCloseAnimationPlayer(info);
        }
    }

    private getOpenAnimation(info: OverlayInfo): AnimationReferenceMetadata | null | undefined {
        const animation = info.settings!.positionStrategy!.settings.openAnimation;
        return info.flippedAxes ? flipAnimation(animation, info.flippedAxes) : animation;
    }

    private getCloseAnimation(info: OverlayInfo): AnimationReferenceMetadata | null | undefined {
        const animation = info.settings!.positionStrategy!.settings.closeAnimation;
        return info.flippedAxes ? flipAnimation(animation, info.flippedAxes) : animation;
    }

    //#region Native anchoring

    private nativeSupported(): boolean {
        return this._nativeSupported ??= supportsNativeAnchoring(this._document.defaultView);
    }

    /** The supported `position-visibility` hide keyword, or `null`. Detected once per service. */
    private anchorVisible(): AnchorVisibleKeyword | null {
        if (this._anchorVisible === undefined) {
            this._anchorVisible = anchorVisibleKeyword(this._document.defaultView);
        }
        return this._anchorVisible;
    }

    /** Picks the engine for this show(). Exact class matches only: subclasses keep the script engine. */
    private resolveEngine(info: OverlayInfo): OverlayEngine {
        if (this._anchoringMode === 'script' || !this.nativeSupported()) {
            return 'script';
        }
        const strategy = info.settings!.positionStrategy!;
        const ctor = strategy.constructor;
        if (ctor === ConnectedPositioningStrategy || ctor === AutoPositionStrategy) {
            const target = info.settings!.target;
            const content: HTMLElement = info.elementRef!.nativeElement.parentElement;
            const HTMLElementCtor = this._document.defaultView?.HTMLElement;
            const eligible = !!HTMLElementCtor && target instanceof HTMLElementCtor &&
                target.isConnected &&
                target.getRootNode() === content.getRootNode() &&
                isExpressible(strategy.settings);
            return eligible ? 'native-connected' : 'script';
        }
        // DISCUSS(#17765): native Container is likely obsolete after #17986 (see containerDeclarations).
        if (ctor === ContainerPositionStrategy && info.containerElement?.isConnected) {
            return 'native-container';
        }
        return 'script';
    }

    /**
     * Clears both engines' inline styles and anchors when an overlay changes engine. When it leaves the
     * script engine, also undoes the state script positioning keeps in the strategy: a fit strategy's
     * flipped settings and the Container observer, which would overwrite the native wrapper insets.
     */
    private switchEngine(info: OverlayInfo) {
        const content: HTMLElement = info.elementRef!.nativeElement.parentElement;
        const wrapper = info.wrapperElement!;
        const strategy = info.settings!.positionStrategy;
        if (info.engine === 'script') {
            if (strategy instanceof BaseFitPositionStrategy) {
                strategy._restoreSettings();
            } else if (strategy instanceof ContainerPositionStrategy) {
                strategy.dispose();
            }
        }
        for (const prop of [...SCRIPT_CONTENT_PROPS, ...NATIVE_CONTENT_PROPS]) {
            content.style.removeProperty(prop);
        }
        for (const prop of [...SCRIPT_WRAPPER_PROPS, ...NATIVE_WRAPPER_PROPS]) {
            wrapper.style.removeProperty(prop);
        }
        this.releaseAnchor(info);
        delete info.flippedAxes;
        if (info.transformX || info.transformY) {
            content.style.transform = `translate(${info.transformX}px, ${info.transformY}px)`;
        }
    }

    /**
     * Writes the native declarations from the current settings and moves the anchor name to the current
     * target. Never reads layout, so it is cheap to call on every scroll; rewriting unchanged inline values
     * does not invalidate layout.
     */
    private applyNative(info: OverlayInfo) {
        const name = info.anchorName ??= acquireAnchorName();
        const settings = info.settings!;
        const strategy = settings.positionStrategy!;
        const hide = settings.scrollStrategy instanceof HideScrollStrategy ? this.anchorVisible() : null;
        let element: HTMLElement;
        let declarations: NativeDeclarations;

        if (info.engine === 'native-container') {
            if (info.anchorElement !== info.containerElement) {
                info.containerElement!.style.setProperty('anchor-name', name);
                info.anchorElement = info.containerElement;
            }
            element = info.wrapperElement!;
            declarations = containerDeclarations(name, hide);
        } else {
            const target = settings.target as HTMLElement;
            if (info.anchorElement !== target) {
                if (info.anchorElement) {
                    removeAnchorName(info.anchorElement, name);
                }
                addAnchorName(target, name);
                info.anchorElement = target;
            }
            element = info.elementRef!.nativeElement.parentElement;
            // D16: always the current settings, never a snapshot.
            declarations = connectedDeclarations(strategy.settings, strategy.constructor === AutoPositionStrategy, name, hide);
        }

        for (const [property, value] of declarations) {
            element.style.setProperty(property, value);
        }
    }

    /** Removes the overlay's anchor name from its target or container. Idempotent. */
    private releaseAnchor(info: OverlayInfo) {
        if (!info.anchorElement || !info.anchorName) {
            return;
        }
        if (info.engine === 'native-container') {
            info.anchorElement.style.removeProperty('anchor-name');
        } else {
            removeAnchorName(info.anchorElement, info.anchorName);
        }
        delete info.anchorElement;
    }

    /**
     * Starts `HideScrollStrategy` tracking for the current engine and anchor. Unless `restart` is set, it
     * does nothing when the strategy already observes the right element, so it is cheap on every scroll.
     */
    private trackHide(info: OverlayInfo, content: HTMLElement, restart = false) {
        const scrollStrategy = info.settings!.scrollStrategy;
        if (!(scrollStrategy instanceof HideScrollStrategy)) {
            return;
        }
        const anchor = this.getHideAnchor(info);
        const useObserver = info.engine === 'script' || !this.anchorVisible();
        if (!restart && scrollStrategy._observedAnchor === (useObserver ? anchor : null)) {
            return;
        }
        this._zone.runOutsideAngular(() => scrollStrategy._onShown(anchor, content, useObserver));
    }

    /**
     * Native Auto: CSS does not report which position option the browser chose, so compare the rendered
     * rectangles with the configured and the flipped placement, and store the flipped axes. The animations
     * are derived from them and the current settings on each read, so a later settings change still applies.
     * The `setOffset()` translation is taken out of the content rectangle, so it is not mistaken for a flip.
     * Strategy settings are never written.
     */
    private resolveFlips(info: OverlayInfo) {
        if (!info.anchorElement) {
            delete info.flippedAxes;
            return;
        }
        const settings = info.settings!.positionStrategy!.settings;
        const content: HTMLElement = info.elementRef!.nativeElement.parentElement;
        const rect = content.getBoundingClientRect();
        const dx = info.transformX ?? 0;
        const dy = info.transformY ?? 0;
        const placed = { top: rect.top - dy, right: rect.right - dx, bottom: rect.bottom - dy, left: rect.left - dx };
        info.flippedAxes = resolveFlippedAxes(settings, placed, info.anchorElement.getBoundingClientRect());
    }

    /** The element whose visibility controls a `HideScrollStrategy` overlay, if any. */
    private getHideAnchor(info: OverlayInfo): HTMLElement | null {
        if (info.engine !== 'script') {
            return info.anchorElement ?? null;
        }
        const strategy = info.settings!.positionStrategy;
        if (strategy instanceof ContainerPositionStrategy) {
            return info.containerElement ?? null;
        }
        if (strategy instanceof GlobalPositionStrategy) {
            return null;
        }
        const target = info.settings!.target;
        const HTMLElementCtor = this._document.defaultView?.HTMLElement;
        return HTMLElementCtor && target instanceof HTMLElementCtor ? target : null;
    }

    //#endregion

    private openAnimationDone(info: OverlayInfo) {
        if (!info.openAnimationDetaching) {
            this.opened.emit({ id: info.id!, componentRef: info.componentRef });
        }
        if (info.openAnimationPlayer) {
            info.openAnimationPlayer.reset();
        }
        if (info.closeAnimationPlayer?.hasStarted()) {
            info.closeAnimationPlayer.reset();
        }
    }

    private closeAnimationDone(info: OverlayInfo) {
        if (info.closeAnimationPlayer) {
            info.closeAnimationPlayer.reset();
        }
        if (info.openAnimationPlayer?.hasStarted()) {
            info.openAnimationPlayer.reset();
        }
        this.closeDone(info);
    }

    private finishAnimations(info: OverlayInfo) {
        // // TODO: should we emit here opened or closed events
        if (info.openAnimationPlayer?.hasStarted()) {
            info.openAnimationPlayer.finish();
        }
        if (info.closeAnimationPlayer?.hasStarted()) {
            info.closeAnimationPlayer.finish();
        }
    }

    private getComponentSize(info: OverlayInfo) {
        if (info.elementRef?.nativeElement instanceof Element) {
            const styles = this._document.defaultView!.getComputedStyle(info.elementRef.nativeElement);
            const componentSize = styles.getPropertyValue('--component-size');
            const globalSize = styles.getPropertyValue('--ig-size');
            const size = componentSize || globalSize;
            info.size = size;
        }
    }
}
