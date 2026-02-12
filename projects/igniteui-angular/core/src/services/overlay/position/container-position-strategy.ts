import { Subscription } from 'rxjs';
import { resizeObservable } from '../../../core/utils';
import { PositionSettings } from '../utilities';
import { GlobalPositionStrategy } from './global-position-strategy';

/**
 * Positions the element inside the containing outlet based on the directions passed in trough PositionSettings.
 * These are Top/Middle/Bottom for verticalDirection and Left/Center/Right for horizontalDirection
 */
export class ContainerPositionStrategy extends GlobalPositionStrategy {
    private _resizeSubscription: Subscription;
    private _contentElement: HTMLElement;
    private _outletElement: HTMLElement;

    constructor(settings?: PositionSettings) {
        super(settings);
    }

    /**
     * Position the element based on the PositionStrategy implementing this interface.
     */
    public override position(contentElement: HTMLElement): void {
        contentElement.classList.add('igx-overlay__content--relative');
        contentElement.parentElement.classList.add('igx-overlay__wrapper--flex-container');
        const outletElement = contentElement.parentElement.parentElement;

        // Set up resize observer if not already observing this element
        if (!this._resizeSubscription || this._outletElement !== outletElement) {
            this.dispose();
            this._contentElement = contentElement;
            this._outletElement = outletElement;
            this._setupResizeObserver();
        }

        this.updatePosition(contentElement);
    }

    /**
     * Disposes the resize observer and cleans up references.
     */
    public dispose(): void {
        if (this._resizeSubscription) {
            this._resizeSubscription.unsubscribe();
            this._resizeSubscription = null;
        }
        this._contentElement = null;
        this._outletElement = null;
    }

    private _setupResizeObserver(): void {
        this._resizeSubscription = resizeObservable(this._outletElement).subscribe(() => {
            if (this._contentElement?.parentElement) {
                this.updatePosition(this._contentElement);
            }
        });
    }

    private updatePosition(contentElement: HTMLElement): void {
        // TODO: consider using new anchor() CSS function when it becomes more widely supported: https://caniuse.com/mdn-css_properties_anchor
        const parentRect = contentElement.parentElement.parentElement.getBoundingClientRect();
        contentElement.parentElement.style.width = `${parentRect.width}px`;
        contentElement.parentElement.style.height = `${parentRect.height}px`;
        contentElement.parentElement.style.top = `${parentRect.top}px`;
        contentElement.parentElement.style.left = `${parentRect.left}px`;
        this.setPosition(contentElement);
    }
}

