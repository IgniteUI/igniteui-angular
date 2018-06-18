import { IPositionStrategy } from './IPositionStrategy';
import { PositionSettings, Point, HorizontalAlignment, VerticalAlignment } from './../utilities';

export class ConnectedPositioningStrategy implements IPositionStrategy {
  private _defaultSettings: PositionSettings = {
    point: new Point(0, 0),
    horizontalDirection: HorizontalAlignment.Right,
    verticalDirection: VerticalAlignment.Bottom,
    element: null,
    horizontalStartPoint: HorizontalAlignment.Left,
    verticalStartPoint: VerticalAlignment.Bottom
  };

  public settings: PositionSettings;
  constructor(settings?: PositionSettings) {
    this.settings = Object.assign(this._defaultSettings, settings);
  }

  // we no longer use the element inside the position() as its dimensions are cached in rect
  position(element, wrapper, size): void {
    const componentWrapper = wrapper;
    const eWidth = size.width;
    const eHeight = size.height;

    componentWrapper.style.top = this.settings.point.y + this.settings.verticalDirection * size.height + 'px';
    componentWrapper.style.left = this.settings.point.x + this.settings.horizontalDirection * size.width + 'px';
  }
}

