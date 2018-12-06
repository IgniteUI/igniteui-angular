import { IPositionStrategy } from './IPositionStrategy';
import { PositionSettings, Point, HorizontalAlignment, VerticalAlignment, Size } from './../utilities';
import { fadeIn, fadeOut } from '../../../animations/main';

export class GlobalPositionStrategy implements IPositionStrategy {
    private _defaultSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Middle,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalStartPoint: VerticalAlignment.Middle,
        openAnimation: fadeIn,
        closeAnimation: fadeOut,
        minSize: { width: 0, height: 0 }
    };

    public settings: PositionSettings;
    constructor(settings?: PositionSettings) {
        this.settings = Object.assign({}, this._defaultSettings, settings);
    }

    position(contentElement: HTMLElement, size?: Size, document?: Document, initialCall?: boolean, minSize?: Size): void {
        switch (this.settings.horizontalDirection) {
            case HorizontalAlignment.Left:
                contentElement.parentElement.style.justifyContent = 'flex-start';
                break;
            case HorizontalAlignment.Center:
                contentElement.parentElement.style.justifyContent = 'center';
                break;
            case HorizontalAlignment.Right:
                contentElement.parentElement.style.justifyContent = 'flex-end';
                break;
            default:
                break;
        }

        switch (this.settings.verticalDirection) {
            case VerticalAlignment.Top:
                contentElement.parentElement.style.alignItems = 'flex-start';
                break;
            case VerticalAlignment.Middle:
                contentElement.parentElement.style.alignItems = 'center';
                break;
            case VerticalAlignment.Bottom:
                contentElement.parentElement.style.alignItems = 'flex-end';
                break;
            default:
                break;
        }
    }
}

