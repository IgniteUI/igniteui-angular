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
        if (this.shouldFitHorizontal(this.settings, elementRect, viewPort)) {
            this.fitHorizontal(contentElement, this.settings, elementRect, viewPort, this.settings.minSize);
        }

        if (this.shouldFitVertical(this.settings, elementRect, viewPort)) {
            this.fitVertical(contentElement, this.settings, elementRect, viewPort, this.settings.minSize);
        }
    }

    protected shouldFitHorizontal(settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect): boolean {
        switch (settings.horizontalDirection) {
            case HorizontalAlignment.Left:
                if (innerRect.left < outerRect.left) {
                    return true;
                }
                break;
            case HorizontalAlignment.Right:
                if (innerRect.right > outerRect.right) {
                    return true;
                }
                break;
        }

        return false;
    }

    protected shouldFitVertical(settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect): boolean {
        switch (settings.verticalDirection) {
            case VerticalAlignment.Top:
                if (innerRect.top < outerRect.top) {
                    return true;
                }
                break;
            case VerticalAlignment.Bottom:
                if (innerRect.bottom > outerRect.bottom) {
                    return true;
                }
                break;
        }

        return false;
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
