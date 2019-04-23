import { ConnectedPositioningStrategy } from './connected-positioning-strategy';
import { IPositionStrategy } from './IPositionStrategy';
import { HorizontalAlignment, VerticalAlignment, PositionSettings, Size, getViewportRect, Point } from '../utilities';

export abstract class BaseFitPositionStrategy extends ConnectedPositioningStrategy {
    protected _initialSettings: PositionSettings;
    protected _initialSize: Size;

    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean): void {
        super.position(contentElement, size);
        this._initialSettings = this._initialSettings || Object.assign({}, this._initialSettings, this.settings);
        this.settings = Object.assign({}, this.settings, this._initialSettings);
        const connectedFit: ConnectedFit = {}
        connectedFit.elementRect = contentElement.getBoundingClientRect();
        connectedFit.viewPortRect = getViewportRect(document);
        this.canFitInViewPort(connectedFit);
        if (!connectedFit.fitHorizontal || !connectedFit.fitVertical) {
            this.fitInViewPort(contentElement, this.settings, connectedFit, initialCall);
        }
    }

    protected canFitInViewPort(connectedFit: ConnectedFit) {
        connectedFit.fitHorizontal =
            connectedFit.viewPortRect.left < connectedFit.elementRect.left &&
            connectedFit.elementRect.right < connectedFit.viewPortRect.right;
        connectedFit.fitVertical =
            connectedFit.viewPortRect.top < connectedFit.elementRect.top &&
            connectedFit.elementRect.bottom < connectedFit.viewPortRect.bottom;
    }

    protected joinStringNoTrailingSpaces(input: string[]): string {
        return input.join(' ').trim();
    }

    protected abstract fitInViewPort(
        element: HTMLElement,
        settings: PositionSettings,
        connectedFit: ConnectedFit,
        initialCall?: boolean);
}

export interface ConnectedFit {
    targetRect?: ClientRect;
    elementRect?: ClientRect;
    viewPortRect?: ClientRect;
    fitHorizontal?: boolean;
    fitVertical?: boolean;
}
