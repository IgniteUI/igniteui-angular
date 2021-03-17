import { AnimationAnimateRefMetadata, AnimationBuilder, AnimationMetadataType, AnimationReferenceMetadata } from '@angular/animations';
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
    IAnimationParams, slideInTop, slideOutBottom, slideOutTop, slideInBottom, fadeIn, fadeOut,
    scaleInVerTop, scaleOutVerTop, scaleOutVerBottom, scaleInVerBottom, scaleInHorRight, scaleOutHorRight,
    scaleOutHorLeft, scaleInHorLeft
} from '../../animations/main';
import { showMessage } from '../../core/deprecateDecorators';
import { PlatformUtil } from '../../core/utils';
import { IPositionStrategy } from './position/IPositionStrategy';
import { ConnectedPositioningStrategy } from './position/connected-positioning-strategy';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import { NoOpScrollStrategy } from './scroll/NoOpScrollStrategy';
import {
    OverlayAnimationEventArgs,
    OverlayCancelableEventArgs,
    OverlayClosingEventArgs, OverlayEventArgs,
    OverlayInfo, OverlaySettings,
    HorizontalAlignment, VerticalAlignment, Point,
    PositionSettings, AbsolutePosition, RelativePosition, RelativePositionStrategy
} from './utilities';
import { ContainerPositionStrategy } from './position/container-position-strategy';
import { ElasticPositionStrategy } from './position/elastic-position-strategy';
import { AutoPositionStrategy } from './position/auto-position-strategy';
import { IgxOverlayOutletDirective } from '../../directives/toggle/toggle.directive';


let warningShown = false;

/**
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay-main)
 * The overlay service allows users to show components on overlay div above all other elements in the page.
 */
@Injectable({ providedIn: 'root' })
export class IgxOverlayService implements OnDestroy {
    /**
     * Emitted before the component is opened.
     * ```typescript
     * onOpening(event: OverlayCancelableEventArgs){
     *     const onOpening = event;
     * }
     * ```
     */
    public onOpening = new EventEmitter<OverlayCancelableEventArgs>();

    /**
     * Emitted after the component is appended to the overlay, and before animations are started.
     * ```typescript
     * onAppended(event: OverlayEventArgs){
     *     const onAppended = event;
     * }
     * ```
     */
    public onAppended = new EventEmitter<OverlayEventArgs>();

    /**
     * Emitted after the component is opened and all animations are finished.
     * ```typescript
     * onOpened(event: OverlayEventArgs){
     *     const onOpened = event;
     * }
     * ```
     */
    public onOpened = new EventEmitter<OverlayEventArgs>();

    /**
     * Emitted before the component is closed.
     * ```typescript
     * onClosing(event: OverlayCancelableEventArgs){
     *     const onClosing = event;
     * }
     * ```
     */
    public onClosing = new EventEmitter<OverlayClosingEventArgs>();

    /**
     * Emitted after the component is closed and all animations are finished.
     * ```typescript
     * onClosed(event: OverlayEventArgs){
     *     const onClosed = event;
     * }
     * ```
     */
    public onClosed = new EventEmitter<OverlayEventArgs>();

    /**
     * Emitted before animation is started
     * ```typescript
     * onAnimation(event: OverlayAnimationEventArgs){
     *     const onAnimation = event;
     * }
     * ```
     */
    public onAnimation = new EventEmitter<OverlayAnimationEventArgs>();

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
     * Generates Id. Provide this Id when call `show(id, settings?)` method
     *
     * @param component ElementRef to show in overlay
     * @param settings Display settings for the overlay, such as positioning and scroll/close behavior.
     * @returns Id of the created overlay. Valid until `onClosed` is emitted.
     */
    attach(element: ElementRef, settings?: OverlaySettings): string;
    /**
     * Generates Id. Provide this Id when call `show(id, settings?)` method
     *
     * @param component Component Type to show in overlay
     * @param settings Display settings for the overlay, such as positioning and scroll/close behavior.
     * @param moduleRef Optional reference to an object containing Injector and ComponentFactoryResolver
     * that can resolve the component's factory
     * @returns Id of the created overlay. Valid until `onClosed` is emitted.
     */
    attach(component: Type<any>, settings?: OverlaySettings,
        moduleRef?: Pick<NgModuleRef<any>, 'injector' | 'componentFactoryResolver'>): string;
    attach(component: ElementRef | Type<any>, settings?: OverlaySettings,
        moduleRef?: Pick<NgModuleRef<any>, 'injector' | 'componentFactoryResolver'>): string {
        const info: OverlayInfo = this.getOverlayInfo(component, moduleRef);

        //  if there is no info most probably wrong type component was provided and we just go out
        if (!info) {
            return null;
        }

        info.id = (this._componentId++).toString();
        settings = Object.assign({}, this._defaultSettings, settings);
        info.settings = settings;
        this._overlayInfos.push(info);
        return info.id;
    }

