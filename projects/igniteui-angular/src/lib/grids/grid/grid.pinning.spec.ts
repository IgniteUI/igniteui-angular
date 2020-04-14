import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxGridModule } from './index';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxGridHeaderGroupComponent } from '../headers/grid-header-group.component';
import { ColumnPinningPosition } from '../common/enums';
import { IPinningConfig } from '../common/grid.interface';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { GridSummaryFunctions, GridSelectionFunctions, GridFunctions } from '../../test-utils/grid-functions.spec';
// tslint:disable-next-line: max-line-length
import { PinOnInitAndSelectionComponent, PinningComponent, GridPinningMRLComponent, GridFeaturesComponent, MultiColumnHeadersWithGroupingComponent } from '../../test-utils/grid-samples.spec';
import { IgxGridComponent } from './grid.component';
// tslint:disable: no-use-before-declare

describe('IgxGrid - Column Pinning #grid', () => {
    const COLUMN_HEADER_CLASS = '.igx-grid__th';
    const FIXED_HEADER_CSS = 'igx-grid__th--pinned';
    const FIXED_CELL_CSS = 'igx-grid__td--pinned';
    const FIRST_PINNED_CELL_CSS = 'igx-grid__td--pinned-first';
    const DEBOUNCETIME = 30;

    configureTestSuite();

    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PinningComponent,
                PinOnInitAndSelectionComponent,
                GridFeaturesComponent,
                MultiColumnHeadersWithGroupingComponent,
                PinOnInitAndSelectionComponent,
                GridPinningMRLComponent

            ],
            imports: [NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    describe('To Start', () => {

        it('should correctly initialize when there are initially pinned columns.', fakeAsync(() => {
            const fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
            tick();
            fix.detectChanges();
            const grid = fix.componentInstance.grid;
            // verify pinned/unpinned collections
            expect(grid.pinnedColumns.length).toEqual(2);
            expect(grid.unpinnedColumns.length).toEqual(9);

            // verify DOM
            const firstIndexCell = grid.getCellByColumn(0, 'CompanyName');
            expect(firstIndexCell.visibleColumnIndex).toEqual(0);

            const lastIndexCell = grid.getCellByColumn(0, 'ContactName');
            expect(lastIndexCell.visibleColumnIndex).toEqual(1);
            expect(lastIndexCell.nativeElement.classList.contains(FIXED_CELL_CSS)).toBe(true);

            const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            expect(headers[0].context.column.field).toEqual('CompanyName');

            expect(headers[1].context.column.field).toEqual('ContactName');
            expect(headers[1].parent.nativeElement.classList.contains(FIXED_HEADER_CSS)).toBe(true);

            // verify container widths
            expect(grid.pinnedWidth).toEqual(400);
            expect(grid.unpinnedWidth + grid.scrollWidth).toEqual(400);
        }));

        it('should allow pinning/unpinning via the grid API', fakeAsync(() => {
            const fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.grid;

            // Unpin column
            grid.unpinColumn('CompanyName');
            tick();
            fix.detectChanges();

            // verify column is unpinned
            expect(grid.pinnedColumns.length).toEqual(1);
            expect(grid.unpinnedColumns.length).toEqual(10);

            const col = grid.getColumnByName('CompanyName');
            expect(col.pinned).toBe(false);
            expect(col.visibleIndex).toEqual(2);

            // verify DOM
            let cell = grid.getCellByColumn(0, 'CompanyName');
            expect(cell.visibleColumnIndex).toEqual(2);
            expect(cell.nativeElement.classList.contains(FIXED_CELL_CSS)).toBe(false);

            const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            expect(headers[2].context.column.field).toEqual('CompanyName');
            expect(headers[2].nativeElement.classList.contains(FIXED_CELL_CSS)).toBe(false);

            // verify container widths
            expect(grid.pinnedWidth).toEqual(200);
            expect(grid.unpinnedWidth + grid.scrollWidth).toEqual(600);

            // pin back the column.
            grid.pinColumn('CompanyName');
            tick();
            fix.detectChanges();

            // verify column is pinned
            expect(grid.pinnedColumns.length).toEqual(2);
            expect(grid.unpinnedColumns.length).toEqual(9);

            // verify container widths
            expect(grid.pinnedWidth).toEqual(400);
            expect(grid.unpinnedWidth + grid.scrollWidth).toEqual(400);

            expect(col.pinned).toBe(true);
            expect(col.visibleIndex).toEqual(1);

            cell = grid.getCellByColumn(0, 'CompanyName');
            expect(cell.visibleColumnIndex).toEqual(1);
            expect(cell.nativeElement.classList.contains(FIXED_CELL_CSS)).toBe(true);
        }));

        it('should allow pinning/unpinning via the column API', fakeAsync(() => {
            const fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.grid;

            const col = grid.getColumnByName('ID');

            col.pinned = true;
            tick();
            fix.detectChanges();

            // verify column is pinned
            expect(col.pinned).toBe(true);
            expect(col.visibleIndex).toEqual(2);

            expect(grid.pinnedColumns.length).toEqual(3);
            expect(grid.unpinnedColumns.length).toEqual(8);

            // verify container widths
            expect(grid.pinnedWidth).toEqual(600);
            expect(grid.unpinnedWidth + grid.scrollWidth).toEqual(200);

            col.pinned = false;

            // verify column is unpinned
            expect(col.pinned).toBe(false);
            expect(col.visibleIndex).toEqual(2);

            expect(grid.pinnedColumns.length).toEqual(2);
            expect(grid.unpinnedColumns.length).toEqual(9);

            // verify container widths
            expect(grid.pinnedWidth).toEqual(400);
            expect(grid.unpinnedWidth + grid.scrollWidth).toEqual(400);
        }));

        it('on unpinning should restore the original location(index) of the column', fakeAsync(() => {
            const fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.grid;
            const col = grid.getColumnByName('ContactName');
            expect(col.index).toEqual(2);

            // unpin
            col.pinned = false;
            tick();
            fix.detectChanges();

            // check props
            expect(col.index).toEqual(2);
            expect(col.visibleIndex).toEqual(2);

            // check DOM

            const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            expect(headers[2].context.column.field).toEqual('ContactName');
            expect(headers[2].nativeElement.classList.contains(FIXED_CELL_CSS)).toBe(false);

        }));

        it('should emit onColumnPinning event and allow changing the insertAtIndex param.', fakeAsync(() => {
            const fix = TestBed.createComponent(PinningComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.grid;

            let col = grid.getColumnByName('ID');
            col.pinned = true;
            tick();
            fix.detectChanges();

            expect(col.visibleIndex).toEqual(0);

            col = grid.getColumnByName('City');
            col.pinned = true;
            tick();
            fix.detectChanges();
            expect(col.visibleIndex).toEqual(0);

            // check DOM
            const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
            expect(headers[0].context.column.field).toEqual('City');
            expect(headers[1].context.column.field).toEqual('ID');
        }));

        it('should allow filter pinned columns', fakeAsync(() => {
            const fix = TestBed.createComponent(GridFeaturesComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;

            // Contains filter
            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(2);
            expect(grid.getCellByColumn(0, 'ID').value).toEqual(1);
            expect(grid.getCellByColumn(1, 'ID').value).toEqual(3);

            // Unpin column
            grid.unpinColumn('ProductName');
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(2);
            expect(grid.getCellByColumn(0, 'ID').value).toEqual(1);
            expect(grid.getCellByColumn(1, 'ID').value).toEqual(3);
        }));

        it('should allow sorting pinned columns', () => {
            const fix = TestBed.createComponent(GridFeaturesComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const currentColumn = 'ProductName';
            const releasedColumn = 'Released';

            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: true });

            fix.detectChanges();

            let expectedResult: any = null;
            expect(grid.getCellByColumn(0, currentColumn).value).toEqual(expectedResult);
            expectedResult = true;
            expect(grid.getCellByColumn(0, releasedColumn).value).toEqual(expectedResult);
            expectedResult = 'Some other item with Script';
            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual(expectedResult);
            expectedResult = null;
            expect(grid.getCellByColumn(grid.data.length - 1, releasedColumn).value).toEqual(expectedResult);

            // Unpin column
            grid.unpinColumn('ProductName');
            fix.detectChanges();

            expectedResult = null;
            expect(grid.getCellByColumn(0, currentColumn).value).toEqual(expectedResult);
            expectedResult = true;
            expect(grid.getCellByColumn(0, releasedColumn).value).toEqual(expectedResult);
            expectedResult = 'Some other item with Script';
            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual(expectedResult);
            expectedResult = null;
            expect(grid.getCellByColumn(grid.data.length - 1, releasedColumn).value).toEqual(expectedResult);
        });

        it('should allow hiding/showing pinned column.', fakeAsync(() => {
            const fix = TestBed.createComponent(PinningComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.grid;
            const col = grid.getColumnByName('CompanyName');
            col.pinned = true;
            tick();
            fix.detectChanges();
            expect(grid.pinnedColumns.length).toEqual(1);
            expect(grid.unpinnedColumns.length).toEqual(9);

            col.hidden = true;
            tick();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(0);
            expect(grid.unpinnedColumns.length).toEqual(9);

            let headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            expect(headers[0].context.column.field).toEqual('ID');
            expect(headers[0].nativeElement.classList.contains(FIXED_HEADER_CSS)).toBe(false);

            col.hidden = false;
            tick();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(1);
            expect(grid.unpinnedColumns.length).toEqual(9);

            headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            expect(headers[0].context.column.field).toEqual('CompanyName');
            expect(headers[0].parent.nativeElement.classList.contains(FIXED_HEADER_CSS)).toBe(true);
        }));

        it('should allow pinning a hidden column.', fakeAsync(() => {
            const fix = TestBed.createComponent(PinningComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.grid;
            const col = grid.getColumnByName('CompanyName');

            col.hidden = true;
            col.pinned = true;
            tick();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(0);
            expect(grid.unpinnedColumns.length).toEqual(9);

            col.hidden = false;
            tick();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(1);
            expect(grid.unpinnedColumns.length).toEqual(9);
        }));

        it('should allow hiding columns in the unpinned area.', fakeAsync(() => {

            const fix = TestBed.createComponent(PinningComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.grid;
            const col1 = grid.getColumnByName('CompanyName');
            const col2 = grid.getColumnByName('ID');

            col1.pinned = true;
            tick();
            fix.detectChanges();
            col2.hidden = true;
            tick();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(1);
            expect(grid.unpinnedColumns.length).toEqual(8);

            const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            expect(headers[0].context.column.field).toEqual('CompanyName');
            expect(headers[1].context.column.field).toEqual('ContactName');
        }));

        it('should correctly initialize pinned columns z-index values.', fakeAsync(() => {
            const fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.grid;

            let headers = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));

            // First two headers are pinned
            expect(headers[0].componentInstance.zIndex).toEqual(9999);
            expect(headers[1].componentInstance.zIndex).toEqual(9998);

            grid.pinColumn('Region');
            tick();
            fix.detectChanges();

            // First three headers are pinned
            headers = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            expect(headers[2].componentInstance.zIndex).toEqual(9997);
        }));

        it('should not pin/unpin columns which are already pinned/unpinned', fakeAsync(() => {
            const fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const pinnedColumnsLength = grid.pinnedColumns.length;
            const unpinnedColumnsLength = grid.unpinnedColumns.length;

            let result = grid.pinColumn('CompanyName');
            tick();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(pinnedColumnsLength);
            expect(result).toBe(false);

            result = grid.unpinColumn('City');
            tick();
            fix.detectChanges();

            expect(grid.unpinnedColumns.length).toEqual(unpinnedColumnsLength);
            expect(result).toBe(false);
        }));

        it('should not reject pinning a column if unpinned area width is less than 20% of the grid width', fakeAsync(() => {
            const fix = TestBed.createComponent(PinningComponent);
            const grid = fix.componentInstance.grid;
            fix.detectChanges();
            grid.columns.forEach((column) => {
                if (column.index === 0 || column.index === 1 || column.index === 4 ||
                    column.index === 6) {
                    column.pinned = true;
                }
            });
            tick();
            fix.detectChanges();
            expect(grid.columns[0].pinned).toBe(true);
            expect(grid.columns[1].pinned).toBe(true);
            expect(grid.columns[4].pinned).toBe(true);
            expect(grid.columns[6].pinned).toBe(true);
        }));

        it('should fix column when grid width is 100% and column width is set', fakeAsync(() => {
            const fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
            fix.componentInstance.grid.width = '100%';
            fix.detectChanges();
            const grid = fix.componentInstance.grid;


            expect(grid.pinnedColumns.length).toEqual(2);
            expect(grid.unpinnedColumns.length).toEqual(9);
        }));

        it('should allow navigating to/from pinned area', (async() => {
            pending('https://github.com/IgniteUI/igniteui-angular/pull/6910');
            const fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.grid;

            const cellContactName = grid.getCellByColumn(0, 'ContactName');
            const range = {
                rowStart: cellContactName.rowIndex,
                rowEnd: cellContactName.rowIndex,
                columnStart: cellContactName.visibleColumnIndex,
                columnEnd: cellContactName.visibleColumnIndex
            };
            grid.selectRange(range);
            grid.navigation.activeNode = {row: cellContactName.rowIndex, column: cellContactName.visibleColumnIndex};
            fix.detectChanges();

            grid.navigation.dispatchEvent(UIInteractions.getKeyboardEvent('keydown', 'ArrowRight'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const cellID = grid.getCellByColumn(0, 'ID');
            expect(cellID.active).toBe(true);
            expect(cellContactName.active).toBe(false);

            grid.navigation.dispatchEvent(UIInteractions.getKeyboardEvent('keydown', 'ArrowLeft'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(cellID.active).toBe(false);
            expect(cellContactName.active).toBe(true);
        }));
    });

    fdescribe('To End', () => {
        let fix;
        let grid: IgxGridComponent;
        const pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.End };

        beforeEach(fakeAsync(() => {
             fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
             fix.componentInstance.grid.pinning = pinningConfig;
             fix.detectChanges();
             grid = fix.componentInstance.grid;
        }));

        it('should correctly initialize when there are initially pinned columns.', fakeAsync(() => {

            const firstPinnedIndex = grid.unpinnedColumns.length;
            const secondPinnedIndex = grid.unpinnedColumns.length + 1;
            // verify pinned/unpinned collections
            expect(grid.pinnedColumns.length).toEqual(2);
            expect(grid.unpinnedColumns.length).toEqual(9);

            // verify DOM
            const firstIndexCell = grid.getCellByColumn(0, 'CompanyName');
            expect(firstIndexCell.visibleColumnIndex).toEqual(firstPinnedIndex);
            expect(firstIndexCell.nativeElement.classList.contains(FIRST_PINNED_CELL_CSS)).toBe(true);

            const lastIndexCell = grid.getCellByColumn(0, 'ContactName');
            expect(lastIndexCell.visibleColumnIndex).toEqual(secondPinnedIndex);

            const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            expect(headers[headers.length - 2].context.column.field).toEqual('CompanyName');

            expect(headers[headers.length - 1].context.column.field).toEqual('ContactName');
            // expect(headers[secondPinnedIndex].parent.nativeElement.classList.contains(FIXED_HEADER_CSS)).toBe(true);

            // verify container widths
            expect(grid.pinnedWidth).toEqual(400);
            expect(grid.unpinnedWidth + grid.scrollWidth).toEqual(400);
        }));

        it('should allow pinning/unpinning via the grid API', fakeAsync(() => {

            // Unpin column
            grid.unpinColumn('CompanyName');
            tick();
            fix.detectChanges();

            // verify column is unpinned
            expect(grid.pinnedColumns.length).toEqual(1);
            expect(grid.unpinnedColumns.length).toEqual(10);

            const col = grid.getColumnByName('CompanyName');
            expect(col.pinned).toBe(false);
            expect(col.visibleIndex).toEqual(1);

            // verify DOM
            let cell = grid.getCellByColumn(0, 'CompanyName');
            expect(cell.visibleColumnIndex).toEqual(1);
            expect(cell.nativeElement.classList.contains(FIXED_CELL_CSS)).toBe(false);

            const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

            expect(headers[1].context.column.field).toEqual('CompanyName');
            expect(headers[1].nativeElement.classList.contains(FIXED_CELL_CSS)).toBe(false);

            // verify container widths
            expect(grid.pinnedWidth).toEqual(200);
            expect(grid.unpinnedWidth + grid.scrollWidth).toEqual(600);

            // pin back the column.
            grid.pinColumn('CompanyName');
            tick();
            fix.detectChanges();

            // verify column is pinned
            expect(grid.pinnedColumns.length).toEqual(2);
            expect(grid.unpinnedColumns.length).toEqual(9);

            // verify container widths
            expect(grid.pinnedWidth).toEqual(400);
            expect(grid.unpinnedWidth + grid.scrollWidth).toEqual(400);

            expect(col.pinned).toBe(true);
            expect(col.visibleIndex).toEqual(grid.unpinnedColumns.length + 1);

            cell = grid.getCellByColumn(0, 'CompanyName');
            expect(cell.visibleColumnIndex).toEqual(grid.unpinnedColumns.length + 1);
            expect(cell.nativeElement.classList.contains(FIXED_CELL_CSS)).toBe(true);
        }));

        it('should correctly pin column to right when row selectors are enabled.', () => {
            grid.rowSelectable = true;
            fix.detectChanges();

            // check row DOM
            const row = grid.getRowByIndex(0).nativeElement;

            GridSelectionFunctions.verifyRowHasCheckbox(row);
            expect(GridFunctions.getRowDisplayContainer(fix, 0)).toBeDefined();
            expect(row.children[2].getAttribute('aria-describedby')).toBe(grid.id + '_CompanyName');
            expect(row.children[3].getAttribute('aria-describedby')).toBe(grid.id + '_ContactName');

            // check scrollbar DOM
            const scrBarStartSection = fix.debugElement.query(By.css('.igx-grid__scroll-start'));
            const scrBarMainSection = fix.debugElement.query(By.css('.igx-grid__scroll-main'));
            const scrBarEndSection = fix.debugElement.query(By.css('.igx-grid__scroll-end'));

            expect(scrBarStartSection.nativeElement.offsetWidth).toEqual(grid.featureColumnsWidth());
            const pinnedColSum = grid.pinnedColumns.map(x => parseInt(x.calcWidth, 10)).reduce((x, y) => x + y);
            expect(scrBarEndSection.nativeElement.offsetWidth).toEqual(pinnedColSum);
            const expectedUnpinAreaWidth = parseInt(grid.width, 10) - grid.featureColumnsWidth() - pinnedColSum - grid.scrollWidth;
            expect(scrBarMainSection.nativeElement.offsetWidth).toEqual(expectedUnpinAreaWidth);
        });

        it('should pin an unpinned column when drag/drop it among pinned columns.', (async() => {

            grid.pinning = { columns: ColumnPinningPosition.End };
            fix.detectChanges();
            await wait();
            fix.detectChanges();

            // move 'ID' column to the pinned area
            grid.moveColumn(grid.getColumnByName('ID'), grid.getColumnByName('ContactName'));
            fix.detectChanges();

            // verify column is pinned at the correct place
            expect(grid.pinnedColumns[0].field).toEqual('CompanyName');
            expect(grid.pinnedColumns[1].field).toEqual('ID');
            expect(grid.pinnedColumns[2].field).toEqual('ContactName');
            expect(grid.getColumnByName('ID').pinned).toBeTruthy();
        }));

        it('should correctly pin columns with their summaries to end.', async() => {
            grid.pinning = { columns: ColumnPinningPosition.End };
            grid.columns.forEach(col => {
                if (col.field === 'CompanyName' || col.field === 'ContactName') {
                    col.hasSummary = true;
                }
            });
            fix.detectChanges();
            await wait();
            fix.detectChanges();
            const summaryRow = fix.debugElement.query(By.css('igx-grid-summary-row'));
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 9,
                ['Count'], ['27']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 10,
                ['Count'], ['27']);
            const pinnedSummaryCells = summaryRow.queryAll(By.css('igx-grid-summary-cell.igx-grid-summary--pinned'));
            expect(pinnedSummaryCells[0].nativeElement.className.indexOf('igx-grid-summary--pinned-first'))
                .not.toBe(-1);
            expect(pinnedSummaryCells[1].nativeElement.className.indexOf('igx-grid-summary--pinned-first'))
                .toBe(-1);
        });

        it('should allow navigating to/from pinned area', (async() => {
            pending('https://github.com/IgniteUI/igniteui-angular/pull/6910');
            const fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.grid as any;

            const cellCompanyName = grid.getCellByColumn(0, 'CompanyName');
            const range = { rowStart: 0, rowEnd: 0, columnStart: 9, columnEnd: 9 };
            grid.selectRange(range);
            grid.navigation.activeNode = {row: 0, column: 9};
            fix.detectChanges();
            expect(cellCompanyName.active).toBe(true);

            grid.navigation.dispatchEvent(UIInteractions.getKeyboardEvent('keydown', 'ArrowLeft'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const cellFax = grid.getCellByColumn(0, 'Fax');
            expect(cellFax.active).toBe(true);
            expect(cellCompanyName.active).toBe(false);

            grid.navigation.dispatchEvent(UIInteractions.getKeyboardEvent('keydown', 'ArrowRight'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(cellFax.active).toBe(false);
            expect(cellCompanyName.active).toBe(true);
        }));

        it('should allow navigating to/from pinned area using Ctrl+Left/Right', (async() => {
            pending('https://github.com/IgniteUI/igniteui-angular/pull/6910');
            const fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.grid as any;

            const cellCompanyName = grid.getCellByColumn(0, 'CompanyName');
            const range = { rowStart: 0, rowEnd: 0, columnStart: 9, columnEnd: 9 };
            grid.selectRange(range);
            grid.navigation.activeNode = {row: 0, column: 9};
            fix.detectChanges();
            expect(cellCompanyName.active).toBe(true);

            grid.navigation.dispatchEvent(UIInteractions.getKeyboardEvent('keydown', 'ArrowLeft', false, false, true));
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const cellID = grid.getCellByColumn(0, 'ID');
            expect(cellID.active).toBe(true);
            expect(cellCompanyName.active).toBe(false);

            grid.navigation.dispatchEvent(UIInteractions.getKeyboardEvent('keydown', 'ArrowRight', false, false, true));
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const cellContactName = grid.getCellByColumn(0, 'ContactName');
            expect(cellID.active).toBe(false);
            expect(cellContactName.active).toBe(true);
        }));

        it('should correctly pin column groups to end.', async() => {

            fix = TestBed.createComponent(MultiColumnHeadersWithGroupingComponent);
            fix.componentInstance.isPinned = true;
            fix.componentInstance.grid.pinning = pinningConfig;
            fix.detectChanges();
            grid = fix.componentInstance.grid;


            fix.detectChanges();
            await wait();
            fix.detectChanges();
            const pinnedCols = grid.pinnedColumns.filter(x => !x.columnGroup);
            expect(pinnedCols.length).toBe(3);

            expect(grid.getColumnByName('CompanyName').isFirstPinned).toBeTruthy();
            const row = grid.getRowByIndex(0).nativeElement;
            // check cells are rendered after main display container and have left offset
            for (let i = 0; i <= pinnedCols.length - 1; i++) {
                const elem = row.children[i + 1];
                expect(parseInt((elem as any).style.left, 10)).toBe(-330);
                expect(elem.getAttribute('aria-describedby')).toBe(grid.id + '_' + pinnedCols[i].field);
            }

            // check correct headers have left border
            const fistPinnedHeaders = fix.debugElement.query(By.css('.igx-grid__thead-wrapper'))
            .queryAll((By.css('.igx-grid__th--pinned-first')));
            expect(fistPinnedHeaders[0].nativeElement.getAttribute('aria-label')).toBe('General Information');
            expect(fistPinnedHeaders[1].context.column.field).toBe('CompanyName');
        });

        it('should correctly pin multi-row-layouts to end.', () => {
            fix = TestBed.createComponent(GridPinningMRLComponent);
            fix.componentInstance.grid.pinning = pinningConfig;
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            // check row DOM
            const row = grid.getRowByIndex(0).nativeElement;
            expect(row.children[0].classList.contains('igx-display-container')).toBeTruthy();
            expect(row.children[1].classList.contains('igx-grid__td--pinned-first')).toBeTruthy();
            expect(row.children[1].classList.contains('igx-grid__mrl-block')).toBeTruthy();
            expect(parseInt((row.children[1] as any).style.left, 10)).toEqual(-408);

            // check correct headers have left border
            const fistPinnedHeaders = fix.debugElement.query(By.css('.igx-grid__thead-wrapper'))
                .query((By.css('.igx-grid__th--pinned-first')));
            expect(fistPinnedHeaders.classes['igx-grid__mrl-block']).toBeTruthy();
            expect(fistPinnedHeaders.classes['igx-grid__th--pinned-first']).toBeTruthy();
        });
    });
});
