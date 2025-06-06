import {
    Component,
    Directive,
    NgZone,
    OnInit,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IgxScrollInertiaDirective } from './scroll_inertia.directive';

import { wait } from '../../test-utils/ui-interactions.spec';

describe('Scroll Inertia Directive - Rendering', () => {
    let fix: ComponentFixture<ScrollInertiaComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                IgxTestScrollInertiaDirective,
                ScrollInertiaComponent
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fix = TestBed.createComponent(ScrollInertiaComponent);
        fix.detectChanges();
    });

    afterEach(() => {
        fix = null;
    });

    it('should initialize directive on non-scrollable container.', async () => {
        expect(fix.componentInstance.scrInertiaDir).toBeDefined('scroll inertia initializing through markup failed');
        await fix.whenStable();
    });

    // Unit tests for inertia function.
    it('inertia should accelerate and then deccelerate vertically.', async () => {
        pending('This should be tested in the e2e test');
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;

        // vertical inertia
        scrInertiaDir._inertiaInit(0, 1);

        await wait(1500);
        const scrTopStepArray = fix.componentInstance.scrTopStepArray;
        expect(scrTopStepArray.length).toEqual(57);

        const first = scrTopStepArray[0];
        const mid = scrTopStepArray[9];
        const end = scrTopStepArray[56];

        expect(first).toBeLessThan(mid);
        expect(end).toBeLessThan(mid);
    });

    it('inertia should accelerate and then deccelerate horizontally.', async () => {
        pending('This should be tested in the e2e test');
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;

        // horizontal inertia
        scrInertiaDir._inertiaInit(1, 0);

        await wait(1500);
        const scrLeftStepArray = fix.componentInstance.scrLeftStepArray;
        expect(scrLeftStepArray.length).toEqual(57);

        const first = scrLeftStepArray[0];
        const mid = scrLeftStepArray[9];
        const end = scrLeftStepArray[56];

        expect(first).toBeLessThan(mid);
        expect(end).toBeLessThan(mid);
    });
});

