import { IPositionStrategy } from './IPositionStrategy';
import { PositionSettings } from './../utilities';

export class GlobalPositionStrategy implements IPositionStrategy {
   // public _wrapperClass: string;
    public _settings: PositionSettings;

    constructor(settings?: PositionSettings) {
        this._settings = settings ? settings : new PositionSettings();
        //this._wrapperClass = 'global';
    }

    position(element: HTMLElement, wrapper: HTMLElement, size: {}): void {
        switch (this._settings.horizontalDirection) {
            case -1:
            wrapper.parentElement.style.justifyContent = 'flex-start';
                // this._wrapperClass += '-left';
                break;
            case -0.5:
            wrapper.parentElement.style.justifyContent = 'center';
            // this._wrapperClass += '-center';
                break;
            case 0:
            wrapper.parentElement.style.justifyContent = 'flex-end';
            // this._wrapperClass += '-right';
                break;
            default:
                break;
        }

        switch (this._settings.verticalDirection) {
            case -1:
            wrapper.parentElement.style.alignItems = 'flex-start';
            // this._wrapperClass += '-top';
                break;
            case -0.5:
            wrapper.parentElement.style.alignItems = 'center';
                // this._wrapperClass += '-middle';
                break;
            case 0:
            wrapper.parentElement.style.alignItems = 'flex-end';
            // this._wrapperClass += '-bottom';
                break;
            default:
                break;
        }
    }
}

