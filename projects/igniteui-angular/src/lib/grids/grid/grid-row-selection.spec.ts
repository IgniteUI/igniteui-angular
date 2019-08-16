import { Component, OnInit, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Calendar } from '../../calendar';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule,  GridSelectionMode, IRowSelectionEventArgs } from './index';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxStringFilteringOperand, IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    GridWithPrimaryKeyComponent,
    RowSelectionComponent,
    SelectionAndPagingComponent,
    SummariesComponent,
    SelectionCancellableComponent,
    SelectionWithScrollsComponent,
    SingleRowSelectionComponent
} from '../../test-utils/grid-samples.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { IgxHierarchicalGridModule } from '../hierarchical-grid/hierarchical-grid.module';
import { HelperUtils } from '../../test-utils/helper-utils.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxGridRowEditingTransactionComponent } from './grid.component.spec';

const DEBOUNCETIME = 30;

describe('IgxGrid - Row Selection', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridWithPrimaryKeyComponent,
                SelectionAndPagingComponent,
                RowSelectionComponent,
                GridWithSelectionFilteringComponent,
                SummariesComponent,
                SelectionCancellableComponent,
                SelectionWithScrollsComponent,
                IgxGridRowEditingTransactionComponent,
                SingleRowSelectionComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule,
                IgxHierarchicalGridModule
            ]
        })
            .compileComponents();
    }));

    describe('Base tests', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(RowSelectionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should have checkbox on each row', (async () => {
            HelperUtils.verifyHeaderRowHasCheckbox(fix);
            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(fix, grid);

            for (const row of grid.rowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(row.nativeElement);
            }

            GridFunctions.setGridScrollTop(grid, 1000);
            await wait(100);
            fix.detectChanges();

            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(fix, grid);

            for (const row of grid.rowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(row.nativeElement);
            }
        }));

        it('Should persist through scrolling vertical', (async () => {
            const selectedRow = grid.getRowByIndex(0);
            expect(selectedRow).toBeDefined();

            HelperUtils.verifyRowSelected(selectedRow, false);

            HelperUtils.clickRowCheckbox(selectedRow);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowSelected(selectedRow);
            expect(grid.selectedRows()).toBeDefined();

            GridFunctions.setGridScrollTop(grid, 500);
            await wait(100);
            fix.detectChanges();

            expect(grid.selectedRows()).toBeDefined();
            HelperUtils.verifyRowSelected(grid.rowList.first, false);

            GridFunctions.setGridScrollTop(grid, 0);
            await wait(100);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowSelected(selectedRow);
        }));

        it('Should have correct checkboxes position when scroll left', (async () => {
            grid.width = '300px';
            fix.detectChanges();
            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(fix, grid);

            GridFunctions.scrollLeft(grid, 1000);
            await wait(100);
            fix.detectChanges();

            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(fix, grid);

            GridFunctions.scrollLeft(grid, 0);
            await wait(100);
            fix.detectChanges();

            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(fix, grid);
        }));

        it('Header checkbox should select/deselect all rows', () => {
            const allRowsArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray());
            expect(grid.selectedRows()).toEqual(allRowsArray);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                added: allRowsArray,
                cancel: false,
                event: jasmine.anything(),
                newSelection: allRowsArray,
                oldSelection: [],
                removed: []
            });

            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([]);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, false);
            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray(), false);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: allRowsArray,
                newSelection: [],
                added: [],
                removed: allRowsArray,
                event: jasmine.anything(),
                cancel: false
            });
        });

        it('Header checkbox should deselect all rows - scenario when clicking first row, while header checkbox is clicked', () => {
            const firstRow = grid.getRowByIndex(0);
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();

            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(firstRow.selected).toBeTruthy();
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(4);
        });

        it('Checkbox should select/deselect row', () => {
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();

            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                added: [1],
                cancel: false,
                event: jasmine.anything(),
                newSelection: [1],
                oldSelection: [],
                removed: []
            });

            expect(grid.selectedRows()).toEqual([1]);
            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(secondRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            HelperUtils.clickRowCheckbox(secondRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.selectedRows()).toEqual([1, 2]);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                added: [2],
                cancel: false,
                event: jasmine.anything(),
                newSelection: [1, 2],
                oldSelection: [1],
                removed: []
            });

            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.selectedRows()).toEqual([2]);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(3);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                added: [],
                cancel: false,
                event: jasmine.anything(),
                newSelection: [2],
                oldSelection: [1, 2],
                removed: [1]
            });

            HelperUtils.clickRowCheckbox(secondRow);
            fix.detectChanges();
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix);
            expect(grid.selectedRows()).toEqual([]);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(4);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                added: [],
                cancel: false,
                event: jasmine.anything(),
                newSelection: [],
                oldSelection: [2],
                removed: [2]
            });
        });

        it('Should select the row with mouse click ', () => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
            const firstRow = grid.getRowByIndex(1);
            const secondRow = grid.getRowByIndex(2);
            const mockEvent = new MouseEvent('click');

            firstRow.nativeElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            expect(grid.selectedRows()).toEqual([2]);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                added: [2],
                cancel: false,
                event: mockEvent,
                newSelection: [2],
                oldSelection: [],
                removed: []
            });

            // Click again on same row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);

            // Click on a different row
            secondRow.nativeElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.selectedRows()).toEqual([3]);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                added: [3],
                cancel: false,
                event: mockEvent,
                newSelection: [3],
                oldSelection: [2],
                removed: [2]
            });
        });

        it('Should select multiple rows with clicking and holding Ctrl', () => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
            const firstRow = grid.getRowByIndex(2);
            const secondRow = grid.getRowByIndex(0);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);
            HelperUtils.verifyRowSelected(firstRow);

            // Click again on this row holding Ctrl
            UIInteractions.simulateClickEvent(firstRow.nativeElement, false, true);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);

            // Click on a different row
            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
        });

        it('Should select multiple rows with clicking Space on a cell', (async () => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);
            let cell = grid.getCellByColumn(0, 'ProductName');

            UIInteractions.simulateClickAndSelectCellEvent(cell);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            HelperUtils.verifyCellSelected(cell);
            HelperUtils.verifyRowSelected(firstRow, false);

            // Press Space key on the cell
            UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);
            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(secondRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            UIInteractions.triggerKeyDownWithBlur('arrowdown', cell.nativeElement, true);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            cell = grid.getCellByColumn(1, 'ProductName');
            HelperUtils.verifyCellSelected(cell);
            HelperUtils.verifyRowSelected(firstRow);

            // Click Space on the cell
            UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(secondRow);

            // Click again Space on the cell
            UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(3);
            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(secondRow, false);
        }));

        it('Should select multiple rows with Shift + Click', () => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
            const firstRow = grid.getRowByIndex(1);
            const secondRow = grid.getRowByIndex(4);
            const mockEvent = new MouseEvent('click', {shiftKey: true});

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);

            // Click on other row holding Shift key
            secondRow.nativeElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([2, 3, 4, 5]);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                added: [3, 4, 5],
                cancel: false,
                event: mockEvent,
                newSelection: [2, 3, 4, 5],
                oldSelection: [2],
                removed: []
            });

            for (let index = 1; index < 5; index++) {
                const row = grid.getRowByIndex(index);
                HelperUtils.verifyRowSelected(row);
            }
        });

        it('Should hide/show checkboxes when change hideRowSelectors', () => {
            const firstRow = grid.getRowByIndex(1);

            expect(grid.hideRowSelectors).toBe(false);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);

            grid.hideRowSelectors = true;
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, true, false);
            HelperUtils.verifyHeaderRowHasCheckbox(fix, false, false);
            HelperUtils.verifyRowHasCheckbox(firstRow.nativeElement, false, false);

            grid.hideRowSelectors = false;
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyHeaderRowHasCheckbox(fix);
            HelperUtils.verifyRowHasCheckbox(firstRow.nativeElement);
        });

        it('Should be able to change RowSelection to none', () => {
            const firstRow = grid.getRowByIndex(0);
            expect(grid.rowSelection).toEqual(GridSelectionMode.multiple);

            grid.selectRows([1]);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);

            grid.rowSelection = GridSelectionMode.none;
            fix.detectChanges();

            expect(grid.rowSelection).toEqual(GridSelectionMode.none);
            HelperUtils.verifyRowSelected(firstRow, false, false);
            HelperUtils.verifyHeaderRowHasCheckbox(fix, false, false);
            HelperUtils.verifyRowHasCheckbox(firstRow.nativeElement, false, false);

            // Click on a row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false, false);
        });

        it('Should be able to change RowSelection to single', () => {
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);
            expect(grid.rowSelection).toEqual(GridSelectionMode.multiple);

            grid.selectRows([1]);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);

            grid.rowSelection = GridSelectionMode.single;
            fix.detectChanges();

            expect(grid.rowSelection).toEqual(GridSelectionMode.single);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowHasCheckbox(fix, false);
            HelperUtils.verifyRowHasCheckbox(firstRow.nativeElement);
            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(fix, grid);

            // Click on a row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);

            // Click on another row holding Ctrl
            UIInteractions.simulateClickEvent(secondRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyRowSelected(firstRow, false);
        });

        it('Should be able to cancel onRowSelectionChange event', () => {
            const firstRow = grid.getRowByIndex(0);
            grid.onRowSelectionChange.subscribe((e: IRowSelectionEventArgs) => {
                e.cancel = true;
            });

            // Click on a row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();
            HelperUtils.verifyRowSelected(firstRow, false);

            // Click on a row checkbox
            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();
            HelperUtils.verifyRowSelected(firstRow, false);

            // Click on header checkbox
            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();
            HelperUtils.verifyHeaderRowCheckboxState(fix);
            HelperUtils.verifyRowSelected(firstRow, false);

            // Select rows from API
            grid.selectRows([2, 3]);
            fix.detectChanges();
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowSelected(grid.getRowByIndex(1));
            HelperUtils.verifyRowSelected(grid.getRowByIndex(2));

            // Click on header checkbox
            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(grid.getRowByIndex(1));
            HelperUtils.verifyRowSelected(grid.getRowByIndex(2));

            // Select all rows from API
            grid.selectAllRows();
            fix.detectChanges();
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(grid.getRowByIndex(1));
            HelperUtils.verifyRowSelected(grid.getRowByIndex(2));

            // Click on header checkbox
            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(grid.getRowByIndex(1));
            HelperUtils.verifyRowSelected(grid.getRowByIndex(2));
        });

        it('Should have persistent selection through data operations - sorting', fakeAsync(() => {
            const rowsToCheck = [grid.getRowByIndex(0), grid.getRowByIndex(1)];
            HelperUtils.verifyRowsArraySelected(rowsToCheck, false);

            grid.selectRows([1, 2], false);
            tick();
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected(rowsToCheck, true);

            grid.sort({ fieldName: 'UnitsInStock', dir: SortingDirection.Desc, ignoreCase: true });
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected(rowsToCheck, false);

            grid.clearSort('UnitsInStock');
            tick();
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected(rowsToCheck, true);
        }));
    });

    describe('API test', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(RowSelectionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should be able to programmatically select all rows and keep the header checkbox intact,  #1298', () => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
            grid.selectAllRows();
            grid.cdr.detectChanges();
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray());
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            grid.selectAllRows();
            grid.cdr.detectChanges();
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray());
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            grid.deselectAllRows();
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray(), false);
            HelperUtils.verifyHeaderRowCheckboxState(fix);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(0);
        });

        it('Should be able to select/deselect rows programmatically', () => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);
            const thirdRow = grid.getRowByIndex(2);
            const forthRow = grid.getRowByIndex(2);

            expect(grid.selectedRows()).toEqual([]);
            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray(), false);

            grid.deselectRows([1, 2, 3]);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([]);
            HelperUtils.verifyHeaderRowCheckboxState(fix);

            grid.selectRows([1, 2, 3], false);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowsArraySelected([firstRow, secondRow, thirdRow]);
            expect(grid.selectedRows()).toEqual([1, 2, 3]);

            grid.deselectRows([1, 3]);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowsArraySelected([firstRow, thirdRow], false);
            HelperUtils.verifyRowSelected(secondRow);

            grid.selectRows([1, 2, 3, 4], true);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowsArraySelected([firstRow, secondRow, thirdRow, forthRow]);
            expect(grid.selectedRows()).toEqual([1, 2, 3, 4]);

            grid.selectRows([1], false);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowsArraySelected([secondRow, thirdRow, forthRow], false);
            HelperUtils.verifyRowSelected(firstRow);
            expect(grid.selectedRows()).toEqual([1]);

            grid.deselectRows([2, 3, 100]);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowsArraySelected([secondRow, thirdRow, forthRow], false);
            HelperUtils.verifyRowSelected(firstRow);
            expect(grid.selectedRows()).toEqual([1]);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(0);

            grid.deselectRows([1]);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix);
            HelperUtils.verifyRowsArraySelected([firstRow, secondRow, thirdRow, forthRow], false);
            expect(grid.selectedRows()).toEqual([]);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(0);
        });

        it('Should be able to correctly select all rows programmatically', fakeAsync(() => {
            const firstRow = grid.getRowByIndex(0);
            const rowsToCheck = [firstRow, grid.getRowByIndex(1)];
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, false);

            grid.selectAllRows();
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected(rowsToCheck, true);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false, true);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
        }));

    });

    describe('RowSelection none', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(SelectionWithScrollsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Change  RowSelection to multiple ', () => {
            HelperUtils.verifyHeaderRowHasCheckbox(fix, false, false);
            HelperUtils.verifyRowHasCheckbox(grid.getRowByIndex(0).nativeElement, false, false);

            grid.selectRows([475]);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(grid.getRowByIndex(0), true, false);

            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(fix, grid);
            HelperUtils.verifyRowSelected(grid.getRowByIndex(0), false, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix);
            HelperUtils.verifyHeaderRowHasCheckbox(fix);
            HelperUtils.verifyRowHasCheckbox(grid.getRowByIndex(0).nativeElement);

        });
    });

    describe('RowSelection single', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(SingleRowSelectionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should have checkbox on each row nd do not have header checkbox', (async () => {
            HelperUtils.verifyHeaderRowHasCheckbox(fix, false);
            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(fix, grid);

            for (const row of grid.rowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(row.nativeElement);
            }

            GridFunctions.setGridScrollTop(grid, 1000);
            await wait(100);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowHasCheckbox(fix, false);
            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(fix, grid);

            for (const row of grid.rowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(row.nativeElement);
            }
        }));

        it('Should be able to select only one row when click on a checkbox', () => {
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();

            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                added: [1],
                cancel: false,
                event: jasmine.anything(),
                newSelection: [1],
                oldSelection: [],
                removed: []
            });

            expect(grid.selectedRows()).toEqual([1]);
            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(secondRow, false);

            // Click other row checkbox
            HelperUtils.clickRowCheckbox(secondRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow);
            expect(grid.selectedRows()).toEqual([2]);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                added: [2],
                cancel: false,
                event: jasmine.anything(),
                newSelection: [2],
                oldSelection: [1],
                removed: [1]
            });
        });

        it('Should not select multiple rows with clicking and holding Ctrl', () => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
            const firstRow = grid.getRowByIndex(2);
            const secondRow = grid.getRowByIndex(0);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);
            expect(grid.selectedRows()).toEqual([3]);
            HelperUtils.verifyRowSelected(firstRow);

            // Click on a different row holding Ctrl
            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow);
            expect(grid.selectedRows()).toEqual([1]);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
        });

        it('Should not select multiple rows with clicking Space on a cell', (async () => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);
            let cell = grid.getCellByColumn(0, 'ProductName');

            UIInteractions.simulateClickAndSelectCellEvent(cell);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            HelperUtils.verifyCellSelected(cell);
            HelperUtils.verifyRowSelected(firstRow, false);

            // Press Space key on the cell
            UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);
            expect(grid.selectedRows()).toEqual([1]);
            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(secondRow, false);

            UIInteractions.triggerKeyDownWithBlur('arrowdown', cell.nativeElement, true);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            // Click Space on the cell
            cell = grid.getCellByColumn(1, 'ProductName');
            UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(grid.selectedRows()).toEqual([2]);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow);

            // Click again Space on the cell
            UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(3);
            expect(grid.selectedRows()).toEqual([]);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow, false);
        }));

        it('Should not select multiple rows with Shift + Click', () => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
            const firstRow = grid.getRowByIndex(1);
            const secondRow = grid.getRowByIndex(4);
            const mockEvent = new MouseEvent('click', {shiftKey: true});

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([2]);
            HelperUtils.verifyRowSelected(firstRow);

            // Click on other row holding Shift key
            secondRow.nativeElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([5]);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                added: [5],
                cancel: false,
                event: mockEvent,
                newSelection: [5],
                oldSelection: [2],
                removed: [2]
            });

            HelperUtils.verifyRowSelected(secondRow);
            for (let index = 1; index < 4; index++) {
                const row = grid.getRowByIndex(index);
                HelperUtils.verifyRowSelected(row, false);
            }
        });

        it('Should hide/show checkboxes when change hideRowSelectors', () => {
            const firstRow = grid.getRowByIndex(1);

            expect(grid.hideRowSelectors).toBe(false);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);

            grid.hideRowSelectors = true;
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, true, false);
            HelperUtils.verifyHeaderRowHasCheckbox(fix, false, false);
            HelperUtils.verifyRowHasCheckbox(firstRow.nativeElement, false, false);

            grid.hideRowSelectors = false;
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyHeaderRowHasCheckbox(fix, false);
            HelperUtils.verifyRowHasCheckbox(firstRow.nativeElement);
        });

        it('Should be able to select multiple rows from API', () => {
            grid.selectRows([1, 3, 5], true);
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected([grid.getRowByIndex(0), grid.getRowByIndex(2), grid.getRowByIndex(4)]);
            expect(grid.selectedRows()).toEqual([1, 3, 5]);

            grid.selectRows([1, 2, 4], false);
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected([grid.getRowByIndex(0),
                grid.getRowByIndex(1), grid.getRowByIndex(2), grid.getRowByIndex(3), grid.getRowByIndex(4)]);
            expect(grid.selectedRows()).toEqual([1, 2, 3, 4, 5]);
        });

        it('Should be able to cancel onRowSelectionChange event', () => {
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);

            // Click on a row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();
            HelperUtils.verifyRowSelected(firstRow);
            expect(grid.selectedRows()).toEqual([1]);

            // Cancel the event
            grid.onRowSelectionChange.subscribe((e: IRowSelectionEventArgs) => {
                e.cancel = true;
            });

            // Click on a row checkbox
            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();
            HelperUtils.verifyRowSelected(firstRow);
            expect(grid.selectedRows()).toEqual([1]);

            // Click on other row checkbox
            HelperUtils.clickRowCheckbox(secondRow);
            fix.detectChanges();
            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(secondRow, false);
            expect(grid.selectedRows()).toEqual([1]);

           // Click on other row
           UIInteractions.simulateClickEvent(secondRow.nativeElement);
           fix.detectChanges();
           HelperUtils.verifyRowSelected(firstRow);
           HelperUtils.verifyRowSelected(secondRow, false);
           expect(grid.selectedRows()).toEqual([1]);
        });

        it('Should be able to change RowSelection to none', () => {
            const firstRow = grid.getRowByIndex(0);
            expect(grid.rowSelection).toEqual(GridSelectionMode.single);

            grid.selectRows([1]);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);

            grid.rowSelection = GridSelectionMode.none;
            fix.detectChanges();

            expect(grid.rowSelection).toEqual(GridSelectionMode.none);
            HelperUtils.verifyRowSelected(firstRow, false, false);
            HelperUtils.verifyHeaderRowHasCheckbox(fix, false, false);
            HelperUtils.verifyRowHasCheckbox(firstRow.nativeElement, false, false);

            // Click on a row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false, false);
        });

        it('Should be able to change RowSelection to multiple', () => {
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(2);
            expect(grid.rowSelection).toEqual(GridSelectionMode.single);

            grid.selectRows([1]);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);

            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            expect(grid.rowSelection).toEqual(GridSelectionMode.multiple);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowHasCheckbox(fix);
            HelperUtils.verifyRowHasCheckbox(firstRow.nativeElement);
            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(fix, grid);

            // Click on a row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);

            // Click on another row holding Ctrl
            UIInteractions.simulateClickEvent(secondRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyRowSelected(firstRow);
        });
    });

    describe('Selection with primaryKey', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(GridWithPrimaryKeyComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should be able to select row through primaryKey and index', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2).rowData['Name']).toMatch('Gilberto Todd');
            expect(grid.getRowByIndex(1).rowData['Name']).toMatch('Gilberto Todd');
        });

        it('Should be able to update a cell in a row through primaryKey', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2).rowData['JobTitle']).toMatch('Director');
            grid.updateCell('Vice President', 2, 'JobTitle');
            fix.detectChanges();
            expect(grid.getRowByKey(2).rowData['JobTitle']).toMatch('Vice President');
        });

        it('Should be able to update row through primaryKey', () => {
            spyOn(grid.cdr, 'markForCheck').and.callThrough();
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2).rowData['JobTitle']).toMatch('Director');
            grid.updateRow({ ID: 2, Name: 'Gilberto Todd', JobTitle: 'Vice President' }, 2);
            expect(grid.cdr.markForCheck).toHaveBeenCalledTimes(1);
            fix.detectChanges();
            expect(grid.getRowByIndex(1).rowData['JobTitle']).toMatch('Vice President');
            expect(grid.getRowByKey(2).rowData['JobTitle']).toMatch('Vice President');
        });

        it('Should be able to delete a row through primaryKey', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2)).toBeDefined();
            grid.deleteRow(2);
            fix.detectChanges();
            expect(grid.getRowByKey(2)).toBeUndefined();
            expect(grid.getRowByIndex(2)).toBeDefined();
        });

        it('Should handle update by not overwriting the value in the data column specified as primaryKey', () => {
            expect(grid.primaryKey).toBeTruthy();
            expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');
            expect(grid.getRowByKey(2)).toBeDefined();
            grid.updateRow({ ID: 7, Name: 'Gilberto Todd', JobTitle: 'Vice President' }, 2);
            fix.detectChanges();
            expect(grid.getRowByKey(7)).toBeDefined();
            expect(grid.getRowByIndex(1)).toBeDefined();
            expect(grid.getRowByIndex(1).rowData[grid.primaryKey]).toEqual(7);
        });

        it('Should be able to programatically select all rows with a correct reference, #1297', () => {
            grid.selectAllRows();
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
    });

    describe('Integration with paging', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(SelectionAndPagingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should persist through paging', (async () => {
            const nextBtn: HTMLElement = fix.nativeElement.querySelector('.nextPageBtn');
            const prevBtn: HTMLElement = fix.nativeElement.querySelector('.prevPageBtn');
            const selectedRow = grid.getRowByIndex(5);
            expect(selectedRow).toBeDefined();
            const checkboxElement: HTMLElement = selectedRow.nativeElement.querySelector('.igx-checkbox__input');
            expect(selectedRow.selected).toBeFalsy();
            checkboxElement.click();
            await wait();
            fix.detectChanges();
            expect(selectedRow.selected).toBeTruthy();
            nextBtn.click();
            await wait();
            fix.detectChanges();
            expect(selectedRow.selected).toBeFalsy();
            prevBtn.click();
            await wait();
            fix.detectChanges();
            expect(selectedRow.selected).toBeTruthy();
        }));

        it('Should persist through paging - multiple', (async () => {
            const nextBtn: HTMLElement = fix.nativeElement.querySelector('.nextPageBtn');
            const prevBtn: HTMLElement = fix.nativeElement.querySelector('.prevPageBtn');
            const firstRow = grid.getRowByIndex(0);
            const middleRow = grid.getRowByIndex(4);
            const lastRow = grid.getRowByIndex(9);
            expect(firstRow).toBeDefined();
            expect(middleRow).toBeDefined();
            expect(lastRow).toBeDefined();
            const checkboxElement1: HTMLElement = firstRow.nativeElement.querySelector('.igx-checkbox__input');
            const checkboxElement2: HTMLElement = middleRow.nativeElement.querySelector('.igx-checkbox__input');
            const checkboxElement3: HTMLElement = lastRow.nativeElement.querySelector('.igx-checkbox__input');
            expect(firstRow.selected).toBeFalsy();
            expect(middleRow.selected).toBeFalsy();
            expect(lastRow.selected).toBeFalsy();
            checkboxElement1.click();
            checkboxElement2.click();
            checkboxElement3.click();
            await wait();
            fix.detectChanges();
            expect(firstRow.selected).toBeTruthy();
            expect(middleRow.selected).toBeTruthy();
            expect(lastRow.selected).toBeTruthy();
            nextBtn.click();
            await wait();
            fix.detectChanges();
            expect(firstRow.selected).toBeFalsy();
            expect(middleRow.selected).toBeFalsy();
            expect(lastRow.selected).toBeFalsy();
            prevBtn.click();
            await wait();
            fix.detectChanges();
            expect(firstRow.selected).toBeTruthy();
            expect(middleRow.selected).toBeTruthy();
            expect(lastRow.selected).toBeTruthy();
        }));

        it('Should persist through paging - multiple selection', (async () => {
            const nextBtn: HTMLElement = fix.nativeElement.querySelector('.nextPageBtn');
            const prevBtn: HTMLElement = fix.nativeElement.querySelector('.prevPageBtn');
            const selectedRow1 = grid.getRowByIndex(5);
            const selectedRow2 = grid.getRowByIndex(3);
            const selectedRow3 = grid.getRowByIndex(0);

            expect(selectedRow1).toBeDefined();
            expect(selectedRow2).toBeDefined();
            expect(selectedRow3).toBeDefined();
            const checkboxElement1: HTMLElement = selectedRow1.nativeElement.querySelector('.igx-checkbox__input');
            const checkboxElement2: HTMLElement = selectedRow2.nativeElement.querySelector('.igx-checkbox__input');
            const checkboxElement3: HTMLElement = selectedRow3.nativeElement.querySelector('.igx-checkbox__input');

            expect(selectedRow1.selected).toBeFalsy();
            expect(selectedRow2.selected).toBeFalsy();
            expect(selectedRow3.selected).toBeFalsy();
            checkboxElement1.click();
            checkboxElement2.click();
            checkboxElement3.click();
            await wait();
            fix.detectChanges();
            expect(selectedRow1.selected).toBeTruthy();
            expect(selectedRow2.selected).toBeTruthy();
            expect(selectedRow3.selected).toBeTruthy();
            nextBtn.click();
            await wait();
            fix.detectChanges();
            expect(selectedRow1.selected).toBeFalsy();
            expect(selectedRow2.selected).toBeFalsy();
            expect(selectedRow3.selected).toBeFalsy();
            prevBtn.click();
            await wait();
            fix.detectChanges();
            expect(selectedRow1.selected).toBeTruthy();
            expect(selectedRow2.selected).toBeTruthy();
            expect(selectedRow3.selected).toBeTruthy();
        }));


    });

    describe('Integration with filtering', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(GridWithSelectionFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.gridSelection4;
        }));

        it('Filtering and row selection', fakeAsync(() => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();

            const secondRow = grid.getRowByIndex(1);
            expect(secondRow).toBeDefined();
            expect(secondRow.selected).toBeFalsy();

            let rowsCollection = [];

            rowsCollection = grid.selectedRows();
            expect(rowsCollection).toEqual([]);

            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(0);

            rowsCollection = grid.selectedRows();

            expect(rowsCollection).toEqual([]);
            HelperUtils.verifyHeaderRowCheckboxState(fix);

            grid.clearFilter('ProductName');
            fix.detectChanges();

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(0);
            HelperUtils.clickRowCheckbox(secondRow);
             fix.detectChanges();

            expect(secondRow.selected).toBeTruthy();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(secondRow.selected).toBeTruthy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);

            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);

            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);

            grid.clearFilter('ProductName');
            fix.detectChanges();
            // expect(headerCheckbox.checked).toBeFalsy();
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.getRowByIndex(0).selected).toBeTruthy();
            expect(grid.getRowByIndex(1).selected).toBeTruthy();
            expect(grid.getRowByIndex(2).selected).toBeTruthy();

            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(3);

            grid.clearFilter('ProductName');
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.getRowByIndex(0).selected).toBeFalsy();
            expect(grid.getRowByIndex(1).selected).toBeTruthy();
            expect(grid.getRowByIndex(2).selected).toBeFalsy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(3);

            HelperUtils.clickRowCheckbox(grid.getRowByIndex(0));
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(4);

            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(4);

            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(6);

            grid.clearFilter('ProductName');
            fix.detectChanges();

            expect(grid.getRowByIndex(0).selected).toBeFalsy();
            expect(grid.getRowByIndex(1).selected).toBeTruthy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(6);
        }));

        it('ARIA support', fakeAsync(/** height/width setter rAF */() => {
            const firstRow = grid.getRowByIndex(0).nativeElement;
            const headerCheckbox = fix.nativeElement.querySelector('.igx-grid__thead').querySelector('.igx-checkbox__input');
            expect(firstRow.getAttribute('aria-selected')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Select all');

            headerCheckbox.click();
            fix.detectChanges();

            expect(firstRow.getAttribute('aria-selected')).toMatch('true');
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('true');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Deselect all');

            headerCheckbox.click();
            fix.detectChanges();

            expect(firstRow.getAttribute('aria-selected')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-checked')).toMatch('false');
            expect(headerCheckbox.getAttribute('aria-label')).toMatch('Select all');
        }));

        it('Should properly check the header checkbox state when filtering, #2469', fakeAsync(() => {
            const headerCheckbox = fix.nativeElement.querySelector('.igx-grid__thead').querySelector('.igx-checkbox__input');
            grid.primaryKey = 'ID';
            fix.detectChanges();
            tick();
            headerCheckbox.click();
            tick();
            fix.detectChanges();
            tick();
            expect(headerCheckbox.parentElement.classList).toContain('igx-checkbox--checked');
            grid.filter('Downloads', 0, IgxNumberFilteringOperand.instance().condition('greaterThanOrEqualTo'), true);
            tick();
            fix.detectChanges();
            tick();
            expect(headerCheckbox.parentElement.classList).toContain('igx-checkbox--checked');
        }));
    });

    describe('Integration with CRUD', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(RowSelectionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));


        it('Should handle the deselection on a selected row properly', (async () => {
            const firstRow = grid.getRowByKey(1);
            HelperUtils.clickRowCheckbox(firstRow);
            await wait();
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, true, true);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            grid.deleteRow(1);
            fix.detectChanges();

            expect(grid.getRowByKey(1)).toBeUndefined();
            HelperUtils.verifyHeaderRowCheckboxState(fix);
        }));
    });

    describe('Integration with CRUD and transactions', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridRowEditingTransactionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should not allow selecting rows that are deleted', fakeAsync(() => {
            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            grid.deleteRowById(2);
            grid.deleteRowById(3);

            fix.detectChanges();
            grid.selectRows([2, 3, 4]);
            fix.detectChanges();
            expect(grid.selectedRows()).toEqual([4]);
        }));
    });

    it('Summaries integration', () => {
        const fixture = TestBed.createComponent(SummariesComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        expect(grid.summariesMargin).toBe(grid.featureColumnsWidth);
    });

    it('Should be able to programatically overwrite the selection using onRowSelectionChange event', () => {
        const fixture = TestBed.createComponent(SelectionCancellableComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const firstRow = grid.getRowByIndex(0);
        const firstRowCheckbox: HTMLElement = firstRow.nativeElement.querySelector('.igx-checkbox__input');
        const secondRow = grid.getRowByIndex(1);
        const secondRowCheckbox: HTMLElement = secondRow.nativeElement.querySelector('.igx-checkbox__input');
        const thirdRow = grid.getRowByIndex(2);

        expect(firstRow.selected).toBeFalsy();
        expect(secondRow.selected).toBeFalsy();
        expect(thirdRow.selected).toBeFalsy();

        firstRowCheckbox.dispatchEvent(new Event('click', {}));
        fixture.detectChanges();

        expect(firstRow.selected).toBeTruthy();
        expect(secondRow.selected).toBeFalsy();
        expect(thirdRow.selected).toBeFalsy();

        firstRowCheckbox.dispatchEvent(new Event('click', {}));
        secondRowCheckbox.dispatchEvent(new Event('click', {}));
        fixture.detectChanges();

        expect(firstRow.selected).toBeFalsy();
        expect(secondRow.selected).toBeFalsy();
        expect(thirdRow.selected).toBeFalsy();
    });
});

@Component({
    template: `
        <igx-grid #gridSelection4 [data]="data" height="500px" rowSelection="multiple">
            <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
            <igx-column [field]="'ProductName'" [filterable]="true" dataType="string"></igx-column>
            <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
            <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
            <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
                        [filterable]="true" dataType="date">
            </igx-column>
        </igx-grid>`
})
export class GridWithSelectionFilteringComponent {

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    @ViewChild('gridSelection4', { read: IgxGridComponent, static: true })
    public gridSelection4: IgxGridComponent;

    public data = SampleTestData.productInfoData();

    @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;
}


