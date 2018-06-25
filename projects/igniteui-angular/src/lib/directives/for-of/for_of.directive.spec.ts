import { NgForOfContext } from '@angular/common';
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
    ViewContainerRef
} from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { IForOfState, IgxForOfDirective, IgxForOfModule} from './for_of.directive';

describe('IgxVirtual directive - simple template', () => {
    const INACTIVE_VIRT_CONTAINER = 'igx-display-container--inactive';
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestIgxForOfDirective,
                EmptyVirtualComponent,
                VerticalVirtualComponent,
                HorizontalVirtualComponent,
                VirtualComponent,
                VirtualVariableSizeComponent,
                VerticalVirtualNoDataComponent,
                RemoteVirtualizationComponent
            ],
            imports: [IgxForOfModule]
        }).compileComponents();
    }));

    it('should initialize empty directive', () => {
        const fix = TestBed.createComponent(EmptyVirtualComponent);
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        expect(displayContainer).not.toBeNull();
    });

    it('should initialize directive with horizontal virtualization', () => {
        const fix = TestBed.createComponent(HorizontalVirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).toBeNull();
        expect(horizontalScroller).not.toBeNull();

        fix.componentInstance.scrollLeft(150);
        fix.detectChanges();

        const firstRecChildren = displayContainer.children;
        for (let i = 0; i < firstRecChildren.length; i++) {
            expect(firstRecChildren[i].textContent)
                .toBe(fix.componentInstance.data[0][i + 1].toString());
        }

        const secondRecChildren = fix.nativeElement.querySelectorAll('igx-display-container')[1].children;
        for (let i = 0; i < secondRecChildren.length; i++) {
            expect(secondRecChildren[i].textContent)
                .toBe(fix.componentInstance.data[1][i + 1].toString());
        }
    });

    it('should initialize directive with vertical virtualization', () => {
        const fix = TestBed.createComponent(VerticalVirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).toBeNull();
        /* The height of the row is set to 50px so scrolling by 100px should render the third record */
        fix.componentInstance.scrollTop(100);

        fix.detectChanges();

        const firstRecChildren = displayContainer.children[0].children;
        let i = 0;
        const thirdRecord = fix.componentInstance.data[2];
        for (const item in thirdRecord) {
            if (thirdRecord.hasOwnProperty(item)) {
                expect(thirdRecord[item].toString())
                    .toBe(firstRecChildren[i++].textContent);
            }
        }
    });

    it('should initialize directive with vertical and horizontal virtualization', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();
        /* The height of the row is set to 50px so scrolling by 100px should render the third record */
        fix.componentInstance.scrollTop(100);

        const firstInnerDisplayContainer = displayContainer.children[0].querySelector('igx-display-container');
        expect(firstInnerDisplayContainer).not.toBeNull();

        fix.detectChanges();

        const firstRecChildren = firstInnerDisplayContainer.children;
        for (let i = 0; i < firstRecChildren.length; i++) {
            expect(firstInnerDisplayContainer.children[i].textContent)
                .toBe(fix.componentInstance.data[2][i].toString());
        }
    });

    it('should allow scrolling at certain amount down and then to the top renders correct rows and cols', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();
        fix.componentInstance.scrollTop(5000);
        fix.detectChanges();

        fix.componentInstance.scrollTop(0);
        fix.detectChanges();

        const firstInnerDisplayContainer = displayContainer.children[0].querySelector('igx-display-container');
        expect(firstInnerDisplayContainer).not.toBeNull();

        const firstRecChildren = firstInnerDisplayContainer.children;
        for (let i = 0; i < firstRecChildren.length; i++) {
            expect(firstInnerDisplayContainer.children[i].textContent)
                .toBe(fix.componentInstance.data[0][i].toString());
        }
    });

    it('should scroll to bottom and correct rows and columns should be rendered', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
        fix.componentInstance.scrollTop(2500000);

        const rows = displayContainer.children;
        const lastInnerDisplayContainer = rows[rows.length - 1].querySelector('igx-display-container');
        expect(lastInnerDisplayContainer).not.toBeNull();

        fix.detectChanges();

        const lastRecChildren = lastInnerDisplayContainer.children;
        const data = fix.componentInstance.data;
        for (let i = 0; i < lastRecChildren.length; i++) {
            expect(lastInnerDisplayContainer.children[i].textContent)
                .toBe(data[data.length - 1][i].toString());
        }
    });

    it('should scroll render one row less when scrolled to bottom', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');

        let rows = displayContainer.querySelectorAll('igx-display-container');
        expect(rows.length).toBe(9);

        fix.componentInstance.scrollTop(2500000);

        rows = displayContainer.querySelectorAll('igx-display-container');
        expect(rows.length).toBe(8);
    });

    it('should scroll to wheel event correctly', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');

        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();

        /* The height of the row is set to 50px so scrolling by 100px should render the third record */
        fix.componentInstance.parentVirtDir.testOnWheel(0, 100);
        fix.componentInstance.parentVirtDir.testOnScroll(verticalScroller);

        const firstInnerDisplayContainer = displayContainer.children[0].querySelector('igx-display-container');
        expect(firstInnerDisplayContainer).not.toBeNull();
        const firstRecChildren = firstInnerDisplayContainer.children;

        fix.detectChanges();

        for (let i = 0; i < firstRecChildren.length; i++) {
            expect(firstInnerDisplayContainer.children[i].textContent)
                .toBe(fix.componentInstance.data[2][i].toString());
        }
    });

    it('should scroll to the far right and last column should be visible', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');

        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();

        // scroll to the last right pos
        fix.componentInstance.scrollLeft(90000);
        fix.detectChanges();
        const rowChildren = displayContainer.querySelectorAll('igx-display-container');
        for (let i = 0; i < rowChildren.length; i++) {
            expect(rowChildren[i].children.length).toBe(7);
            expect(rowChildren[i].children[5].textContent)
                .toBe(fix.componentInstance.data[i][298].toString());
            expect(rowChildren[i].children[6].textContent)
                .toBe(fix.componentInstance.data[i][299].toString());
        }
    });

    it('should detect width change and update initially rendered columns', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');

        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();

        let rows = displayContainer.querySelectorAll('igx-display-container');
        expect(rows.length).toBe(9);
        for (let i = 0; i < rows.length; i++) {
            expect(rows[i].children.length).toBe(7);
            expect(rows[i].children[3].textContent)
                .toBe(fix.componentInstance.data[i][3].toString());
        }

        // scroll to the last right pos
        fix.componentInstance.width = '1200px';
        fix.detectChanges();

        rows = displayContainer.querySelectorAll('igx-display-container');
        expect(rows.length).toBe(9);
        for (let i = 0; i < rows.length; i++) {
            expect(rows[i].children.length).toBe(9);
            expect(rows[i].children[4].textContent)
                .toBe(fix.componentInstance.data[i][4].toString());
        }
    });

    it('should detect height change and update initially rendered rows', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');

        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();

        let rows = displayContainer.querySelectorAll('igx-display-container');
        expect(rows.length).toBe(9);
        for (let i = 0; i < rows.length; i++) {
            expect(rows[i].children.length).toBe(7);
            expect(rows[i].children[2].textContent)
                .toBe(fix.componentInstance.data[i][2].toString());
        }

        // scroll to the last right pos
        fix.componentInstance.height = '700px';
        fix.detectChanges();

        rows = displayContainer.querySelectorAll('igx-display-container');
        expect(rows.length).toBe(15);
        for (let i = 0; i < rows.length; i++) {
            expect(rows[i].children.length).toBe(7);
            expect(rows[i].children[2].textContent)
                .toBe(fix.componentInstance.data[i][2].toString());
        }
    });

    it('should not render vertical scrollbar when number of rows change to 5', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
        let rowsRendered = displayContainer.querySelectorAll('igx-display-container');

        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
        expect(rowsRendered.length).toBe(9);

        /** Step 1. Lower the amount of rows to 5. The vertical scrollbar then should not be rendered */
        expect(() => {
            fix.componentInstance.generateData(300, 5);
            fix.detectChanges();

            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
        }).not.toThrow();

        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(false);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
        expect(rowsRendered.length).toBe(5);

        /** Step 2. Scroll to the left. There should be no errors then and everything should be still the same */
        expect(() => {
            fix.componentInstance.scrollLeft(1000);
            fix.detectChanges();
        }).not.toThrow();

        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(false);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
        expect(rowsRendered.length).toBe(5);

        /** Step 3. Increase the ammout of rows back and vertical scrollbar should be rendered back */
        expect(() => {
            fix.componentInstance.generateData(300, 50000);
            fix.detectChanges();

            // We trigger scrollTop with the current scroll position because otherwise the scroll events are not fired during a test.
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
        }).not.toThrow();

        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        expect(horizontalScroller.scrollLeft).toBe(1000);
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
        expect(rowsRendered.length).toBe(9);
    });

    it('should not render vertical scrollbars when number of rows change to 0 after scrolling down', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
        let rowsRendered = displayContainer.querySelectorAll('igx-display-container');

        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
        expect(rowsRendered.length).toBe(9);

        fix.componentInstance.generateData(300, 50000);
        fix.detectChanges();

        /** Step 1. Scroll to the left. There should be no errors then and everything should be still the same */
        fix.componentInstance.scrollTop(100000);
        fix.detectChanges();

        /** Step 2. Lower the amount of rows to 5. The vertical scrollbar then should not be rendered */
        expect(() => {
            fix.componentInstance.data = [];
            fix.detectChanges();

            // We trigger scrollTop with the current scroll position because otherwise the scroll events are not fired during a test.
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
        }).not.toThrow();

        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(false);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
        expect(rowsRendered.length).toBe(0);

        /** Step 3. Set the ammout of rows back and vertical scrollbar should be rendered back then. It should reset the scroll position. */
        expect(() => {
            fix.componentInstance.generateData(300, 50000);
            fix.detectChanges();

            // We trigger scrollTop with the current scroll position because otherwise the scroll events are not fired during a test.
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
        }).not.toThrow();

        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        expect(verticalScroller.scrollTop).toBe(0);
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
        expect(rowsRendered.length).toBe(9);
    });

    it('should not render vertical scrollbar when number of rows change to 0 after scrolling right', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
        let rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        let colsRendered = rowsRendered[0].children;

        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
        expect(rowsRendered.length).toBe(9);
        expect(colsRendered.length).toBe(7);

         /** Step 1. Scroll to the right. */
        fix.componentInstance.scrollLeft(1000);
        fix.detectChanges();

        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        for (let i = 0; i < rowsRendered.length; i++) {
            // Check only the second col, no need for the others
            expect(rowsRendered[i].children[1].textContent)
                .toBe(fix.componentInstance.data[i][5].toString());
        }

        /** Step 2. Lower the amount of cols to 0 so there would be no horizontal scrollbar */
        expect(() => {
            fix.componentInstance.generateData(2, 0);
            fix.detectChanges();

            // We trigger scrollTop with the current scroll position because otherwise the scroll events are not fired during a test.
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
        }).not.toThrow();

        rowsRendered = displayContainer.querySelectorAll('igx-display-container');

        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(false);
        // expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(false); To be investigated
        expect(rowsRendered.length).toBe(0);

        /** Step 3. Set the data back to and it should render both scrollbars. It should reset the scroll position */
        expect(() => {
            fix.componentInstance.generateData(300, 50000);
            fix.detectChanges();

            // We trigger scrollTop with the current scroll position because otherwise the scroll events are not fired during a test.
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
        }).not.toThrow();
        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        colsRendered = rowsRendered[0].children;

        // expect(horizontalScroller.scrollLeft).toBe(0); To be investigated
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
        expect(rowsRendered.length).toBe(9);
        // expect(colsRendered.length).toBe(4); To be investigated

        for (let i = 0; i < rowsRendered.length; i++) {
            // Check only the second col, no need for the others
            expect(rowsRendered[i].children[1].textContent)
                .toBe(fix.componentInstance.data[i][5].toString());
        }
    });

    it('should not render horizontal scrollbars when number of cols change to 3', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
        let rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        let colsRendered = rowsRendered[0].children;

        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
        expect(rowsRendered.length).toBe(9);
        expect(colsRendered.length).toBe(7);

        /** Step 1. Lower the amount of cols to 3 so there would be no horizontal scrollbar */
        expect(() => {
            fix.componentInstance.generateData(3, 50000);
            fix.detectChanges();

            // We trigger scrollTop with the current scroll position because otherwise the scroll events are not fired during a test.
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
        }).not.toThrow();
        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        colsRendered = rowsRendered[0].children;

        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(false);
        expect(rowsRendered.length).toBe(9);
        expect(colsRendered.length).toBe(3);

        /** Step 2. Scroll down. There should be no errors then and everything should be still the same */
        expect(() => {
            fix.componentInstance.scrollTop(1000);
            fix.detectChanges();

            // We trigger scrollTop with the current scroll position because otherwise the scroll events are not fired during a test.
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
        }).not.toThrow();

        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        colsRendered = rowsRendered[0].children;

        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(false);
        expect(rowsRendered.length).toBe(9);
        expect(colsRendered.length).toBe(3);

        /** Step 3. Set the data back to have 300 columns and the horizontal scrollbar should render now. */
        expect(() => {
            fix.componentInstance.generateData(300, 50000);
            fix.detectChanges();

            // We trigger scrollTop with the current scroll position because otherwise the scroll events are not fired during a test.
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
        }).not.toThrow();
        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        colsRendered = rowsRendered[0].children;

        expect(verticalScroller.scrollTop).toBe(1000);
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
        expect(rowsRendered.length).toBe(9);
        expect(colsRendered.length).toBe(7);
    });

    it('should scroll down when using touch events', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');

        let rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        for (let i = 0; i < rowsRendered.length; i++) {
            // Check only the second col, no need for the others
            expect(rowsRendered[i].children[1].textContent)
                .toBe(fix.componentInstance.data[i][1].toString());
        }

        expect(() => {
            fix.componentInstance.parentVirtDir.testOnTouchStart();
            fix.componentInstance.parentVirtDir.testOnTouchMove(0, 500);
            // Trigger onScroll
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
        }).not.toThrow();

        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        for (let i = 0; i < rowsRendered.length; i++) {
            // Check only the second col, no need for the others
            expect(rowsRendered[i].children[1].textContent)
                .toBe(fix.componentInstance.data[10 + i][1].toString());
        }
    });

    it('should scroll left when using touch events', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');

        let rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        for (let i = 0; i < rowsRendered.length; i++) {
            // Check only the second col, no need for the others
            expect(rowsRendered[i].children[1].textContent)
                .toBe(fix.componentInstance.data[i][1].toString());
        }

        expect(() => {
            fix.componentInstance.childVirtDirs.first.testOnTouchStart();
            fix.componentInstance.childVirtDirs.first.testOnTouchMove(1000, 0);
            // Trigger onScroll
            fix.componentInstance.scrollLeft(horizontalScroller.scrollLeft);
            fix.detectChanges();
        }).not.toThrow();

        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        for (let i = 0; i < rowsRendered.length; i++) {
            // Check only the second col, no need for the others
            expect(rowsRendered[i].children[1].textContent)
                .toBe(fix.componentInstance.data[i][5].toString());
        }
    });

    it('should load next row and remove first row when using scrollNext method', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');

        let rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        for (let i = 0; i < rowsRendered.length; i++) {
            // Check only the second col, no need for the others
            expect(rowsRendered[i].children[1].textContent)
                .toBe(fix.componentInstance.data[i][1].toString());
        }

        expect(() => {
            fix.componentInstance.parentVirtDir.testScrollNext();
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
        }).not.toThrow();

        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        for (let i = 0; i < rowsRendered.length; i++) {
            // Check only the second col, no need for the others
            expect(rowsRendered[i].children[1].textContent)
                .toBe(fix.componentInstance.data[1 + i][1].toString());
        }
    });

    it('should load previous row and remove last row when using scrollPrev method', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');

        /** Step 1. Scroll down 500px first so we then have what to load previously */
        expect(() => {
            fix.componentInstance.scrollTop(500);
            fix.detectChanges();
        }).not.toThrow();

        let rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        for (let i = 0; i < rowsRendered.length; i++) {
            // Check only the second col, no need for the others
            expect(rowsRendered[i].children[1].textContent)
                .toBe(fix.componentInstance.data[10 + i][1].toString());
        }

        /** Step 2. Execute scrollPrev to load previous row */
        expect(() => {
            fix.componentInstance.parentVirtDir.testScrollPrev();
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
        }).not.toThrow();

        rowsRendered = displayContainer.querySelectorAll('igx-display-container');
        for (let i = 0; i < rowsRendered.length; i++) {
            // Check only the second col, no need for the others
            expect(rowsRendered[i].children[1].textContent)
                .toBe(fix.componentInstance.data[9 + i][1].toString());
        }
    });

    it('should update display container classes when content state changes from virtualized to non-virtualzied.', () => {
        const fix = TestBed.createComponent(VirtualVariableSizeComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        let displayContainer = fix.debugElement.queryAll(By.css('igx-display-container'));
        // No size and no data - display container should be inactive
        expect(displayContainer[0].classes[INACTIVE_VIRT_CONTAINER]).toBe(true);

        // set size
        fix.componentInstance.height = '500px';
        fix.detectChanges();

        displayContainer = fix.debugElement.queryAll(By.css('igx-display-container'));
        // Has size but no data - display container should be inactive
        expect(displayContainer[0].classes[INACTIVE_VIRT_CONTAINER]).toBe(true);

        // set data with 1 rec.
        fix.componentInstance.data = fix.componentInstance.generateData(1);
        fix.detectChanges();

        displayContainer = fix.debugElement.queryAll(By.css('igx-display-container'));
        // Has size but not enough data to be virtualized - display container should be inactive
        expect(displayContainer[0].classes[INACTIVE_VIRT_CONTAINER]).toBe(true);

        // set data with 1000 recs.
        fix.componentInstance.data = fix.componentInstance.generateData(1000);
        fix.detectChanges();

        displayContainer = fix.debugElement.queryAll(By.css('igx-display-container'));
        // Has size and enough data to be virtualized - display container should be active.
        expect(displayContainer[0].classes[INACTIVE_VIRT_CONTAINER]).toBe(false);
    });

    it('should allow having initually undefined value for igxForOf and then detect changes correctly once the value is updated. ', () => {
        const fix = TestBed.createComponent(VerticalVirtualNoDataComponent);
        expect(() => {
            fix.detectChanges();
        }).not.toThrow();
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');
        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(() => {
            fix.componentInstance.height = '400px';
            fix.detectChanges();
            fix.componentInstance.height = '500px';
            fix.detectChanges();
        }).not.toThrow();
        let rowsRendered = displayContainer.querySelectorAll('div');
        expect(rowsRendered.length).toBe(0);
        fix.componentInstance.data = fix.componentInstance.generateData();
        fix.detectChanges();
        rowsRendered = displayContainer.querySelectorAll('div');
        expect(rowsRendered.length).not.toBe(0);
    });

    it('should prevent scrollTo() when called with numbers outside the scope of the data records.', () => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();

        fix.componentInstance.parentVirtDir.testScrollTo(-1);
        expect(fix.componentInstance.parentVirtDir.state.startIndex).toBe(0);

        fix.componentInstance.parentVirtDir.testScrollTo(fix.componentInstance.data.length + 1);
        expect(fix.componentInstance.parentVirtDir.state.startIndex).toBe(0);
    });

    it('should allow remote virtualization', () => {
        const fix = TestBed.createComponent(RemoteVirtualizationComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();

        // verify data is loaded
        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector('igx-virtual-helper');

        let rowsRendered = displayContainer.children;
        let data = fix.componentInstance.data.source.getValue();
        for (let i = 0; i < rowsRendered.length; i++) {
            expect(rowsRendered[i].textContent.trim())
                .toBe(data[i].toString());
        }

        // scroll down
        expect(() => {
            verticalScroller.scrollTop = 10000;
            fix.detectChanges();
            fix.componentRef.hostView.detectChanges();
        }).not.toThrow();

        // verify data is loaded
        rowsRendered = displayContainer.children;
        data = fix.componentInstance.data.source.getValue();
        for (let i = fix.componentInstance.parentVirtDir.state.startIndex; i < rowsRendered.length; i++) {
            expect(rowsRendered[i].textContent.trim())
                .toBe(data[i].toString());
        }
    });

    it('should set correct left offset when scrolling to right, clearing data and then setting new data', async(() => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();

        /**  Scroll left 1500px */
        expect(() => {
            fix.componentInstance.scrollLeft(1500);
            fix.detectChanges();
        }).not.toThrow();

        /** Timeout for scroll event to trigger during test */
        setTimeout(() => {
            let firstRowDisplayContainer = fix.nativeElement.querySelectorAll('igx-display-container')[1];
            expect(firstRowDisplayContainer.style.left).toEqual('-82px');

            fix.componentInstance.generateData(300, 0);
            fix.detectChanges();

            fix.componentInstance.generateData(300, 50000);
            fix.detectChanges();

            /** Offset should be equal to the offset before so there is no misalignment */
            firstRowDisplayContainer = fix.nativeElement.querySelectorAll('igx-display-container')[1];
            expect(firstRowDisplayContainer.style.left).toEqual('-82px');
        }, 0);
    }));

    it('should correctly scroll to the last element when using the scrollTo method', async(() => {
        const fix = TestBed.createComponent(VirtualComponent);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();

        const displayContainer: HTMLElement = fix.nativeElement.querySelector('igx-display-container');

        /**  Scroll to the last 49999 row. */
        fix.componentInstance.parentVirtDir.scrollTo(49999);
        fix.detectChanges();

        /** Timeout for scroll event to trigger during test */
        setTimeout(() => {
            const rowsRendered = displayContainer.querySelectorAll('igx-display-container');
            for (let i = 0; i < 8; i++) {
                expect(rowsRendered[i].children[1].textContent)
                .toBe(fix.componentInstance.data[49992 + i][1].toString());
            }
        }, 0);
    }));
});

