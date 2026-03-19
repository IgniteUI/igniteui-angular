import { Point, PositionSettings, Size, Util } from '../utilities';
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
        const containerElement = contentElement.parentElement.parentElement;
        if (!containerElement) {
            super.position(contentElement);
            return;
        }
        this.io = Util.setupIntersectionObserver(
            containerElement,
            contentElement.ownerDocument,
            () => this.updatePosition(contentElement, containerElement)
        );
        this.internalPosition(contentElement, containerElement);
    }

    /**
     * Disposes the observer and cleans up references.
     */
    public dispose(): void {
        this.io?.disconnect();
        this.io = null;
    }

    private internalPosition(contentElement: HTMLElement, container: HTMLElement): void {
        contentElement.classList.add('igx-overlay__content--relative');
        contentElement.parentElement.classList.add('igx-overlay__wrapper--flex-container');
        this.setPosition(contentElement);
        this.updatePosition(contentElement, container);
    }

    private updatePosition(contentElement: HTMLElement, container: HTMLElement): void {
        if (!container)
            return;

        // TODO: consider using new anchor() CSS function when it becomes more widely
        // supported: https://caniuse.com/mdn-css_properties_anchor
        const containerRect = container.getBoundingClientRect();
        contentElement.parentElement.style.width = `${containerRect.width}px`;
        contentElement.parentElement.style.height = `${containerRect.height}px`;
        contentElement.parentElement.style.top = `${containerRect.top}px`;
        contentElement.parentElement.style.left = `${containerRect.left}px`;
    }
}
