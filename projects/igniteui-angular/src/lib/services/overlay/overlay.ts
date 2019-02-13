import { DOCUMENT } from '@angular/common';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import { NoOpScrollStrategy } from './scroll/NoOpScrollStrategy';
import {
    OverlaySettings,
    OverlayEventArgs,
    OverlayInfo,
    OverlayAnimationEventArgs,
    OverlayCancelableEventArgs,
    OverlayClosingEventArgs
} from './utilities';

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
    Type,
    OnDestroy
} from '@angular/core';
import { AnimationBuilder, AnimationReferenceMetadata, AnimationMetadataType, AnimationAnimateRefMetadata } from '@angular/animations';
import { fromEvent, Subject } from 'rxjs';
import { take, filter, takeUntil } from 'rxjs/operators';
import { IAnimationParams } from '../../animations/main';
import { ElasticPositionStrategy } from './position';
import { DeprecateMethod } from '../core/deprecateDecorators';

/**
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay_main.html)
 * The overlay service allows users to show components on overlay div above all other elements in the page.
 */
@Injectable({ providedIn: 'root' })
export class IgxOverlayService implements OnDestroy {
    private _componentId = 0;
    private _overlayInfos: OverlayInfo[] = [];
    private _overlayElement: HTMLElement;
    private _document: Document;
    private destroy$ = new Subject<boolean>();

    private _defaultSettings: OverlaySettings = {
        positionStrategy: new GlobalPositionStrategy(),
        scrollStrategy: new NoOpScrollStrategy(),
        modal: true,
        closeOnOutsideClick: true
    };

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

    constructor(
        private _factoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector,
        private builder: AnimationBuilder,
        @Inject(DOCUMENT) private document: any) {
        this._document = <Document>this.document;
    }

    /**
     * Generates Id. Provide this Id when call `show(id, settings?)` method
     * @param component ElementRef or Component Type to show in overlay
     * @returns Id of the created overlay. Valid until `onClosed` is emitted.
     */
    register(component: ElementRef | Type<{}>): string {
        let info: OverlayInfo;
        const id = (this._componentId++).toString();
        info = this.getOverlayInfo(component);

        //  if there is no info most probably wrong type component was provided and we just go out
        if (!info) {
            return null;
        }

        info.id = id;
        this._overlayInfos.push(info);
        return id;
    }