/** igxFor for testing */
@Directive({ selector: '[igxForTest]' })
export class TestIgxForOfDirective<T> extends IgxForOfDirective<T> {
    constructor(
        public viewContainer: ViewContainerRef,
        public template: TemplateRef<NgForOfContext<T>>,
        public differs: IterableDiffers,
        public fResolver: ComponentFactoryResolver,
        public changeDet: ChangeDetectorRef,
        public zone: NgZone) {
        super(viewContainer, template, differs, fResolver, changeDet, zone);
    }

    public testScrollPrev() {
        super.scrollPrev();
    }

    public testScrollNext() {
        super.scrollNext();
    }

    public testScrollTo(index) {
        super.scrollTo(index);
    }

    public testOnScroll(target) {
        const event = new Event('scroll');
        Object.defineProperty(event, 'target', {value: target, enumerable: true});
        super.onScroll(event);
    }

    public testOnHScroll(target) {
        const event = new Event('scroll');
        Object.defineProperty(event, 'target', {value: target, enumerable: true});
        super.onHScroll(event);
    }

    public testOnWheel(_deltaX: number, _deltaY: number) {
        const event = new WheelEvent('wheel', {deltaX: _deltaX, deltaY: _deltaY});
        super.onWheel(event);
    }

    public testOnTouchStart() {
        const touchEventObject = {
            changedTouches: [{screenX: 200, screenY: 200}]
        };

        super.onTouchStart(touchEventObject);
    }

