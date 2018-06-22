import { DOCUMENT } from '@angular/common';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import { NoOpScrollStrategy } from './scroll/NoOpScrollStrategy';
import { OverlaySettings, OverlayEventArgs } from './utilities';

import {
    ApplicationRef,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    EventEmitter,
    Inject,
    Injectable,
    Injector
} from '@angular/core';
import { AnimationBuilder, AnimationReferenceMetadata } from '@angular/animations';
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';
import { IAnimationParams } from '../../animations/main';

@Injectable({ providedIn: 'root' })
export class IgxOverlayService {
    private _componentId = 0;
    private _overlays: {
        id: string,
        elementRef: ElementRef,
        componentRef: ComponentRef<{}>,
        settings: OverlaySettings,
        initialSize: { width?: number, height?: number, x?: number, y?: number },
        hook: HTMLElement
    }[] = [];
    private _overlayElement: HTMLElement;

    private _defaultSettings: OverlaySettings = {
        positionStrategy: new GlobalPositionStrategy(),
        scrollStrategy: new NoOpScrollStrategy(),
        modal: true,
        closeOnOutsideClick: true
    };

    private get OverlayElement(): HTMLElement {
        if (!this._overlayElement) {
            this._overlayElement = this._document.createElement('div');
            this._overlayElement.classList.add('igx-overlay');
            this._document.body.appendChild(this._overlayElement);
        }

        return this._overlayElement;
    }

    public onOpening = new EventEmitter<OverlayEventArgs>();
    public onOpened = new EventEmitter<OverlayEventArgs>();
    public onClosing = new EventEmitter<OverlayEventArgs>();
    public onClosed = new EventEmitter<OverlayEventArgs>();

    constructor(
        private _factoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector,
        private builder: AnimationBuilder,
        @Inject(DOCUMENT) private _document: any) { }

    show(component, overlaySettings?: OverlaySettings): string {
        const id: string = (this._componentId++).toString();
        overlaySettings = Object.assign({}, this._defaultSettings, overlaySettings);

        // get the element for both static and dynamic components
        const element = this.getElement(component, id, overlaySettings);
        const componentRef = this._overlays.find(c => c.id === id).componentRef;

        this.onOpening.emit({ id, componentRef });

        let size = element.getBoundingClientRect();

        const wrapperElement = this.getWrapperElement(overlaySettings, id);
        const contentElement = this.getContentElement(wrapperElement, overlaySettings);
        this.OverlayElement.appendChild(wrapperElement);
        const elementScrollTop = element.scrollTop;
        contentElement.appendChild(element);
        element.scrollTop = elementScrollTop;

        if (componentRef) {
            //  if we are positioning component this is first time it gets visible
            //  and we can finally get its size
            size = element.getBoundingClientRect();
        }

        this._overlays.find(c => c.id === id).initialSize = size as DOMRect;
        overlaySettings.positionStrategy.position(contentElement, size, document, true);
        const animationBuilder = this.builder.build(overlaySettings.positionStrategy.settings.openAnimation);
        const animationPlayer = animationBuilder.create(element);

        if (overlaySettings.modal) {
            wrapperElement.classList.remove('igx-overlay__wrapper');
            this.applyAnimationParams(wrapperElement, overlaySettings.positionStrategy.settings.openAnimation);
            wrapperElement.classList.add('igx-overlay__wrapper--modal');
        }

        animationPlayer.onDone(() => {
            this.onOpened.emit({ id, componentRef });
            if (overlaySettings.closeOnOutsideClick) {
                if (overlaySettings.modal) {
                    fromEvent(wrapperElement, 'click').pipe(take(1)).subscribe(() => this.hide(id));
                    wrapperElement.addEventListener('keydown', (ev: KeyboardEvent) => {
                        if (ev.key === 'Escape') {
                            this.hide(id);
                        }
                    });
                } else {
                    fromEvent(this._document, 'click').pipe(take(1)).subscribe(() => this.hide(id));
                }
            }
            animationPlayer.reset();
        });

        animationPlayer.play();

        overlaySettings.scrollStrategy.initialize(this._document, this, id);
        overlaySettings.scrollStrategy.attach();

        return this._overlays[this._overlays.length - 1].id;
    }

