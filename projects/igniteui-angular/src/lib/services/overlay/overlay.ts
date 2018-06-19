import { DOCUMENT } from '@angular/common';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import { NoOpScrollStrategy } from './scroll/NoOpScrollStrategy';
import { OverlaySettings } from './utilities';

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
    OnDestroy
} from '@angular/core';
import { AnimationBuilder } from '@angular/animations';

@Injectable({ providedIn: 'root' })
export class IgxOverlayService implements OnDestroy {
    private _componentId = 0;
    private _overlays: {
        id: string,
        elementRef: ElementRef,
        componentRef: ComponentRef<{}>,
        size: { width: number, height: number },
        settings: OverlaySettings
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

    public onOpened = new EventEmitter();
    public onOpening = new EventEmitter();
    public onClosed = new EventEmitter();
    public onClosing = new EventEmitter();

    constructor(
        private _factoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector,
        private builder: AnimationBuilder,
        @Inject(DOCUMENT) private _document: any) { }

    show(component, id?: string, overlaySettings?: OverlaySettings): string {
        this.onOpening.emit();

        id = this.getId(id);
        overlaySettings = Object.assign({}, this._defaultSettings, overlaySettings);

        // get the element for both static and dynamic components
        const element = this.getElement(component, id, overlaySettings);

        const wrapperElement = this.getWrapperElement(overlaySettings, id);
        const contentElement = this.getContentElement(wrapperElement, overlaySettings);
        if (overlaySettings.closeOnOutsideClick) {
            this.addBackDropElement(wrapperElement, id);
        }
        contentElement.appendChild(element);
        this.OverlayElement.appendChild(wrapperElement);

        overlaySettings.positionStrategy.position(contentElement, this._overlays.find(e => e.id === id).size, document);
        const animationBuilder = this.builder.build(overlaySettings.positionStrategy.settings.openAnimation);
        const animationPlayer = animationBuilder.create(element);
        animationPlayer.onDone(() => {
            this.onOpened.emit();
        });

        animationPlayer.play();

        overlaySettings.scrollStrategy.initialize(this._document, this, id);
        overlaySettings.scrollStrategy.attach();

        return this._overlays[this._overlays.length - 1].id;
    }

    hide(id: string) {
        this.onClosing.emit();

        const overlay = this.getOverlayById(id);
        if (!overlay) {
            console.warn('igxOverlay.hide was called with wrong id: ' + id);
        }

        overlay.settings.scrollStrategy.detach();

        const animationBuilder = this.builder.build(overlay.settings.positionStrategy.settings.closeAnimation);
        const animationPlayer = animationBuilder.create(overlay.elementRef.nativeElement);
        animationPlayer.onDone(() => {
            const child: HTMLElement = overlay.elementRef.nativeElement;
            if (!this.OverlayElement.contains(child)) {
                console.error('Component with id:' + id + 'is already removed!');
                return;
            }

            this.OverlayElement.removeChild(child.parentNode.parentNode);
            this.onClosed.emit();
        });

        animationPlayer.play();
    }

    hideAll() {
        while (this._overlays.length > 0) {
            this.hide(this._overlays[this._overlays.length - 1].id);
        }
    }

    reposition(id: string) {
        const overlay = this.getOverlayById(id);
        if (!overlay) {
            console.error('Wrong id provided in overlay.reposition method. Id: ' + id);
        }

        overlay.settings.positionStrategy.position(
            overlay.elementRef.nativeElement.parentElement,
            overlay.size,
            this._document);
    }

    ngOnDestroy(): void {
        this._componentId = 0;
        this._overlays = [];
        if (this._overlayElement) {
            this._overlayElement.parentElement.removeChild(this._overlayElement);
            this._overlayElement = null;
        }
    }

    private getId(id?: string) {
        return id ? id : (this._componentId++).toString();
    }

    private getElement(component: any, id: string, overlaySettings: OverlaySettings): HTMLElement {
        let element: HTMLElement;

        if (this._overlays.find(e => e.id === id)) {
            return this._overlays.find(e => e.id === id).elementRef.nativeElement;
        }

        if (component instanceof ElementRef) {
            element = component.nativeElement;
            this._overlays.push({
                id: id,
                elementRef: <ElementRef>component,
                componentRef: null,
                size: element.getBoundingClientRect(),
                settings: overlaySettings
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

        const dc: ComponentRef<{}> = dynamicFactory.create(this._injector);

        // If the element is newly created from a Component, it is wrapped in 'ng-component' tag - we do not want that.
        element = dc.location.nativeElement.lastElementChild;
        this._appRef.attachView(dc.hostView);

        this._overlays.push({
            id: id,
            elementRef: dc.location,
            componentRef: dc,
            size: element.getBoundingClientRect(),
            settings: overlaySettings
        });
        return element;
    }

    private getOverlayById(id: string) {
        const overlay = this._overlays.find(e => e.id === id);
        return overlay;
    }

    private getWrapperElement(overlaySettings: OverlaySettings, id: string): HTMLElement {
        const wrapper: HTMLElement = this._document.createElement('div');
        if (overlaySettings.modal) {
            wrapper.classList.add('igx-overlay__wrapper');
        } else {
            wrapper.classList.add('igx-overlay__wrapper--no-modal');
        }
        return wrapper;
    }

    private getContentElement(wrapperElement: HTMLElement, overlaySettings: OverlaySettings): HTMLElement {
        const content: HTMLElement = this._document.createElement('div');
        if (overlaySettings.modal) {
            content.classList.add('igx-overlay__content');
        } else {
            content.classList.add('igx-overlay__content--no-modal');
        }

        if (overlaySettings.closeOnOutsideClick) {
            content.addEventListener('click', (ev) => ev.stopPropagation());
        }
        wrapperElement.appendChild(content);
        return content;
    }

    private addBackDropElement(wrapperElement: HTMLElement, id: string) {
        const backDrop: HTMLElement = this._document.createElement('div');
        backDrop.classList.add('igx-overlay__back-drop');
        backDrop.addEventListener('click', () => this.hide(id), { once: true });
        wrapperElement.appendChild(backDrop);
    }
}
