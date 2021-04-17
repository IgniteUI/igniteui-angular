import { AnimationReferenceMetadata } from '@angular/animations';
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import mergeWith from 'lodash.mergewith';
import ResizeObserver from 'resize-observer-polyfill';
import { Observable } from 'rxjs';
import {
    blink, fadeIn, fadeOut, flipBottom, flipHorBck, flipHorFwd, flipLeft, flipRight, flipTop,
    flipVerBck, flipVerFwd, growVerIn, growVerOut, heartbeat, pulsateBck, pulsateFwd, rotateInBl,
    rotateInBottom, rotateInBr, rotateInCenter, rotateInDiagonal1, rotateInDiagonal2, rotateInHor,
    rotateInLeft, rotateInRight, rotateInTl, rotateInTop, rotateInTr, rotateInVer, rotateOutBl,
    rotateOutBottom, rotateOutBr, rotateOutCenter, rotateOutDiagonal1, rotateOutDiagonal2,
    rotateOutHor, rotateOutLeft, rotateOutRight, rotateOutTl, rotateOutTop, rotateOutTr,
    rotateOutVer, scaleInBl, scaleInBottom, scaleInBr, scaleInCenter, scaleInHorCenter,
    scaleInHorLeft, scaleInHorRight, scaleInLeft, scaleInRight, scaleInTl, scaleInTop, scaleInTr,
    scaleInVerBottom, scaleInVerCenter, scaleInVerTop, scaleOutBl, scaleOutBottom, scaleOutBr,
    scaleOutCenter, scaleOutHorCenter, scaleOutHorLeft, scaleOutHorRight, scaleOutLeft,
    scaleOutRight, scaleOutTl, scaleOutTop, scaleOutTr, scaleOutVerBottom, scaleOutVerCenter,
    scaleOutVerTop, shakeBl, shakeBottom, shakeBr, shakeCenter, shakeHor, shakeLeft, shakeRight,
    shakeTl, shakeTop, shakeTr, shakeVer, slideInBl, slideInBottom, slideInBr, slideInLeft,
    slideInRight, slideInTl, slideInTop, slideInTr, slideOutBl, slideOutBottom, slideOutBr,
    slideOutLeft, slideOutRight, slideOutTl, slideOutTop, slideOutTr, swingInBottomBck,
    swingInBottomFwd, swingInLeftBck, swingInLeftFwd, swingInRightBck, swingInRightFwd,
    swingInTopBck, swingInTopFwd, swingOutBottomBck, swingOutBottomFwd, swingOutLeftBck,
    swingOutLefttFwd, swingOutRightBck, swingOutRightFwd, swingOutTopBck, swingOutTopFwd
} from '../animations/main';
import { setImmediate } from './setImmediate';

export const mkenum = <T extends { [index: string]: U }, U extends string>(x: T) => x;

/**
 * @hidden
 */
export const cloneArray = (array: any[], deep?: boolean) => {
    const arr = [];
    if (!array) {
        return arr;
    }
    let i = array.length;
    while (i--) {
        arr[i] = deep ? cloneValue(array[i]) : array[i];
    }
    return arr;
};

/**
 * Doesn't clone leaf items
 *
 * @hidden
 */
export const cloneHierarchicalArray = (array: any[], childDataKey: any): any[] => {
    const result: any[] = [];
    if (!array) {
        return result;
    }

    for (const item of array) {
        const clonedItem = cloneValue(item);
        if (Array.isArray(item[childDataKey])) {
            clonedItem[childDataKey] = cloneHierarchicalArray(clonedItem[childDataKey], childDataKey);
        }
        result.push(clonedItem);
    }
    return result;
};

/**
 * Deep clones all first level keys of Obj2 and merges them to Obj1
 *
 * @param obj1 Object to merge into
 * @param obj2 Object to merge from
 * @returns Obj1 with merged cloned keys from Obj2
 * @hidden
 */
export const mergeObjects = (obj1: any, obj2: any): any => mergeWith(obj1, obj2, (objValue, srcValue) => {
    if (Array.isArray(srcValue)) {
        return objValue = srcValue;
    }
});