    /**
     * Shows the overlay for provided id.
     *
     * @param id Id to show overlay for
     * @param settings Display settings for the overlay, such as positioning and scroll/close behavior.
     */
    show(id: string, settings?: OverlaySettings): string;
    /**
     * Shows the provided component.
     *
     * @param component ElementRef or Component Type to show in overlay
     * @param settings Display settings for the overlay, such as positioning and scroll/close behavior.
     * @returns Id of the created overlay. Valid until `onClosed` is emitted.
     * ```typescript
     * this.overlay.show(element, settings);
     * ```
     * @deprecated Use `attach(component)` to obtain an Id. Then `show(id, settings?)` with provided Id.
     */
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    show(component: ElementRef | Type<any>, settings?: OverlaySettings): string;
    show(compOrId: string | ElementRef | Type<any>, settings?: OverlaySettings): string {
        let info: OverlayInfo;
        let id: string;
        if (typeof compOrId === 'string') {
            id = compOrId;
            info = this.getOverlayById(compOrId);
            if (!info) {
                console.warn('igxOverlay.show was called with wrong id: ' + compOrId);
                return null;
            }
        } else {
            warningShown = showMessage(
                '`show(component, settings?)` overload is deprecated. Use `attach(component)` to obtain an Id.' +
                'Then `show(id, settings?)` with provided Id.',
                warningShown);
            id = (this._componentId++).toString();
            info = this.getOverlayInfo(compOrId);

            //  if there is no info most probably wrong type component was provided and we just go out
            if (!info) {
                return;
            }

            info.id = id;
        }

        settings = Object.assign({}, this._defaultSettings, info.settings, settings);
        info.settings = settings;

        this._show(info);
        return id;
    }

    /**
     * Hides the component with the ID provided as a parameter.
     * ```typescript
     * this.overlay.hide(id);
     * ```
     */
    hide(id: string, event?: Event) {
        this._hide(id, event);
    }

    /**
     * Hides all the components and the overlay.
     * ```typescript
     * this.overlay.hideAll();
     * ```
     */
    hideAll() {
        // since overlays are removed on animation done, que all hides
        for (let i = this._overlayInfos.length; i--;) {
            this.hide(this._overlayInfos[i].id);
        }
    }

