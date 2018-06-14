import { DOCUMENT } from '@angular/common';
import { IPositionStrategy } from './position/IPositionStrategy';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import { PositionSettings, Point, OverlaySettings } from './utilities';

import {
    ApplicationRef,
    ComponentFactory,
    ComponentFactoryResolver,
    ElementRef,
    Inject,
    Injectable,
    Injector,
    ComponentRef
} from '@angular/core';
import { ScrollStrategyFactory } from './scroll/ScrollStrategyFactory';

@Injectable({ providedIn: 'root' })
export class IgxOverlayService {
    private _componentId = 0;
    private _elements: {
        id: string,
        elementRef: ElementRef,
        componentRef: ComponentRef<{}>,
        size: { width: number, height: number }
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
        id = this.getId(id);
        overlaySettings = overlaySettings ? overlaySettings : new OverlaySettings();
        // get the element for both static and dynamic components
        const element = this.getElement(component, id);

        const wrapperElement = this.getWrapperElement(overlaySettings);
        const contentElement = this.getContentElement(wrapperElement);
        contentElement.appendChild(element);
        this.OverlayElement.appendChild(wrapperElement);

        const positionStrategy = this.getPositionStrategy(overlaySettings.positionStrategy);
        positionStrategy.position(element, contentElement, this._elements.find(e => e.id === id).size, document);

        return this._elements[this._elements.length - 1].id;
    }

    hide(id: string) {
        // TODO: cleanup
        const children = this.OverlayElement.childNodes;

        const itemToHide = this._elements.find(element => element.id === id);
        if (!itemToHide) {
            console.warn('igxOverlay.hide was called with wrong id: ' + id);
        }

        const child: HTMLElement = itemToHide.elementRef.nativeElement;
        this.OverlayElement.removeChild(child.parentNode.parentNode);
    }

    hideAll() {
        while (this._elements.length > 0) {
            this.hide(this._elements[this._elements.length - 1].id);
        }
    }

    private getId(id?: string) {
        return id ? id : (this._componentId++).toString();
    }

    private getElement(component: any, id: string): HTMLElement {
        let element: HTMLElement;

        if (this._elements.find(e => e.id === id)) {
            return this._elements.find(e => e.id === id).elementRef.nativeElement;
        }

        if (component instanceof ElementRef) {
            element = component.nativeElement;
            this._elements.push({ id: id, elementRef: <ElementRef>component, componentRef: null, size: element.getBoundingClientRect() });
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

        this._elements.push({ id: id, elementRef: dc.location, componentRef: dc, size: element.getBoundingClientRect() });
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

    private getWrapperElement(overlaySettings?: OverlaySettings): HTMLElement {
        const wrapper = this._document.createElement('div');

        if (overlaySettings.modal) {
            wrapper.classList.add('igx-overlay__wrapper');
        } else {
            wrapper.classList.add('igx-overlay__wrapper--no-modal');
        }
        return wrapper;
    }

    private getContentElement(wrapperElement: HTMLElement): HTMLElement {
        const content = this._document.createElement('div');
        if (wrapperElement.classList.contains('igx-overlay__wrapper--no-modal')) {
            content.classList.add('igx-overlay__content--no-modal');
        } else {
            content.classList.add('igx-overlay__content');
        }
        wrapperElement.appendChild(content);
        return content;
    }
}
