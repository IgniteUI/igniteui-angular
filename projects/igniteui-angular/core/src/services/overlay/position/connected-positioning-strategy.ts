import { scaleInVerTop, scaleOutVerTop } from 'igniteui-angular/animations';
import { ConnectedFit } from '../utilities';
import {
  HorizontalAlignment,
  Point,
  PositionSettings,
  Size,
  Util,
  VerticalAlignment
} from './../utilities';
import { IPositionStrategy } from './IPositionStrategy';

/**
 * Positions the element based on the directions and start point passed in trough PositionSettings.
 * It is possible to either pass a start point or an HTMLElement as a positioning base.
 */
export class ConnectedPositioningStrategy implements IPositionStrategy {
  /**
   * PositionSettings to use when position the component in the overlay
   */
  public settings: PositionSettings;

  private _defaultSettings: PositionSettings = {
    horizontalDirection: HorizontalAlignment.Right,
    verticalDirection: VerticalAlignment.Bottom,
    horizontalStartPoint: HorizontalAlignment.Left,
    verticalStartPoint: VerticalAlignment.Bottom,
    openAnimation: scaleInVerTop,
    closeAnimation: scaleOutVerTop,
    minSize: { width: 0, height: 0 }
  };

  constructor(settings?: PositionSettings) {
    this.settings = Object.assign({}, this._defaultSettings, settings);
  }

