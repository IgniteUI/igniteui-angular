import { IPositionStrategy } from './IPositionStrategy';
import { PositionSettings, Point, HorizontalAlignment, VerticalAlignment } from './../utilities';

export class GlobalPositionStrategy implements IPositionStrategy {
    private _defaultSettings: PositionSettings = {
        point: new Point(0, 0),
        horizontalDirection: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Middle,
        element: null,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalStartPoint: VerticalAlignment.Middle
    };

    public settings: PositionSettings;
    constructor(settings?: PositionSettings) {
        this.settings = Object.assign(this._defaultSettings, settings);
    }

    position(element: HTMLElement, wrapper: HTMLElement, size: {}): void {
        switch (this.settings.horizontalDirection) {
            case -1:
                wrapper.parentElement.style.justifyContent = 'flex-start';
                break;
            case -0.5:
                wrapper.parentElement.style.justifyContent = 'center';
                break;
            case 0:
                wrapper.parentElement.style.justifyContent = 'flex-end';
                break;
            default:
                break;
        }

        switch (this.settings.verticalDirection) {
            case -1:
                wrapper.parentElement.style.alignItems = 'flex-start';
                break;
            case -0.5:
                wrapper.parentElement.style.alignItems = 'center';
                break;
            case 0:
                wrapper.parentElement.style.alignItems = 'flex-end';
                break;
            default:
                break;
        }
    }
}

