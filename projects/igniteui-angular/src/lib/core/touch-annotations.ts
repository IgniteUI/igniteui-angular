/**
 * Stripped-down HammerJS annotations.
 */

/**
* @hidden
* @internal
*/
export interface HammerInput {
    preventDefault: () => void;
    deltaX: number;
    deltaY: number;
    center: { x: number; y: number; };
    pointerType: string;
    distance: number;
}

/**
* @hidden
* @internal
*/
export interface HammerStatic {
    new(element: HTMLElement | SVGElement, options?: any): HammerManager;

    Pan: Recognizer;
    Swipe: Recognizer;
    Tap: Recognizer;
    TouchInput: HammerInput;
    DIRECTION_HORIZONTAL: number;
    DIRECTION_VERTICAL: number;
}

/**
* @hidden
* @internal
*/
export interface Recognizer { }

/**
* @hidden
* @internal
*/
export interface HammerManager {
    set(options: any): HammerManager;
    off(events: string, handler?: (event: HammerInput) => void): void;
    on(events: string, handler: (event: HammerInput) => void): void;
    destroy(): void;
    get(event: string): HammerManager;
}

/**
* @hidden
* @internal
*/
export interface HammerOptions {
    cssProps?: { [key: string]: string };
    recognizers?: any[];
    inputClass?: HammerInput;
}
