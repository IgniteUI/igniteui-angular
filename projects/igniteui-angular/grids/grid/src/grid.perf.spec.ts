// Timing-budget tests, kept out of the main run (they fail on a loaded machine and slow every run).
// Run them alone with `npm run test:lib:perf`.
import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxColumnComponent } from 'igniteui-angular/grids/core';
import { ISortingExpression, SortingDirection } from 'igniteui-angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IgxGridComponent } from './grid.component';
import { UIInteractions } from '../../../test-utils/ui-interactions.spec';

describe('IgxGrid Component Tests #grid', () => {
    describe('IgxGrid - Performance tests #perf', () => {
        const MAX_RAW_RENDER = 1967; // two average diffs from 7.3 rendering performance
        const MAX_GROUPED_RENDER = 1500;
        // The scroll/focus budgets are measured from the user action until the DOM shows the expected result.
        // They are deliberately generous (a healthy run takes a few frames) so that a loaded CI machine does not
        // cause false failures, while a real regression (e.g. re-rendering the whole 10k x 30 grid) still fails.
        const MAX_SCROLL = 1500;
        const MAX_FOCUS = 1000;
        // Scrolling by up to this many rows/columns re-uses (moves) the rendered views ("optimized delta"),
        // anything above it re-binds all of them ("unoptimized delta"). Mirrors MAX_PERF_SCROLL_DIFF in igxFor.
        const MAX_PERF_SCROLL_DIFF = 4;
        const COLUMN_WIDTH = 100;

        const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

        /** Runs the action and resolves with the elapsed ms once `done` stops throwing. */
        const measure = async (action: () => void, done: () => void): Promise<number> => {
            const start = performance.now();
            action();
            await vi.waitFor(done, { timeout: 5000, interval: 5 });
            return performance.now() - start;
        };

        const createGrid = async () => {
            const fix = TestBed.createComponent(IgxGridPerformanceComponent);
            // Render like an application does - changes scheduled by the grid are picked up automatically
            // instead of being flushed manually by the test, so the measured time includes the real render.
            fix.autoDetectChanges(true);
            fix.detectChanges();
            await fix.whenStable();
            await nextFrame();
            // The grid initially renders with the default row height and re-renders once it picks up
            // the --ig-size of its host (resize observer), so wait for the rows to match the row height.
            const grid = fix.componentInstance.grid;
            await vi.waitFor(() => {
                const row = grid.tbody.nativeElement.querySelector('igx-grid-row');
                expect(grid.renderedRowHeight).toBe(Math.round(row.getBoundingClientRect().height));
                expect(grid.verticalScrollContainer.getScrollForIndex(1)).toBe(grid.renderedRowHeight);
            }, { timeout: 5000, interval: 16 });
            await fix.whenStable();
            await nextFrame();
            return fix;
        };

        /** The data rows in DOM order (the order in which they are displayed). */
        const getDisplayedRows = (grid: IgxGridComponent): HTMLElement[] =>
            Array.from(grid.tbody.nativeElement.querySelectorAll('igx-grid-row'));

        /** The unpinned data cells of a row in DOM order. */
        const getDisplayedCells = (row: HTMLElement): HTMLElement[] =>
            Array.from(row.querySelectorAll('igx-grid-cell'));

        const verifyVerticalScroll = (grid: IgxGridComponent, expectedStart: number) => {
            expect(grid.verticalScrollContainer.state.startIndex).toBe(expectedStart);
            const rows = getDisplayedRows(grid).slice(0, 4);
            expect(rows.length).toBe(4);
            // 'field0' holds the record index
            rows.forEach((row, i) => expect(getDisplayedCells(row)[0].textContent.trim()).toBe(String(expectedStart + i)));
        };

        const verifyHorizontalScroll = (grid: IgxGridComponent, expectedStart: number) => {
            expect(grid.headerContainer.state.startIndex).toBe(expectedStart);
            const rows = getDisplayedRows(grid);
            // 'field0' holds the record index, while 'fieldN' (N > 0) holds N for every record
            [rows[0], rows.at(-1)].forEach(row => {
                const rowIndex = Number(row.getAttribute('data-rowindex'));
                const cells = getDisplayedCells(row).slice(0, 3);
                expect(cells.length).toBe(3);
                cells.forEach((cell, i) => {
                    const colIndex = expectedStart + i;
                    expect(cell.textContent.trim()).toBe(String(colIndex === 0 ? rowIndex : colIndex));
                });
            });
        };

        /** Scroll position that puts the middle of the record with the given index at the top of the view. */
        const getScrollTopForRow = (grid: IgxGridComponent, index: number) => {
            const vsc = grid.verticalScrollContainer;
            const top = vsc.getScrollForIndex(index);
            return top + (vsc.getScrollForIndex(index + 1) - top) / 2;
        };

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxGridPerformanceComponent
                ]
            }).compileComponents();
        });

        it('should render the grid in a certain amount of time', async () => {
            const fix = TestBed.createComponent(IgxGridPerformanceComponent);
            fix.detectChanges();
            expect(fix.componentInstance.delta, 'Rendering took: ' + fix.componentInstance.delta +
                'ms but should have taken at most: ' + MAX_RAW_RENDER + 'ms').toBeLessThan(MAX_RAW_RENDER);
        });

        it('should render grouped grid in a certain amount of time', async () => {
            const fix = TestBed.createComponent(IgxGridPerformanceComponent);
            fix.componentInstance.groupingExpressions.push({
                fieldName: 'field0',
                dir: SortingDirection.Asc
            });
            fix.detectChanges();
            expect(fix.componentInstance.delta, 'Rendering took: ' + fix.componentInstance.delta +
                'ms but should have taken at most: ' + MAX_GROUPED_RENDER + 'ms').toBeLessThan(MAX_GROUPED_RENDER);
        });

        it('should scroll (optimized delta) the grid vertically in a certain amount of time', async () => {
            const fix = await createGrid();
            const grid = fix.componentInstance.grid;
            verifyVerticalScroll(grid, 0);

            const expectedStart = 3;
            const scrollTop = getScrollTopForRow(grid, expectedStart);
            expect(expectedStart).toBeLessThanOrEqual(MAX_PERF_SCROLL_DIFF);

            const delta = await measure(
                () => fix.componentInstance.verticalScroll.scrollTop = scrollTop,
                () => verifyVerticalScroll(grid, expectedStart)
            );
            expect(delta, `Scrolling took: ${delta}ms but should have taken at most: ${MAX_SCROLL}ms`).toBeLessThan(MAX_SCROLL);
        });

        it('should scroll (unoptimized delta) the grid vertically in a certain amount of time', async () => {
            const fix = await createGrid();
            const grid = fix.componentInstance.grid;
            verifyVerticalScroll(grid, 0);

            const expectedStart = 25;
            const scrollTop = getScrollTopForRow(grid, expectedStart);
            expect(expectedStart).toBeGreaterThan(MAX_PERF_SCROLL_DIFF);

            const delta = await measure(
                () => fix.componentInstance.verticalScroll.scrollTop = scrollTop,
                () => verifyVerticalScroll(grid, expectedStart)
            );
            expect(delta, `Scrolling took: ${delta}ms but should have taken at most: ${MAX_SCROLL}ms`).toBeLessThan(MAX_SCROLL);
        });

        it('should scroll (optimized delta) the grid horizontally in a certain amount of time', async () => {
            const fix = await createGrid();
            const grid = fix.componentInstance.grid;
            verifyHorizontalScroll(grid, 0);

            const expectedStart = 2;
            expect(expectedStart).toBeLessThanOrEqual(MAX_PERF_SCROLL_DIFF);

            const delta = await measure(
                () => fix.componentInstance.horizontalScroll.scrollLeft = expectedStart * COLUMN_WIDTH + COLUMN_WIDTH / 2,
                () => verifyHorizontalScroll(grid, expectedStart)
            );
            expect(delta, `Scrolling took: ${delta}ms but should have taken at most: ${MAX_SCROLL}ms`).toBeLessThan(MAX_SCROLL);
        });

        it('should scroll (unoptimized delta) the grid horizontally in a certain amount of time', async () => {
            const fix = await createGrid();
            const grid = fix.componentInstance.grid;
            verifyHorizontalScroll(grid, 0);

            const expectedStart = 8;
            expect(expectedStart).toBeGreaterThan(MAX_PERF_SCROLL_DIFF);

            const delta = await measure(
                () => fix.componentInstance.horizontalScroll.scrollLeft = expectedStart * COLUMN_WIDTH + COLUMN_WIDTH / 2,
                () => verifyHorizontalScroll(grid, expectedStart)
            );
            expect(delta, `Scrolling took: ${delta}ms but should have taken at most: ${MAX_SCROLL}ms`).toBeLessThan(MAX_SCROLL);
        });

        it('should focus a cell in a certain amount of time', async () => {
            const fix = await createGrid();
            const grid = fix.componentInstance.grid;
            const cell = grid.gridAPI.get_cell_by_index(2, 'field3');
            const cellElement: HTMLElement = cell.nativeElement;
            expect(cellElement.getAttribute('aria-selected')).toBe('false');
            expect(grid.selectedCells.length).toBe(0);

            const delta = await measure(
                () => UIInteractions.simulateClickAndSelectEvent(cellElement),
                () => {
                    expect(cellElement.getAttribute('aria-selected')).toBe('true');
                    expect(cellElement.classList.contains('igx-grid__td--active')).toBe(true);
                }
            );
            expect(delta, `Focusing took: ${delta}ms but should have taken at most: ${MAX_FOCUS}ms`).toBeLessThan(MAX_FOCUS);

            expect(grid.navigation.activeNode.row).toBe(2);
            expect(grid.navigation.activeNode.column).toBe(3);
            expect(grid.selectedCells.length).toBe(1);
            expect(grid.selectedCells[0].row.index).toBe(2);
            expect(grid.selectedCells[0].column.field).toBe('field3');
            // only one cell is marked as active/selected in the DOM
            expect(grid.tbody.nativeElement.querySelectorAll('.igx-grid__td--active').length).toBe(1);
            expect(grid.tbody.nativeElement.querySelectorAll('[aria-selected="true"]').length).toBe(1);
        });
    });
});

