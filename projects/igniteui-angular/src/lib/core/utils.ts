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
/**
 *@hidden
* Determines pixel length of string, using Range
* ```typescript
* let range = document.createRange();
* let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
*
* let size = valToPxlsUsingRange(range, column.cells[0].nativeElement);
* ```
 */
export function valToPxlsUsingRange(range: Range, node: any): number {
    let overflow = null;
    if (isIE || isEdge) {
        overflow = node.style.overflow;
        // we need that hack - otherwise content won't be measured correctly in IE/Edge
        node.style.overflow = 'visible';
    }

    range.selectNodeContents(node);
    const width = range.getBoundingClientRect().width;

    if (isIE || isEdge) {
        // we need that hack - otherwise content won't be measured correctly in IE/Edge
        node.style.overflow = overflow;
    }

    return width;
}
/**
 *@hidden
* Determines pixel length of string using Canvas
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
export const isIE = /internet explorer[\/\s](\d+\.\d+)/.test(navigator.userAgent);
/**
 *@hidden
 */
export const isEdge = /Edge[\/\s](\d+\.\d+)/.test(navigator.userAgent);
/**
 *@hidden
 */
export const isFirefox = /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
