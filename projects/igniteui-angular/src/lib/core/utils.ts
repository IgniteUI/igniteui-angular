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
export function isIE (): boolean {
  return navigator.appVersion.indexOf('Trident/') > 0;
}
/**
 *@hidden
 */
export function isEdge (): boolean {
    const edgeBrowser = /Edge[\/\s](\d+\.\d+)/.test(navigator.userAgent);
    return edgeBrowser;
}

/**
 *@hidden
 */
export function isFirefox (): boolean {
    const firefoxBrowser = /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
    return firefoxBrowser;
}

export function isNavigationKey(key: string): boolean {
    return ['down', 'up', 'left', 'right', 'arrowdown', 'arrowup', 'arrowleft', 'arrowright',
         'home', 'end', 'space', 'spacebar', ' '].indexOf(key) !== -1;
}
