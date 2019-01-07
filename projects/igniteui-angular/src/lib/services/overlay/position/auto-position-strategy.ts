import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size } from './../utilities';
import { IPositionStrategy } from './IPositionStrategy';
import { BaseFitPositionStrategy } from './base-fit-position-strategy';

export class AutoPositionStrategy extends BaseFitPositionStrategy implements IPositionStrategy {
    fitHorizontal(element: HTMLElement, settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect, minSize: Size) {
        switch (settings.horizontalDirection) {
            case HorizontalAlignment.Left:
                settings.horizontalDirection = HorizontalAlignment.Right;
                settings.horizontalStartPoint = HorizontalAlignment.Right;
                break;
            case HorizontalAlignment.Right:
                settings.horizontalDirection = HorizontalAlignment.Left;
                settings.horizontalStartPoint = HorizontalAlignment.Left;
                break;
        }

        super.position(element, this._initialSize);
    }

    fitVertical(element: HTMLElement, settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect, minSize: Size) {
        switch (settings.verticalDirection) {
            case VerticalAlignment.Top:
                settings.verticalDirection = VerticalAlignment.Bottom;
                settings.verticalStartPoint = VerticalAlignment.Bottom;
                break;
            case VerticalAlignment.Bottom:
                settings.verticalDirection = VerticalAlignment.Top;
                settings.verticalStartPoint = VerticalAlignment.Top;
                break;
        }

        super.position(element, this._initialSize);
    }
}
