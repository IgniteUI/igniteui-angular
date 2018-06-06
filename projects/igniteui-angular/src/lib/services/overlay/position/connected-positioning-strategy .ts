import { IPositionStrategy } from './IPositionStrategy';
import { DOCUMENT } from '@angular/common';
import { PositionSettings } from './utilities';

export class ConnectedPositioningStrategy implements IPositionStrategy  {
    private _options: PositionSettings;
    public wrapperClass: string;

    constructor(
        options?: PositionSettings
    ) {
        this._options = options ? options : new PositionSettings();
    }

    position (element): void {
        this.wrapperClass = 'connected-show';

        // (options defaults come from the PositionSettings)
        element.parentElement.style.position = 'absolute';
        // position based on point only
        element.parentElement.style.top = this._options.point.y + 'px';
        element.parentElement.style.left = this._options.point.y + 'px';

        element.parentElement.classList.add(this.wrapperClass);
    }
}

