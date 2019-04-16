import { ConnectedPositioningStrategy } from './connected-positioning-strategy';
import { IPositionStrategy } from './IPositionStrategy';
import { HorizontalAlignment, VerticalAlignment, PositionSettings, Size, getViewportRect } from '../utilities';

export abstract class BaseFitPositionStrategy extends ConnectedPositioningStrategy {
    protected _initialSettings: PositionSettings;
    protected _initialSize: Size;

    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean): void {
        super.position(contentElement, size);
        if (!initialCall) {
            return;
        }
        this._initialSettings = this._initialSettings || Object.assign({}, this._initialSettings, this.settings);
        this.settings = Object.assign({}, this.settings, this._initialSettings);
        const elementRect: ClientRect = contentElement.getBoundingClientRect();
        const viewPort: ClientRect = getViewportRect(document);
        if (this.shouldFitHorizontal(elementRect, viewPort)) {
            this.fitHorizontal(contentElement, this.settings, elementRect, viewPort, this.settings.minSize);
        }

        if (this.shouldFitVertical(elementRect, viewPort)) {
            this.fitVertical(contentElement, this.settings, elementRect, viewPort, this.settings.minSize);
        }
    }

    protected shouldFitHorizontal(innerRect: ClientRect, outerRect: ClientRect): boolean {
        return innerRect.left < outerRect.left || outerRect.right < innerRect.right;
    }

    protected shouldFitVertical(innerRect: ClientRect, outerRect: ClientRect): boolean {
        return innerRect.top < outerRect.top || outerRect.bottom < innerRect.bottom;
    }

    protected abstract fitHorizontal(
        element: HTMLElement,
        settings: PositionSettings,
        innerRect: ClientRect,
        outerRect: ClientRect,
        minSize: Size);


    protected abstract fitVertical(
        element: HTMLElement,
        settings: PositionSettings,
        innerRect: ClientRect,
        outerRect: ClientRect,
        minSize: Size);
}
