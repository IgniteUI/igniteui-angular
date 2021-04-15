import { NgForOfContext } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    Directive,
    Injectable,
    IterableDiffers,
    NgZone,
    OnInit,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef,
    DebugElement
} from '@angular/core';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { IForOfState, IgxForOfDirective, IgxForOfModule } from './for_of.directive';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxForOfScrollSyncService } from './for_of.sync.service';
import { TestNgZone } from '../../test-utils/helper-utils.spec';
import { PlatformUtil } from '../../core/utils';

describe('IgxForOf directive -', () => {
    const INACTIVE_VIRT_CONTAINER = 'igx-display-container--inactive';
    const DISPLAY_CONTAINER = 'igx-display-container';
    const VERTICAL_SCROLLER = 'igx-virtual-helper';
    let displayContainer: HTMLElement;
    let verticalScroller: HTMLElement;
    let horizontalScroller: HTMLElement;

    let dg: DataGenerator;

    beforeAll(() => {
        dg = new DataGenerator();
    });

    describe('empty virtual component', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    TestIgxForOfDirective,
                    EmptyVirtualComponent
                ],
                imports: [IgxForOfModule]
            }).compileComponents();
        }));

        it('should initialize empty directive', () => {
            const fix = TestBed.createComponent(EmptyVirtualComponent);
            fix.detectChanges();
            displayContainer = fix.nativeElement.querySelector(DISPLAY_CONTAINER);
            expect(displayContainer).not.toBeNull();
        });
    });

    describe('horizontal virtual component', () => {
        let fix: ComponentFixture<HorizontalVirtualComponent>;

        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    TestIgxForOfDirective,
                    HorizontalVirtualComponent
                ],
                imports: [IgxForOfModule],
                providers: [{ provide: NgZone, useFactory: () => new TestNgZone() }]
            }).compileComponents();
        }));

        beforeEach(() => {
            fix = TestBed.createComponent(HorizontalVirtualComponent);
            dg.generateData(300, 5, fix.componentInstance);
            fix.componentRef.hostView.detectChanges();
            fix.detectChanges();
            displayContainer = fix.nativeElement.querySelector(DISPLAY_CONTAINER);
            verticalScroller = fix.nativeElement.querySelector(VERTICAL_SCROLLER);
            horizontalScroller = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
        });

        it('should initialize directive with horizontal virtualization', () => {
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

            const secondRecChildren = fix.nativeElement.querySelectorAll(DISPLAY_CONTAINER)[1].children;
            for (let i = 0; i < secondRecChildren.length; i++) {
                expect(secondRecChildren[i].textContent)
                    .toBe(fix.componentInstance.data[1][i + 1].toString());
            }
        });

        it('should always fill available space for last chunk size calculation - horizontal virtualization', () => {
            fix.componentInstance.width = '1900px';
            fix.componentInstance.cols = [
                { field: '1', width: 100 },
                { field: '2', width: 1800 },
                { field: '3', width: 200 },
                { field: '4', width: 200 },
                { field: '5', width: 300 },
                { field: '6', width: 100 },
                { field: '7', width: 100 },
                { field: '8', width: 100 },
                { field: '9', width: 150 },
                { field: '10', width: 150 }
            ];
            fix.componentRef.hostView.detectChanges();
            fix.detectChanges();
            const firstRecChildren = displayContainer.children;

            let chunkSize = firstRecChildren.length;
            expect(chunkSize).toEqual(9);

            fix.componentInstance.width = '1900px';
            fix.componentInstance.cols = [
                { field: '1', width: 1800 },
                { field: '2', width: 100 },
                { field: '3', width: 200 },
                { field: '4', width: 200 },
                { field: '5', width: 300 },
                { field: '6', width: 100 },
                { field: '7', width: 100 },
                { field: '8', width: 100 },
                { field: '9', width: 150 },
                { field: '10', width: 150 }
            ];
            fix.componentRef.hostView.detectChanges();
            fix.detectChanges();

            chunkSize = firstRecChildren.length;
            expect(chunkSize).toEqual(10);
        });

        it('should update horizontal scroll offsets if igxForOf changes. ', () => {
            fix.componentInstance.width = '500px';
            fix.componentInstance.cols = [
                { field: '1', width: 100 },
                { field: '2', width: 200 },
                { field: '3', width: 200 },
                { field: '4', width: 200 },
                { field: '5', width: 300 }
            ];
            fix.componentRef.hostView.detectChanges();
            fix.detectChanges();

            fix.componentInstance.scrollLeft(50);
            fix.detectChanges();

            expect(parseInt(displayContainer.style.left, 10)).toEqual(-50);

            fix.componentInstance.cols = [{ field: '1', width: 100 }];
            fix.detectChanges();

            expect(parseInt(displayContainer.style.left, 10)).toEqual(0);
        });
    });

    describe('vertical virtual component', () => {
        let fix: ComponentFixture<VerticalVirtualComponent>;
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    TestIgxForOfDirective,
                    VerticalVirtualNoDataComponent,
                    VerticalVirtualComponent
                ],
                imports: [IgxForOfModule],
                providers: [{ provide: NgZone, useFactory: () => new TestNgZone() }]
            }).compileComponents();
        }));

        beforeEach(() => {
            fix = TestBed.createComponent(VerticalVirtualComponent);
            fix.componentInstance.data = dg.generateVerticalData(fix.componentInstance.cols);
            fix.componentRef.hostView.detectChanges();
            fix.detectChanges();
            displayContainer = fix.nativeElement.querySelector(DISPLAY_CONTAINER);
            verticalScroller = fix.nativeElement.querySelector(VERTICAL_SCROLLER);
            horizontalScroller = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
        });


        it('should initialize directive with vertical virtualization', async () => {
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

        it('should update vertical scroll offsets if igxForOf changes. ', () => {
            fix.componentInstance.scrollTop(5);
            fix.detectChanges();

            expect(parseInt(displayContainer.style.top, 10)).toEqual(-5);

            spyOn(fix.componentInstance.parentVirtDir.chunkLoad, 'emit');

            fix.componentInstance.data = [{ 1: 1, 2: 2, 3: 3, 4: 4 }];
            fix.detectChanges();

            expect(parseInt(displayContainer.style.top, 10)).toEqual(0);
            expect(fix.componentInstance.parentVirtDir.chunkLoad.emit).toHaveBeenCalledTimes(1);
        });

        it('should apply the changes when itemSize is changed.', () => {
            const firstRecChildren = displayContainer.children[0].children;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < firstRecChildren.length; i++) {
                expect(firstRecChildren[i].clientHeight)
                    .toBe(parseInt(fix.componentInstance.parentVirtDir.igxForItemSize, 10));
            }

            fix.componentInstance.itemSize = '100px';
            fix.detectChanges();
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < firstRecChildren.length; i++) {
                expect(firstRecChildren[i].clientHeight)
                    .toBe(parseInt(fix.componentInstance.parentVirtDir.igxForItemSize, 10));
            }
        });

        it('should not throw error when itemSize is changed while data is null/undefined.', () => {
            let errorMessage = '';
            fix.componentInstance.data = null;
            fix.detectChanges();
            try {
                fix.componentInstance.itemSize = '100px';
                fix.detectChanges();
            } catch (ex) {
                errorMessage = ex.message;
            }
            expect(errorMessage).toBe('');
        });

        it('should allow initially undefined value for igxForOf and then detect changes correctly once the value is updated', () => {
            fix = TestBed.createComponent(VerticalVirtualNoDataComponent);
            expect(() => {
                fix.detectChanges();
            }).not.toThrow();
            displayContainer = fix.nativeElement.querySelector(DISPLAY_CONTAINER);
            verticalScroller = fix.nativeElement.querySelector(VERTICAL_SCROLLER);
            expect(displayContainer).not.toBeNull();
            expect(verticalScroller).not.toBeNull();

            fix.componentInstance.height = '400px';
            fix.detectChanges();
            fix.componentInstance.height = '500px';
            fix.detectChanges();

            let rowsRendered = displayContainer.querySelectorAll('div');
            expect(rowsRendered.length).toBe(0);
            fix.componentInstance.data = dg.generateVerticalData(fix.componentInstance.cols);
            fix.detectChanges();
            rowsRendered = displayContainer.querySelectorAll('div');
            expect(rowsRendered.length).not.toBe(0);
        });

        it('should always fill available space for last chunk size calculation - vertical virtualization', async () => {
            fix.componentInstance.height = '1900px';
            const virtualContainer = fix.componentInstance.parentVirtDir;
            virtualContainer.igxForSizePropName = 'height';
            fix.componentInstance.data = [
                { 1: '1', height: '100px' },
                { 1: '2', height: '1800px' },
                { 1: '3', height: '200px' },
                { 1: '4', height: '200px' },
                { 1: '5', height: '300px' },
                { 1: '6', height: '100px' },
                { 1: '7', height: '100px' },
                { 1: '8', height: '100px' },
                { 1: '9', height: '150px' },
                { 1: '10', height: '150px' }
            ];
            fix.detectChanges();
            await wait();
            let chunkSize = (virtualContainer as any)._calcMaxChunkSize();
            expect(chunkSize).toEqual(9);

            fix.componentInstance.height = '1900px';
            fix.componentInstance.data = [
                { 1: '1', height: '1800px' },
                { 1: '2', height: '100px' },
                { 1: '3', height: '200px' },
                { 1: '4', height: '200px' },
                { 1: '5', height: '300px' },
                { 1: '6', height: '100px' },
                { 1: '7', height: '100px' },
                { 1: '8', height: '100px' },
                { 1: '9', height: '150px' },
                { 1: '10', height: '150px' }
            ];
            fix.detectChanges();
            await wait();
            chunkSize = (virtualContainer as any)._calcMaxChunkSize();
            expect(chunkSize).toEqual(10);
        });
    });

    describe('vertical and horizontal virtual component', () => {
        let fix: ComponentFixture<VirtualComponent>;

        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    TestIgxForOfDirective,
                    VirtualComponent
                ],
                imports: [IgxForOfModule],
                providers: [{ provide: NgZone, useFactory: () => new TestNgZone() }]
            }).compileComponents();
        }));

        beforeEach(() => {
            fix = TestBed.createComponent(VirtualComponent);
            dg.generateData300x50000(fix.componentInstance);
            fix.detectChanges();
            displayContainer = fix.nativeElement.querySelector(DISPLAY_CONTAINER);
            verticalScroller = fix.nativeElement.querySelector(VERTICAL_SCROLLER);
            horizontalScroller = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
            expect(displayContainer).not.toBeNull();
            expect(verticalScroller).not.toBeNull();
            expect(horizontalScroller).not.toBeNull();
        });

        it('should initialize directive with vertical and horizontal virtualization', () => {
            /* The height of the row is set to 50px so scrolling by 100px should render the third record */
            fix.componentInstance.scrollTop(100);

            const firstInnerDisplayContainer = displayContainer.children[0].querySelector(DISPLAY_CONTAINER);
            expect(firstInnerDisplayContainer).not.toBeNull();

            fix.detectChanges();

            const firstRecChildren = firstInnerDisplayContainer.children;
            for (let i = 0; i < firstRecChildren.length; i++) {
                expect(firstInnerDisplayContainer.children[i].textContent)
                    .toBe(fix.componentInstance.data[2][i].toString());
            }
        });

        it('should allow scrolling at certain amount down and then to the top renders correct rows and cols', () => {
            fix.componentInstance.scrollTop(5000);
            fix.detectChanges();

            fix.componentInstance.scrollTop(0);
            fix.detectChanges();

            const firstInnerDisplayContainer = displayContainer.children[0].querySelector(DISPLAY_CONTAINER);
            expect(firstInnerDisplayContainer).not.toBeNull();

            const firstRecChildren = firstInnerDisplayContainer.children;
            for (let i = 0; i < firstRecChildren.length; i++) {
                expect(firstInnerDisplayContainer.children[i].textContent)
                    .toBe(fix.componentInstance.data[0][i].toString());
            }
        });

        it('should scroll to bottom and correct rows and columns should be rendered', () => {
            fix.componentInstance.scrollTop(2500000);

            const rows = displayContainer.children;
            const lastInnerDisplayContainer = rows[rows.length - 1].querySelector(DISPLAY_CONTAINER);
            expect(lastInnerDisplayContainer).not.toBeNull();

            fix.detectChanges();

            const lastRecChildren = lastInnerDisplayContainer.children;
            const data = fix.componentInstance.data;
            for (let i = 0; i < lastRecChildren.length; i++) {
                expect(lastInnerDisplayContainer.children[i].textContent)
                    .toBe(data[data.length - 1][i].toString());
            }
        });

        it('should scroll to wheel event correctly', async () => {
            fix.componentInstance.parentVirtDir.dc.instance._scrollInertia.smoothingDuration = 0;
            /* 120 is default mousewheel on Chrome, scroll 2 records down */
            await UIInteractions.simulateWheelEvent(displayContainer, 0, - 1 * 2 * 120);
            fix.detectChanges();
            await wait();

            const firstInnerDisplayContainer = displayContainer.children[0].querySelector(DISPLAY_CONTAINER);
            expect(firstInnerDisplayContainer).not.toBeNull();

            const firstRecChildren = firstInnerDisplayContainer.children;
            for (let i = 0; i < firstRecChildren.length; i++) {
                expect(firstInnerDisplayContainer.children[i].textContent)
                    .toBe(fix.componentInstance.data[2][i].toString());
            }
        });

        it('should scroll to the far right and last column should be visible', () => {
            // scroll to the last right pos
            fix.componentInstance.scrollLeft(90000);
            fix.detectChanges();

            const rowChildren = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            for (let i = 0; i < rowChildren.length; i++) {
                expect(rowChildren[i].children.length).toBe(7);
                expect(rowChildren[i].children[5].textContent)
                    .toBe(fix.componentInstance.data[i][298].toString());
                expect(rowChildren[i].children[6].textContent)
                    .toBe(fix.componentInstance.data[i][299].toString());
            }
        });

        it('should detect width change and update initially rendered columns', () => {
            let rows = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            expect(rows.length).toBe(9);
            for (let i = 0; i < rows.length; i++) {
                expect(rows[i].children.length).toBe(7);
                expect(rows[i].children[3].textContent)
                    .toBe(fix.componentInstance.data[i][3].toString());
            }

            // scroll to the last right pos
            fix.componentInstance.width = '1200px';
            fix.detectChanges();

            rows = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            expect(rows.length).toBe(9);
            for (let i = 0; i < rows.length; i++) {
                expect(rows[i].children.length).toBe(9);
                expect(rows[i].children[4].textContent)
                    .toBe(fix.componentInstance.data[i][4].toString());
            }
        });

        it('should detect height change and update initially rendered rows', () => {
            let rows = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            expect(rows.length).toBe(9);
            for (let i = 0; i < rows.length; i++) {
                expect(rows[i].children.length).toBe(7);
                expect(rows[i].children[2].textContent)
                    .toBe(fix.componentInstance.data[i][2].toString());
            }

            // scroll to the last right pos
            fix.componentInstance.height = '700px';
            fix.detectChanges();

            rows = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            expect(rows.length).toBe(15);
            for (let i = 0; i < rows.length; i++) {
                expect(rows[i].children.length).toBe(7);
                expect(rows[i].children[2].textContent)
                    .toBe(fix.componentInstance.data[i][2].toString());
            }
        });

        it('should not render vertical scrollbar when number of rows change to 5', () => {
            let rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);

            expect(displayContainer).not.toBeNull();
            expect(verticalScroller).not.toBeNull();
            expect(horizontalScroller).not.toBeNull();
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
            expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
            expect(rowsRendered.length).toBe(9);

            /** Step 1. Lower the amount of rows to 5. The vertical scrollbar then should not be rendered */
            dg.generateData(300, 5, fix.componentInstance);
            fix.detectChanges();

            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();

            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(false);
            expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
            expect(rowsRendered.length).toBe(5);

            /** Step 2. Scroll to the left. There should be no errors then and everything should be still the same */
            fix.componentInstance.scrollLeft(1000);
            fix.detectChanges();

            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(false);
            expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
            expect(rowsRendered.length).toBe(5);

            /** Step 3. Increase the amount of rows back and vertical scrollbar should be rendered back */
            dg.generateData300x50000(fix.componentInstance);
            fix.detectChanges();

            // We trigger scrollTop with the current scroll position because otherwise the scroll events are not fired during a test.
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();

            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            expect(horizontalScroller.scrollLeft).toBe(1000);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
            expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
            expect(rowsRendered.length).toBe(9);
        });

        it('should not render vertical scrollbars when number of rows change to 0 after scrolling down', () => {
            let rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);

            expect(displayContainer).not.toBeNull();
            expect(verticalScroller).not.toBeNull();
            expect(horizontalScroller).not.toBeNull();
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
            expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
            expect(rowsRendered.length).toBe(9);

            dg.generateData300x50000(fix.componentInstance);
            fix.detectChanges();

            /** Step 1. Scroll to the bottom. */
            fix.componentInstance.scrollTop(100000);
            fix.detectChanges();

            /** Step 2. Lower the amount of rows to 5. The vertical scrollbar then should not be rendered */
            fix.componentInstance.data = [];
            fix.detectChanges();

            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(false);
            expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
            expect(rowsRendered.length).toBe(0);

            /**
             * Step 3. Set the amount of rows back and vertical scrollbar should be rendered back then.
             *  It should reset the scroll position.
             */
            dg.generateData300x50000(fix.componentInstance);
            fix.detectChanges();

            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            expect(verticalScroller.scrollTop).toBe(0);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
            expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
            expect(rowsRendered.length).toBe(9);
        });

        it('should not render vertical scrollbar when number of rows change to 0 after scrolling right', async () => {
            let rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            let colsRendered = rowsRendered[0].children;

            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
            expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
            expect(rowsRendered.length).toBe(9);
            expect(colsRendered.length).toBe(7);

            /** Step 1. Scroll to the right. */
            fix.componentInstance.scrollLeft(1000);
            fix.detectChanges();
            await wait();

            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            for (let i = 0; i < rowsRendered.length; i++) {
                // Check only the second col, no need for the others
                expect(rowsRendered[i].children[1].textContent)
                    .toBe(fix.componentInstance.data[i][5].toString());
            }

            /** Step 2. Lower the amount of cols to 0 so there would be no horizontal scrollbar */
            fix.componentInstance.data = [];
            fix.detectChanges();

            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);

            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(false);
            expect(rowsRendered.length).toBe(0);

            /** Step 3. Set the data back to and it should render both scrollbars. It should reset the scroll position */
            dg.generateData300x50000(fix.componentInstance);
            fix.detectChanges();
            await wait();

            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            colsRendered = rowsRendered[0].children;

            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
            expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
            expect(rowsRendered.length).toBe(9);

            for (let i = 0; i < rowsRendered.length; i++) {
                // Check only the second col, no need for the others
                expect(rowsRendered[i].children[1].textContent)
                    .toBe(fix.componentInstance.data[i][5].toString());
            }
        });

        it('should not render horizontal scrollbars when number of cols change to 3', () => {
            let rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            let colsRendered = rowsRendered[0].children;

            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
            expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
            expect(rowsRendered.length).toBe(9);
            expect(colsRendered.length).toBe(7);

            /** Step 1. Lower the amount of cols to 3 so there would be no horizontal scrollbar */
            dg.generateData(3, 50000, fix.componentInstance);
            fix.detectChanges();

            // We trigger scrollTop with the current scroll position because otherwise the scroll events are not fired during a test.
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            colsRendered = rowsRendered[0].children;

            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
            expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(false);
            expect(rowsRendered.length).toBe(9);
            expect(colsRendered.length).toBe(3);

            /** Step 2. Scroll down. There should be no errors then and everything should be still the same */
            fix.componentInstance.scrollTop(1000);
            fix.detectChanges();

            // We trigger scrollTop with the current scroll position because otherwise the scroll events are not fired during a test.
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();

            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            colsRendered = rowsRendered[0].children;

            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
            expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(false);
            expect(rowsRendered.length).toBe(9);
            expect(colsRendered.length).toBe(3);

            /** Step 3. Set the data back to have 300 columns and the horizontal scrollbar should render now. */
            dg.generateData300x50000(fix.componentInstance);
            fix.detectChanges();

            // We trigger scrollTop with the current scroll position because otherwise the scroll events are not fired during a test.
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();
            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            colsRendered = rowsRendered[0].children;

            expect(verticalScroller.scrollTop).toBe(1000);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
            expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
            expect(rowsRendered.length).toBe(9);
            expect(colsRendered.length).toBe(7);
        });

        it('should scroll down when using touch events', async () => {
            let rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            for (let i = 0; i < rowsRendered.length; i++) {
                // Check only the second col, no need for the others
                expect(rowsRendered[i].children[1].textContent)
                    .toBe(fix.componentInstance.data[i][1].toString());
            }

            const dcElem = fix.componentInstance.parentVirtDir.dc.instance._viewContainer.element.nativeElement;
            UIInteractions.simulateTouchStartEvent(dcElem, 200, 200);
            UIInteractions.simulateTouchMoveEvent(dcElem, 200, -300);
            fix.detectChanges();
            await wait();

            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            for (let i = 0; i < rowsRendered.length; i++) {
                // Check only the second col, no need for the others
                expect(rowsRendered[i].children[1].textContent)
                    .toBe(fix.componentInstance.data[10 + i][1].toString());
            }
        });

        xit('should apply inertia when swiping via touch interaction.', async () => {
            const dcElem = fix.componentInstance.parentVirtDir.dc.instance._viewContainer.element.nativeElement;
            // spyOn(fix.componentInstance.parentVirtDir, 'onScroll');
            await UIInteractions.simulateTouchStartEvent(
                dcElem,
                0,
                -150
            );
            await wait(1);
            await UIInteractions.simulateTouchMoveEvent(dcElem, 0, -180);
            await UIInteractions.simulateTouchEndEvent(dcElem, 0, -200);
            fix.detectChanges();

            // wait for inertia to complete
            await wait(1500);
            fix.detectChanges();
            const scrStepArray = fix.componentInstance.parentVirtDir.scrStepArray;
            expect(scrStepArray.length).toBeGreaterThan(55);

            // check if inertia first accelerates then decelerate
            const first = scrStepArray[0];
            const mid = scrStepArray[10];
            const end = scrStepArray[60];

            expect(first).toBeLessThan(mid);
            expect(end).toBeLessThan(mid);
        });

        it('should scroll left when using touch events', () => {
            let rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            for (let i = 0; i < rowsRendered.length; i++) {
                // Check only the second col, no need for the others
                expect(rowsRendered[i].children[1].textContent)
                    .toBe(fix.componentInstance.data[i][1].toString());
            }

            const dcElem = fix.componentInstance.childVirtDirs.first.dc.instance._viewContainer.element.nativeElement;
            UIInteractions.simulateTouchStartEvent(dcElem, 200, 200);
            UIInteractions.simulateTouchMoveEvent(dcElem, -800, 0);

            // Trigger onScroll
            fix.componentInstance.scrollLeft(horizontalScroller.scrollLeft);
            fix.detectChanges();

            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            for (let i = 0; i < rowsRendered.length; i++) {
                // Check only the second col, no need for the others
                expect(rowsRendered[i].children[1].textContent)
                    .toBe(fix.componentInstance.data[i][5].toString());
            }
        });

        it('should load next row and remove first row when using scrollNext method', () => {
            let rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            for (let i = 0; i < rowsRendered.length; i++) {
                // Check only the second col, no need for the others
                expect(rowsRendered[i].children[1].textContent)
                    .toBe(fix.componentInstance.data[i][1].toString());
            }

            fix.componentInstance.parentVirtDir.scrollNext();
            fix.componentInstance.scrollTop(verticalScroller.scrollTop); // Trigger onScroll manually.
            fix.detectChanges();

            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            for (let i = 0; i < rowsRendered.length; i++) {
                // Check only the second col, no need for the others
                expect(rowsRendered[i].children[1].textContent)
                    .toBe(fix.componentInstance.data[1 + i][1].toString());
            }
        });

        it('should load previous row and remove last row when using scrollPrev method', () => {
            /** Step 1. Scroll down 500px first so we then have what to load previously */
            fix.componentInstance.scrollTop(500);
            fix.detectChanges();

            let rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            for (let i = 0; i < rowsRendered.length; i++) {
                // Check only the second col, no need for the others
                expect(rowsRendered[i].children[1].textContent)
                    .toBe(fix.componentInstance.data[10 + i][1].toString());
            }

            /** Step 2. Execute scrollPrev to load previous row */
            fix.componentInstance.parentVirtDir.scrollPrev();
            fix.componentInstance.scrollTop(verticalScroller.scrollTop); // Trigger onScroll manually.
            fix.detectChanges();

            rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            for (let i = 0; i < rowsRendered.length; i++) {
                // Check only the second col, no need for the others
                expect(rowsRendered[i].children[1].textContent)
                    .toBe(fix.componentInstance.data[9 + i][1].toString());
            }
        });

        it('should not wrap around with scrollNext and scrollPrev', async () => {
            const forOf = fix.componentInstance.parentVirtDir;

            forOf.scrollPrev();
            fix.detectChanges();
            await wait(200);

            expect(forOf.state.startIndex).toEqual(0);

            forOf.scrollTo(forOf.igxForOf.length - 1);
            fix.detectChanges();
            await wait(200);

            expect(forOf.state.startIndex).toEqual(forOf.igxForOf.length - forOf.state.chunkSize);

            forOf.scrollNext();
            fix.detectChanges();
            await wait(200);

            expect(forOf.state.startIndex).toEqual(forOf.igxForOf.length - forOf.state.chunkSize);
        });

        it('should prevent scrollTo() when called with numbers outside the scope of the data records.', () => {
            fix.componentInstance.parentVirtDir.scrollTo(-1);
            expect(fix.componentInstance.parentVirtDir.state.startIndex).toBe(0);

            fix.componentInstance.parentVirtDir.scrollTo(fix.componentInstance.data.length + 1);
            expect(fix.componentInstance.parentVirtDir.state.startIndex).toBe(0);
        });

        it('should set correct left offset when scrolling to right, clearing data and then setting new data', async () => {
            /**  Scroll left 1500px */
            fix.componentInstance.scrollLeft(1500);
            fix.detectChanges();
            await wait();

            /** Timeout for scroll event to trigger during test */
            let firstRowDisplayContainer = fix.nativeElement.querySelectorAll(DISPLAY_CONTAINER)[1];
            expect(firstRowDisplayContainer.style.left).toEqual('-82px');

            dg.generateData(300, 0, fix.componentInstance);
            fix.detectChanges();

            dg.generateData300x50000(fix.componentInstance);
            fix.detectChanges();
            await wait();

            /** Offset should be equal to the offset before so there is no misalignment */
            firstRowDisplayContainer = fix.nativeElement.querySelectorAll(DISPLAY_CONTAINER)[1];
            expect(firstRowDisplayContainer.style.left).toEqual('-82px');
        });

        it('should correctly scroll to the last element when using the scrollTo method', () => {
            spyOn(fix.componentInstance.parentVirtDir.chunkLoad, 'emit');

            /**  Scroll to the last 49999 row. */
            fix.componentInstance.parentVirtDir.scrollTo(49999);
            fix.componentInstance.scrollTop(verticalScroller.scrollTop);
            fix.detectChanges();

            expect(fix.componentInstance.parentVirtDir.chunkLoad.emit).toHaveBeenCalledTimes(1);

            const rowsRendered = displayContainer.querySelectorAll(DISPLAY_CONTAINER);
            for (let i = 0; i < 8; i++) {
                expect(rowsRendered[i].children[1].textContent)
                    .toBe(fix.componentInstance.data[49991 + i][1].toString());
            }
        });

        it('should return correct value for getItemCountInView API. ', async () => {
            /**  Scroll left 1500px and top 105px */

            fix.componentInstance.scrollLeft(1500);
            fix.componentInstance.scrollTop(105);
            fix.detectChanges();
            fix.componentInstance.parentVirtDir.cdr.detectChanges();
            await wait();

            expect(fix.componentInstance.parentVirtDir.getItemCountInView()).toBe(7);
            const hDirective = fix.componentInstance.childVirtDirs.toArray()[0];
            expect(hDirective.getItemCountInView()).toBe(2);
        });

        it('should emit the chunkPreload/chunkLoad only when startIndex or chunkSize have changed.', async () => {
            const verticalDir = fix.componentInstance.parentVirtDir;
            const chunkLoadSpy = spyOn<any>(verticalDir.chunkLoad, 'emit').and.callThrough();
            const chunkPreLoadSpy = spyOn<any>(verticalDir.chunkPreload, 'emit').and.callThrough();
            // scroll so that start index does not change.
            fix.componentInstance.scrollTop(1);
            fix.detectChanges();
            await wait();
            expect(chunkLoadSpy).toHaveBeenCalledTimes(0);
            expect(chunkPreLoadSpy).toHaveBeenCalledTimes(0);

            // scroll so that start index changes.
            fix.componentInstance.scrollTop(100);
            fix.detectChanges();
            await wait();

            expect(chunkLoadSpy).toHaveBeenCalledTimes(1);
            expect(chunkPreLoadSpy).toHaveBeenCalledTimes(1);

            // change size so that chunk size does not change
            fix.componentInstance.height = '399px';
            fix.detectChanges();
            await wait();

            expect(chunkLoadSpy).toHaveBeenCalledTimes(1);

            // change size so that chunk size changes
            fix.componentInstance.height = '1500px';
            fix.detectChanges();
            await wait();

            expect(chunkLoadSpy).toHaveBeenCalledTimes(2);
        });
    });

    describe('variable size component', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    TestIgxForOfDirective,
                    VirtualVariableSizeComponent
                ],
                imports: [IgxForOfModule]
            }).compileComponents();
        }));

        it('should update display container classes when content state changes from virtualized to non-virtualized.', () => {
            const fix = TestBed.createComponent(VirtualVariableSizeComponent);
            fix.detectChanges();

            let displayContainerDebugEl: DebugElement = fix.debugElement.query(By.css(DISPLAY_CONTAINER));
            // No size and no data - display container should be inactive
            expect(displayContainerDebugEl.classes[INACTIVE_VIRT_CONTAINER]).toBeTruthy();

            // set size
            fix.componentInstance.height = '500px';
            fix.detectChanges();

            displayContainerDebugEl = fix.debugElement.query(By.css(DISPLAY_CONTAINER));
            // Has size but no data - display container should be inactive
            expect(displayContainerDebugEl.classes[INACTIVE_VIRT_CONTAINER]).toBeTruthy();

            // set data with 1 rec.
            fix.componentInstance.data = fix.componentInstance.generateData(1);
            fix.detectChanges();

            displayContainerDebugEl = fix.debugElement.query(By.css(DISPLAY_CONTAINER));
            // Has size but not enough data to be virtualized - display container should be inactive
            expect(displayContainerDebugEl.classes[INACTIVE_VIRT_CONTAINER]).toBeTruthy();

            // set data with 1000 recs.
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            displayContainerDebugEl = fix.debugElement.query(By.css(DISPLAY_CONTAINER));
            // Has size and enough data to be virtualized - display container should be active.
            expect(displayContainerDebugEl.classes[INACTIVE_VIRT_CONTAINER]).toBeFalsy();
        });
    });

    describe('remote virtual component', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    TestIgxForOfDirective,
                    RemoteVirtualizationComponent
                ],
                imports: [IgxForOfModule]
            }).compileComponents();
        }));

        it('should allow remote virtualization', async () => {
            const fix = TestBed.createComponent(RemoteVirtualizationComponent);
            fix.componentRef.hostView.detectChanges();
            fix.detectChanges();

            displayContainer = fix.nativeElement.querySelector(DISPLAY_CONTAINER);
            verticalScroller = fix.nativeElement.querySelector(VERTICAL_SCROLLER);
            // verify data is loaded
            let rowsRendered = displayContainer.children;
            let data = fix.componentInstance.data.source.getValue();
            for (let i = 0; i < rowsRendered.length; i++) {
                expect(rowsRendered[i].textContent.trim())
                    .toBe(data[i].toString());
            }

            // scroll down
            verticalScroller.scrollTop = 10000;
            fix.detectChanges();
            await wait();

            // verify data is loaded
            rowsRendered = displayContainer.children;
            data = fix.componentInstance.data.source.getValue();
            for (let i = fix.componentInstance.parentVirtDir.state.startIndex; i < rowsRendered.length; i++) {
                expect(rowsRendered[i].textContent.trim())
                    .toBe(data[i].toString());
            }
        });
    });

    describe('remote virtual component with specified igxForTotalItemCount', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    TestIgxForOfDirective,
                    RemoteVirtCountComponent
                ],
                imports: [IgxForOfModule]
            }).compileComponents();
        }));

        it('should apply remote virtualization correctly', async () => {
            const fix = TestBed.createComponent(RemoteVirtCountComponent);
            fix.componentRef.hostView.detectChanges();
            fix.detectChanges();

            displayContainer = fix.nativeElement.querySelector(DISPLAY_CONTAINER);
            verticalScroller = fix.nativeElement.querySelector(VERTICAL_SCROLLER);
            // verify data is loaded
            let rowsRendered = displayContainer.children;
            let data = fix.componentInstance.data.source.getValue();
            for (let i = 0; i < rowsRendered.length; i++) {
                expect(rowsRendered[i].textContent.trim())
                    .toBe(data[i].toString());
            }

            // scroll down
            verticalScroller.scrollTop = 10000;
            fix.detectChanges();
            await wait();

            // verify data is loaded
            rowsRendered = displayContainer.children;
            data = fix.componentInstance.data.source.getValue();
            for (let i = fix.componentInstance.parentVirtDir.state.startIndex; i < rowsRendered.length; i++) {
                expect(rowsRendered[i].textContent.trim())
                    .toBe(data[i].toString());
            }
        });
    });

    describe('no width and height component', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    TestIgxForOfDirective,
                    NoWidthAndHeightComponent
                ],
                imports: [IgxForOfModule]
            }).compileComponents();
        }));

        it('should use itemSize when no width or height are provided', () => {
            const fix = TestBed.createComponent(NoWidthAndHeightComponent);
            fix.componentRef.hostView.detectChanges();
            fix.detectChanges();

            const children = fix.componentInstance.childVirtDirs;
            const instance = fix.componentInstance;
            const expectedElementsLength = (parseInt(instance.width, 10) / instance.itemSize) + 1;
            expect(children.length).toEqual(expectedElementsLength);
        });
    });

    describe('even odd first last functions', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    TestIgxForOfDirective,
                    LocalVariablesComponent
                ],
                imports: [IgxForOfModule]
            }).compileComponents();
        }));

        it('should differentiate even odd items', () => {
            const fix = TestBed.createComponent(LocalVariablesComponent);
            fix.detectChanges();
            const allItems: DebugElement[] = fix.debugElement.queryAll(By.css(DISPLAY_CONTAINER))[0].children;
            expect(allItems.length).toEqual(100);
            for (let i = 0; i < allItems.length; i++) {
                if (i === 0) {
                    expect(allItems[i].classes['first']).toBe(true);
                }
                if (i === allItems.length - 1) {
                    expect(allItems[i].classes['last']).toBe(true);
                }
                if (i % 2 === 0) {
                    expect(allItems[i].classes['even']).toBe(true);
                } else {
                    expect(allItems[i].classes['odd']).toBe(true);
                }
            }
        });
    });

    describe('on destroy', () => {
        let fix: ComponentFixture<VerticalVirtualDestroyComponent>;

        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    TestIgxForOfDirective,
                    VerticalVirtualDestroyComponent
                ],
                imports: [IgxForOfModule],
                providers: [{ provide: NgZone, useFactory: () => new TestNgZone() }]
            }).compileComponents();
        }));

        beforeEach(() => {
            fix = TestBed.createComponent(VerticalVirtualDestroyComponent);
            fix.componentInstance.data = dg.generateVerticalData(fix.componentInstance.cols);
            fix.componentRef.hostView.detectChanges();
            fix.detectChanges();
        });
        it('should reset scroll position if component is destroyed and recreated.', async () => {
            let scrollComponent = fix.debugElement.query(By.css(VERTICAL_SCROLLER)).componentInstance;
            expect(scrollComponent.scrollAmount).toBe(0);
            expect(scrollComponent.destroyed).toBeFalsy();

            scrollComponent.nativeElement.scrollTop = 500;
            fix.detectChanges();
            await wait();
            expect(scrollComponent.scrollAmount).toBe(500);

            fix.componentInstance.exists = false;
            fix.detectChanges();
            await wait();

            expect(scrollComponent.destroyed).toBeTruthy();

            fix.componentInstance.exists = true;
            fix.detectChanges();
            await wait();

            scrollComponent = fix.debugElement.query(By.css(VERTICAL_SCROLLER)).componentInstance;
            expect(scrollComponent.scrollAmount).toBe(0);
            expect(scrollComponent.destroyed).toBeFalsy();

            displayContainer = fix.nativeElement.querySelector(DISPLAY_CONTAINER);
            const firstInnerDisplayContainer = displayContainer.children[0];
            expect(firstInnerDisplayContainer.children[0].textContent).toBe('0');
        });
    });

    describe('on create new instance', () => {
        let fix: ComponentFixture<VerticalVirtualCreateComponent>;

        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    VerticalVirtualCreateComponent
                ],
                imports: [IgxForOfModule],
                providers: [{ provide: NgZone, useFactory: () => new TestNgZone() }]
            }).compileComponents();
        }));

        beforeEach(() => {
            fix = TestBed.createComponent(VerticalVirtualCreateComponent);
            fix.componentInstance.data = dg.generateVerticalData(fix.componentInstance.cols);
            fix.componentRef.hostView.detectChanges();
            fix.detectChanges();

        });

        it('should reset scroll position if new component is created.', async () => {
            const scrollComponent = fix.debugElement.query(By.css(VERTICAL_SCROLLER)).componentInstance;
            expect(scrollComponent.scrollAmount).toBe(0);
            expect(scrollComponent.destroyed).toBeFalsy();

            scrollComponent.nativeElement.scrollTop = 500;
            fix.detectChanges();
            await wait(100);
            fix.detectChanges();
            expect(scrollComponent.scrollAmount).toBe(500);

            fix.componentInstance.exists = true;
            fix.detectChanges();
            await wait();
            const secondForOf = fix.componentInstance.secondForOfDir;
            expect(secondForOf.state.startIndex).toBe(0);
        });
});
});

