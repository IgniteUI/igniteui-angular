import { PositionSettings } from './../utilities';

export interface IPositionStrategy {
    // _wrapperClass: string;
    _settings: PositionSettings;

    /** Position the element based on the PositionStrategy implementing this interface */
     position(element: HTMLElement, wrapper: HTMLElement, size: {}): void;
}
