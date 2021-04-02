import { ConnectedFit, HorizontalAlignment, VerticalAlignment } from '../utilities';
import { BaseFitPositionStrategy } from './base-fit-position-strategy';

/**
 * Positions the element as in **Connected** positioning strategy and resize the element
 * to fit in the view port in case the element is partially getting out of view
 */
export class ElasticPositionStrategy extends BaseFitPositionStrategy {
    /** @inheritdoc */
    protected fitInViewport(element: HTMLElement, connectedFit: ConnectedFit) {
        element.classList.add('igx-overlay__content--elastic');
        const transformString: string[] = [];
        if (connectedFit.fitHorizontal.back < 0 || connectedFit.fitHorizontal.forward < 0) {
            const maxReduction = Math.max(0, connectedFit.contentElementRect.width - this.settings.minSize.width);
            const leftExtend = Math.max(0, -connectedFit.fitHorizontal.back);
            const rightExtend = Math.max(0, -connectedFit.fitHorizontal.forward);
            const reduction = Math.min(maxReduction, leftExtend + rightExtend);
            element.style.width = `${connectedFit.contentElementRect.width - reduction}px`;

            //  if direction is center and element goes off the screen in left direction we should push the
            //  element to the right. Prevents left still going out of view when normally positioned
            if (this.settings.horizontalDirection === HorizontalAlignment.Center) {
                //  the amount of translation depends on whether element goes off the screen to the left,
                //  to the right or in both directions, as well as how much it goes of the screen and finally
                //  on the minSize. The translation should be proportional between left and right extend
                //  taken from the reduction
                const translation = leftExtend * reduction / (leftExtend + rightExtend);
                if (translation > 0) {
                    transformString.push(`translateX(${translation}px)`);
                }
            }
        }

        if (connectedFit.fitVertical.back < 0 || connectedFit.fitVertical.forward < 0) {
            const maxReduction = Math.max(0, connectedFit.contentElementRect.height - this.settings.minSize.height);
            const topExtend = Math.max(0, -connectedFit.fitVertical.back);
            const bottomExtend = Math.max(0, -connectedFit.fitVertical.forward);
            const reduction = Math.min(maxReduction, topExtend + bottomExtend);
            element.style.height = `${connectedFit.contentElementRect.height - reduction}px`;

            //  if direction is middle and element goes off the screen in top direction we should push the
            //  element to the bottom. Prevents top still going out of view when normally positioned
            if (this.settings.verticalDirection === VerticalAlignment.Middle) {
                //  the amount of translation depends on whether element goes off the screen to the top,
                //  to the bottom or in both directions, as well as how much it goes of the screen and finally
                //  on the minSize. The translation should be proportional between top and bottom extend
                //  taken from the reduction
                const translation = topExtend * reduction / (topExtend + bottomExtend);
                if (translation > 0) {
                    transformString.push(`translateY(${translation}px)`);
                }
            }
        }
        element.style.transform = transformString.join(' ').trim();
    }
}