    private applyAnimationParams(wrapperElement: HTMLElement, animationOptions: AnimationReferenceMetadata) {
        if (!animationOptions || !animationOptions.options || !animationOptions.options.params) {
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

    hide(id: string) {
        const overlay = this.getOverlayById(id);
        if (!overlay) {
            console.warn('igxOverlay.hide was called with wrong id: ' + id);
            return;
        }

        const componentRef = overlay.componentRef;
        this.onClosing.emit({ id, componentRef });
        overlay.settings.scrollStrategy.detach();
        const animationBuilder = this.builder.build(overlay.settings.positionStrategy.settings.closeAnimation);
        const animationPlayer = animationBuilder.create(overlay.elementRef.nativeElement);
        const child: HTMLElement = overlay.elementRef.nativeElement;

        if (overlay.settings.modal) {
            const parent = child.parentNode.parentNode as HTMLElement;
            parent.classList.remove('igx-overlay__wrapper--modal');
            parent.classList.add('igx-overlay__wrapper');
        }
        animationPlayer.onDone(() => {
            animationPlayer.reset();
            if (!this.OverlayElement.contains(child)) {
                console.warn('Component with id:' + id + ' is already removed!');
                return;
            }

            this.OverlayElement.removeChild(child.parentNode.parentNode);
            if (overlay.componentRef) {
                this._appRef.detachView(overlay.componentRef.hostView);
                overlay.componentRef.destroy();
            }

            overlay.hook.parentElement.insertBefore(overlay.elementRef.nativeElement, overlay.hook);
            overlay.hook.parentElement.removeChild(overlay.hook);

            const index = this._overlays.indexOf(overlay);
            this._overlays.splice(index, 1);
            if (this._overlays.length === 0) {
                this._overlayElement.parentElement.removeChild(this._overlayElement);
                this._overlayElement = null;
            }
            this.onClosed.emit({ id, componentRef });
        });

        animationPlayer.play();
    }

    hideAll() {
        // since overlays are removed on animation done, que all hides
        for (let i = this._overlays.length; i--;) {
            this.hide(this._overlays[i].id);
        }
    }

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

    private getElement(component: any, id: string, overlaySettings: OverlaySettings): HTMLElement {
        let element: HTMLElement;
        const hook = this._document.createElement('div');
        if (this._overlays.find(e => e.id === id)) {
            return this._overlays.find(e => e.id === id).elementRef.nativeElement;
        }

        hook.id = 'overlay-' + id + '-hook';
        if (component instanceof ElementRef) {
            element = component.nativeElement;
            element.parentElement.insertBefore(hook, element);
            this._overlays.push({
                id: id,
                elementRef: <ElementRef>component,
                componentRef: null,
                settings: overlaySettings,
                initialSize: {
                    width: 0,
                    height: 0
                },
                hook
            });
            return element;
        }

        let dynamicFactory: ComponentFactory<{}>;
        try {
            dynamicFactory = this._factoryResolver.resolveComponentFactory(component);
        } catch (error) {
            console.error(error);
            return null;
        }

        const dynamicComponent: ComponentRef<{}> = dynamicFactory.create(this._injector);

        // If the element is newly created from a Component, it is wrapped in 'ng-component' tag - we do not want that.
        element = dynamicComponent.location.nativeElement.lastElementChild;
        element.parentElement.insertBefore(hook, element);
        this._appRef.attachView(dynamicComponent.hostView);

        this._overlays.push({
            id: id,
            elementRef: <ElementRef>{ nativeElement: element },
            componentRef: dynamicComponent,
            settings: overlaySettings,
            initialSize: {
                width: 0,
                height: 0
            },
            hook
        });
        return element;
    }

    private getOverlayById(id: string) {
        const overlay = this._overlays.find(e => e.id === id);
        return overlay;
    }

    private getWrapperElement(overlaySettings: OverlaySettings, id: string): HTMLElement {
        const wrapper: HTMLElement = this._document.createElement('div');
        wrapper.classList.add('igx-overlay__wrapper');
        return wrapper;
    }

    private getContentElement(wrapperElement: HTMLElement, overlaySettings: OverlaySettings): HTMLElement {
        const content: HTMLElement = this._document.createElement('div');
        if (overlaySettings.modal) {
            content.classList.add('igx-overlay__content--modal');
        } else {
            content.classList.add('igx-overlay__content');
        }

        if (overlaySettings.closeOnOutsideClick) {
            content.addEventListener('click', (ev) => ev.stopPropagation());
        }
        wrapperElement.appendChild(content);
        return content;
    }
}
