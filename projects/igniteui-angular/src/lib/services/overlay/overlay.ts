import { DOCUMENT } from '@angular/common';
import { IPositionStrategy } from './position/IPositionStrategy';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import { PositionSettings, Point, OverlaySettings } from './utilities';

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
import { ScrollStrategyFactory } from './scroll/ScrollStrategyFactory';

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
        @Inject(DOCUMENT) private _document: any,
        @Inject(ScrollStrategyFactory) private scrollFactory: ScrollStrategyFactory) { }

    /**
     * Attaches provided component's native element to the OverlayElement

    * @param component Component to show in the overlay
    */

    // TODO: pass component, id? and OverlaySettings?
    show(component, id?: string, overlaySettings?: OverlaySettings): string {
        this.onOpening.emit();

        id = this.getId(id);

        overlaySettings = overlaySettings ? overlaySettings : new OverlaySettings();

        // get the element for both static and dynamic components
        const element = this.getElement(component, id, overlaySettings);

        const wrapperElement = this.getWrapperElement(overlaySettings, id);
        const contentElement = this.getContentElement(wrapperElement, overlaySettings, id);
        contentElement.appendChild(element);
        this.OverlayElement.appendChild(wrapperElement);

        const positionStrategy = this.getPositionStrategy(overlaySettings.positionStrategy);
        positionStrategy.position(element, contentElement, this._elements.find(e => e.id === id).size);

        if (overlaySettings.scrollStrategy) {
            overlaySettings.scrollStrategy.attach();
        }

        this.onOpened.emit();
        return this._elements[this._elements.length - 1].id;
    }

    hide(id: string) {
        // TODO: cleanup
        this.onClosing.emit();

        const element = this._elements.find(e => e.id === id);
        if (!element) {
            console.warn('igxOverlay.hide was called with wrong id: ' + id);
        }

        const scrollStrategy = element.settings.scrollStrategy;
        if (scrollStrategy) {
            scrollStrategy.detach();
        }

        const child: HTMLElement = element.elementRef.nativeElement;
        if (!this.OverlayElement.contains(child)) {
            console.error('Component with id:' + id + 'is already removed!');
            return;
        }

        this.OverlayElement.removeChild(child.parentNode.parentNode);
        this.onClosed.emit();
    }

    hideAll() {
        while (this._elements.length > 0) {
            this.hide(this._elements[this._elements.length - 1].id);
        }
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

        element = dc.location.nativeElement;
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

    private getPositionStrategy(positionStrategy?: IPositionStrategy): IPositionStrategy {
        positionStrategy = positionStrategy ? positionStrategy : new GlobalPositionStrategy();
        if (positionStrategy._settings && positionStrategy._settings.element) {
            const elementRect = positionStrategy._settings.element.getBoundingClientRect();
            const x = elementRect.right + elementRect.width * positionStrategy._settings.horizontalStartPoint;
            const y = elementRect.bottom + elementRect.height * positionStrategy._settings.verticalStartPoint;
            positionStrategy._settings.point = new Point(x, y);
        }

        positionStrategy._settings = positionStrategy._settings ? positionStrategy._settings : new PositionSettings();
        return positionStrategy;
    }

    private getWrapperElement(overlaySettings: OverlaySettings, id: string): HTMLElement {
        const wrapper: HTMLElement = this._document.createElement('div');
        if (overlaySettings.modal) {
            wrapper.classList.add('igx-overlay__wrapper');
        } else {
            wrapper.classList.add('igx-overlay__wrapper--no-modal');
        }

        if (overlaySettings.closeOnOutsideClick) {
            wrapper.addEventListener('click', (ev) => this.hide(id), { once: true });
        }
        return wrapper;
    }

    private getContentElement(wrapperElement: HTMLElement, overlaySettings: OverlaySettings, id: string): HTMLElement {
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
