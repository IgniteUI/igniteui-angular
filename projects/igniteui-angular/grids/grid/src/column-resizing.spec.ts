import { Component, DebugElement, OnInit, ViewChild, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { UIInteractions, frames, nextFrame } from '../../../test-utils/ui-interactions.spec';
import { GridTemplateStrings, ColumnDefinitions } from '../../../test-utils/template-strings.spec';
import { SampleTestData } from '../../../test-utils/sample-test-data.spec';
import { MultiColumnHeadersComponent } from '../../../test-utils/grid-samples.spec';
import { GridFunctions } from '../../../test-utils/grid-functions.spec';
import { FilterMode, IColumnResizeEventArgs, IgxCellHeaderTemplateDirective, IgxCellTemplateDirective, IgxColumnComponent, IgxGridToolbarComponent, IgxGridToolbarTitleComponent } from 'igniteui-angular/grids/core';
import { advance, setElementSize, useFakeClock } from '../../../test-utils/helper-utils.spec';
import { IgxColumnResizerDirective } from 'igniteui-angular/grids/core';
import { FilteringExpressionsTree, FilteringLogic, IgxStringFilteringOperand, ɵSize } from 'igniteui-angular/core';
import { IgxAvatarComponent } from 'igniteui-angular/avatar';
import { Calendar } from 'igniteui-angular/calendar';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

/** Mousedown debounce of the header resize handle (`IgxResizeHandleDirective.DEBOUNCE_TIME`). */
const RESIZE_DEBOUNCE_TIME = 200;

/**
 * Presses a header resize area and advances a fake clock past the handle's mousedown debounce, which shows the resizer.
 * The clock is installed once per test: reinstalling it would drop pending timers (e.g. an open throttle window).
 */
const pressResizeArea = async (fixture: ComponentFixture<unknown>, resizeArea: HTMLElement, x: number, y: number) => {
    if (!vi.isFakeTimers()) {
        useFakeClock();
    }

    UIInteractions.simulateMouseEvent('mousedown', resizeArea, x, y);
    await advance(fixture, RESIZE_DEBOUNCE_TIME);
};

describe('IgxGrid - Deferred Column Resizing #grid', () => {

    const COLUMN_HEADER_GROUP_CLASS = '.igx-grid-thead__item';

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MultiColumnHeadersComponent,
                NoopAnimationsModule,
                ResizableColumnsComponent,
                GridFeaturesComponent,
                LargePinnedColGridComponent,
                NullColumnsComponent,
                MinWidthColumnsComponent,
                ColGridComponent,
                ColPercentageGridComponent,
                AutosizeFilteringGridComponent
            ]
        }).compileComponents();
    });

    describe('Base tests: ', () => {
        let fixture: ComponentFixture<any>;
        let grid: IgxGridComponent;
        let headers: DebugElement[];
        let headerResArea: HTMLElement;

        beforeEach(async () => {
            fixture = TestBed.createComponent(ResizableColumnsComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            headers = GridFunctions.getColumnHeaders(fixture);
            headerResArea = GridFunctions.getHeaderResizeArea(headers[0]).nativeElement;
        });

        it('should define grid with resizable columns.', async () => {

            expect(grid.columnList.get(0).width).toEqual('100px');
            expect(grid.columnList.get(0).resizable).toBeTruthy();
            expect(grid.columnList.get(2).resizable).toBeFalsy();
            await pressResizeArea(fixture, headerResArea, 100, 15);
            fixture.detectChanges();

            let resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 250, 15);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 250, 15);
            fixture.detectChanges();

            expect(grid.columnList.get(0).width).toEqual('250px');

            await pressResizeArea(fixture, headerResArea, 250, 0);
            fixture.detectChanges();
            resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 40, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 40, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(0).width).toEqual('80px');

            expect(grid.columnList.get(2).cells[0].value).toEqual('Brown');

            GridFunctions.clickHeaderSortIcon(headers[2]);
            GridFunctions.clickHeaderSortIcon(headers[2]);
            fixture.detectChanges();

            expect(grid.columnList.get(2).cells[0].value).toEqual('Wilson');
        });

        it('should resize column outside grid view.', async () => {
            expect(grid.columnList.get(0).width).toEqual('100px');
            await pressResizeArea(fixture, headerResArea, 100, 0);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 700, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 700, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(0).width).toEqual('700px');
        });

        it('should resize column with preset min and max widths.', async () => {
            expect(grid.columnList.get(1).width).toEqual('100px');
            expect(grid.columnList.get(1).minWidth).toEqual('70px');
            expect(grid.columnList.get(1).maxWidth).toEqual('250px');
            expect(grid.columnList.get(1).resizable).toBeTruthy();
            headerResArea = GridFunctions.getHeaderResizeArea(headers[1]).nativeElement;

            await pressResizeArea(fixture, headerResArea, 200, 0);
            fixture.detectChanges();

            let resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 370, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 370, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(1).width).toEqual('250px');

            await pressResizeArea(fixture, headerResArea, 350, 0);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 100, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(1).width).toEqual('70px');
        });

        it('should calculate correctly resizer position and column width when grid is scaled and zoomed', async () => {
            grid.nativeElement.style.transform = 'scale(1.2)';
            grid.nativeElement.style.setProperty('zoom', '1.05');
            fixture.detectChanges();
            headerResArea = GridFunctions.getHeaderResizeArea(headers[1]).nativeElement;
            await pressResizeArea(fixture, headerResArea, 153, 0);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture);
            const resizerDirective = resizer.componentInstance.resizer as IgxColumnResizerDirective;
            const leftSetterSpy = vi.spyOn(resizerDirective, 'left', 'set');
            UIInteractions.simulateMouseEvent('mousemove', resizer.nativeElement, 200, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer.nativeElement, 200, 5);
            fixture.detectChanges();

            expect(leftSetterSpy).toHaveBeenCalled();
            expect(parseInt(vi.mocked(leftSetterSpy).mock.lastCall[0].toFixed(0))).toEqual(200);
            expect(parseInt(grid.columnList.get(1).headerCell.nativeElement.getBoundingClientRect().width.toFixed(0))).toEqual(173);
        });

        it('should be able to resize column to the minWidth < defaultMinWidth', async () => {
            const column = grid.getColumnByName('ID');
            column.minWidth = 'a';
            fixture.detectChanges();

            expect(column.resizable).toBe(true);
            await pressResizeArea(fixture, headerResArea, 100, 0);
            fixture.detectChanges();

            let resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 10, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 10, 5);
            fixture.detectChanges();

            expect(column.width).toEqual('80px');
            column.minWidth = '50';
            fixture.detectChanges();

            await pressResizeArea(fixture, headerResArea, 80, 0);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 10, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 10, 5);
            fixture.detectChanges();

            expect(column.width).toEqual('50px');
        });

        it('should change the defaultMinWidth on grid size change', async () => {
            const column = grid.getColumnByName('ID');

            expect(column.defaultMinWidth).toBe('80');
            expect(column.resizable).toBe(true);
            await pressResizeArea(fixture, headerResArea, 100, 0);
            fixture.detectChanges();

            let resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 10, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 10, 5);
            fixture.detectChanges();

            expect(column.width).toEqual('80px');
            setElementSize(grid.nativeElement, ɵSize.Medium);
            await frames(2); // the resize observer reports after the next frame's rAF callbacks
            fixture.detectChanges();

            expect(column.defaultMinWidth).toBe('64');
            await pressResizeArea(fixture, headerResArea, 80, 0);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 10, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 10, 5);
            fixture.detectChanges();

            expect(column.width).toEqual('64px');
            setElementSize(grid.nativeElement, ɵSize.Small);
            await frames(2); // the resize observer reports after the next frame's rAF callbacks
            fixture.detectChanges();

            expect(column.defaultMinWidth).toBe('56');
            await pressResizeArea(fixture, headerResArea, 64, 0);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 10, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 10, 5);
            fixture.detectChanges();

            expect(column.width).toEqual('56px');
        });

        it('should update grid after resizing a column to be bigger.', async () => {
            const displayContainer: HTMLElement = GridFunctions.getGridDisplayContainer(fixture).nativeElement;
            let rowsRendered = displayContainer.querySelectorAll('igx-display-container');
            let colsRendered = rowsRendered[0].children;

            expect(grid.columnList.get(0).width).toEqual('100px');
            expect(colsRendered.length).toEqual(4);

            // Resize first column
            await pressResizeArea(fixture, headerResArea, 100, 0);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 700, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 700, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(0).width).toEqual('700px');

            // Check grid has updated cells and scrollbar
            const hScroll = fixture.componentInstance.grid.headerContainer.getScroll();
            const hScrollVisible = hScroll.offsetWidth < hScroll.children[0].offsetWidth;
            rowsRendered = displayContainer.querySelectorAll('igx-display-container');
            colsRendered = rowsRendered[0].children;

            expect(hScrollVisible).toBe(true);
            expect(colsRendered.length).toEqual(4);
        });

        it('should recalculate grid heights after resizing so the horizontal scrollbar appears.', async () => {
            let expectedHeight = grid.nativeElement.offsetHeight
                - grid.theadRow.nativeElement.offsetHeight
                - grid.tfoot.nativeElement.offsetHeight
                - (grid.isHorizontalScrollHidden ? 0 : grid.scrollSize);

            expect(grid.calcHeight).toEqual(expectedHeight);
            expect(grid.columnList.get(0).width).toEqual('100px');

            // Resize first column
            await pressResizeArea(fixture, headerResArea, 100, 0);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 250, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 250, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(0).width).toEqual('250px');

            // Check grid has updated cells and scrollbar
            const hScroll = fixture.componentInstance.grid.headerContainer.getScroll();
            const hScrollVisible = hScroll.offsetWidth < hScroll.children[0].offsetWidth;

            expectedHeight = grid.nativeElement.offsetHeight
                - grid.theadRow.nativeElement.offsetHeight
                - grid.tfoot.nativeElement.offsetHeight
                - (grid.isHorizontalScrollHidden ? 0 : grid.scrollSize);

            expect(grid.calcHeight).toEqual(expectedHeight);
            expect(hScrollVisible).toBe(true);
        });

        it('should resize pinned column with preset max width.', async () => {
            grid.pinColumn('ID');
            grid.pinColumn('Name');
            grid.getColumnByName('LastName').resizable = true;
            grid.pinColumn('LastName');
            fixture.detectChanges();

            expect(grid.columnList.get(1).width).toEqual('100px');
            headers = GridFunctions.getColumnHeaders(fixture);
            headerResArea = GridFunctions.getHeaderResizeArea(headers[1]).nativeElement;
            await pressResizeArea(fixture, headerResArea, 200, 0);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 350, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 350, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(1).width).toEqual('250px');
        });

        it('should resize pinned columns.', async () => {
            grid.pinColumn('ID');
            grid.pinColumn('Name');
            grid.getColumnByName('LastName').resizable = true;
            fixture.detectChanges();

            headers = GridFunctions.getColumnHeaders(fixture);
            headerResArea = GridFunctions.getHeaderResizeArea(headers[0]).nativeElement;
            expect(grid.columnList.get(0).width).toEqual('100px');
            expect(grid.columnList.get(1).width).toEqual('100px');

            await pressResizeArea(fixture, headerResArea, 100, 0);
            fixture.detectChanges();

            let resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 450, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 450, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(0).width).toEqual('450px');
            expect(grid.columnList.get(1).width).toEqual('100px');

            await pressResizeArea(fixture, headerResArea, 300, 0);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 100, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(0).width).toEqual('250px');
        });
    });

    describe('Autoresize tests: ', () => {
        let fixture: ComponentFixture<any>;
        let grid: IgxGridComponent;

        beforeEach(async () => {
            fixture = TestBed.createComponent(LargePinnedColGridComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        });

        it('should autoresize column with preset max width.', async () => {
            const headers = GridFunctions.getColumnHeaders(fixture);
            const resizeArea = GridFunctions.getHeaderResizeArea(headers[4]).nativeElement;

            expect(grid.columnList.get(4)._cells[0].nativeElement.getBoundingClientRect().width).toEqual(50);
            expect(grid.columnList.get(4).maxWidth).toEqual('100px');

            UIInteractions.simulateMouseEvent('dblclick', resizeArea, 0, 0);
            await nextFrame();
            fixture.detectChanges();

            expect(grid.columnList.get(4).width).toEqual('100px');
        });

        it('should autoresize pinned column on double click.', async () => {
            const headers = GridFunctions.getColumnHeaders(fixture);
            const resizeArea = GridFunctions.getHeaderResizeArea(headers[2]).nativeElement;

            expect(grid.columnList.get(2).width).toEqual('100px');

            UIInteractions.simulateMouseEvent('dblclick', resizeArea, 0, 0);
            await nextFrame();
            fixture.detectChanges();

            expect(grid.columnList.get(2).width).toEqual('92px');
        });

        it('should autosize column programmatically.', () => {
            const column = grid.getColumnByName('ID');
            column.minWidth = '30px';
            expect(column.width).toEqual('100px');

            column.autosize();
            fixture.detectChanges();

            expect(column.width).toEqual('67px');
        });

        it('should autosize column correctly if there is scaling via css.', () => {
            grid.nativeElement.style.transform = 'scale(0.6)';
            const column = grid.getColumnByName('Items');

            column.autosize();
            fixture.detectChanges();

            expect(column.width).toEqual('92px');
            grid.nativeElement.style.transform = '';
        });

        it('should autosize column programmatically based only on header.', () => {
            const column = fixture.componentInstance.grid.columnList.filter(c => c.field === 'ReleaseDate')[0];
            expect(column.width).toEqual('100px');

            column.autosize(true);
            fixture.detectChanges();

            expect(column.width).toEqual('112px');
        });

        it('should autosize pinned column programmatically.', () => {
            const column = grid.getColumnByName('Released');
            expect(column.width).toEqual('100px');

            column.autosize();
            fixture.detectChanges();

            expect(column.width).toEqual('95px');
        });

        it('should autosize last pinned column programmatically.', () => {
            const column = grid.getColumnByName('Items');
            expect(column.width).toEqual('100px');

            column.autosize();
            fixture.detectChanges();

            expect(column.width).toEqual('92px');
        });

        it('should autosize column when minWidth is set.', () => {
            const column = grid.getColumnByName('ID');
            column.minWidth = '70px';
            expect(column.minWidth).toEqual('70px');
            expect(column.width).toEqual('100px');

            column.autosize();
            fixture.detectChanges();

            expect(column.width).toEqual('70px');
        });
    });

    describe('Autosize with filtering tests: ', () => {
        type AutosizeMode = 'autosize' | 'autosizeByHeader' | 'dblclick';
        type AutosizeFixture = ComponentFixture<AutosizeFilteringGridComponent>;

        interface AutosizeGridOptions {
            allowFiltering?: boolean;
            autosizeHeader?: boolean;
            filterMode?: FilterMode;
            zoom?: string;
        }

        const AUTOSIZE_MODES: AutosizeMode[] = ['autosize', 'autosizeByHeader', 'dblclick'];
        const AUTOSIZED_FIELDS = ['ID', 'Name', 'LastName'];
        const INITIAL_WIDTH = 250;
        const NARROW_WIDTH = '120px';
        // snaps the 1px header border to 0.8px, like 125% display scaling
        const FRACTIONAL_ZOOM = '1.25';
        const FILTERING_CELL = 'igx-grid-filtering-cell';
        // the width of the custom filtering cell template content
        const CUSTOM_FILTER_WIDTH = 180;

        const createAutosizeGrid = async (options: AutosizeGridOptions = {}): Promise<AutosizeFixture> => {
            const fix = TestBed.createComponent(AutosizeFilteringGridComponent);
            if (options.zoom) {
                fix.nativeElement.style.zoom = options.zoom;
            }
            fix.componentInstance.allowFiltering = options.allowFiltering ?? true;
            fix.componentInstance.autosizeHeader = options.autosizeHeader ?? true;
            fix.componentInstance.filterMode = options.filterMode ?? FilterMode.quickFilter;
            fix.detectChanges();
            await nextFrame();
            fix.detectChanges();
            return fix;
        };

        const getWidths = (fix: AutosizeFixture): string[] =>
            AUTOSIZED_FIELDS.map(field => fix.componentInstance.grid.getColumnByName(field).width);

        const setWidths = (fix: AutosizeFixture, width: string) => {
            AUTOSIZED_FIELDS.forEach(field => {
                fix.componentInstance.grid.getColumnByName(field).width = width;
            });
            fix.detectChanges();
        };

        const autosizeColumns = async (fix: AutosizeFixture, mode: AutosizeMode, fields = AUTOSIZED_FIELDS): Promise<string[]> => {
            for (const field of fields) {
                if (mode === 'dblclick') {
                    const header = GridFunctions.getColumnHeader(field, fix);
                    UIInteractions.simulateMouseEvent('dblclick', GridFunctions.getHeaderResizeArea(header).nativeElement, 0, 0);
                    await nextFrame();
                } else {
                    fix.componentInstance.grid.getColumnByName(field).autosize(mode === 'autosizeByHeader');
                }
                fix.detectChanges();
            }
            return fields.map(field => fix.componentInstance.grid.getColumnByName(field).width);
        };

        const autosizeRepeatedly = async (fix: AutosizeFixture, mode: AutosizeMode, times = 3): Promise<string[][]> => {
            const results: string[][] = [];
            for (let i = 0; i < times; i++) {
                results.push(await autosizeColumns(fix, mode));
            }
            return results;
        };

        const getFilteringCell = (fix: AutosizeFixture, field: string): HTMLElement =>
            GridFunctions.getColumnHeader(field, fix).parent.query(By.css(FILTERING_CELL)).nativeElement;

        // the chips area shrinks with the cell, so overflowing chips reach the cell padding before the cell overflows
        const overflowsContentBox = (cell: HTMLElement) =>
            [cell, cell.querySelector<HTMLElement>('igx-chips-area')].some(element => !!element && element.scrollWidth - element.clientWidth > 1);

        /**
         * Compares autosizing the grid with and without quick filtering. Each grid is measured before the next one
         * is created, as creating a fixture detaches the previous one.
         */
        const verifyAutosizeWithFilteringCells = async (mode: AutosizeMode, autosizeHeader = true, zoom = ''): Promise<string[]> => {
            const context = `${mode}, autosizeHeader: ${autosizeHeader}, zoom: ${zoom || 1}`;
            const headersMeasured = autosizeHeader || mode === 'autosizeByHeader';

            const referenceFix = await createAutosizeGrid({ allowFiltering: false, autosizeHeader, zoom });
            const [reference, ...nextReference] = await autosizeRepeatedly(referenceFix, mode);
            reference.forEach(width =>
                expect(parseFloat(width), `${context}, without filtering`).toBeLessThan(INITIAL_WIDTH));
            nextReference.forEach((next, i) =>
                expect(next, `${context}, without filtering, call ${i + 2}`).toEqual(reference));
            if (headersMeasured) {
                // autosizing from the narrow width has to widen the Name column
                expect(parseFloat(reference[AUTOSIZED_FIELDS.indexOf('Name')]), context)
                    .toBeGreaterThan(parseFloat(NARROW_WIDTH));
            }
            setWidths(referenceFix, NARROW_WIDTH);
            expect(await autosizeColumns(referenceFix, mode), `${context}, without filtering, from ${NARROW_WIDTH}`)
                .toEqual(reference);

            const fix = await createAutosizeGrid({ autosizeHeader, zoom });
            expect(getWidths(fix), context).toEqual(AUTOSIZED_FIELDS.map(() => `${INITIAL_WIDTH}px`));
            const [widths, ...nextWidths] = await autosizeRepeatedly(fix, mode);
            nextWidths.forEach((next, i) =>
                expect(next, `${context}, with filtering, call ${i + 2}`).toEqual(widths));
            AUTOSIZED_FIELDS.forEach((field, i) => {
                const fieldContext = `${context}, with filtering, ${field}`;
                const columnWidth = fix.componentInstance.grid.getColumnByName(field).width;
                const filteringCell = getFilteringCell(fix, field);
                expect(parseFloat(widths[i]), fieldContext).toBeLessThan(INITIAL_WIDTH);
                if (headersMeasured) {
                    expect(parseFloat(widths[i]), fieldContext).toBeGreaterThanOrEqual(parseFloat(reference[i]));
                    expect(overflowsContentBox(filteringCell), `${fieldContext}, filtering cell overflows`).toBe(false);
                } else {
                    expect(widths[i], fieldContext).toBe(reference[i]);
                }
                expect(GridFunctions.getColumnHeader(field, fix).nativeElement.style.width, `${fieldContext}, header width`)
                    .toBe(columnWidth);
                expect(filteringCell.style.width, `${fieldContext}, filtering cell width`).toBe(columnWidth);
            });

            setWidths(fix, NARROW_WIDTH);
            expect(await autosizeColumns(fix, mode), `${context}, with filtering, from ${NARROW_WIDTH}`).toEqual(widths);
            return widths;
        };

        it('should autosize columns to their content on autosize() when filtering is enabled.', async () => {
            await verifyAutosizeWithFilteringCells('autosize');
        });

        it('should autosize columns to their headers on autosize(true) when filtering is enabled.', async () => {
            await verifyAutosizeWithFilteringCells('autosizeByHeader');
        });

        it('should autosize columns to their content on resize handle double-click when filtering is enabled.', async () => {
            await verifyAutosizeWithFilteringCells('dblclick');
        });

        it('should not grow autosized columns on repeated calls with fractional CSS zoom when filtering is enabled.', async () => {
            for (const mode of AUTOSIZE_MODES) {
                await verifyAutosizeWithFilteringCells(mode, true, FRACTIONAL_ZOOM);
            }
        });

        it('should autosize columns to their headers on autosize(true) when autosizeHeader is false and filtering is enabled.', async () => {
            for (const zoom of ['', FRACTIONAL_ZOOM]) {
                // autosizing by header does not depend on autosizeHeader
                const expected = await verifyAutosizeWithFilteringCells('autosizeByHeader', true, zoom);
                expect(await verifyAutosizeWithFilteringCells('autosizeByHeader', false, zoom), `zoom: ${zoom || 1}`)
                    .toEqual(expected);
            }
        });

        it('should keep autosizing columns by their cells when autosizeHeader is false and filtering is enabled.', async () => {
            for (const zoom of ['', FRACTIONAL_ZOOM]) {
                await verifyAutosizeWithFilteringCells('autosize', false, zoom);
                await verifyAutosizeWithFilteringCells('dblclick', false, zoom);
            }
        });

        it('should fit the chip of a single filtering condition when autosizing columns.', async () => {
            const fix = await createAutosizeGrid();
            const grid = fix.componentInstance.grid;
            grid.filter('LastName', 'Williams', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();
            const column = grid.getColumnByName('LastName');
            const filteringCell = getFilteringCell(fix, 'LastName');

            for (const mode of AUTOSIZE_MODES) {
                const widths: string[] = [];
                for (const startWidth of [`${INITIAL_WIDTH}px`, '60px']) {
                    const context = `${mode}, from ${startWidth}`;
                    column.width = startWidth;
                    fix.detectChanges();
                    const [width] = await autosizeColumns(fix, mode, ['LastName']);
                    expect(await autosizeColumns(fix, mode, ['LastName']), `${context}, call 2`).toEqual([width]);
                    expect(GridFunctions.getFilterChipsForColumn('LastName', fix).length, context).toBe(1);
                    expect(overflowsContentBox(filteringCell), `${context}, filtering cell overflows`).toBe(false);
                    widths.push(width);
                }
                expect(widths[1], mode).toBe(widths[0]);
            }
        });

        it('should not widen columns for the collapsible chips of several filtering conditions.', async () => {
            const fix = await createAutosizeGrid();
            const grid = fix.componentInstance.grid;
            const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'LastName');
            ['a', 'o'].forEach(searchVal => tree.filteringOperands.push({
                fieldName: 'LastName',
                searchVal,
                conditionName: 'contains',
                condition: IgxStringFilteringOperand.instance().condition('contains')
            }));
            grid.filter('LastName', null, tree);
            fix.detectChanges();
            const column = grid.getColumnByName('LastName');

            for (const mode of AUTOSIZE_MODES) {
                const widths: string[] = [];
                for (const startWidth of ['400px', '60px']) {
                    const context = `${mode}, from ${startWidth}`;
                    column.width = startWidth;
                    fix.detectChanges();
                    const [width] = await autosizeColumns(fix, mode, ['LastName']);
                    expect(await autosizeColumns(fix, mode, ['LastName']), `${context}, call 2`).toEqual([width]);
                    // the chips that do not fit collapse into the "more" indicator
                    expect(GridFunctions.getFilterChipsForColumn('LastName', fix).length, context).toBeLessThan(2);
                    widths.push(width);
                }
                expect(widths[1], mode).toBe(widths[0]);
            }
        });

        it('should not size columns by a custom filtering cell template.', async () => {
            const fix = await createAutosizeGrid();
            const column = fix.componentInstance.grid.getColumnByName('ID');
            column.filterCellTemplate = fix.componentInstance.filterCellTemplate;
            fix.detectChanges();
            expect(getFilteringCell(fix, 'ID').querySelector('.custom-filter')).not.toBeNull();

            for (const mode of AUTOSIZE_MODES) {
                const widths: string[] = [];
                for (const startWidth of [`${INITIAL_WIDTH}px`, '60px']) {
                    column.width = startWidth;
                    fix.detectChanges();
                    const [width] = await autosizeColumns(fix, mode, ['ID']);
                    expect(await autosizeColumns(fix, mode, ['ID']), `${mode}, from ${startWidth}, call 2`).toEqual([width]);
                    widths.push(width);
                }
                expect(parseFloat(widths[0]), mode).toBeLessThan(CUSTOM_FILTER_WIDTH);
                expect(widths[1], mode).toBe(widths[0]);
            }
        });

        it('should fit the filtering chip when its cell has a larger padding than the data cells.', async () => {
            const fix = await createAutosizeGrid();
            fix.componentInstance.data = [...fix.componentInstance.data, { ID: 8, Name: 'Ann', LastName: 'Montgomery-Smith', Region: 'AD' }];
            fix.detectChanges();
            const filteringCell = getFilteringCell(fix, 'LastName');
            // e.g. a custom theme
            filteringCell.style.paddingInline = '80px';

            const [headerWidth] = await autosizeColumns(fix, 'autosizeByHeader', ['LastName']);
            expect(await autosizeColumns(fix, 'autosize', ['LastName'])).toEqual([headerWidth]);
            expect(overflowsContentBox(filteringCell)).toBe(false);
        });

        it('should respect minWidth and maxWidth when autosizing columns with filtering enabled.', async () => {
            const fix = await createAutosizeGrid();
            const [idColumn, nameColumn, lastNameColumn] = AUTOSIZED_FIELDS.map(field => fix.componentInstance.grid.getColumnByName(field));
            idColumn.minWidth = '150px';
            nameColumn.maxWidth = '100px';
            lastNameColumn.maxWidth = '200px';
            fix.detectChanges();

            for (const mode of AUTOSIZE_MODES) {
                setWidths(fix, `${INITIAL_WIDTH}px`);
                await autosizeColumns(fix, mode);

                expect(idColumn.width, mode).toBe('150px');
                expect(nameColumn.width, mode).toBe('100px');
                expect(parseFloat(lastNameColumn.width), mode).toBeLessThan(200);
            }
        });

        it('should include the header icons when autosizing columns by their headers.', async () => {
            // excel-style filtering icon
            const lastNameIndex = AUTOSIZED_FIELDS.indexOf('LastName');
            const withoutFilterIcon = (await autosizeColumns(await createAutosizeGrid({ allowFiltering: false }), 'autosizeByHeader'))[lastNameIndex];
            const withFilterIcon = (await autosizeColumns(
                await createAutosizeGrid({ filterMode: FilterMode.excelStyleFilter }), 'autosizeByHeader'))[lastNameIndex];
            expect(parseFloat(withFilterIcon)).toBeGreaterThan(parseFloat(withoutFilterIcon));

            // sorting indicator
            const fix = await createAutosizeGrid({ allowFiltering: false });
            const column = fix.componentInstance.grid.getColumnByName('Name');
            expect(column.sortable).toBe(true);
            column.autosize(true);
            fix.detectChanges();
            const sortableWidth = parseFloat(column.width);

            column.sortable = false;
            column.width = `${INITIAL_WIDTH}px`;
            fix.detectChanges();
            column.autosize(true);
            fix.detectChanges();

            expect(sortableWidth).toBeLessThan(INITIAL_WIDTH);
            expect(parseFloat(column.width)).toBeLessThan(sortableWidth);
        });
    });

    describe('Percentage tests: ', () => {
        let fixture: ComponentFixture<any>;
        let grid: IgxGridComponent;

        beforeEach(async () => {
            fixture = TestBed.createComponent(ColPercentageGridComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        });

        it('should resize columns with % width.', async () => {
            grid.height = null;
            fixture.detectChanges();
            const headers = GridFunctions.getColumnHeaders(fixture);
            expect(grid.columnList.get(0).width).toBe('25%');

            const headerResArea = headers[0].parent.children[2].nativeElement;
            const startPos = headerResArea.getBoundingClientRect().x;
            await pressResizeArea(fixture, headerResArea, startPos, 5);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            // resize with 100px, which is 25%
            UIInteractions.simulateMouseEvent('mousemove', resizer, startPos + 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, startPos + 100, 5);
            fixture.detectChanges();
            expect(grid.columnList.get(0).width).toBe('50%');
        });

        it('should resize columns with % width and % maxWidth.', async () => {
            grid.height = null;
            fixture.detectChanges();
            const headers = GridFunctions.getColumnHeaders(fixture);
            grid.columnList.get(0).maxWidth = '30%';
            expect(grid.columnList.get(0).width).toBe('25%');

            const headerResArea = headers[0].parent.children[2].nativeElement;
            const startPos = headerResArea.getBoundingClientRect().x;
            await pressResizeArea(fixture, headerResArea, startPos, 5);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            // resize with +100px, which is 25%
            UIInteractions.simulateMouseEvent('mousemove', resizer, startPos + 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, startPos + 100, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(0).width).toBe(grid.columnList.get(0).maxWidth);
        });

        it('should resize columns with % width and % minWidth.', async () => {
            grid.height = null;
            fixture.detectChanges();
            const headers = GridFunctions.getColumnHeaders(fixture);
            grid.columnList.get(0).minWidth = '10%';
            expect(grid.columnList.get(0).width).toBe('25%');

            const headerResArea = headers[0].parent.children[2].nativeElement;
            const startPos = headerResArea.getBoundingClientRect().x;
            await pressResizeArea(fixture, headerResArea, startPos, 5);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            // resize with -100px
            UIInteractions.simulateMouseEvent('mousemove', resizer, startPos - 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, startPos - 100, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(0).width).toBe(grid.columnList.get(0).minWidth);
        });

        it('should resize columns with % width and pixel maxWidth.', async () => {
            grid.height = null;
            fixture.detectChanges();
            const headers = GridFunctions.getColumnHeaders(fixture);
            grid.columnList.get(0).maxWidth = '200px';
            expect(grid.columnList.get(0).width).toBe('25%');

            const headerResArea = headers[0].parent.children[2].nativeElement;
            const startPos = headerResArea.getBoundingClientRect().x;
            await pressResizeArea(fixture, headerResArea, startPos, 5);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            // resize with +200px, which is 50%
            UIInteractions.simulateMouseEvent('mousemove', resizer, startPos + 200, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, startPos + 200, 5);
            fixture.detectChanges();
            expect(grid.columnList.get(0).width).toBe('50%');
        });

        it('should resize columns with % width and pixel minWidth.', async () => {
            grid.height = null;
            fixture.detectChanges();
            const headers = GridFunctions.getColumnHeaders(fixture);
            // minWidth is 12.5% of the grid width - 400px
            grid.columnList.get(0).minWidth = '50px';
            expect(grid.columnList.get(0).width).toBe('25%');

            const headerResArea = headers[0].parent.children[2].nativeElement;
            const startPos = headerResArea.getBoundingClientRect().x;
            await pressResizeArea(fixture, headerResArea, startPos, 5);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            // resize with -100px
            UIInteractions.simulateMouseEvent('mousemove', resizer, startPos - 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, startPos - 100, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(0).width).toBe('12.5%');
        });

        it('should autosize column with % width programmatically.', async () => {
            grid.height = null;
            fixture.detectChanges();
            const col = grid.columnList.get(0);
            expect(col.width).toBe('25%');
            const expectedWidth = Math.max(parseFloat(col.getLargestCellWidth()), col.minWidthPx) / grid.calcWidth * 100 + '%';

            col.autosize();
            fixture.detectChanges();
            expect(col.width).toBe(expectedWidth);

            col.width = '50%';
            fixture.detectChanges();
            col.autosize();
            fixture.detectChanges();
            expect(col.width).toBe(expectedWidth);
        });

        it('should autosize column with % width on double click.', async () => {
            grid.height = null;
            fixture.detectChanges();
            const col = grid.columnList.get(0);
            expect(col.width).toBe('25%');
            const expectedWidth = Math.max(parseFloat(col.getLargestCellWidth()), col.minWidthPx) / grid.calcWidth * 100 + '%';
            const headers = GridFunctions.getColumnHeaders(fixture);
            const headerResArea = headers[0].parent.children[2].nativeElement;

            UIInteractions.simulateMouseEvent('dblclick', headerResArea, 0, 0);
            await nextFrame();
            fixture.detectChanges();
            expect(col.width).toBe(expectedWidth);

            col.width = '50%';
            fixture.detectChanges();
            UIInteractions.simulateMouseEvent('dblclick', headerResArea, 0, 0);
            await nextFrame();
            fixture.detectChanges();
            expect(col.width).toBe(expectedWidth);
        });
    });

    describe('Integration tests: ', () => {
        let fixture: ComponentFixture<any>;
        let grid: IgxGridComponent;

        beforeEach(async () => {
            fixture = TestBed.createComponent(GridFeaturesComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        });

        it('should resize sortable columns.', async () => {
            const headers = GridFunctions.getColumnHeaders(fixture);
            const headerResArea = GridFunctions.getHeaderResizeArea(headers[2]).nativeElement;

            expect(grid.columnList.get(2).width).toEqual('150px');
            expect(grid.columnList.get(2).sortable).toBeTruthy();
            expect(grid.columnList.get(2).cells[0].value).toEqual(254);

            await pressResizeArea(fixture, headerResArea, 450, 0);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 550, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 550, 5);
            fixture.detectChanges();

            // column has maxWidth='150px'
            expect(grid.columnList.get(1).width).toEqual('150px');

            GridFunctions.clickHeaderSortIcon(headers[2]);
            GridFunctions.clickHeaderSortIcon(headers[2]);
            fixture.detectChanges();

            expect(grid.columnList.get(2).cells[0].value).toEqual(1000);
        });

        it('should autoresize column on double click.', async () => {
            const headers = GridFunctions.getColumnHeaders(fixture);
            const resizeArea = GridFunctions.getHeaderResizeArea(headers[1]).nativeElement;

            expect(grid.columnList.get(0).width).toEqual('150px');
            expect(grid.columnList.get(1).width).toEqual('150px');
            expect(grid.columnList.get(2).width).toEqual('150px');

            UIInteractions.simulateMouseEvent('dblclick', resizeArea, 0, 0);
            await nextFrame();
            fixture.detectChanges();

            expect(grid.columnList.get(1).width).toEqual('196px');
        });

        it('should autoresize templated column on double click.', async () => {
            const headers = GridFunctions.getColumnHeaders(fixture);
            const resizeArea = GridFunctions.getHeaderResizeArea(headers[5]).nativeElement;

            expect(grid.columnList.get(5).width).toEqual('150px');

            UIInteractions.simulateMouseEvent('dblclick', resizeArea, 0, 0);
            await nextFrame();
            fixture.detectChanges();

            expect(grid.columnList.get(5).width).toEqual('89px');
        });

        it('should fire columnResized with correct event args.', async () => {
            const resizingSpy = vi.spyOn(grid.columnResized, 'emit');
            const headers: DebugElement[] = GridFunctions.getColumnHeaders(fixture);

            expect(grid.columnList.get(0).width).toEqual('150px');

            const headerResArea = GridFunctions.getHeaderResizeArea(headers[0]).nativeElement;
            await pressResizeArea(fixture, headerResArea, 150, 5);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
            fixture.detectChanges();

            let resizingArgs: IColumnResizeEventArgs = { column: grid.columnList.get(0), prevWidth: '150px', newWidth: '300px' };
            expect(grid.columnList.get(0).width).toEqual('300px');
            expect(resizingSpy).toHaveBeenCalledTimes(1);
            expect(resizingSpy).toHaveBeenCalledWith(resizingArgs);

            expect(grid.columnList.get(1).width).toEqual('150px');

            const resizeArea = GridFunctions.getHeaderResizeArea(headers[1]).nativeElement;
            UIInteractions.simulateMouseEvent('dblclick', resizeArea, 0, 0);
            await nextFrame();
            fixture.detectChanges();

            expect(grid.columnList.get(1).width).toEqual('196px');
            resizingArgs = { column: grid.columnList.get(1), prevWidth: '150', newWidth: '196px' };
            expect(resizingSpy).toHaveBeenCalledTimes(2);
            expect(resizingSpy).toHaveBeenCalledWith(resizingArgs);
        });

        it('should autosize templated column programmatically.', () => {
            const column = grid.getColumnByName('Category');
            expect(column.width).toEqual('150px');

            column.autosize();
            fixture.detectChanges();

            expect(column.width).toEqual('89px');
        });

        it('should ignore header template during autosize if autosizeHeader is false.', () => {
            const column = grid.getColumnByName('ID');
            column.minWidth = '10px';
            column.autosizeHeader = false;
            fixture.detectChanges();

            expect(column.width).toEqual('150px');

            column.autosize();
            fixture.detectChanges();

            expect(column.width).toEqual('56px');
        });
    });

    describe('Multi Column Headers tests: ', () => {
        let fixture: ComponentFixture<any>;
        let grid: IgxGridComponent;

        // The autosized widths depend on the header text and icon fonts (loaded by the demo styles under Karma)
        beforeAll(async () => {
            await loadFonts([
                'https://fonts.googleapis.com/icon?family=Material+Icons',
                'https://fonts.googleapis.com/css?family=Titillium+Web:300,400,600,700'
            ], ['24px "Material Icons"', '14px "Titillium Web"']);
        });

        beforeEach(async () => {
            fixture = TestBed.createComponent(MultiColumnHeadersComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        });

        it('should autosize filterable/sortable/resizable/movable column programmatically.', () => {
            const column = grid.getColumnByName('Missing');
            expect(column.width).toEqual('100px');

            column.autosize();
            fixture.detectChanges();
            // the exact width is different between chrome and chrome headless so an exact match is erroneous
            expect(Math.abs(parseInt(column.width, 10) - 120)).toBeLessThan(2);
        });

        it('should autosize MCHs programmatically.', () => {
            let column = grid.getColumnByName('CompanyName');
            expect(column.width).toEqual('130px');

            column.autosize();
            fixture.detectChanges();
            expect(column.width).toEqual('240px');

            column = grid.getColumnByName('ContactName');
            expect(column.width).toEqual('100px');

            column.autosize();
            fixture.detectChanges();
            expect(column.width).toEqual('149px');

            column = grid.getColumnByName('Region');
            expect(column.width).toEqual('150px');

            column.autosize();
            fixture.detectChanges();
            expect(column.width).toEqual('85px');

            column = grid.getColumnByName('Country');
            expect(column.width).toEqual('90px');

            column.autosize();
            fixture.detectChanges();
            expect(column.width).toEqual('112px');
        });
    });

    describe('Different columns widths tests: ', () => {
        it('should resize columns with initial width of null.', async () => {
            const fixture = TestBed.createComponent(NullColumnsComponent);
            fixture.detectChanges();

            const grid = fixture.componentInstance.grid;
            const headers: DebugElement[] = GridFunctions.getColumnHeaders(fixture);

            expect(parseInt(grid.columnList.get(0).width, 10)).not.toBeNaN();

            let headerResArea = GridFunctions.getHeaderResizeArea(headers[0]).nativeElement;
            await pressResizeArea(fixture, headerResArea, 126, 5);
            fixture.detectChanges();

            let resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 250, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 250, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(0).width).toEqual('200px');

            await pressResizeArea(fixture, headerResArea, 200, 0);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 50, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 50, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(0).width).toEqual(grid.columnList.get(0).minWidth + 'px');

            headerResArea = GridFunctions.getHeaderResizeArea(headers[1]).nativeElement;
            await pressResizeArea(fixture, headerResArea, 197, 5);
            fixture.detectChanges();

            expect(parseInt(grid.columnList.get(1).width, 10)).not.toBeNaN();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
            fixture.detectChanges();

            expect(parseInt(grid.columnList.get(1).width, 10)).toBeGreaterThanOrEqual(100);

            await pressResizeArea(fixture, headerResArea, 300, 5);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 50, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 50, 5);
            fixture.detectChanges();

            expect(grid.columnList.get(1).width).toEqual('80px');
        });

        it('should size headers correctly when column width is below the allowed minimum.', () => {
            const fixture = TestBed.createComponent(ColGridComponent);
            fixture.detectChanges();

            const headers = GridFunctions.getColumnHeaders(fixture);
            const headerGroups = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));
            const filteringCells = GridFunctions.getFilteringCells(fixture);

            expect(headers[0].nativeElement.getBoundingClientRect().width).toBe(49);
            expect(headers[1].nativeElement.getBoundingClientRect().width).toBe(50);
            expect(headers[2].nativeElement.getBoundingClientRect().width).toBe(49);

            expect(filteringCells[0].nativeElement.getBoundingClientRect().width).toBe(49);
            expect(filteringCells[1].nativeElement.getBoundingClientRect().width).toBe(50);
            expect(filteringCells[2].nativeElement.getBoundingClientRect().width).toBe(49);

            expect(headerGroups[0].nativeElement.getBoundingClientRect().width).toBe(49);
            expect(headerGroups[1].nativeElement.getBoundingClientRect().width).toBe(50);
            expect(headerGroups[2].nativeElement.getBoundingClientRect().width).toBe(49);
        });

        it('should size headers correctly when column width is in %.', () => {
            const fixture = TestBed.createComponent(ColPercentageGridComponent);
            fixture.detectChanges();
            const grid = fixture.componentInstance.grid;
            grid.ngAfterViewInit();

            const headers = GridFunctions.getColumnHeaders(fixture);
            const headerGroups = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));
            const filteringCells = GridFunctions.getFilteringCells(fixture);
            const expectedWidth = (parseInt(grid.width, 10) - grid.scrollSize) / 4;
            expect(headers[0].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(headers[1].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(headers[2].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(headers[3].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);

            expect(filteringCells[0].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(filteringCells[1].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(filteringCells[2].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(filteringCells[3].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);

            expect(headerGroups[0].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(headerGroups[1].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(headerGroups[2].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(headerGroups[3].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
        });

        it('should render all columns when all have autosize set initially.', async () => {
            const fixture = TestBed.createComponent(ColAutosizeGridComponent);
            fixture.detectChanges();
            await nextFrame();

            const headers = GridFunctions.getColumnHeaders(fixture);
            const firstRowCells = GridFunctions.getRowCells(fixture, 0);
            expect(headers.length).toEqual(11);
            expect(headers[headers.length - 1].nativeElement.innerText).toEqual("ReleaseDate");
            expect(firstRowCells.length).toEqual(11);
        });

        it('should use user-provided `minWidth` as default min column width to size columns - #16057.', async () => {
            const fixture = TestBed.createComponent(MinWidthColumnsComponent);
            fixture.detectChanges();

            const grid = fixture.componentInstance.grid;

            expect(grid.columnList.get(0).width).toEqual('130px');
            expect(grid.columnList.get(1).width).toEqual('90px');
            expect(grid.columnList.get(2).width).toEqual('90px');
            expect(grid.columnList.get(3).width).toEqual('90px');
        });
    });

    describe('Resizer tests: ', () => {
        let fixture: ComponentFixture<any>;
        let grid: IgxGridComponent;

        beforeEach(async () => {
            fixture = TestBed.createComponent(ResizableColumnsWithToolbarComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        });

        it('should align the resizer top with the grid header top', async () => {
            grid.nativeElement.style.marginTop = '40px';
            fixture.detectChanges();
            const headers = GridFunctions.getColumnHeaders(fixture);
            const headerResArea = GridFunctions.getHeaderResizeArea(headers[0]).nativeElement;

            const headerRectTop = headerResArea.getBoundingClientRect().top;

            await pressResizeArea(fixture, headerResArea, 100, 15);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();

            const resizerRectTop = resizer.getBoundingClientRect().top;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 250, 15);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 250, 15);
            fixture.detectChanges();


            expect(Math.abs(resizerRectTop - headerRectTop)).toBeLessThanOrEqual(1);
        });

        it('should align the resizer top with the grid header top when grid is scaled', async () => {
            grid.nativeElement.style.transform = 'scale(0.6)';
            fixture.detectChanges();

            const headers = GridFunctions.getColumnHeaders(fixture);
            const headerResArea = GridFunctions.getHeaderResizeArea(headers[1]).nativeElement;
            const headerRectTop = headerResArea.getBoundingClientRect().top;

            // Trigger resize to show resizer
            await pressResizeArea(fixture, headerResArea, 153, 0);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();

            const resizerRectTop = resizer.getBoundingClientRect().top;

            UIInteractions.simulateMouseEvent('mouseup', resizer, 200, 5);
            fixture.detectChanges();

            expect(Math.abs(resizerRectTop - headerRectTop)).toBeLessThanOrEqual(1);
        });
    });
});

@Component({
    template: GridTemplateStrings.declareGrid(`width="500px" height="300px"`, ``, ColumnDefinitions.resizableThreeOfFour),
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class ResizableColumnsComponent {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public data = SampleTestData.personIDNameRegionData();
}

@Component({
    template: GridTemplateStrings.declareGrid(`width="500px" height="300px"`, ``, '<igx-grid-toolbar><igx-grid-toolbar-title>Grid Toolbar</igx-grid-toolbar-title></igx-grid-toolbar>' +
        ColumnDefinitions.resizableThreeOfFour),
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent, IgxGridToolbarComponent, IgxGridToolbarTitleComponent]
})
export class ResizableColumnsWithToolbarComponent {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public data = SampleTestData.personIDNameRegionData();
}

@Component({
    template: GridTemplateStrings.declareGrid(`width="618px" height="600px"`, ``, `<igx-column [field]="'Released'" [pinned]="true" width="100px" dataType="boolean" [resizable]="true"></igx-column>
        <igx-column [field]="'ReleaseDate'" [pinned]="true" width="100px" dataType="date" [resizable]="true"
            [formatter]="returnVal"></igx-column>
        <igx-column [field]="'Items'" [pinned]="true" width="100px" dataType="string" [resizable]="true"></igx-column>
        <igx-column [field]="'ID'" [width]="'100px'" [header]="'ID'" [resizable]="true"></igx-column>
        <igx-column [field]="'ProductName'" width="50px" [maxWidth]="'100px'" dataType="string" [resizable]="true"></igx-column>
        <igx-column [field]="'Test'" width="100px" dataType="string" [resizable]="true">
            <ng-template igxCell>
                <div></div>
            </ng-template>
        </igx-column>
        <igx-column [field]="'Downloads'" width="100px" dataType="number" [resizable]="true"></igx-column>
        <igx-column [field]="'Category'" width="100px" dataType="string" [resizable]="true"></igx-column>`),
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent, IgxCellTemplateDirective]
})
export class LargePinnedColGridComponent implements OnInit {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    public data = [];
    public value: any;

    public ngOnInit() {
        this.data = SampleTestData.generateProductData(75);
    }

    public returnVal(value) {
        return value;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(``, ``, ColumnDefinitions.gridFeatures),
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent, IgxCellTemplateDirective, IgxCellHeaderTemplateDirective, IgxAvatarComponent]
})
export class GridFeaturesComponent {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    public data = SampleTestData.productInfoDataFull();
}

@Component({
    template: GridTemplateStrings.declareGrid(`height="800px"`, ``, ColumnDefinitions.resizableColsComponent),
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class NullColumnsComponent implements OnInit {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public data = [];
    public columns = [];

    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', resizable: true, maxWidth: 200, minWidth: 70 },
            { field: 'CompanyName', resizable: true },
            { field: 'ContactName', resizable: true },
            { field: 'ContactTitle', resizable: true },
            { field: 'Address', resizable: true },
            { field: 'City', resizable: true },
            { field: 'Region', resizable: true },
            { field: 'PostalCode', resizable: true },
            { field: 'Phone', resizable: true },
            { field: 'Fax', resizable: true }
        ];

        this.data = SampleTestData.contactInfoData();
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(`width="400px" height="200px"`, ``, `<igx-column [field]="'ID'" [width]="'130px'" [resizable]="true"></igx-column>
        <igx-column [field]="'CompanyName'" [minWidth]="'50px'" [resizable]="true"></igx-column>
        <igx-column [field]="'ContactName'" [minWidth]="'50px'" [resizable]="true"></igx-column>
        <igx-column [field]="'ContactTitle'" [minWidth]="'50px'" [resizable]="true"></igx-column>`),
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class MinWidthColumnsComponent implements OnInit {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public data = [];

    public ngOnInit(): void {
        this.data = SampleTestData.contactInfoData();
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(`width="400px" height="600px" [allowFiltering]="true"`, ``, `<igx-column [field]="'Items'" [width]="'40px'" dataType="string" [filterable]="true"></igx-column>
         <igx-column [field]="'ID'" [width]="'50px'" [header]="'ID'" [filterable]="true"></igx-column>
         <igx-column [field]="'ProductName'" [width]="'30px'" dataType="string" [filterable]="true"></igx-column>
         <igx-column [field]="'Test'" width="300px" dataType="string" [resizable]="true"></igx-column>
         <igx-column [field]="'Downloads'" width="300px" dataType="number" [resizable]="true"></igx-column>
         <igx-column [field]="'Category'" width="300px" dataType="string" [resizable]="true"></igx-column>`),
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class ColGridComponent implements OnInit {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public data = [];

    public ngOnInit() {
        this.data = SampleTestData.generateProductData(10);
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(`width="400px" height="600px" [allowFiltering]="true"`, ``, `<igx-column [field]="'Items'" [width]="'25%'" dataType="string" [filterable]="true" [resizable]="true"></igx-column>
         <igx-column [field]="'ID'" [width]="'25%'" [header]="'ID'" [filterable]="true"></igx-column>
         <igx-column [field]="'ProductName'" [width]="'25%'" dataType="string" [filterable]="true"></igx-column>
         <igx-column [field]="'Test'"[width]="'25%'" dataType="string" [resizable]="true"></igx-column>`),
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class ColPercentageGridComponent implements OnInit {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public data = [];

    public ngOnInit() {
        this.data = SampleTestData.generateProductData(10);
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(`width="1500px" height="600px"`, ``, `<igx-column [field]="'Items'" [width]="'auto'" [dataType]="'string'" [resizable]="true"></igx-column>
    <igx-column [field]="'ID'" [width]="'auto'" [header]="'ID'" [resizable]="true"></igx-column>
    <igx-column [field]="'ProductName'" [width]="'auto'" [dataType]="'string'" [resizable]="true"></igx-column>
    <igx-column [field]="'Test'" [width]="'auto'" [dataType]="'string'" [resizable]="true"></igx-column>
    <igx-column [field]="'Downloads'" [width]="'auto'" [dataType]="'number'" [resizable]="true"></igx-column>
    <igx-column [field]="'Category'" [width]="'auto'" [dataType]="'string'" [resizable]="true"></igx-column>
    <igx-column [field]="'Category'" [width]="'auto'" [dataType]="'string'" [resizable]="true"></igx-column>
    <igx-column [field]="'Category'" [width]="'auto'" [dataType]="'string'" [resizable]="true"></igx-column>
    <igx-column [field]="'Category'" [width]="'auto'" [dataType]="'string'" [resizable]="true"></igx-column>
    <igx-column [field]="'Released'" [width]="'auto'" [dataType]="'string'" [resizable]="true"></igx-column>
    <igx-column [field]="'ReleaseDate'" [width]="'auto'" [dataType]="'string'" [resizable]="true"></igx-column>
    `),
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class ColAutosizeGridComponent implements OnInit {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public data = [];

    public ngOnInit() {
        this.data = SampleTestData.generateProductData(10);
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(`width="800px" height="600px" [allowFiltering]="allowFiltering" [filterMode]="filterMode"`, ``,
        `<igx-column field="ID" header="ID" dataType="number" width="250px" [resizable]="true" [autosizeHeader]="autosizeHeader"></igx-column>
        <igx-column field="Name" header="Full name" width="250px" [sortable]="true" [resizable]="true" [autosizeHeader]="autosizeHeader"></igx-column>
        <igx-column field="LastName" width="250px" [resizable]="true" [autosizeHeader]="autosizeHeader"></igx-column>`) +
        `<ng-template #filterCellTemplate><span class="custom-filter" style="flex: none; width: 180px"></span></ng-template>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class AutosizeFilteringGridComponent {
    @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;
    @ViewChild('filterCellTemplate', { read: TemplateRef, static: true }) public filterCellTemplate: TemplateRef<any>;

    public data = SampleTestData.personIDNameRegionData();
    public allowFiltering = true;
    public autosizeHeader = true;
    public filterMode: FilterMode = FilterMode.quickFilter;
}

async function loadFonts(stylesheets: string[], fonts: string[]): Promise<void> {
    for (const href of stylesheets) {
        if (document.head.querySelector(`link[href="${href}"]`)) {
            continue;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        const loaded = new Promise(resolve => {
            link.onload = resolve;
            link.onerror = resolve;
        });
        document.head.appendChild(link);
        await loaded;
    }
    await Promise.all(fonts.map(font => document.fonts.load(font)));
    await document.fonts.ready;
}