    /**
     * Shows the overlay for provided id.
     * @param id Id to show overlay for
     * @param settings Display settings for the overlay, such as positioning and scroll/close behavior.
     */
    show(id: string, settings?: OverlaySettings): string;
    /**
     * Shows the provided component.
     * @param component ElementRef or Component Type to show in overlay
     * @param settings Display settings for the overlay, such as positioning and scroll/close behavior.
     * @returns Id of the created overlay. Valid until `onClosed` is emitted.
     * ```typescript
     * this.overlay.show(element, settings);
     * ```
     */
    // tslint:disable-next-line:unified-signatures
    show(component: ElementRef | Type<{}>, settings?: OverlaySettings): string;
    // tslint:disable-next-line:max-line-length
    @DeprecateMethod('`show(component, settings?)` overload is deprecated. Use `register(component)` to obtain an Id. Then `show(id, settings?)` with provided Id.')
    show(compOrId: string | ElementRef | Type<{}>, settings?: OverlaySettings): string {
        let info: OverlayInfo;
        let id: string;
        if (typeof compOrId === 'string') {
            id = compOrId;
            info = this.getOverlayById(compOrId);
            if (!info) {
                console.warn('igxOverlay.show was called with wrong id: ' + compOrId);
                return;
            }
        } else {
            id = (this._componentId++).toString();
            info = this.getOverlayInfo(compOrId);

            //  if there is no info most probably wrong type component was provided and we just go out
            if (!info) {
                return;
            }

            info.id = id;
        }

        settings = Object.assign({}, this._defaultSettings, settings);
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
    hide(id: string) {
        this._hide(id);
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
        if (!overlayInfo) {
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
            false);
    }

    private _show(info: OverlayInfo) {
        const eventArgs = { id: info.id, componentRef: info.componentRef, cancel: false };
        this.onOpening.emit(eventArgs);
        if (eventArgs.cancel) {
            if (info.componentRef) {
                this._appRef.detachView(info.componentRef.hostView);
                info.componentRef.destroy();
            }
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
            this.updateSize(info);
            if (this._overlayInfos.indexOf(info) === -1) {
                this._overlayInfos.push(info);
            }

            info.settings.positionStrategy.position(
                info.elementRef.nativeElement.parentElement,
                { width: info.initialSize.width, height: info.initialSize.height },
                document,
                true);
            info.settings.scrollStrategy.initialize(this._document, this, info.id);
            info.settings.scrollStrategy.attach();
        }

        this.addOutsideClickListener(info);
        this.addResizeHandler(info.id);

        if (info.settings.modal) {
            this.setupModalWrapper(info);
        }

        if (info.settings.positionStrategy.settings.openAnimation) {
            this.playOpenAnimation(info);
        } else {
            //  to eliminate flickering show the element just before onOpened fire
            info.elementRef.nativeElement.parentElement.visibility = null;
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

        info.settings.scrollStrategy.detach();
        this.removeOutsideClickListener(info);
        this.removeResizeHandler(info.id);

        const child: HTMLElement = info.elementRef.nativeElement;
        if (info.settings.modal) {
            const parent = child.parentNode.parentNode as HTMLElement;
            this.applyAnimationParams(parent, info.settings.positionStrategy.settings.closeAnimation);
            parent.classList.remove('igx-overlay__wrapper--modal');
            parent.classList.add('igx-overlay__wrapper');
        }

        if (info.settings.positionStrategy.settings.closeAnimation) {
            this.playCloseAnimation(info);
        } else {
            this.onCloseDone(info);
        }
    }

    private getOverlayInfo(component: any): OverlayInfo {
        const info: OverlayInfo = {};
        if (component instanceof ElementRef) {
            info.elementRef = <ElementRef>component;
        } else {
            let dynamicFactory: ComponentFactory<{}>;
            try {
                dynamicFactory = this._factoryResolver.resolveComponentFactory(component);
            } catch (error) {
                console.error(error);
                return null;
            }

            const dynamicComponent: ComponentRef<{}> = dynamicFactory.create(this._injector);
            this._appRef.attachView(dynamicComponent.hostView);

            // If the element is newly created from a Component, it is wrapped in 'ng-component' tag - we do not want that.
            const element = dynamicComponent.location.nativeElement;
            info.elementRef = <ElementRef>{ nativeElement: element };
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
        const elementScrollTop = info.elementRef.nativeElement.scrollTop;
        contentElement.appendChild(info.elementRef.nativeElement);

        if (elementScrollTop) {
            info.elementRef.nativeElement.scrollTop = elementScrollTop;
        }
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
            return info.settings.outlet.nativeElement;
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

    private setupModalWrapper(info: OverlayInfo) {
        const wrapperElement = info.elementRef.nativeElement.parentElement.parentElement;
        fromEvent(wrapperElement, 'keydown').pipe(
            filter((ev: KeyboardEvent) => ev.key === 'Escape' || ev.key === 'Esc'),
            takeUntil(this.destroy$)
        ).subscribe(() => this.hide(info.id));
        wrapperElement.classList.remove('igx-overlay__wrapper');
        this.applyAnimationParams(wrapperElement, info.settings.positionStrategy.settings.openAnimation);
        wrapperElement.classList.add('igx-overlay__wrapper--modal');
    }

    private onCloseDone(info: OverlayInfo) {
        this.cleanUp(info);
        this.onClosed.emit({ id: info.id, componentRef: info.componentRef });
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
        if (this._overlayInfos.length === 0 && this._overlayElement && this._overlayElement.parentElement) {
            this._overlayElement.parentElement.removeChild(this._overlayElement);
            this._overlayElement = null;
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
            const innerRenderer = (<any>info.openAnimationPlayer)._renderer;
            info.openAnimationInnerPlayer = innerRenderer.engine.players[innerRenderer.engine.players.length - 1];
            info.openAnimationPlayer.onDone(() => {
                this.onOpened.emit({ id: info.id, componentRef: info.componentRef });
                info.openAnimationPlayer.reset();
                info.openAnimationPlayer = null;
                if (info.closeAnimationPlayer && info.closeAnimationPlayer.hasStarted()) {
                    info.closeAnimationPlayer.reset();
                }
            });
        }

        if (info.closeAnimationPlayer && info.closeAnimationPlayer.hasStarted()) {
            //  getPosition() returns what part of the animation is passed, e.g. 0.5 if half the animation
            //  is done, 0.75 if 3/4 of the animation is done. As we need to start next animation from where
            //  the previous has finished we need the amount up to 1, therefore we are subtracting what
            //  getPosition() returns from one
            const position = 1 - info.closeAnimationInnerPlayer.getPosition();
            info.closeAnimationPlayer.reset();
            info.openAnimationPlayer.init();
            info.openAnimationPlayer.setPosition(position);
        }

        this.onAnimation.emit({ id: info.id, animationPlayer: info.openAnimationPlayer, animationType: 'open' });

        //  to eliminate flickering show the element just before animation start
        info.elementRef.nativeElement.parentElement.style.visibility = null;
        info.openAnimationPlayer.play();
    }

    private playCloseAnimation(info: OverlayInfo) {
        if (!info.closeAnimationPlayer) {
            const animationBuilder = this.builder.build(info.settings.positionStrategy.settings.closeAnimation);
            info.closeAnimationPlayer = animationBuilder.create(info.elementRef.nativeElement);

            //  AnimationPlayer.getPosition returns always 0. To workaround this we are getting inner WebAnimationPlayer
            //  and then getting the positions from it.
            //  This is logged in Angular here - https://github.com/angular/angular/issues/18891
            //  As soon as this is resolved we can remove this hack
            const innerRenderer = (<any>info.closeAnimationPlayer)._renderer;
            info.closeAnimationInnerPlayer = innerRenderer.engine.players[innerRenderer.engine.players.length - 1];

            info.closeAnimationPlayer.onDone(() => {
                info.closeAnimationPlayer.reset();
                info.closeAnimationPlayer = null;
                if (info.openAnimationPlayer && info.openAnimationPlayer.hasStarted()) {
                    info.openAnimationPlayer.reset();
                }
                this.onCloseDone(info);
            });
        }

        if (info.openAnimationPlayer && info.openAnimationPlayer.hasStarted()) {
            //  getPosition() returns what part of the animation is passed, e.g. 0.5 if half the animation
            //  is done, 0.75 if 3/4 of the animation is done. As we need to start next animation from where
            //  the previous has finished we need the amount up to 1, therefore we are subtracting what
            //  getPosition() returns from one
            const position = 1 - info.openAnimationInnerPlayer.getPosition();
            info.openAnimationPlayer.reset();
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

    private getOverlayById(id: string): OverlayInfo {
        const overlay = this._overlayInfos.find(e => e.id === id);
        return overlay;
    }

    private documentClicked = (ev: Event) => {
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
                if (!info.elementRef.nativeElement.contains(ev.target)) {
                    this._hide(info.id, ev);
                } else {
                    return;
                }
            }
        }
    }

    private addOutsideClickListener(info: OverlayInfo) {
        if (info.settings.closeOnOutsideClick) {
            if (info.settings.modal) {
                fromEvent(info.elementRef.nativeElement.parentElement.parentElement, 'click')
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(() => this.hide(info.id));
            } else if (
                //  if all overlays minus closing overlays equals one add the handler
                this._overlayInfos.filter(x => x.settings.closeOnOutsideClick && !x.settings.modal).length -
                this._overlayInfos.filter(x => x.settings.closeOnOutsideClick && !x.settings.modal &&
                    x.closeAnimationPlayer &&
                    x.closeAnimationPlayer.hasStarted()).length === 1) {
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
                this._document.removeEventListener('click', this.documentClicked, true);
            }
        }
    }

    private addResizeHandler(id: string) {
        const closingOverlaysCount =
            this._overlayInfos
                .filter(o => o.closeAnimationPlayer && o.closeAnimationPlayer.hasStarted())
                .length;
        if (this._overlayInfos.length - closingOverlaysCount === 1) {
            this._document.defaultView.addEventListener('resize', this.repositionAll);
        }
    }

    private removeResizeHandler(id: string) {
        const closingOverlaysCount =
            this._overlayInfos
                .filter(o => o.closeAnimationPlayer && o.closeAnimationPlayer.hasStarted())
                .length;
        if (this._overlayInfos.length - closingOverlaysCount === 1) {
            this._document.defaultView.removeEventListener('resize', this.repositionAll);
        }
    }

    /** @hidden */
    public repositionAll = () => {
        for (let i = this._overlayInfos.length; i--;) {
            this.reposition(this._overlayInfos[i].id);
        }
    }

    /**
     *@hidden
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
