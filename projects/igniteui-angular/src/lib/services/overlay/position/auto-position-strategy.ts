import { PositionSettings } from './../utilities';
import { IPositionStrategy } from './IPositionStrategy';
import { ConnectedPositioningStrategy } from './connected-positioning-strategy';
import { Inject, forwardRef, Host } from '@angular/core';
import { BrowserModule, _document } from '@angular/platform-browser/src/browser';

enum Axis {
    X = 1,
    Y = 0
}
export class AutoPositionStrategy implements IPositionStrategy {
    public _wrapperClass: string;
    public _settings: PositionSettings;
    public wrapperClass: string;
    private _wrapper: HTMLElement;
    private _offsetPadding = 15;
    constructor(
        private options?: any,
        // @Inject(forwardRef(() => DOCUMENT)) private document?: Document
    ) {
        this._settings = options ? options : new PositionSettings();
        // debugger;
        // this.document = this.document ? this.document : DOCUMENT;
    }

    getViewPort(document) { // Material Design implementation
        const clientRect = document.documentElement.getBoundingClientRect();
        const scrollPosition = {
            top: -clientRect.top,
            left: -clientRect.left
        };
        const width = window.innerWidth;
        const height = window.innerHeight;

        return {
            top: scrollPosition.top,
            left: scrollPosition.left,
            bottom: scrollPosition.top + height,
            right: scrollPosition.left + width,
            height,
            width
        };

    }


    // The position method should return a <div> container that will host the component
    position(element, wrapper, rect, document?): void {
        this.wrapperClass = 'auto-show';
        const positioningStrat = new ConnectedPositioningStrategy(this._settings);
        positioningStrat.position(element, wrapper, rect);
        const viewPort = this.getViewPort(document);
        const checkIfMoveHorizontal = (elem: HTMLElement) => {
            const leftBound = elem.parentElement.offsetLeft;
            const rightBound = elem.parentElement.offsetLeft + elem.clientWidth;
            let newPosition;
            switch (this._settings.horizontalDirection) {
                case (-1):
                    newPosition = leftBound < viewPort.left ?
                        parseFloat(elem.parentElement.style.left) + viewPort.left - leftBound + this._offsetPadding :
                        parseFloat(elem.parentElement.style.left);
                    elem.parentElement.style.left = newPosition + 'px';
                    break;
                case (0):
                    newPosition = rightBound > viewPort.right ?
                        parseFloat(elem.parentElement.style.left) + viewPort.right - rightBound - this._offsetPadding :
                        parseFloat(elem.parentElement.style.left);
                    elem.parentElement.style.left = newPosition + 'px';
                    break;
                default:
                    return;
            }
        };
        const checkIfMoveVertical = (elem: HTMLElement) => {
            const topBound = elem.parentElement.offsetTop;
            const bottomBound = elem.parentElement.offsetTop + elem.clientHeight;
            let newPosition;
            switch (this._settings.verticalDirection) {
                case (-1):
                    newPosition = topBound < viewPort.top ?
                        parseFloat(elem.parentElement.style.top) + viewPort.top - topBound + this._offsetPadding :
                        parseFloat(elem.parentElement.style.top);
                    elem.parentElement.style.top = newPosition + 'px';
                    break;
                case (0):
                    newPosition = bottomBound > viewPort.bottom ?
                        parseFloat(elem.parentElement.style.top) + viewPort.bottom - bottomBound - this._offsetPadding :
                        parseFloat(elem.parentElement.style.top);
                    elem.parentElement.style.top = newPosition + 'px';
                    break;
                default:
                    return;
            }
        };
        checkIfMoveVertical(element);
        checkIfMoveHorizontal(element);
    }
}
