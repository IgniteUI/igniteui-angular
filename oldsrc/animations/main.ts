export interface IAnimationParams {
    delay: string;
    duration: string;
    easing: any;
    startOpacity?: number;
    endOpacity?: number;
    startAngle?: number;
    endAngle?: number;
    startDistance?: string;
    endDistance?: string;
    fromPosition?: string;
    toPosition?: string;
    fromScale?: number;
    midScale?: number;
    toScale?: number;
    xPos?: string;
    yPos?: string;
    direction?: string;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
}

export * from "./fade/index";
export * from "./flip/index";
export * from "./rotate/index";
export * from "./misc/index";
export * from "./scale/index";
export * from "./slide/index";
export * from "./swing/index";
