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

fdescribe('Scroll Inertia Directive - Unit Tests', () => {
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
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        const evt = {wheelDeltaY: -240, preventDefault: () => {}};
        scrInertiaDir.onWheel(evt);

        const scrContainer = fix.componentInstance.scrollContainer;
        expect(scrContainer.nativeElement.scrollTop).toEqual(2 * scrInertiaDir.wheelStep);
    });

    it('should change scroll left for related scrollbar if onWheel is executed with wheelDeltaX.', () => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        const evt = {wheelDeltaX: -240, preventDefault: () => {}};
        scrInertiaDir.onWheel(evt);

        const scrContainer = fix.componentInstance.scrollContainer;
        expect(scrContainer.nativeElement.scrollLeft).toEqual(2 * scrInertiaDir.wheelStep);
    });

    // Unit tests for wheel on other browsers that don't provide wheelDelta - use deltaX and deltaY.
    it('should change scroll top for related scrollbar if onWheel is executed with deltaY.', () => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
        const evt = {deltaY: 1, preventDefault: () => {}};
        scrInertiaDir.onWheel(evt);

        const scrContainer = fix.componentInstance.scrollContainer;
        expect(scrContainer.nativeElement.scrollTop).toEqual(scrInertiaDir.wheelStep);
    });

    it('should change scroll left for related scrollbar if onWheel is executed with deltaX.', () => {
        const scrInertiaDir = fix.componentInstance.scrInertiaDir;
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
}

/** igxScroll inertia component */
@Component({
    template: `
        <div #container style='width:calc(100% - 50px); height: 500px; float: left;'>
            <ng-template igxTestScrollInertia #scrInertiaContainer></ng-template>
        </div>
        <div #scrBar [style.height]='height' style='overflow: auto; width: 50px; float:right;'>
            <div [style.height]='innerHeight' [style.width]='innerHeight'></div>
        </div>
    `
})
export class ScrollInertiaComponent implements AfterViewInit {
    public height = '500px';
    public innerHeight = '5000px';

    @ViewChild('container') public container: ElementRef;
    @ViewChild('scrBar') public scrollContainer: ElementRef;

    @ViewChild('scrInertiaContainer', { read: IgxTestScrollInertiaDirective })
    public scrInertiaDir: IgxTestScrollInertiaDirective;

    ngAfterViewInit() {
        this.scrInertiaDir.IgxScrollInertiaScrollContainer = this.scrollContainer.nativeElement;
    }
}