    /**
     * Repositions the component with ID provided as a parameter.
     * ```typescript
     * this.overlay.reposition(id);
     * ```
     */
    reposition(id: string) {
        const overlayInfo = this.getOverlayById(id);
        if (!overlayInfo || !overlayInfo.settings) {
            console.error('Wrong id provided in overlay.reposition method. Id: ' + id);
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
     * ```typescript
     * this.overlay.setOffset(id, deltaX, deltaY);
     * ```
     */
    setOffset(id: string, deltaX: number, deltaY: number) {
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

    /** @hidden @internal */
    public getOverlayById(id: string): OverlayInfo {
        if (!id) {
            return null;
        }

        const info = this._overlayInfos.find(e => e.id === id);
        return info;
    }

    /** @hidden */
    public repositionAll = () => {
        for (let i = this._overlayInfos.length; i--;) {
            this.reposition(this._overlayInfos[i].id);
        }
    };

    /**
     * @hidden
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    private _show(info: OverlayInfo) {
        const eventArgs: OverlayCancelableEventArgs = { id: info.id, componentRef: info.componentRef, cancel: false };
        this.onOpening.emit(eventArgs);
        if (eventArgs.cancel) {
            if (info.componentRef) {
                this._appRef.detachView(info.componentRef.hostView);
                info.componentRef.destroy();
            }

            return;
        }

        //  if there is no close animation player, or there is one but it is not started yet we are in clear
        //  opening. Otherwise, if there is close animation player playing animation now we should not setup
        //  overlay this is already done
        if (!info.closeAnimationPlayer || (info.closeAnimationPlayer && !info.closeAnimationPlayer.hasStarted())) {
            const elementRect = info.elementRef.nativeElement.getBoundingClientRect();
            info.initialSize = { width: elementRect.width, height: elementRect.height };
            info.hook = this.placeElementHook(info.elementRef.nativeElement);

            this.moveElementToOverlay(info);
            if (info.componentRef) {
                info.componentRef.changeDetectorRef.detectChanges();
            }

            this.onAppended.emit({ id: info.id, componentRef: info.componentRef });

            this.updateSize(info);
            if (this._overlayInfos.indexOf(info) === -1) {
                this._overlayInfos.push(info);
            }

            info.settings.positionStrategy.position(
                info.elementRef.nativeElement.parentElement,
                { width: info.initialSize.width, height: info.initialSize.height },
                document,
                true,
                info.settings.target);
            info.settings.scrollStrategy.initialize(this._document, this, info.id);
            info.settings.scrollStrategy.attach();
        }

        this.addOutsideClickListener(info);
        this.addResizeHandler();
        this.addCloseOnEscapeListener(info);

        if (info.settings.modal) {
            const wrapperElement = info.elementRef.nativeElement.parentElement.parentElement;
            wrapperElement.classList.remove('igx-overlay__wrapper');
            this.applyAnimationParams(wrapperElement, info.settings.positionStrategy.settings.openAnimation);
            wrapperElement.classList.add('igx-overlay__wrapper--modal');
        }


        if (info.settings.positionStrategy.settings.openAnimation) {
            this.playOpenAnimation(info);
        } else {
            //  to eliminate flickering show the element just before onOpened fire
            info.elementRef.nativeElement.parentElement.style.visibility = '';
            this.onOpened.emit({ id: info.id, componentRef: info.componentRef });
        }
    }

    private _hide(id: string, event?: Event) {
        const info: OverlayInfo = this.getOverlayById(id);

        if (!info) {
            console.warn('igxOverlay.hide was called with wrong id: ' + id);
            return;
        }

        const eventArgs = { id, componentRef: info.componentRef, cancel: false, event };
        this.onClosing.emit(eventArgs);
        if (eventArgs.cancel) {
            return;
        }

        //  TODO: synchronize where these are added/attached and where removed/detached
        info.settings.scrollStrategy.detach();
        this.removeOutsideClickListener(info);
        this.removeResizeHandler();

        const child: HTMLElement = info.elementRef.nativeElement;
        if (info.settings.modal) {
            const parent = child.parentNode.parentNode as HTMLElement;
            this.applyAnimationParams(parent, info.settings.positionStrategy.settings.closeAnimation);
            parent.classList.remove('igx-overlay__wrapper--modal');
            parent.classList.add('igx-overlay__wrapper');
        }

        if (info.settings.positionStrategy.settings.closeAnimation) {
            this.playCloseAnimation(info, event);
        } else {
            this.onCloseDone(info, event);
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
        element.parentElement.insertBefore(hook, element);
        return hook;
    }

    private moveElementToOverlay(info: OverlayInfo) {
        const wrapperElement = this.getWrapperElement();
        const contentElement = this.getContentElement(wrapperElement, info.settings.modal);
        this.getOverlayElement(info).appendChild(wrapperElement);
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
        content.style.visibility = 'hidden';

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
            info.initialSize = info.elementRef.nativeElement.getBoundingClientRect();
        }

        // set content div width only if element to show has width
        if (info.initialSize.width !== 0) {
            info.elementRef.nativeElement.parentElement.style.width = info.initialSize.width + 'px';
        }
    }

    private onCloseDone(info: OverlayInfo, event?: Event) {
        this.cleanUp(info);
        this.onClosed.emit({ id: info.id, componentRef: info.componentRef, event});
    }

    private cleanUp(info: OverlayInfo) {
        const child: HTMLElement = info.elementRef.nativeElement;
        const outlet = this.getOverlayElement(info);
        if (!outlet.contains(child)) {
            console.warn('Component with id:' + info.id + ' is already removed!');
            return;
        }

        outlet.removeChild(child.parentNode.parentNode);
        if (info.componentRef) {
            this._appRef.detachView(info.componentRef.hostView);
            info.componentRef.destroy();
        }

        if (info.hook) {
            info.hook.parentElement.insertBefore(info.elementRef.nativeElement, info.hook);
            info.hook.parentElement.removeChild(info.hook);
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
    }

    private playOpenAnimation(info: OverlayInfo) {
        if (!info.openAnimationPlayer) {
            const animationBuilder = this.builder.build(info.settings.positionStrategy.settings.openAnimation);
            info.openAnimationPlayer = animationBuilder.create(info.elementRef.nativeElement);

            //  AnimationPlayer.getPosition returns always 0. To workaround this we are getting inner WebAnimationPlayer
            //  and then getting the positions from it.
            //  This is logged in Angular here - https://github.com/angular/angular/issues/18891
            //  As soon as this is resolved we can remove this hack
            const innerRenderer = (info.openAnimationPlayer as any)._renderer;
            info.openAnimationInnerPlayer = innerRenderer.engine.players[innerRenderer.engine.players.length - 1];
            info.openAnimationPlayer.onDone(() => {
                this.onOpened.emit({ id: info.id, componentRef: info.componentRef });
                if (info.openAnimationPlayer) {
                    info.openAnimationPlayer.reset();
                    info.openAnimationPlayer = null;
                }

                if (info.closeAnimationPlayer && info.closeAnimationPlayer.hasStarted()) {
                    info.closeAnimationPlayer.reset();
                }
            });
        }

        //  if there is opening animation already started do nothing
        if (info.openAnimationPlayer.hasStarted()) {
            return;
        }

        //  if there is closing animation already started start open animation from where close one has reached
        //  and remove close animation
        if (info.closeAnimationPlayer && info.closeAnimationPlayer.hasStarted()) {
            //  getPosition() returns what part of the animation is passed, e.g. 0.5 if half the animation
            //  is done, 0.75 if 3/4 of the animation is done. As we need to start next animation from where
            //  the previous has finished we need the amount up to 1, therefore we are subtracting what
            //  getPosition() returns from one
            const position = 1 - info.closeAnimationInnerPlayer.getPosition();
            info.closeAnimationPlayer.reset();
            info.closeAnimationPlayer = null;
            info.openAnimationPlayer.init();
            info.openAnimationPlayer.setPosition(position);
        }

        this.onAnimation.emit({ id: info.id, animationPlayer: info.openAnimationPlayer, animationType: 'open' });

        //  to eliminate flickering show the element just before animation start
        info.elementRef.nativeElement.parentElement.style.visibility = '';
        info.openAnimationPlayer.play();
    }

    private playCloseAnimation(info: OverlayInfo, ev?: Event) {
        if (!info.closeAnimationPlayer) {
            const animationBuilder = this.builder.build(info.settings.positionStrategy.settings.closeAnimation);
            info.closeAnimationPlayer = animationBuilder.create(info.elementRef.nativeElement);

            //  AnimationPlayer.getPosition returns always 0. To workaround this we are getting inner WebAnimationPlayer
            //  and then getting the positions from it.
            //  This is logged in Angular here - https://github.com/angular/angular/issues/18891
            //  As soon as this is resolved we can remove this hack
            const innerRenderer = (info.closeAnimationPlayer as any)._renderer;
            info.closeAnimationInnerPlayer = innerRenderer.engine.players[innerRenderer.engine.players.length - 1];

            info.closeAnimationPlayer.onDone(() => {
                if (info.closeAnimationPlayer) {
                    info.closeAnimationPlayer.reset();
                    info.closeAnimationPlayer = null;
                }

                if (info.openAnimationPlayer && info.openAnimationPlayer.hasStarted()) {
                    info.openAnimationPlayer.reset();
                }
                this.onCloseDone(info, ev);
            });
        }

        //  if there is closing animation already started do nothing
        if (info.closeAnimationPlayer.hasStarted()) {
            return;
        }

        //  if there is opening animation already started start close animation from where open one has reached
        //  and remove open animation
        if (info.openAnimationPlayer && info.openAnimationPlayer.hasStarted()) {
            //  getPosition() returns what part of the animation is passed, e.g. 0.5 if half the animation
            //  is done, 0.75 if 3/4 of the animation is done. As we need to start next animation from where
            //  the previous has finished we need the amount up to 1, therefore we are subtracting what
            //  getPosition() returns from one
            const position = 1 - info.openAnimationInnerPlayer.getPosition();
            info.openAnimationPlayer.reset();
            info.openAnimationPlayer = null;
            info.closeAnimationPlayer.init();
            info.closeAnimationPlayer.setPosition(position);
        }

        this.onAnimation.emit({ id: info.id, animationPlayer: info.closeAnimationPlayer, animationType: 'close' });
        info.closeAnimationPlayer.play();
    }

    //  TODO: check if applyAnimationParams will work with complex animations
    private applyAnimationParams(wrapperElement: HTMLElement, animationOptions: AnimationReferenceMetadata) {
        if (!animationOptions) {
            wrapperElement.style.transitionDuration = '0ms';
            return;
        }
        if (animationOptions.type === AnimationMetadataType.AnimateRef) {
            animationOptions = (animationOptions as AnimationAnimateRefMetadata).animation;
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
                const targetOverlay = this._overlayInfos[this._overlayInfos.length - 1];
                if (targetOverlay.settings.closeOnEscape) {
                    this.hide(targetOverlay.id, ev);
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
}