@Component({
    template: `<igx-grid #grid [width]="'2000px'" [height]="'2000px'" [data]="data"
        [autoGenerate]="autoGenerate" [style.--ig-size]="1" [groupingExpressions]="groupingExpressions">
        @for (column of columns; track column.field) {
            <igx-column [field]="column.field" [header]="column.field" [width]="column.width"></igx-column>
        }
    </igx-grid>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class IgxGridPerformanceComponent implements AfterViewInit, OnInit {

    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    public columns = [];
    public data = [];
    public startTime;
    public delta;
    public groupingExpressions: Array<ISortingExpression> = [];
    public autoGenerate = false;

    public get verticalScroll() {
        return this.grid.verticalScrollContainer.getScroll();
    }

    public get horizontalScroll() {
        return this.grid.headerContainer.getScroll();
    }

    public ngOnInit() {
        const cols = [];
        const d = [];
        for (let i = 0; i < 30; i++) {
            cols.push({ field: 'field' + i, width: '100px', hasSummary: false });
        }
        for (let i = 0; i < 10000; i++) {
            const r = {};
            r['field0'] = i;
            for (let j = 1; j < 30; j++) {
                r['field' + j] = j;
            }
            d.push(r);
        }
        this.columns = cols;
        this.data = d;
        this.startTime = new Date().getTime();
    }

    public ngAfterViewInit() {
        this.delta = new Date().getTime() - this.startTime;
    }
}
