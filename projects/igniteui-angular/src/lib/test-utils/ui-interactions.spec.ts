import { HorizontalAlignment, VerticalAlignment, Point } from '../services';

export function wait(ms = 0) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}
declare var Touch: {
    prototype: Touch;
    new(prop): Touch;
};
export class UIInteractions {

    public static sendInput(element, text, fix?) {
        element.nativeElement.value = text;
        element.nativeElement.dispatchEvent(new Event('input'));
        if (fix) {
            return fix.whenStable();
        }
    }

    public static triggerKeyEvtUponElem(evtName, elem) {
        const evtArgs: KeyboardEventInit = { key: evtName, bubbles: true };
        elem.dispatchEvent(new KeyboardEvent(evtName, evtArgs));
    }

    public static triggerKeyDownEvtUponElem(keyPressed, elem, bubbles, altKey = false, shift = false, ctrl = false) {
        const keyboardEvent = new KeyboardEvent('keydown', {
            key: keyPressed,
            bubbles: bubbles,
            shiftKey: shift,
            ctrlKey: ctrl,
            altKey: altKey
        });
        elem.dispatchEvent(keyboardEvent);
    }

    public static triggerKeyDownWithBlur(keyPressed, elem, bubbles, altKey = false, shift = false, ctrl = false) {
        UIInteractions.triggerKeyDownEvtUponElem(keyPressed, elem, bubbles, altKey, shift, ctrl);
        elem.dispatchEvent(new Event('blur'));
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

    /**
     * Clicks an element - native or debug, by dispatching pointerdown, focus, pointerup and click events.
     * @param element - Native or debug element.
     */
    public static clickElement(element) {
        const nativeElement = element.nativeElement ? element.nativeElement : element;
        const elementRect = nativeElement.getBoundingClientRect();
        UIInteractions.simulatePointerEvent('pointerdown', nativeElement, elementRect.left, elementRect.top);
        nativeElement.dispatchEvent(new Event('focus'));
        UIInteractions.simulatePointerEvent('pointerup', nativeElement, elementRect.left, elementRect.top);
        nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
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
            key,
            bubbles: true
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
        element.dispatchEvent(pointerEvent);
        return pointerEvent;
    }

    public static simulatePointerOverCellEvent(eventName: string, element, shift = false, ctrl = false) {
        const options: PointerEventInit = {
            view: window,
            bubbles: true,
            cancelable: true,
            pointerId: 1,
            buttons: 1,
            button: eventName === 'pointerenter' ? -1 : 0,
            shiftKey: shift,
            ctrlKey: ctrl
        };
        element.dispatchEvent(new PointerEvent(eventName, options));
    }

    public static simulateDragScrollOverCellEvent(eventName: string, element, clientX, clientY, shift = false, ctrl = false) {
        const options: PointerEventInit = {
            view: window,
            bubbles: true,
            cancelable: true,
            pointerId: 1,
            buttons: 1,
            shiftKey: shift,
            ctrlKey: ctrl,
            clientX: clientX,
            clientY: clientY
        };
        element.dispatchEvent(new PointerEvent(eventName, options));
    }

    public static simulateClickAndSelectCellEvent(element, shift = false, ctrl = false) {
        UIInteractions.simulatePointerOverCellEvent('pointerdown', element.nativeElement, shift, ctrl);
        element.nativeElement.dispatchEvent(new Event('focus'));
        UIInteractions.simulatePointerOverCellEvent('pointerup', element.nativeElement);
    }

    public static simulateNonPrimaryClick(cell) {
        cell.nativeElement.dispatchEvent(new PointerEvent('pointerdown', { button: 2 }));
        cell.nativeElement.dispatchEvent(new Event('focus'));
        cell.nativeElement.dispatchEvent(new PointerEvent('pointerup', { button: 2 }));
    }

    public static clearOverlay() {
        const overlays = document.getElementsByClassName('igx-overlay') as HTMLCollectionOf<Element>;
        Array.from(overlays).forEach(element => {
            element.remove();
        });
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
    }
    public static simulateWheelEvent(element, deltaX, deltaY) {
        const event = new WheelEvent('wheel', { deltaX: deltaX, deltaY: deltaY });
        Object.defineProperty(event, 'wheelDeltaX', {value: deltaX});
        Object.defineProperty(event, 'wheelDeltaY', {value: deltaY});

        return new Promise((resolve, reject) => {
            element.dispatchEvent(event);
            resolve();
        });
    }

    public static simulateTouchStartEvent(element, pageX, pageY) {
        const touchInit = {
            identifier: 0,
            target: element,
            pageX: pageX,
            pageY: pageY
        };
        const t = new Touch(touchInit);
        const touchEventObject = new TouchEvent('touchstart', {touches: [t]});
        return new Promise((resolve, reject) => {
            element.dispatchEvent(touchEventObject);
            resolve();
        });
    }
    public static simulateTouchMoveEvent(element, movedX, movedY) {
        const touchInit = {
            identifier: 0,
            target: element,
            pageX: movedX,
            pageY: movedY
        };
        const t = new Touch(touchInit);
        const touchEventObject = new TouchEvent('touchmove', {touches: [t]});
        return new Promise((resolve, reject) => {
            element.dispatchEvent(touchEventObject);
            resolve();
        });
    }

    public static simulateTouchEndEvent(element, movedX, movedY) {
        const touchInit = {
            identifier: 0,
            target: element,
            pageX: movedX,
            pageY: movedY
        };
        const t = new Touch(touchInit);
        const touchEventObject = new TouchEvent('touchend', {touches: [t]});
        return new Promise((resolve, reject) => {
            element.dispatchEvent(touchEventObject);
            resolve();
        });
    }

    /**
     * Calculate point within element
     * @param element Element to calculate point for
     * @param hAlign The horizontal position of the point within the element (defaults to center)
     * @param vAlign The vertical position of the point within the element (defaults to middle)
     */
    public static getPointFromElement(
        element: Element,
        hAlign: HorizontalAlignment = HorizontalAlignment.Center,
        vAlign: VerticalAlignment = VerticalAlignment.Middle): Point {
            const elementRect = element.getBoundingClientRect();
            return {
                x: elementRect.right + hAlign * elementRect.width,
                y: elementRect.bottom + vAlign * elementRect.height
            };
    }
}
