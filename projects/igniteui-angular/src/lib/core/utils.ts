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
 *@hidden
 */
export function cloneObject(object: any) {
    return JSON.parse(JSON.stringify(object));
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
 */
export const enum DisplayDensity {
    comfortable = 'comfortable',
    cosy = 'cosy',
    compact = 'compact'
}
