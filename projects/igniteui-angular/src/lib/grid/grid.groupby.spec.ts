import { Component, ViewChild } from '@angular/core';
import { async, discardPeriodicTasks, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { take } from 'rxjs/operators';
import { Calendar } from '../calendar';
import { KEYCODES } from '../core/utils';
import { DataType } from '../data-operations/data-util';
import { STRING_FILTERS } from '../data-operations/filtering-condition';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent } from './column.component';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IGridCellEventArgs, IgxGridComponent } from './grid.component';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridModule } from './index';
import { IgxGridRowComponent } from './row.component';

describe('IgxGrid - GropBy', () => {
    const COLUMN_HEADER_CLASS = '.igx-grid__th';
    const CELL_CSS_CLASS = '.igx-grid__td';
    const FIXED_CELL_CSS = 'igx-grid__th--pinned';
    const SORTING_ICON_NONE_CONTENT = 'none';
    const SORTING_ICON_ASC_CONTENT = 'arrow_upward';
    const SORTING_ICON_DESC_CONTENT = 'arrow_downward';
    const GROUPROW_CSS = '.igx-grid__tr--group';
    const DATAROW_CSS = '.igx-grid__tr';
    const GROUPROW_COTENT_CSS = '.igx-grid__groupContent';
    const navigateToIndex = (grid, rowStartIndex, rowEndIndex, cb?, colIndex?) => {
        const dir = rowStartIndex > rowEndIndex ? 'ArrowUp' : 'ArrowDown';
        const row = grid.getRowByIndex(rowStartIndex);
        const cIndx = colIndex || 0;
        const colKey = grid.columnList.toArray()[cIndx].field;
        let nextRow = dir === 'ArrowUp' ? grid.getRowByIndex(rowStartIndex - 1) : grid.getRowByIndex(rowStartIndex + 1);
        if (rowStartIndex === rowEndIndex) {
            if (cb) { cb(); } return;
        }
        const keyboardEvent = new KeyboardEvent('keydown', {
            code: dir,
            key: dir
        });
        const elem = row instanceof IgxGridGroupByRowComponent ?
            row : grid.getCellByColumn(row.index, colKey);
        if (dir === 'ArrowDown') {
            elem.onKeydownArrowDown(keyboardEvent);
        } else {
            elem.onKeydownArrowUp(keyboardEvent);
        }
         grid.cdr.detectChanges();

        if (nextRow) {
            setTimeout(() => {
                 grid.cdr.detectChanges();
                 navigateToIndex(grid, nextRow.index, rowEndIndex, cb, colIndex);
            });
        } else {
            // else wait for chunk to load.
            grid.verticalScrollContainer.onChunkLoad.pipe(take(1)).subscribe({
                next: () => {
                    grid.cdr.detectChanges();
                    nextRow = dir === 'ArrowUp' ? grid.getRowByIndex(rowStartIndex - 1) : grid.getRowByIndex(rowStartIndex + 1);
                    navigateToIndex(grid, nextRow.index, rowEndIndex, cb, colIndex);
                }
            });
        }

    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridComponent,
                GroupableGridComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule.forRoot()]
        }).compileComponents();
    }));
    function checkGroups(groupRows, expectedGroupOrder, grExpr?) {
        // verify group rows are sorted correctly, their indexes in the grid are correct and their group records match the group value.
        let count = 0;
        const maxLevel = grExpr ? grExpr.length - 1 : 0;
        for (const groupRow of groupRows) {
            const recs = groupRow.groupRow.records;
            const val = groupRow.groupRow.value;
            const index = groupRow.index;
            const field = groupRow.groupRow.expression.fieldName;
            const level = groupRow.groupRow.level;
            expect(level).toEqual(grExpr ? grExpr.indexOf(groupRow.groupRow.expression) : 0);
            expect(index).toEqual(count);
            count++;
            expect(val).toEqual(expectedGroupOrder[groupRows.indexOf(groupRow)]);
            for (const rec of recs) {
                if (level === maxLevel) {
                    count++;
                }
                expect(rec[field]).toEqual(val);
            }
        }
    }
    it('should allow grouping by different data types.', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        // group by string column
        const grid = fix.componentInstance.instance;
        grid.groupBy('ProductName', SortingDirection.Desc, false);
        fix.detectChanges();

        // verify grouping expressions
        const grExprs = grid.groupingExpressions;
        expect(grExprs.length).toEqual(1);
        expect(grExprs[0].fieldName).toEqual('ProductName');

        // verify rows
        let groupRows = grid.groupedRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);

        checkGroups(groupRows, ['NetAdvantage', 'Ignite UI for JavaScript', 'Ignite UI for Angular', '', null]);

        // ungroup
        grid.groupBy('ProductName', SortingDirection.None, false);
        fix.detectChanges();

         // verify no groups are present
        expect(grid.groupedRowList.toArray().length).toEqual(0);

        // group by number
        grid.groupBy('Downloads', SortingDirection.Desc, false);
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(6);
        expect(dataRows.length).toEqual(8);

        checkGroups(groupRows, [1000, 254, 100, 20,  0, null]);

        // ungroup and group by boolean column
        grid.groupBy('Downloads', SortingDirection.None, false);
        fix.detectChanges();
        grid.groupBy('Released', SortingDirection.Desc, false);
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(8);

        checkGroups(groupRows, [true, false, null]);

        // ungroup and group by date column
        grid.groupBy('Released', SortingDirection.None, false);
        fix.detectChanges();
        grid.groupBy('ReleaseDate', SortingDirection.Asc, false);
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(4);
        expect(dataRows.length).toEqual(8);

        checkGroups(
             groupRows,
             [null, fix.componentInstance.prevDay, fix.componentInstance.today, fix.componentInstance.nextDay ]);
    });

    it('should allow grouping by multiple columns.', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.componentInstance.height = null;
        fix.detectChanges();

        // group by 2 columns
        const grid = fix.componentInstance.instance;
        grid.groupBy('ProductName', SortingDirection.Desc, false);
        grid.groupBy('Released', SortingDirection.Desc, false);
        fix.detectChanges();

        let groupRows = grid.groupedRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        // verify groups and data rows count
        expect(groupRows.length).toEqual(13);
        expect(dataRows.length).toEqual(8);
        // verify groups
        checkGroups(groupRows,
        ['NetAdvantage', true, false, 'Ignite UI for JavaScript', true, false, 'Ignite UI for Angular', false, null, '', true, null, true],
        grid.groupingExpressions);

        // group by 3rd column

        grid.groupBy('Downloads', SortingDirection.Desc, false);
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.dataRowList.toArray();

        // verify groups and data rows count
        expect(groupRows.length).toEqual(21);
        expect(dataRows.length).toEqual(8);
        // verify groups
        checkGroups(groupRows,
        ['NetAdvantage', true, 1000, false, 1000, 'Ignite UI for JavaScript', true, null, false, 254, 'Ignite UI for Angular',
         false, 20, null, 1000, '', true, 100, null, true, 0],
        grid.groupingExpressions);
    });
    it('should allows expanding/collapsing groups.', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        grid.primaryKey = 'ID';
        fix.detectChanges();
        grid.groupBy('Released', SortingDirection.Desc, false);
        fix.detectChanges();

        let groupRows = grid.groupedRowList.toArray();
        let dataRows = grid.dataRowList.toArray();
        // verify groups and data rows count
        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(8);

        // toggle grouprow - collapse
        expect(groupRows[0].expanded).toEqual(true);
        grid.toggleGroup(groupRows[0].groupRow);
        fix.detectChanges();
        expect(groupRows[0].expanded).toEqual(false);
        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(4);
        // verify collapsed group sub records are not rendered

        for (const rec of groupRows[0].groupRow.records) {
           expect(grid.getRowByKey(rec.ID)).toBeUndefined();
        }

        // toggle grouprow - expand
        grid.toggleGroup(groupRows[0].groupRow);
        fix.detectChanges();
        expect(groupRows[0].expanded).toEqual(true);
        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(8);

        // verify expanded group sub records are rendered
        for (const rec of groupRows[0].groupRow.records) {
           expect(grid.getRowByKey(rec.ID)).not.toBeUndefined();
        }
    });
    it('should allow changing the order of the groupBy columns.', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        // set groupingExpressions
        const grid = fix.componentInstance.instance;
        const exprs: ISortingExpression[] = [
            {fieldName: 'ProductName', dir: SortingDirection.Desc},
            {fieldName: 'Released', dir: SortingDirection.Desc}
        ];
        grid.groupingExpressions = exprs;
        fix.detectChanges();

        let groupRows = grid.groupedRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(13);
        expect(dataRows.length).toEqual(8);
        // verify groups
        checkGroups(groupRows,
        ['NetAdvantage', true, false, 'Ignite UI for JavaScript', true,
         false, 'Ignite UI for Angular', false, null, '', true, null, true],
        grid.groupingExpressions);

        // change order
        grid.groupingExpressions = [
            {fieldName: 'Released', dir: SortingDirection.Asc},
            {fieldName: 'ProductName', dir: SortingDirection.Asc}
        ];
        grid.sortingExpressions = [
            {fieldName: 'Released', dir: SortingDirection.Asc},
            {fieldName: 'ProductName', dir: SortingDirection.Asc}
        ];
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(11);
        expect(dataRows.length).toEqual(8);
        // verify groups
        checkGroups(groupRows,
        [null, 'Ignite UI for Angular', false, 'Ignite UI for Angular', 'Ignite UI for JavaScript',
         'NetAdvantage',  true, null, '',  'Ignite UI for JavaScript', 'NetAdvantage'],
        grid.groupingExpressions);

    });

    // GroupBy + Sorting integration
    it('should apply sorting on each group\'s records when non-grouped column is sorted.', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        grid.groupBy('ProductName', SortingDirection.Desc, false);
        fix.detectChanges();
        const groupRows = grid.groupedRowList.toArray();
        const dataRows = grid.dataRowList.toArray();
        // verify groups and data rows count
        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);

        grid.sort('Released', SortingDirection.Asc, false);
        fix.detectChanges();

        // verify groups
        checkGroups(groupRows, ['NetAdvantage', 'Ignite UI for JavaScript', 'Ignite UI for Angular', '', null]);

        // verify data records order
        const expectedDataRecsOrder = [false, true, false, true, null, false, true, true];
        dataRows.forEach((row, index) => {
            expect(row.rowData.Released).toEqual(expectedDataRecsOrder[index]);
        });

    });
    it('should apply the specified sort order on the group rows when already grouped columnn is sorted in asc/desc order.', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        grid.groupBy('ProductName', SortingDirection.Desc, false);
        fix.detectChanges();

        let groupRows = grid.groupedRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        // verify groups and data rows count
        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);

        // verify group order
        checkGroups(groupRows, ['NetAdvantage', 'Ignite UI for JavaScript', 'Ignite UI for Angular', '', null]);
        grid.sort('ProductName', SortingDirection.Asc, false);
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.dataRowList.toArray();

        // verify group order
        checkGroups(groupRows, [null, '', 'Ignite UI for Angular', 'Ignite UI for JavaScript', 'NetAdvantage' ]);

    });
    it('should remove grouping when already grouped columnn is sorted with order \'None\' via the API.', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        grid.groupBy('ProductName', SortingDirection.Desc, false);
        fix.detectChanges();

        let groupRows = grid.groupedRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        // verify groups and data rows count
        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);

        // verify group order
        checkGroups(groupRows, ['NetAdvantage', 'Ignite UI for JavaScript', 'Ignite UI for Angular', '', null]);
        grid.sort('ProductName', SortingDirection.None, false);
        fix.detectChanges();
        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.dataRowList.toArray();

         // verify groups and data rows count
        expect(groupRows.length).toEqual(0);
        expect(dataRows.length).toEqual(8);

    });
    it('should disallow setting sorting state None to grouped column when sorting via the UI.', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        grid.groupBy('Downloads', SortingDirection.Desc, false);
        fix.detectChanges();

        const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        // click header
        headers[0].triggerEventHandler('click', new Event('click'));
        fix.detectChanges();

        const sortingIcon = fix.debugElement.query(By.css('.sort-icon'));
        expect(sortingIcon.nativeElement.textContent.trim()).toEqual(SORTING_ICON_ASC_CONTENT);

        // click header again
        headers[0].triggerEventHandler('click', new Event('click'));
        fix.detectChanges();

        expect(sortingIcon.nativeElement.textContent.trim()).toEqual(SORTING_ICON_DESC_CONTENT);

        // click header again
        headers[0].triggerEventHandler('click', new Event('click'));
        fix.detectChanges();
        expect(sortingIcon.nativeElement.textContent.trim()).toEqual(SORTING_ICON_ASC_CONTENT);

    });
    it('should group by the specified field when grouping by an already sorted field.', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        grid.sort('ProductName', SortingDirection.Desc, false);
        fix.detectChanges();

        grid.groupBy('ProductName', SortingDirection.Asc, false);
        fix.detectChanges();
        const groupRows = grid.groupedRowList.toArray();
        // verify group order
        checkGroups(groupRows, [null, '', 'Ignite UI for Angular', 'Ignite UI for JavaScript', 'NetAdvantage' ]);
    });

    // GroupBy + Selection integration
   it('should toggle expand/collapse state of group row with Space/Enter key.',  () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.width = '400px';
        fix.detectChanges();

        grid.groupBy('ProductName', SortingDirection.Desc, false);
        fix.detectChanges();
        const gRow = grid.groupedRowList.toArray()[0];
        expect(gRow.expanded).toBe(true);
        const evtEnter = new KeyboardEvent('keydown', {
            code: 'enter',
            key: 'enter'
        });
        const evtSpace = new KeyboardEvent('keydown', {
            code: 'enter',
            key: 'enter'
        });
        gRow.element.nativeElement.dispatchEvent(evtEnter);

        fix.detectChanges();

        expect(gRow.expanded).toBe(false);

        gRow.element.nativeElement.dispatchEvent(evtEnter);
        fix.detectChanges();
        expect(gRow.expanded).toBe(true);
    });

    it('should allow keyboard navigation through group rows.',  (done) => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        const mockEvent = { preventDefault: () => { } };

        fix.componentInstance.width = '400px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        fix.detectChanges();

        grid.groupBy('ProductName', SortingDirection.Desc, false);
        grid.groupBy('Released', SortingDirection.Desc, false);
        fix.detectChanges();
        const cbFunc2 = () => {
            const row = grid.getRowByIndex(0);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            expect(row.focused).toBe(true);
            done();
        };
        const cbFunc = () => {
             fix.detectChanges();
             const row = grid.getRowByIndex(9);
             expect(row instanceof IgxGridRowComponent).toBe(true);
             expect(row.focused).toBe(true);
             expect(row.cells.toArray()[0].selected).toBe(true);

             navigateToIndex(grid, 9, 0, cbFunc2);
         };

        navigateToIndex(grid, 0, 9, cbFunc);
    });

    it('should persist last selected cell column index when navigation through group rows.',  (done) => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        const mockEvent = { preventDefault: () => { } };

        fix.componentInstance.width = '400px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        fix.detectChanges();

        grid.groupBy('ProductName', SortingDirection.Desc, false);
        grid.groupBy('Released', SortingDirection.Desc, false);
        fix.detectChanges();
        grid.parentVirtDir.getHorizontalScroll().scrollLeft = 1000;
        fix.detectChanges();

        const cbFunc2 = () => {
            const row = grid.getRowByIndex(0);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            expect(row.focused).toBe(true);
            done();
        };
        const cbFunc = () => {
            fix.detectChanges();
             const row = grid.getRowByIndex(9);
             expect(row instanceof IgxGridRowComponent).toBe(true);
             expect(row.focused).toBe(true);
             expect(row.cells.last.selected).toBe(true);

             navigateToIndex(grid, 9, 0, cbFunc2, 4);
         };
        setTimeout(() => {
            const cell = grid.getCellByColumn(2, 'Released');
            cell.onFocus(new Event('focus'));
            fix.detectChanges();
            navigateToIndex(grid, 0, 9, cbFunc, 4);
        }, 10);
    });

    it('should clear selection from data cells when a group row is focused via KB navigation.',  (done) => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        const mockEvent = { preventDefault: () => { } };

        fix.componentInstance.width = '800px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        fix.detectChanges();

        grid.groupBy('ProductName', SortingDirection.Desc, false);
        grid.groupBy('Released', SortingDirection.Desc, false);
        fix.detectChanges();

         const cbFunc = () => {
             fix.detectChanges();
             const row = grid.getRowByIndex(0);
             expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
             expect(row.focused).toBe(true);
             const oldSelectedCell = grid.getCellByColumn(2, 'Downloads');
             expect(cell.selected).toBe(false);
             done();
         };

        const cell = grid.getCellByColumn(2, 'Downloads');
        cell.onFocus(new Event('focus'));
        fix.detectChanges();
        expect(cell.selected).toBe(true);
        navigateToIndex(grid, 2, 0, cbFunc);

    });

     // GroupBy + Virtualization integration
     it('should virtualize data and group records.',  () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '500px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        fix.detectChanges();

        grid.groupBy('ProductName', SortingDirection.Desc, false);
        grid.groupBy('Released', SortingDirection.Desc, false);
        fix.detectChanges();

        expect(grid.groupedRowList.toArray().length).toEqual(3);
        expect(grid.dataRowList.toArray().length).toEqual(2);
        expect(grid.rowList.toArray().length).toEqual(5);
     });

    it('should recalculate visible chunk data and scrollbar size when expanding/collapsing group rows.',  () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '500px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        fix.detectChanges();

        grid.groupBy('ProductName', SortingDirection.Desc, false);
        grid.groupBy('Released', SortingDirection.Desc, false);
        fix.detectChanges();

        const origScrollHeight = parseInt(grid.verticalScrollContainer.getVerticalScroll().children[0].style.height, 10);

        // collapse all group rows currently in the view
        const grRows = grid.groupedRowList.toArray();
        grRows[0].toggle();
        fix.detectChanges();

        // verify rows are updated
        expect(grid.groupedRowList.toArray().length).toEqual(4);
        expect(grid.dataRowList.toArray().length).toEqual(1);
        expect(grid.rowList.toArray().length).toEqual(5);

        // verify scrollbar is updated - 4 rows x 50px are hidden.
        expect(parseInt(grid.verticalScrollContainer.getVerticalScroll().children[0].style.height, 10))
            .toEqual(origScrollHeight - 200);

        grRows[0].toggle();
        fix.detectChanges();

        expect(grid.groupedRowList.toArray().length).toEqual(3);
        expect(grid.dataRowList.toArray().length).toEqual(2);
        expect(grid.rowList.toArray().length).toEqual(5);

        expect(parseInt(grid.verticalScrollContainer.getVerticalScroll().children[0].style.height, 10))
            .toEqual(origScrollHeight);
      });

    it('should persist group row expand/collapse state when scrolling.',  () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '500px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        fix.detectChanges();

        grid.groupBy('ProductName', SortingDirection.Desc, false);
        grid.groupBy('Released', SortingDirection.Desc, false);
        fix.detectChanges();

        let groupRow = grid.groupedRowList.toArray()[0];
        groupRow.toggle();

        expect(groupRow.expanded).toBe(false);
        fix.detectChanges();

        // scroll to bottom
        grid.verticalScrollContainer.getVerticalScroll().scrollTop = 10000;
        fix.detectChanges();

        // scroll back to the top
        grid.verticalScrollContainer.getVerticalScroll().scrollTop = 0;
        fix.detectChanges();

        groupRow = grid.groupedRowList.toArray()[0];

        expect(groupRow.expanded).toBe(false);
    });

    it('should leave group rows static when scrolling horizontally.',  () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '400px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        fix.detectChanges();

        grid.groupBy('ProductName', SortingDirection.Desc, false);
        grid.groupBy('Released', SortingDirection.Desc, false);
        fix.detectChanges();
        const groupRow = grid.groupedRowList.toArray()[0];
        const origRect = groupRow.element.nativeElement.getBoundingClientRect();
        grid.parentVirtDir.getHorizontalScroll().scrollLeft = 1000;
        fix.detectChanges();

        const rect = groupRow.element.nativeElement.getBoundingClientRect();

        // verify row location is the same
        expect(rect.left).toEqual(origRect.left);
        expect(rect.top).toEqual(origRect.top);
    });

    // GroupBy Area
    it('should apply group area if a column is grouped.', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');

        grid.groupBy('ProductName', SortingDirection.Asc, false);
        fix.detectChanges();
        const groupRows = grid.groupedRowList.toArray();
        // verify group area is rendered
        expect(gridElement.querySelectorAll('.igx-grouparea').length).toEqual(1);
    });

    it('should apply group area if a column is groupable.', () => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');
        // verify group area is rendered
        expect(gridElement.querySelectorAll('.igx-grouparea').length).toEqual(1);
        expect(gridElement.clientHeight).toEqual(700);
    });
});
@Component({
    template: `
        <igx-grid
            [width]='width'
            [height]='height'
            [data]="data"
            [autoGenerate]="true" (onColumnInit)="columnsCreated($event)">
        </igx-grid>
    `
})
export class DefaultGridComponent {
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    public nextDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 0, 0, 0);
    public prevDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 0, 0, 0);
    public width = '800px';
    public height = null;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;
    public enableSorting = false;

    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.today,
            Released: false
        },
        {
            Downloads: 1000,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.nextDay,
            Released: true
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: false
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: null,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 6,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: this.nextDay,
            Released: null
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.today,
            Released: false
        }
    ];

    public columnsCreated(column: IgxColumnComponent) {
        column.sortable = this.enableSorting;
    }
}

@Component({
    template: `
        <igx-grid
            [width]='width'
            [height]='height'
            [data]="data"
            [paging]="true">
            <igx-column [field]="'ID'" [header]="'ID'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <igx-column [field]="'Downloads'" [header]="'Downloads'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <igx-column [field]="'ProductName'" [header]="'ProductName'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <igx-column [field]="'Released'" [header]="'Released'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
        </igx-grid>
    `
})
export class GroupableGridComponent {
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    public nextDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 0, 0, 0);
    public prevDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 0, 0, 0);
    public width = '800px';
    public height = '700px';

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.today,
            Released: false
        },
        {
            Downloads: 1000,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.nextDay,
            Released: true
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: false
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: null,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 6,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: this.nextDay,
            Released: null
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.today,
            Released: false
        }
    ];
}
