
export function cloneArray(array, deep?: boolean) {
    const arr = [];
    if (!array) {
        return arr;
    }
    let i = array.length;
    while (i--) {
        arr[i] = deep ? JSON.parse(JSON.stringify(array[i])) : array[i];
    }
    return arr;
}

export const enum KEYCODES {
    ENTER = 13,
    ESCAPE = 27,
    LEFT_ARROW = 37,
    UP_ARROW = 38,
    RIGHT_ARROW = 39,
    DOWN_ARROW = 40,
    F2 = 113
}

export const enum DisplayDensity {
    comfortable = "comfortable",
    cosy = "cosy",
    compact = "compact"
}