describe('Scroll Inertia Directive - Scrolling', () => {
    let scrollInertiaDir: IgxTestScrollInertiaDirective;
    let scrollContainerMock;

    beforeEach(() => {
        const mockZone = jasmine.createSpyObj('NgZone', ['runOutsideAngular']);
        scrollContainerMock = {
            scrollLeft: 0,
            scrollTop: 0,
            offsetHeight: 500,
            children: [{ style: { width: '50px', height: '500px', scrollHeight: 100 } }]
        };
        scrollInertiaDir = new IgxTestScrollInertiaDirective(null, mockZone);
        scrollInertiaDir.IgxScrollInertiaScrollContainer = scrollContainerMock;
        scrollInertiaDir.smoothingDuration = 0;
    });

    afterEach(() => {
        scrollInertiaDir.ngOnDestroy();
    });

    // Unit test for wheel - wheelDelataY/wheelDeltaX supported on Chrome, Safari, Opera.
    it('should change scroll top for related scrollbar if onWheel is executed with wheelDeltaY.', () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'vertical';
        const evt = {wheelDeltaY: -240, preventDefault: () => {}};
        scrollInertiaDir.onWheel(evt);
        expect(scrollContainerMock.scrollTop).toEqual(2 * scrollInertiaDir.wheelStep);
    });

    it('should change scroll left for related scrollbar if onWheel is executed with wheelDeltaX.', () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        const evt = {wheelDeltaX: -240, preventDefault: () => {}};
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollLeft).toEqual(2 * scrollInertiaDir.wheelStep);
    });

    // Unit tests for wheel on other browsers that don't provide wheelDelta - use deltaX and deltaY.
    it('should change scroll top for related scrollbar if onWheel is executed with deltaY.', () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'vertical';
        const evt = {deltaY: 1, preventDefault: () => {}};
        scrollInertiaDir.onWheel(evt);
        expect(scrollContainerMock.scrollTop).toEqual(scrollInertiaDir.wheelStep);
    });

    it('should change scroll left for related scrollbar if onWheel is executed with deltaX.', () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        const evt = {deltaX: 1, preventDefault: () => {}};
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollLeft).toEqual(scrollInertiaDir.wheelStep);
    });

    it('should not throw error if there is no associated scrollbar and wheel event is called.', () => {
        scrollInertiaDir.IgxScrollInertiaScrollContainer = null;
        const evt = {preventDefault: () => {}};
        expect (() => scrollInertiaDir.onWheel(evt)).not.toThrow();
    });


    it('should change scroll left when shift + wheel is triggered' , () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        const evt =  {shiftKey: true, wheelDeltaY: -240, preventDefault: () => {}};
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollTop).toEqual(0);
        expect(scrollContainerMock.scrollLeft).toEqual(2 * scrollInertiaDir.wheelStep);
    });

    it('should be able to scroll to left/right when shift + wheel is triggered' , () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        let evt =  {shiftKey: true, wheelDeltaY: -240, preventDefault: () => {}};
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollTop).toEqual(0);
        expect(scrollContainerMock.scrollLeft).toEqual(2 * scrollInertiaDir.wheelStep);

        evt =  {shiftKey: true, wheelDeltaY: 120, preventDefault: () => {}};
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollTop).toEqual(0);
        expect(scrollContainerMock.scrollLeft).toEqual(scrollInertiaDir.wheelStep);
    });

    it('should change scroll left when shift + wheel is called with with deltaY' , () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        const evt =  {shiftKey: true, deltaY: 1, preventDefault: () => {}};
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollTop).toEqual(0);
        expect(scrollContainerMock.scrollLeft).toEqual(scrollInertiaDir.wheelStep);
    });

    it('should be able to scroll to left/right when shift + wheel is called with with deltaY' , () => {
        scrollInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        let evt =  {shiftKey: true, deltaY: 1, preventDefault: () => {}};
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollTop).toEqual(0);
        expect(scrollContainerMock.scrollLeft).toEqual(scrollInertiaDir.wheelStep);

        evt =  {shiftKey: true, deltaY: -1, preventDefault: () => {}};
        scrollInertiaDir.onWheel(evt);

        expect(scrollContainerMock.scrollTop).toEqual(0);
        expect(scrollContainerMock.scrollLeft).toEqual(0);
    });

    // Unit tests for touch events with inertia - Chrome, FireFox, Safari.
    it('should change scroll top for related scrollbar on touch start/move/end', fakeAsync(() => {
        let evt = {
            touches: [{
                pageX: 0,
                pageY: 0
            }],
            preventDefault: () => {}
        };
        scrollInertiaDir.onTouchStart(evt);

        evt = {
            touches: [{
                pageX: 0,
                pageY: -100
            }],
            preventDefault: () => {}
        };
        tick(10);
        scrollInertiaDir.onTouchMove(evt);

        scrollInertiaDir.onTouchEnd(evt);
        // wait for inertia to complete
        tick(300);
        expect(scrollContainerMock.scrollTop).toBeGreaterThan(3000);
    }));

    it('should stop inertia if another touch event is initiated while inertia is executing.', fakeAsync(() => {
        let evt = {
            touches: [{
                pageX: 0,
                pageY: 0
            }],
            preventDefault: () => {}
        };
        scrollInertiaDir.onTouchStart(evt);

        evt = {
            touches: [{
                pageX: 0,
                pageY: -100
            }],
            preventDefault: () => {}
        };
        tick(10);
        scrollInertiaDir.onTouchMove(evt);

        scrollInertiaDir.onTouchEnd(evt);
        tick(10);

        // don't wait for inertia to end. Instead start another touch interaction.
        evt = {
            touches: [{
                pageX: 0,
                pageY: 0
            }],
            preventDefault: () => {}
        };
        scrollInertiaDir.onTouchStart(evt);

        expect(scrollContainerMock.scrollTop).toBeLessThan(1000);
    }));

    it('should honor the defined swipeToleranceX.', fakeAsync(() => {
        // if scroll is initiated on Y and on X within the defined tolerance no scrolling should occur on X.
        let evt = {
            touches: [{
                pageX: 0,
                pageY: 0
            }],
            preventDefault: () => {}
        };
        scrollInertiaDir.onTouchStart(evt);
        evt = {
            touches: [{
                pageX: -10,
                pageY: -50
            }],
            preventDefault: () => {}
        };
        tick(10);
        scrollInertiaDir.onTouchMove(evt);

        scrollInertiaDir.onTouchEnd(evt);

        tick(300);
        expect(scrollContainerMock.scrollLeft).toEqual(0);
        expect(scrollContainerMock.scrollTop).toBeGreaterThan(100);
    }));

    it('should change scroll left for related scrollbar on touch start/move/end', fakeAsync(() => {
        let evt = {
            touches: [{
                pageX: 0,
                pageY: 0
            }],
            preventDefault: () => {}
        };
        scrollInertiaDir.onTouchStart(evt);

        evt = {
            touches: [{
                pageX: -100,
                pageY: 0
            }],
            preventDefault: () => {}
        };
        tick(10);
        scrollInertiaDir.onTouchMove(evt);

        scrollInertiaDir.onTouchEnd(evt);
        // wait for inertia to complete
        tick(300);
        expect(scrollContainerMock.scrollLeft).toBeGreaterThan(3000);

    }));
    it('should not throw errors on touch start/move/end if no scrollbar is associated.', () => {
        scrollInertiaDir.IgxScrollInertiaScrollContainer = null;
        const evt = {preventDefault: () => {}};
        expect (() => scrollInertiaDir.onTouchStart(evt)).not.toThrow();
        expect (() => scrollInertiaDir.onTouchMove(evt)).not.toThrow();
        expect (() => scrollInertiaDir.onTouchEnd(evt)).not.toThrow();
    });
});

/** igxScroll inertia for testing */
@Directive({
    selector: '[igxTestScrollInertia]',
    standalone: true
})
export class IgxTestScrollInertiaDirective extends IgxScrollInertiaDirective {

    constructor(element: ElementRef, _zone: NgZone) {
        super(element, _zone);
    }
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
    imports: [IgxTestScrollInertiaDirective]
})
export class ScrollInertiaComponent implements OnInit {
    @ViewChild('container', { static: true }) public container: ElementRef;
    @ViewChild('scrBar', { static: true }) public scrollContainer: ElementRef;
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
