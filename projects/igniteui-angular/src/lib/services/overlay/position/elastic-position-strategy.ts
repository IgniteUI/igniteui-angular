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
        if (leftExtend > 0 && settings.horizontalDirection === HorizontalAlignment.Center) {
            element.style.left = '0';
        }
    }

    protected fitVertical(element: HTMLElement, settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect) {
        element.classList.add('igx-overlay__content--elastic');
        const minExtend = innerRect.height - this.settings.minSize.height;
        const topExtend = Math.min(minExtend, outerRect.top - innerRect.top);
        const bottomExtend = Math.min(minExtend, innerRect.bottom - outerRect.bottom);
        const extend = Math.max(topExtend, bottomExtend);
        element.style.height = `${innerRect.height - extend}px`;
        if (topExtend > 0 && settings.verticalDirection === VerticalAlignment.Middle) {
            element.style.top = '0';
        }
    }
}
