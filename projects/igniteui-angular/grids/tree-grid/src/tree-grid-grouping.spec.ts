import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { clearGridSubs, setupGridScrollDetection } from '../../../test-utils/helper-utils.spec';
import { IgxTreeGridGroupByAreaTestComponent, IgxTreeGridGroupingComponent } from '../../../test-utils/tree-grid-components.spec';
import { IgxGroupedTreeGridSorting, IgxTreeGridGroupByAreaComponent } from 'igniteui-angular/grids/tree-grid';
import { TreeGridFunctions } from '../../../test-utils/tree-grid-functions.spec';
import { IgxTreeGridComponent } from './tree-grid.component';
import { DefaultSortingStrategy, SortingDirection } from 'igniteui-angular/core';
import { GridFunctions } from '../../../test-utils/grid-functions.spec';
import { wait } from '../../../test-utils/ui-interactions.spec';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('IgxTreeGrid - Grouping #tGrid', () => {

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxTreeGridGroupingComponent,
                IgxTreeGridGroupByAreaTestComponent
            ]
        }).compileComponents();
    });

    let fix;
    let treeGrid: IgxTreeGridComponent;
    let groupByArea: IgxTreeGridGroupByAreaComponent;

    const DROP_AREA_MSG = 'Drag a column header and drop it here to group by that column.';
    describe(' GroupByArea Standalone', () => {

        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridGroupByAreaTestComponent);
            fix.detectChanges();

            groupByArea = fix.componentInstance.groupByArea;
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('loads successfully', async () => {
            const groupByAreaElement = fix.debugElement.nativeElement.querySelector('igx-tree-grid-group-by-area');
            const chipsAreaElement = groupByAreaElement.querySelector('igx-chips-area');

            expect(groupByAreaElement).toBeDefined();
            expect(chipsAreaElement.children.length).toEqual(1);

            const dropAreaElement = chipsAreaElement.children[0];
            expect(dropAreaElement.children.length).toEqual(2);

            const iconElement = dropAreaElement.querySelector('igx-icon');
            expect(iconElement).toBeDefined();
            expect(iconElement.innerText).toEqual('group_work');

            const spanElement = dropAreaElement.querySelector('span');
            expect(spanElement).toBeDefined();
            expect(spanElement.innerText).toEqual(DROP_AREA_MSG);
        });

        it('has the expected default properties\' values', async () => {
            expect(groupByArea).toBeDefined();
            expect(groupByArea.grid).toEqual(treeGrid);
            expect(groupByArea.expressions).toEqual([]);
            expect(groupByArea.hideGroupedColumns).toBe(false);
            expect(groupByArea.dropAreaMessage).toMatch(DROP_AREA_MSG);
            expect(groupByArea.dropAreaTemplate).toBeUndefined();
            expect(groupByArea.dropAreaVisible).toBe(true);
        });

        it('allows changing the drop area message', async () => {
            const dropMsg = 'New drop message';
            groupByArea.dropAreaMessage = dropMsg;
            fix.detectChanges();
            await fix.whenStable();

            expect(groupByArea.dropAreaMessage).toEqual(dropMsg);
            expect(fix.debugElement.nativeElement.querySelector('.igx-drop-area__text').innerText).toEqual(dropMsg);
        });

        it('allows setting the `hideGroupedColumns` property', async () => {
            groupByArea.hideGroupedColumns = true;
            fix.detectChanges();
            await fix.whenStable();

            expect(groupByArea.hideGroupedColumns).toBe(true);
        });
    });

    describe('', () => {
        let groupingExpressions;
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridGroupingComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            groupByArea = fix.componentInstance.groupByArea;
            groupingExpressions = fix.componentInstance.groupingExpressions;
            setupGridScrollDetection(fix, treeGrid);
        });

        afterEach(() => {
            clearGridSubs();
        });

        it('GroupByArea has the expected properties\' values set', async () => {
            expect(groupByArea).toBeDefined();
            expect(groupByArea.expressions.length).toEqual(2);
            expect(groupByArea.grid).toEqual(treeGrid);
            expect(groupByArea.hideGroupedColumns).toBe(false);
            expect(groupByArea.dropAreaMessage).toMatch(DROP_AREA_MSG);
            expect(groupByArea.dropAreaTemplate).toBeUndefined();
            expect(groupByArea.dropAreaVisible).toBe(false);
        });

        it('is loaded grouped by two fields.', async () => {
            const groupArea = fix.debugElement.nativeElement.querySelector('igx-tree-grid-group-by-area');
            expect(groupArea).toBeDefined();
            const chips = fix.debugElement.nativeElement.querySelectorAll('igx-chip');
            expect(chips.length).toBe(2);

            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(2);

            treeGrid.expandAll();
            fix.detectChanges();
            await fix.whenStable();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(treeGrid.rowList.length);
        });

        it('shows a new group chip when adding a grouping expression', async () => {
            expect(groupByArea.expressions).toEqual(groupingExpressions);
            let chips = getChips(fix);

            expect(chips.length).toEqual(2);
            expect(chips[0].id).toEqual('OnPTO');
            expect(chips[1].id).toEqual('HireDate');

            groupingExpressions.push({ fieldName: 'JobTitle', dir: 2, ignoreCase: true, strategy: DefaultSortingStrategy.instance() });
            fix.detectChanges();
            await fix.whenStable();

            chips = getChips(fix);
            expect(chips.length).toEqual(3);
            expect(chips[2].id).toEqual('JobTitle');
        });

        it('removes a group chip when removing a grouping expression', async () => {
            groupingExpressions.pop();
            fix.detectChanges();

            expect(groupByArea.expressions.length).toEqual(1);
            expect(getChips(fix).length).toEqual(1);
            expect(getChips(fix)[0].id).toEqual('OnPTO');
        });

        it('group columns stay visible by default', async () => {
            expect(treeGrid.getColumnByName('OnPTO').hidden).toBe(false);
            expect(treeGrid.getColumnByName('HireDate').hidden).toBe(false);

        });

        it('keeps the group columns visible by default', async () => {
            expect(treeGrid.getColumnByName('HireDate').hidden).toBe(false);

            groupingExpressions.pop();
            groupByArea.expressions = [...groupingExpressions];
            fix.detectChanges();
            await fix.whenStable();

            expect(treeGrid.getColumnByName('HireDate').hidden).toBe(false);
        });

        it('hides/shows the grouped by column when hideGroupedColumns=true', async () => {
            groupByArea.hideGroupedColumns = true;
            fix.detectChanges();

            expect(treeGrid.getColumnByName('HireDate').hidden).toBe(true);

            groupingExpressions.pop();
            groupByArea.expressions = [...groupingExpressions];
            fix.detectChanges();
            await fix.whenStable();

            expect(treeGrid.getColumnByName('HireDate').hidden).toBe(false);

            groupingExpressions.push({ fieldName: 'JobTitle', dir: 2, ignoreCase: true, strategy: DefaultSortingStrategy.instance() });
            groupByArea.expressions = [...groupingExpressions];
            fix.detectChanges();
            await fix.whenStable();

            expect(treeGrid.getColumnByName('JobTitle').hidden).toBe(true);
        });

        it('shows aggregated values in parent records properly', async () => {
            expect(treeGrid.getCellByColumn(0, 'HireDate').value).toBeUndefined();
            expect(treeGrid.getCellByColumn(1, 'HireDate').value).toBeUndefined();

            const aggregations = [{
                field: 'HireDate',
                aggregate: (_parent: any, children: any[]) => children.map((c) => c.HireDate)
                    .reduce((min, c) => min < c ? min : c, new Date())
            }];

            fix.componentInstance.aggregations = aggregations;
            fix.detectChanges();
            await fix.whenStable();

            expect(treeGrid.rowList.length).toEqual(2);
            expect(treeGrid.getCellByColumn(0, 'HireDate').value).toEqual(new Date(2009, 6, 19));
            expect(treeGrid.getCellByColumn(1, 'HireDate').value).toEqual(new Date(2007, 11, 18));
        });

        it('sorts the group records by their grouped value when using IgxGroupedTreeGridSorting', async () => {
            const groupKey = fix.componentInstance.groupKey;
            expect(treeGrid.getRowByIndex(0).data[groupKey]).toMatch(/^false/);
            expect(treeGrid.getRowByIndex(1).data[groupKey]).toMatch(/^true/);

            // Sorting by a grouped field also updates the direction of its grouping expression.
            // The default strategy cannot resolve the grouped value of the group records, so they are not reordered.
            treeGrid.sort({ fieldName: 'OnPTO', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();
            await fix.whenStable();
            expect(groupByArea.expressions[0].dir).toBe(SortingDirection.Desc);
            expect(treeGrid.getRowByIndex(0).data[groupKey]).toMatch(/^false/);

            expect(IgxGroupedTreeGridSorting.instance()).toBe(IgxGroupedTreeGridSorting.instance());
            treeGrid.clearSort();
            treeGrid.sortStrategy = IgxGroupedTreeGridSorting.instance();
            treeGrid.sort({ fieldName: 'OnPTO', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();
            await fix.whenStable();

            expect(treeGrid.getRowByIndex(0).data[groupKey]).toMatch(/^true/);
            expect(treeGrid.getRowByIndex(1).data[groupKey]).toMatch(/^false/);

            treeGrid.sort({ fieldName: 'OnPTO', dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();
            await fix.whenStable();

            expect(treeGrid.getRowByIndex(0).data[groupKey]).toMatch(/^false/);
            expect(treeGrid.getRowByIndex(1).data[groupKey]).toMatch(/^true/);
        });

        it('handleReorder with a KeyboardEvent sets expressions to the reordered result', async () => {
            expect(groupByArea.expressions.length).toEqual(2);
            vi.spyOn(groupByArea.expressionsChange, 'emit');

            // Pass an empty chipsArray to keep the test simple (columns are not groupable by default,
            // so getReorderedExpressions always returns [] regardless of chipsArray contents)
            groupByArea.handleReorder({ chipsArray: [] as any, originalEvent: new KeyboardEvent('keydown'), owner: null });
            fix.detectChanges();
            await fix.whenStable();

            // When originalEvent is a KeyboardEvent, expressions is assigned the new (empty) expressions
            expect(groupByArea.expressionsChange.emit).toHaveBeenCalled();
            expect(groupByArea.expressions.length).toEqual(0);
        });

        it('handleReorder with a non-keyboard event only updates chipExpressions, not expressions', async () => {
            expect(groupByArea.expressions.length).toEqual(2);
            vi.spyOn(groupByArea.expressionsChange, 'emit');

            groupByArea.handleReorder({ chipsArray: [] as any, originalEvent: new MouseEvent('mouseup'), owner: null });
            fix.detectChanges();
            await fix.whenStable();

            // Without a KeyboardEvent, only chipExpressions is updated — expressions stays unchanged
            expect(groupByArea.expressionsChange.emit).not.toHaveBeenCalled();
            expect(groupByArea.expressions.length).toEqual(2);
            expect(groupByArea.chipExpressions.length).toEqual(0);
        });

        it('handleMoveEnd sets expressions to chipExpressions', async () => {
            const newExprs = [{ fieldName: 'OnPTO', dir: 1, ignoreCase: true, strategy: DefaultSortingStrategy.instance() }];
            groupByArea.chipExpressions = newExprs;

            groupByArea.handleMoveEnd();
            fix.detectChanges();
            await fix.whenStable();

            expect(groupByArea.expressions.length).toEqual(1);
            expect(groupByArea.expressions[0].fieldName).toEqual('OnPTO');
        });

        it('handleMoveEnd restores chipExpressions when the drag is cancelled', async () => {
            const initialExprs = groupByArea.expressions;
            expect(initialExprs.length).toEqual(2);
            vi.spyOn(groupByArea.expressionsChange, 'emit');
            groupByArea.chipExpressions = [...initialExprs].reverse();

            groupByArea.handleMoveEnd({ originalEvent: { cancelled: true } as any, owner: null });
            fix.detectChanges();
            await fix.whenStable();

            expect(groupByArea.expressionsChange.emit).not.toHaveBeenCalled();
            expect(groupByArea.expressions).toBe(initialExprs);
            expect(groupByArea.chipExpressions).toBe(initialExprs);
        });

        it('groupBy adds a new grouping expression', async () => {
            expect(groupByArea.expressions.length).toEqual(2);

            groupByArea.groupBy({ fieldName: 'JobTitle', dir: 2, ignoreCase: true, strategy: DefaultSortingStrategy.instance() });
            fix.detectChanges();
            await fix.whenStable();

            expect(groupByArea.expressions.length).toEqual(3);
            expect(groupByArea.expressions.find(e => e.fieldName === 'JobTitle')).toBeTruthy();
        });

        it('clearGrouping removes the expression for the given field name', async () => {
            expect(groupByArea.expressions.length).toEqual(2);

            groupByArea.clearGrouping('HireDate');
            fix.detectChanges();
            await fix.whenStable();

            expect(groupByArea.expressions.length).toEqual(1);
            expect(groupByArea.expressions.find(e => e.fieldName === 'HireDate')).toBeFalsy();
            expect(groupByArea.expressions[0].fieldName).toEqual('OnPTO');
        });

        it('updates grouping expression direction when sortingExpressionsChange fires', async () => {
            // HireDate starts with dir: 2 (Desc)
            expect(groupByArea.expressions.find(e => e.fieldName === 'HireDate').dir).toEqual(2);

            // Setting sortingExpressions triggers sortingExpressionsChange which the component subscribes to
            treeGrid.sortingExpressions = [{ fieldName: 'HireDate', dir: 1, ignoreCase: true, strategy: DefaultSortingStrategy.instance() }];
            fix.detectChanges();
            await fix.whenStable();

            expect(groupByArea.expressions.find(e => e.fieldName === 'HireDate').dir).toEqual(1);
        });

        it('hideGroupedColumns setter hides all grouped columns when set to true with columns already initialized', async () => {
            // Both grouped columns should be visible by default
            expect(treeGrid.getColumnByName('OnPTO').hidden).toBe(false);
            expect(treeGrid.getColumnByName('HireDate').hidden).toBe(false);

            groupByArea.hideGroupedColumns = true;
            fix.detectChanges();
            await fix.whenStable();

            // setColumnsVisibility iterates all expressions and hides their columns
            expect(treeGrid.getColumnByName('OnPTO').hidden).toBe(true);
            expect(treeGrid.getColumnByName('HireDate').hidden).toBe(true);
        });

        it('should handle excel style filtering when grouping is applied and 3 or more items are selected', async () => {
            treeGrid.filterMode = 'excelStyleFilter';
            treeGrid.allowFiltering = true;
            treeGrid.expansionDepth = Infinity;
            fix.detectChanges();
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, treeGrid, 'Name');
            await wait(50);
            fix.detectChanges();
            const checkboxes = GridFunctions.getExcelStyleFilteringCheckboxes(fix, null, 'igx-tree-grid');
            // unselect all
            checkboxes[0].click();
            fix.detectChanges();

            checkboxes[2].click();
            checkboxes[3].click();
            checkboxes[4].click();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix, null, 'igx-tree-grid');
            fix.detectChanges();


            expect(treeGrid.filteredData.length).toEqual(8);
        });

        it('should handle excel style filtering when grouping is applied and preserve all checked esf items', async () => {
            treeGrid.filterMode = 'excelStyleFilter';
            treeGrid.allowFiltering = true;
            treeGrid.expansionDepth = Infinity;
            fix.detectChanges();
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, treeGrid, 'Name');
            await wait(50);
            fix.detectChanges();
            let checkboxes: HTMLInputElement[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, null, 'igx-tree-grid') as HTMLInputElement[]);
            // unselect just one
            checkboxes[2].click();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix, null, 'igx-tree-grid');
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, treeGrid, 'Name');
            await wait(50);
            fix.detectChanges();
            checkboxes = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, null, 'igx-tree-grid') as HTMLInputElement[]);

            const uncheckedItem = checkboxes.splice(2, 1)[0];
            expect(uncheckedItem.checked).toBe(false);
            checkboxes.forEach(c => expect(c.checked).toBe(true));
        });
    });

    const getChips = (fixture) => {
        const chipsAreaElement = fixture.debugElement.nativeElement.querySelector('igx-chips-area');
        return chipsAreaElement.querySelectorAll('igx-chip');
    };
});
