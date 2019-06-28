import { ConnectedPositioningStrategy } from './connected-positioning-strategy';
import { HorizontalAlignment, VerticalAlignment, PositionSettings, Size, Util } from '../utilities';

export abstract class BaseFitPositionStrategy extends ConnectedPositioningStrategy {
    protected _initialSize: Size;
    protected _initialSettings: PositionSettings;

    /** @inheritdoc */
    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean): void {
        const targetRect = Util.getTargetRect(this.settings);
        const contentElementRect = contentElement.getBoundingClientRect();
        if (initialCall) {
            const connectedFit: ConnectedFit = {};
            connectedFit.targetRect = targetRect;
            connectedFit.contentElementRect = contentElementRect;
            this._initialSettings = this._initialSettings || Object.assign({}, this.settings);
            this.settings = Object.assign({}, this._initialSettings);
            connectedFit.viewPortRect = Util.getViewportRect(document);
            this.updateViewPortFit(connectedFit);
            if (!connectedFit.fitHorizontal || !connectedFit.fitVertical) {
                this.fitInViewport(contentElement, connectedFit);
            }
        }
        this.setStyle(contentElement, targetRect, contentElementRect);
    }

    /**
     * Checks if element can fit in viewport and updates provided connectedFit
     * with the result
     * @param connectedFit connectedFit to update
     */
    protected updateViewPortFit(connectedFit: ConnectedFit) {
        connectedFit.left = this.calculateLeft(
            connectedFit.targetRect,
            connectedFit.contentElementRect,
            this.settings.horizontalStartPoint,
            this.settings.horizontalDirection);
        connectedFit.right = connectedFit.left + connectedFit.contentElementRect.width;
        connectedFit.fitHorizontal =
            connectedFit.viewPortRect.left < connectedFit.left && connectedFit.right < connectedFit.viewPortRect.right;

        connectedFit.top = this.calculateTop(
            connectedFit.targetRect,
            connectedFit.contentElementRect,
            this.settings.verticalStartPoint,
            this.settings.verticalDirection);
        connectedFit.bottom = connectedFit.top + connectedFit.contentElementRect.height;
        connectedFit.fitVertical =
            connectedFit.viewPortRect.top < connectedFit.top && connectedFit.bottom < connectedFit.viewPortRect.bottom;
    }

    /**
     * Calculates the position of the left border of the element if it gets positioned
     * with provided start point and direction
     * @param targetRect Rectangle of the target where element is attached
     * @param elementRect Rectangle of the element
     * @param startPoint Start point of the target
     * @param direction Direction in which to show the element
     */
    protected calculateLeft(
        targetRect: ClientRect, elementRect: ClientRect, startPoint: HorizontalAlignment, direction: HorizontalAlignment): number {
        return targetRect.right + targetRect.width * startPoint + elementRect.width * direction;
    }

    /**
     * Calculates the position of the top border of the element if it gets positioned
     * with provided position settings related to the target
     * @param targetRect Rectangle of the target where element is attached
     * @param elementRect Rectangle of the element
     * @param startPoint Start point of the target
     * @param direction Direction in which to show the element
     */
    protected calculateTop(
        targetRect: ClientRect, elementRect: ClientRect, startPoint: VerticalAlignment, direction: VerticalAlignment): number {
        return targetRect.bottom + targetRect.height * startPoint + elementRect.height * direction;
    }

    /**
     * Fits the element into viewport according to the position settings
     * @param element element to fit in viewport
     * @param connectedFit connectedFit object containing all necessary parameters
     */
    protected abstract fitInViewport(
        element: HTMLElement,
        connectedFit: ConnectedFit);
}

export interface ConnectedFit {
    contentElementRect?: ClientRect;
    targetRect?: ClientRect;
    viewPortRect?: ClientRect;
    fitHorizontal?: boolean;
    fitVertical?: boolean;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
}