    public testOnTouchMove(movedX: number, movedY: number) {
        const touchEventObject = {
            changedTouches: [{screenX: 200 - movedX, screenY: 200 - movedY}],
            preventDefault: () => {}
        };

        super.onTouchMove(touchEventObject);
    }

    public testApplyChanges(changes: IterableChanges<T>) {
        super._applyChanges(changes);
    }

    public testCalculateChunkSize(): number {
        return super._calculateChunkSize();
    }

    public testInitHCache(cols: any[]): number {
        return super.initHCache(cols);
    }

    public testGetHorizontalScroll(viewref, nodeName) {
        return super.getElement(viewref, nodeName);
    }

    public testGetHorizontalIndexAt(left, set, index) {
        super.getHorizontalIndexAt(left, set, index);
    }
}

/** Empty virtualized component */
@Component({
    template: `
        <span #container>
            <ng-template igxForTest [igxForOf]="data"></ng-template>
        </span>
    `
})
export class EmptyVirtualComponent {
    public data = [];

    @ViewChild('container') public container;
}

/** Only vertically virtualized component */
@Component({
    template: `
        <div #container [style.width]='width' [style.height]='height'>
            <ng-template #scrollContainer igxForTest let-rowData [igxForOf]="data"
                [igxForScrollOrientation]="'vertical'"
                [igxForContainerSize]='height'
                [igxForItemSize]='"50px"'>
                <div [style.display]="'flex'" [style.height]="'50px'">
                    <div [style.min-width]=cols[0].width>{{rowData['1']}}</div>
                    <div [style.min-width]=cols[1].width>{{rowData['2']}}</div>
                    <div [style.min-width]=cols[2].width>{{rowData['3']}}</div>
                    <div [style.min-width]=cols[3].width>{{rowData['4']}}</div>
                    <div [style.min-width]=cols[4].width>{{rowData['5']}}</div>
                </div>
            </ng-template>
        </div>
    `
})
export class VerticalVirtualComponent implements OnInit {

