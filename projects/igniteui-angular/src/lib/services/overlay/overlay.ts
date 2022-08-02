import { AnimationBuilder, AnimationReferenceMetadata } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import {
    ApplicationRef,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    EventEmitter,
    Inject,
    Injectable,
    Injector,
    NgModuleRef,
    NgZone, OnDestroy, Type
} from '@angular/core';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import {
    fadeIn,
    fadeOut,
    IAnimationParams,
    scaleInHorLeft,
    scaleInHorRight,
    scaleInVerBottom,
    scaleInVerTop,
    scaleOutHorLeft,
    scaleOutHorRight,
    scaleOutVerBottom,
    scaleOutVerTop,
    slideInBottom,
    slideInTop,
    slideOutBottom,
    slideOutTop
} from '../../animations/main';
import { PlatformUtil } from '../../core/utils';
import { IgxOverlayOutletDirective } from '../../directives/toggle/toggle.directive';
import { AutoPositionStrategy } from './position/auto-position-strategy';
import { ConnectedPositioningStrategy } from './position/connected-positioning-strategy';
import { ContainerPositionStrategy } from './position/container-position-strategy';
import { ElasticPositionStrategy } from './position/elastic-position-strategy';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import { IPositionStrategy } from './position/IPositionStrategy';
import { NoOpScrollStrategy } from './scroll/NoOpScrollStrategy';
import {
    AbsolutePosition,
    HorizontalAlignment,
    OverlayAnimationEventArgs,
    OverlayCancelableEventArgs,
    OverlayClosingEventArgs,
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
    private _overlayElement: HTMLElement;
    private _document: Document;
    private _keyPressEventListener: Subscription;
    private destroy$ = new Subject<boolean>();
    private _cursorStyleIsSet = false;
    private _cursorOriginalValue: string;

    private _defaultSettings: OverlaySettings = {
        excludeFromOutsideClick: [],
        positionStrategy: new GlobalPositionStrategy(),
        scrollStrategy: new NoOpScrollStrategy(),
        modal: true,
        closeOnOutsideClick: true,
        closeOnEscape: false
    };

    constructor(
        private _factoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector,
        private builder: AnimationBuilder,
        @Inject(DOCUMENT) private document: any,
        private _zone: NgZone,
        protected platformUtil: PlatformUtil) {
        this._document = this.document;
    }

    /**
     * Creates overlay settings with global or container position strategy and preset position settings
     *
     * @param position Preset position settings. Default position is 'center'
     * @param outlet The outlet container to attach the overlay to
     * @returns Non-modal overlay settings based on Global or Container position strategy and the provided position.
     */
    public static createAbsoluteOverlaySettings(
        position?: AbsolutePosition, outlet?: IgxOverlayOutletDirective | ElementRef): OverlaySettings {
        const positionSettings = this.createAbsolutePositionSettings(position);
        const strategy = outlet ? new ContainerPositionStrategy(positionSettings) : new GlobalPositionStrategy(positionSettings);
        const overlaySettings: OverlaySettings = {
            positionStrategy: strategy,
            scrollStrategy: new NoOpScrollStrategy(),
            modal: false,
            closeOnOutsideClick: true,
            outlet
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

    private static createAbsolutePositionSettings(position: AbsolutePosition): PositionSettings {
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

    private static createRelativePositionSettings(position: RelativePosition): PositionSettings {
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

    private static createPositionStrategy(strategy: RelativePositionStrategy, positionSettings: PositionSettings): IPositionStrategy {
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
     * @param settings Display settings for the overlay, such as positioning and scroll/close behavior.
     * @returns Id of the created overlay. Valid until `detach` is called.
     */
    public attach(element: ElementRef, settings?: OverlaySettings): string;
    /**
     * Generates Id. Provide this Id when call `show(id)` method
     *
     * @param component Component Type to show in overlay
     * @param settings Display settings for the overlay, such as positioning and scroll/close behavior.
     * @param moduleRef Optional reference to an object containing Injector and ComponentFactoryResolver
     * that can resolve the component's factory
     * @returns Id of the created overlay. Valid until `detach` is called.
     */
    public attach(component: Type<any>, settings?: OverlaySettings,
        moduleRef?: Pick<NgModuleRef<any>, 'injector' | 'componentFactoryResolver'>): string;
    public attach(component: ElementRef | Type<any>, settings?: OverlaySettings,
        moduleRef?: Pick<NgModuleRef<any>, 'injector' | 'componentFactoryResolver'>): string {
        const info: OverlayInfo = this.getOverlayInfo(component, moduleRef);

        if (!info) {
            console.warn('Overlay was not able to attach provided component!');
            return null;
        }

        info.id = (this._componentId++).toString();
        info.visible = false;
        settings = Object.assign({}, this._defaultSettings, settings);
        info.settings = settings;
        this._overlayInfos.push(info);
        info.hook = this.placeElementHook(info.elementRef.nativeElement);
        const elementRect = info.elementRef.nativeElement.getBoundingClientRect();
        info.initialSize = { width: elementRect.width, height: elementRect.height };
        this.moveElementToOverlay(info);
        this.contentAppended.emit({ id: info.id, componentRef: info.componentRef });
        // TODO: why we had this check?
        // if (this._overlayInfos.indexOf(info) === -1) {
        //     this._overlayInfos.push(info);
        // }
        info.settings.scrollStrategy.initialize(this._document, this, info.id);
        info.settings.scrollStrategy.attach();
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
        info.settings.scrollStrategy.detach();
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
            this.detach(this._overlayInfos[i].id);
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
            // TODO: update attach
        }
        this.updateSize(info);
        info.settings.positionStrategy.position(
            info.elementRef.nativeElement.parentElement,
            { width: info.initialSize.width, height: info.initialSize.height },
            document,
            true,
            info.settings.target);
        this.addModalClasses(info);
        if (info.settings.positionStrategy.settings.openAnimation) {
            this.playOpenAnimation(info);
        } else {
            //  to eliminate flickering show the element just before opened fires
            info.wrapperElement.style.visibility = '';
            info.visible = true;
            this.opened.emit({ id: info.id, componentRef: info.componentRef });
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
            this.hide(this._overlayInfos[i].id);
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
            console.error('Wrong id provided in overlay.reposition method. Id: ' + id);
            return;
        }
        if (!overlayInfo.visible) {
            return;
        }
        const contentElement = overlayInfo.elementRef.nativeElement.parentElement;
        const contentElementRect = contentElement.getBoundingClientRect();
        overlayInfo.settings.positionStrategy.position(
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
     * Offsets the content along the corresponding axis by the provided amount
     *
     * @param id Id to offset overlay for
     * @param deltaX Amount of offset in horizontal direction
     * @param deltaY Amount of offset in vertical direction
     * ```typescript
     * this.overlay.setOffset(id, deltaX, deltaY);
     * ```
     */
    public setOffset(id: string, deltaX: number, deltaY: number) {
        const info: OverlayInfo = this.getOverlayById(id);

        if (!info) {
            return;
        }

        info.transformX += deltaX;
        info.transformY += deltaY;

        const transformX = info.transformX;
        const transformY = info.transformY;

        const translate = `translate(${transformX}px, ${transformY}px)`;
        info.elementRef.nativeElement.parentElement.style.transform = translate;
    }

    /** @hidden */
    public repositionAll = () => {
        for (let i = this._overlayInfos.length; i--;) {
            this.reposition(this._overlayInfos[i].id);
        }
    };

    /** @hidden */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /** @hidden @internal */
    public getOverlayById(id: string): OverlayInfo {
        if (!id) {
            return null;
        }

        const info = this._overlayInfos.find(e => e.id === id);
        return info;
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
        this.removeModalClasses(info);
        if (info.settings.positionStrategy.settings.closeAnimation) {
            this.playCloseAnimation(info, event);
        } else {
            this.closeDone(info);
        }
    }

    private getOverlayInfo(component: any, moduleRef?: Pick<NgModuleRef<any>, 'injector' | 'componentFactoryResolver'>): OverlayInfo {
        const info: OverlayInfo = { ngZone: this._zone, transformX: 0, transformY: 0 };
        if (component instanceof ElementRef) {
            info.elementRef = component;
        } else {
            let dynamicFactory: ComponentFactory<any>;
            const factoryResolver = moduleRef ? moduleRef.componentFactoryResolver : this._factoryResolver;
            try {
                dynamicFactory = factoryResolver.resolveComponentFactory(component);
            } catch (error) {
                console.error(error);
                return null;
            }

            const injector = moduleRef ? moduleRef.injector : this._injector;
            const dynamicComponent: ComponentRef<any> = dynamicFactory.create(injector);
            if (dynamicComponent.onDestroy) {
                dynamicComponent.onDestroy(() => {
                    if (!info.detached && this._overlayInfos.indexOf(info) !== -1) {
                        this.detach(info.id);
                    }
                })
            }
            this._appRef.attachView(dynamicComponent.hostView);

            // If the element is newly created from a Component, it is wrapped in 'ng-component' tag - we do not want that.
            const element = dynamicComponent.location.nativeElement;
            info.elementRef = { nativeElement: element };
            info.componentRef = dynamicComponent;
        }

        return info;
    }

    private placeElementHook(element: HTMLElement): HTMLElement {
        if (!element.parentElement) {
            return null;
        }

        const hook = this._document.createElement('div');
        hook.style.display = 'none';
        element.parentElement.insertBefore(hook, element);
        return hook;
    }

    private moveElementToOverlay(info: OverlayInfo) {
        info.wrapperElement = this.getWrapperElement();
        const contentElement = this.getContentElement(info.wrapperElement, info.settings.modal);
        this.getOverlayElement(info).appendChild(info.wrapperElement);
        contentElement.appendChild(info.elementRef.nativeElement);
    }

    private getWrapperElement(): HTMLElement {
        const wrapper: HTMLElement = this._document.createElement('div');
        wrapper.classList.add('igx-overlay__wrapper');
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

    private getOverlayElement(info: OverlayInfo): HTMLElement {
        if (info.settings.outlet) {
            return info.settings.outlet.nativeElement || info.settings.outlet;
        }
        if (!this._overlayElement) {
            this._overlayElement = this._document.createElement('div');
            this._overlayElement.classList.add('igx-overlay');
            this._document.body.appendChild(this._overlayElement);
        }

        return this._overlayElement;
    }

    private updateSize(info: OverlayInfo) {
        if (info.componentRef) {
            //  if we are positioning component this is first time it gets visible
            //  and we can finally get its size
            info.componentRef.changeDetectorRef.detectChanges();
            info.initialSize = info.elementRef.nativeElement.getBoundingClientRect();
        }

        // set content div width only if element to show has width
        if (info.initialSize.width !== 0) {
            info.elementRef.nativeElement.parentElement.style.width = info.initialSize.width + 'px';
        }
    }

    private closeDone(info: OverlayInfo) {
        info.visible = false;
        if (info.wrapperElement) {
            // to eliminate flickering show the element just before animation start
            info.wrapperElement.style.visibility = 'hidden';
        }
        if (!info.closeAnimationDetaching) {
            this.closed.emit({ id: info.id, componentRef: info.componentRef, event: info.event });
        }
        delete info.event;
    }

    private cleanUp(info: OverlayInfo) {
        const child: HTMLElement = info.elementRef.nativeElement;
        const outlet = this.getOverlayElement(info);
        // if same element is shown in other overlay outlet will not contain
        // the element and we should not remove it form outlet
        if (outlet.contains(child)) {
            outlet.removeChild(child.parentNode.parentNode);
        }
        if (info.componentRef) {
            this._appRef.detachView(info.componentRef.hostView);
            info.componentRef.destroy();
            delete info.componentRef;
        }
        if (info.hook) {
            info.hook.parentElement.insertBefore(info.elementRef.nativeElement, info.hook);
            info.hook.parentElement.removeChild(info.hook);
            delete info.hook;
        }

        const index = this._overlayInfos.indexOf(info);
        this._overlayInfos.splice(index, 1);

        // this._overlayElement.parentElement check just for tests that manually delete the element
        if (this._overlayInfos.length === 0) {
            if (this._overlayElement && this._overlayElement.parentElement) {
                this._overlayElement.parentElement.removeChild(this._overlayElement);
                this._overlayElement = null;
            }
            this.removeCloseOnEscapeListener();
        }

        // clean all the resources attached to info
        delete info.elementRef;
        delete info.settings;
        delete info.initialSize;
        info.openAnimationDetaching = true;
        info.openAnimationPlayer?.destroy();
        delete info.openAnimationPlayer;
        delete info.openAnimationInnerPlayer;
        info.closeAnimationDetaching = true;
        info.closeAnimationPlayer?.destroy();
        delete info.closeAnimationPlayer;
        delete info.closeAnimationInnerPlayer;
        delete info.ngZone;
        delete info.wrapperElement;
        info = null;
    }

    private playOpenAnimation(info: OverlayInfo) {
        //  if there is opening animation already started do nothing
        if (info.openAnimationPlayer == null || info.openAnimationPlayer.hasStarted()) {
            return;
        }

        //  if there is closing animation already started start open animation from where close one has reached
        //  and reset close animation
        if (info.closeAnimationPlayer?.hasStarted()) {
            //  getPosition() returns what part of the animation is passed, e.g. 0.5 if half the animation
            //  is done, 0.75 if 3/4 of the animation is done. As we need to start next animation from where
            //  the previous has finished we need the amount up to 1, therefore we are subtracting what
            //  getPosition() returns from one
            const position = 1 - info.closeAnimationInnerPlayer.getPosition();
            info.closeAnimationPlayer.reset();
            // calling reset does not change hasStarted to false. This is why we are doing it her via internal field
            (info.closeAnimationPlayer as any)._started = false;
            info.openAnimationPlayer.init();
            info.openAnimationPlayer.setPosition(position);
        }

        this.animationStarting.emit({ id: info.id, animationPlayer: info.openAnimationPlayer, animationType: 'open' });

        //  to eliminate flickering show the element just before animation start
        info.wrapperElement.style.visibility = '';
        info.visible = true;
        info.openAnimationPlayer.play();
    }

    private playCloseAnimation(info: OverlayInfo, event?: Event) {
        //  if there is closing animation already started do nothing
        if (info.closeAnimationPlayer == null || info.closeAnimationPlayer.hasStarted()) {
            return;
        }

        //  if there is opening animation already started start close animation from where open one has reached
        //  and remove open animation
        if (info.openAnimationPlayer?.hasStarted()) {
            //  getPosition() returns what part of the animation is passed, e.g. 0.5 if half the animation
            //  is done, 0.75 if 3/4 of the animation is done. As we need to start next animation from where
            //  the previous has finished we need the amount up to 1, therefore we are subtracting what
            //  getPosition() returns from one
            //  TODO: This assumes opening and closing animations are mirrored.
            const position = 1 - info.openAnimationInnerPlayer.getPosition();
            info.openAnimationPlayer.reset();
            // calling reset does not change hasStarted to false. This is why we are doing it her via internal field
            (info.openAnimationPlayer as any)._started = false;
            info.closeAnimationPlayer.init();
            info.closeAnimationPlayer.setPosition(position);
        }

        this.animationStarting.emit({ id: info.id, animationPlayer: info.closeAnimationPlayer, animationType: 'close' });
        info.event = event;
        info.closeAnimationPlayer.play();
    }

    //  TODO: check if applyAnimationParams will work with complex animations
    private applyAnimationParams(wrapperElement: HTMLElement, animationOptions: AnimationReferenceMetadata) {
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
            if (info.settings.modal) {
                return;
            }
            if (info.settings.closeOnOutsideClick) {
                const target = ev.composed ? ev.composedPath()[0] : ev.target;
                const overlayElement = info.elementRef.nativeElement;
                // check if the click is on the overlay element or on an element from the exclusion list, and if so do not close the overlay
                const excludeElements = info.settings.excludeFromOutsideClick ?
                    [...info.settings.excludeFromOutsideClick, overlayElement] : [overlayElement];
                const isInsideClick: boolean = excludeElements.some(e => e.contains(target as Node));
                if (isInsideClick) {
                    return;
                    //  if the click is outside click, but close animation has started do nothing
                } else if (!(info.closeAnimationPlayer && info.closeAnimationPlayer.hasStarted())) {
                    this._hide(info.id, ev);
                }
            }
        }
    };

    private addOutsideClickListener(info: OverlayInfo) {
        if (info.settings.closeOnOutsideClick) {
            if (info.settings.modal) {
                fromEvent(info.elementRef.nativeElement.parentElement.parentElement, 'click')
                    .pipe(takeUntil(this.destroy$))
                    .subscribe((e: Event) => this._hide(info.id, e));
            } else if (
                //  if all overlays minus closing overlays equals one add the handler
                this._overlayInfos.filter(x => x.settings.closeOnOutsideClick && !x.settings.modal).length -
                this._overlayInfos.filter(x => x.settings.closeOnOutsideClick && !x.settings.modal &&
                    x.closeAnimationPlayer &&
                    x.closeAnimationPlayer.hasStarted()).length === 1) {

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
        if (info.settings.modal === false) {
            let shouldRemoveClickEventListener = true;
            this._overlayInfos.forEach(o => {
                if (o.settings.modal === false && o.id !== info.id) {
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
                .filter(o => o.closeAnimationPlayer && o.closeAnimationPlayer.hasStarted())
                .length;
        if (this._overlayInfos.length - closingOverlaysCount === 1) {
            this._document.defaultView.addEventListener('resize', this.repositionAll);
        }
    }

    private removeResizeHandler() {
        const closingOverlaysCount =
            this._overlayInfos
                .filter(o => o.closeAnimationPlayer && o.closeAnimationPlayer.hasStarted())
                .length;
        if (this._overlayInfos.length - closingOverlaysCount === 1) {
            this._document.defaultView.removeEventListener('resize', this.repositionAll);
        }
    }

    private addCloseOnEscapeListener(info: OverlayInfo) {
        if (info.settings.closeOnEscape && !this._keyPressEventListener) {
            this._keyPressEventListener = fromEvent(this._document, 'keydown').pipe(
                filter((ev: KeyboardEvent) => ev.key === 'Escape' || ev.key === 'Esc')
            ).subscribe((ev) => {
                const visibleOverlays = this._overlayInfos.filter(o => o.visible);
                if (visibleOverlays.length < 1) {
                    return;
                }
                const targetOverlayInfo = visibleOverlays[visibleOverlays.length - 1];
                if (targetOverlayInfo.visible && targetOverlayInfo.settings.closeOnEscape) {
                    this.hide(targetOverlayInfo.id, ev);
                }
            });
        }
    }

    private removeCloseOnEscapeListener() {
        if (this._keyPressEventListener) {
            this._keyPressEventListener.unsubscribe();
            this._keyPressEventListener = null;
        }
    }

    private addModalClasses(info: OverlayInfo) {
        if (info.settings.modal) {
            const wrapperElement = info.elementRef.nativeElement.parentElement.parentElement;
            wrapperElement.classList.remove('igx-overlay__wrapper');
            this.applyAnimationParams(wrapperElement, info.settings.positionStrategy.settings.openAnimation);
            requestAnimationFrame(() => {
                wrapperElement.classList.add('igx-overlay__wrapper--modal');
            });
        }
    }

    private removeModalClasses(info: OverlayInfo) {
        if (info.settings.modal) {
            const wrapperElement = info.elementRef.nativeElement.parentElement.parentElement;
            this.applyAnimationParams(wrapperElement, info.settings.positionStrategy.settings.closeAnimation);
            wrapperElement.classList.remove('igx-overlay__wrapper--modal');
            wrapperElement.classList.add('igx-overlay__wrapper');
        }
    }

    private buildAnimationPlayers(info: OverlayInfo) {
        if (info.settings.positionStrategy.settings.openAnimation) {
            const animationBuilder = this.builder.build(info.settings.positionStrategy.settings.openAnimation);
            info.openAnimationPlayer = animationBuilder.create(info.elementRef.nativeElement);

            //  AnimationPlayer.getPosition returns always 0. To workaround this we are getting inner WebAnimationPlayer
            //  and then getting the positions from it.
            //  This is logged in Angular here - https://github.com/angular/angular/issues/18891
            //  As soon as this is resolved we can remove this hack
            const innerRenderer = (info.openAnimationPlayer as any)._renderer;
            info.openAnimationInnerPlayer = innerRenderer.engine.players[innerRenderer.engine.players.length - 1];
            info.openAnimationPlayer.onDone(() => this.openAnimationDone(info));
        }
        if (info.settings.positionStrategy.settings.closeAnimation) {
            const animationBuilder = this.builder.build(info.settings.positionStrategy.settings.closeAnimation);
            info.closeAnimationPlayer = animationBuilder.create(info.elementRef.nativeElement);

            //  AnimationPlayer.getPosition returns always 0. To workaround this we are getting inner WebAnimationPlayer
            //  and then getting the positions from it.
            //  This is logged in Angular here - https://github.com/angular/angular/issues/18891
            //  As soon as this is resolved we can remove this hack
            const innerRenderer = (info.closeAnimationPlayer as any)._renderer;
            info.closeAnimationInnerPlayer = innerRenderer.engine.players[innerRenderer.engine.players.length - 1];
            info.closeAnimationPlayer.onDone(() => this.closeAnimationDone(info));
        }
    }

    private openAnimationDone(info: OverlayInfo) {
        if (!info.openAnimationDetaching) {
            this.opened.emit({ id: info.id, componentRef: info.componentRef });
        }
        if (info.openAnimationPlayer) {
            info.openAnimationPlayer.reset();
            // calling reset does not change hasStarted to false. This is why we are doing it here via internal field
            (info.openAnimationPlayer as any)._started = false;
            // when animation finish angular deletes all onDone handlers so we need to add it again :(
            info.openAnimationPlayer.onDone(() => this.openAnimationDone(info));
        }
        if (info.closeAnimationPlayer && info.closeAnimationPlayer.hasStarted()) {
            info.closeAnimationPlayer.reset();
            // calling reset does not change hasStarted to false. This is why we are doing it here via internal field
            (info.closeAnimationPlayer as any)._started = false;
        }
    }

    private closeAnimationDone(info: OverlayInfo) {
        if (info.closeAnimationPlayer) {
            info.closeAnimationPlayer.reset();
            // calling reset does not change hasStarted to false. This is why we are doing it here via internal field
            (info.closeAnimationPlayer as any)._started = false;
            // when animation finish angular deletes all onDone handlers so we need to add it again :(
            info.closeAnimationPlayer.onDone(() => this.closeAnimationDone(info));
        }

        if (info.openAnimationPlayer && info.openAnimationPlayer.hasStarted()) {
            info.openAnimationPlayer.reset();
            // calling reset does not change hasStarted to false. This is why we are doing it here via internal field
            (info.openAnimationPlayer as any)._started = false;
        }
        this.closeDone(info);
    }

    private finishAnimations(info: OverlayInfo) {
        // TODO: should we emit here opened or closed events
        if (info.openAnimationPlayer && info.openAnimationPlayer.hasStarted()) {
            info.openAnimationPlayer.reset();
            // calling reset does not change hasStarted to false. This is why we are doing it here via internal field
            (info.openAnimationPlayer as any)._started = false;
        }
        if (info.closeAnimationPlayer && info.closeAnimationPlayer.hasStarted()) {
            info.closeAnimationPlayer.reset();
            // calling reset does not change hasStarted to false. This is why we are doing it here via internal field
            (info.closeAnimationPlayer as any)._started = false;
        }
    }
}
