import { PositionSettings } from '../utilities';
import { GlobalPositionStrategy } from './global-position-strategy';

/**
 * Positions the element inside the containing outlet based on the directions passed in trough PositionSettings.
 * These are Top/Middle/Bottom for verticalDirection and Left/Center/Right for horizontalDirection
 */
export class ContainerPositionStrategy extends GlobalPositionStrategy {
    constructor(settings?: PositionSettings) {
        super(settings);
    }

    /**
     * Position the element based on the PositionStrategy implementing this interface.
     */
    public override position(contentElement: HTMLElement): void {
        contentElement.classList.add('igx-overlay__content--relative');
        contentElement.parentElement.classList.add('igx-overlay__wrapper--flex-container');
        const parentRect = contentElement.parentElement.parentElement.getBoundingClientRect();
        contentElement.parentElement.style.width = `${parentRect.width}px`;
        contentElement.parentElement.style.height = `${parentRect.height}px`;
        contentElement.parentElement.style.top = `${parentRect.top}px`;
        contentElement.parentElement.style.left = `${parentRect.left}px`;
        this.setPosition(contentElement);
    }
}