  /**
   * Position the element based on the PositionStrategy implementing this interface.
   *
   * @param contentElement The HTML element to be positioned
   * @param size Size of the element
   * @param document reference to the Document object
   * @param initialCall should be true if this is the initial call to the method
   * @param target attaching target for the component to show
   * ```typescript
   * settings.positionStrategy.position(content, size, document, true);
   * ```
   */
  public position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean, target?: Point | HTMLElement): void {
    const rects = this.calculateElementRectangles(contentElement, target);
    this.setStyle(contentElement, rects.targetRect, rects.elementRect, {});
  }

  /**
   * Creates clone of this position strategy
   * @returns clone of this position strategy
   */
  public clone(): IPositionStrategy {
    return Util.cloneInstance(this);
  }

  /**
   * Obtains the DomRect objects for the required elements - target and element to position
   *
   * @returns target and element DomRect objects
   */
   protected calculateElementRectangles(contentElement, target: Point | HTMLElement):
   { targetRect: Partial<DOMRect>; elementRect: Partial<DOMRect> } {
    return {
      targetRect: Util.getTargetRect(target),
      elementRect: contentElement.getBoundingClientRect() as DOMRect
    };
  }

  /**
   * Get element horizontal and vertical offsets by connectedFit
   * or `this.settings` if connectedFit offset is not defined.
   *
   * @param connectedFit
   * @returns horizontalOffset and verticalOffset
   */
  protected getElementOffsets(connectedFit: ConnectedFit): { horizontalOffset: number; verticalOffset: number } {
    return {
        horizontalOffset: connectedFit.horizontalOffset ?? Util.getHorizontalOffset(this.settings),
        verticalOffset: connectedFit.verticalOffset ?? Util.getVerticalOffset(this.settings)
    }
  }

  /**
   * Sets element's style which effectively positions provided element according
   * to provided position settings
   *
   * @param element Element to position
   * @param targetRect Bounding rectangle of strategy target
   * @param elementRect Bounding rectangle of the element
   */
  protected setStyle(element: HTMLElement, targetRect: Partial<DOMRect>, elementRect: Partial<DOMRect>, connectedFit: ConnectedFit) {
    const { horizontalOffset, verticalOffset } = this.getElementOffsets(connectedFit);

    //  clean up styles - if auto position strategy is chosen we may pass here several times
    element.style.right = '';
    element.style.left = '';
    element.style.bottom = '';
    element.style.top = '';

    // Use CSS anchor positioning if configured by overlay service
    if (element.style.getPropertyValue('position-anchor')) {
      this.setAnchorStyle(element, horizontalOffset, verticalOffset);
      return;
    }

    // Clear any anchor-related styles when falling back to JS positioning
    element.style.translate = '';

    const startPoint: Point = {
      x: targetRect.right + targetRect.width * this.settings.horizontalStartPoint + horizontalOffset,
      y: targetRect.bottom + targetRect.height * this.settings.verticalStartPoint + verticalOffset
    };
    const wrapperRect: ClientRect = element.parentElement.getBoundingClientRect();

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

  /**
   * Positions the element using CSS anchor positioning.
   * Uses the anchor() function to position relative to the anchor element
   * referenced by the position-anchor CSS property set by the overlay service.
   *
   * @param element Element to position
   * @param horizontalOffset Horizontal offset in pixels
   * @param verticalOffset Vertical offset in pixels
   */
  protected setAnchorStyle(element: HTMLElement, horizontalOffset: number, verticalOffset: number) {
    const hSide = this.getHorizontalAnchorSide(this.settings.horizontalStartPoint);
    const vSide = this.getVerticalAnchorSide(this.settings.verticalStartPoint);

    let translateX = '';
    let translateY = '';

    // Horizontal positioning using anchor() function
    switch (this.settings.horizontalDirection) {
      case HorizontalAlignment.Left:
        // Element opens to the left: right edge at anchor's start point
        element.style.right = horizontalOffset
          ? `calc(anchor(${hSide}) + ${-horizontalOffset}px)`
          : `anchor(${hSide})`;
        break;
      case HorizontalAlignment.Center:
        // Element centered at anchor's start point
        element.style.left = horizontalOffset
          ? `calc(anchor(${hSide}) + ${horizontalOffset}px)`
          : `anchor(${hSide})`;
        translateX = '-50%';
        break;
      case HorizontalAlignment.Right:
        // Element opens to the right: left edge at anchor's start point
        element.style.left = horizontalOffset
          ? `calc(anchor(${hSide}) + ${horizontalOffset}px)`
          : `anchor(${hSide})`;
        break;
    }

    // Vertical positioning using anchor() function
    switch (this.settings.verticalDirection) {
      case VerticalAlignment.Top:
        // Element opens upward: bottom edge at anchor's start point
        element.style.bottom = verticalOffset
          ? `calc(anchor(${vSide}) + ${-verticalOffset}px)`
          : `anchor(${vSide})`;
        break;
      case VerticalAlignment.Middle:
        // Element centered vertically at anchor's start point
        element.style.top = verticalOffset
          ? `calc(anchor(${vSide}) + ${verticalOffset}px)`
          : `anchor(${vSide})`;
        translateY = '-50%';
        break;
      case VerticalAlignment.Bottom:
        // Element opens downward: top edge at anchor's start point
        element.style.top = verticalOffset
          ? `calc(anchor(${vSide}) + ${verticalOffset}px)`
          : `anchor(${vSide})`;
        break;
    }

    // Use CSS translate property for centering (independent of transform used by Auto/Elastic push/shrink)
    if (translateX || translateY) {
      element.style.translate = `${translateX || '0'} ${translateY || '0'}`;
    } else {
      element.style.translate = '';
    }
  }

  /**
   * Maps a HorizontalAlignment start point to its CSS anchor side name.
   */
  private getHorizontalAnchorSide(startPoint: HorizontalAlignment): string {
    switch (startPoint) {
      case HorizontalAlignment.Left: return 'left';
      case HorizontalAlignment.Center: return 'center';
      case HorizontalAlignment.Right: return 'right';
      default: return 'left';
    }
  }

  /**
   * Maps a VerticalAlignment start point to its CSS anchor side name.
   */
  private getVerticalAnchorSide(startPoint: VerticalAlignment): string {
    switch (startPoint) {
      case VerticalAlignment.Top: return 'top';
      case VerticalAlignment.Middle: return 'center';
      case VerticalAlignment.Bottom: return 'bottom';
      default: return 'top';
    }
  }
}
