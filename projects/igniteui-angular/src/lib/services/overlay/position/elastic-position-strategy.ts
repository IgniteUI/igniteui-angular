import { BaseFitPositionStrategy, ConnectedFit } from './base-fit-position-strategy';
import { HorizontalAlignment, VerticalAlignment, PositionSettings } from '../utilities';

/**
 * Positions the element as in **Connected** positioning strategy and resize the element
 * to fit in the view port in case the element is partially getting out of view
 */
export class ElasticPositionStrategy extends BaseFitPositionStrategy {
    protected fitInViewPort(element: HTMLElement, settings: PositionSettings, connectedFit: ConnectedFit, initialCall?: boolean) {
        element.classList.add('igx-overlay__content--elastic');
        let transformString = '';
        if (!connectedFit.fitHorizontal) {
            const minReduction = Math.max(0, connectedFit.elementRect.width - this.settings.minSize.width);
            const leftExtend = Math.max(0, connectedFit.viewPortRect.left - connectedFit.elementRect.left);
            const rightExtend = Math.max(0, connectedFit.elementRect.right - connectedFit.viewPortRect.right);
            const reduction = Math.min(minReduction, leftExtend + rightExtend);
            element.style.width = `${connectedFit.elementRect.width - reduction}px`;

            //  if direction is center and element goes off the screen in left direction we should push the
            //  element to the right. Otherwise only the right border will move to the left which is not ok
            if (settings.horizontalDirection === HorizontalAlignment.Center) {
                //  the amount of translation depends on whether element goes off the screen to the left,
                //  to the right or in both directions, as well as how much it goes of the screen and finally
                //  on the minSize. The translation should be proportional between left and right extend
                //  taken from the reduction
                const translation = leftExtend * reduction / (leftExtend + rightExtend);
                if (translation > 0) {
                    transformString = this.joinStringNoTrailingSpaces([transformString, `translateX(${translation}px)`]);
                }
            }
        }

        if (!connectedFit.fitVertical) {
            const minReduction = Math.max(0, connectedFit.elementRect.height - this.settings.minSize.height);
            const topExtend = Math.max(0, connectedFit.viewPortRect.top - connectedFit.elementRect.top);
            const bottomExtend = Math.max(0, connectedFit.elementRect.bottom - connectedFit.viewPortRect.bottom);
            const reduction = Math.min(minReduction, topExtend + bottomExtend);
            element.style.height = `${connectedFit.elementRect.height - reduction}px`;

            //  if direction is center and element goes off the screen in left direction we should push the
            //  element to the right. Otherwise only the right border will move to the left which is not ok
            if (settings.verticalDirection === VerticalAlignment.Middle) {
                //  the amount of translation depends on whether element goes off the screen to the top,
                //  to the bottom or in both directions, as well as how much it goes of the screen and finally
                //  on the minSize. The translation should be proportional between top and bottom extend
                //  taken from the reduction
                const translation = topExtend * reduction / (topExtend + bottomExtend);
                if (translation > 0) {
                    transformString = this.joinStringNoTrailingSpaces([transformString, `translateY(${translation}px)`]);
                }
            }
        }
        element.style.transform = transformString;
    }
}