/**
 * Creates deep clone of provided value.
 * Supports primitive values, dates and objects.
 * If passed value is array returns shallow copy of the array.
 *
 * @param value value to clone
 * @returns Deep copy of provided value
 * @hidden
 */
export const cloneValue = (value: any): any => {
    if (isDate(value)) {
        return new Date(value.getTime());
    }
    if (Array.isArray(value)) {
        return [...value];
    }

    if (value instanceof Map || value instanceof Set) {
        return value;
    }

    if (isObject(value)) {
        const result = {};

        for (const key of Object.keys(value)) {
            result[key] = cloneValue(value[key]);
        }
        return result;
    }
    return value;
};

/**
 * Parse provided input to Date.
 *
 * @param value input to parse
 * @returns Date if parse succeed or null
 * @hidden
 */
export const parseDate = (value: any): Date | null => {
    // if value is Invalid Date return null
    if (isDate(value)) {
        return !isNaN(value.getTime()) ? value : null;
    }
    return value ? new Date(value) : null;
};

/**
 * Returns an array with unique dates only.
 *
 * @param columnValues collection of date values (might be numbers or ISO 8601 strings)
 * @returns collection of unique dates.
 * @hidden
 */
export const uniqueDates = (columnValues: any[]) => columnValues.reduce((a, c) => {
    if (!a.cache[c.label]) {
        a.result.push(c);
    }
    a.cache[c.label] = true;
    return a;
}, { result: [], cache: {} }).result;

/**
 * Checks if provided variable is Object
 *
 * @param value Value to check
 * @returns true if provided variable is Object
 * @hidden
 */
export const isObject = (value: any): boolean => value && value.toString() === '[object Object]';

/**
 * Checks if provided variable is Date
 *
 * @param value Value to check
 * @returns true if provided variable is Date
 * @hidden
 */
export const isDate = (value: any): boolean => value instanceof Date;

/**
 * Checks if the two passed arguments are equal
 * Currently supports date objects
 *
 * @param obj1
 * @param obj2
 * @returns: `boolean`
 * @hidden
 */
export const isEqual = (obj1, obj2): boolean => {
    if (isDate(obj1) && isDate(obj2)) {
        return obj1.getTime() === obj2.getTime();
    }
    return obj1 === obj2;
};

/**
 * Utility service taking care of various utility functions such as
 * detecting browser features, general cross browser DOM manipulation, etc.
 *
 * @hidden @internal
 */
@Injectable({ providedIn: 'root' })
export class PlatformUtil {
    public isBrowser: boolean = isPlatformBrowser(this.platformId);
    public isIOS = this.isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    public isFirefox = this.isBrowser && /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
    public isEdge = this.isBrowser && /Edge[\/\s](\d+\.\d+)/.test(navigator.userAgent);
    public isIE = this.isBrowser && navigator.appVersion.indexOf('Trident/') > 0;

    public KEYMAP = mkenum({
        ENTER: 'Enter',
        SPACE: this.isIE ? 'Spacebar' : ' ',
        ESCAPE: this.isIE ? 'Esc' : 'Escape',
        ARROW_DOWN: this.isIE ? 'Down' : 'ArrowDown',
        ARROW_UP: this.isIE ? 'Up' : 'ArrowUp',
        ARROW_LEFT: this.isIE ? 'Left' : 'ArrowLeft',
        ARROW_RIGHT: this.isIE ? 'Right' : 'ArrowRight',
        END: 'End',
        HOME: 'Home',
        PAGE_DOWN: 'PageDown',
        PAGE_UP: 'PageUp',
        F2: 'F2',
        TAB: 'Tab',
        SEMICOLON: ';',
        // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values#editing_keys
        DELETE: this.isIE ? 'Del' : 'Delete',
        BACKSPACE: 'Backspace',
        CONTROL: 'Control',
        X: 'x',
        Y: 'y',
        Z: 'z'
    });

    constructor(@Inject(PLATFORM_ID) private platformId: any) { }

