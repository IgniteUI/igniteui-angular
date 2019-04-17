import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size, Point } from './../utilities';
import { IPositionStrategy } from './IPositionStrategy';
import { BaseFitPositionStrategy } from './base-fit-position-strategy';

/**
 * Positions the element as in **Connected** positioning strategy and re-positions the element in
 * the view port (calculating a different start point) in case the element is partially getting out of view
 */
export class AutoPositionStrategy extends BaseFitPositionStrategy {
    protected fitHorizontal(element: HTMLElement, settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect, minSize: Size) {
        const targetRect: ClientRect = this.calculateTargetRect(settings);
        if (this.canFlipHorizontal(settings, targetRect, innerRect, outerRect)) {
            this.flipHorizontal(settings);
            this.positionElement(element, settings);
        } else {
            const horizontalPush = this.pushHorizontal(innerRect, outerRect);
            element.style.transform += ` translateX(${horizontalPush}px)`;
        }
    }

    protected fitVertical(element: HTMLElement, settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect, minSize: Size) {
        const targetRect: ClientRect = this.calculateTargetRect(settings);
        if (this.canFlipVertical(settings, targetRect, innerRect, outerRect)) {
            this.flipVertical(settings);
            this.positionElement(element, settings);
        } else {
            const verticalPush = this.pushVertical(innerRect, outerRect);
            element.style.transform += ` translateY(${verticalPush}px)`;
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

    private canFlipHorizontal(settings: PositionSettings, targetRect: ClientRect, innerRect: ClientRect, outerRect: ClientRect): boolean {
        //  HorizontalAlignment can be Left = -1; Center = -0.5 or Right = 0.
        //  To virtually flip direction and start point (both are HorizontalAlignment) we can do this:
        //  flippedAlignment = (-1) * (HorizontalAlignment + 1)
        //  this way:
        //  (-1) * (Left + 1) = 0 = Right
        //  (-1) * (Center + 1) = -0.5 = Center
        //  (-1) * (Right + 1) = -1 = Left
        const flippedStartPoint = (-1) * (settings.horizontalStartPoint + 1);
        const flippedDirection = (-1) * (settings.horizontalDirection + 1);

        const leftBorder = targetRect.right + flippedStartPoint * targetRect.width + flippedDirection * innerRect.width;
        const rightBorder = leftBorder + innerRect.width;
        return outerRect.left < leftBorder && rightBorder < outerRect.right;
    }

    private canFlipVertical(settings: PositionSettings, targetRect: ClientRect, innerRect: ClientRect, outerRect: ClientRect): boolean {
        const flippedStartPoint = (-1) * (settings.verticalStartPoint + 1);
        const flippedDirection = (-1) * (settings.verticalDirection + 1);

        const topBorder = targetRect.bottom + flippedStartPoint * targetRect.height + flippedDirection * innerRect.height;
        const bottomBorder = topBorder + innerRect.height;
        return outerRect.top < topBorder && bottomBorder < outerRect.bottom;
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

    private pushHorizontal(innerRect: ClientRect, outerRect: ClientRect): number {
        const leftExtend = innerRect.left;
        const rightExtend = innerRect.right - outerRect.right;
        //  if leftExtend < 0 overlay goes beyond left end of the screen. We should push it back with exactly
        //  as much as it is beyond the screen.
        //  if rightExtend > 0 overlay goes beyond right end of the screen. We should push it back with the
        //  extend but with amount not bigger than what left between left border of screen and left border of
        //  overlay, e.g. leftExtend
        if (leftExtend < 0) {
            return Math.abs(leftExtend);
        } else if (rightExtend > 0) {
            return - Math.min(rightExtend, leftExtend);
        }
    }

    private pushVertical(innerRect: ClientRect, outerRect: ClientRect): number {
        const topExtend = innerRect.top;
        const bottomExtend = innerRect.bottom - outerRect.bottom;
        if (topExtend < 0) {
            return Math.abs(topExtend);
        } else if (bottomExtend > 0) {
            return - Math.min(bottomExtend, topExtend);
        }
    }

    private positionElement(element: HTMLElement, settings: PositionSettings) {
        super.position(element, null);
    }
}
