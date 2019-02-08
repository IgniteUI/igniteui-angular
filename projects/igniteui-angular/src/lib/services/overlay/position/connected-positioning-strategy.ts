import { IPositionStrategy } from './IPositionStrategy';
import { PositionSettings, Point, HorizontalAlignment, VerticalAlignment, getPointFromPositionsSettings, Size } from './../utilities';
import { scaleInVerTop, scaleOutVerTop } from '../../../animations/main';

export class ConnectedPositioningStrategy implements IPositionStrategy {
  private _defaultSettings: PositionSettings = {
    // default Point(0, 0) in getPointFromPositionsSettings
    target: null,
    horizontalDirection: HorizontalAlignment.Right,
    verticalDirection: VerticalAlignment.Bottom,
    horizontalStartPoint: HorizontalAlignment.Left,
    verticalStartPoint: VerticalAlignment.Bottom,
    openAnimation: scaleInVerTop,
    closeAnimation: scaleOutVerTop,
    minSize: { width: 0, height: 0 }
  };

  /** @inheritdoc */
  public settings: PositionSettings;

  constructor(settings?: PositionSettings) {
    this.settings = Object.assign({}, this._defaultSettings, settings);
  }

  position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean, minSize?: Size): void {
    const startPoint = getPointFromPositionsSettings(this.settings, contentElement.parentElement);

    //  TODO: extract transform setting in util function
    let transformString = '';
    const xLocation = Math.round(startPoint.x + this.settings.horizontalDirection * size.width);
    const yLocation = Math.round(startPoint.y + this.settings.verticalDirection * size.height);
    transformString += `translateX(${xLocation}px) `;
    transformString += `translateY(${yLocation}px)`;
    contentElement.style.transform = transformString.trim();
  }
}

