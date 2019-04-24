import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size, Point } from './../utilities';
import { IPositionStrategy } from './IPositionStrategy';
import { BaseFitPositionStrategy, ConnectedFit } from './base-fit-position-strategy';

/**
 * Positions the element as in **Connected** positioning strategy and re-positions the element in
 * the view port (calculating a different start point) in case the element is partially getting out of view
 */
export class AutoPositionStrategy extends BaseFitPositionStrategy {
    protected fitInViewPort(element: HTMLElement, settings: PositionSettings, connectedFit: ConnectedFit, initialCall?: boolean) {
        if (!initialCall) {
            return;
        }
        let transformString = '';
        let shouldPosition = false;
        connectedFit.targetRect = this.calculateTargetRect(settings);
        if (!connectedFit.fitHorizontal) {
            if (this.canFlipHorizontal(settings, connectedFit)) {
                this.flipHorizontal(settings);
                shouldPosition = true;
            } else {
                const horizontalPush = this.pushHorizontal(connectedFit);
                transformString = this.joinStringNoTrailingSpaces([transformString, `translateX(${horizontalPush}px)`]);
            }
        }

        if (!connectedFit.fitVertical) {
            if (this.canFlipVertical(settings, connectedFit)) {
                this.flipVertical(settings);
                shouldPosition = true;
            } else {
                const verticalPush = this.pushVertical(connectedFit);
                transformString = this.joinStringNoTrailingSpaces([transformString, `translateY(${verticalPush}px)`]);
            }
        }

        element.style.transform = transformString;
        if (shouldPosition) {
            super.position(element, null, document);
        }
    }

    calculateTargetRect(settings: PositionSettings): ClientRect {
        if (settings.target instanceof HTMLElement) {
            return (settings.target as HTMLElement).getBoundingClientRect();
        } else {
            const targetPoint = settings.target as Point;
            return {
                bottom: targetPoint.y,
                height: 0,
                left: targetPoint.x,
                right: targetPoint.x,
                top: targetPoint.y,
                width: 0
            };
        }
    }

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

        const leftBorder =
            connectedFit.targetRect.right +
            flippedStartPoint * connectedFit.targetRect.width +
            flippedDirection * connectedFit.elementRect.width;
        const rightBorder = leftBorder + connectedFit.elementRect.width;
        return connectedFit.viewPortRect.left < leftBorder && rightBorder < connectedFit.viewPortRect.right;
    }

    private canFlipVertical(settings: PositionSettings, connectedFit: ConnectedFit): boolean {
        const flippedStartPoint = (-1) * (settings.verticalStartPoint + 1);
        const flippedDirection = (-1) * (settings.verticalDirection + 1);

        const topBorder =
            connectedFit.targetRect.bottom +
            flippedStartPoint * connectedFit.targetRect.height +
            flippedDirection * connectedFit.elementRect.height;
        const bottomBorder = topBorder + connectedFit.elementRect.height;
        return connectedFit.viewPortRect.top < topBorder && bottomBorder < connectedFit.viewPortRect.bottom;
    }

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

    private pushHorizontal(connectedFit: ConnectedFit): number {
        const leftExtend = connectedFit.elementRect.left;
        const rightExtend = connectedFit.elementRect.right - connectedFit.viewPortRect.right;
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

    private pushVertical(connectedFit: ConnectedFit): number {
        const topExtend = connectedFit.elementRect.top;
        const bottomExtend = connectedFit.elementRect.bottom - connectedFit.viewPortRect.bottom;
        if (topExtend < 0) {
            return Math.abs(topExtend);
        } else if (bottomExtend > 0) {
            return - Math.min(bottomExtend, topExtend);
        } else {
            return 0;
        }

    }
}
