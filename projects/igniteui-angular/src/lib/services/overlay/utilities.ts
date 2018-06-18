import { GlobalPositionStrategy } from './position/global-position-strategy';
import { IPositionStrategy } from './position/IPositionStrategy';

import { IScrollStrategy, NoOpScrollStrategy } from './scroll';

export enum HorizontalAlignment {
    Left = -1,
    Center = -0.5,
    Right = 0
}

export enum VerticalAlignment {
    Top = -1,
    Middle = -0.5,
    Bottom = 0
}

export class Rectangle {
    constructor(public x: number, public y: number, public w: number, public h: number) { }
}

export class Point {
    constructor(public x: number, public y: number) { }
}

export interface PositionSettings {
        point: Point;
        horizontalDirection: HorizontalAlignment;
        verticalDirection: VerticalAlignment;
        element: HTMLElement;
        horizontalStartPoint: HorizontalAlignment;
        verticalStartPoint: VerticalAlignment;
}

export interface OverlaySettings {
    positionStrategy: IPositionStrategy;
    scrollStrategy: IScrollStrategy;
    modal: boolean;
    closeOnOutsideClick: boolean;
}
