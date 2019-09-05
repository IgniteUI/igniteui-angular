import { PositionSettings, Size } from '../utilities';
import { GlobalPositionStrategy } from './global-position-strategy';

/**
 * Positions the element inside the containing outlet based on the directions passed in trough PositionSettings.
 * These are Top/Middle/Bottom for verticalDirection and Left/Center/Right for horizontalDirection
 */
export class ContainerPositionStrategy extends GlobalPositionStrategy {
    constructor(settings?: PositionSettings) {
        super(settings);
    }

    /** @inheritdoc */
    position(contentElement: HTMLElement, size?: Size, document?: Document, initialCall?: boolean): void {
        contentElement.classList.add('igx-overlay__content--relative');
        contentElement.parentElement.classList.add('igx-overlay__wrapper--flex-container');
        this.setPosition(contentElement, this.settings);
    }
}

