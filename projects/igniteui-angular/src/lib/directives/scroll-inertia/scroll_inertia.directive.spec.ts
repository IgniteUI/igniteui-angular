import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    Directive,
    Injectable,
    IterableChanges,
    IterableDiffers,
    NgZone,
    OnInit,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef,
    DebugElement,
    ElementRef
} from '@angular/core';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { IgxScrollInertiaModule, IgxScrollInertiaDirective } from './scroll_inertia.directive';
import { take } from 'rxjs/operators';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('Scroll Inertia Directive ', () => {
    configureTestSuite();
    let fix: ComponentFixture<ScrollInertiaComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTestScrollInertiaDirective,
                ScrollInertiaComponent
            ],
            imports: [IgxScrollInertiaModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fix = TestBed.createComponent(ScrollInertiaComponent);
        fix.detectChanges();
    });

    it('should initialize directive on non-scrollable container.', () => {
        expect(fix.componentInstance.scrInertiaDir).toBeDefined('scroll inertia initializing through markup failed');
    });

    // Unit test for wheel - wheelDelataY/wheelDeltaX supported on Chrome, Safari, Opera.
    it('should change scroll top for related scrollbar if onWheel is executed with wheelDeltaY.', () => {
        fix.componentInstance.scrInertiaDir.IgxScrollInertiaDirection = 'vertical';
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        const evt = {wheelDeltaY: -240, preventDefault: () => {}};
        scrInertiaDir.onWheel(evt);

        const scrContainer = fix.componentInstance.scrollContainer;
        expect(scrContainer.nativeElement.scrollTop).toEqual(2 * scrInertiaDir.wheelStep);
    });

    it('should change scroll left for related scrollbar if onWheel is executed with wheelDeltaX.', () => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        fix.componentInstance.scrInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        const evt = {wheelDeltaX: -240, preventDefault: () => {}};
        scrInertiaDir.onWheel(evt);

        const scrContainer = fix.componentInstance.scrollContainer;
        expect(scrContainer.nativeElement.scrollLeft).toEqual(2 * scrInertiaDir.wheelStep);
    });

    // Unit tests for wheel on other browsers that don't provide wheelDelta - use deltaX and deltaY.
    it('should change scroll top for related scrollbar if onWheel is executed with deltaY.', () => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        fix.componentInstance.scrInertiaDir.IgxScrollInertiaDirection = 'vertical';
        const evt = {deltaY: 1, preventDefault: () => {}};
        scrInertiaDir.onWheel(evt);

        const scrContainer = fix.componentInstance.scrollContainer;
        expect(scrContainer.nativeElement.scrollTop).toEqual(scrInertiaDir.wheelStep);
    });

    it('should change scroll left for related scrollbar if onWheel is executed with deltaX.', () => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        fix.componentInstance.scrInertiaDir.IgxScrollInertiaDirection = 'horizontal';
        const evt = {deltaX: 1, preventDefault: () => {}};
        scrInertiaDir.onWheel(evt);

        const scrContainer = fix.componentInstance.scrollContainer;
        expect(scrContainer.nativeElement.scrollLeft).toEqual(scrInertiaDir.wheelStep);
    });

    it('should not throw error if there is no associated scrollbar and wheel event is called.', () => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        scrInertiaDir.IgxScrollInertiaScrollContainer = null;
        const evt = {preventDefault: () => {}};
        expect (() => scrInertiaDir.onWheel(evt)).not.toThrow();
    });

    // Unit tests for touch events with inertia - Chrome, FireFox, Safari.
    it('should change scroll top for related scrollbar on touch start/move/end', async() => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        let evt = {
            touches: [{
                pageX: 0,
                pageY: 0
            }],
            preventDefault: () => {}
        };
        scrInertiaDir.onTouchStart(evt);

        evt = {
            touches: [{
                pageX: 0,
                pageY: -100
            }],
            preventDefault: () => {}
        };
        await wait(10);
        scrInertiaDir.onTouchMove(evt);

        scrInertiaDir.onTouchEnd(evt);
        // wait for inertia to complete
        await wait(1500);
        const scrContainer = fix.componentInstance.scrollContainer;
        expect(scrContainer.nativeElement.scrollTop).toBeGreaterThan(3000);

    });

    it('should stop inertia if another touch event is initiated while inertia is executing.', async() => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        let evt = {
            touches: [{
                pageX: 0,
                pageY: 0
            }],
            preventDefault: () => {}
        };
        scrInertiaDir.onTouchStart(evt);

        evt = {
            touches: [{
                pageX: 0,
                pageY: -100
            }],
            preventDefault: () => {}
        };
        await wait(10);
        scrInertiaDir.onTouchMove(evt);

        scrInertiaDir.onTouchEnd(evt);
        await wait(10);

        // don't wait for inertia to end. Instead start another touch interaction.
        evt = {
            touches: [{
                pageX: 0,
                pageY: 0
            }],
            preventDefault: () => {}
        };
        scrInertiaDir.onTouchStart(evt);

        const scrContainer = fix.componentInstance.scrollContainer;
        expect(scrContainer.nativeElement.scrollTop).toBeLessThan(1000);
    });

    it('should honor the defined swipeToleranceX.', async() => {
        // if scroll is initiated on Y and on X within the defined tolerance no scrolling should occur on X.
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        let evt = {
            touches: [{
                pageX: 0,
                pageY: 0
            }],
            preventDefault: () => {}
        };
        scrInertiaDir.onTouchStart(evt);
        evt = {
            touches: [{
                pageX: -10,
                pageY: -50
            }],
            preventDefault: () => {}
        };
        await wait(10);
        scrInertiaDir.onTouchMove(evt);

        scrInertiaDir.onTouchEnd(evt);

        await wait(1500);
        const scrContainer = fix.componentInstance.scrollContainer;
        expect(scrContainer.nativeElement.scrollLeft).toEqual(0);
        expect(scrContainer.nativeElement.scrollTop).toBeGreaterThan(100);
    });

    it('should change scroll left for related scrollbar on touch start/move/end', async() => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        let evt = {
            touches: [{
                pageX: 0,
                pageY: 0
            }],
            preventDefault: () => {}
        };
        scrInertiaDir.onTouchStart(evt);

        evt = {
            touches: [{
                pageX: -100,
                pageY: 0
            }],
            preventDefault: () => {}
        };
        await wait(10);
        scrInertiaDir.onTouchMove(evt);

        scrInertiaDir.onTouchEnd(evt);
        // wait for inertia to complete
        await wait(1500);
        const scrContainer = fix.componentInstance.scrollContainer;
        expect(scrContainer.nativeElement.scrollLeft).toBeGreaterThan(3000);

    });
    it('should not throw errors on touch start/move/end if no scrollbar is associated.', () => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        scrInertiaDir.IgxScrollInertiaScrollContainer = null;
        const evt = {preventDefault: () => {}};
        expect (() => scrInertiaDir.onTouchStart(evt)).not.toThrow();
        expect (() => scrInertiaDir.onTouchMove(evt)).not.toThrow();
        expect (() => scrInertiaDir.onTouchEnd(evt)).not.toThrow();
    });

    // Unit tests for touch events on IE/Edge
    it('should change scroll top related scrollbar via gesture events. ', () => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        let evt = {
            screenX: 0,
            screenY: 0
        };
        scrInertiaDir.onMSGestureStart(evt);


        evt = {
            screenX: 0,
            screenY: -100
        };

        scrInertiaDir.onMSGestureChange(evt);
        const scrContainer = fix.componentInstance.scrollContainer;
        expect(scrContainer.nativeElement.scrollTop).toEqual(100);
    });

    it('should change scroll left related scrollbar via gesture events. ', () => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        let evt = {
            screenX: 0,
            screenY: 0
        };
        scrInertiaDir.onMSGestureStart(evt);


        evt = {
            screenX: -100,
            screenY: 0
        };

        scrInertiaDir.onMSGestureChange(evt);
        const scrContainer = fix.componentInstance.scrollContainer;
        expect(scrContainer.nativeElement.scrollLeft).toEqual(80);
    });

    // Unit tests for inertia function.
    it('inertia should accelerate and then deccelerate vertically.', async() => {
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

    it('inertia should accelerate and then deccelerate horizontally.', async() => {
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

     // Unit tests for Pointer Down/Pointer Up - IE/Edge specific
    it('should prepare MSGesture on PointerDown to handle touch interactions on IE/Edge and should release them on PointerUp.', () => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        const targetElem = {
            setPointerCapture: (arg) => {},
            releasePointerCapture: (arg) => {}
        };
        const pointerId = 100;
        spyOn(targetElem, 'setPointerCapture');
        spyOn(targetElem, 'releasePointerCapture');
        const msGesture = window['MSGesture'];
        if (!msGesture) {
            // if MSGesture does not exist create a dummy obj to use instead.
            window['MSGesture'] = function() {
                return {
                    addPointer: (arg) => {}
                };
            };
        }


        const evt = {
            pointerType: 2,
            target: targetElem,
            pointerId: pointerId
        };
        scrInertiaDir.onPointerDown(evt);

        expect(targetElem.setPointerCapture).toHaveBeenCalledWith(pointerId);

        scrInertiaDir.onPointerUp(evt);
        expect(targetElem.releasePointerCapture).toHaveBeenCalledWith(pointerId);

        // restore original MSGesture state
        window['MSGesture'] = msGesture;
    });

    it('should not throw error when calling pointerDown/pointerUp if there is no associated scrollbar.', () => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        scrInertiaDir.IgxScrollInertiaScrollContainer = null;
        const evt = {
            pointerType: 2,
            target: {},
            pointerId: 0
        };
        expect (() => scrInertiaDir.onPointerDown(evt)).not.toThrow();
        expect (() => scrInertiaDir.onPointerUp(evt)).not.toThrow();
    });
});

    /** igxScroll inertia for testing */
