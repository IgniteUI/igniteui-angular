import { IPositionStrategy } from './IPositionStrategy';
import { DOCUMENT } from '@angular/common';
import { PositionSettings } from './../utilities';
export class GlobalPositionStrategy implements IPositionStrategy {
    public _settings: PositionSettings;
    public wrapperClass: string;

    constructor(
        settings?: PositionSettings
   ) {
        this._settings = settings ? settings : new PositionSettings();
        this.wrapperClass = 'global-show';
    }

    position (element: HTMLElement, wrapper: HTMLElement, size: {}): void {
        const componentWrapper = wrapper;

        switch (this._settings.horizontalDirection) {
            case -1:
                this.wrapperClass += '-left';
                break;
            case -0.5:
                this.wrapperClass += '-center';
                break;
            case 0:
                this.wrapperClass += '-right';
                break;
            default:
                break;
        }

        switch (this._settings.verticalDirection) {
            case -1:
                this.wrapperClass += '-top';
                break;
            case -0.5:
                this.wrapperClass += '-middle';
                break;
            case 0:
                this.wrapperClass += '-bottom';
                break;
            default:
                break;
        }

        element.parentElement.classList.add(this.wrapperClass);

        // For test only - Remove the hard coded css
        element.parentElement.style.display = 'flex';
        element.parentElement.style.position = 'fixed';
        element.parentElement.style.alignItems = 'center';
        element.parentElement.style.justifyContent = 'center';
        element.parentElement.style.top = '0';
        element.parentElement.style.right = '0';
        element.parentElement.style.left = '0';
        element.parentElement.style.bottom = '0';
    }
}

