import { IPositionStrategy } from './IPositionStrategy';
import { PositionSettings, HorizontalAlignment, VerticalAlignment } from './../utilities';

export class GlobalPositionStrategy implements IPositionStrategy {
    public _settings: PositionSettings;

    constructor(settings?: PositionSettings) {
        this._settings = settings ? settings : new PositionSettings();
    }

    position(element: HTMLElement, wrapper: HTMLElement, size: {}): void {
        switch (this._settings.horizontalDirection) {
            case HorizontalAlignment.Left:
            wrapper.parentElement.style.justifyContent = 'flex-start';
                break;
            case HorizontalAlignment.Center:
            wrapper.parentElement.style.justifyContent = 'center';
                break;
            case HorizontalAlignment.Right:
            wrapper.parentElement.style.justifyContent = 'flex-end';
                break;
            default:
                break;
        }

        switch (this._settings.verticalDirection) {
            case VerticalAlignment.Top:
            wrapper.parentElement.style.alignItems = 'flex-start';
                break;
            case VerticalAlignment.Middle:
            wrapper.parentElement.style.alignItems = 'center';
                break;
            case VerticalAlignment.Bottom:
            wrapper.parentElement.style.alignItems = 'flex-end';
                break;
            default:
                break;
        }
    }
}

