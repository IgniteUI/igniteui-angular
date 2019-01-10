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
        arr[i] = deep ? cloneValue(array[i]) : array[i];
    }
    return arr;
}

/**
 * Doesn't clone leaf items
 * @hidden
 */
export function cloneHierarchicalArray(array: any[], childDataKey: any): any[] {
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
}

/**
 * Deep clones all first level keys of Obj2 and merges them to Obj1
 * @param obj1 Object to merge into
 * @param obj2 Object to merge from
 * @returns Obj1 with merged cloned keys from Obj2
 * @hidden
 */
export function mergeObjects(obj1: {}, obj2: {}): any {
    if (!isObject(obj1)) {
        throw new Error(`Cannot merge into ${obj1}. First param must be an object.`);
    }

    if (!isObject(obj2)) {
        return obj1;
    }

    for (const key of Object.keys(obj2)) {
        obj1[key] = cloneValue(obj2[key]);
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
export function cloneValue(value: any): any {
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
 * Checks if the two passed arguments are equal
 * Currently supports date objects
 * @param obj1
 * @param obj2
 * @returns: `boolean`
 * @hidden
 */
export function isEqual(obj1, obj2): boolean {
    if (isDate(obj1) && isDate(obj2)) {
        return obj1.getTime() === obj2.getTime();
    }
    return obj1 === obj2;
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
    F2 = 113,
    TAB = 9
}

/**
 *@hidden
 */
export const enum KEYS {
    ENTER = 'Enter',
    SPACE = ' ',
    SPACE_IE = 'Spacebar',
    ESCAPE = 'Escape',
    ESCAPE_IE = 'Esc',
    LEFT_ARROW = 'ArrowLeft',
    LEFT_ARROW_IE = 'Left',
    UP_ARROW = 'ArrowUp',
    UP_ARROW_IE = 'Up',
    RIGHT_ARROW = 'ArrowRight',
    RIGHT_ARROW_IE = 'Right',
    DOWN_ARROW = 'ArrowDown',
    DOWN_ARROW_IE = 'Down',
    F2 = 'F2',
    TAB = 'Tab'
}

/**
 *@hidden
* Returns the actual size of the node content, using Range
* ```typescript
* let range = document.createRange();
* let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
*
* let size = getNodeSizeViaRange(range, column.cells[0].nativeElement);
* ```
 */
export function getNodeSizeViaRange(range: Range, node: any): number {
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
export function getNodeSizeViaCanvas(canvas2dCtx: any, node: any): number {
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

/** @hidden */
export function isNavigationKey(key: string): boolean {
    return ['down', 'up', 'left', 'right', 'arrowdown', 'arrowup', 'arrowleft', 'arrowright',
        'home', 'end', 'space', 'spacebar', ' '].indexOf(key) !== -1;
}

/**
 *@hidden
 */
export function flatten(arr: any[]) {
    let result = [];

    arr.forEach(el => {
        result.push(el);
        if (el.children) {
            const children = Array.isArray(el.children) ? el.children : el.children.toArray();
            result = result.concat(flatten(children));
        }
    });
    return result;
}

export interface CancelableEventArgs {
    /**
     * Provides the ability to cancel the event.
     */
    cancel: boolean;
}