    /**
     * @hidden @internal
     * Returns the actual size of the node content, using Range
     * ```typescript
     * let range = document.createRange();
     * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
     *
     * let size = getNodeSizeViaRange(range, column.cells[0].nativeElement);
     *
     * @remarks
     * The last parameter is useful when the size of the element to measure is modified by a
     * parent element that has explicit size. In such cases the calculated size is never lower
     * and the function may instead remove the parent size while measuring to get the correct value.
     * ```
     */
     public getNodeSizeViaRange(range: Range, node: HTMLElement, sizeHoldingNode?: HTMLElement) {
        let overflow = null;
        let nodeStyles;

        if (!this.isFirefox) {
            overflow = node.style.overflow;
            // we need that hack - otherwise content won't be measured correctly in IE/Edge
            node.style.overflow = 'visible';
        }

        if (sizeHoldingNode) {
            const style = sizeHoldingNode.style;
            nodeStyles = [ style.width, style.minWidth, style.flexBasis ];
            style.width = '';
            style.minWidth = '';
            style.flexBasis = '';
        }

        range.selectNodeContents(node);
        const width = range.getBoundingClientRect().width;

        if (!this.isFirefox) {
            // we need that hack - otherwise content won't be measured correctly in IE/Edge
            node.style.overflow = overflow;
        }

        if (sizeHoldingNode) {
            sizeHoldingNode.style.width = nodeStyles[0];
            sizeHoldingNode.style.minWidth = nodeStyles[1];
            sizeHoldingNode.style.flexBasis = nodeStyles[2];
        }

        return width;
    }


    /**
     * Returns true if the current keyboard event is an activation key (Enter/Space bar)
     *
     * @hidden
     * @internal
     *
     * @memberof PlatformUtil
     */
    public isActivationKey(event: KeyboardEvent) {
        return event.key === this.KEYMAP.ENTER || event.key === this.KEYMAP.SPACE;
    }

    /**
     * Returns true if the current keyboard event is a combination that closes the filtering UI of the grid. (Escape/Ctrl+Shift+L)
     *
     * @hidden
     * @internal
     * @param event
     * @memberof PlatformUtil
     */
    public isFilteringKeyCombo(event: KeyboardEvent) {
        return event.key === this.KEYMAP.ESCAPE || (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'l');
    }

    /**
     * @hidden @internal
     */
    public isLeftClick(event: PointerEvent | MouseEvent) {
        return event.button === 0;
    }

    /**
     * @hidden @internal
     */
    public isNavigationKey(key: string) {
        return [
            this.KEYMAP.HOME, this.KEYMAP.END, this.KEYMAP.SPACE,
            this.KEYMAP.ARROW_DOWN, this.KEYMAP.ARROW_LEFT, this.KEYMAP.ARROW_RIGHT, this.KEYMAP.ARROW_UP
        ].includes(key);
    }
}

/**
 * @hidden
 */
export const flatten = (arr: any[]) => {
    let result = [];

    arr.forEach(el => {
        result.push(el);
        if (el.children) {
            const children = Array.isArray(el.children) ? el.children : el.children.toArray();
            result = result.concat(flatten(children));
        }
    });
    return result;
};

export interface CancelableEventArgs {
    /**
     * Provides the ability to cancel the event.
     */
    cancel: boolean;
}

export interface IBaseEventArgs {
    /**
     * Provides reference to the owner component.
     */
    owner?: any;
}

export interface CancelableBrowserEventArgs extends CancelableEventArgs {
    /** Browser event */
    event?: Event;
}

export interface IBaseCancelableBrowserEventArgs extends CancelableBrowserEventArgs, IBaseEventArgs { }

export interface IBaseCancelableEventArgs extends CancelableEventArgs, IBaseEventArgs { }

export const HORIZONTAL_NAV_KEYS = new Set(['arrowleft', 'left', 'arrowright', 'right', 'home', 'end']);

