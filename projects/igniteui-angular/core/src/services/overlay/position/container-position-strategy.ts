import { PositionSettings } from '../utilities';
import { GlobalPositionStrategy } from './global-position-strategy';

/**
 * Positions the element inside the containing outlet based on the directions passed in trough PositionSettings.
 * These are Top/Middle/Bottom for verticalDirection and Left/Center/Right for horizontalDirection
 */
export class ContainerPositionStrategy extends GlobalPositionStrategy {
    private _resizeObserver: ResizeObserver;
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
        if (!this._resizeObserver || this._outletElement !== outletElement) {
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
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        this._contentElement = null;
        this._outletElement = null;
    }

    private _setupResizeObserver(): void {
        this._resizeObserver = new ResizeObserver(() => {
            if (this._contentElement?.parentElement) {
                this.updatePosition(this._contentElement);
            }
        });
        this._resizeObserver.observe(this._outletElement);
    }

    private updatePosition(contentElement: HTMLElement): void {
        const parentRect = contentElement.parentElement.parentElement.getBoundingClientRect();
        contentElement.parentElement.style.width = `${parentRect.width}px`;
        contentElement.parentElement.style.height = `${parentRect.height}px`;
        contentElement.parentElement.style.top = `${parentRect.top}px`;
        contentElement.parentElement.style.left = `${parentRect.left}px`;
        this.setPosition(contentElement);
    }
}

