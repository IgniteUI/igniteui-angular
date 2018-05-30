import { DOCUMENT } from '@angular/common';
import {
    ApplicationRef,
    ComponentFactory,
    ComponentFactoryResolver,
    ElementRef,
    Inject,
    Injectable,
    Injector
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IgxOverlayService {
    private _componentId = 0;
    private _elements = [];
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
            this._overlayElement.style.backgroundColor = 'rgba(0,0,0,0.63)';
            this._overlayElement.style.display = 'none';
            this._overlayElement.classList.add('overlay');
            this._document.body.appendChild(this._overlayElement);
        }

        return this._overlayElement;
    }

    constructor(
        private _factoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector,
        @Inject(DOCUMENT) private _document: any) { }

    /**
     * Attaches provided component's native element to the OverlayElement
     * @param component Component to show in the overlay
     */
    show(component, x?, y?): number {
        let element;
        if (component instanceof ElementRef) {
            element = component.nativeElement;
        } else {
            let dynamicFactory: ComponentFactory<{}>;
            try {
                dynamicFactory = this._factoryResolver.resolveComponentFactory(component);
            } catch (error) {
                console.log(error);
                return;
            }

            const dc = dynamicFactory.create(this._injector);
            this._appRef.attachView(dc.hostView);
            element = dc.location.nativeElement;
        }

        this.OverlayElement.style.display = 'block';
        this.OverlayElement.appendChild(element);
        return this._componentId++;
    }

    hide(id: number) {
        const children = this.OverlayElement.childNodes;
        if (children.length <= id) {
            throw new Error('There is no element with such index. Cannot remove the item from igxOverlay!');
        }

        const child = children[id];
        this.OverlayElement.removeChild(child);
        this._componentId--;

        if (children.length === 0) {
            this._overlayElement.style.display = 'none';
        }
    }

    hideAll() {
        while (this._componentId > 0) {
            this.hide(this._componentId - 1);
        }
    }

    private EraseMe(nativeElement, x?, y?) {
        // nativeElement.style.position = "fixed";
        // nativeElement.style.top = x ? x : "500px";
        // nativeElement.style.left = y ? y : "400px";
        // nativeElement.style.height = "300px";
        // nativeElement.style.width = "500px";
        // nativeElement.style.backgroundColor = "white";
        // nativeElement.style.overflowY = "auto";
    }
}
