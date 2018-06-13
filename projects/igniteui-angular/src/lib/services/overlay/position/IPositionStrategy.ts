import { PositionSettings } from './../utilities';

export interface IPositionStrategy {
    wrapperClass: string;
    _settings: PositionSettings;

    /** Position the element based on the PositionStrategy implementing this interface */
     position(element: HTMLElement, wrapper: HTMLElement, size: {}): void;
}
// export interface OverlayEntry {
//     element: HTMLElement;
//     wrapper: HTMLElement;
//     size: {
//         width: number;
//         height: number;
//     };
// }
