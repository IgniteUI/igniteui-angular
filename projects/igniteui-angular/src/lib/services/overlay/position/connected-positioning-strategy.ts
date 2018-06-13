// import { PositionStrategyBase } from './IPositionStrategy';
import { IPositionStrategy } from './IPositionStrategy';
import { DOCUMENT } from '@angular/common';
import { PositionSettings } from './../utilities';
import { Inject } from '@angular/core';

export class ConnectedPositioningStrategy implements IPositionStrategy {
    //  TODO: rename options to settings
    public _settings: PositionSettings;
    public wrapperClass: string;

    constructor(
        positionSettings?: PositionSettings
      ) {
        this._settings = positionSettings ? positionSettings : new PositionSettings();
        this.wrapperClass = 'connected-show';
      }
        position(element, wrapper, rect): void {
        const componentWrapper = wrapper;
        const eWidth = rect.width;
        const eHeight = rect.height;

        componentWrapper.style.top = this._settings.point.y + this._settings.verticalDirection * rect.height + 'px';
        componentWrapper.style.left = this._settings.point.x + this._settings.horizontalDirection * rect.width + 'px';

        // (options defaults come from the PositionSettings)
        componentWrapper.style.position = 'absolute';
        componentWrapper.classList.add(this.wrapperClass);
    }
}