class DataGenerator {
    public verticalData: any[] = [];
    public data300x50000: any[] = [];
    public cols300: any[] = [];

    constructor() { }

    public generateVerticalData(cols) {
        if (this.verticalData.length !== 0) {
            return this.verticalData;
        }
        const dummyData = [];
        for (let i = 0; i < 50000; i++) {
            const obj = {};
            for (let j = 0; j < cols.length; j++) {
                const col = cols[j].field;
                obj[col] = 10 * i * j;
            }
            dummyData.push(obj);
        }

        return this.verticalData = dummyData;
    }

    public generateData(numCols: number, numRows: number, instance?) {
        const dummyData = [];
        const cols = [];
        for (let j = 0; j < numCols; j++) {
            cols.push({
                field: j.toString(),
                width: j % 8 < 2 ? 100 : Math.floor((j % 6 + 0.25) * 125)
            });
        }

        for (let i = 0; i < numRows; i++) {
            const obj = {};
            for (let j = 0; j < cols.length; j++) {
                const col = cols[j].field;
                obj[col] = 10 * i * j;
            }
            dummyData.push(obj);
        }

        if (instance) {
            instance.cols = cols;
            instance.data = dummyData;
        } else {
            return { data: dummyData, cols };
        }
    }

    public generateData300x50000(instance) {
        if (this.data300x50000.length !== 0) {
            instance.cols = [...this.cols300];
            instance.data = [...this.data300x50000];
        } else {
            const result = this.generateData(300, 50000);
            this.data300x50000 = [...result.data];
            this.cols300 = [...result.cols];

            instance.cols = [...this.cols300];
            instance.data = [...this.data300x50000];
        }
    }
}

