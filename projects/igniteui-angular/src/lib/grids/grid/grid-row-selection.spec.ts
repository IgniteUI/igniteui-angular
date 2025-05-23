import { TestBed, fakeAsync, tick, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxStringFilteringOperand, IgxNumberFilteringOperand, IgxBooleanFilteringOperand } from '../../data-operations/filtering-condition';
import {
    RowSelectionComponent,
    SelectionWithScrollsComponent,
    SingleRowSelectionComponent,
    RowSelectionWithoutPrimaryKeyComponent,
    SelectionWithTransactionsComponent,
    GridCustomSelectorsComponent
} from '../../test-utils/grid-samples.spec';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { GridSelectionMode } from '../common/enums';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { SortingDirection } from '../../data-operations/sorting-strategy';
import { IRowSelectionEventArgs } from '../public_api';

const DEBOUNCETIME = 30;
const SCROLL_DEBOUNCETIME = 100;


describe('IgxGrid - Row Selection #grid', () => {

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                RowSelectionComponent,
                SelectionWithScrollsComponent,
                RowSelectionWithoutPrimaryKeyComponent,
                SingleRowSelectionComponent,
                SelectionWithTransactionsComponent,
                GridCustomSelectorsComponent
            ]
        }).compileComponents();
    }));

    describe('Base tests', () => {
        let fix: ComponentFixture<RowSelectionComponent>;
        let grid: IgxGridComponent;
        const gridData = SampleTestData.foodProductDataExtended();

        beforeEach(() => {
            fix = TestBed.createComponent(RowSelectionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        it('Should have checkbox on each row', async () => {
            // There can be no virtual scrolling on this grid with its preset height
            grid.height = '300px';
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowHasCheckbox(fix);
            GridSelectionFunctions.verifySelectionCheckBoxesAlignment(grid);

            for (const row of grid.rowList.toArray()) {
                GridSelectionFunctions.verifyRowHasCheckbox(row.nativeElement);
            }

            GridFunctions.scrollTop(grid, 500);
            await wait(SCROLL_DEBOUNCETIME);
            fix.detectChanges();

            // Verify the grid has scrolled
            expect(grid.rowList.first.cells.first.value).not.toBe(1);
            GridSelectionFunctions.verifySelectionCheckBoxesAlignment(grid);

            for (const row of grid.rowList.toArray()) {
                GridSelectionFunctions.verifyRowHasCheckbox(row.nativeElement);
            }
        });

        it('Should persist through scrolling vertical', async () => {
            // There can be no virtual scrolling on this grid with its preset height
            grid.height = '300px';
            fix.detectChanges();

            const selectedRow = grid.gridAPI.get_row_by_index(0);
            expect(selectedRow).toBeDefined();

            GridSelectionFunctions.verifyRowSelected(selectedRow, false);

            selectedRow.onRowSelectorClick(UIInteractions.getMouseEvent('click'));
            await wait();
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowSelected(selectedRow);
            expect(grid.selectedRows).toEqual([1]);

            GridFunctions.scrollTop(grid, 500);
            await wait(SCROLL_DEBOUNCETIME);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([1]);
            GridSelectionFunctions.verifyRowSelected(grid.rowList.first, false);

            GridFunctions.scrollTop(grid, 0);
            await wait(SCROLL_DEBOUNCETIME);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowSelected(selectedRow);
            expect(grid.selectedRows).toEqual([1]);
        });

        it('Should have correct checkboxes position when scroll left', (async () => {
            grid.width = '300px';
            fix.detectChanges();
            GridSelectionFunctions.verifySelectionCheckBoxesAlignment(grid);

            GridFunctions.scrollLeft(grid, 1000);
            await wait(SCROLL_DEBOUNCETIME);
            fix.detectChanges();

            GridSelectionFunctions.verifySelectionCheckBoxesAlignment(grid);

            GridFunctions.scrollLeft(grid, 0);
            await wait(SCROLL_DEBOUNCETIME);
            fix.detectChanges();

            GridSelectionFunctions.verifySelectionCheckBoxesAlignment(grid);
        }));

        it('Header checkbox should select/deselect all rows', () => {
            const allRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
            const allRowsArray = [gridData[0], gridData[1], gridData[2], gridData[3], gridData[4], gridData[5], gridData[6], gridData[7], gridData[8], gridData[9],
            gridData[10], gridData[11], gridData[12], gridData[13], gridData[14], gridData[15], gridData[16], gridData[17], gridData[18]];
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray());
            expect(grid.selectedRows).toEqual(allRows);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            let args: IRowSelectionEventArgs = {
                added: allRowsArray,
                cancel: false,
                event: jasmine.anything() as any,
                newSelection: allRowsArray,
                oldSelection: [],
                removed: [],
                allRowsSelected: true,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([]);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, false);
            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray(), false);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
            args = {
                oldSelection: allRowsArray,
                newSelection: [],
                added: [],
                removed: allRowsArray,
                event: jasmine.anything() as any,
                cancel: false,
                allRowsSelected: false,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);
        });

        it('Header checkbox should deselect all rows - scenario when clicking first row, while header checkbox is clicked', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(firstRow.selected).toBeTruthy();
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(4);
        });

        it('Checkbox should select/deselect row', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(1);
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();

            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            let args: IRowSelectionEventArgs = {
                added: [gridData[0]],
                cancel: false,
                event: jasmine.anything() as any,
                newSelection: [gridData[0]],
                oldSelection: [],
                removed: [],
                allRowsSelected: false,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);

            expect(grid.selectedRows).toEqual([1]);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            GridSelectionFunctions.clickRowCheckbox(secondRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.selectedRows).toEqual([1, 2]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
            args = {
                added: [gridData[1]],
                cancel: false,
                event: jasmine.anything() as any,
                newSelection: [gridData[0], gridData[1]],
                oldSelection: [gridData[0]],
                removed: [],
                allRowsSelected: false,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);

            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.selectedRows).toEqual([2]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(3);
            args = {
                added: [],
                cancel: false,
                event: jasmine.anything() as any,
                newSelection: [gridData[1]],
                oldSelection: [gridData[0], gridData[1]],
                removed: [gridData[0]],
                allRowsSelected: false,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);

            GridSelectionFunctions.clickRowCheckbox(secondRow);
            fix.detectChanges();
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            expect(grid.selectedRows).toEqual([]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(4);
            args = {
                added: [],
                cancel: false,
                event: jasmine.anything() as any,
                newSelection: [],
                oldSelection: [gridData[1]],
                removed: [gridData[1]],
                allRowsSelected: false,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);
        });

        it('Should display the newly selected rows in correct order', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(1);
            const thirdRow = grid.gridAPI.get_row_by_index(2);
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();

            GridSelectionFunctions.clickRowCheckbox(thirdRow);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            let args: IRowSelectionEventArgs = {
                added: [gridData[2]],
                cancel: false,
                event: jasmine.anything() as any,
                newSelection: [gridData[2]],
                oldSelection: [],
                removed: [],
                allRowsSelected: false,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);

            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
            args = {
                added: [gridData[0]],
                cancel: false,
                event: jasmine.anything() as any,
                newSelection: [gridData[2], gridData[0]],
                oldSelection: [gridData[2]],
                removed: [],
                allRowsSelected: false,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);

            GridSelectionFunctions.clickRowCheckbox(secondRow);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(3);
            args = {
                added: [gridData[1]],
                cancel: false,
                event: jasmine.anything() as any,
                newSelection: [gridData[2], gridData[0], gridData[1]],
                oldSelection: [gridData[2], gridData[0]],
                removed: [],
                allRowsSelected: false,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);

            expect(grid.selectedRows.length).toEqual(3);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyRowSelected(thirdRow);
        });

        it('Should maintain selected rows through data change and new selection', async () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(1);
            spyOn(grid.rowSelectionChanging, 'emit');

            // second detection needed to enable scroll after first runs ngAfterViewInit...
            fix.detectChanges();

            GridFunctions.scrollTop(grid, 500);
            await wait(SCROLL_DEBOUNCETIME);
            fix.detectChanges();

            let row15 = grid.gridAPI.get_row_by_index(14);
            const row15Data = row15.data;
            GridSelectionFunctions.clickRowCheckbox(row15);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            let args: IRowSelectionEventArgs = {
                added: [gridData[14]],
                cancel: false,
                event: jasmine.anything() as any,
                newSelection: [gridData[14]],
                oldSelection: [],
                removed: [],
                allRowsSelected: false,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);

            // halve data:
            grid.data = grid.data.slice(0, 10);
            fix.detectChanges();

            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
            // row 15 no longer in data, expect partial:
            args = {
                ...args,
                added: [gridData[0]],
                newSelection: [{ [grid.primaryKey]: row15Data[grid.primaryKey]}, gridData[0]],
                oldSelection: [{ [grid.primaryKey]: row15Data[grid.primaryKey]}],
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);

            // restore data:
            grid.data = SampleTestData.foodProductDataExtended();
            fix.detectChanges();

            GridSelectionFunctions.clickRowCheckbox(secondRow);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(3);
            args = {
                ...args,
                added: [gridData[1]],
                newSelection: [gridData[14], gridData[0], gridData[1]],
                oldSelection: [gridData[14], gridData[0]],
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);

            expect(grid.selectedRows.length).toEqual(3);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow);

            GridFunctions.scrollTop(grid, 500);
            await wait(SCROLL_DEBOUNCETIME);
            fix.detectChanges();

            row15 = grid.gridAPI.get_row_by_index(14);
            GridSelectionFunctions.verifyRowSelected(row15);
        });

        it('Should select the row with mouse click ', () => {
            expect(grid.selectRowOnClick).toBe(true);
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(1);
            const secondRow = grid.gridAPI.get_row_by_index(2);
            const mockEvent = new MouseEvent('click');

            firstRow.nativeElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(grid.selectedRows).toEqual([2]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith({
                added: [gridData[1]],
                cancel: false,
                event: mockEvent,
                newSelection: [gridData[1]],
                oldSelection: [],
                removed: [],
                allRowsSelected: false,
                owner: grid
            });

            // Click again on same row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);

            // Click on a different row
            secondRow.nativeElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.selectedRows).toEqual([3]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith({
                added: [gridData[2]],
                cancel: false,
                event: mockEvent,
                newSelection: [gridData[2]],
                oldSelection: [gridData[1]],
                removed: [gridData[1]],
                allRowsSelected: false,
                owner: grid
            });
        });
        it('Should select the row only on checkbox click when selectRowOnClick has value false', () => {
            grid.selectRowOnClick = false;
            fix.detectChanges();

            expect(grid.selectRowOnClick).toBe(false);
            grid.hideRowSelectors = false;

            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(1);
            const secondRow = grid.gridAPI.get_row_by_index(2);

            // Click on the first row checkbox
            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();
            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(grid.selectedRows).toEqual([2]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);

            // Click on the second row
            UIInteractions.simulateClickEvent(secondRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
        });
        it('Should select multiple rows with clicking and holding Ctrl', () => {
            expect(grid.selectRowOnClick).toBe(true);
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(2);
            const secondRow = grid.gridAPI.get_row_by_index(0);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            GridSelectionFunctions.verifyRowSelected(firstRow);

            // Click on a different row
            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
        });
        it('Should deselect selected row with clicking and holding Ctrl', () => {
            expect(grid.selectRowOnClick).toBe(true);
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(2);
            const secondRow = grid.gridAPI.get_row_by_index(0);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            GridSelectionFunctions.verifyRowSelected(firstRow);

            // Click again on this row holding Ctrl
            UIInteractions.simulateClickEvent(firstRow.nativeElement, false, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);

            // Click on the first and second row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(4);

            // Click again on the second row
            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(5);
        });
        it('Should NOT select rows with clicking and holding Ctrl when selectRowOnClick has false value', () => {
            grid.selectRowOnClick = false;
            grid.hideRowSelectors = false;
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(2);
            const secondRow = grid.gridAPI.get_row_by_index(0);
            const thirdRow = grid.gridAPI.get_row_by_index(4);

            // Click on the first row checkbox
            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();
            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);

            // Click on the second row checkbox
            GridSelectionFunctions.clickRowCheckbox(secondRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);

            // Click + Ctrl on the third row
            UIInteractions.simulateClickEvent(thirdRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyRowSelected(thirdRow, false);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
        });
        it('Should select multiple rows with clicking Space on a cell', (async () => {
            grid.tbody.nativeElement.focus();
            fix.detectChanges();

            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(1);
            let cell = grid.gridAPI.get_cell_by_index(0, 'ProductName');

            UIInteractions.simulateClickAndSelectEvent(cell);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            GridSelectionFunctions.verifyCellSelected(cell);
            GridSelectionFunctions.verifyRowSelected(firstRow);

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();


            cell = grid.gridAPI.get_cell_by_index(1, 'ProductName');
            GridSelectionFunctions.verifyCellSelected(cell);
            GridSelectionFunctions.verifyRowSelected(firstRow);

            // Click Space on the cell
            GridFunctions.simulateGridContentKeydown(fix, 'space');
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow);

            // Click again Space on the cell
            GridFunctions.simulateGridContentKeydown(fix, 'space');
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(3);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
        }));

        it('Should select multiple rows with Shift + Click', () => {
            expect(grid.selectRowOnClick).toBe(true);
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(1);
            const secondRow = grid.gridAPI.get_row_by_index(4);
            const mockEvent = new MouseEvent('click', { shiftKey: true });

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);

            // Click on other row holding Shift key
            secondRow.nativeElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([2, 3, 4, 5]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith({
                added: [gridData[2], gridData[3], gridData[4]],
                cancel: false,
                event: mockEvent,
                newSelection: [gridData[1], gridData[2], gridData[3], gridData[4]],
                oldSelection: [gridData[1]],
                removed: [],
                allRowsSelected: false,
                owner: grid
            });

            for (let index = 1; index < 5; index++) {
                const row = grid.gridAPI.get_row_by_index(index);
                GridSelectionFunctions.verifyRowSelected(row);
            }
        });

        it('Should select the correct rows with Shift + Click when grouping is activated', () => {
            expect(grid.selectRowOnClick).toBe(true);
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });

            fix.detectChanges();

            const firstGroupRow = grid.gridAPI.get_row_by_index(1);
            const lastGroupRow = grid.gridAPI.get_row_by_index(4);

            // Clicking on the first row within a group
            UIInteractions.simulateClickEvent(firstGroupRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstGroupRow);

            // Simulate Shift+Click on a row within another group
            const mockEvent = new MouseEvent('click', { shiftKey: true });
            lastGroupRow.nativeElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([5, 14, 8]); // ids
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith({
                added: [grid.dataView[2], grid.dataView[4]],
                cancel: false,
                event: jasmine.anything(),
                newSelection: [grid.dataView[1], grid.dataView[2], grid.dataView[4]],
                oldSelection: [grid.dataView[1]],
                removed: [],
                allRowsSelected: false,
                owner: grid
            });

            const expectedSelectedRowIds = [5, 14, 8];
            grid.dataView.forEach((rowData, index) => {
                if (expectedSelectedRowIds.includes(rowData.ProductID)) {
                    const row = grid.gridAPI.get_row_by_index(index);
                    GridSelectionFunctions.verifyRowSelected(row);
                }
            });

        });

        it('Should NOT select multiple rows with Shift + Click when selectRowOnClick has false value', () => {
            grid.selectRowOnClick = false;
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            // Shift + Click
            const firstRow = grid.gridAPI.get_row_by_index(1);
            const secondRow = grid.gridAPI.get_row_by_index(4);

            UIInteractions.simulateClickEvent(firstRow.nativeElement, false, false);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([]);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);

            // Click on other row holding Shift key
            UIInteractions.simulateClickEvent(secondRow.nativeElement, true, false);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(0);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            for (let index = 1; index < 4; index++) {
                const row = grid.gridAPI.get_row_by_index(index);
                GridSelectionFunctions.verifyRowSelected(row, false);
            }
        });

        it('Should hide/show checkboxes when change hideRowSelectors', () => {
            const firstRow = grid.gridAPI.get_row_by_index(1);

            expect(grid.hideRowSelectors).toBe(false);

            firstRow.onRowSelectorClick(UIInteractions.getMouseEvent('click'));
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);

            grid.hideRowSelectors = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, true, false);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(fix, false, false);
            GridSelectionFunctions.verifyRowHasCheckbox(firstRow.nativeElement, false, false);

            grid.hideRowSelectors = false;
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(fix);
            GridSelectionFunctions.verifyRowHasCheckbox(firstRow.nativeElement);
        });

        it('Should be able to change RowSelection to none', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            expect(grid.rowSelection).toEqual(GridSelectionMode.multiple);

            grid.selectRows([1]);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);

            grid.rowSelection = GridSelectionMode.none;
            fix.detectChanges();

            expect(grid.rowSelection).toEqual(GridSelectionMode.none);
            GridSelectionFunctions.verifyRowSelected(firstRow, false, false);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(fix, false, false);
            GridSelectionFunctions.verifyRowHasCheckbox(firstRow.nativeElement, false, false);

            // Click on a row
            firstRow.onRowSelectorClick(UIInteractions.getMouseEvent('click'));
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false, false);
        });

        it('Should be able to change RowSelection to single', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(1);
            expect(grid.rowSelection).toEqual(GridSelectionMode.multiple);

            grid.selectRows([1]);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);

            grid.rowSelection = GridSelectionMode.single;
            fix.detectChanges();

            expect(grid.rowSelection).toEqual(GridSelectionMode.single);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(fix, false);
            GridSelectionFunctions.verifyRowHasCheckbox(firstRow.nativeElement);
            GridSelectionFunctions.verifySelectionCheckBoxesAlignment(grid);

            // Click on a row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);

            // Click on another row holding Ctrl
            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
        });

        it('Should be able to cancel rowSelectionChanging event', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            grid.rowSelectionChanging.subscribe((e: IRowSelectionEventArgs) => {
                e.cancel = true;
            });

            // Click on a row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();
            GridSelectionFunctions.verifyRowSelected(firstRow, false);

            // Click on a row checkbox
            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();
            GridSelectionFunctions.verifyRowSelected(firstRow, false);

            // Click on header checkbox
            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);

            // Select rows from API
            grid.selectRows([2, 3]);
            fix.detectChanges();
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_index(1));
            GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_index(2));

            // Click on header checkbox
            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_index(1));
            GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_index(2));

            // Select all rows from API
            grid.selectAllRows();
            fix.detectChanges();
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_index(1));
            GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_index(2));

            // Click on header checkbox
            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_index(1));
            GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_index(2));
        });

        it('Should be able to programmatically overwrite the selection using rowSelectionChanging event', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(1);
            const thirdRow = grid.gridAPI.get_row_by_index(2);
            grid.rowSelectionChanging.subscribe((e: IRowSelectionEventArgs) => {
                if (e.added.length > 0 && (e.added[0].ProductID) % 2 === 0) {
                    e.newSelection = e.oldSelection || [];
                }
            });

            GridSelectionFunctions.verifyRowsArraySelected([firstRow, secondRow, thirdRow], false);

            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            expect(firstRow.selected).toBeTruthy();
            expect(secondRow.selected).toBeFalsy();
            expect(thirdRow.selected).toBeFalsy();

            GridSelectionFunctions.clickRowCheckbox(firstRow);
            GridSelectionFunctions.clickRowCheckbox(secondRow);
            fix.detectChanges();

            expect(firstRow.selected).toBeFalsy();
            expect(secondRow.selected).toBeFalsy();
            GridSelectionFunctions.verifyRowsArraySelected([firstRow, secondRow, thirdRow], false);
        });

        it('ARIA support', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0).nativeElement;
            const headerCheckbox = GridSelectionFunctions.getRowCheckboxInput(GridSelectionFunctions.getHeaderRow(fix));

            expect(firstRow.getAttribute('aria-selected')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Select all');

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(firstRow.getAttribute('aria-selected')).toMatch('true');
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('true');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Deselect all');

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(firstRow.getAttribute('aria-selected')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Select all');
        });

        it('ARIA support when there is filtered data', async () => {
            grid.filter('ProductName', 'Ca', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            const firstRow = grid.gridAPI.get_row_by_index(0).nativeElement;
            const headerCheckbox = GridSelectionFunctions.getRowCheckboxInput(GridSelectionFunctions.getHeaderRow(fix));
            expect(firstRow.getAttribute('aria-selected')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Select all filtered');

            grid.onHeaderSelectorClick(UIInteractions.getMouseEvent('click'));
            fix.detectChanges();

            expect(firstRow.getAttribute('aria-selected')).toMatch('true');
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('true');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Deselect all filtered');

            grid.onHeaderSelectorClick(UIInteractions.getMouseEvent('click'));
            await wait();
            fix.detectChanges();

            expect(firstRow.getAttribute('aria-selected')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Select all filtered');

            grid.clearFilter();
            fix.detectChanges();

            expect(firstRow.getAttribute('aria-selected')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Select all');
        });
    });

    describe('RowSelection none', () => {
        let fix: ComponentFixture<SelectionWithScrollsComponent>;
        let grid: IgxGridComponent;

        beforeEach(() => {
            fix = TestBed.createComponent(SelectionWithScrollsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        it('Change  RowSelection to multiple ', fakeAsync(() => {
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(fix, false, false);
            GridSelectionFunctions.verifyRowHasCheckbox(grid.gridAPI.get_row_by_index(0).nativeElement, false, false);

            grid.selectRows([475]);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_index(0), true, false);

            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            GridSelectionFunctions.verifySelectionCheckBoxesAlignment(grid);
            GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_index(0), false, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(fix);
            GridSelectionFunctions.verifyRowHasCheckbox(grid.gridAPI.get_row_by_index(0).nativeElement);
        }));
    });

    describe('RowSelection single', () => {
        let fix: ComponentFixture<SingleRowSelectionComponent>;
        let grid: IgxGridComponent;
        const gridData = SampleTestData.foodProductDataExtended();

        beforeEach(() => {
            fix = TestBed.createComponent(SingleRowSelectionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        it('Header checkbox should NOT select/deselect all rows when selectionMode is single', () => {
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, false);
            GridSelectionFunctions.verifyRowsArraySelected([]);
            expect(grid.selectedRows).toEqual([]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(0);

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([]);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, false);
            GridSelectionFunctions.verifyRowsArraySelected([]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(0);
        });

        it('Should have checkbox on each row and do not have header checkbox', () => {
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(fix, false);
            GridSelectionFunctions.verifySelectionCheckBoxesAlignment(grid);

            for (const row of grid.rowList.toArray()) {
                GridSelectionFunctions.verifyRowHasCheckbox(row.nativeElement);
            }

        });

        it('Should be able to select only one row when click on a checkbox', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(1);
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();

            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            let args: IRowSelectionEventArgs = {
                added: [gridData[0]],
                cancel: false,
                event: jasmine.anything() as any,
                newSelection: [gridData[0]],
                oldSelection: [],
                removed: [],
                allRowsSelected: false,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);

            expect(grid.selectedRows).toEqual([1]);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);

            // Click other row checkbox
            GridSelectionFunctions.clickRowCheckbox(secondRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            expect(grid.selectedRows).toEqual([2]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
            args = {
                added: [gridData[1]],
                cancel: false,
                event: jasmine.anything() as any,
                newSelection: [gridData[1]],
                oldSelection: [gridData[0]],
                removed: [gridData[0]],
                allRowsSelected: false,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);
        });
        it('Should NOT select a row on click when selectRowOnClick has false value', () => {
            grid.selectRowOnClick = false;
            grid.tbody.nativeElement.focus();
            fix.detectChanges();

            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const cell = grid.gridAPI.get_cell_by_index(0, 0);
            UIInteractions.simulateClickEvent(cell.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            expect(grid.selectedRows).toEqual([]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(0);
        });
        it('Should not select multiple rows with clicking and holding Ctrl', () => {
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(2);
            const secondRow = grid.gridAPI.get_row_by_index(0);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            expect(grid.selectedRows).toEqual([3]);
            GridSelectionFunctions.verifyRowSelected(firstRow);

            // Click on a different row holding Ctrl
            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            expect(grid.selectedRows).toEqual([1]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
        });
        it('Should deselect a selected row with clicking and holding Ctrl', () => {
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(2);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            expect(grid.selectedRows).toEqual([3]);
            GridSelectionFunctions.verifyRowSelected(firstRow);

            // Click on the same row holding Ctrl
            UIInteractions.simulateClickEvent(firstRow.nativeElement, false, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            expect(grid.selectedRows.length).toEqual(0);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
        });
        it('Should not select a row with clicking and holding Ctrl when selectRowOnClick has false value', () => {
            grid.selectRowOnClick = false;
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(2);
            const secondRow = grid.gridAPI.get_row_by_index(0);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(0);
            expect(grid.selectedRows).toEqual([]);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);

            // Click on a different row holding Ctrl
            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            expect(grid.selectedRows).toEqual([]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(0);
        });
        it('Should not select multiple rows with clicking Space on a cell', (async () => {
            grid.tbody.nativeElement.focus();
            fix.detectChanges();

            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(1);
            let cell = grid.gridAPI.get_cell_by_index(0, 'ProductName');

            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            GridSelectionFunctions.verifyCellSelected(cell);
            GridSelectionFunctions.verifyRowSelected(firstRow);

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            expect(grid.selectedRows).toEqual([1]);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', grid.tbody.nativeElement, true);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            // Click Space on the cell
            cell = grid.gridAPI.get_cell_by_index(1, 'ProductName');
            UIInteractions.triggerKeyDownEvtUponElem('space', grid.tbody.nativeElement, true);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
            expect(grid.selectedRows).toEqual([2]);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow);

            // Click again Space on the cell
            UIInteractions.triggerKeyDownEvtUponElem('space', grid.tbody.nativeElement, true);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(3);
            expect(grid.selectedRows).toEqual([]);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
        }));

        it('Should not select multiple rows with Shift + Click', () => {
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(1);
            const secondRow = grid.gridAPI.get_row_by_index(4);
            const mockEvent = new MouseEvent('click', { shiftKey: true });

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([2]);
            GridSelectionFunctions.verifyRowSelected(firstRow);

            // Click on other row holding Shift key
            secondRow.nativeElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([5]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith({
                added: [gridData[4]],
                cancel: false,
                event: mockEvent,
                newSelection: [gridData[4]],
                oldSelection: [gridData[1]],
                removed: [gridData[1]],
                allRowsSelected: false,
                owner: grid
            });

            GridSelectionFunctions.verifyRowSelected(secondRow);
            for (let index = 1; index < 4; index++) {
                const row = grid.gridAPI.get_row_by_index(index);
                GridSelectionFunctions.verifyRowSelected(row, false);
            }
        });
        it('Should not select row with Shift + Click when selectRowOnClick has false value ', () => {
            grid.selectRowOnClick = false;
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();

            // Shift + Click
            const firstRow = grid.gridAPI.get_row_by_index(1);
            const secondRow = grid.gridAPI.get_row_by_index(4);

            UIInteractions.simulateClickEvent(firstRow.nativeElement, false, false);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([]);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);

            // Click on other row holding Shift key
            UIInteractions.simulateClickEvent(secondRow.nativeElement, true, false);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(0);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            for (let index = 1; index < 4; index++) {
                const row = grid.gridAPI.get_row_by_index(index);
                GridSelectionFunctions.verifyRowSelected(row, false);
            }
        });
        it('Should hide/show checkboxes when change hideRowSelectors', () => {
            const firstRow = grid.gridAPI.get_row_by_index(1);

            expect(grid.hideRowSelectors).toBe(false);

            firstRow.onRowSelectorClick(UIInteractions.getMouseEvent('click'));
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);

            grid.hideRowSelectors = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, true, false);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(fix, false, false);
            GridSelectionFunctions.verifyRowHasCheckbox(firstRow.nativeElement, false, false);

            grid.hideRowSelectors = false;
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(fix, false);
            GridSelectionFunctions.verifyRowHasCheckbox(firstRow.nativeElement);
        });

        it('Should be able to select multiple rows from API', () => {
            grid.selectRows([1, 3, 5], true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowsArraySelected(
                [grid.gridAPI.get_row_by_index(0), grid.gridAPI.get_row_by_index(2), grid.gridAPI.get_row_by_index(4)]);
            expect(grid.selectedRows).toEqual([1, 3, 5]);

            grid.selectRows([1, 2, 4], false);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowsArraySelected(
                [grid.gridAPI.get_row_by_index(0),
                grid.gridAPI.get_row_by_index(1),
                grid.gridAPI.get_row_by_index(2),
                grid.gridAPI.get_row_by_index(3),
                grid.gridAPI.get_row_by_index(4)]);
            expect(grid.selectedRows).toEqual([1, 3, 5, 2, 4]);
        });

        it('Should be able to cancel rowSelectionChanging event', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(1);

            // Click on a row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();
            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(grid.selectedRows).toEqual([1]);

            // Cancel the event
            grid.rowSelectionChanging.subscribe((e: IRowSelectionEventArgs) => {
                e.cancel = true;
            });

            // Click on a row checkbox
            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();
            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(grid.selectedRows).toEqual([1]);

            // Click on other row checkbox
            GridSelectionFunctions.clickRowCheckbox(secondRow);
            fix.detectChanges();
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            expect(grid.selectedRows).toEqual([1]);

            // Click on other row
            UIInteractions.simulateClickEvent(secondRow.nativeElement);
            fix.detectChanges();
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            expect(grid.selectedRows).toEqual([1]);
        });

        it('Should be able to change RowSelection to none', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            expect(grid.rowSelection).toEqual(GridSelectionMode.single);

            grid.selectRows([1]);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);

            grid.rowSelection = GridSelectionMode.none;
            fix.detectChanges();

            expect(grid.rowSelection).toEqual(GridSelectionMode.none);
            GridSelectionFunctions.verifyRowSelected(firstRow, false, false);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(fix, false, false);
            GridSelectionFunctions.verifyRowHasCheckbox(firstRow.nativeElement, false, false);

            // Click on a row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false, false);
        });

        it('Should be able to change RowSelection to multiple', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(2);
            expect(grid.rowSelection).toEqual(GridSelectionMode.single);

            grid.selectRows([1]);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);

            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            expect(grid.rowSelection).toEqual(GridSelectionMode.multiple);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(fix);
            GridSelectionFunctions.verifyRowHasCheckbox(firstRow.nativeElement);
            GridSelectionFunctions.verifySelectionCheckBoxesAlignment(grid);

            // Click on a row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);

            // Click on another row holding Ctrl
            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyRowSelected(firstRow);
        });
    });

    describe('API test', () => {
        let fix: ComponentFixture<RowSelectionComponent>;
        let grid: IgxGridComponent;

        beforeEach(() => {
            fix = TestBed.createComponent(RowSelectionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        it('Should be able to programmatically select all rows and keep the header checkbox intact,  #1298', () => {
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            grid.selectAllRows();
            grid.cdr.detectChanges();
            fix.detectChanges();

            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray());
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            grid.selectAllRows();
            grid.cdr.detectChanges();
            fix.detectChanges();

            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray());
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            grid.deselectAllRows();
            fix.detectChanges();

            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray(), false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(0);
        });

        it('Should be able to select/deselect rows programmatically', () => {
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(1);
            const thirdRow = grid.gridAPI.get_row_by_index(2);
            const forthRow = grid.gridAPI.get_row_by_index(3);

            expect(grid.selectedRows).toEqual([]);
            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray(), false);

            grid.deselectRows([1, 2, 3]);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([]);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);

            grid.selectRows([1, 2, 3], false);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowsArraySelected([firstRow, secondRow, thirdRow]);
            expect(grid.selectedRows).toEqual([1, 2, 3]);

            grid.deselectRows([1, 3]);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowsArraySelected([firstRow, thirdRow], false);
            GridSelectionFunctions.verifyRowSelected(secondRow);

            grid.selectRows([1, 2, 3, 4], true);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowsArraySelected([firstRow, secondRow, thirdRow, forthRow]);
            expect(grid.selectedRows).toEqual([1, 2, 3, 4]);

            grid.selectRows([1], true);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowsArraySelected([secondRow, thirdRow, forthRow], false);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(grid.selectedRows).toEqual([1]);

            grid.deselectRows([2, 3, 100]);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowsArraySelected([secondRow, thirdRow, forthRow], false);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(grid.selectedRows).toEqual([1]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(0);

            grid.deselectRows([1]);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            GridSelectionFunctions.verifyRowsArraySelected([firstRow, secondRow, thirdRow, forthRow], false);
            expect(grid.selectedRows).toEqual([]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(0);
        });

        it('Should be able to correctly select all rows programmatically', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const rowsToCheck = [firstRow, grid.gridAPI.get_row_by_index(1)];
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, false);

            grid.selectAllRows();
            fix.detectChanges();

            GridSelectionFunctions.verifyRowsArraySelected(rowsToCheck);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false, true);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
        });

        it('Should be able to select a row', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            firstRow.selected = true;
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([1]);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            firstRow.selected = false;
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([]);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
        });
    });

    describe('Selection without primaryKey', () => {
        let fix: ComponentFixture<RowSelectionWithoutPrimaryKeyComponent>;
        let grid: IgxGridComponent;
        const gridData = SampleTestData.personIDNameRegionData();

        beforeEach(() => {
            fix = TestBed.createComponent(RowSelectionWithoutPrimaryKeyComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        it('Verify event parameters', () => {
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const firstRow = grid.gridAPI.get_row_by_index(1);
            const secondRow = grid.gridAPI.get_row_by_index(4);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(grid.selectedRows).toEqual([gridData[1]]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            let args: IRowSelectionEventArgs = {
                added: [gridData[1]],
                cancel: false,
                event: jasmine.anything() as any,
                newSelection: [gridData[1]],
                oldSelection: [],
                removed: [],
                allRowsSelected: false,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);

            UIInteractions.simulateClickEvent(secondRow.nativeElement, true);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([gridData[1], gridData[2], gridData[3], gridData[4]]);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
            args = {
                added: [gridData[2], gridData[3], gridData[4]],
                cancel: false,
                event: jasmine.anything() as any,
                newSelection: [gridData[1], gridData[2], gridData[3], gridData[4]],
                oldSelection: [gridData[1]],
                removed: [],
                allRowsSelected: false,
                owner: grid
            };
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledWith(args);
        });

        it('Should persist through scrolling vertical', async () => {
            const selectedRow = grid.gridAPI.get_row_by_index(0);

            grid.height = '200px';
            fix.detectChanges();

            selectedRow.onRowSelectorClick(UIInteractions.getMouseEvent('click'));
            await wait();
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowSelected(selectedRow);
            expect(grid.selectedRows).toEqual([gridData[0]]);

            GridFunctions.scrollTop(grid, 500);
            await wait(SCROLL_DEBOUNCETIME);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([gridData[0]]);
            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList, false);

            GridFunctions.scrollTop(grid, 0);
            await wait(SCROLL_DEBOUNCETIME);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowSelected(selectedRow);
        });

        it('Should be able to select and deselect rows from API', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(2);
            const thirdRow = grid.gridAPI.get_row_by_index(5);

            grid.selectAllRows();
            fix.detectChanges();

            expect(grid.selectedRows).toEqual(gridData);
            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray());
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            grid.deselectRows([firstRow.key, secondRow.key, thirdRow.key]);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([gridData[1], gridData[3], gridData[4], gridData[6]]);
            GridSelectionFunctions.verifyRowsArraySelected([firstRow, secondRow, thirdRow], false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            grid.selectRows([firstRow.key, secondRow.key, thirdRow.key], false);
            fix.detectChanges();

            expect(grid.selectedRows)
                .toEqual([gridData[1], gridData[3], gridData[4], gridData[6], gridData[0], gridData[2], gridData[5]]);
            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray());
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
        });
    });

    describe('Selection with primaryKey', () => {
        let fix: ComponentFixture<RowSelectionComponent>;
        let grid: IgxGridComponent;

        beforeEach(() => {
            fix = TestBed.createComponent(RowSelectionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.data = grid.data.slice(0, 10);
            fix.detectChanges();
        });

        it('Should be able to select row through primaryKey and index', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2).data['ProductName']).toMatch('Aniseed Syrup');
            expect(grid.gridAPI.get_row_by_index(1).data['ProductName']).toMatch('Aniseed Syrup');
        });

        it('Should be able to update a cell in a row through primaryKey', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2).data['UnitsInStock']).toEqual(198);
            grid.updateCell(300, 2, 'UnitsInStock');
            fix.detectChanges();
            expect(grid.getRowByKey(2).data['UnitsInStock']).toEqual(300);
        });

        it('Should be able to update row through primaryKey', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2).data['UnitsInStock']).toEqual(198);
            grid.updateRow({ ProductID: 2, ProductName: 'Aniseed Syrup', UnitsInStock: 300 }, 2);
            fix.detectChanges();
            expect(grid.gridAPI.get_row_by_index(1).data['UnitsInStock']).toEqual(300);
            expect(grid.getRowByKey(2).data['UnitsInStock']).toEqual(300);
        });

        it('Should be able to delete a row through primaryKey', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2)).toBeDefined();
            grid.deleteRow(2);
            fix.detectChanges();
            expect(grid.getRowByKey(2)).toBeUndefined();
            expect(grid.gridAPI.get_row_by_index(2)).toBeDefined();
        });

        it('Should handle update by not overwriting the value in the data column specified as primaryKey', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2)).toBeDefined();
            grid.updateRow({ ProductID: 7, ProductName: 'Aniseed Syrup', UnitsInStock: 300 }, 2);
            fix.detectChanges();
            expect(grid.getRowByKey(7)).toBeDefined();
            expect(grid.gridAPI.get_row_by_index(1)).toBeDefined();
            expect(grid.gridAPI.get_row_by_index(1).data[grid.primaryKey]).toEqual(7);
        });

        it('Should be able to programatically select all rows with a correct reference, #1297', () => {
            grid.selectAllRows();
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
    });

    describe('Integration tests', () => {
        let fix: ComponentFixture<RowSelectionComponent>;
        let grid: IgxGridComponent;

        beforeEach(() => {
            fix = TestBed.createComponent(RowSelectionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        it('Paging: Should persist through paging', () => {
            fix.componentInstance.paging = true;
            fix.detectChanges();

            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(1);
            const middleRow = grid.gridAPI.get_row_by_index(3);

            secondRow.onRowSelectorClick(UIInteractions.getMouseEvent('click'));
            middleRow.onRowSelectorClick(UIInteractions.getMouseEvent('click'));
            grid.notifyChanges(true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyRowSelected(middleRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            grid.paginator.nextPage();
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            GridSelectionFunctions.verifyRowSelected(middleRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            firstRow.onRowSelectorClick(UIInteractions.getMouseEvent('click'));
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            GridSelectionFunctions.verifyRowSelected(middleRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            grid.paginator.previousPage();
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyRowSelected(middleRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
        });

        it('Paging: Should persist all rows selection through paging', () => {
            fix.componentInstance.paging = true;
            fix.detectChanges();

            const secondRow = grid.gridAPI.get_row_by_index(1);
            grid.onHeaderSelectorClick(UIInteractions.getMouseEvent('click'));
            fix.detectChanges();
            grid.notifyChanges();
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray());

            grid.paginator.nextPage();
            fix.detectChanges();
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray());

            // Click on a single row
            secondRow.onClick(UIInteractions.getMouseEvent('click'));
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowSelected(secondRow);

            grid.paginator.previousPage();
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray(), false);
        });

        it('Paging: Should be able to select rows with Shift and Click', () => {
            fix.componentInstance.paging = true;
            fix.detectChanges();

            const firstRow = grid.gridAPI.get_row_by_index(0);
            const thirdRow = grid.gridAPI.get_row_by_index(3);
            grid.onHeaderSelectorClick(UIInteractions.getMouseEvent('click'));

            // Select first row on first page
            firstRow.onClick(UIInteractions.getMouseEvent('click'));
            fix.detectChanges();
            grid.notifyChanges();
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowSelected(firstRow);

            grid.paginator.nextPage();
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray(), false);

            // Click on the last row in page holding Shift
            thirdRow.onClick(UIInteractions.getMouseEvent('click', false, true, false));
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray());

            grid.paginator.previousPage();
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList.toArray());
        });

        it('CRUD: Should handle the deselection on a selected row properly', () => {
            let firstRow = grid.gridAPI.get_row_by_key(1);
            grid.selectRows([1]);

            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            grid.deleteRow(1);
            fix.detectChanges();

            expect(grid.getRowByKey(1)).toBeUndefined();
            expect(grid.selectedRows.includes(1)).toBe(false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);

            grid.selectAllRows();
            fix.detectChanges();

            firstRow = grid.gridAPI.get_row_by_key(2);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            GridSelectionFunctions.verifyRowSelected(firstRow);

            grid.deleteRow(2);
            fix.detectChanges();

            expect(grid.gridAPI.get_row_by_key(2)).toBeUndefined();
            expect(grid.selectedRows.includes(2)).toBe(false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            grid.deselectRows([3]);
            fix.detectChanges();

            expect(grid.selectedRows.includes(3)).toBe(false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            grid.deleteRow(3);
            fix.detectChanges();

            expect(grid.gridAPI.get_row_by_key(3)).toBeUndefined();
            expect(grid.selectedRows.includes(3)).toBe(false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
        });

        it('CRUD: Should handle the adding new row properly', () => {
            grid.selectAllRows();
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            grid.addRow({ ProductID: 20, ProductName: 'test', InStock: true, UnitsInStock: 1, OrderDate: new Date('2019-03-01') });
            fix.detectChanges();

            expect(grid.selectedRows.includes(20)).toBe(false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
        });

        it('CRUD: Should update selected row when update cell', () => {
            let firstRow = grid.gridAPI.get_row_by_index(1);
            firstRow.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(grid.selectedRows).toEqual([2]);
            grid.updateCell(102, 2, 'ProductID');
            fix.detectChanges();

            firstRow = grid.gridAPI.get_row_by_index(1);
            expect(firstRow.key).toEqual(102);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(grid.selectedRows).toEqual([102]);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
        });

        it('CRUD: Should update selected row when update row', () => {
            grid.selectAllRows();
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            grid.updateRow({ ProductID: 103, ProductName: 'test', InStock: true, UnitsInStock: 1, OrderDate: new Date('2019-03-01') }, 3);
            fix.detectChanges();

            const row = grid.gridAPI.get_row_by_index(2);
            GridSelectionFunctions.verifyRowSelected(row);
            expect(row.key).toEqual(103);
            expect(grid.selectedRows.includes(3)).toBe(false);
            expect(grid.selectedRows.includes(103)).toBe(true);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
        });

        it('Sorting: Should have persistent selection through data operations', () => {
            const rowsToCheck = [grid.gridAPI.get_row_by_index(0), grid.gridAPI.get_row_by_index(1)];
            GridSelectionFunctions.verifyRowsArraySelected(rowsToCheck, false);

            grid.selectRows([1, 2], false);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowsArraySelected(rowsToCheck, true);

            grid.sort({ fieldName: 'UnitsInStock', dir: SortingDirection.Desc, ignoreCase: true });
            fix.detectChanges();

            GridSelectionFunctions.verifyRowsArraySelected(rowsToCheck, false);

            grid.clearSort('UnitsInStock');
            fix.detectChanges();

            GridSelectionFunctions.verifyRowsArraySelected(rowsToCheck, true);
        });

        it('Summaries integration', () => {
            grid.getColumnByName('ProductID').hasSummary = true;
            fix.detectChanges();

            expect(grid.summariesMargin).toBe(grid.featureColumnsWidth());
        });

        it('Filtering: Should properly check the header checkbox state when filtering, #2469', () => {
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();

            grid.filter('ProductID', 10, IgxNumberFilteringOperand.instance().condition('greaterThanOrEqualTo'), true);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(0);
            expect(grid.selectedRows).toEqual([]);

            grid.clearFilter('ProductID');
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(0);

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            grid.filter('ProductID', 0, IgxNumberFilteringOperand.instance().condition('greaterThanOrEqualTo'), true);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            expect(grid.selectedRows.length).toBe(19);

            grid.filter('ProductID', 100, IgxNumberFilteringOperand.instance().condition('greaterThanOrEqualTo'), true);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            expect(grid.rowList.length).toBe(0);
            expect(grid.selectedRows.length).toBe(19);

            grid.clearFilter();
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            expect(grid.selectedRows.length).toBe(19);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);
        });

        it('Filtering: Should select correct rows when filter is applied', () => {
            spyOn(grid.rowSelectionChanging, 'emit').and.callThrough();
            const secondRow = grid.gridAPI.get_row_by_index(1);

            GridSelectionFunctions.clickRowCheckbox(secondRow);
            fix.detectChanges();

            expect(secondRow.selected).toBeTruthy();
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);

            grid.filter('ProductName', 'Ca', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(1);

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);

            grid.clearFilter('ProductName');
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.gridAPI.get_row_by_index(1).selected).toBeTruthy();
            expect(grid.gridAPI.get_row_by_index(2).selected).toBeTruthy();
            expect(grid.gridAPI.get_row_by_index(6).selected).toBeTruthy();

            grid.filter('ProductName', 'Ca', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(2);
            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(3);

            grid.clearFilter('ProductName');
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            expect(grid.gridAPI.get_row_by_index(1).selected).toBeTruthy();
            expect(grid.gridAPI.get_row_by_index(2).selected).toBeFalsy();
            expect(grid.gridAPI.get_row_by_index(6).selected).toBeFalsy();
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(3);

            GridSelectionFunctions.clickRowCheckbox(grid.gridAPI.get_row_by_index(2));
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(4);

            grid.filter('ProductName', 'Ca', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(4);

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(6);

            grid.clearFilter('ProductName');
            fix.detectChanges();

            expect(grid.gridAPI.get_row_by_index(2).selected).toBeFalsy();
            expect(grid.gridAPI.get_row_by_index(1).selected).toBeTruthy();
            expect(grid.rowSelectionChanging.emit).toHaveBeenCalledTimes(6);
        });

        it('Should select only filtered records', () => {
            grid.height = '1100px';
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'UnitsInStock',
                searchVal: 0,
                condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                conditionName: 'greaterThan'
            });
            tree.filteringOperands.push({
                fieldName: 'ProductName',
                searchVal: 'a',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                ignoreCase: true
            });
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();
            GridSelectionFunctions.headerCheckboxClick(grid);
            fix.detectChanges();

            expect(grid.rowList.length).toBe(9);
            expect(grid.selectedRows.length).toBe(9);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(grid, true, false);

            grid.advancedFilteringExpressionsTree = null;
            fix.detectChanges();

            expect(grid.rowList.length).toBe(19);
            expect(grid.selectedRows.length).toBe(9);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(grid, false, true);
        });

        it('Should bind selectedRows properly', () => {
            fix.componentInstance.selectedRows = [1, 2, 3];
            fix.detectChanges();
            expect(grid.gridAPI.get_row_by_index(0).selected).toBeTrue();
            expect(grid.gridAPI.get_row_by_index(4).selected).toBeFalse();

            fix.componentInstance.selectedRows = [4, 5, 6];
            fix.detectChanges();

            expect(grid.gridAPI.get_row_by_index(3).selected).toBeTrue();
            expect(grid.gridAPI.get_row_by_index(0).selected).toBeFalse();
        });

        it('Row Pinning: should update checkbox status correctly when there is pinned row and groupBy', () => {
            grid.pinRow(2);
            fix.detectChanges();

            grid.groupBy({ fieldName: 'InStock', dir: SortingDirection.Desc, ignoreCase: false });

            GridSelectionFunctions.headerCheckboxClick(grid);
            fix.detectChanges();
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true, false);
            expect(grid.selectedRows.length).toBe(grid.data.length);
        });

        it('Should deselect updated row with header checkbox when batchEditing is enbaled and filtering is applied', () => {
            grid.batchEditing = true;
            grid.selectRows([1]);
            grid.filter('InStock', null, IgxBooleanFilteringOperand.instance().condition('true'));
            fix.detectChanges();

            const row = grid.gridAPI.get_row_by_index(0);
            GridSelectionFunctions.verifyRowSelected(row);

            grid.updateRow({ ProductID: 1, ProductName: 'test', InStock: true, UnitsInStock: 1, OrderDate: new Date('2019-03-01') }, 1);
            fix.detectChanges();

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();
            GridSelectionFunctions.verifyRowSelected(row);

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();
            GridSelectionFunctions.verifyRowSelected(row, false);
        });
    });

    describe('Integration with CRUD and transactions', () => {
        let fix: ComponentFixture<SelectionWithTransactionsComponent>;
        let grid: IgxGridComponent;

        beforeEach(() => {
            fix = TestBed.createComponent(SelectionWithTransactionsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();
        });

        it('Should unselect row when delete it', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);

            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            grid.deleteRowById(firstRow.key);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([]);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
        });

        it('Should not allow selecting rows that are deleted', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(1);
            const thirdRow = grid.gridAPI.get_row_by_index(2);

            grid.deleteRowById(firstRow.key);
            grid.deleteRowById(secondRow.key);
            fix.detectChanges();

            grid.selectAllRows();
            fix.detectChanges();

            expect(grid.selectedRows.includes(firstRow.key)).toBe(false);
            expect(grid.selectedRows.includes(secondRow.key)).toBe(false);
            expect(grid.selectedRows.includes(thirdRow.key)).toBe(true);

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            grid.selectRows([firstRow.key, secondRow.key, thirdRow.key]);
            fix.detectChanges();

            expect(grid.selectedRows.includes(firstRow.key)).toBe(true);
            expect(grid.selectedRows.includes(secondRow.key)).toBe(true);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
        });

        it('Should have correct header checkbox when delete a row', async () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(1);

            grid.onHeaderSelectorClick(UIInteractions.getMouseEvent('click'));
            await wait();
            fix.detectChanges();

            GridSelectionFunctions.verifyRowsArraySelected(grid.rowList);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            grid.deleteRowById(firstRow.key);
            fix.detectChanges();

            expect(grid.selectedRows.length).toEqual(7);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            grid.deselectRows([secondRow.key]);
            fix.detectChanges();

            expect(grid.selectedRows.length).toEqual(6);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            grid.deleteRowById(secondRow.key);
            fix.detectChanges();

            expect(grid.selectedRows.length).toEqual(6);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
        });

        it('Should not be possible to select deleted row', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const secondRow = grid.gridAPI.get_row_by_index(3);

            grid.deleteRowById(firstRow.key);
            fix.detectChanges();

            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([]);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([]);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);

            UIInteractions.simulateClickEvent(secondRow.nativeElement);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([secondRow.key]);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            UIInteractions.simulateClickEvent(firstRow.nativeElement, true);
            fix.detectChanges();

            expect(grid.selectedRows).toEqual([secondRow.key]);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(grid.selectedRows.includes(firstRow.key)).toBe(false);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
        });

        it('Should have correct header checkbox when undo row deleting', async () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);

            grid.onHeaderSelectorClick(UIInteractions.getMouseEvent('click'));
            await wait();
            fix.detectChanges();

            expect(grid.selectedRows.includes(firstRow.key)).toBe(true);
            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            grid.deleteRowById(firstRow.key);
            fix.detectChanges();

            expect(grid.selectedRows.includes(firstRow.key)).toBe(false);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            grid.transactions.undo();
            fix.detectChanges();

            expect(grid.selectedRows.length).toBe(7);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            grid.transactions.redo();
            fix.detectChanges();

            expect(grid.selectedRows.includes(firstRow.key)).toBe(false);
            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
        });

        it('Should have correct header checkbox when add row', () => {
            grid.height = '800px';
            fix.detectChanges();

            grid.selectAllRows();
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);

            grid.addRow({ ID: 112, ParentID: 177, Name: 'Ricardo Matias', HireDate: new Date('Dec 27, 2017'), Age: 55, OnPTO: false });
            fix.detectChanges();

            const addedRow = grid.gridAPI.get_row_by_key(112);
            GridSelectionFunctions.verifyRowSelected(addedRow, false);
            expect(grid.selectedRows.includes(112)).toBe(false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            GridSelectionFunctions.clickRowCheckbox(addedRow);
            fix.detectChanges();

            expect(grid.selectedRows.includes(112)).toBe(true);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            GridSelectionFunctions.verifyRowSelected(addedRow);
        });

        it('Should be able to select added row', () => {
            grid.height = '800px';
            fix.detectChanges();

            grid.addRow({ ID: 112, ParentID: 177, Name: 'Ricardo Matias', HireDate: new Date('Dec 27, 2017'), Age: 55, OnPTO: false });
            fix.detectChanges();

            const addedRow = grid.gridAPI.get_row_by_key(112);
            GridSelectionFunctions.verifyRowSelected(addedRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(grid.selectedRows.includes(112)).toBe(true);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            GridSelectionFunctions.verifyRowSelected(addedRow);
        });
    });

    describe('Custom row selectors', () => {
        let fix: ComponentFixture<GridCustomSelectorsComponent>;
        let grid;

        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(GridCustomSelectorsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.rowSelection = GridSelectionMode.multiple;
        }));

        it('Should have the correct properties in the custom row selector template', () => {
            const firstRow = grid.gridAPI.get_row_by_index(0);
            const firstCheckbox = firstRow.nativeElement.querySelector('.igx-checkbox__composite');
            const context = { index: 0, rowID: 'ALFKI', key: 'ALFKI', selected: false };
            const contextUnselect = { index: 0, rowID: 'ALFKI', key: 'ALFKI', selected: true };
            spyOn(fix.componentInstance, 'onRowCheckboxClick').and.callThrough();
            firstCheckbox.click();
            fix.detectChanges();

            expect(fix.componentInstance.onRowCheckboxClick).toHaveBeenCalledTimes(1);
            expect(fix.componentInstance.onRowCheckboxClick).toHaveBeenCalledWith(fix.componentInstance.rowCheckboxClick, context);

            // Verify correct properties when unselecting a row
            firstCheckbox.click();
            fix.detectChanges();

            expect(fix.componentInstance.onRowCheckboxClick).toHaveBeenCalledTimes(2);
            expect(fix.componentInstance.onRowCheckboxClick).toHaveBeenCalledWith(fix.componentInstance.rowCheckboxClick, contextUnselect);
        });

        it('Should have the correct properties in the custom row selector header template', () => {
            const context = { selectedCount: 0, totalCount: 27 };
            const contextUnselect = { selectedCount: 27, totalCount: 27 };
            const headerCheckbox = grid.theadRow.nativeElement.querySelector('.igx-checkbox__composite');
            spyOn(fix.componentInstance, 'onHeaderCheckboxClick').and.callThrough();
            headerCheckbox.click();
            fix.detectChanges();

            expect(fix.componentInstance.onHeaderCheckboxClick).toHaveBeenCalledTimes(1);
            expect(fix.componentInstance.onHeaderCheckboxClick).toHaveBeenCalledWith(fix.componentInstance.headerCheckboxClick, context);

            headerCheckbox.click();
            fix.detectChanges();

            expect(fix.componentInstance.onHeaderCheckboxClick).toHaveBeenCalledTimes(2);
            expect(fix.componentInstance.onHeaderCheckboxClick).
                 toHaveBeenCalledWith(fix.componentInstance.headerCheckboxClick, contextUnselect);
        });

        it('Should have correct indices on all pages', () => {
            grid.paginator.nextPage();
            fix.detectChanges();

            const firstRootRow = grid.gridAPI.get_row_by_index(0);
            expect(firstRootRow.nativeElement.querySelector('.rowNumber').textContent).toEqual('15');
        });

        it('Should allow setting row, group row and header custom templates via Input.', () => {
            grid.rowSelectorTemplate = fix.componentInstance.customRowTemplate;
            grid.headSelectorTemplate = fix.componentInstance.customHeaderTemplate;
            grid.groupByRowSelectorTemplate = fix.componentInstance.customGroupRowTemplate;

            fix.detectChanges();
            grid.groupBy({
                fieldName: 'CompanyName', dir: SortingDirection.Desc, ignoreCase: false
            });
            fix.detectChanges();
            const rowDOM = grid.dataRowList.toArray()[0].nativeElement;
            const groupRowDOM = grid.groupsRowList.toArray()[0].nativeElement
            const rowSelector = rowDOM.querySelector(`.igx-grid__cbx-selection`);
            const groupRowSelector = groupRowDOM.querySelector(`.igx-grid__cbx-selection`);
            const headerSelector = GridSelectionFunctions.getHeaderRow(fix).querySelector(`.igx-grid__cbx-selection`);

            expect(rowSelector.textContent).toBe('CUSTOM SELECTOR: 0');
            expect(groupRowSelector.textContent).toBe('CUSTOM GROUP SELECTOR');
            expect(headerSelector.textContent).toBe('CUSTOM HEADER SELECTOR');
        });
    });
});
