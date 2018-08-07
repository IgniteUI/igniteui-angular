export function wait(ms = 0) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

export class UIInteractions {

    public static sendInput(element, text, fix?) {
        element.nativeElement.value = text;
        element.nativeElement.dispatchEvent(new Event('input'));
        if (fix) {
            return fix.whenStable();
        }
    }

    public static triggerKeyEvtUponElem(evtName, elem, bubbles = true) {
        const evtArgs: KeyboardEventInit = { key: evtName, bubbles: bubbles };
        elem.dispatchEvent(new KeyboardEvent(evtName, evtArgs));
    }

    public static triggerKeyDownEvtUponElem(keyPressed, elem) {
        const keyboardEvent = new KeyboardEvent('keydown', {
            key: keyPressed
        });
        elem.dispatchEvent(keyboardEvent);
    }

    public static findCellByInputElem(elem, focusedElem) {
        if (!focusedElem.parentElement) {
            return null;
        }

        if (elem === focusedElem) {
            return elem;
        }

        return this.findCellByInputElem(elem, focusedElem.parentElement);
    }

    public static clickCurrentRow(row) {
        return row.triggerEventHandler('click', new Event('click'));
    }

    public static simulateMouseEvent(eventName: string, element, x, y) {
        const options: MouseEventInit = {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y
        };

        return new Promise((resolve, reject) => {
            element.dispatchEvent(new MouseEvent(eventName, options));
            resolve();
        });
    }

    public static simulateKeyDownEvent(element, key) {
        const keyOptions: KeyboardEventInit = {
            key
        };

        const keypressEvent = new KeyboardEvent('keydown', keyOptions);

        return new Promise((resolve, reject) => {
            element.dispatchEvent(keypressEvent);
            resolve();
        });
    }

    public static simulatePointerEvent(eventName: string, element, x, y) {
        const options: PointerEventInit = {
            view: window,
            bubbles: true,
            cancelable: true,
            pointerId: 1
        };
        const pointerEvent = new PointerEvent(eventName, options);
        Object.defineProperty(pointerEvent, 'pageX', { value: x, enumerable: true });
        Object.defineProperty(pointerEvent, 'pageY', { value: y, enumerable: true });
        return new Promise((resolve, reject) => {
            element.dispatchEvent(pointerEvent);
            resolve();
        });
    }
}
