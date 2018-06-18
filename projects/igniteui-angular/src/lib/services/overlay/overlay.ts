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
    Injector
} from '@angular/core';
import { AnimationBuilder } from '@angular/animations';

@Injectable({ providedIn: 'root' })
export class IgxOverlayService {
    private _componentId = 0;
    private _elements: {
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

    /**
     * Creates, sets up, and return a DIV HTMLElement attached to document's body
     */
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

    /**
     * Create, set up, and return a DIV HTMLElement wrapper around the component. Attach it to overlay div element.
     */
    constructor(
        private _factoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector,
        private builder: AnimationBuilder,
        @Inject(DOCUMENT) private _document: any) { }

    /**
     * Attaches provided component's native element to the OverlayElement

    * @param component Component to show in the overlay
    */

    // TODO: pass component, id? and OverlaySettings?
    show(component, id?: string, overlaySettings?: OverlaySettings): string {
        this.onOpening.emit();

        id = this.getId(id);
        overlaySettings = Object.assign(this._defaultSettings, overlaySettings);

        // get the element for both static and dynamic components
        const element = this.getElement(component, id, overlaySettings);

        const wrapperElement = this.getWrapperElement(overlaySettings, id);
        const contentElement = this.getContentElement(wrapperElement, overlaySettings);
        contentElement.appendChild(element);
        this.OverlayElement.appendChild(wrapperElement);

        overlaySettings.positionStrategy.position(element, contentElement, this._elements.find(e => e.id === id).size, document);
        const animation = this.builder.build(overlaySettings.positionStrategy.settings.openAnimation);
        const player = animation.create(element);
        player.onDone(() => {
            this.onOpened.emit();
        });

        player.play();

        overlaySettings.scrollStrategy.initialize(this._document, this, id);
        overlaySettings.scrollStrategy.attach();

        return this._elements[this._elements.length - 1].id;
    }

    hide(id: string) {
        // TODO: cleanup
        this.onClosing.emit();

        const element = this.getElementById(id);
        if (!element) {
            console.warn('igxOverlay.hide was called with wrong id: ' + id);
        }

        element.settings.scrollStrategy.detach();

        const child: HTMLElement = element.elementRef.nativeElement;
        if (!this.OverlayElement.contains(child)) {
            console.error('Component with id:' + id + 'is already removed!');
            return;
        }

        const animation = this.builder.build(element.settings.positionStrategy.settings.closeAnimation);
        const player = animation.create(element.elementRef.nativeElement);
        player.onDone(() => {
            this.OverlayElement.removeChild(child.parentNode.parentNode);
            this.onClosed.emit();
        });

        player.play();
    }

    hideAll() {
        while (this._elements.length > 0) {
            this.hide(this._elements[this._elements.length - 1].id);
        }
    }

    getElementById(id: string) {
        const element = this._elements.find(e => e.id === id);
        return element;
    }

    private getId(id?: string) {
        return id ? id : (this._componentId++).toString();
    }

    private getElement(component: any, id: string, overlaySettings: OverlaySettings): HTMLElement {
        let element: HTMLElement;

        if (this._elements.find(e => e.id === id)) {
            return this._elements.find(e => e.id === id).elementRef.nativeElement;
        }

        if (component instanceof ElementRef) {
            element = component.nativeElement;
            this._elements.push({
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

        this._elements.push({
            id: id,
            elementRef: dc.location,
            componentRef: dc,
            size: element.getBoundingClientRect(),
            settings: overlaySettings
        });
        return element;
    }

    private getWrapperElement(overlaySettings: OverlaySettings, id: string): HTMLElement {
        const wrapper: HTMLElement = this._document.createElement('div');
        if (overlaySettings.modal) {
            wrapper.classList.add('igx-overlay__wrapper');
        } else {
            wrapper.classList.add('igx-overlay__wrapper--no-modal');
        }

        if (overlaySettings.closeOnOutsideClick) {
            wrapper.addEventListener('click', () => this.hide(id), { once: true });
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
}
