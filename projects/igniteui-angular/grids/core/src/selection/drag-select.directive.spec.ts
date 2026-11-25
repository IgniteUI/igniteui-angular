import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { IgxGridDragSelectDirective } from './drag-select.directive';

describe('IgxGridDragSelectDirective #grid', () => {
    let fix: ComponentFixture<DragSelectTestComponent>;
    let component: DragSelectTestComponent;
    let directive: IgxGridDragSelectDirective;
    let element: HTMLElement;
    let deltas: { left: number; top: number }[];
    let stops: boolean[];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DragSelectTestComponent]
        }).compileComponents();
    });

    /**
     * The directive scrolls on an `animationFrameScheduler` interval. Waiting for the next
     * animation frame lets any interval frame that was already requested run before it resolves.
     */
    const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    /**
     * The fixture is created inside the test itself so that every test starts from a fresh
     * directive with its own emission records.
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
    const pointerOver = async (x: number, y: number) => {
        element.dispatchEvent(new PointerEvent('pointerover', { clientX: x, clientY: y }));
        await nextFrame();
    };

    const lastDelta = () => deltas[deltas.length - 1];

    it('should emit the matching scroll delta for every edge and corner', async () => {
        setup();

        await pointerOver(10, 5);
        expect(lastDelta(), 'top left').toEqual({ left: -1, top: -1 });

        await pointerOver(190, 5);
        expect(lastDelta(), 'top right').toEqual({ left: 1, top: -1 });

        await pointerOver(10, 95);
        expect(lastDelta(), 'bottom left').toEqual({ left: -1, top: 1 });

        await pointerOver(190, 95);
        expect(lastDelta(), 'bottom right').toEqual({ left: 1, top: 1 });

        await pointerOver(100, 5);
        expect(lastDelta(), 'top').toEqual({ left: 0, top: -1 });

        await pointerOver(100, 95);
        expect(lastDelta(), 'bottom').toEqual({ left: 0, top: 1 });

        await pointerOver(10, 50);
        expect(lastDelta(), 'left').toEqual({ left: -1, top: 0 });

        await pointerOver(190, 50);
        expect(lastDelta(), 'right').toEqual({ left: 1, top: 0 });

        fix.destroy();
    });

    it('should keep emitting the same delta while the pointer stays in the same zone', async () => {
        setup();

        await pointerOver(10, 50);
        const afterFirstFrame = deltas.length;
        expect(afterFirstFrame, 'the subscription starts emitting').toBeGreaterThan(0);

        // Moving inside the same zone must not resubscribe, but the interval keeps running.
        await pointerOver(20, 60);
        expect(deltas.length, 'the interval is still emitting').toBeGreaterThan(afterFirstFrame);
        expect(deltas.every(delta => delta.left === -1 && delta.top === 0), 'same delta throughout').toBeTruthy();

        fix.destroy();
    });

    it('should stop scrolling when the pointer moves from an edge to the middle of the element', async () => {
        setup();

        await pointerOver(10, 50);
        const beforeMiddle = deltas.length;
        expect(beforeMiddle, 'scrolling starts at the edge').toBeGreaterThan(0);

        await pointerOver(100, 50);

        expect(deltas.length, 'no scrolling in the neutral zone').toBe(beforeMiddle);
        fix.destroy();
    });

    it('should stop scrolling when the pointer leaves the element', async () => {
        setup();

        await pointerOver(10, 5);
        const beforeLeave = deltas.length;
        expect(beforeLeave).toBeGreaterThan(0);

        element.dispatchEvent(new PointerEvent('pointerleave'));
        await nextFrame();

        expect(stops, 'dragStop reports the drag as over').toEqual([false]);
        expect(deltas.length, 'no further emissions after leaving').toBe(beforeLeave);

        // The direction is reset, so re-entering the very same zone starts scrolling again.
        await pointerOver(10, 5);
        expect(deltas.length, 'the same zone is picked up again').toBeGreaterThan(beforeLeave);

        fix.destroy();
    });

    it('should ignore pointer events while the drag is not active', async () => {
        setup();

        // The directive is set directly rather than through the host binding - it is the very
        // same setter the `igxGridDragSelect` input writes to.
        directive.activeDrag = false;

        await pointerOver(10, 5);
        element.dispatchEvent(new PointerEvent('pointerleave'));
        await nextFrame();

        expect(deltas.length, 'no scrolling').toBe(0);
        expect(stops.length, 'no dragStop').toBe(0);

        fix.destroy();
    });

    it('should stop scrolling when the drag is deactivated or the directive is destroyed', async () => {
        setup();

        await pointerOver(10, 5);
        const whileActive = deltas.length;
        expect(whileActive).toBeGreaterThan(0);

        // The directive is set directly rather than through the host binding - it is the very
        // same setter the `igxGridDragSelect` input writes to.
        directive.activeDrag = false;
        await nextFrame();
        expect(deltas.length, 'deactivating the drag unsubscribes').toBe(whileActive);

        directive.activeDrag = true;
        await pointerOver(190, 50);
        const whileActiveAgain = deltas.length;
        expect(whileActiveAgain, 'reactivating it resumes').toBeGreaterThan(whileActive);

        fix.destroy();
        await nextFrame();
        expect(deltas.length, 'destroying the directive unsubscribes').toBe(whileActiveAgain);

        // The listeners are detached on destroy, so the element no longer reacts at all.
        element.dispatchEvent(new PointerEvent('pointerover', { clientX: 10, clientY: 5 }));
        await nextFrame();
        expect(deltas.length, 'no listeners left on the element').toBe(whileActiveAgain);
    });
});

// `pointer-events: none` keeps the browser's own pointer out: its cursor rests at (0, 0), over this element,
// and the real hover event switches the scroll zone under the test. Dispatched events are not hit-tested.
@Component({
    template: `<div [igxGridDragSelect]="activeDrag"
        style="position: fixed; top: 0; left: 0; width: 200px; height: 100px; pointer-events: none;"></div>`,
    imports: [IgxGridDragSelectDirective]
})
class DragSelectTestComponent {
    @ViewChild(IgxGridDragSelectDirective, { static: true })
    public dragSelect: IgxGridDragSelectDirective;

    public activeDrag = true;
}
