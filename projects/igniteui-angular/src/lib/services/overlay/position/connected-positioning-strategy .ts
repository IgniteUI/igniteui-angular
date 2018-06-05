import { IPositionStrategy } from './IPositionStrategy';
import { DOCUMENT } from '@angular/common';
import { PositionSettings } from './utilities';

export class ConnectedPositioningStrategy implements IPositionStrategy  {
    private _options: PositionSettings;
    public wrapperClass: string;

    constructor(
        private _document: any,
        options?: PositionSettings
    ) {
        this._options = options ? options : new PositionSettings();
    }

    position (element, options): void {
        // (options defaults come from the PositionSettings)
    }
}

