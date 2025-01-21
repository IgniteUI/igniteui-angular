import { CurrencyPipe, formatDate as _formatDate, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { mergeWith } from 'lodash-es';
import { NEVER, Observable } from 'rxjs';
import { setImmediate } from './setImmediate';
import { isDevMode } from '@angular/core';
import { IgxTheme } from '../services/theme/theme.token';

/** @hidden @internal */
export const ELEMENTS_TOKEN = /*@__PURE__*/new InjectionToken<boolean>('elements environment');

/**
 * @hidden
 */
export const showMessage = (message: string, isMessageShown: boolean): boolean => {
    if (!isMessageShown && isDevMode()) {
        console.warn(message);
    }

    return true;
};

export const mkenum = <T extends { [index: string]: U }, U extends string>(x: T) => x;

/**
 *
 * @hidden @internal
 */
export const getResizeObserver = () => globalThis.window?.ResizeObserver;

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
 * Creates an object with prototype from provided source and copies
 * all properties descriptors from provided source
 * @param obj Source to copy prototype and descriptors from
 * @returns New object with cloned prototype and property descriptors
 */
export const copyDescriptors = (obj) => {
    if (obj) {
        return Object.create(
            Object.getPrototypeOf(obj),
            Object.getOwnPropertyDescriptors(obj)
        );
    }
}


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
            if (key === "externalObject") {
                continue;
            }
            result[key] = cloneValue(value[key]);
        }
        return result;
    }
    return value;
};

/**
 * Creates deep clone of provided value.
 * Supports primitive values, dates and objects.
 * If passed value is array returns shallow copy of the array.
 * For Objects property values and references are cached and reused.
 * This allows for circular references to same objects.
 *
 * @param value value to clone
 * @param cache map of cached values already parsed
 * @returns Deep copy of provided value
 * @hidden
 */
export const cloneValueCached = (value: any, cache: Map<any, any>): any => {
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
        if (cache.has(value)) {
            return cache.get(value);
        }

        const result = {};
        cache.set(value, result);

        for (const key of Object.keys(value)) {
            result[key] = cloneValueCached(value[key], cache);
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
export const isObject = (value: any): boolean => !!(value && value.toString() === '[object Object]');

/**
 * Checks if provided variable is Date
 *
 * @param value Value to check
 * @returns true if provided variable is Date
 * @hidden
 */
export const isDate = (value: any): value is Date => {
    return Object.prototype.toString.call(value) === "[object Date]";
}

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
    public isSafari = this.isBrowser && /Safari[\/\s](\d+\.\d+)/.test(navigator.userAgent);
    public isFirefox = this.isBrowser && /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
    public isEdge = this.isBrowser && /Edge[\/\s](\d+\.\d+)/.test(navigator.userAgent);
    public isChromium = this.isBrowser && (/Chrom|e?ium/g.test(navigator.userAgent) ||
        /Google Inc/g.test(navigator.vendor)) && !/Edge/g.test(navigator.userAgent);
    public browserVersion = this.isBrowser ? parseFloat(navigator.userAgent.match(/Version\/([\d.]+)/)?.at(1)) : 0;

    /** @hidden @internal */
    public isElements = inject(ELEMENTS_TOKEN, { optional: true });

    public KEYMAP = mkenum({
        ENTER: 'Enter',
        SPACE: ' ',
        ESCAPE: 'Escape',
        ARROW_DOWN: 'ArrowDown',
        ARROW_UP: 'ArrowUp',
        ARROW_LEFT: 'ArrowLeft',
        ARROW_RIGHT: 'ArrowRight',
        END: 'End',
        HOME: 'Home',
        PAGE_DOWN: 'PageDown',
        PAGE_UP: 'PageUp',
        F2: 'F2',
        TAB: 'Tab',
        SEMICOLON: ';',
        // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values#editing_keys
        DELETE: 'Delete',
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
            nodeStyles = [style.width, style.minWidth, style.flexBasis];
            style.width = '';
            style.minWidth = '';
            style.flexBasis = '';
        }

        range.selectNodeContents(node);
        const scale = node.getBoundingClientRect().width / node.offsetWidth;
        const width = range.getBoundingClientRect().width / scale;

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
        ].includes(key as any);
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
    /* blazorSuppress */
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
export const ACCORDION_NAVIGATION_KEYS = new Set('up down arrowup arrowdown home end'.split(' '));
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
export const resizeObservable = (target: HTMLElement): Observable<ResizeObserverEntry[]> => {
    const resizeObserver = getResizeObserver();
    // check whether we are on server env or client env
    if (resizeObserver) {
        return new Observable((observer) => {
                const instance = new resizeObserver((entries: ResizeObserverEntry[]) => {
                    observer.next(entries);
                });
                instance.observe(target);
                const unsubscribe = () => instance.disconnect();
                return unsubscribe;
        });
    } else {
        // if on a server env return a empty observable that does not complete immediately
        return NEVER;
    }
}

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

export const isConstructor = (ref: any) => typeof ref === 'function' && Boolean(ref.prototype) && Boolean(ref.prototype.constructor);

/**
 * Similar to Angular's formatDate. However it will not throw on `undefined | null | ''` instead
 * coalescing to an empty string.
 */
export const formatDate = (value: string | number | Date, format: string, locale: string, timezone?: string): string => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    return _formatDate(value, format, locale, timezone);
};

export const formatCurrency = new CurrencyPipe(undefined).transform;

/** Converts pixel values to their rem counterparts for a base value */
export const rem = (value: number | string) => {
    const base = parseFloat(globalThis.window?.getComputedStyle(globalThis.document?.documentElement).getPropertyValue('--ig-base-font-size'))
    return Number(value) / base;
}

/** Get the size of the component as derived from the CSS size variable */
export function getComponentSize(el: Element) {
    return globalThis.window?.getComputedStyle(el).getPropertyValue('--component-size');
}

/** Get the first item in an array */
export function first<T>(arr: T[]) {
    return arr.at(0) as T;
}

/** Get the last item in an array */
export function last<T>(arr: T[]) {
    return arr.at(-1) as T;
}

/** Calculates the modulo of two numbers, ensuring a non-negative result. */
export function modulo(n: number, d: number) {
    return ((n % d) + d) % d;
}

/**
 * Splits an array into chunks of length `size` and returns a generator
 * yielding each chunk.
 * The last chunk may contain less than `size` elements.
 *
 * @example
 * ```typescript
 * const arr = [0,1,2,3,4,5,6,7,8,9];
 *
 * Array.from(chunk(arr, 2)) // [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]
 * Array.from(chunk(arr, 3)) // [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9]]
 * Array.from(chunk([], 3)) // []
 * Array.from(chunk(arr, -3)) // Error
 * ```
 */
export function* intoChunks<T>(arr: T[], size: number) {
  if (size < 1) {
    throw new Error('size must be an integer >= 1');
  }
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}

/**
 * @param size
 * @returns string that represents the --component-size default value
 */
export function getComponentCssSizeVar(size: string) {
    switch (size) {
        case "1":
            return 'var(--ig-size, var(--ig-size-small))';
        case "2":
            return 'var(--ig-size, var(--ig-size-medium))';
        case "3":
        default:
            return 'var(--ig-size, var(--ig-size-large))';
    }
}

/**
 * @param path - The URI path to be normalized.
 * @returns string encoded using the encodeURI function.
 */
 export function normalizeURI(path: string) {
    return path?.split('/').map(encodeURI).join('/');
 }

export function getComponentTheme(el: Element) {
    return globalThis.window
    ?.getComputedStyle(el)
    .getPropertyValue('--theme')
    .trim() as IgxTheme;
}
