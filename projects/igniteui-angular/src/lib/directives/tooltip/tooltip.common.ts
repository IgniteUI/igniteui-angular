import { AutoPositionStrategy } from '../../services/overlay/position/auto-position-strategy';
import { ConnectedFit, HorizontalAlignment, PositionSettings, VerticalAlignment } from '../../services/overlay/utilities';
import { TooltipPlacement } from './enums';

export const TooltipRegexes = Object.freeze({
  /** Matches horizontal `PopoverPlacement` start positions. */
  horizontalStart: /^(left|right)-start$/,

  /** Matches horizontal `PopoverPlacement` end positions. */
  horizontalEnd: /^(left|right)-end$/,

  /** Matches vertical `PopoverPlacement` start positions. */
  start: /start$/,

  /** Matches vertical `PopoverPlacement` end positions. */
  end: /end$/,
});

export const PositionsMap = new Map<TooltipPlacement, PositionSettings>([
    ['top', {
        horizontalDirection: HorizontalAlignment.Center,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Top,
        verticalStartPoint: VerticalAlignment.Top,
    }],
    ['top-start', {
        horizontalDirection: HorizontalAlignment.Right,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Top,
        verticalStartPoint: VerticalAlignment.Top,
    }],
    ['top-end', {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Top,
        verticalStartPoint: VerticalAlignment.Top,
    }],
    ['bottom', {
        horizontalDirection: HorizontalAlignment.Center,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Bottom,
    }],
    ['bottom-start', {
        horizontalDirection: HorizontalAlignment.Right,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Bottom,
    }],
    ['bottom-end', {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Bottom,
    }],
    ['right', {
        horizontalDirection: HorizontalAlignment.Right,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Middle,
        verticalStartPoint: VerticalAlignment.Middle,
    }],
    ['right-start', {
        horizontalDirection: HorizontalAlignment.Right,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Top,
    }],
    ['right-end', {
        horizontalDirection: HorizontalAlignment.Right,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Top,
        verticalStartPoint: VerticalAlignment.Bottom,
    }],
    ['left', {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Middle,
        verticalStartPoint: VerticalAlignment.Middle,
    }],
    ['left-start', {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Top,
    }],
    ['left-end', {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Top,
        verticalStartPoint: VerticalAlignment.Bottom,
    }]
]);

export class IgxTooltipPositionStrategy extends AutoPositionStrategy {

    constructor(
        settings: PositionSettings,
        private _placement: TooltipPlacement,
        private _offSet: number
    ) {
        super(settings);
    }

    protected override setStyle(
        element: HTMLElement,
        targetRect: Partial<DOMRect>,
        elementRect: Partial<DOMRect>,
        connectedFit: ConnectedFit
    ): void {
        switch (this._placement) {
            case 'top':
            case 'top-start':
            case 'top-end':
                connectedFit.verticalOffset = -this._offSet;
                connectedFit.horizontalOffset = 0;
                break;

            case 'bottom':
            case 'bottom-start':
            case 'bottom-end':
                connectedFit.verticalOffset = this._offSet;
                connectedFit.horizontalOffset = 0;
                break;

            case 'right':
            case 'right-start':
            case 'right-end':
                connectedFit.verticalOffset = 0;
                connectedFit.horizontalOffset = this._offSet;
                break;

            case 'left':
            case 'left-start':
            case 'left-end':
                connectedFit.verticalOffset = 0;
                connectedFit.horizontalOffset = -this._offSet;
                break;
            default:
                break;
        }

        super.setStyle(element, targetRect, elementRect, connectedFit);
    }
}
