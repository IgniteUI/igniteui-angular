import { IgxTouchManager } from './touch';

describe('IgxTouchManager', () => {
    let manager: IgxTouchManager;
    let target: HTMLDivElement;

    beforeEach(() => {
        target = document.createElement('div');
        document.body.appendChild(target);
    });

    afterEach(() => {
        manager?.destroy();
        target.remove();
    });

    it('should stop tracking when pointerDown vetoes the gesture', () => {
        const panStart = jasmine.createSpy('panStart');
        const panMove = jasmine.createSpy('panMove');
        manager = new IgxTouchManager(target, {
            pointerDown: () => false,
            panStart,
            panMove
        });

        dispatchPointerEvent(target, 'pointerdown', 10, 10);
        const touchMove = dispatchTouchMove(target);
        dispatchPointerEvent(target, 'pointermove', 30, 10);

        expect(touchMove.defaultPrevented).toBeFalse();
        expect(panStart).not.toHaveBeenCalled();
        expect(panMove).not.toHaveBeenCalled();
    });

    it('should preserve native touch behavior until the pan threshold is exceeded', () => {
        const panStart = jasmine.createSpy('panStart');
        const panMove = jasmine.createSpy('panMove');
        manager = new IgxTouchManager(target, {
            panStart,
            panMove
        }, { panAxis: 'horizontal', panThreshold: 5 });

        dispatchPointerEvent(target, 'pointerdown', 10, 10);
        const initialTouchMove = dispatchTouchMove(target);
        dispatchPointerEvent(target, 'pointermove', 13, 10);
        const candidateTouchMove = dispatchTouchMove(target);

        expect(initialTouchMove.defaultPrevented).toBeFalse();
        expect(candidateTouchMove.defaultPrevented).toBeFalse();
        expect(panStart).not.toHaveBeenCalled();
        expect(panMove).not.toHaveBeenCalled();

        dispatchPointerEvent(target, 'pointermove', 11, 20);
        const verticalTouchMove = dispatchTouchMove(target);

        expect(verticalTouchMove.defaultPrevented).toBeFalse();
        expect(panStart).not.toHaveBeenCalled();
        expect(panMove).not.toHaveBeenCalled();

        dispatchPointerEvent(target, 'pointermove', 16, 10);
        const activePanTouchMove = dispatchTouchMove(target);

        expect(panStart).toHaveBeenCalledTimes(1);
        expect(panMove).toHaveBeenCalledTimes(1);
        expect(activePanTouchMove.defaultPrevented).toBeTrue();
    });
});

function dispatchPointerEvent(target: EventTarget, type: string, clientX: number, clientY: number): void {
    target.dispatchEvent(new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'touch',
        clientX,
        clientY
    }));
}

function dispatchTouchMove(target: EventTarget): Event {
    const event = new Event('touchmove', { bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
}
