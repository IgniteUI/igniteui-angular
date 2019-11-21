import { ConnectedPositioningStrategy } from './connected-positioning-strategy';
import { HorizontalAlignment, VerticalAlignment, PositionSettings, Size, Util, ConnectedFit, OutOfViewPort } from '../utilities';

export abstract class BaseFitPositionStrategy extends ConnectedPositioningStrategy {
    protected _initialSize: Size;
    protected _initialSettings: PositionSettings;

    /** @inheritdoc */
    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean): void {
        const rects = super.calculateElementRectangles(contentElement);
        const connectedFit: ConnectedFit = {};
        if (initialCall) {
            connectedFit.targetRect = rects.targetRect;
            connectedFit.contentElementRect = rects.elementRect;
            this._initialSettings = this._initialSettings || Object.assign({}, this.settings);
            this.settings = Object.assign({}, this._initialSettings);
            connectedFit.viewPortRect = Util.getViewportRect(document);
            this.updateViewPortFit(connectedFit);
            if (connectedFit.fitHorizontal.back < 0 || connectedFit.fitHorizontal.forward < 0 ||
                connectedFit.fitVertical.back < 0 || connectedFit.fitVertical.forward < 0) {
                this.fitInViewport(contentElement, connectedFit);
            }
        }
        this.setStyle(contentElement, rects.targetRect, rects.elementRect, connectedFit);
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
            this.settings.horizontalDirection,
            connectedFit.horizontalOffset);
        connectedFit.right = connectedFit.left + connectedFit.contentElementRect.width;
        connectedFit.fitHorizontal = {
                back: Math.floor(connectedFit.left - connectedFit.viewPortRect.left),
                forward: Math.floor(connectedFit.viewPortRect.right - connectedFit.right)
            };

        connectedFit.top = this.calculateTop(
            connectedFit.targetRect,
            connectedFit.contentElementRect,
            this.settings.verticalStartPoint,
            this.settings.verticalDirection,
            connectedFit.verticalOffset);
        connectedFit.bottom = connectedFit.top + connectedFit.contentElementRect.height;
        connectedFit.fitVertical = {
            back: Math.floor(connectedFit.top - connectedFit.viewPortRect.top),
            forward: Math.floor(connectedFit.viewPortRect.bottom - connectedFit.bottom)
        };
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
        targetRect: ClientRect, elementRect: ClientRect, startPoint: HorizontalAlignment, direction: HorizontalAlignment, offset?: number):
        number {
        return targetRect.right + targetRect.width * startPoint + elementRect.width * direction + offset;
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
        targetRect: ClientRect, elementRect: ClientRect, startPoint: VerticalAlignment, direction: VerticalAlignment, offset?: number):
        number {
        return targetRect.bottom + targetRect.height * startPoint + elementRect.height * direction + offset;
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


