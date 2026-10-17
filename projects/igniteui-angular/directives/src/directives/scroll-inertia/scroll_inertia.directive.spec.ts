import { Component, Directive, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { IgxScrollInertiaDirective } from './scroll_inertia.directive';

import { wait } from '../../../../test-utils/ui-interactions.spec';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Scroll Inertia Directive - Rendering', () => {
    let fix: ComponentFixture<ScrollInertiaComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                IgxTestScrollInertiaDirective,
                ScrollInertiaComponent
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fix = TestBed.createComponent(ScrollInertiaComponent);
        fix.detectChanges();
    });

    afterEach(() => {
        fix = null;
    });

    it('should initialize directive on non-scrollable container.', async () => {
        expect(fix.componentInstance.scrInertiaDir, 'scroll inertia initializing through markup failed').toBeDefined();
        await fix.whenStable();
    });

    // Unit tests for inertia function.
    // The inertia is driven by requestAnimationFrame, so the frames are faked and advanced one by one.
    // Each inertia frame moves the scroll position with a constant step until the inertia breakpoint
    // and then decelerates with an ease-out falloff until the inertia ends.
    const collectInertiaSteps = (axis: 'scrollTop' | 'scrollLeft'): number[] => {
        const scrollContainer: HTMLElement = fix.componentInstance.scrollContainer.nativeElement;
        const steps: number[] = [];
        let prev = scrollContainer[axis];
        // Safety cap - the inertia should end well before that
        for (let i = 0; i < 200 && vi.getTimerCount() > 0; i++) {
            vi.advanceTimersToNextFrame();
            const current = scrollContainer[axis];
            steps.push(current - prev);
            prev = current;
        }
        return steps;
    };

    const expectAccelerationThenDeceleration = (steps: number[]) => {
        // inertiaDuration 0.5 => time step of 0.1 until the cancel threshold of 6 => ~60 animation frames
        expect(vi.getTimerCount(), 'inertia should stop on its own').toBe(0);
        expect(steps.length).toBeGreaterThanOrEqual(58);
        expect(steps.length).toBeLessThanOrEqual(63);

        // the inertia moves in the direction of the speed during every frame but the very last ones
        const moving = steps.slice(0, 50);
        moving.forEach(step => expect(step).toBeGreaterThan(0));

        // speed * INERTIA_MULTIPLIER (15) * inertiaStep (1.5) per frame before the breakpoint
        const first = steps[0];
        const mid = steps[9];
        const end = steps[steps.length - 3];
        expect(Math.abs(first - 22.5)).toBeLessThanOrEqual(1);
        expect(Math.abs(mid - 22.5)).toBeLessThanOrEqual(1);
        expect(end).toBeLessThan(mid);
        expect(end).toBeLessThan(first);

        // after the breakpoint the steps should only decrease (1px tolerance for scroll offset snapping)
        for (let i = 11; i < steps.length; i++) {
            expect(steps[i]).toBeLessThanOrEqual(steps[i - 1] + 1);
        }
        const total = steps.reduce((a, b) => a + b, 0);
        expect(total).toBeGreaterThan(10 * 22.5);
    };

    it('inertia should accelerate and then deccelerate vertically.', async () => {
        await fix.whenStable();
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        const scrollContainer: HTMLElement = fix.componentInstance.scrollContainer.nativeElement;
        expect(scrollContainer.scrollTop).toBe(0);

        vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
        try {
            // vertical inertia
            scrInertiaDir._inertiaInit(0, 1);
            const steps = collectInertiaSteps('scrollTop');
            expectAccelerationThenDeceleration(steps);
            expect(scrollContainer.scrollLeft).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    it('inertia should accelerate and then deccelerate horizontally.', async () => {
        await fix.whenStable();
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        const scrollContainer: HTMLElement = fix.componentInstance.scrollContainer.nativeElement;
        expect(scrollContainer.scrollLeft).toBe(0);

        vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
        try {
            // horizontal inertia
            scrInertiaDir._inertiaInit(1, 0);
            const steps = collectInertiaSteps('scrollLeft');
            expectAccelerationThenDeceleration(steps);
            expect(scrollContainer.scrollTop).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });
});

describe('Scroll Inertia Directive - Scrolling', () => {
    let scrollInertiaDir: IgxTestScrollInertiaDirective;
    let scrollContainerMock;

    beforeEach(async () => {
        scrollContainerMock = {
            scrollLeft: 0,
            scrollTop: 0,
            offsetHeight: 500,
            children: [{ style: { width: '50px', height: '500px', scrollHeight: 100 } }]
        };

        await TestBed.configureTestingModule({
            providers: [
                { provide: ElementRef, useValue: null },
                IgxTestScrollInertiaDirective
            ]
        }).compileComponents();

        scrollInertiaDir = TestBed.inject(IgxTestScrollInertiaDirective);
        scrollInertiaDir.IgxScrollInertiaScrollContainer = scrollContainerMock;
        scrollInertiaDir.smoothingDuration = 0;
    });

    afterEach(() => {
        scrollInertiaDir.ngOnDestroy();
        vi.useRealTimers();
    });

    // Unit test for wheel - wheelDelataY/wheelDeltaX supported on Chrome, Safari, Opera.
    it('should change scroll top for related scrollbar if onWheel is executed with wheelDeltaY.', () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'vertical';
        const evt = { wheelDeltaY: -240, preventDefault: () => { } };
        scrollInertiaDir.onWheel(evt);
        expect(scrollContainerMock.scrollTop).toEqual(2 * scrollInertiaDir.wheelStep);
    });

    it('should change scroll left for related scrollbar if onWheel is executed with wheelDeltaX.', () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        const evt = { wheelDeltaX: -240, preventDefault: () => { } };
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollLeft).toEqual(2 * scrollInertiaDir.wheelStep);
    });

    // Unit tests for wheel on other browsers that don't provide wheelDelta - use deltaX and deltaY.
    it('should change scroll top for related scrollbar if onWheel is executed with deltaY.', () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'vertical';
        const evt = { deltaY: 1, preventDefault: () => { } };
        scrollInertiaDir.onWheel(evt);
        expect(scrollContainerMock.scrollTop).toEqual(scrollInertiaDir.wheelStep);
    });

    it('should change scroll left for related scrollbar if onWheel is executed with deltaX.', () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        const evt = { deltaX: 1, preventDefault: () => { } };
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollLeft).toEqual(scrollInertiaDir.wheelStep);
    });

    it('should not throw error if there is no associated scrollbar and wheel event is called.', () => {
        scrollInertiaDir.IgxScrollInertiaScrollContainer = null;
        const evt = { preventDefault: () => { } };
        expect(() => scrollInertiaDir.onWheel(evt)).not.toThrow();
    });


    it('should change scroll left when shift + wheel is triggered', () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        const evt = { shiftKey: true, wheelDeltaY: -240, preventDefault: () => { } };
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollTop).toEqual(0);
        expect(scrollContainerMock.scrollLeft).toEqual(2 * scrollInertiaDir.wheelStep);
    });

    it('should be able to scroll to left/right when shift + wheel is triggered', () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        let evt = { shiftKey: true, wheelDeltaY: -240, preventDefault: () => { } };
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollTop).toEqual(0);
        expect(scrollContainerMock.scrollLeft).toEqual(2 * scrollInertiaDir.wheelStep);

        evt = { shiftKey: true, wheelDeltaY: 120, preventDefault: () => { } };
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollTop).toEqual(0);
        expect(scrollContainerMock.scrollLeft).toEqual(scrollInertiaDir.wheelStep);
    });

    it('should change scroll left when shift + wheel is called with with deltaY', () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        const evt = { shiftKey: true, deltaY: 1, preventDefault: () => { } };
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollTop).toEqual(0);
        expect(scrollContainerMock.scrollLeft).toEqual(scrollInertiaDir.wheelStep);
    });

    it('should be able to scroll to left/right when shift + wheel is called with with deltaY', () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        let evt = { shiftKey: true, deltaY: 1, preventDefault: () => { } };
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollTop).toEqual(0);
        expect(scrollContainerMock.scrollLeft).toEqual(scrollInertiaDir.wheelStep);

        evt = { shiftKey: true, deltaY: -1, preventDefault: () => { } };
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollTop).toEqual(0);
        expect(scrollContainerMock.scrollLeft).toEqual(0);
    });

    // Unit tests for touch events with inertia - Chrome, FireFox, Safari.
    it('should change scroll top for related scrollbar on touch start/move/end', () => {
        // the inertia velocity depends on the elapsed time, so control it with fake timers
        vi.useFakeTimers();
        let evt = {
            touches: [{
                    pageX: 0,
                    pageY: 0
                }],
            preventDefault: () => { }
        };
        scrollInertiaDir.onTouchStart(evt);

        evt = {
            touches: [{
                    pageX: 0,
                    pageY: -100
                }],
            preventDefault: () => { }
        };
        vi.advanceTimersByTime(10);
        scrollInertiaDir.onTouchMove(evt);

        scrollInertiaDir.onTouchEnd(evt);
        // wait for inertia to complete
        vi.advanceTimersByTime(300);
        expect(scrollContainerMock.scrollTop).toBeGreaterThan(3000);
    });

    it('should stop inertia if another touch event is initiated while inertia is executing.', async () => {
        let evt = {
            touches: [{
                    pageX: 0,
                    pageY: 0
                }],
            preventDefault: () => { }
        };
        scrollInertiaDir.onTouchStart(evt);

        evt = {
            touches: [{
                    pageX: 0,
                    pageY: -100
                }],
            preventDefault: () => { }
        };
        await wait(16);
        scrollInertiaDir.onTouchMove(evt);

        scrollInertiaDir.onTouchEnd(evt);
        await wait(16);

        // don't wait for inertia to end. Instead start another touch interaction.
        evt = {
            touches: [{
                    pageX: 0,
                    pageY: 0
                }],
            preventDefault: () => { }
        };
        scrollInertiaDir.onTouchStart(evt);

        expect(scrollContainerMock.scrollTop).toBeLessThan(1000);
    });

    it('should honor the defined swipeToleranceX.', async () => {
        // if scroll is initiated on Y and on X within the defined tolerance no scrolling should occur on X.
        let evt = {
            touches: [{
                    pageX: 0,
                    pageY: 0
                }],
            preventDefault: () => { }
        };
        scrollInertiaDir.onTouchStart(evt);
        evt = {
            touches: [{
                    pageX: -10,
                    pageY: -50
                }],
            preventDefault: () => { }
        };
        await wait(16);
        scrollInertiaDir.onTouchMove(evt);

        scrollInertiaDir.onTouchEnd(evt);

        await wait(16);
        expect(scrollContainerMock.scrollLeft).toEqual(0);
        expect(scrollContainerMock.scrollTop).toBeGreaterThan(100);
    });

    it('should change scroll left for related scrollbar on touch start/move/end', () => {
        // the inertia velocity depends on the elapsed time, so control it with fake timers
        vi.useFakeTimers();
        let evt = {
            touches: [{
                    pageX: 0,
                    pageY: 0
                }],
            preventDefault: () => { }
        };
        scrollInertiaDir.onTouchStart(evt);

        evt = {
            touches: [{
                    pageX: -100,
                    pageY: 0
                }],
            preventDefault: () => { }
        };
        vi.advanceTimersByTime(10);
        scrollInertiaDir.onTouchMove(evt);

        scrollInertiaDir.onTouchEnd(evt);
        // wait for inertia to complete
        vi.advanceTimersByTime(300);
        expect(scrollContainerMock.scrollLeft).toBeGreaterThan(3000);

    });
    it('should not throw errors on touch start/move/end if no scrollbar is associated.', () => {
        scrollInertiaDir.IgxScrollInertiaScrollContainer = null;
        const evt = { preventDefault: () => { } };
        expect(() => scrollInertiaDir.onTouchStart(evt)).not.toThrow();
        expect(() => scrollInertiaDir.onTouchMove(evt)).not.toThrow();
        expect(() => scrollInertiaDir.onTouchEnd(evt)).not.toThrow();
    });
});

