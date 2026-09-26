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

    it('should not emit swipe when movement stays below the pan threshold', () => {
        const panStart = jasmine.createSpy('panStart');
        const panMove = jasmine.createSpy('panMove');
        const swipe = jasmine.createSpy('swipe');
        spyOn(Date, 'now').and.returnValues(0, 1, 1);
        manager = new IgxTouchManager(target, { panStart, panMove, swipe }, { panThreshold: 5 });

        dispatchPointerEvent(target, 'pointerdown', 10, 10);
        dispatchPointerEvent(target, 'pointermove', 13, 10);
        dispatchPointerEvent(target, 'pointerup', 13, 10);

        expect(panStart).not.toHaveBeenCalled();
        expect(panMove).not.toHaveBeenCalled();
        expect(swipe).not.toHaveBeenCalled();
    });

    for (const endX of [13, 16]) {
        it(`should emit swipe before panEnd after a recognized pan ending at x=${endX}`, () => {
            const swipe = jasmine.createSpy('swipe');
            const panEnd = jasmine.createSpy('panEnd');
            spyOn(Date, 'now').and.returnValues(0, 1, 2);
            manager = new IgxTouchManager(target, { swipe, panEnd }, { panThreshold: 5 });

            dispatchPointerEvent(target, 'pointerdown', 10, 10);
            dispatchPointerEvent(target, 'pointermove', 16, 10);
            dispatchPointerEvent(target, 'pointerup', endX, 10);

            expect(swipe).toHaveBeenCalledTimes(1);
            expect(panEnd).toHaveBeenCalledTimes(1);
            expect(swipe).toHaveBeenCalledBefore(panEnd);
            expectTrackingStateToBeReset(manager);
        });
    }

    for (const eventType of ['pointerup', 'pointercancel']) {
        it(`should reset tracking state on ${eventType}`, () => {
            manager = new IgxTouchManager(target, {});

            dispatchPointerEvent(target, 'pointerdown', 10, 10);
            dispatchPointerEvent(target, 'pointermove', 20, 10);
            dispatchPointerEvent(target, eventType, 20, 10);

            expectTrackingStateToBeReset(manager);
        });
    }

    it('should reset tracking state when destroyed', () => {
        manager = new IgxTouchManager(target, {});

        dispatchPointerEvent(target, 'pointerdown', 10, 10);
        dispatchPointerEvent(target, 'pointermove', 20, 10);
        manager.destroy();

        expectTrackingStateToBeReset(manager);
    });
});

function expectTrackingStateToBeReset(manager: IgxTouchManager): void {
    expect((manager as any)._tracking).toBeFalse();
    expect((manager as any)._panStarted).toBeFalse();
    expect((manager as any)._pointerId).toBeNull();
    expect((manager as any)._startTarget).toBeNull();
}

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

function dispatchTouchMove(target: EventTarget): TouchEvent {
    const event = new TouchEvent('touchmove', { bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
}
