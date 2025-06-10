import { first } from '../../core/utils';
import { AutoPositionStrategy } from '../../services/overlay/position/auto-position-strategy';
import { ConnectedFit, HorizontalAlignment, Point, PositionSettings, Size, VerticalAlignment } from '../../services/overlay/utilities';
import { useAnimation } from '@angular/animations';
import { fadeOut, scaleInCenter } from 'igniteui-angular/animations';

export const TooltipRegexes = Object.freeze({
    /** Matches horizontal `Placement` end positions. `left-end` | `right-end` */
    horizontalEnd: /^(left|right)-end$/,

    /** Matches vertical `Placement` centered positions. `left` | `right` */
    horizontalCenter:  /^(left|right)$/,

    /**
     * Matches vertical `Placement` positions.
     * `top` | `top-start` | `top-end` | `bottom` | `bottom-start` | `bottom-end`
     */
    vertical:  /^(top|bottom)(-(start|end))?$/,

    /** Matches vertical `Placement` end positions. `top-end` | `bottom-end` */
    verticalEnd: /^(top|bottom)-end$/,

    /** Matches vertical `Placement` centered positions. `top` | `bottom` */
    verticalCenter:  /^(top|bottom)$/,
});

export interface ArrowFit {
    /** Rectangle of the arrow element. */
    readonly arrowRect?: Partial<DOMRect>;
    /** Rectangle of the tooltip element. */
    readonly tooltipRect?: Partial<DOMRect>;
    /** Direction in which the arrow points. */
    readonly direction?: 'top' | 'bottom' | 'right' | 'left';
    /** Vertical offset of the arrow element from the tooltip */
    top?: number;
    /** Horizontal offset of the arrow element from the tooltip */
    left?: number;
}

/**
 * Defines the possible positions for the tooltip relative to its target.
 */
export enum Placement {
    Top = 'top',
    TopStart = 'top-start',
    TopEnd = 'top-end',
    Bottom = 'bottom',
    BottomStart = 'bottom-start',
    BottomEnd = 'bottom-end',
    Right = 'right',
    RightStart = 'right-start',
    RightEnd = 'right-end',
    Left = 'left',
    LeftStart = 'left-start',
    LeftEnd = 'left-end'
}

/**
 * Default tooltip position settings.
 */
export const TooltipPositionSettings: PositionSettings = {
    horizontalDirection: HorizontalAlignment.Center,
    horizontalStartPoint: HorizontalAlignment.Center,
    verticalDirection: VerticalAlignment.Bottom,
    verticalStartPoint: VerticalAlignment.Bottom,
    openAnimation: useAnimation(scaleInCenter, { params: { duration: '150ms' } }),
    closeAnimation: useAnimation(fadeOut, { params: { duration: '75ms' } }),
    offset: 6
};

export class TooltipPositionStrategy extends AutoPositionStrategy {

    private _placement: Placement;

    constructor(settings?: PositionSettings) {
        if (settings) {
            settings = Object.assign({}, TooltipPositionSettings, settings);
        }

        super(settings || TooltipPositionSettings);
    }

    public override position(
        contentElement: HTMLElement,
        size: Size,
        document?: Document,
        initialCall?: boolean,
        target?: Point | HTMLElement
    ): void {
        super.position(contentElement, size, document, initialCall, target);

        const tooltip = contentElement.children?.[0];
        this.configArrow(tooltip);
    }

    protected override fitInViewport(element: HTMLElement, connectedFit: ConnectedFit): void {
        super.fitInViewport(element, connectedFit);

        const tooltip = element.children?.[0];
        this.configArrow(tooltip);
    }

    /**
     * Sets the position of the arrow relative to the tooltip element.
     *
     * @param arrow the arrow element of the tooltip.
     * @param arrowFit arrowFit object containing all necessary parameters.
     */
    public positionArrow(arrow: HTMLElement, arrowFit: ArrowFit): void {
        this.resetArrowPositionStyles(arrow);

        const convert = (value: number) => {
            if (!value) {
                return '';
            }
            return `${value}px`
        };

        Object.assign(arrow.style, {
            top: convert(arrowFit.top),
            left: convert(arrowFit.left),
            [arrowFit.direction]: convert(-4),
        });
    }

    /**
     * Resets the element's top / bottom / left / right style properties.
     *
     * @param arrow the arrow element of the tooltip.
     */
    private resetArrowPositionStyles(arrow: HTMLElement): void {
        arrow.style.top = '';
        arrow.style.bottom = '';
        arrow.style.left = '';
        arrow.style.right = '';
    }

