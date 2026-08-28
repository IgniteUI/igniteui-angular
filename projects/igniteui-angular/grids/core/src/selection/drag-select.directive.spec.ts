import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick, waitForAsync } from '@angular/core/testing';

import { IgxGridDragSelectDirective } from './drag-select.directive';

describe('IgxGridDragSelectDirective', () => {
    let fix: ComponentFixture<DragSelectTestComponent>;
    let component: DragSelectTestComponent;
    let directive: IgxGridDragSelectDirective;
    let element: HTMLElement;
    let deltas: { left: number; top: number }[];
    let stops: boolean[];

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [DragSelectTestComponent]
        }).compileComponents();
    }));

    /**
     * The fixture is created inside the test itself so that the change detection triggered by
     * `detectChanges` runs in the same fake async zone as the assertions that follow it.
     */
    const setup = () => {
        fix = TestBed.createComponent(DragSelectTestComponent);
        fix.detectChanges();

        component = fix.componentInstance;
        directive = component.dragSelect;
        element = directive.nativeElement;

        deltas = [];
        stops = [];
        directive.dragScroll.subscribe(delta => deltas.push(delta));
        directive.dragStop.subscribe(state => stops.push(state));
    };

    /**
     * The element is 200x100 and pinned to the top left corner of the viewport, so the client
     * coordinates below are also the offsets inside it. The directive treats the outer 15% of
     * each side as a scroll zone - x <= 30 / x >= 170 and y <= 15 / y >= 85.
     */
    const pointerOver = (x: number, y: number) => {
        element.dispatchEvent(new PointerEvent('pointerover', { clientX: x, clientY: y }));
        tick(16);
    };

    const lastDelta = () => deltas[deltas.length - 1];

    it('should emit the matching scroll delta for every edge and corner', fakeAsync(() => {
        setup();

        pointerOver(10, 5);
        expect(lastDelta()).toEqual({ left: -1, top: -1 }, 'top left');

        pointerOver(190, 5);
        expect(lastDelta()).toEqual({ left: 1, top: -1 }, 'top right');

        pointerOver(10, 95);
        expect(lastDelta()).toEqual({ left: -1, top: 1 }, 'bottom left');

        pointerOver(190, 95);
        expect(lastDelta()).toEqual({ left: 1, top: 1 }, 'bottom right');

        pointerOver(100, 5);
        expect(lastDelta()).toEqual({ left: 0, top: -1 }, 'top');

        pointerOver(100, 95);
        expect(lastDelta()).toEqual({ left: 0, top: 1 }, 'bottom');

        pointerOver(10, 50);
        expect(lastDelta()).toEqual({ left: -1, top: 0 }, 'left');

        pointerOver(190, 50);
        expect(lastDelta()).toEqual({ left: 1, top: 0 }, 'right');

        fix.destroy();
        discardPeriodicTasks();
    }));

    it('should keep emitting the same delta while the pointer stays in the same zone', fakeAsync(() => {
        setup();

        pointerOver(10, 50);
        const afterFirstFrame = deltas.length;
        expect(afterFirstFrame).toBeGreaterThan(0, 'the subscription starts emitting');

        // Moving inside the same zone must not resubscribe, but the interval keeps running.
        pointerOver(20, 60);
        expect(deltas.length).toBeGreaterThan(afterFirstFrame, 'the interval is still emitting');
        expect(deltas.every(delta => delta.left === -1 && delta.top === 0)).toBeTruthy('same delta throughout');

        fix.destroy();
        discardPeriodicTasks();
    }));

    it('should not scroll while the pointer is in the middle of the element', fakeAsync(() => {
        setup();

        pointerOver(100, 50);

        expect(deltas.length).toBe(0, 'no scrolling in the neutral zone');
        fix.destroy();
        discardPeriodicTasks();
    }));

    it('should stop scrolling when the pointer leaves the element', fakeAsync(() => {
        setup();

        pointerOver(10, 5);
        const beforeLeave = deltas.length;
        expect(beforeLeave).toBeGreaterThan(0);

        element.dispatchEvent(new PointerEvent('pointerleave'));
        tick(16);

        expect(stops).toEqual([false], 'dragStop reports the drag as over');
        expect(deltas.length).toBe(beforeLeave, 'no further emissions after leaving');

        // The direction is reset, so re-entering the very same zone starts scrolling again.
        pointerOver(10, 5);
        expect(deltas.length).toBeGreaterThan(beforeLeave, 'the same zone is picked up again');

        fix.destroy();
        discardPeriodicTasks();
    }));

    it('should ignore pointer events while the drag is not active', fakeAsync(() => {
        setup();

        // The directive is set directly rather than through the host binding - it is the very
        // same setter the `igxGridDragSelect` input writes to.
        directive.activeDrag = false;

        pointerOver(10, 5);
        element.dispatchEvent(new PointerEvent('pointerleave'));
        tick(16);

        expect(deltas.length).toBe(0, 'no scrolling');
        expect(stops.length).toBe(0, 'no dragStop');

        fix.destroy();
        discardPeriodicTasks();
    }));

    it('should stop scrolling when the drag is deactivated or the directive is destroyed', fakeAsync(() => {
        setup();

        pointerOver(10, 5);
        const whileActive = deltas.length;
        expect(whileActive).toBeGreaterThan(0);

        // The directive is set directly rather than through the host binding - it is the very
        // same setter the `igxGridDragSelect` input writes to.
        directive.activeDrag = false;
        tick(16);
        expect(deltas.length).toBe(whileActive, 'deactivating the drag unsubscribes');

        directive.activeDrag = true;
        pointerOver(190, 50);
        const whileActiveAgain = deltas.length;
        expect(whileActiveAgain).toBeGreaterThan(whileActive, 'reactivating it resumes');

        fix.destroy();
        tick(16);
        expect(deltas.length).toBe(whileActiveAgain, 'destroying the directive unsubscribes');

        // The listeners are detached on destroy, so the element no longer reacts at all.
        element.dispatchEvent(new PointerEvent('pointerover', { clientX: 10, clientY: 5 }));
        tick(16);
        expect(deltas.length).toBe(whileActiveAgain, 'no listeners left on the element');
        discardPeriodicTasks();
    }));
});

@Component({
    template: `<div [igxGridDragSelect]="activeDrag"
        style="position: fixed; top: 0; left: 0; width: 200px; height: 100px;"></div>`,
    imports: [IgxGridDragSelectDirective]
})
class DragSelectTestComponent {
    @ViewChild(IgxGridDragSelectDirective, { static: true })
    public dragSelect: IgxGridDragSelectDirective;

    public activeDrag = true;
}