    public width = '450px';
    public height = '300px';
    public cols = [
        {field: '1', width: '150px'},
        {field: '2', width: '70px'},
        {field: '3', width: '50px'},
        {field: '4', width: '80px'},
        {field: '5', width: '100px'}
    ];
    public data = [];

    @ViewChild('container') public container;

    @ViewChild('scrollContainer', { read: TestIgxForOfDirective })
    public parentVirtDir: TestIgxForOfDirective<any>;

    public ngOnInit(): void {
        this.generateData();
    }

    public scrollTop(newScrollTop) {
        const verticalScrollbar = this.container.nativeElement.querySelector('igx-virtual-helper');
        verticalScrollbar.scrollTop = newScrollTop;

        this.parentVirtDir.testOnScroll(verticalScrollbar);
    }

    public generateData() {
        const dummyData = [];
        for (let i = 0; i < 50000; i++) {
            const obj = {};
            for (let j = 0; j <  this.cols.length; j++) {
                const col = this.cols[j].field;
                obj[col] = 10 * i * j;
            }
            dummyData.push(obj);
        }

        this.data = dummyData;
    }
}

/** Both vertically and horizontally virtualized component */
@Component({
    template: `
        <div [style.width]='width'>
            <div #container
                [style.width]='"calc(100% - 18px)"'
                [style.height]='"calc(100% - 18px)"'
                [style.overflow]='"hidden"'
                [style.float]='"left"'
                [style.position]='"relative"'>
                <div *ngFor="let rowData of data" [style.display]="'flex'" [style.height]="'50px'">
                    <ng-template #childContainer igxForTest let-col [igxForOf]="cols"
                        [igxForScrollOrientation]="'horizontal'"
                        [igxForScrollContainer]="scrollContainer"
                        [igxForContainerSize]='width'>
                            <div [style.min-width]='col.width + "px"'>{{rowData[col.field]}}</div>
                    </ng-template>
                </div>
            </div>
        </div>
    `
})
export class HorizontalVirtualComponent implements OnInit {

