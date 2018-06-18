import { PositionSettings, VerticalAlignment, HorizontalAlignment } from './../utilities';
import { IPositionStrategy } from './IPositionStrategy';
import { ConnectedPositioningStrategy } from './connected-positioning-strategy';
import { Inject, forwardRef, Host } from '@angular/core';
import { BrowserModule, _document } from '@angular/platform-browser/src/browser';
import { Rectangle, GlobalPositionStrategy } from 'dist/igniteui-angular/public_api';

enum Axis {
    X = 1,
    Y = 0
}
export class AutoPositionStrategy extends ConnectedPositioningStrategy implements IPositionStrategy {
    public wrapperClass: string;
    public offsetPadding = 16;

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
    position(element: HTMLElement, wrapper: HTMLElement, rect: { width: number, height: number }, document?: Document): void {
        const viewPort = this.getViewPort(document);
        super.position(element, wrapper, rect);
        this.wrapperClass = 'auto-show';
        const checkIfMoveHorizontal = (elem: HTMLElement) => {
            const leftBound = elem.parentElement.offsetLeft;
            const rightBound = elem.parentElement.offsetLeft + elem.clientWidth;
            let newPosition;
            switch (this._settings.horizontalDirection) {
                case HorizontalAlignment.Left:
                    newPosition = leftBound < viewPort.left ?
                        parseFloat(elem.parentElement.style.left) + viewPort.left - leftBound + this.offsetPadding :
                        parseFloat(elem.parentElement.style.left);
                    elem.parentElement.style.left = newPosition + 'px';
                    break;
                case HorizontalAlignment.Right:
                    newPosition = rightBound > viewPort.right ?
                        parseFloat(elem.parentElement.style.left) + viewPort.right - rightBound - this.offsetPadding :
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
                case VerticalAlignment.Top:
                    newPosition = topBound < viewPort.top ?
                        parseFloat(elem.parentElement.style.top) + viewPort.top - topBound + this.offsetPadding :
                        parseFloat(elem.parentElement.style.top);
                    elem.parentElement.style.top = newPosition + 'px';
                    break;
                case VerticalAlignment.Bottom:
                    newPosition = bottomBound > viewPort.bottom ?
                        parseFloat(elem.parentElement.style.top) + viewPort.bottom - bottomBound - this.offsetPadding :
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