export const NAVIGATION_KEYS = new Set([
    'down',
    'up',
    'left',
    'right',
    'arrowdown',
    'arrowup',
    'arrowleft',
    'arrowright',
    'home',
    'end',
    'space',
    'spacebar',
    ' '
]);
export const ROW_EXPAND_KEYS = new Set('right down arrowright arrowdown'.split(' '));
export const ROW_COLLAPSE_KEYS = new Set('left up arrowleft arrowup'.split(' '));
export const ROW_ADD_KEYS = new Set(['+', 'add', '≠', '±', '=']);
export const SUPPORTED_KEYS = new Set([...Array.from(NAVIGATION_KEYS),
...Array.from(ROW_ADD_KEYS), 'enter', 'f2', 'escape', 'esc', 'pagedown', 'pageup']);
export const HEADER_KEYS = new Set([...Array.from(NAVIGATION_KEYS), 'escape', 'esc', 'l',
    /** This symbol corresponds to the Alt + L combination under MAC. */
    '¬']);

/**
 * @hidden
 * @internal
 *
 * Creates a new ResizeObserver on `target` and returns it as an Observable.
 * Run the resizeObservable outside angular zone, because it patches the MutationObserver which causes an infinite loop.
 * Related issue: https://github.com/angular/angular/issues/31712
 */
export const resizeObservable = (target: HTMLElement): Observable<ResizeObserverEntry[]> => new Observable((observer) => {
    const instance = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        observer.next(entries);
    });
    instance.observe(target);
    const unsubscribe = () => instance.disconnect();
    return unsubscribe;
});

/**
 * @hidden
 * @internal
 *
 * Compares two maps.
 */
export const compareMaps = (map1: Map<any, any>, map2: Map<any, any>): boolean => {
    if (!map2) {
        return !map1 ? true : false;
    }
    if (map1.size !== map2.size) {
        return false;
    }
    let match = true;
    const keys = Array.from(map2.keys());
    for (const key of keys) {
        if (map1.has(key)) {
            match = map1.get(key) === map2.get(key);
        } else {
            match = false;
        }
        if (!match) {
            break;
        }
    }
    return match;
};

/**
 *
 * Given a property access path in the format `x.y.z` resolves and returns
 * the value of the `z` property in the passed object.
 *
 * @hidden
 * @internal
 */
export const resolveNestedPath = (obj: any, path: string) => {
    const parts = path?.split('.') ?? [];
    let current = obj[parts.shift()];

    parts.forEach(prop => {
        if (current) {
            current = current[prop];
        }
    });

    return current;
};

/**
 *
 * Given a property access path in the format `x.y.z` and a value
 * this functions builds and returns an object following the access path.
 *
 * @example
 * ```typescript
 * console.log('x.y.z.', 42);
 * >> { x: { y: { z: 42 } } }
 * ```
 *
 * @hidden
 * @internal
 */
export const reverseMapper = (path: string, value: any) => {
    const obj = {};
    const parts = path?.split('.') ?? [];

    let _prop = parts.shift();
    let mapping: any;

    // Initial binding for first level bindings
    obj[_prop] = value;
    mapping = obj;

    parts.forEach(prop => {
        // Start building the hierarchy
        mapping[_prop] = {};
        // Go down a level
        mapping = mapping[_prop];
        // Bind the value and move the key
        mapping[prop] = value;
        _prop = prop;
    });

    return obj;
};

export const yieldingLoop = (count: number, chunkSize: number, callback: (index: number) => void, done: () => void) => {
    let i = 0;
    const chunk = () => {
        const end = Math.min(i + chunkSize, count);
        for (; i < end; ++i) {
            callback(i);
        }
        if (i < count) {
            setImmediate(chunk);
        } else {
            done();
        }
    };
    chunk();
};

export const reverseAnimationResolver = (animation: AnimationReferenceMetadata): AnimationReferenceMetadata =>
    oppositeAnimation.get(animation) ?? animation;

export const isHorizontalAnimation = (animation: AnimationReferenceMetadata): boolean => horizontalAnimations.includes(animation);

export const isVerticalAnimation = (animation: AnimationReferenceMetadata): boolean => verticalAnimations.includes(animation);