    public width = '800px';
    public height = '400px';
    public cols = [];
    public data = [];
    public scrollContainer = { _viewContainer: null };

    @ViewChild('container', {read: ViewContainerRef})
    public container: ViewContainerRef;

    @ViewChildren('childContainer', {read: TestIgxForOfDirective})
    public childVirtDirs: QueryList<TestIgxForOfDirective<any>>;

    public ngOnInit(): void {
        this.generateData();
        this.scrollContainer._viewContainer = this.container;
    }

    public scrollLeft(newScrollLeft) {
        const horizontalScrollbar =
            this.container.element.nativeElement.parentElement.querySelector('igx-horizontal-virtual-helper');
        horizontalScrollbar.scrollLeft = newScrollLeft;

        this.childVirtDirs.forEach((item) => {
            item.testOnHScroll(horizontalScrollbar);
        });
    }

    public generateData() {
        const dummyData = [];
        for (let j = 0; j < 300; j++) {
            this.cols.push({
                field: j.toString(),
                width: j % 8 < 2 ? 100 : (j % 6) * 125
            });
        }

        for (let i = 0; i < 5; i++) {
            const obj = {};
            for (let j = 0; j <  this.cols.length; j++) {
                const col = this.cols[j].field;
                obj[col] = 10 * i * j;
            }
            dummyData.push(obj);
        }

        this.data = dummyData;
    }
}

