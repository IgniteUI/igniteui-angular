import { ConnectedFit, Size } from './../utilities';
import { AutoPositionStrategy } from './auto-position-strategy';

/**
 * TODO
 */
export class AutoElasticPositionStrategy extends AutoPositionStrategy {
    /** @inheritdoc */
    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean): void {
        this._forceFit = true;
        super.position(contentElement, size, document, initialCall);
    }

    /** @inheritdoc */
    protected fitInViewport(element: HTMLElement, connectedFit: ConnectedFit) {
        const heightOverflow = connectedFit.contentElementRect.height - connectedFit.viewPortRect.height;
        if (heightOverflow > 0) {
            element.classList.add('igx-overlay__content--elastic');
            element.style.width = 'auto';
            element.style.height = `${connectedFit.viewPortRect.height}px`;
        } else {
            element.style.height = `${Math.max(
                connectedFit.viewPortRect.height - connectedFit.targetRect.bottom - 1,
                connectedFit.contentElementRect.height)}px`;
        }

        super.fitInViewport(element, connectedFit);
    }
}
