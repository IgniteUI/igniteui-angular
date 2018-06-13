import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

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

export class PositionSettings {
    constructor(
        public point: Point = new Point(0, 0),
        public horizontalDirection = HorizontalAlignment.Center,
        public verticalDirection = VerticalAlignment.Middle,
        public element?: HTMLElement,
        public horizontalStartPoint: HorizontalAlignment = HorizontalAlignment.Center,
        public verticalStartPoint: VerticalAlignment = VerticalAlignment.Middle) { }
}

// TODO
// Overlay settings contain PositionSettings, ScrollSettings and AnimationsSettings
// (all will be optional)