describe('Scroll Inertia Directive - Child scrolling', () => {
    let fix: ComponentFixture<ScrollInertiaComponent>;
    let directive: IgxTestScrollInertiaDirective;
    const elements: HTMLElement[] = [];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                IgxTestScrollInertiaDirective,
                ScrollInertiaComponent
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fix = TestBed.createComponent(ScrollInertiaComponent);
        fix.detectChanges();
        directive = fix.componentInstance.scrInertiaDir;
    });

    afterEach(() => {
        elements.forEach(element => element.remove());
        elements.length = 0;
        fix = null;
    });

    /**
     * Creates a real element in the document - `didChildScroll` reads both the layout box and the
     * computed overflow of every element on the event path, so a detached node would not do.
     */
    const createElement = (styles: string, innerStyles: string, tagName = 'div') => {
        const element = document.createElement(tagName);
        element.style.cssText = styles;
        const inner = document.createElement('div');
        inner.style.cssText = innerStyles;
        element.appendChild(inner);
        document.body.appendChild(element);
        elements.push(element);
        return element;
    };

    const wheelEventOver = (...path: HTMLElement[]) => ({ composedPath: () => path }) as any;

    it('should report a child that can still scroll vertically', () => {
        const scrollable = createElement(
            'width: 100px; height: 100px; overflow: auto;', 'width: 50px; height: 500px;');
        const evt = wheelEventOver(scrollable);

        // At the top there is room to scroll down, but none to scroll up.
        expect(directive.didChildScroll(evt, 0, 10), 'scrolling down from the top').toBeTruthy();
        expect(directive.didChildScroll(evt, 0, -10), 'scrolling up from the top').toBeFalsy();

        // At the bottom it is the other way round.
        scrollable.scrollTop = scrollable.scrollHeight - scrollable.clientHeight;
        expect(directive.didChildScroll(evt, 0, 10), 'scrolling down from the bottom').toBeFalsy();
        expect(directive.didChildScroll(evt, 0, -10), 'scrolling up from the bottom').toBeTruthy();

        // A wheel event with no vertical delta never consults the vertical axis.
        expect(directive.didChildScroll(evt, 0, 0), 'no vertical delta').toBeFalsy();
    });

    it('should report a child that can still scroll horizontally', () => {
        const scrollable = createElement(
            'width: 100px; height: 100px; overflow-x: auto; overflow-y: hidden;', 'width: 500px; height: 50px;');
        const evt = wheelEventOver(scrollable);

        expect(directive.didChildScroll(evt, 10, 0), 'scrolling right from the start').toBeTruthy();
        expect(directive.didChildScroll(evt, -10, 0), 'scrolling left from the start').toBeFalsy();

        scrollable.scrollLeft = scrollable.scrollWidth - scrollable.clientWidth;
        expect(directive.didChildScroll(evt, 10, 0), 'scrolling right from the end').toBeFalsy();
        expect(directive.didChildScroll(evt, -10, 0), 'scrolling left from the end').toBeTruthy();

        expect(directive.didChildScroll(evt, 0, 0), 'no horizontal delta').toBeFalsy();
    });

    it('should ignore children that cannot scroll', () => {
        // Overflowing content that is clipped rather than scrolled.
        const hidden = createElement(
            'width: 100px; height: 100px; overflow: hidden;', 'width: 500px; height: 500px;');
        expect(directive.didChildScroll(wheelEventOver(hidden), 10, 10), 'overflow is neither auto nor scroll')
            .toBeFalsy();

        // Content that fits, so there is no overflow to begin with.
        const fits = createElement(
            'width: 100px; height: 100px; overflow: auto;', 'width: 10px; height: 10px;');
        expect(directive.didChildScroll(wheelEventOver(fits), 10, 10), 'nothing overflows')
            .toBeFalsy();

        // An empty path has nothing to look at.
        expect(directive.didChildScroll(wheelEventOver(), 10, 10), 'empty path').toBeFalsy();
    });

    it('should stop looking once it reaches the display container', () => {
        const scrollable = createElement(
            'width: 100px; height: 100px; overflow: auto;', 'width: 500px; height: 500px;');
        const displayContainer = createElement('width: 100px; height: 100px;', '', 'igx-display-container');

        // Anything below the display container belongs to the virtualized grid itself and is skipped.
        expect(directive.didChildScroll(wheelEventOver(displayContainer, scrollable), 0, 10), 'the scrollable ancestor is above the display container')
            .toBeFalsy();
        expect(directive.didChildScroll(wheelEventOver(scrollable, displayContainer), 0, 10), 'the scrollable child is below it')
            .toBeTruthy();
    });
});

