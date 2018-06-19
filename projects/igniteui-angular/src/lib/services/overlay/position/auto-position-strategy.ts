import { PositionSettings, VerticalAlignment, HorizontalAlignment } from './../utilities';
import { IPositionStrategy } from './IPositionStrategy';
import { ConnectedPositioningStrategy } from './connected-positioning-strategy';

enum Axis {
    X = 1,
    Y = 0
}
export class AutoPositionStrategy extends ConnectedPositioningStrategy implements IPositionStrategy {
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
    position(contentElement: HTMLElement, size: { width: number, height: number }, document?: Document): void {
        const viewPort = this.getViewPort(document);
        super.position(contentElement, size);
        const checkIfMoveHorizontal = (elem: HTMLElement) => {
            const leftBound = elem.offsetLeft;
            const rightBound = elem.offsetLeft + elem.clientWidth;
            let newPosition;
            switch (this.settings.horizontalDirection) {
                case HorizontalAlignment.Left:
                    newPosition = leftBound < viewPort.left ?
                        parseFloat(elem.style.left) + viewPort.left - leftBound + this.offsetPadding :
                        parseFloat(elem.style.left);
                    elem.style.left = newPosition + 'px';
                    break;
                case HorizontalAlignment.Right:
                    newPosition = rightBound > viewPort.right ?
                        parseFloat(elem.style.left) + viewPort.right - rightBound - this.offsetPadding :
                        parseFloat(elem.style.left);
                    elem.style.left = newPosition + 'px';
                    break;
                default:
                    return;
            }
        };
        const checkIfMoveVertical = (elem: HTMLElement) => {
            const topBound = elem.offsetTop;
            const bottomBound = elem.offsetTop + elem.clientHeight;
            let newPosition;
            switch (this.settings.verticalDirection) {
                case VerticalAlignment.Top:
                    newPosition = topBound < viewPort.top ?
                        parseFloat(elem.style.top) + viewPort.top - topBound + this.offsetPadding :
                        parseFloat(elem.style.top);
                    elem.style.top = newPosition + 'px';
                    break;
                case VerticalAlignment.Bottom:
                    newPosition = bottomBound > viewPort.bottom ?
                        parseFloat(elem.style.top) + viewPort.bottom - bottomBound - this.offsetPadding :
                        parseFloat(elem.style.top);
                    elem.style.top = newPosition + 'px';
                    break;
                default:
                    return;
            }
        };
        checkIfMoveVertical(contentElement);
        checkIfMoveHorizontal(contentElement);
    }
}
