import { IPositionStrategy } from './IPositionStrategy';
import { PositionSettings } from './../utilities';

export class GlobalPositionStrategy implements IPositionStrategy {
    public _settings: PositionSettings;

    constructor(settings?: PositionSettings) {
        this._settings = settings ? settings : new PositionSettings();
    }

    position(element: HTMLElement, wrapper: HTMLElement, size: {}): void {
        switch (this._settings.horizontalDirection) {
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

        switch (this._settings.verticalDirection) {
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

