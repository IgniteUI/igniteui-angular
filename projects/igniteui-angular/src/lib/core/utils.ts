/**
 *@hidden
 */
export function cloneArray(array, deep?: boolean) {
    const arr = [];
    if (!array) {
        return arr;
    }
    let i = array.length;
    while (i--) {
        arr[i] = deep ? cloneObject(array[i]) : array[i];
    }
    return arr;
}

/**
 * Deep clones all first level keys of Obj2 and merges them to Obj1
 * @param obj1 Object to merge into
 * @param obj2 Object to merge from
 * @returns Obj1 with merged cloned keys from Obj2
 * @hidden
 */
export function mergeObjects(obj1: {}, obj2: {}) {
    if (obj1 === null || obj1 === undefined) {
        return cloneObject(obj2);
    }

    if (obj2 === null || obj2 === undefined) {
        return obj1;
    }

    if (!isObject(obj1)) {
        throw new Error(`Should provide objects to mergeObjects method. ${obj1} is not an object!`);
    }

    if (!isObject(obj2)) {
        throw new Error(`Should provide objects to mergeObjects method. ${obj2} is not an object!`);
    }

    for (const key of Object.keys(obj2)) {
        obj1[key] = cloneObject(obj2[key]);
    }

    return obj1;
}

/**
 * Creates deep clone of provided value.
 * Supports primitive values, dates and objects.
 * If passed value is array returns shallow copy of the array.
 * @param value value to clone
 * @returns Deep copy of provided value
 *@hidden
 */
export function cloneObject(value: any): any {
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
            result[key] = cloneObject(value[key]);
        }
        return result;
    }
    return value;
}

/**
 * Checks if provided variable is Object
 * @param value Value to check
 * @returns true if provided variable is Object
 *@hidden
 */
export function isObject(value: any): boolean {
    return value && value.toString() === '[object Object]';
}

/**
 * Checks if provided variable is Date
 * @param value Value to check
 * @returns true if provided variable is Date
 *@hidden
 */
export function isDate(value: any) {
    return Object.prototype.toString.call(value) === '[object Date]';
}

/**
 *@hidden
 */
export const enum KEYCODES {
    ENTER = 13,
    SPACE = 32,
    ESCAPE = 27,
    LEFT_ARROW = 37,
    UP_ARROW = 38,
    RIGHT_ARROW = 39,
    DOWN_ARROW = 40,
    F2 = 113
}

/**
 *@hidden
* Returns the actual size of the node content, using Range
* ```typescript
* let range = document.createRange();
* let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
*
* let size = valToPxlsUsingRange(range, column.cells[0].nativeElement);
* ```
 */
export function valToPxlsUsingRange(range: Range, node: any): number {
    let overflow = null;
    if (isIE() || isEdge()) {
        overflow = node.style.overflow;
        // we need that hack - otherwise content won't be measured correctly in IE/Edge
        node.style.overflow = 'visible';
    }

    range.selectNodeContents(node);
    const width = range.getBoundingClientRect().width;

    if (isIE() || isEdge()) {
        // we need that hack - otherwise content won't be measured correctly in IE/Edge
        node.style.overflow = overflow;
    }

    return width;
}
/**
 *@hidden
* Returns the actual size of the node content, using Canvas
* ```typescript
* let ctx = document.createElement('canvas').getContext('2d');
* let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
*
* let size = valToPxlsUsingCanvas(ctx, column.cells[0].nativeElement);
* ```
 */
export function valToPxlsUsingCanvas(canvas2dCtx: any, node: any): number {
    const s = this.grid.document.defaultView.getComputedStyle(node);

    // need to set the font to get correct width
    canvas2dCtx.font = s.fontSize + ' ' + s.fontFamily;

    return canvas2dCtx.measureText(node.textContent).width;
}
/**
 *@hidden
 */
export function isIE(): boolean {
    return navigator.appVersion.indexOf('Trident/') > 0;
}
/**
 *@hidden
 */
export function isEdge(): boolean {
    const edgeBrowser = /Edge[\/\s](\d+\.\d+)/.test(navigator.userAgent);
    return edgeBrowser;
}

/**
 *@hidden
 */
export function isFirefox(): boolean {
    const firefoxBrowser = /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
    return firefoxBrowser;
}

export function isNavigationKey(key: string): boolean {
    return ['down', 'up', 'left', 'right', 'arrowdown', 'arrowup', 'arrowleft', 'arrowright',
        'home', 'end', 'space', 'spacebar', ' '].indexOf(key) !== -1;
}

export interface CancelableEventArgs {
    /**
     * Provides the ability to cancel the event.
     */
    cancel: boolean;
}
