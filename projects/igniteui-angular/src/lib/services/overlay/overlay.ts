import { DOCUMENT } from '@angular/common';
import { IPositionStrategy } from './position/IPositionStrategy';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import { PositionSettings } from './utilities';

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

@Injectable({ providedIn: 'root' })
export class IgxOverlayService {
    private _componentId = 0;
    private _elements: { id: string, elementRef: ElementRef, componentRef: ComponentRef<{}> }[] = [];
    private _overlayElement: HTMLElement;

    /**
     * Creates, sets up, and return a DIV HTMLElement attached to document's body
     */
    private get OverlayElement(): HTMLElement {
        if (!this._overlayElement) {
            this._overlayElement = this._document.createElement('div');
            // this._overlayElement.addEventListener("click", (event) => {
            //     let lastChild: Node = this._overlayElement.lastChild;
            //     while (lastChild) {
            //         this._overlayElement.removeChild(lastChild);
            //         lastChild = this._overlayElement.lastChild;
            //     }

            //     this._overlayElement.style.display = "none";
            // });

            this._overlayElement.style.position = 'fixed';
            this._overlayElement.style.top = '0';
            this._overlayElement.style.left = '0';
            this._overlayElement.style.width = '100%';
            this._overlayElement.style.height = '100%';
            this._overlayElement.style.visibility = 'hidden';
            this._overlayElement.classList.add('overlay');
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
        @Inject(DOCUMENT) private _document: any) { }

    /**
     * Attaches provided component's native element to the OverlayElement
     * @param component Component to show in the overlay
     */
    show(component, id: string, positionStrategy?: IPositionStrategy): string {
        const element = this.getElement(component, id);

        const componentWrapper = this._document.createElement('div');
        componentWrapper.appendChild(element);

        positionStrategy = this.getPositionStrategy(positionStrategy);

        // Call the strategy to attach the needed css class.
        positionStrategy.position(element);

        this.OverlayElement.style.visibility = 'visible';
        this.OverlayElement.appendChild(componentWrapper);
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
        this.OverlayElement.removeChild(child.parentNode);

        if (children.length === 0) {
            this._overlayElement.style.visibility = 'hidden';
        }
    }

    hideAll() {
        while (this._elements.length > 0) {
            this.hide(this._elements[this._elements.length - 1].id);
        }
    }

    private getElement(component: any, id: string): HTMLElement {
        let element: HTMLElement;
        id = id ? id : (this._componentId++).toString();

        if (component instanceof ElementRef) {
            this._elements.push({ id: id, elementRef: <ElementRef>component, componentRef: null });
            element = component.nativeElement;
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
        this._elements.push({ id: id, elementRef: dc.location, componentRef: dc });
        this._appRef.attachView(dc.hostView);
        element = dc.location.nativeElement;
        return element;
    }

    private getPositionStrategy(positionStrategy: IPositionStrategy): IPositionStrategy {
        if (positionStrategy) {
            return positionStrategy;
        } else {
            return new GlobalPositionStrategy(this._document);
        }
    }
}
