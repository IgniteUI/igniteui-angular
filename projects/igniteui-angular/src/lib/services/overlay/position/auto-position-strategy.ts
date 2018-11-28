import { PositionSettings, VerticalAlignment, HorizontalAlignment, Size } from './../utilities';
import { IPositionStrategy } from './IPositionStrategy';
import { ConnectedPositioningStrategy } from './connected-positioning-strategy';

enum Axis {
    X = 1,
    Y = 0
}
export class AutoPositionStrategy extends ConnectedPositioningStrategy implements IPositionStrategy {
    public offsetPadding = 16;
    private _initialSettings;

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
    /** @inheritdoc */
    position(contentElement: HTMLElement, size?: Size, document?: Document, initialCall?: boolean): void {
        if (!initialCall) {
            super.position(contentElement, size);
            return;
        }
        this._initialSettings = this._initialSettings || Object.assign({}, this._initialSettings, this.settings);
        this.settings = this._initialSettings ? Object.assign({}, this.settings, this._initialSettings) : this.settings;
        const viewPort = this.getViewPort(document);
        super.position(contentElement, size);
        const checkIfMoveHorizontal = (elem: HTMLElement) => {
            const leftBound = elem.offsetLeft;
            const rightBound = elem.offsetLeft + elem.lastElementChild.clientWidth;
            switch (this.settings.horizontalDirection) {
                case HorizontalAlignment.Left:
                    if (leftBound < viewPort.left) {
                        this.settings.horizontalDirection = HorizontalAlignment.Right;
                        this.settings.horizontalStartPoint = HorizontalAlignment.Right;
                    }
                    break;
                case HorizontalAlignment.Right:
                    if (rightBound > viewPort.right) {
                        this.settings.horizontalDirection = HorizontalAlignment.Left;
                        this.settings.horizontalStartPoint = HorizontalAlignment.Left;
                    }
                    break;
                default:
                    return;
            }
        };
        const checkIfMoveVertical = (elem: HTMLElement) => {
            const topBound = elem.offsetTop;
            const bottomBound = elem.offsetTop + elem.lastElementChild.clientHeight;
            switch (this.settings.verticalDirection) {
                case VerticalAlignment.Top:
                    if (topBound < viewPort.top) {
                        this.settings.verticalDirection = VerticalAlignment.Bottom;
                        this.settings.verticalStartPoint = VerticalAlignment.Bottom;
                    }
                    break;
                case VerticalAlignment.Bottom:
                    if (bottomBound > viewPort.bottom) {
                        this.settings.verticalDirection = VerticalAlignment.Top;
                        this.settings.verticalStartPoint = VerticalAlignment.Top;
                    }
                    break;
                default:
                    return;
            }
        };
        checkIfMoveVertical(contentElement);
        checkIfMoveHorizontal(contentElement);
        super.position(contentElement, size);
    }
}
