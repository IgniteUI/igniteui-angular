import { IPositionStrategy } from './IPositionStrategy';
import { PositionSettings } from './../utilities';

export class ConnectedPositioningStrategy implements IPositionStrategy {
  public _settings: PositionSettings;
  // public _wrapperClass: string;

  constructor(positionSettings?: PositionSettings) {
    this._settings = positionSettings ? positionSettings : new PositionSettings();
    // this._wrapperClass = 'connected-show';
  }
  position(element, wrapper, rect): void {
    const componentWrapper = wrapper;
    const eWidth = rect.width;
    const eHeight = rect.height;

    componentWrapper.style.top = this._settings.point.y + this._settings.verticalDirection * rect.height + 'px';
    componentWrapper.style.left = this._settings.point.x + this._settings.horizontalDirection * rect.width + 'px';
  }
}

