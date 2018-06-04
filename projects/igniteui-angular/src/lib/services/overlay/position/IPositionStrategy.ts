import {Rectangle, Point, HorizontalAlignment, VerticalAlignment  } from './utilities';

export interface IPositionStrategy {
    position(element: HTMLElement, positionOptions?: PositionOptions ): void;
}


