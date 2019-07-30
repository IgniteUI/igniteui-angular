import { VerticalAlignment, HorizontalAlignment, PositionSettings } from './../utilities';
import { BaseFitPositionStrategy, ConnectedFit } from './base-fit-position-strategy';

/**
 * Positions the element as in **Connected** positioning strategy and re-positions the element in
 * the view port (calculating a different start point) in case the element is partially getting out of view
 */
export class AutoPositionStrategy extends BaseFitPositionStrategy {

    /** @inheritdoc */
    protected fitInViewport(element: HTMLElement, connectedFit: ConnectedFit) {
        const transformString: string[] = [];
        if (!connectedFit.fitHorizontal) {
            if (this.canFlipHorizontal(connectedFit)) {
                this.flipHorizontal();
            } else {
                const horizontalPush = this.horizontalPush(connectedFit);
                transformString.push(`translateX(${horizontalPush}px)`);
            }
        }

        if (!connectedFit.fitVertical) {
            if (this.canFlipVertical(connectedFit)) {
                this.flipVertical();
            } else {
                const verticalPush = this.verticalPush(connectedFit);
                transformString.push(`translateY(${verticalPush}px)`);
            }
        }

        element.style.transform = transformString.join(' ').trim();
    }

    /**
     * Checks if element can be flipped without get off the viewport
     * @param connectedFit connectedFit object containing all necessary parameters
     * @returns true if element can be flipped and stain in viewport
     */
    private canFlipHorizontal(connectedFit: ConnectedFit): boolean {
        //  HorizontalAlignment can be Left = -1; Center = -0.5 or Right = 0.
        //  To virtually flip direction and start point (both are HorizontalAlignment) we can do this:
        //  flippedAlignment = (-1) * (HorizontalAlignment + 1)
        //  this way:
        //  (-1) * (Left + 1) = 0 = Right
        //  (-1) * (Center + 1) = -0.5 = Center
        //  (-1) * (Right + 1) = -1 = Left
        const flippedStartPoint = (-1) * (this.settings.horizontalStartPoint + 1);
        const flippedDirection = (-1) * (this.settings.horizontalDirection + 1);

        const leftBorder = this.calculateLeft(
            connectedFit.targetRect, connectedFit.contentElementRect, flippedStartPoint, flippedDirection);
        const rightBorder = leftBorder + connectedFit.contentElementRect.width;
        return connectedFit.viewPortRect.left < leftBorder && rightBorder < connectedFit.viewPortRect.right;
    }

    /**
     * Checks if element can be flipped without get off the viewport
     * @param connectedFit connectedFit object containing all necessary parameters
     * @returns true if element can be flipped and stain in viewport
     */
    private canFlipVertical(connectedFit: ConnectedFit): boolean {
        const flippedStartPoint = (-1) * (this.settings.verticalStartPoint + 1);
        const flippedDirection = (-1) * (this.settings.verticalDirection + 1);

        const topBorder = this.calculateTop(
            connectedFit.targetRect, connectedFit.contentElementRect, flippedStartPoint, flippedDirection);
        const bottomBorder = topBorder + connectedFit.contentElementRect.height;
        return connectedFit.viewPortRect.top < topBorder && bottomBorder < connectedFit.viewPortRect.bottom;
    }

    /**
     * Flips direction and start point of the position settings
     */
    private flipHorizontal() {
        switch (this.settings.horizontalDirection) {
            case HorizontalAlignment.Left:
                this.settings.horizontalDirection = HorizontalAlignment.Right;
                break;
            case HorizontalAlignment.Right:
                this.settings.horizontalDirection = HorizontalAlignment.Left;
                break;
        }
        switch (this.settings.horizontalStartPoint) {
            case HorizontalAlignment.Left:
                this.settings.horizontalStartPoint = HorizontalAlignment.Right;
                break;
            case HorizontalAlignment.Right:
                this.settings.horizontalStartPoint = HorizontalAlignment.Left;
                break;
        }
    }

    /**
     * Flips direction and start point of the position settings
     */
    private flipVertical() {
        switch (this.settings.verticalDirection) {
            case VerticalAlignment.Top:
                this.settings.verticalDirection = VerticalAlignment.Bottom;
                break;
            case VerticalAlignment.Bottom:
                this.settings.verticalDirection = VerticalAlignment.Top;
                break;
        }
        switch (this.settings.verticalStartPoint) {
            case VerticalAlignment.Top:
                this.settings.verticalStartPoint = VerticalAlignment.Bottom;
                break;
            case VerticalAlignment.Bottom:
                this.settings.verticalStartPoint = VerticalAlignment.Top;
                break;
        }
    }

    /**
     * Calculates necessary horizontal push according to provided connectedFit
     * @param connectedFit connectedFit object containing all necessary parameters
     * @returns amount of necessary translation which will push the element into viewport
     */
    private horizontalPush(connectedFit: ConnectedFit): number {
        const leftExtend = connectedFit.left;
        const rightExtend = connectedFit.right - connectedFit.viewPortRect.right;
        //  if leftExtend < 0 overlay goes beyond left end of the screen. We should push it back with exactly
        //  as much as it is beyond the screen.
        //  if rightExtend > 0 overlay goes beyond right end of the screen. We should push it back with the
        //  extend but with amount not bigger than what left between left border of screen and left border of
        //  overlay, e.g. leftExtend
        if (leftExtend < 0) {
            return Math.abs(leftExtend);
        } else if (rightExtend > 0) {
            return - Math.min(rightExtend, leftExtend);
        } else {
            return 0;
        }
    }

    /**
     * Calculates necessary vertical push according to provided connectedFit
     * @param connectedFit connectedFit object containing all necessary parameters
     * @returns amount of necessary translation which will push the element into viewport
     */
    private verticalPush(connectedFit: ConnectedFit): number {
        const topExtend = connectedFit.top;
        const bottomExtend = connectedFit.bottom - connectedFit.viewPortRect.bottom;
        if (topExtend < 0) {
            return Math.abs(topExtend);
        } else if (bottomExtend > 0) {
            return - Math.min(bottomExtend, topExtend);
        } else {
            return 0;
        }
    }
}