const oppositeAnimation: Map<AnimationReferenceMetadata, AnimationReferenceMetadata> = new Map([
    [fadeIn, fadeIn],
    [fadeOut, fadeOut],
    [flipTop, flipBottom],
    [flipBottom, flipTop],
    [flipRight, flipLeft],
    [flipLeft, flipRight],
    [flipHorFwd, flipHorBck],
    [flipHorBck, flipHorFwd],
    [flipVerFwd, flipVerBck],
    [flipVerBck, flipVerFwd],
    [growVerIn, growVerIn],
    [growVerOut, growVerOut],
    [heartbeat, heartbeat],
    [pulsateFwd, pulsateBck],
    [pulsateBck, pulsateFwd],
    [blink, blink],
    [shakeHor, shakeHor],
    [shakeVer, shakeVer],
    [shakeTop, shakeTop],
    [shakeBottom, shakeBottom],
    [shakeRight, shakeRight],
    [shakeLeft, shakeLeft],
    [shakeCenter, shakeCenter],
    [shakeTr, shakeTr],
    [shakeBr, shakeBr],
    [shakeBl, shakeBl],
    [shakeTl, shakeTl],
    [rotateInCenter, rotateInCenter],
    [rotateOutCenter, rotateOutCenter],
    [rotateInTop, rotateInBottom],
    [rotateOutTop, rotateOutBottom],
    [rotateInRight, rotateInLeft],
    [rotateOutRight, rotateOutLeft],
    [rotateInLeft, rotateInRight],
    [rotateOutLeft, rotateOutRight],
    [rotateInBottom, rotateInTop],
    [rotateOutBottom, rotateOutTop],
    [rotateInTr, rotateInBl],
    [rotateOutTr, rotateOutBl],
    [rotateInBr, rotateInTl],
    [rotateOutBr, rotateOutTl],
    [rotateInBl, rotateInTr],
    [rotateOutBl, rotateOutTr],
    [rotateInTl, rotateInBr],
    [rotateOutTl, rotateOutBr],
    [rotateInDiagonal1, rotateInDiagonal1],
    [rotateOutDiagonal1, rotateOutDiagonal1],
    [rotateInDiagonal2, rotateInDiagonal2],
    [rotateOutDiagonal2, rotateOutDiagonal2],
    [rotateInHor, rotateInHor],
    [rotateOutHor, rotateOutHor],
    [rotateInVer, rotateInVer],
    [rotateOutVer, rotateOutVer],
    [scaleInTop, scaleInBottom],
    [scaleOutTop, scaleOutBottom],
    [scaleInRight, scaleInLeft],
    [scaleOutRight, scaleOutLeft],
    [scaleInBottom, scaleInTop],
    [scaleOutBottom, scaleOutTop],
    [scaleInLeft, scaleInRight],
    [scaleOutLeft, scaleOutRight],
    [scaleInCenter, scaleInCenter],
    [scaleOutCenter, scaleOutCenter],
    [scaleInTr, scaleInBl],
    [scaleOutTr, scaleOutBl],
    [scaleInBr, scaleInTl],
    [scaleOutBr, scaleOutTl],
    [scaleInBl, scaleInTr],
    [scaleOutBl, scaleOutTr],
    [scaleInTl, scaleInBr],
    [scaleOutTl, scaleOutBr],
    [scaleInVerTop, scaleInVerBottom],
    [scaleOutVerTop, scaleOutVerBottom],
    [scaleInVerBottom, scaleInVerTop],
    [scaleOutVerBottom, scaleOutVerTop],
    [scaleInVerCenter, scaleInVerCenter],
    [scaleOutVerCenter, scaleOutVerCenter],
    [scaleInHorCenter, scaleInHorCenter],
    [scaleOutHorCenter, scaleOutHorCenter],
    [scaleInHorLeft, scaleInHorRight],
    [scaleOutHorLeft, scaleOutHorRight],
    [scaleInHorRight, scaleInHorLeft],
    [scaleOutHorRight, scaleOutHorLeft],
    [slideInTop, slideInBottom],
    [slideOutTop, slideOutBottom],
    [slideInRight, slideInLeft],
    [slideOutRight, slideOutLeft],
    [slideInBottom, slideInTop],
    [slideOutBottom, slideOutTop],
    [slideInLeft, slideInRight],
    [slideOutLeft, slideOutRight],
    [slideInTr, slideInBl],
    [slideOutTr, slideOutBl],
    [slideInBr, slideInTl],
    [slideOutBr, slideOutTl],
    [slideInBl, slideInTr],
    [slideOutBl, slideOutTr],
    [slideInTl, slideInBr],
    [slideOutTl, slideOutBr],
    [swingInTopFwd, swingInBottomFwd],
    [swingOutTopFwd, swingOutBottomFwd],
    [swingInRightFwd, swingInLeftFwd],
    [swingOutRightFwd, swingOutLefttFwd],
    [swingInLeftFwd, swingInRightFwd],
    [swingOutLefttFwd, swingOutRightFwd],
    [swingInBottomFwd, swingInTopFwd],
    [swingOutBottomFwd, swingOutTopFwd],
    [swingInTopBck, swingInBottomBck],
    [swingOutTopBck, swingOutBottomBck],
    [swingInRightBck, swingInLeftBck],
    [swingOutRightBck, swingOutLeftBck],
    [swingInBottomBck, swingInTopBck],
    [swingOutBottomBck, swingOutTopBck],
    [swingInLeftBck, swingInRightBck],
    [swingOutLeftBck, swingOutRightBck],
]);

