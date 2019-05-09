import { VerticalAlignment, HorizontalAlignment, PositionSettings } from './../utilities';
import { BaseFitPositionStrategy, ConnectedFit } from './base-fit-position-strategy';

/**
 * Positions the element as in **Connected** positioning strategy and re-positions the element in
 * the view port (calculating a different start point) in case the element is partially getting out of view
 */
export class AutoPositionStrategy extends BaseFitPositionStrategy {

    /** @inheritdoc */
    protected fitInViewport(element: HTMLElement, settings: PositionSettings, connectedFit: ConnectedFit) {
        let transformString = '';
        if (!connectedFit.fitHorizontal) {
            if (this.canFlipHorizontal(settings, connectedFit)) {
                this.flipHorizontal(settings);
            } else {
                const horizontalPush = this.horizontalPush(connectedFit);
                transformString = this.joinStringNoTrailingSpaces([transformString, `translateX(${horizontalPush}px)`]);
            }
        }

        if (!connectedFit.fitVertical) {
            if (this.canFlipVertical(settings, connectedFit)) {
                this.flipVertical(settings);
            } else {
                const verticalPush = this.verticalPush(connectedFit);
                transformString = this.joinStringNoTrailingSpaces([transformString, `translateY(${verticalPush}px)`]);
            }
        }

        element.style.transform = transformString;
    }

    /**
     * Checks if element can be flipped without get off the viewport
     * @param settings position settings to check against
     * @param connectedFit connectedFit object containing all necessary parameters
     * @returns true if element can be flipped and stain in viewport
     */
    private canFlipHorizontal(settings: PositionSettings, connectedFit: ConnectedFit): boolean {
        //  HorizontalAlignment can be Left = -1; Center = -0.5 or Right = 0.
        //  To virtually flip direction and start point (both are HorizontalAlignment) we can do this:
        //  flippedAlignment = (-1) * (HorizontalAlignment + 1)
        //  this way:
        //  (-1) * (Left + 1) = 0 = Right
        //  (-1) * (Center + 1) = -0.5 = Center
        //  (-1) * (Right + 1) = -1 = Left
        const flippedStartPoint = (-1) * (settings.horizontalStartPoint + 1);
        const flippedDirection = (-1) * (settings.horizontalDirection + 1);

        const leftBorder = this.calculateLeftElementBorder(
            connectedFit.targetRect, connectedFit.contentElementRect, flippedStartPoint, flippedDirection);
        const rightBorder = leftBorder + connectedFit.contentElementRect.width;
        return connectedFit.viewPortRect.left < leftBorder && rightBorder < connectedFit.viewPortRect.right;
    }

    /**
     * Checks if element can be flipped without get off the viewport
     * @param settings position settings to check against
     * @param connectedFit connectedFit object containing all necessary parameters
     * @returns true if element can be flipped and stain in viewport
     */
    private canFlipVertical(settings: PositionSettings, connectedFit: ConnectedFit): boolean {
        const flippedStartPoint = (-1) * (settings.verticalStartPoint + 1);
        const flippedDirection = (-1) * (settings.verticalDirection + 1);

        const topBorder = this.calculateTopElementBorder(
            connectedFit.targetRect, connectedFit.contentElementRect, flippedStartPoint, flippedDirection);
        const bottomBorder = topBorder + connectedFit.contentElementRect.height;
        return connectedFit.viewPortRect.top < topBorder && bottomBorder < connectedFit.viewPortRect.bottom;
    }

    /**
     * Flips direction and start point of provided position settings
     * @param settings position settings to flip
     */
    private flipHorizontal(settings: PositionSettings) {
        switch (settings.horizontalDirection) {
            case HorizontalAlignment.Left:
                settings.horizontalDirection = HorizontalAlignment.Right;
                break;
            case HorizontalAlignment.Right:
                settings.horizontalDirection = HorizontalAlignment.Left;
                break;
        }
        switch (settings.horizontalStartPoint) {
            case HorizontalAlignment.Left:
                settings.horizontalStartPoint = HorizontalAlignment.Right;
                break;
            case HorizontalAlignment.Right:
                settings.horizontalStartPoint = HorizontalAlignment.Left;
                break;
        }
    }

    /**
     * Flips direction and start point of provided position settings
     * @param settings position settings to flip
     */
    private flipVertical(settings: PositionSettings) {
        switch (settings.verticalDirection) {
            case VerticalAlignment.Top:
                settings.verticalDirection = VerticalAlignment.Bottom;
                break;
            case VerticalAlignment.Bottom:
                settings.verticalDirection = VerticalAlignment.Top;
                break;
        }
        switch (settings.verticalStartPoint) {
            case VerticalAlignment.Top:
                settings.verticalStartPoint = VerticalAlignment.Bottom;
                break;
            case VerticalAlignment.Bottom:
                settings.verticalStartPoint = VerticalAlignment.Top;
                break;
        }
    }

    /**
     * Calculates necessary horizontal push according to provided connectedFit
     * @param connectedFit connectedFit object containing all necessary parameters
     * @returns amount of necessary translation which will push the element into viewport
     */
    private horizontalPush(connectedFit: ConnectedFit): number {
        const leftExtend = connectedFit.leftBorder;
        const rightExtend = connectedFit.rightBorder - connectedFit.viewPortRect.right;
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
        const topExtend = connectedFit.topBorder;
        const bottomExtend = connectedFit.bottomBorder - connectedFit.viewPortRect.bottom;
        if (topExtend < 0) {
            return Math.abs(topExtend);
        } else if (bottomExtend > 0) {
            return - Math.min(bottomExtend, topExtend);
        } else {
            return 0;
        }
    }
}
