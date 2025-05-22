import { AutoPositionStrategy } from '../../services/overlay/position/auto-position-strategy';
import { ConnectedFit, HorizontalAlignment, Point, PositionSettings, Size, VerticalAlignment } from '../../services/overlay/utilities';
import { IgxTooltipTargetDirective } from './tooltip-target.directive';
import { TooltipPlacement } from './enums';
import { first } from '../../core/utils';

export const TooltipRegexes = Object.freeze({
    /** Used for parsing the strings passed in the tooltip `show/hide-trigger` properties. */
    triggers: /[,\s]+/,

    /** Matches horizontal `TooltipPlacement` end positions. `left-end` | `right-end` */
    horizontalEnd: /^(left|right)-end$/,

    /** Matches vertical `TooltipPlacement` centered positions. `left` | `right` */
    horizontalCenter:  /^(left|right)$/,

    /**
     * Matches vertical `TooltipPlacement` positions.
     * `top` | `top-start` | `top-end` | `bottom` | `bottom-start` | `bottom-end`
     */
    vertical:  /^(top|bottom)(-(start|end))?$/,

    /** Matches vertical `TooltipPlacement` end positions. `top-end` | `bottom-end` */
    verticalEnd: /^(top|bottom)-end$/,

    /** Matches vertical `TooltipPlacement` centered positions. `top` | `bottom` */
    verticalCenter:  /^(top|bottom)$/,
});

export function parseTriggers(triggerString: string): Set<string> {
    return new Set(
        (triggerString ?? '')
            .split(TooltipRegexes.triggers)
            .map(s => s.trim())
            .filter(Boolean)
    );
}

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

export class TooltipPositionStrategy extends AutoPositionStrategy {
    private _placement: TooltipPlacement;
    private _offSet: number;
    private _arrow: HTMLElement;
    private _tooltipSize: DOMRect;

    constructor(
        settings: PositionSettings,
        tooltipTarget: IgxTooltipTargetDirective
    ) {
        super(settings);

        this._placement = tooltipTarget.placement;
        this._offSet = tooltipTarget.offset;
        this._arrow = tooltipTarget.target.arrow;
    }

    public override position(
        contentElement: HTMLElement,
        size: Size,
        document?: Document,
        initialCall?: boolean,
        target?: Point | HTMLElement
    ): void {
        this._tooltipSize = contentElement.getBoundingClientRect();
        this.positionArrow(this._arrow, this._placement);
        super.position(contentElement, size, document, initialCall, target);
    }

    protected override fitInViewport(element: HTMLElement, connectedFit: ConnectedFit): void {
        super.fitInViewport(element, connectedFit);

        this._placement = this._getPlacementByPositionSettings(this.settings);
        this.positionArrow(this._arrow, this._placement);
    }

    /**
     * Sets the position of the arrow relative to the tooltip element.
     *
     * @param arrow the arrow element of the tooltip.
     * @param placement the placement of the tooltip. Used to determine where the arrow should render.
     */
    protected positionArrow(arrow: HTMLElement, placement: TooltipPlacement) {
        this._resetArrowPositionStyles(arrow);

        const currentPlacement = first(placement.split('-'));

        // The opposite side where the arrow element should render based on the `currentPlacement`
        const staticSide = {
            top: 'bottom',
            right: 'left',
            bottom: 'top',
            left: 'right',
        }[currentPlacement]!;

        arrow.className = `igx-tooltip--${currentPlacement}`;

        Object.assign(arrow.style, {
            top: this._getArrowPositionStyles(placement, arrow, 'horizontal'),
            left: this._getArrowPositionStyles(placement, arrow, 'vertical'),
            [staticSide]: '-4px',
        });
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

    private _resetArrowPositionStyles(arrow: HTMLElement): void {
        arrow.style.top = '';
        arrow.style.bottom = '';
        arrow.style.left = '';
        arrow.style.right = '';
    }

    private _getArrowPositionStyles(placement: TooltipPlacement, arrow: HTMLElement, direction: 'horizontal' | 'vertical') {
        const arrowRects = arrow.getBoundingClientRect();

        const arrowSize = TooltipRegexes.vertical.test(placement)
            ? arrowRects.width
            : arrowRects.height;

        const tooltipSize = TooltipRegexes.vertical.test(placement)
            ? this._tooltipSize.width
            : this._tooltipSize.height;

        const center = `${direction}Center`
        const end = `${direction}End`

        if (TooltipRegexes[center].test(placement)) {
            const offset = tooltipSize / 2 - arrowSize / 2;
            return `${Math.round(offset)}px`;
        }
        if (TooltipRegexes[end].test(placement)) {
            const endOffset = TooltipRegexes.vertical.test(placement) ? 8 : 4;
            const offset = tooltipSize - (endOffset + arrowSize);
            return `${Math.round(offset)}px`;
        }

        return '';
    }

    private _getPlacementByPositionSettings(settings: PositionSettings): TooltipPlacement {
        const { horizontalDirection, horizontalStartPoint, verticalDirection, verticalStartPoint }  = settings;

        const mapArray = Array.from(PositionsMap.entries());
        const placement = mapArray.find(
            ([_, val]) =>
                val.horizontalDirection === horizontalDirection &&
                val.horizontalStartPoint === horizontalStartPoint &&
                val.verticalDirection === verticalDirection &&
                val.verticalStartPoint === verticalStartPoint
        );

        return placement ? placement[0] : undefined;
    }
}