const horizontalAnimations: AnimationReferenceMetadata[] = [
    flipRight,
    flipLeft,
    flipVerFwd,
    flipVerBck,
    rotateInRight,
    rotateOutRight,
    rotateInLeft,
    rotateOutLeft,
    rotateInTr,
    rotateOutTr,
    rotateInBr,
    rotateOutBr,
    rotateInBl,
    rotateOutBl,
    rotateInTl,
    rotateOutTl,
    scaleInRight,
    scaleOutRight,
    scaleInLeft,
    scaleOutLeft,
    scaleInTr,
    scaleOutTr,
    scaleInBr,
    scaleOutBr,
    scaleInBl,
    scaleOutBl,
    scaleInTl,
    scaleOutTl,
    scaleInHorLeft,
    scaleOutHorLeft,
    scaleInHorRight,
    scaleOutHorRight,
    slideInRight,
    slideOutRight,
    slideInLeft,
    slideOutLeft,
    slideInTr,
    slideOutTr,
    slideInBr,
    slideOutBr,
    slideInBl,
    slideOutBl,
    slideInTl,
    slideOutTl,
    swingInRightFwd,
    swingOutRightFwd,
    swingInLeftFwd,
    swingOutLefttFwd,
    swingInRightBck,
    swingOutRightBck,
    swingInLeftBck,
    swingOutLeftBck,
];
const verticalAnimations: AnimationReferenceMetadata[] = [
    flipTop,
    flipBottom,
    flipHorFwd,
    flipHorBck,
    growVerIn,
    growVerOut,
    rotateInTop,
    rotateOutTop,
    rotateInBottom,
    rotateOutBottom,
    rotateInTr,
    rotateOutTr,
    rotateInBr,
    rotateOutBr,
    rotateInBl,
    rotateOutBl,
    rotateInTl,
    rotateOutTl,
    scaleInTop,
    scaleOutTop,
    scaleInBottom,
    scaleOutBottom,
    scaleInTr,
    scaleOutTr,
    scaleInBr,
    scaleOutBr,
    scaleInBl,
    scaleOutBl,
    scaleInTl,
    scaleOutTl,
    scaleInVerTop,
    scaleOutVerTop,
    scaleInVerBottom,
    scaleOutVerBottom,
    slideInTop,
    slideOutTop,
    slideInBottom,
    slideOutBottom,
    slideInTr,
    slideOutTr,
    slideInBr,
    slideOutBr,
    slideInBl,
    slideOutBl,
    slideInTl,
    slideOutTl,
    swingInTopFwd,
    swingOutTopFwd,
    swingInBottomFwd,
    swingOutBottomFwd,
    swingInTopBck,
    swingOutTopBck,
    swingInBottomBck,
    swingOutBottomBck,
];
