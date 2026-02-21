import { PositionSettings, Util } from '../utilities';
import { GlobalPositionStrategy } from './global-position-strategy';

/**
 * Positions the element inside the containing outlet based on the directions passed in trough PositionSettings.
 * These are Top/Middle/Bottom for verticalDirection and Left/Center/Right for horizontalDirection
 */
export class ContainerPositionStrategy extends GlobalPositionStrategy {
    private io: IntersectionObserver | null = null;
    constructor(settings?: PositionSettings) {
        super(settings);
    }

    /**
     * Position the element based on the PositionStrategy implementing this interface.
     */
    public override position(contentElement: HTMLElement): void {
        // Set up intersection observer
        this.io?.disconnect();
        const outletElement = contentElement.parentElement.parentElement;
        this.io = Util.setupIntersectionObserver(
            outletElement,
            contentElement.ownerDocument,
            () => this.updatePosition(contentElement)
        );
        this.internalPosition(contentElement);
    }

    /**
     * Disposes the observer and cleans up references.
     */
    public dispose(): void {
        this.io?.disconnect();
        this.io = null;
    }

    private internalPosition(contentElement: HTMLElement): void {
        contentElement.classList.add('igx-overlay__content--relative');
        contentElement.parentElement.classList.add('igx-overlay__wrapper--flex-container');
        this.setPosition(contentElement);
        this.updatePosition(contentElement);
    }

    private updatePosition(contentElement: HTMLElement): void {
        // TODO: consider using new anchor() CSS function when it becomes more widely supported: https://caniuse.com/mdn-css_properties_anchor
        const parentRect = contentElement.parentElement.parentElement.getBoundingClientRect();
        contentElement.parentElement.style.width = `${parentRect.width}px`;
        contentElement.parentElement.style.height = `${parentRect.height}px`;
        contentElement.parentElement.style.top = `${parentRect.top}px`;
        contentElement.parentElement.style.left = `${parentRect.left}px`;
    }
}
