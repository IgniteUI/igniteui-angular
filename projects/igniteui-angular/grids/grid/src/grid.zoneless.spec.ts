/**
 * Zoneless change-detection regression tests for IgxGrid.
 *
 * Each describe block resets the TestBed and adds provideZonelessChangeDetection()
 * so tests run exactly as a consumer app would when Zone.js CD scheduling is absent.
 *
 * Constraint: after the action under test, fixture.detectChanges() is NOT called.
 * Rendered updates must appear via the Angular zoneless scheduler (markForCheck +
 * PendingTasks) confirmed with fixture.whenStable(), or via observable / event spies.
 *
 * Patterns covered
 * ────────────────
 * 1. Initial render         – grid displays rows on first detectChanges()
 * 2. Async data change      – sort / filter trigger notifyChanges() → markForCheck()
 *                             → zoneless scheduler → ngDoCheck() → detectChanges()
 * 3. Browser callback       – filteringDone emitted from a requestAnimationFrame callback
 * 4. Horizontal scroll      – parentVirtDir.chunkLoad emitted after hScroll event
 *                             (broken: zone.onStable never fires in NoopNgZone)
 * 5. fit-content column API – recalculateAutoSizes() and calculateGridSizes() must
 *                             reach autoSizeColumnsInView() without zone.onStable
 *
 * Patterns NOT covered here (separate PRs)
 * ─────────────────────────────────────────
 * - Pivot grid auto-size (fixed in pivot-grid.component.ts but no test added here)
 * - IgxForOfDirective/IgxGridForOfDirective zone.onStable fixes — covered by vkombov/fix-17280
 * - IntersectionObserver zone.run fix in grid-base.directive.ts — covered by vkombov/fix-17280
 * - Row editing overlay position (zone.onStable in RowEditPositionStrategy)
 * - cachedViewLoaded() virt-state restoration after view recycling during H-scroll
 */

import { Component, ViewChild, provideZonelessChangeDetection } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { SortingDirection, IgxStringFilteringOperand } from 'igniteui-angular/core';
import { IgxGridComponent } from './grid.component';
import { IgxColumnComponent } from 'igniteui-angular/grids/core';
import { SampleTestData } from '../../../test-utils/sample-test-data.spec';

// ─── Reusable test host components ──────────────────────────────────────────

/** Simple grid with ID / Name / LastName columns; data from personIDNameRegionData (7 rows). */
@Component({
    template: `
        <igx-grid #grid [data]="data" [height]="'400px'" [width]="'600px'">
            <igx-column field="ID" dataType="number" [sortable]="true"></igx-column>
            <igx-column field="Name" dataType="string" [sortable]="true" [filterable]="true"></igx-column>
            <igx-column field="LastName" dataType="string"></igx-column>
        </igx-grid>
    `,
    standalone: true,
    imports: [IgxGridComponent, IgxColumnComponent]
})
class ZonelessSimpleGridComponent {
    @ViewChild('grid', { static: true }) public grid: IgxGridComponent;
    public data = SampleTestData.personIDNameRegionData();
}

/**
 * Wide grid (5 × 200 px columns in a 400 px container) that forces horizontal
 * virtualization so we can verify parentVirtDir.chunkLoad after scrolling.
 */
@Component({
    template: `
        <igx-grid #grid [data]="data" [height]="'400px'" [width]="'400px'">
            <igx-column field="col0" dataType="number" [width]="'200px'"></igx-column>
            <igx-column field="col1" dataType="number" [width]="'200px'"></igx-column>
            <igx-column field="col2" dataType="number" [width]="'200px'"></igx-column>
            <igx-column field="col3" dataType="number" [width]="'200px'"></igx-column>
            <igx-column field="col4" dataType="number" [width]="'200px'"></igx-column>
        </igx-grid>
    `,
    standalone: true,
    imports: [IgxGridComponent, IgxColumnComponent]
})
class ZonelessWideGridComponent {
    @ViewChild('grid', { static: true }) public grid: IgxGridComponent;
    public data = Array.from({ length: 5 }, (_, i) => ({
        col0: i, col1: i * 2, col2: i * 3, col3: i * 4, col4: i * 5
    }));
}

