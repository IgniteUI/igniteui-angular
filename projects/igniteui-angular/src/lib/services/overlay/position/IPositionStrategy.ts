import { PositionSettings } from './../utilities';

export interface IPositionStrategy {
    settings: PositionSettings;

    /** Position the element based on the PositionStrategy implementing this interface */
     position(contentElement: HTMLElement, size?: {}, document?: Document): void;
}