/** igxFor for testing */
@Directive({ selector: '[igxForTest]' })
export class TestIgxForOfDirective<T> extends IgxForOfDirective<T> {
    public scrStepArray = [];
    public scrTopArray = [];
    constructor(
        public viewContainer: ViewContainerRef,
        public template: TemplateRef<NgForOfContext<T>>,
        public differs: IterableDiffers,
        public fResolver: ComponentFactoryResolver,
        public changeDet: ChangeDetectorRef,
        public zone: NgZone,
        protected syncService: IgxForOfScrollSyncService,
        platformUtil: PlatformUtil) {
        super(viewContainer, template, differs, fResolver, changeDet, zone, syncService, platformUtil, document);
    }
    public onScroll(evt) {
        const ind = this.scrTopArray.length - 1;
        const prevScrTop = ind < 0 ? 0 : this.scrTopArray[ind];
        this.scrTopArray.push(evt.target.scrollTop);
        const calcScrollStep = evt.target.scrollTop - prevScrTop;
        this.scrStepArray.push(calcScrollStep);
        super.onScroll(evt);
    }

    public testOnScroll(target) {
        const event = new Event('scroll');
        Object.defineProperty(event, 'target', { value: target, enumerable: true });
        super.onScroll(event);
    }

    public testOnHScroll(target) {
        const event = new Event('scroll');
        Object.defineProperty(event, 'target', { value: target, enumerable: true });
        super.onHScroll(event);
    }

