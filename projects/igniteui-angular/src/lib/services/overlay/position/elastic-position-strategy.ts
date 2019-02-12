import { IPositionStrategy } from './IPositionStrategy';
import { BaseFitPositionStrategy } from './base-fit-position-strategy';
import { Size, HorizontalAlignment, VerticalAlignment, PositionSettings } from '../utilities';

export class ElasticPositionStrategy extends BaseFitPositionStrategy implements IPositionStrategy {
    fitHorizontal(element: HTMLElement, settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect) {
        element.classList.add('igx-overlay__content--elastic');
        let extend = 0;
        switch (settings.horizontalDirection) {
            case HorizontalAlignment.Left: {
                extend = outerRect.left - innerRect.left;
                if (extend > innerRect.width - this.settings.minSize.width) {
                    extend = innerRect.width - this.settings.minSize.width;
                }
                const translateX = `translateX(${Math.round(innerRect.left + extend)}px)`;
                element.style.transform = element.style.transform.replace(/translateX\([.-\d]+px\)/g, translateX);
                break;
            }
            case HorizontalAlignment.Right: {
                extend = innerRect.right - outerRect.right;
                if (extend > innerRect.width - this.settings.minSize.width) {
                    extend = innerRect.width - this.settings.minSize.width;
                }
                break;
            }
        }
        element.style.width = `${innerRect.width - extend}px`;
    }

    fitVertical(element: HTMLElement, settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect) {
        element.classList.add('igx-overlay__content--elastic');
        let extend = 0;
        switch (settings.verticalDirection) {
            case VerticalAlignment.Top: {
                extend = outerRect.top - innerRect.top;
                if (extend > innerRect.height - this.settings.minSize.height) {
                    extend = innerRect.height - this.settings.minSize.height;
                }
                const translateY = `translateY(${Math.round(innerRect.top + extend)}px)`;
                element.style.transform = element.style.transform.replace(/translateY\([.-\d]+px\)/g, translateY);
                break;
            }
            case VerticalAlignment.Bottom: {
                extend = innerRect.bottom - outerRect.bottom;
                if (extend > innerRect.height - this.settings.minSize.height) {
                    extend = innerRect.height - this.settings.minSize.height;
                }
                break;
            }
        }

        element.style.height = `${innerRect.height - extend}px`;
    }
}
