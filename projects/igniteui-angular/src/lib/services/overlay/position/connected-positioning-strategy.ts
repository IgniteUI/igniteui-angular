import { IPositionStrategy } from './IPositionStrategy';
import {
  HorizontalAlignment,
  Point,
  PositionSettings,
  Size,
  Util,
  VerticalAlignment
} from './../utilities';
import { scaleInVerTop, scaleOutVerTop } from '../../../animations/main';
import { ConnectedFit } from '../utilities';

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

  /**
   * Obtains the ClientRect objects for the required elements - target and element to position
   * @returns target and element ClientRect objects
   */
  protected calculateElementRectangles(contentElement): { targetRect: ClientRect, elementRect: ClientRect } {
      return {
          targetRect: Util.getTargetRect(this.settings),
          elementRect: contentElement.getBoundingClientRect() as ClientRect
      };
  }

  /** @inheritdoc */
  position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean): void {
    const rects =  this.calculateElementRectangles(contentElement);
    this.setStyle(contentElement, rects.targetRect, rects.elementRect, {});
  }

  /**
   * @inheritdoc
   * Creates clone of this position strategy
   * @returns clone of this position strategy
   */
  clone(): IPositionStrategy {
    return Util.cloneInstance(this);
  }

  /**
   * Sets element's style which effectively positions provided element according
   * to provided position settings
   * @param element Element to position
   * @param targetRect Bounding rectangle of strategy target
   * @param elementRect Bounding rectangle of the element
   */
  protected setStyle(element: HTMLElement, targetRect: ClientRect, elementRect: ClientRect, connectedFit: ConnectedFit) {
      const horizontalOffset = connectedFit.horizontalOffset ? connectedFit.horizontalOffset : 0;
      const verticalOffset = connectedFit.verticalOffset ? connectedFit.verticalOffset : 0;
    const startPoint: Point = {
      x: targetRect.right + targetRect.width * this.settings.horizontalStartPoint + horizontalOffset,
      y: targetRect.bottom + targetRect.height * this.settings.verticalStartPoint + verticalOffset
    };
    const wrapperRect: ClientRect = element.parentElement.getBoundingClientRect();

    //  clean up styles - if auto position strategy is chosen we may pass here several times
    element.style.right = '';
    element.style.left = '';
    element.style.bottom = '';
    element.style.top = '';

    switch (this.settings.horizontalDirection) {
      case HorizontalAlignment.Left:
        element.style.right = `${Math.round(wrapperRect.right - startPoint.x)}px`;
        break;
      case HorizontalAlignment.Center:
        element.style.left = `${Math.round(startPoint.x - wrapperRect.left - elementRect.width / 2)}px`;
        break;
      case HorizontalAlignment.Right:
        element.style.left = `${Math.round(startPoint.x - wrapperRect.left)}px`;
        break;
    }

    switch (this.settings.verticalDirection) {
      case VerticalAlignment.Top:
        element.style.bottom = `${Math.round(wrapperRect.bottom - startPoint.y)}px`;
        break;
      case VerticalAlignment.Middle:
        element.style.top = `${Math.round(startPoint.y - wrapperRect.top - elementRect.height / 2)}px`;
        break;
      case VerticalAlignment.Bottom:
        element.style.top = `${Math.round(startPoint.y - wrapperRect.top)}px`;
        break;
    }
  }
}
