import { async, TestBed, fakeAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxGridModule, IgxGridComponent } from './index';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { DefaultGridComponent } from './grid.groupby.spec';
import { GridFeaturesComponent, PinOnInitAndSelectionComponent, PinningComponent } from '../../test-utils/grid-samples.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';

describe('IgxGrid - Column Pinning #grid ', () => {
    configureTestSuite();

    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridComponent,
                GridFeaturesComponent,
                PinningComponent,
                PinOnInitAndSelectionComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    describe('Initially pinned columns', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));


        it('should correctly initialize when there are initially pinned columns.', () => {

            // verify pinned/unpinned collections
            expect(grid.pinnedColumns.length).toEqual(2);
            expect(grid.unpinnedColumns.length).toEqual(9);

            // verify DOM
            const firstIndexCell = grid.getCellByColumn(0, 'CompanyName');
            expect(firstIndexCell.visibleColumnIndex).toEqual(0);

            const lastIndexCell = grid.getCellByColumn(0, 'ContactName');
            expect(lastIndexCell.visibleColumnIndex).toEqual(1);
            expect(GridFunctions.isCellPinned(lastIndexCell)).toBe(true);

            const headers = GridFunctions.getColumnHeaders(fix);

            expect(headers[0].context.column.field).toEqual('CompanyName');

            expect(headers[1].context.column.field).toEqual('ContactName');
            expect(GridFunctions.isHeaderPinned(headers[1].parent)).toBe(true);

            // verify container widths
            GridFunctions.verifyPinnedAreaWidth(grid, 400);
            GridFunctions.verifyUnpinnedAreaWidth(grid, 400);
        });

        it('should allow pinning/unpinning via the grid API', () => {

            // Unpin column
            grid.unpinColumn('CompanyName');
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
            expect(GridFunctions.isCellPinned(cell)).toBe(false);

            const thirdHeader = GridFunctions.getColumnHeaders(fix)[2];

            expect(thirdHeader.context.column.field).toEqual('CompanyName');
            expect(GridFunctions.isHeaderPinned(thirdHeader)).toBe(false);

            // verify container widths
            GridFunctions.verifyPinnedAreaWidth(grid, 200);
            GridFunctions.verifyUnpinnedAreaWidth(grid, 600);

            // pin back the column.
            grid.pinColumn('CompanyName');
            fix.detectChanges();

            // verify column is pinned
            expect(grid.pinnedColumns.length).toEqual(2);
            expect(grid.unpinnedColumns.length).toEqual(9);

            // verify container widths
            GridFunctions.verifyPinnedAreaWidth(grid, 400);
            GridFunctions.verifyUnpinnedAreaWidth(grid, 400);

            expect(col.pinned).toBe(true);
            expect(col.visibleIndex).toEqual(1);

            cell = grid.getCellByColumn(0, 'CompanyName');
            expect(cell.visibleColumnIndex).toEqual(1);
            expect(GridFunctions.isCellPinned(cell)).toBe(true);
        });

        it('should allow pinning/unpinning via the column API', () => {
            const col = grid.getColumnByName('ID');

            col.pinned = true;
            fix.detectChanges();

            // verify column is pinned
            expect(col.pinned).toBe(true);
            expect(col.visibleIndex).toEqual(2);

            expect(grid.pinnedColumns.length).toEqual(3);
            expect(grid.unpinnedColumns.length).toEqual(8);

            // verify container widths
            GridFunctions.verifyPinnedAreaWidth(grid, 600);
            GridFunctions.verifyUnpinnedAreaWidth(grid, 200);

            col.pinned = false;
            fix.detectChanges();

            // verify column is unpinned
            expect(col.pinned).toBe(false);
            expect(col.visibleIndex).toEqual(2);

            expect(grid.pinnedColumns.length).toEqual(2);
            expect(grid.unpinnedColumns.length).toEqual(9);

            // verify container widths
            GridFunctions.verifyPinnedAreaWidth(grid, 400);
            GridFunctions.verifyUnpinnedAreaWidth(grid, 400);
        });

        it('on unpinning should restore the original location(index) of the column', () => {

            const col = grid.getColumnByName('ContactName');
            expect(col.index).toEqual(2);

            // unpin
            col.pinned = false;
            fix.detectChanges();

            // check props
            expect(col.index).toEqual(2);
            expect(col.visibleIndex).toEqual(2);

            // check DOM
            const thirdHeader = GridFunctions.getColumnHeaders(fix)[2];

            expect(thirdHeader.context.column.field).toEqual('ContactName');
            expect(GridFunctions.isHeaderPinned(thirdHeader)).toBe(false);

        });

        it('should correctly initialize pinned columns z-index values.', () => {

            const headers = GridFunctions.getColumnGroupHeaders(fix);

            // First two headers are pinned
            expect(headers[0].componentInstance.zIndex).toEqual(9999);
            expect(headers[1].componentInstance.zIndex).toEqual(9998);

            grid.pinColumn('Region');
            fix.detectChanges();

            // First three headers are pinned
            const secondColumnGroupHeader = GridFunctions.getColumnGroupHeaders(fix)[2];
            expect(secondColumnGroupHeader.componentInstance.zIndex).toEqual(9997);
        });

        it('should not pin/unpin columns which are already pinned/unpinned', () => {

            const pinnedColumnsLength = grid.pinnedColumns.length;
            const unpinnedColumnsLength = grid.unpinnedColumns.length;

            let result = grid.pinColumn('CompanyName');
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(pinnedColumnsLength);
            expect(result).toBe(false);

            result = grid.unpinColumn('City');
            fix.detectChanges();

            expect(grid.unpinnedColumns.length).toEqual(unpinnedColumnsLength);
            expect(result).toBe(false);
        });

        it('should fix column when grid width is 100% and column width is set', () => {
            fix.componentInstance.grid.width = '100%';
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(2);
            expect(grid.unpinnedColumns.length).toEqual(9);
        });
    });

    describe('Features', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridFeaturesComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('should allow filter pinned columns', () => {

            // Contains filter
            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();
            const firstCell = grid.getCellByColumn(0, 'ID');
            const secondCell = grid.getCellByColumn(1, 'ID');

            expect(grid.rowList.length).toEqual(2);
            expect(parseInt(GridFunctions.getValueFromCellElement(firstCell), 10)).toEqual(1);
            expect(parseInt(GridFunctions.getValueFromCellElement(secondCell), 10)).toEqual(3);

            // Unpin column
            grid.unpinColumn('ProductName');
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(2);
            expect(parseInt(GridFunctions.getValueFromCellElement(firstCell), 10)).toEqual(1);
            expect(parseInt(GridFunctions.getValueFromCellElement(secondCell), 10)).toEqual(3);
        });

        it('should allow sorting pinned columns', () => {

            const currentColumn = 'ProductName';
            const releasedColumn = 'Released';

            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: true });

            fix.detectChanges();

            expect(grid.getCellByColumn(0, currentColumn).value).toEqual(null);
            expect(grid.getCellByColumn(0, releasedColumn).value).toEqual(true);
            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual('Some other item with Script');
            expect(grid.getCellByColumn(grid.data.length - 1, releasedColumn).value).toEqual(null);

            // Unpin column
            grid.unpinColumn('ProductName');
            fix.detectChanges();

            expect(grid.getCellByColumn(0, currentColumn).value).toEqual(null);
            expect(grid.getCellByColumn(0, releasedColumn).value).toEqual(true);
            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual('Some other item with Script');
            expect(grid.getCellByColumn(grid.data.length - 1, releasedColumn).value).toEqual(null);
        });
    });

    describe('', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(PinningComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('should emit onColumnPinning event and allow changing the insertAtIndex param.', () => {

            spyOn(grid.onColumnPinning, 'emit').and.callThrough();

            const idCol = grid.getColumnByName('ID');
            const idColIndex = idCol.index;
            idCol.pinned = true;
            fix.detectChanges();
            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(1);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith({
                column: idCol,
                insertAtIndex: 0,
                isPinned: true
            });
            expect(idCol.visibleIndex).toEqual(0);

            const cityCol = grid.getColumnByName('City');
            cityCol.pinned = true;
            fix.detectChanges();
            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(2);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith({
                column: cityCol,
                insertAtIndex: 0,
                isPinned: true
            });
            expect(cityCol.visibleIndex).toEqual(0);

            idCol.pinned = false;
            fix.detectChanges();
            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(3);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith({
                column: idCol,
                insertAtIndex: idColIndex,
                isPinned: false
            });
            expect(cityCol.visibleIndex).toEqual(0);

            // check DOM
            const headers = GridFunctions.getColumnHeaders(fix);
            expect(headers[0].context.column.field).toEqual('City');
            expect(headers[1].context.column.field).toEqual('ID');
        });

        it('should allow hiding/showing pinned column.', () => {

            const col = grid.getColumnByName('CompanyName');
            col.pinned = true;
            fix.detectChanges();
            expect(grid.pinnedColumns.length).toEqual(1);
            expect(grid.unpinnedColumns.length).toEqual(9);

            col.hidden = true;
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(0);
            expect(grid.unpinnedColumns.length).toEqual(9);

            let firstHeader = GridFunctions.getColumnHeaders(fix)[0];

            expect(firstHeader.context.column.field).toEqual('ID');
            expect(GridFunctions.isHeaderPinned(firstHeader)).toBe(false);

            col.hidden = false;
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(1);
            expect(grid.unpinnedColumns.length).toEqual(9);

            firstHeader = GridFunctions.getColumnHeaders(fix)[0];

            expect(firstHeader.context.column.field).toEqual('CompanyName');
            expect(GridFunctions.isHeaderPinned(firstHeader.parent)).toBe(true);
        });

        it('should allow pinning a hidden column.', () => {

            const col = grid.getColumnByName('CompanyName');

            col.hidden = true;
            col.pinned = true;
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(0);
            expect(grid.unpinnedColumns.length).toEqual(9);

            col.hidden = false;
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(1);
            expect(grid.unpinnedColumns.length).toEqual(9);
        });

        it('should allow hiding columns in the unpinned area.', () => {

            const col1 = grid.getColumnByName('CompanyName');
            const col2 = grid.getColumnByName('ID');

            col1.pinned = true;
            col2.hidden = true;
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(1);
            expect(grid.unpinnedColumns.length).toEqual(8);

            const headers = GridFunctions.getColumnHeaders(fix);

            expect(headers[0].context.column.field).toEqual('CompanyName');
            expect(headers[1].context.column.field).toEqual('ContactName');
        });

        it('should not reject pinning a column if unpinned area width is less than 20% of the grid width', () => {

            grid.columns.forEach((column) => {
                switch (column.index) {
                    case 0:
                    case 1:
                    case 4:
                    case 6:
                        column.pinned = true;
                }
            });

            fix.detectChanges();

            grid.columns.forEach((column) => {
                switch (column.index) {
                    case 0:
                    case 1:
                    case 4:
                    case 6:
                        expect(column.pinned).toBe(true);
                }
            });
        });
    });
});
