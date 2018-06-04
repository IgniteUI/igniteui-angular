import {Rectangle, Point, HorizontalAlignment, VerticalAlignment  } from './utilities';

export interface IPositionStrategy {
    /** Position the element based on the PositionStrategy implementing this interface */
    position(element: HTMLElement, positionOptions?: PositionOptions ): void;

    /** HTML cleanup */
    dispose(element: HTMLElement): void;
}




