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
    public override position(contentElement: HTMLElement, _size?: Size, _document?: Document, _initialCall?: boolean, target?: Point | HTMLElement): void {
        // Set up intersection observer
        this.io?.disconnect();
        const outletElement = contentElement.parentElement.parentElement;
        if (!target || target instanceof Point || !outletElement) {
            super.position(contentElement, _size, _document, _initialCall, target);
            return;
        }
        this.io = Util.setupIntersectionObserver(
            target as HTMLElement || outletElement,
            contentElement.ownerDocument,
            () => this.updatePosition(contentElement, target as HTMLElement)
        );
        this.internalPosition(contentElement, target as HTMLElement);
    }

    /**
     * Disposes the observer and cleans up references.
     */
    public dispose(): void {
        this.io?.disconnect();
        this.io = null;
    }

    private internalPosition(contentElement: HTMLElement, targetElement: HTMLElement): void {
        contentElement.classList.add('igx-overlay__content--relative');
        contentElement.parentElement.classList.add('igx-overlay__wrapper--flex-container');
        this.setPosition(contentElement);
        this.updatePosition(contentElement, targetElement);
    }

    private updatePosition(contentElement: HTMLElement, targetElement: HTMLElement): void {
        const outletElement = contentElement.parentElement?.parentElement;
        if (!targetElement && !outletElement)
            return;

        // TODO: consider using new anchor() CSS function when it becomes more widely
        // supported: https://caniuse.com/mdn-css_properties_anchor
        if (outletElement) {
            const outletRect = outletElement.getBoundingClientRect();
            contentElement.parentElement.style.width = `${outletRect.width}px`;
            contentElement.parentElement.style.height = `${outletRect.height}px`;
            contentElement.parentElement.style.top = `${outletRect.top}px`;
            contentElement.parentElement.style.left = `${outletRect.left}px`;
        }
        if (targetElement) {
            const targetRect = targetElement.getBoundingClientRect();
            contentElement.parentElement.style.width = `${targetRect.width}px`;
            contentElement.parentElement.style.height = `${targetRect.height}px`;
            contentElement.parentElement.style.top = `${targetRect.top}px`;
            contentElement.parentElement.style.left = `${targetRect.left}px`;
        }
    }
}
