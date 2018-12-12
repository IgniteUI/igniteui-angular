import { DOCUMENT } from '@angular/common';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import { NoOpScrollStrategy } from './scroll/NoOpScrollStrategy';
import { OverlaySettings, OverlayEventArgs, OverlayInfo, OverlayAnimationEventArgs, OverlayCancelableEventArgs } from './utilities';

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
    public onClosing = new EventEmitter<OverlayCancelableEventArgs>();

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

        const eventArgs = { id, componentRef: info.componentRef, cancel: false };
        this.onOpening.emit(eventArgs);
        if (eventArgs.cancel) {
            if (info.componentRef) {
                this._appRef.detachView(info.componentRef.hostView);
                info.componentRef.destroy();
            }
            return id;
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
            this._overlayInfos.push(info);

            settings.positionStrategy.position(info.elementRef.nativeElement.parentElement, info.initialSize, document, true);
            settings.scrollStrategy.initialize(this._document, this, id);
            settings.scrollStrategy.attach();
        }

        this.addOutsideClickListener(info);
        this.addResizeHandler(info.id);

        if (info.settings.modal) {
            this.setupModalWrapper(info);
        }

        if (info.settings.positionStrategy.settings.openAnimation) {
            this.playOpenAnimation(info);
        } else {
            this.onOpened.emit({ id: info.id, componentRef: info.componentRef });
        }

        return id;
    }

    /**
     * Hides the component with the ID provided as a parameter.
     * ```typescript
     * this.overlay.hide(id);
     * ```
     */
    hide(id: string) {
        const info: OverlayInfo = this.getOverlayById(id);

        if (!info) {
            console.warn('igxOverlay.hide was called with wrong id: ' + id);
            return;
        }

        const eventArgs = { id, componentRef: info.componentRef, cancel: false };
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
        const overlay = this.getOverlayById(id);
        if (!overlay) {
            console.error('Wrong id provided in overlay.reposition method. Id: ' + id);
            return;
        }

        overlay.settings.positionStrategy.position(
            overlay.elementRef.nativeElement.parentElement,
            overlay.initialSize,
            this._document);
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
        const contentElement = this.getContentElement(wrapperElement, info.settings);
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

    private getContentElement(wrapperElement: HTMLElement, settings: OverlaySettings): HTMLElement {
        const content: HTMLElement = this._document.createElement('div');
        if (settings.modal) {
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

        // set content div size only if element to show has size
        if (info.initialSize.width !== 0 && info.initialSize.height !== 0) {
            info.elementRef.nativeElement.parentElement.style.width = info.initialSize.width + 'px';
            info.elementRef.nativeElement.parentElement.style.height = info.initialSize.height + 'px';
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

        this.onClosed.emit({ id: info.id, componentRef: info.componentRef });
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
        for (let i = this._overlayInfos.length; i--;) {
            const info = this._overlayInfos[i];
            if (info.settings.modal) {
                return;
            }
            if (info.settings.closeOnOutsideClick) {
                if (!info.elementRef.nativeElement.contains(ev.target)) {
                    this.hide(info.id);
                    // TODO: should we return here too and not closing all no-modal overlays?
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

    private repositionAll = (ev: Event) => {
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
