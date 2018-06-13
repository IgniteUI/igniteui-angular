import { PositionSettings } from './../utilities';
import { IPositionStrategy } from './IPositionStrategy';

export class AutoPositionStrategy implements IPositionStrategy {
    public _wrapperClass: string;
    public _settings: PositionSettings;

    constructor(settings?: PositionSettings) {
        this._settings = settings ? settings : new PositionSettings();
        this._wrapperClass = 'auto-show';
    }

    position(element): void {
        element.parentElement.style.display = 'block';
        element.parentElement.style.position = 'absolute';
        element.parentElement.style.top = ((this._settings.point.y >= 0) ?
            (this._settings.point.y + 'px') : 0);
        element.parentElement.style.right = '0';
        element.parentElement.style.left = ((this._settings.point.x >= 0) ?
            (this._settings.point.x + 'px') : 0);
        element.parentElement.style.bottom = '0';

        // We need the element's dimensions in order to calculate its' position
        const elementheight = element.getBoundingClientRect().height;
        const windowheight = window.innerHeight;
        console.log(elementheight); // returns 0
        console.log(windowheight);

        element.parentElement.classList.add(this._wrapperClass);
    }
}