    /**
     * Gets values for `top` or `left` position styles.
     *
     * @param arrowRect
     * @param tooltipRect
     * @param positionProperty - for which position property to get style values.
     */
    private getArrowPositionStyles(
        arrowRect: Partial<DOMRect>,
        tooltipRect: Partial<DOMRect>,
        positionProperty: 'top' | 'left'
    ): number {
        const arrowSize = arrowRect.width > arrowRect.height
            ? arrowRect.width
            : arrowRect.height;

        const tooltipSize = TooltipRegexes.vertical.test(this._placement)
            ? tooltipRect.width
            : tooltipRect.height;

        const direction = {
            top: 'horizontal',
            left: 'vertical',
        }[positionProperty];

        const center = `${direction}Center`;
        const end = `${direction}End`;

        if (TooltipRegexes[center].test(this._placement)) {
            const offset = tooltipSize / 2 - arrowSize / 2;
            return Math.round(offset);
        }
        if (TooltipRegexes[end].test(this._placement)) {
            const endOffset = TooltipRegexes.vertical.test(this._placement) ? 8 : 4;
            const offset = tooltipSize - (endOffset + arrowSize);
            return Math.round(offset);
        }
        return 0;
    }

    /**
     * Configure arrow class and arrowFit.
     *
     * @param tooltip tooltip element.
     */
    private configArrow(tooltip: Element): void {
        if (!tooltip) {
            return;
        }

        const arrow = tooltip.querySelector('div[data-arrow="true"]') as HTMLElement;

        // If display is none -> tooltipTarget's hasArrow is false
        if (!arrow || arrow.style.display === 'none') {
            return;
        }

        this._placement = this.getPlacementByPositionSettings(this.settings) ?? Placement.Bottom;
        const tooltipDirection = first(this._placement.split('-'));
        arrow.className = `igx-tooltip--${tooltipDirection}`;

        // Arrow direction is the opposite of tooltip direction.
        const direction = this.getOppositeDirection(tooltipDirection) as 'top' | 'right' | 'bottom' | 'left';
        const arrowRect = arrow.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const top = this.getArrowPositionStyles(arrowRect, tooltipRect, 'top');
        const left = this.getArrowPositionStyles(arrowRect, tooltipRect, 'left');

        const arrowFit: ArrowFit = {
            direction,
            arrowRect,
            tooltipRect,
            top,
            left,
        };

        this.positionArrow(arrow, arrowFit);
    }

    /**
     * Gets the placement that correspond to the given position settings.
     * Returns `undefined` if the position settings do not match any of the predefined placement values.
     *
     * @param settings Position settings for which to get the corresponding placement.
     */
    private getPlacementByPositionSettings(settings: PositionSettings): Placement {
        const { horizontalDirection, horizontalStartPoint, verticalDirection, verticalStartPoint } = settings;

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

    /**
    * Gets opposite direction, e.g., top -> bottom
    *
    * @param direction for which direction to return its opposite.
    * @returns `top` | `bottom` | `right` | `left`
    */
    private getOppositeDirection(direction: string): string {
        const opposite = {
            top: 'bottom',
            right: 'left',
            bottom: 'top',
            left: 'right',
        }[direction];

        return opposite;
    }
}

/**
 * Maps the predefined placement values to the corresponding directions and starting points.
 */
export const PositionsMap = new Map<Placement, PositionSettings>([
    [Placement.Top, {
        horizontalDirection: HorizontalAlignment.Center,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Top,
        verticalStartPoint: VerticalAlignment.Top,
    }],
    [Placement.TopStart, {
        horizontalDirection: HorizontalAlignment.Right,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Top,
        verticalStartPoint: VerticalAlignment.Top,
    }],
    [Placement.TopEnd, {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Top,
        verticalStartPoint: VerticalAlignment.Top,
    }],
    [Placement.Bottom, {
        horizontalDirection: HorizontalAlignment.Center,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Bottom,
    }],
    [Placement.BottomStart, {
        horizontalDirection: HorizontalAlignment.Right,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Bottom,
    }],
    [Placement.BottomEnd, {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Bottom,
    }],
    [Placement.Right, {
        horizontalDirection: HorizontalAlignment.Right,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Middle,
        verticalStartPoint: VerticalAlignment.Middle,
    }],
    [Placement.RightStart, {
        horizontalDirection: HorizontalAlignment.Right,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Top,
    }],
    [Placement.RightEnd, {
        horizontalDirection: HorizontalAlignment.Right,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Top,
        verticalStartPoint: VerticalAlignment.Bottom,
    }],
    [Placement.Left, {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Middle,
        verticalStartPoint: VerticalAlignment.Middle,
    }],
    [Placement.LeftStart, {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Top,
    }],
    [Placement.LeftEnd, {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Top,
        verticalStartPoint: VerticalAlignment.Bottom,
    }]
]);