    public testCalculateChunkSize(): number {
        return super._calculateChunkSize();
    }

    public testInitHCache(cols: any[]): number {
        return super.initSizesCache(cols);
    }

    public testGetHorizontalScroll(viewref, nodeName) {
        return super.getElement(viewref, nodeName);
    }

    public testGetHorizontalIndexAt(left, set) {
        super.getIndexAt(left, set);
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

    @ViewChild('container', { static: true }) public container;
    public data = [];
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
export class VirtualComponent {
    @ViewChild('container', { read: ViewContainerRef, static: true })
    public container: ViewContainerRef;

    @ViewChild('scrollContainer', { read: TestIgxForOfDirective, static: true })
    public parentVirtDir: TestIgxForOfDirective<any>;

    @ViewChildren('childContainer', { read: TestIgxForOfDirective })
    public childVirtDirs: QueryList<TestIgxForOfDirective<any>>;

    public width = '800px';
    public height = '400px';
    public cols = [];
    public data = [];

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
}

/** Only vertically virtualized component */
@Component({
    template: `
        <div #container [style.width]='width' [style.height]='height'>
            <ng-template #scrollContainer igxForTest let-rowData [igxForOf]="data"
                [igxForScrollOrientation]="'vertical'"
                [igxForContainerSize]='height'
                [igxForItemSize]='itemSize'>
                <div [style.display]="'flex'" [style.height]="rowData.height || itemSize || '50px'">
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
export class VerticalVirtualComponent extends VirtualComponent {
    public width = '450px';
    public height = '300px';
    public cols = [
        { field: '1', width: '150px' },
        { field: '2', width: '70px' },
        { field: '3', width: '50px' },
        { field: '4', width: '80px' },
        { field: '5', width: '100px' }
    ];
    public data = [];
    public itemSize = '50px';
}

@Component({
    template: `
        <div *ngIf='exists' #container [style.width]='width' [style.height]='height'>
            <ng-template #scrollContainer igxForTest let-rowData [igxForOf]="data"
                [igxForScrollOrientation]="'vertical'"
                [igxForContainerSize]='height'
                [igxForItemSize]='itemSize'>
                <div [style.display]="'flex'" [style.height]="rowData.height || itemSize || '50px'">
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
export class VerticalVirtualDestroyComponent extends VerticalVirtualComponent {
    public exists = true;
}

@Component({
    template: `
    <div #container [style.width]='width' [style.height]='height'>
        <ng-template #scrollContainer igxFor let-rowData [igxForOf]="data"
            [igxForScrollOrientation]="'vertical'"
            [igxForContainerSize]='height'
            [igxForItemSize]='itemSize'>
            <div [style.display]="'flex'" [style.height]="rowData.height || itemSize || '50px'">
                <div [style.min-width]=cols[0].width>{{rowData['1']}}</div>
                <div [style.min-width]=cols[1].width>{{rowData['2']}}</div>
                <div [style.min-width]=cols[2].width>{{rowData['3']}}</div>
                <div [style.min-width]=cols[3].width>{{rowData['4']}}</div>
                <div [style.min-width]=cols[4].width>{{rowData['5']}}</div>
            </div>
        </ng-template>
    </div>
        <div *ngIf='exists' #container [style.width]='width' [style.height]='height'>
            <ng-template #scrollContainer2 igxFor let-rowData [igxForOf]="data"
                [igxForScrollOrientation]="'vertical'"
                [igxForContainerSize]='height'
                [igxForItemSize]='itemSize'>
                <div [style.display]="'flex'" [style.height]="rowData.height || itemSize || '50px'">
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
export class VerticalVirtualCreateComponent extends VerticalVirtualComponent {
    @ViewChild('scrollContainer2', { read: IgxForOfDirective, static: false })
    public secondForOfDir: IgxForOfDirective<any>;

    public exists = false;
}

/** Only horizontally virtualized component */
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
                        [igxForScrollContainer]="parentVirtDir"
                        [igxForContainerSize]='width'>
                            <div [style.min-width]='col.width + "px"'>{{rowData[col.field]}}</div>
                    </ng-template>
                </div>
            </div>
        </div>
    `
})
export class HorizontalVirtualComponent extends VirtualComponent {
    public width = '800px';
    public height = '400px';
    public cols = [];
    public data = [];
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
    @ViewChild('container', { static: true })
    public container;

    @ViewChild('scrollContainer', { read: TestIgxForOfDirective, static: true })
    public parentVirtDir: TestIgxForOfDirective<any>;

    public height = '0px';
    public data = [];

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
                    {{rowData['1']}}
                </div>
            </ng-template>
        </div>
    `
})
export class VerticalVirtualNoDataComponent extends VerticalVirtualComponent {
}

@Injectable()
export class LocalService {
    public records: Observable<any[]>;
    public count: Observable<number>;
    private _records: BehaviorSubject<any[]>;
    private dataStore: any[];
    private _count: BehaviorSubject<number>;

    constructor() {
        this.dataStore = [];
        this._records = new BehaviorSubject([]);
        this.records = this._records.asObservable();
        this._count = new BehaviorSubject(null);
        this.count = this._count.asObservable();
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

    public getCount() {
        const count = 1000;
        this._count.next(count);
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
                (chunkPreload)="dataLoading($event)">
                <div [style.display]="'flex'" [style.height]="'50px'">
                    {{rowData}}
                </div>
            </ng-template>
        </div>
    `,
    providers: [LocalService]
})
export class RemoteVirtualizationComponent implements OnInit, AfterViewInit {
    @ViewChild('scrollContainer', { read: TestIgxForOfDirective, static: true })
    public parentVirtDir: TestIgxForOfDirective<any>;

    @ViewChild('container', { read: ViewContainerRef, static: true })
    public container: ViewContainerRef;

    public height = '500px';
    public data;

    constructor(private localService: LocalService) { }
    public ngOnInit(): void {
        this.data = this.localService.records;
    }

    public ngAfterViewInit() {
        this.localService.getData(this.parentVirtDir.state, (count) => {
            this.parentVirtDir.totalItemCount = count;
        });
    }

    public dataLoading(evt) {
        this.localService.getData(evt, () => {
            this.parentVirtDir.cdr.detectChanges();
        });
    }
}

@Component({
    template: `
        <div #container [style.width]='width' [style.height]='height'>
            <ng-template #scrollContainer let-rowData [igxForOf]="data | async" igxForTest
                [igxForTotalItemCount]="count | async"
                [igxForContainerSize]='height'
                [igxForItemSize]='"50px"'
                (chunkPreload)="dataLoading($event)">
                <div [style.display]="'flex'" [style.height]="'50px'">
                    {{rowData}}
                </div>
            </ng-template>
        </div>
    `,
    providers: [LocalService]
})
export class RemoteVirtCountComponent implements OnInit, AfterViewInit {
    @ViewChild('scrollContainer', { read: TestIgxForOfDirective, static: true })
    public parentVirtDir: TestIgxForOfDirective<any>;

    @ViewChild('container', { read: ViewContainerRef, static: true })
    public container: ViewContainerRef;

    public height = '500px';
    public data;
    public count: Observable<number>;

    constructor(private localService: LocalService) { }
    public ngOnInit(): void {
        this.data = this.localService.records;
        this.count = this.localService.count;
    }

    public ngAfterViewInit() {
        this.localService.getCount();
        this.localService.getData(this.parentVirtDir.state);
    }

    public dataLoading(evt) {
        this.localService.getData(evt, () => {
            this.parentVirtDir.cdr.detectChanges();
        });
    }
}

@Component({
    template: `
    <div class="container">
        <ng-template igxForTest
            let-item [igxForOf]="items"
            [igxForScrollOrientation]="'horizontal'"
            [igxForContainerSize]='width'
            [igxForItemSize]='itemSize'>
                <div class="forOfElement" #child>{{item.text}}</div>
        </ng-template>
    </div>
    `,
    styles: [`.container {
        display: flex;
        flex-flow: column;
        position: relative;
        width: 300px;
        height: 300px;
        overflow: hidden;
        border: 1px solid #000;
    }`, `.forOfElement {
        flex: 0 0 60px;
        border-right: 1px solid #888;
    }`]
})

export class NoWidthAndHeightComponent {
    @ViewChildren('child')
    public childVirtDirs: QueryList<any>;

    public items = [];
    public width = '300px';
    public itemSize = 60;
    public height = '300px';

    constructor() {
        for (let i = 0; i < 100; i++) {
            this.items.push({ text: i + '' });
        }
    }
}

@Component({
    template: `
    <div class='container'>
        <ng-template igxFor let-item [igxForOf]="data" #virtDirVertical
            [igxForScrollOrientation]="'vertical'"
            [igxForContainerSize]='"500px"'
            [igxForItemSize]='itemSize'
            let-rowIndex="index"
            let-odd="odd"
            let-even="even"
            let-first="first"
            let-last="last">

            <div #markupItem
                [ngClass]="{
                    first: first,
                    last: last,
                    even: even,
                    odd: odd
                }"
                [style.height]='itemSize'>
                    {{rowIndex}} : {{item.text}}
            </div>
        </ng-template>
    </div>
    `,
})
export class LocalVariablesComponent {
    public data = [];

    constructor() {
        for (let i = 0; i < 100; i++) {
            this.data.push({ text: i + '' });
        }
    }
}
