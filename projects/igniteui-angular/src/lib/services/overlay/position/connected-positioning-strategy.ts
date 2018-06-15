import { IPositionStrategy } from './IPositionStrategy';
import { PositionSettings } from './../utilities';

export class ConnectedPositioningStrategy implements IPositionStrategy {
  public _settings: PositionSettings;
  // public _wrapperClass: string;

  constructor(positionSettings?: PositionSettings) {
    this._settings = positionSettings ? positionSettings : new PositionSettings();
    // this._wrapperClass = 'connected-show';
  }
  // we no longer use the element inside the position() as its dimensions are cached in rect
  position(element, wrapper, size): void {
    const componentWrapper = wrapper;
    const eWidth = size.width;
    const eHeight = size.height;

    componentWrapper.style.top = this._settings.point.y + this._settings.verticalDirection * size.height + 'px';
    componentWrapper.style.left = this._settings.point.x + this._settings.horizontalDirection * size.width + 'px';
  }
}

