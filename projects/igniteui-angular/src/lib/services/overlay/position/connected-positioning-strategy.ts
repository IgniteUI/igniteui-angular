import { IPositionStrategy } from './IPositionStrategy';
import { DOCUMENT } from '@angular/common';
import { PositionSettings } from './../utilities';

export class ConnectedPositioningStrategy implements IPositionStrategy {
    //  TODO: rename options to settings
    public _options: PositionSettings;
    public wrapperClass: string;

    constructor(
        positionSettings?: PositionSettings
    ) {
        this._options = positionSettings ? positionSettings : new PositionSettings();
    }

    position(element): void {
        // TODO: initialize this once, e.g. in the constructor
        this.wrapperClass = 'connected-show';

        // (options defaults come from the PositionSettings)
        element.parentElement.style.position = 'absolute';
        // position based on point only
        element.parentElement.style.top = this._options.point.y + 'px';
        element.parentElement.style.left = this._options.point.x + 'px';

        element.parentElement.classList.add(this.wrapperClass);
    }
}

