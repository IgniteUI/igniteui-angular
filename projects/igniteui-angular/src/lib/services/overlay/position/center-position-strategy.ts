import { IPositionStrategy } from './IPositionStrategy';
import { DOCUMENT } from '@angular/common';
import { PositionSettings } from './utilities';

export class CenterPositionStrategy implements IPositionStrategy {
    private _options: PositionSettings;
    public wrapperClass: string;

    constructor(
        private _document: any,
        options?: PositionSettings
    ) {
        this._options = options ? options : new PositionSettings();
    }

    position (element): void {
        // TODO: Below css should go to the 'global-show'.
        element.style.display = 'flex';
        element.style.position = 'fixed';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.top = '0';
        element.style.right = '0';
        element.style.left = '0';
        element.style.bottom = '0';
        element.style.zIndex = '99999';


        // TODO: Based on Alignment append suffixes and attach to the class
        this.wrapperClass = 'global-show-left';
        this.wrapperClass = 'global-show-center';
        this.wrapperClass = 'global-show-right';
        this.wrapperClass = 'global-show-top';
        this.wrapperClass = 'global-show-middle';
        this.wrapperClass = 'global-show-bottom';

        element.classList.add(this.wrapperClass);
    }
}

