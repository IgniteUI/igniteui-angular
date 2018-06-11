import { PositionSettings } from './../utilities';
export interface IPositionStrategy {
    wrapperClass: string;

	// TODO: rename this to _settings
    _options: PositionSettings;

    /** Position the element based on the PositionStrategy implementing this interface */
    position(element: HTMLElement): void;
}
