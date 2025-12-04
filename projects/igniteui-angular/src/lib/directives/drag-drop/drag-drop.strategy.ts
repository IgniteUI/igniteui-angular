import { Renderer2 } from '@angular/core';
import { IgxDragDirective, IgxDropDirective } from './drag-drop.directive';


export interface IDropStrategy {
    dropAction: (drag: IgxDragDirective, drop: IgxDropDirective, atIndex: number) => void;
}

// @dynamic
export class IgxDefaultDropStrategy implements IDropStrategy {

    public dropAction(_drag: IgxDragDirective, _drop: IgxDropDirective, _atIndex: number) { }
}

// @dynamic
export class IgxAppendDropStrategy implements IDropStrategy {

    constructor(private _renderer: Renderer2) { }

    public dropAction(drag: IgxDragDirective, drop: IgxDropDirective, _atIndex: number) {
        const dragElement = drag.element.nativeElement;
        const dropAreaElement = drop.element.nativeElement;
        this._renderer.removeChild(dragElement.parentNode, dragElement);
        this._renderer.appendChild(dropAreaElement, dragElement);
    }
}

// @dynamic
export class IgxPrependDropStrategy implements IDropStrategy {

    constructor(private _renderer: Renderer2) { }

    public dropAction(drag: IgxDragDirective, drop: IgxDropDirective, _atIndex: number) {
        const dragElement = drag.element.nativeElement;
        const dropAreaElement = drop.element.nativeElement;
        this._renderer.removeChild(dragElement.parentNode, dragElement);
        if (dropAreaElement.children.length) {
            this._renderer.insertBefore(dropAreaElement, dragElement, dropAreaElement.children[0]);
        } else {
            this._renderer.appendChild(dropAreaElement, dragElement);
        }
    }
}

// @dynamic
export class IgxInsertDropStrategy implements IDropStrategy {

    constructor(private _renderer: Renderer2) { }

    public dropAction(drag: IgxDragDirective, drop: IgxDropDirective, atIndex: number) {
        if (drag.element.nativeElement.parentElement === drop.element.nativeElement && atIndex === -1) {
            return;
        }

        const dragElement = drag.element.nativeElement;
        const dropAreaElement = drop.element.nativeElement;
        this._renderer.removeChild(dragElement.parentNode, dragElement);
        if (atIndex !== -1 && dropAreaElement.children.length > atIndex) {
            this._renderer.insertBefore(dropAreaElement, dragElement, dropAreaElement.children[atIndex]);
        } else {
            this._renderer.appendChild(dropAreaElement, dragElement);
        }
    }
}
