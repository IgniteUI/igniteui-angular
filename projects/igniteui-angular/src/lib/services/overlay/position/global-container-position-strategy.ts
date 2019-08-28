import { IPositionStrategy } from './IPositionStrategy';
import { PositionSettings, HorizontalAlignment, VerticalAlignment, Size, Util } from './../utilities';
import { fadeIn, fadeOut } from '../../../animations/main';
import { GlobalPositionStrategy } from './global-position-strategy';
import { basename } from '@angular-devkit/core';

/**
 * Positions the element inside outlet based on the directions passed in trough PositionSettings.
 * These are Top/Middle/Bottom for verticalDirection and Left/Center/Right for horizontalDirection
 */
export class GlobalContainerPositionStrategy extends GlobalPositionStrategy {
    constructor(settings?: PositionSettings) {
        super(settings);
    }

    position(contentElement: HTMLElement, size?: Size, document?: Document, initialCall?: boolean): void {
        contentElement.classList.add('igx-overlay__content--relative');
        contentElement.parentElement.classList.add('igx-overlay__wrapper--flex-container');
        this.setPosition(contentElement, this.settings);
    }

    /** @inheritdoc */
    clone(): IPositionStrategy {
        return Util.cloneInstance(this);
    }
}