@Directive({ selector: '[igxTestScrollInertia]' })
export class IgxTestScrollInertiaDirective extends IgxScrollInertiaDirective {

    constructor(element: ElementRef, _zone: NgZone) {
        super(element, _zone);
    }
    public onWheel(evt) {
        super.onWheel(evt);
    }

    public onTouchStart(evt) {
        return super.onTouchStart(evt);
    }
    public onTouchEnd(evt) {
        super.onTouchEnd(evt);
    }
    public onTouchMove(evt) {
       return super.onTouchMove(evt);
    }

    // IE/Edge specific events
    public onPointerDown(evt) {
        return super.onPointerDown(evt);
    }

    public onPointerUp(evt) {
        return super.onPointerUp(evt);
    }

    public onMSGestureStart(evt) {
        return super.onMSGestureStart(evt);
    }

    public onMSGestureChange(evt) {
        return super.onMSGestureChange(evt);
    }

    public _inertiaInit(speedX, speedY) {
        super._inertiaInit(speedX, speedY);
    }
}

/** igxScroll inertia component */
@Component({
    template: `
        <div #container style='width:calc(100% - 50px); height: 500px; float: left;'>
            <ng-template igxTestScrollInertia #scrInertiaContainer></ng-template>
        </div>
        <div #scrBar [style.height]='height' style='overflow: auto; width: 50px; float:right;'>
            <div [style.height]='innerHeight' [style.width]='innerWidth'></div>
        </div>
    `
})
export class ScrollInertiaComponent implements AfterViewInit {
    public height = '500px';
    public innerHeight = '5000px';
    public innerWidth = '5000px';
    public scrTopArray = [];
    public scrTopStepArray = [];
    public scrLeftArray = [];
    public scrLeftStepArray = [];

    @ViewChild('container') public container: ElementRef;
    @ViewChild('scrBar') public scrollContainer: ElementRef;

    @ViewChild('scrInertiaContainer', { read: IgxTestScrollInertiaDirective })
    public scrInertiaDir: IgxTestScrollInertiaDirective;

    ngAfterViewInit() {
        this.scrInertiaDir.IgxScrollInertiaScrollContainer = this.scrollContainer.nativeElement;

        this.scrollContainer.nativeElement.addEventListener('scroll', (evt) => { this.onScroll(evt); });
    }

    public onScroll(evt) {
        let calcScrollStep, calcScrollLeftStep;
        const ind = this.scrTopArray.length - 1;
        const prevScrTop = ind < 0 ? 0 : this.scrTopArray[ind];
        const prevScrLeft = ind < 0 ? 0 : this.scrLeftArray[ind];
        this.scrTopArray.push(evt.target.scrollTop);
        this.scrLeftArray.push(evt.target.scrollLeft);
        calcScrollStep = evt.target.scrollTop - prevScrTop;
        calcScrollLeftStep = evt.target.scrollLeft - prevScrLeft;
        this.scrTopStepArray.push(calcScrollStep);
        this.scrLeftStepArray.push(calcScrollLeftStep);
    }


}
