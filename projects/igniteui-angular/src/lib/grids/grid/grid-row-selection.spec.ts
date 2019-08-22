import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule, GridSelectionMode, IRowSelectionEventArgs } from './index';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxStringFilteringOperand, IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    GridWithPrimaryKeyComponent,
    RowSelectionComponent,
    SelectionWithScrollsComponent,
    SingleRowSelectionComponent,
    RowSelectionWithoutPrimaryKeyComponent,
    SelectionWithTransactionsComponent,
    GridCustomSelectorsComponent
} from '../../test-utils/grid-samples.spec';
import { IgxHierarchicalGridModule } from '../hierarchical-grid/hierarchical-grid.module';
import { HelperUtils } from '../../test-utils/helper-utils.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { helpers } from 'handlebars';
import { IgxHierarchicalGridCustomSelectorsComponent } from '../../test-utils/hierarhical-grid-components.spec';
import { IgxSelectorsModule } from '../igx-selection.module';

const DEBOUNCETIME = 30;

describe('IgxGrid - Row Selection', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridWithPrimaryKeyComponent,
                RowSelectionComponent,
                SelectionWithScrollsComponent,
                RowSelectionWithoutPrimaryKeyComponent,
                SingleRowSelectionComponent,
                SelectionWithTransactionsComponent,
                GridCustomSelectorsComponent,
                IgxHierarchicalGridCustomSelectorsComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule,
                IgxHierarchicalGridModule,
                IgxSelectorsModule
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
            expect(grid.selectedRows()).toEqual([1]);

            GridFunctions.setGridScrollTop(grid, 500);
            await wait(100);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([1]);
            HelperUtils.verifyRowSelected(grid.rowList.first, false);

            GridFunctions.setGridScrollTop(grid, 0);
            await wait(100);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowSelected(selectedRow);
            expect(grid.selectedRows()).toEqual([1]);
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
            const mockEvent = new MouseEvent('click', { shiftKey: true });

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

        it('Should be able to programmatically overwrite the selection using onRowSelectionChange event', () => {
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);
            const thirdRow = grid.getRowByIndex(2);
            grid.onRowSelectionChange.subscribe((e: IRowSelectionEventArgs) => {
                if (e.added.length > 0 && (e.added[0]) % 2 === 0) {
                    e.newSelection = e.oldSelection || [];
                }
            });

            HelperUtils.verifyRowsArraySelected([firstRow, secondRow, thirdRow], false);

            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            expect(firstRow.selected).toBeTruthy();
            expect(secondRow.selected).toBeFalsy();
            expect(thirdRow.selected).toBeFalsy();

            HelperUtils.clickRowCheckbox(firstRow);
            HelperUtils.clickRowCheckbox(secondRow);
            fix.detectChanges();

            expect(firstRow.selected).toBeFalsy();
            expect(secondRow.selected).toBeFalsy();
            HelperUtils.verifyRowsArraySelected([firstRow, secondRow, thirdRow], false);
        });

        it('ARIA support', () => {
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
        });
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
            const mockEvent = new MouseEvent('click', { shiftKey: true });

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
            expect(grid.selectedRows()).toEqual([1, 3, 5, 2, 4]);
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
            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyRowSelected(firstRow);
        });
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

            HelperUtils.verifyRowsArraySelected(rowsToCheck);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false, true);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
        }));

        it('Should be able to select a row', fakeAsync(() => {
            const firstRow = grid.getRowByIndex(0);
            firstRow.selected = true;
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([1]);
            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            firstRow.selected = false;
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([]);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix);
        }));
    });

    describe('Selection without primaryKey', () => {
        let fix;
        let grid: IgxGridComponent;
        const gridData = SampleTestData.personIDNameRegionData();

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(RowSelectionWithoutPrimaryKeyComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Verify event parameters', () => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
            const firstRow = grid.getRowByIndex(1);
            const secondRow = grid.getRowByIndex(4);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            expect(grid.selectedRows()).toEqual([gridData[1]]);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                added: [gridData[1]],
                cancel: false,
                event: jasmine.anything(),
                newSelection: [gridData[1]],
                oldSelection: [],
                removed: []
            });

            UIInteractions.simulateClickEvent(secondRow.nativeElement, true);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([gridData[1], gridData[2], gridData[3], gridData[4]]);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledWith({
                added: [gridData[2], gridData[3], gridData[4]],
                cancel: false,
                event: jasmine.anything(),
                newSelection: [gridData[1], gridData[2], gridData[3], gridData[4]],
                oldSelection: [gridData[1]],
                removed: []
            });
        });

        it('Should persist through scrolling vertical', (async () => {
            const selectedRow = grid.getRowByIndex(0);

            grid.height = '200px';
            fix.detectChanges();

            HelperUtils.clickRowCheckbox(selectedRow);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowSelected(selectedRow);
            expect(grid.selectedRows()).toEqual([gridData[0]]);

            GridFunctions.setGridScrollTop(grid, 500);
            await wait(100);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([gridData[0]]);
            HelperUtils.verifyRowsArraySelected(grid.rowList, false);

            GridFunctions.setGridScrollTop(grid, 0);
            await wait(100);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowSelected(selectedRow);
        }));

        it('Should be able to select and deselect rows from API', () => {
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(2);
            const thirdRow = grid.getRowByIndex(5);

            grid.selectAllRows();
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual(gridData);
            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray());
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            grid.deselectRows([firstRow.rowID, secondRow.rowID, thirdRow.rowID]);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([gridData[1], gridData[3], gridData[4], gridData[6]]);
            HelperUtils.verifyRowsArraySelected([firstRow, secondRow, thirdRow], false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            grid.selectRows([firstRow.rowID, secondRow.rowID, thirdRow.rowID], false);
            fix.detectChanges();

            expect(grid.selectedRows())
                .toEqual([gridData[1], gridData[3], gridData[4], gridData[6], gridData[0], gridData[2], gridData[5]]);
            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray());
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
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

    describe('Integration tests', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(RowSelectionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Paging: Should persist through paging', fakeAsync(() => {
            grid.paging = true;
            tick();
            fix.detectChanges();

            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);
            const middleRow = grid.getRowByIndex(3);

            HelperUtils.clickRowCheckbox(secondRow);
            HelperUtils.clickRowCheckbox(middleRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyRowSelected(middleRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            grid.nextPage();
            tick();
            fix.detectChanges();

            HelperUtils.verifyRowSelected(secondRow, false);
            HelperUtils.verifyRowSelected(middleRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(secondRow, false);
            HelperUtils.verifyRowSelected(middleRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            grid.previousPage();
            tick();
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyRowSelected(middleRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
        }));

        it('Paging: Should persist all rows selection through paging', fakeAsync(() => {
            grid.paging = true;
            tick();
            fix.detectChanges();

            const secondRow = grid.getRowByIndex(1);
            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray());

            grid.nextPage();
            tick();
            fix.detectChanges();
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray());

            // Click on a single row
            UIInteractions.simulateClickEvent(secondRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowSelected(secondRow);

            grid.previousPage();
            tick();
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray(), false);
        }));

        it('Paging: Should be able to select rows with Shift and Click', fakeAsync(() => {
            grid.paging = true;
            tick();
            fix.detectChanges();

            const firstRow = grid.getRowByIndex(0);
            const thirdRow = grid.getRowByIndex(3);
            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            // Select first row on first page
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowSelected(firstRow);

            grid.nextPage();
            tick();
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray(), false);

            // Click on the last row in page holding Shifth
            UIInteractions.simulateClickEvent(thirdRow.nativeElement, true);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray());

            grid.previousPage();
            tick();
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            HelperUtils.verifyRowsArraySelected(grid.rowList.toArray());
        }));

        it('CRUD: Should handle the deselection on a selected row properly', () => {
            let firstRow = grid.getRowByKey(1);
            grid.selectRows([1]);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            grid.deleteRow(1);
            fix.detectChanges();

            expect(grid.getRowByKey(1)).toBeUndefined();
            expect(grid.selectedRows().includes(1)).toBe(false);
            HelperUtils.verifyHeaderRowCheckboxState(fix);

            grid.selectAllRows();
            fix.detectChanges();

            firstRow = grid.getRowByKey(2);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            HelperUtils.verifyRowSelected(firstRow);

            grid.deleteRow(2);
            fix.detectChanges();

            expect(grid.getRowByKey(2)).toBeUndefined();
            expect(grid.selectedRows().includes(2)).toBe(false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            grid.deselectRows([3]);
            fix.detectChanges();

            expect(grid.selectedRows().includes(3)).toBe(false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            grid.deleteRow(3);
            fix.detectChanges();

            expect(grid.getRowByKey(3)).toBeUndefined();
            expect(grid.selectedRows().includes(3)).toBe(false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
        });

        it('CRUD: Should handle the adding new row properly', () => {
            grid.selectAllRows();
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            grid.addRow({ ProductID: 20, ProductName: 'test', InStock: true, UnitsInStock: 1, OrderDate: new Date('2019-03-01') });
            fix.detectChanges();

            expect(grid.selectedRows().includes(20)).toBe(false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
        });

        it('CRUD: Should update selected row when update cell', () => {
            let firstRow = grid.getRowByIndex(1);
            firstRow.selected = true;
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            expect(grid.selectedRows()).toEqual([2]);
            grid.updateCell(102, 2, 'ProductID');
            fix.detectChanges();

            firstRow = grid.getRowByIndex(1);
            expect(firstRow.rowID).toEqual(102);
            HelperUtils.verifyRowSelected(firstRow);
            expect(grid.selectedRows()).toEqual([102]);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
        });

        it('CRUD: Should update selected row when update row', () => {
            grid.selectAllRows();
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            grid.updateRow({ ProductID: 103, ProductName: 'test', InStock: true, UnitsInStock: 1, OrderDate: new Date('2019-03-01') }, 3);
            fix.detectChanges();

            const row = grid.getRowByIndex(2);
            HelperUtils.verifyRowSelected(row);
            expect(row.rowID).toEqual(103);
            expect(grid.selectedRows().includes(3)).toBe(false);
            expect(grid.selectedRows().includes(103)).toBe(true);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
        });

        it('Sorting: Should have persistent selection through data operations', fakeAsync(() => {
            const rowsToCheck = [grid.getRowByIndex(0), grid.getRowByIndex(1)];
            HelperUtils.verifyRowsArraySelected(rowsToCheck, false);

            grid.selectRows([1, 2], false);
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected(rowsToCheck, true);

            grid.sort({ fieldName: 'UnitsInStock', dir: SortingDirection.Desc, ignoreCase: true });
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected(rowsToCheck, false);

            grid.clearSort('UnitsInStock');
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected(rowsToCheck, true);
        }));

        it('Summaries integration', () => {
            grid.getColumnByName('ProductID').hasSummary = true;
            fix.detectChanges();

            expect(grid.summariesMargin).toBe(grid.featureColumnsWidth);
        });

        it('Filtering: Should properly check the header checkbox state when filtering, #2469', () => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();

            grid.filter('ProductID', 10, IgxNumberFilteringOperand.instance().condition('greaterThanOrEqualTo'), true);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(0);
            expect(grid.selectedRows()).toEqual([]);

            grid.clearFilter('ProductID');
            fix.detectChanges();

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(0);

            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            grid.filter('ProductID', 0, IgxNumberFilteringOperand.instance().condition('greaterThanOrEqualTo'), true);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            expect(grid.selectedRows().length).toBe(19);

            grid.filter('ProductID', 100, IgxNumberFilteringOperand.instance().condition('greaterThanOrEqualTo'), true);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix);
            expect(grid.rowList.length).toBe(0);
            expect(grid.selectedRows().length).toBe(19);

            grid.clearFilter();
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            expect(grid.selectedRows().length).toBe(19);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);
        });

        it('Filtering: Should select correct rows when filter is applied', fakeAsync(() => {
            spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
            const secondRow = grid.getRowByIndex(1);

            HelperUtils.clickRowCheckbox(secondRow);
            fix.detectChanges();

            expect(secondRow.selected).toBeTruthy();
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);

            grid.filter('ProductName', 'Ca', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);

            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);

            grid.clearFilter('ProductName');
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.getRowByIndex(1).selected).toBeTruthy();
            expect(grid.getRowByIndex(2).selected).toBeTruthy();
            expect(grid.getRowByIndex(6).selected).toBeTruthy();

            grid.filter('ProductName', 'Ca', IgxStringFilteringOperand.instance().condition('contains'), true);
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

            expect(grid.getRowByIndex(1).selected).toBeTruthy();
            expect(grid.getRowByIndex(2).selected).toBeFalsy();
            expect(grid.getRowByIndex(6).selected).toBeFalsy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(3);

            HelperUtils.clickRowCheckbox(grid.getRowByIndex(2));
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(4);

            grid.filter('ProductName', 'Ca', IgxStringFilteringOperand.instance().condition('contains'), true);
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

            expect(grid.getRowByIndex(2).selected).toBeFalsy();
            expect(grid.getRowByIndex(1).selected).toBeTruthy();
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(6);
        }));
    });

    describe('Integration with CRUD and transactions', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(SelectionWithTransactionsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();
        }));

        it('Should unselect row when delete it', () => {
            const firstRow = grid.getRowByIndex(0);

            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            grid.deleteRowById(firstRow.rowID);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([]);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix);
        });

        it('Should not allow selecting rows that are deleted', () => {
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);
            const thirdRow = grid.getRowByIndex(2);

            grid.deleteRowById(firstRow.rowID);
            grid.deleteRowById(secondRow.rowID);
            fix.detectChanges();

            grid.selectAllRows();
            fix.detectChanges();

            expect(grid.selectedRows().includes(firstRow.rowID)).toBe(false);
            expect(grid.selectedRows().includes(secondRow.rowID)).toBe(false);
            expect(grid.selectedRows().includes(thirdRow.rowID)).toBe(true);

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            grid.selectRows([firstRow.rowID, secondRow.rowID, thirdRow.rowID]);
            fix.detectChanges();

            expect(grid.selectedRows().includes(firstRow.rowID)).toBe(true);
            expect(grid.selectedRows().includes(secondRow.rowID)).toBe(true);
            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
        });

        it('Should have correct header checkbox when delete a row', () => {
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(1);

            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected(grid.rowList);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            grid.deleteRowById(firstRow.rowID);
            fix.detectChanges();

            expect(grid.selectedRows().length).toEqual(7);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            grid.deselectRows([secondRow.rowID]);
            fix.detectChanges();

            expect(grid.selectedRows().length).toEqual(6);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            grid.deleteRowById(secondRow.rowID);
            fix.detectChanges();

            expect(grid.selectedRows().length).toEqual(6);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
        });

        it('Should not be possible to select deleted row', () => {
            const firstRow = grid.getRowByIndex(0);
            const secondRow = grid.getRowByIndex(3);

            grid.deleteRowById(firstRow.rowID);
            fix.detectChanges();

            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([]);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([]);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix);

            UIInteractions.simulateClickEvent(secondRow.nativeElement);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([secondRow.rowID]);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            UIInteractions.simulateClickEvent(firstRow.nativeElement, true);
            fix.detectChanges();

            expect(grid.selectedRows()).toEqual([secondRow.rowID]);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(grid.selectedRows().includes(firstRow.rowID)).toBe(false);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
        });

        it('Should have correct header checkbox when undo row deleting', () => {
            const firstRow = grid.getRowByIndex(0);

            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(grid.selectedRows().includes(firstRow.rowID)).toBe(true);
            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            grid.deleteRowById(firstRow.rowID);
            fix.detectChanges();

            expect(grid.selectedRows().includes(firstRow.rowID)).toBe(false);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            grid.transactions.undo();
            fix.detectChanges();

            expect(grid.selectedRows().length).toBe(7);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            grid.transactions.redo();
            fix.detectChanges();

            expect(grid.selectedRows().includes(firstRow.rowID)).toBe(false);
            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
        });

        it('Should have correct header checkbox when add row', () => {
            grid.height = '800px';
            fix.detectChanges();

            grid.selectAllRows();
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            grid.addRow({ ID: 112, ParentID: 177, Name: 'Ricardo Matias', HireDate: new Date('Dec 27, 2017'), Age: 55, OnPTO: false });
            fix.detectChanges();

            let addedRow = grid.getRowByKey(112);
            HelperUtils.verifyRowSelected(addedRow, false);
            expect(grid.selectedRows().includes(112)).toBe(false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            grid.transactions.undo();
            fix.detectChanges();

            expect(grid.selectedRows().length).toBe(8);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);

            grid.transactions.redo();
            fix.detectChanges();

            addedRow = grid.getRowByKey(112);
            expect(grid.selectedRows().includes(112)).toBe(false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            HelperUtils.verifyRowSelected(addedRow, false);

            HelperUtils.clickRowCheckbox(addedRow);
            fix.detectChanges();

            expect(grid.selectedRows().includes(112)).toBe(true);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            HelperUtils.verifyRowSelected(addedRow);
        });
    });

    describe('Custom selectors', () => {
        let fix;
        let grid;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridCustomSelectorsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();
        }));

        it('Should be able to select a row by clicking on the custom row selector', () => {
            // TODO
        });

        it('Should be able to deselect a selected row by clicking on the custom row selector', () => {
            // TODO
        });

        it('Should select/deselect all rows by clicking on the custom header selector', () => {
            // TODO
        });

        it('Should have the correct properties in the custom row selector template', () => {
            // TODO
        });

        it('Should have the correct properties in the custom row selector header template', () => {
            // TODO
        });

        describe('Custom selectors - Hierarchical Grid', () => {
            let fixture;
            let hGrid;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxHierarchicalGridCustomSelectorsComponent);
                fixture.detectChanges();
                hGrid = fixture.componentInstance.hGrid;
                hGrid.rowSelection = GridSelectionMode.multiple;
                fixture.detectChanges();
            }));

            /** Tests should check root and child grids */

            it('Row context `select` method selects a single row', () => {
                // TODO
            });

            it('Row context `deselect` method deselects an already selected row', () => {
                // TODO
            });

            it('Header context `selectAll` method selects all rows', () => {
                // TODO
            });

            it('Header context `deselectAll` method deselects all rows', () => {
                // TODO
            });
        });
    });
});