/**
 * Grid with fit-content columns so hasColumnsToAutosize is true.
 * Used to exercise recalculateAutoSizes() and calculateGridSizes() autosize paths.
 */
@Component({
    template: `
        <igx-grid #grid [data]="data" [height]="'400px'" [width]="'600px'">
            <igx-column field="ID" dataType="number" [width]="'fit-content'"></igx-column>
            <igx-column field="Name" dataType="string" [width]="'fit-content'"></igx-column>
            <igx-column field="LastName" dataType="string" [width]="'fit-content'"></igx-column>
        </igx-grid>
    `,
    standalone: true,
    imports: [IgxGridComponent, IgxColumnComponent]
})
class ZonelessAutoSizeGridComponent {
    @ViewChild('grid', { static: true }) public grid: IgxGridComponent;
    public data = SampleTestData.personIDNameRegionData();
}

// ─── Test suite ─────────────────────────────────────────────────────────────

describe('IgxGrid - Zoneless Change Detection #grid', () => {

    // ── Pattern 1 & 2: initial render + async data changes ──────────────────

    describe('Basic rendering and async data changes', () => {
        beforeEach(async () => {
            TestBed.resetTestingModule();
            await TestBed.configureTestingModule({
                imports: [NoopAnimationsModule, ZonelessSimpleGridComponent],
                providers: [provideZonelessChangeDetection()]
            }).compileComponents();
        });

        it('should render data rows on initial detectChanges()', async () => {
            const fix = TestBed.createComponent(ZonelessSimpleGridComponent);
            fix.detectChanges();
            await fix.whenStable();

            const rows = fix.debugElement.queryAll(By.css('igx-grid-row'));
            expect(rows.length).toBe(7, 'expected all 7 data rows to be rendered');
        });

        it('should update row order after sort() without calling detectChanges() again', async () => {
            const fix = TestBed.createComponent(ZonelessSimpleGridComponent);
            fix.detectChanges();
            await fix.whenStable();
            const grid = fix.componentInstance.grid;

            // personIDNameRegionData has IDs [2,1,6,7,5,4,3]; ascending sort → 1 first
            grid.sort({ fieldName: 'ID', dir: SortingDirection.Asc, ignoreCase: false });
            // No fixture.detectChanges() here — the zoneless scheduler must run it
            await fix.whenStable();

            const firstRowCells = fix.debugElement
                .query(By.css('igx-grid-row'))
                .queryAll(By.css('igx-grid-cell'));
            expect(firstRowCells[0].nativeElement.textContent.trim()).toBe('1');
        });

        it('should update row order after sort() desc without calling detectChanges() again', async () => {
            const fix = TestBed.createComponent(ZonelessSimpleGridComponent);
            fix.detectChanges();
            await fix.whenStable();
            const grid = fix.componentInstance.grid;

            grid.sort({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false });
            await fix.whenStable();

            const firstRowCells = fix.debugElement
                .query(By.css('igx-grid-row'))
                .queryAll(By.css('igx-grid-cell'));
            // highest ID is 7
            expect(firstRowCells[0].nativeElement.textContent.trim()).toBe('7');
        });

        it('should reduce visible rows after filter() without calling detectChanges() again', async () => {
            const fix = TestBed.createComponent(ZonelessSimpleGridComponent);
            fix.detectChanges();
            await fix.whenStable();
            const grid = fix.componentInstance.grid;

            // personIDNameRegionData has 2 rows named "Rick"
            grid.filter('Name', 'Rick', IgxStringFilteringOperand.instance().condition('equals'));
            await fix.whenStable();

            const rows = fix.debugElement.queryAll(By.css('igx-grid-row'));
            expect(rows.length).toBe(2, 'expected exactly 2 "Rick" rows after filter');
        });

        it('should restore full row count after clearFilter() without calling detectChanges() again', async () => {
            const fix = TestBed.createComponent(ZonelessSimpleGridComponent);
            fix.detectChanges();
            await fix.whenStable();
            const grid = fix.componentInstance.grid;

            grid.filter('Name', 'Rick', IgxStringFilteringOperand.instance().condition('equals'));
            await fix.whenStable();

            grid.clearFilter('Name');
            await fix.whenStable();

            const rows = fix.debugElement.queryAll(By.css('igx-grid-row'));
            expect(rows.length).toBe(7, 'expected all rows restored after clearFilter');
        });
    });

    // ── Pattern 3: browser callback (requestAnimationFrame) ─────────────────

    describe('filteringDone event (requestAnimationFrame callback)', () => {
        beforeEach(async () => {
            TestBed.resetTestingModule();
            await TestBed.configureTestingModule({
                imports: [NoopAnimationsModule, ZonelessSimpleGridComponent],
                providers: [provideZonelessChangeDetection()]
            }).compileComponents();
        });

        it('should emit filteringDone after filter() in zoneless mode', fakeAsync(() => {
            const fix = TestBed.createComponent(ZonelessSimpleGridComponent);
            fix.detectChanges();
            tick(16);

            const grid = fix.componentInstance.grid;
            const emittedArgs: any[] = [];
            grid.filteringDone.subscribe(args => emittedArgs.push(args));

            grid.filter('Name', 'Rick', IgxStringFilteringOperand.instance().condition('equals'));
            // requestAnimationFrame is treated as a macrotask in fakeAsync; tick flushes it
            tick(16);

            expect(emittedArgs.length).toBe(1, 'filteringDone must emit exactly once');
            expect(emittedArgs[0]).toBeTruthy();
        }));

        it('should emit filteringDone after clearFilter() in zoneless mode', fakeAsync(() => {
            const fix = TestBed.createComponent(ZonelessSimpleGridComponent);
            fix.detectChanges();
            tick(16);

            const grid = fix.componentInstance.grid;
            grid.filter('Name', 'Rick', IgxStringFilteringOperand.instance().condition('equals'));
            tick(16);

            const emittedArgs: any[] = [];
            grid.filteringDone.subscribe(args => emittedArgs.push(args));

            grid.clearFilter('Name');
            tick(16);

            expect(emittedArgs.length).toBe(1, 'filteringDone must emit after clearFilter');
        }));
    });

    // ── Pattern 4: horizontal-scroll chunkLoad (zone.onStable issue) ────────

    describe('Horizontal scroll – parentVirtDir.chunkLoad emission', () => {
        beforeEach(async () => {
            TestBed.resetTestingModule();
            await TestBed.configureTestingModule({
                imports: [NoopAnimationsModule, ZonelessWideGridComponent],
                providers: [provideZonelessChangeDetection()]
            }).compileComponents();
        });

        /**
         * Regression: in NoopNgZone (zoneless), zone.onStable never emits.
         * horizontalScrollHandler() gated parentVirtDir.chunkLoad.emit() behind
         * zone.onStable.pipe(first()).subscribe(), so the event was never raised
         * after a horizontal scroll in a zoneless consumer app.
         *
         * Fix: apply the same isZonelessChangeDetection() guard used in
         * verticalScrollHandler() and call emit() directly.
         */
        it('should emit parentVirtDir.chunkLoad after horizontal scroll in zoneless mode', fakeAsync(() => {
            const fix = TestBed.createComponent(ZonelessWideGridComponent);
            fix.detectChanges();
            tick(16);

            const grid = fix.componentInstance.grid;
            const chunkLoadSpy = jasmine.createSpy('parentVirtDir.chunkLoad');
            grid.parentVirtDir.chunkLoad.subscribe(chunkLoadSpy);

            // Trigger the horizontal scroll handler the same way the real scroller does
            const hScroller = grid.headerContainer.getScroll();
            hScroller.scrollLeft = 300;
            hScroller.dispatchEvent(new Event('scroll'));
            tick(100);

            expect(chunkLoadSpy).toHaveBeenCalled();
        }));

        it('should render updated column data after horizontal scroll in zoneless mode', fakeAsync(() => {
            const fix = TestBed.createComponent(ZonelessWideGridComponent);
            fix.detectChanges();
            tick(16);

            const grid = fix.componentInstance.grid;

            // Wait for chunkLoad as the reliable signal that virtualization has settled
            let chunkLoaded = false;
            grid.parentVirtDir.chunkLoad.subscribe(() => { chunkLoaded = true; });

            const hScroller = grid.headerContainer.getScroll();
            hScroller.scrollLeft = 400;
            hScroller.dispatchEvent(new Event('scroll'));
            tick(100);

            expect(chunkLoaded).toBe(true, 'chunkLoad must emit so the grid knows columns shifted');
        }));
    });

    // ── Pattern 5: fit-content column auto-sizing ────────────────────────────

    describe('fit-content column auto-sizing', () => {
        beforeEach(async () => {
            TestBed.resetTestingModule();
            await TestBed.configureTestingModule({
                imports: [NoopAnimationsModule, ZonelessAutoSizeGridComponent],
                providers: [provideZonelessChangeDetection()]
            }).compileComponents();
        });

        /**
         * Regression: recalculateAutoSizes() first resets col.autoSize to undefined,
         * then gates the re-measurement behind zone.onStable.pipe(first()).subscribe().
         * In NoopNgZone that subscription never fires, so the method silently does nothing.
         *
         * Fix: detect zoneless with isZonelessChangeDetection() and call
         * cdr.detectChanges() + autoSizeColumnsInView() directly.
         *
         * Note on hasColumnsToAutosize: after the initial render ChromeHeadless measures
         * real header widths > 0, so col.autoSize becomes a number and col.width returns
         * "Npx", making hasColumnsToAutosize false.  recalculateAutoSizes() itself resets
         * col.autoSize to undefined before calling the measurement — we only need to verify
         * that the measurement is actually invoked, so we spy on the protected method.
         */
        it('recalculateAutoSizes() should call autoSizeColumnsInView() in zoneless mode', fakeAsync(() => {
            const fix = TestBed.createComponent(ZonelessAutoSizeGridComponent);
            fix.detectChanges();
            tick(16);

            const grid = fix.componentInstance.grid;
            const spy = spyOn(grid as any, 'autoSizeColumnsInView').and.callThrough();

            grid.recalculateAutoSizes();
            tick(16);

            expect(spy).toHaveBeenCalled();
        }));

        /**
         * Regression: _zoneBegoneListeners() subscribes to headerContainer.dataChanged and
         * gates autoSizeColumnsInView() behind zone.onStable.pipe(first()).subscribe().
         * In NoopNgZone that subscription never fires, so columns are never re-measured
         * when the header virtual scroll data changes (column visibility toggle, H-scroll).
         *
         * Fix: detect zoneless with isZonelessChangeDetection() and call
         * autoSizeColumnsInView() directly after detectChanges().
         *
         * Setup: hide then show a column, which causes headerContainer.dataChanged to emit.
         * The spy is placed between the two visibility changes so only the "show" emission
         * is captured.
         */
        it('toggling a fit-content column visible should call autoSizeColumnsInView() via dataChanged in zoneless mode', fakeAsync(() => {
            const fix = TestBed.createComponent(ZonelessAutoSizeGridComponent);
            fix.detectChanges();
            tick(16);

            const grid = fix.componentInstance.grid;
            const col = grid.getColumnByName('LastName');
            col.hidden = true;
            fix.detectChanges();
            tick(16);

            const spy = spyOn(grid as any, 'autoSizeColumnsInView').and.callThrough();

            // Making the column visible emits headerContainer.dataChanged which must reach
            // autoSizeColumnsInView() without zone.onStable in between.
            col.hidden = false;
            tick(16);

            expect(spy).toHaveBeenCalled();
        }));
    });
});