/** Both vertically and horizontally virtualized component */
@Component({
    template: `
        <div #container [style.width]='width' [style.height]='height' [style.position]="'relative'">
            <ng-template #scrollContainer igxForTest let-rowData [igxForOf]="data"
                [igxForScrollOrientation]="'vertical'"
                [igxForContainerSize]='height'
                [igxForItemSize]='"50px"'>
                <div [style.display]="'flex'" [style.height]="'50px'">
                    <ng-template #childContainer igxForTest let-col [igxForOf]="cols"
                        [igxForScrollOrientation]="'horizontal'"
                        [igxForScrollContainer]="parentVirtDir"
                        [igxForContainerSize]='width'>
                            <div [style.min-width]='col.width + "px"'>{{rowData[col.field]}}</div>
                    </ng-template>
                </div>
            </ng-template>
        </div>
    `
})
export class VirtualComponent implements OnInit {

    public width = '800px';
    public height = '400px';
    public cols = [];
    public data = [];

    @ViewChild('container', { read: ViewContainerRef })
    public container: ViewContainerRef;

    @ViewChild('scrollContainer', { read: TestIgxForOfDirective })
    public parentVirtDir: TestIgxForOfDirective<any>;

    @ViewChildren('childContainer', { read: TestIgxForOfDirective })
    public childVirtDirs: QueryList<TestIgxForOfDirective<any>>;

