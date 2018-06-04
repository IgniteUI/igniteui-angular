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
    constructor(public x: number, public y: number, public w: number, public h: number) {}
}

export class Point {
    constructor(public x: number, public y: number) {}
}

export class PositionOptions {
    constructor(public point: Point, public rectangle: Rectangle,
        public horizontalAlignment?: HorizontalAlignment| HorizontalAlignment.Center,
                public verticalAlignment?: VerticalAlignment | VerticalAlignment.Middle) {
    }
}
