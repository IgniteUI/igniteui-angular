import { IPositionStrategy } from './IPositionStrategy';
import { ArrowFit } from '../utilities';

/**
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay-position)
 * Position strategies determine where to display the component.
 * Used for positioning the arrow element of the IgxTooltip.
 */
export interface ITooltipPositionStrategy extends IPositionStrategy {
    /* blazorSuppress */
    /**
     * Optional
     * Position the arrow element based on the PositionStrategy implementing this interface.
     *
     * @param arrow The arrow HTML element to be positioned.
     * @param arrowFit Object containing all necessary parameters.
     * ```typescript
     * settings.positionStrategy.positionArrow(arrow, arrowFit);
     * ```
     */
    positionArrow?(arrow: HTMLElement, arrowFit: ArrowFit): void;
}