    public ngOnInit(): void {
        this.generateData(300, 50000);
    }

    public scrollTop(newScrollTop) {
        const verticalScrollbar = this.container.element.nativeElement.querySelector('igx-virtual-helper');
        verticalScrollbar.scrollTop = newScrollTop;

        this.parentVirtDir.testOnScroll(verticalScrollbar);
    }

    public scrollLeft(newScrollLeft) {
        const horizontalScrollbar = this.container.element.nativeElement.querySelector('igx-horizontal-virtual-helper');
        horizontalScrollbar.scrollLeft = newScrollLeft;

        this.childVirtDirs.forEach((item) => {
            item.testOnHScroll(horizontalScrollbar);
        });
    }

    public isVerticalScrollbarVisible() {
        const verticalScrollbar = this.container.element.nativeElement.querySelector('igx-virtual-helper');
        /**
         * Due to current implementation the height is set explicitly.
         * That's why we check if the content is bigger than the vertical scrollbar height
         */
        return verticalScrollbar.offsetHeight < verticalScrollbar.children[0].offsetHeight;
    }

    public isHorizontalScrollbarVisible() {
        const horizontalScrollbar = this.container.element.nativeElement.querySelector('igx-horizontal-virtual-helper');
        /**
         * Due to current implementation the height is automatically calculated.
         *  That's why when it's less than 16 there is no scrollbar
         */
        return horizontalScrollbar.offsetHeight >= 16;
    }

