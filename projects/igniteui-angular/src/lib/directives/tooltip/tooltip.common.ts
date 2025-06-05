import { AutoPositionStrategy } from '../../services/overlay/position/auto-position-strategy';
import { ArrowFit, Placement, PositionSettings } from '../../services/overlay/utilities';
import { useAnimation } from '@angular/animations';
import { fadeOut, scaleInCenter } from 'igniteui-angular/animations';
import { ITooltipPositionStrategy } from '../../services/overlay/position/ITooltipPositionStrategy';

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

export class TooltipPositionStrategy extends AutoPositionStrategy implements ITooltipPositionStrategy {

    constructor(settings?: PositionSettings) {
        const positionSettings: PositionSettings = {
            openAnimation: useAnimation(scaleInCenter, { params: { duration: '150ms' } }),
            closeAnimation: useAnimation(fadeOut, { params: { duration: '75ms' } }),
            placement: Placement.Bottom,
            offset: 6
        };

        if (settings) {
            settings = Object.assign({}, positionSettings, settings);
        }

        super(settings);
    }

    /**
     * Sets the position of the arrow relative to the tooltip element.
     *
     * @param arrow the arrow element of the tooltip.
     * @param arrowFit arrowFit object containing all necessary parameters.
     */
    public positionArrow(arrow: HTMLElement, arrowFit: ArrowFit) {
        this._resetArrowPositionStyles(arrow);

        const convert = (value: number) => {
            if (!value) {
                return '';
            }
            return `${value}px`
        };

        const top = this._getArrowPositionStyles(arrowFit.tooltipPlacement, arrowFit.arrowRect, arrowFit.tooltipRect, 'horizontal');
        const left = this._getArrowPositionStyles(arrowFit.tooltipPlacement, arrowFit.arrowRect, arrowFit.tooltipRect, 'vertical');

        Object.assign(arrow.style, {
            top: convert(top),
            left: convert(left),
            [arrowFit.direction]: convert(-4),
        });
    }

    private _resetArrowPositionStyles(arrow: HTMLElement): void {
        arrow.style.top = '';
        arrow.style.bottom = '';
        arrow.style.left = '';
        arrow.style.right = '';
    }

    private _getArrowPositionStyles(
        placement: Placement,
        arrowRect: Partial<DOMRect>,
        tooltipRect: Partial<DOMRect>,
        direction: 'horizontal' | 'vertical'
    ): number {
        const arrowSize = arrowRect.width > arrowRect.height
            ? arrowRect.width
            : arrowRect.height;

        const tooltipSize = TooltipRegexes.vertical.test(placement)
            ? tooltipRect.width
            : tooltipRect.height;

        const center = `${direction}Center`
        const end = `${direction}End`

        if (TooltipRegexes[center].test(placement)) {
            const offset = tooltipSize / 2 - arrowSize / 2;
            return Math.round(offset);
        }
        if (TooltipRegexes[end].test(placement)) {
            const endOffset = TooltipRegexes.vertical.test(placement) ? 8 : 4;
            const offset = tooltipSize - (endOffset + arrowSize);
            return Math.round(offset);
        }
        return 0;
    }
}
