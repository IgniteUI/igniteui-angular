import { BaseFitPositionStrategy } from './base-fit-position-strategy';
import { HorizontalAlignment, VerticalAlignment, PositionSettings } from '../utilities';

/**
 * Positions the element as in **Connected** positioning strategy and resize the element
 * to fit in the view port in case the element is partially getting out of view
 */
export class ElasticPositionStrategy extends BaseFitPositionStrategy {
    protected fitHorizontal(element: HTMLElement, settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect) {
        element.classList.add('igx-overlay__content--elastic');
        const minExtend = innerRect.width - this.settings.minSize.width;
        const leftExtend = Math.min(minExtend, outerRect.left - innerRect.left);
        const rightExtend = Math.min(minExtend, innerRect.right - outerRect.right);
        const extend = Math.max(leftExtend, rightExtend);
        element.style.width = `${innerRect.width - extend}px`;
        //  if direction is center and element goes off the screen in left direction we should push the
        //  element to the right. Otherwise only the right border will move to the left which is not ok
        if (leftExtend > 0 && settings.horizontalDirection === HorizontalAlignment.Center) {
            element.style.transform += ` translateX(${leftExtend}px)`;
        }
    }

    protected fitVertical(element: HTMLElement, settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect) {
        element.classList.add('igx-overlay__content--elastic');
        const minExtend = innerRect.height - this.settings.minSize.height;
        const topExtend = Math.min(minExtend, outerRect.top - innerRect.top);
        const bottomExtend = Math.min(minExtend, innerRect.bottom - outerRect.bottom);
        const extend = Math.max(topExtend, bottomExtend);
        element.style.height = `${innerRect.height - extend}px`;
        //  if direction is middle and element goes off the screen in upper direction we should push the
        //  element to the bottom. Otherwise only the bottom border will move to the top which is not ok
        if (topExtend > 0 && settings.verticalDirection === VerticalAlignment.Middle) {
            element.style.transform += ` translateY(${topExtend}px)`;
        }
    }
}
