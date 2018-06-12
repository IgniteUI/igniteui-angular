import { PositionSettings } from './../utilities';
import { DOCUMENT } from '@angular/common';
import { IPositionStrategy } from './IPositionStrategy';
import { Inject } from '@angular/core';

export class AutoPositionStrategy implements IPositionStrategy {

    // TODO: rename options to settings
    public _options: PositionSettings;
    public wrapperClass: string;
    private _wrapper: HTMLElement;
    constructor(
        private _document: any,
        options?: PositionSettings
    ) {
        this._options = options ? options : new PositionSettings();
    }

    // The position method should return a <div> container that will host the component
    position(element): void {
        this.wrapperClass = 'auto-show';

        element.parentElement.style.display = 'block';
        element.parentElement.style.position = 'absolute';
        element.parentElement.style.top = ((this._options.point.y >= 0) ?
            (this._options.point.y + 'px') : 0);
        element.parentElement.style.right = '0';
        element.parentElement.style.left = ((this._options.point.x >= 0) ?
            (this._options.point.x + 'px') : 0);
        element.parentElement.style.bottom = '0';

        // We need the element's dimensions in order to calculate its' position
        const elementheight = element.getBoundingClientRect().height;
        const windowheight = window.innerHeight;
        console.log(elementheight); // returns 0
        console.log(windowheight);

        element.parentElement.classList.add(this.wrapperClass);
    }
}