    public generateData(numCols: number, numRows: number) {
        const dummyData = [];
        this.cols = [];
        for (let j = 0; j < numCols; j++) {
            this.cols.push({
                field: j.toString(),
                width: j % 8 < 2 ? 100 : (j % 6 + 0.25) * 125
            });
        }

        for (let i = 0; i < numRows; i++) {
            const obj = {};
            for (let j = 0; j <  this.cols.length; j++) {
                const col = this.cols[j].field;
                obj[col] = 10 * i * j;
            }
            dummyData.push(obj);
        }

        this.data = dummyData;
    }
}

/** Only vertically virtualized component */
@Component({
    template: `
        <div #container [style.width]='width' [style.height]='height'>
            <ng-template #scrollContainer igxForTest let-rowData [igxForOf]="data"
            [igxForScrollOrientation]="'vertical'"
                [igxForContainerSize]='height'
                [igxForItemSize]='"50px"'>
                <div [style.display]="'flex'" [style.height]="'50px'">
                    {{rowData}}
                </div>
            </ng-template>
        </div>
    `
})
export class VirtualVariableSizeComponent {
    public height = '0px';
    public data = [];

    @ViewChild('container') public container;

    @ViewChild('scrollContainer', { read: TestIgxForOfDirective })
    public parentVirtDir: TestIgxForOfDirective<any>;

    public generateData(count) {
        const dummyData = [];
        for (let i = 0; i < count; i++) {
            dummyData.push(10 * i);
        }
        return dummyData;
    }
}

/** Vertically virtualized component with no initial data */
@Component({
    template: `
        <div #container [style.width]='width' [style.height]='height'>
            <ng-template #scrollContainer let-rowData [igxForOf]="data" igxForTest
                [igxForScrollOrientation]="'vertical'"
                [igxForContainerSize]='height'
                [igxForItemSize]='"50px"'>
                <div [style.display]="'flex'" [style.height]="'50px'">
                    {{rowData}}
                </div>
            </ng-template>
        </div>
    `
})
export class VerticalVirtualNoDataComponent {
    public width = '450px';
    public height = '300px';
    public data;

    public generateData() {
        const dummyData = [];
        for (let i = 0; i < 50000; i++) {
            dummyData.push(10 * i);
        }
        return dummyData;
    }
}

@Injectable()
export class LocalService {
    public records: Observable<any[]>;
    private _records: BehaviorSubject<any[]>;
    private dataStore: any[];

    constructor() {
        this.dataStore = [];
        this._records = new BehaviorSubject([]);
        this.records = this._records.asObservable();
    }

    public getData(data?: IForOfState, cb?: (any) => void): any {
        const size = data.chunkSize === 0 ? 10 : data.chunkSize;
        this.dataStore = this.generateData(data.startIndex, data.startIndex + size);
        this._records.next(this.dataStore);
        const count = 1000;
        if (cb) {
            cb(count);
        }
    }

    public generateData(start, end) {
        const dummyData = [];
        for (let i = start; i < end; i++) {
            dummyData.push(10 * i);
        }
        return dummyData;
    }
}

/** Vertically virtualized component with remote virtualization */
@Component({
    template: `
        <div #container [style.width]='width' [style.height]='height'>
            <ng-template #scrollContainer let-rowData [igxForOf]="data | async" igxForTest
                [igxForScrollOrientation]="'vertical'"
                [igxForContainerSize]='height'
                [igxForItemSize]='"50px"'
                [igxForRemote]='true'
                (onChunkPreload)="dataLoading($event)">
                <div [style.display]="'flex'" [style.height]="'50px'">
                    {{rowData}}
                </div>
            </ng-template>
        </div>
    `,
    providers: [LocalService]
})
export class RemoteVirtualizationComponent implements OnInit, AfterViewInit {
    public height = '500px';
    public data;

    @ViewChild('scrollContainer', { read: TestIgxForOfDirective })
    public parentVirtDir: TestIgxForOfDirective<any>;

    @ViewChild('container', { read: ViewContainerRef })
    public container: ViewContainerRef;

    constructor(private localService: LocalService) { }
    public ngOnInit(): void {
        this.data = this.localService.records;
    }

    public ngAfterViewInit() {
        this.localService.getData(this.parentVirtDir.state, (count) => {
            this.parentVirtDir.totalItemCount = count;
        });
    }

    dataLoading(evt) {
        this.localService.getData(evt, () => {
            this.parentVirtDir.cdr.detectChanges();
        });
    }
}
