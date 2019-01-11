import { IPositionStrategy } from './IPositionStrategy';
import { BaseFitPositionStrategy } from './base-fit-position-strategy';
import { Size, HorizontalAlignment, VerticalAlignment, PositionSettings } from '../utilities';

export class ElasticPositionStrategy extends BaseFitPositionStrategy implements IPositionStrategy {
    fitHorizontal(element: HTMLElement, settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect, minSize: Size) {
        switch (settings.horizontalDirection) {
            case HorizontalAlignment.Left: {
                let extend = outerRect.left - innerRect.left;
                if (extend > innerRect.width - minSize.width) {
                    extend = innerRect.width - minSize.width;
                }
                const translateX = `translateX(${innerRect.left + extend}px)`;
                element.style.transform = element.style.transform.replace(/translateX\([.-\d]+px\)/g, translateX);
                (<any>element.firstChild).style.width = `${innerRect.width - extend}px`;
                break;
            }
            case HorizontalAlignment.Right: {
                let extend = innerRect.right - outerRect.right;
                if (extend > innerRect.width - minSize.width) {
                    extend = innerRect.width - minSize.width;
                }

                (<any>element.firstChild).style.width = `${innerRect.width - extend}px`;
                break;
            }
        }
    }

    fitVertical(element: HTMLElement, settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect, minSize: Size) {
        switch (settings.verticalDirection) {
            case VerticalAlignment.Top: {
                let extend = outerRect.top - innerRect.top;
                if (extend > innerRect.height - minSize.height) {
                    extend = innerRect.height - minSize.height;
                }
                const translateY = `translateY(${innerRect.top + extend}px)`;
                element.style.transform = element.style.transform.replace(/translateY\([.-\d]+px\)/g, translateY);
                (<any>element.firstChild).style.height = `${innerRect.width - extend}px`;
                break;
            }
            case VerticalAlignment.Bottom: {
                let extend = innerRect.bottom - outerRect.bottom;
                if (extend > innerRect.height - minSize.height) {
                    extend = innerRect.height - minSize.height;
                }

                (<any>element.firstChild).style.height = `${innerRect.height - extend}px`;
                break;
            }
        }
    }
}