/** igxScroll inertia for testing */
@Directive({
    selector: '[igxTestScrollInertia]',
    standalone: true
})
export class IgxTestScrollInertiaDirective extends IgxScrollInertiaDirective {

    public override onWheel(evt) {
        super.onWheel(evt);
    }

    public override onTouchStart(evt) {
        return super.onTouchStart(evt);
    }
    public override onTouchEnd(evt) {
        super.onTouchEnd(evt);
    }
    public override onTouchMove(evt) {
        return super.onTouchMove(evt);
    }

    public override _inertiaInit(speedX, speedY) {
        super._inertiaInit(speedX, speedY);
    }

    public override didChildScroll(evt, scrollDeltaX, scrollDeltaY) {
        return super.didChildScroll(evt, scrollDeltaX, scrollDeltaY);
    }
}

/** igxScroll inertia component */
@Component({
    template: `
        <div #container style='width:calc(100% - 50px); height: 500px; float: left;'>
            <ng-template igxTestScrollInertia #scrInertiaContainer></ng-template>
        </div>
        <div #scrBar [style.height]='height' style='overflow: auto; width: 50px; float:right;' (scroll)="this.onScroll($event)">
            <div [style.height]='innerHeight' [style.width]='innerWidth'></div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxTestScrollInertiaDirective]
})
export class ScrollInertiaComponent implements OnInit {
    @ViewChild('container', { static: true })
    public container: ElementRef;
    @ViewChild('scrBar', { static: true })
    public scrollContainer: ElementRef;
    @ViewChild('scrInertiaContainer', { read: IgxTestScrollInertiaDirective, static: true })
    public scrInertiaDir: IgxTestScrollInertiaDirective;

    public height = '500px';
    public innerHeight = '5000px';
    public innerWidth = '5000px';
    public scrTopArray = [];
    public scrTopStepArray = [];
    public scrLeftArray = [];
    public scrLeftStepArray = [];

    public ngOnInit() {
        this.scrInertiaDir.IgxScrollInertiaScrollContainer = this.scrollContainer.nativeElement;
    }

    public onScroll(evt) {
        const ind = this.scrTopArray.length - 1;
        const prevScrTop = ind < 0 ? 0 : this.scrTopArray[ind];
        const prevScrLeft = ind < 0 ? 0 : this.scrLeftArray[ind];
        this.scrTopArray.push(evt.target.scrollTop);
        this.scrLeftArray.push(evt.target.scrollLeft);
        const calcScrollStep = evt.target.scrollTop - prevScrTop;
        const calcScrollLeftStep = evt.target.scrollLeft - prevScrLeft;
        this.scrTopStepArray.push(calcScrollStep);
        this.scrLeftStepArray.push(calcScrollLeftStep);
    }
}
