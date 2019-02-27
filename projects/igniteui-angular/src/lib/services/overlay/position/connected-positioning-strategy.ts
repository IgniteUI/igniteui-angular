import { IPositionStrategy } from './IPositionStrategy';
import {
  getPointFromPositionsSettings,
  getViewportRect,
  HorizontalAlignment,
  PositionSettings,
  Point,
  Size,
  VerticalAlignment,
  cloneInstance
} from './../utilities';
import { scaleInVerTop, scaleOutVerTop } from '../../../animations/main';

/**
 * Positions the element based on the directions and start point passed in trough PositionSettings.
 * It is possible to either pass a start point or an HTMLElement as a positioning base.
 */
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

  position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean): void {
    const startPoint = getPointFromPositionsSettings(this.settings, contentElement.parentElement);
    this.setStyle(contentElement, startPoint, this.settings);
  }

  clone(): IPositionStrategy {
    return cloneInstance(this);
  }

  protected setStyle(contentElement: HTMLElement, startPont: Point, settings: PositionSettings) {
    const size = contentElement.getBoundingClientRect();
    const wrapperRect: ClientRect = contentElement.parentElement.getBoundingClientRect();

    //  clean up styles - if auto position strategy is chosen we may pass here several times
    contentElement.style.right = '';
    contentElement.style.left = '';
    contentElement.style.bottom = '';
    contentElement.style.top = '';

    switch (settings.horizontalDirection) {
      case HorizontalAlignment.Left:
        contentElement.style.right = `${Math.round(wrapperRect.right - startPont.x)}px`;
        break;
      case HorizontalAlignment.Center:
        contentElement.style.left = `${Math.round(startPont.x - wrapperRect.left - size.width / 2)}px`;
        break;
      case HorizontalAlignment.Right:
        contentElement.style.left = `${Math.round(startPont.x - wrapperRect.left)}px`;
        break;
    }

    switch (settings.verticalDirection) {
      case VerticalAlignment.Top:
        contentElement.style.bottom = `${Math.round(wrapperRect.bottom - startPont.y)}px`;
        break;
      case VerticalAlignment.Middle:
        contentElement.style.top = `${Math.round(startPont.y - wrapperRect.top - size.height / 2)}px`;
        break;
      case VerticalAlignment.Bottom:
        contentElement.style.top = `${Math.round(startPont.y - wrapperRect.top)}px`;
        break;
    }
  }
}
