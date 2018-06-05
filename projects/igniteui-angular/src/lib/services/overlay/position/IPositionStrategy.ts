import { PositionSettings } from './utilities';
export interface IPositionStrategy {
    wrapperClass: string;

    /** Position the element based on the PositionStrategy implementing this interface */
    position(element: HTMLElement, PositionSettings?: PositionSettings ): void;
}
