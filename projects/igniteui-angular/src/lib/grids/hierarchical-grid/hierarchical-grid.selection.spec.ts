import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, fakeAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule, GridSelectionMode } from './index';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { IgxIconModule } from '../../icon';
import {
    IgxHierarchicalGridTestBaseComponent,
    IgxHierarchicalGridRowSelectionComponent,
    IgxHierarchicalGridCustomSelectorsComponent,
    IgxHierarchicalGridRowSelectionNoTransactionsComponent
} from '../../test-utils/hierarhical-grid-components.spec';
import { IgxSelectorsModule } from '../igx-selection.module';
import { HelperUtils } from '../../test-utils/helper-utils.spec';

describe('IgxHierarchicalGrid selection #hGrid', () => {
    configureTestSuite();
    let fix;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    let rowIsland1;
    let rowIsland2;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridTestBaseComponent,
                IgxHierarchicalGridRowSelectionComponent,
                IgxHierarchicalGridCustomSelectorsComponent,
                IgxHierarchicalGridRowSelectionNoTransactionsComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxHierarchicalGridModule,
                IgxIconModule,
                IgxSelectorsModule]
        }).compileComponents();
    }));

    describe('Cell selection', () => {
        beforeEach(async(() => {
            fix = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
            fix.detectChanges();
            hierarchicalGrid = fix.componentInstance.hgrid;
            rowIsland1 = fix.componentInstance.rowIsland;
            rowIsland2 = fix.componentInstance.rowIsland2;
        }));

        it('should allow only one cell to be selected in the whole hierarchical grid.', (async () => {
            hierarchicalGrid.height = '500px';
            hierarchicalGrid.reflow();
            fix.detectChanges();

            let firstRow = hierarchicalGrid.dataRowList.toArray()[0] as IgxHierarchicalRowComponent;
            firstRow.nativeElement.children[0].click();
            fix.detectChanges();
            expect(firstRow.expanded).toBeTruthy();

            let fCell = firstRow.cells.toArray()[0];

            // select parent cell
            fCell.nativeElement.focus();
            await wait(100);
            fix.detectChanges();

            expect(fCell.selected).toBeTruthy();

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const firstChildRow = childGrid.dataRowList.toArray()[0];
            const fChildCell = firstChildRow.cells.toArray()[0];

            // select child cell
            fChildCell.nativeElement.focus();
            await wait(100);
            fix.detectChanges();

            expect(fChildCell.selected).toBeTruthy();
            expect(fCell.selected).toBeFalsy();

            // select parent cell
            firstRow = hierarchicalGrid.dataRowList.toArray()[0] as IgxHierarchicalRowComponent;
            fCell = firstRow.cells.toArray()[0];
            fCell.nativeElement.focus();
            await wait(100);
            fix.detectChanges();
            expect(fChildCell.selected).toBeFalsy();
            expect(fCell.selected).toBeTruthy();
        }));
    });

    describe('Row Selection', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxHierarchicalGridRowSelectionComponent);
            fix.detectChanges();
            hierarchicalGrid = fix.componentInstance.hgrid;
            rowIsland1 = fix.componentInstance.rowIsland;
            rowIsland2 = fix.componentInstance.rowIsland2;
        }));

        it('should have checkboxes on each row', () => {
            hierarchicalGrid.expandChildren = true;
            fix.detectChanges();
            rowIsland1.expandChildren = true;
            fix.detectChanges();

            expect(hierarchicalGrid.rowSelection).toEqual(GridSelectionMode.multiple);
            HelperUtils.verifyHeaderRowHasCheckbox(fix);
            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(hierarchicalGrid);

            for (const r of hierarchicalGrid.dataRowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(r.nativeElement);
            }

            let childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.rowSelection).toBe(GridSelectionMode.single);
            HelperUtils.verifyHeaderRowHasCheckbox(childGrid, false);
            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(childGrid);

            for (const r of childGrid.dataRowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(r.nativeElement);
            }

            childGrid = childGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.rowSelection).toBe(GridSelectionMode.none);
            HelperUtils.verifyHeaderRowHasCheckbox(childGrid, false, false);

            for (const r of childGrid.dataRowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(r.nativeElement, false, false);
            }
        });

        it('should able to change rowSelection at runtime', () => {
            hierarchicalGrid.expandChildren = true;
            fix.detectChanges();
            rowIsland1.expandChildren = true;
            fix.detectChanges();

            const childGridLevel1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const childGridLevel2 = childGridLevel1.hgridAPI.getChildGrids(false)[0];

            hierarchicalGrid.selectAllRows();
            childGridLevel1.selectedRows(['00']);
            fix.detectChanges();

            // Change row selection for grids
            hierarchicalGrid.rowSelection = GridSelectionMode.none;
            rowIsland1.rowSelection = GridSelectionMode.multiple;
            rowIsland2.rowSelection = GridSelectionMode.single;
            fix.detectChanges();

            expect(hierarchicalGrid.rowSelection).toBe(GridSelectionMode.none);
            expect(hierarchicalGrid.selectedRows()).toEqual([]);
            HelperUtils.verifyHeaderRowHasCheckbox(hierarchicalGrid, false, false);
            for (const r of hierarchicalGrid.dataRowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(r.nativeElement, false, false);
            }

            expect(childGridLevel1.rowSelection).toBe(GridSelectionMode.multiple);
            expect(childGridLevel1.selectedRows()).toEqual([]);
            HelperUtils.verifyHeaderRowHasCheckbox(childGridLevel1);
            for (const r of childGridLevel1.dataRowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(r.nativeElement);
            }
            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(childGridLevel1);

            expect(childGridLevel2.rowSelection).toBe(GridSelectionMode.single);
            expect(childGridLevel2.selectedRows()).toEqual([]);
            HelperUtils.verifyHeaderRowHasCheckbox(childGridLevel2, false);
            for (const r of childGridLevel2.dataRowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(r.nativeElement);
            }
            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(childGridLevel2);
        });

        it('should able to change showRowCheckboxes at runtime', () => {
            hierarchicalGrid.expandChildren = true;
            fix.detectChanges();

            hierarchicalGrid.hideRowSelectors = true;
            rowIsland1.hideRowSelectors = true;
            fix.detectChanges();

            expect(hierarchicalGrid.hideRowSelectors).toBe(true);
            HelperUtils.verifyHeaderRowHasCheckbox(hierarchicalGrid, false, false);
            for (const r of hierarchicalGrid.dataRowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(r.nativeElement, false, false);
            }

            const childGridLevel1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGridLevel1.hideRowSelectors).toBe(true);
            HelperUtils.verifyHeaderRowHasCheckbox(childGridLevel1, false, false);
            for (const r of childGridLevel1.dataRowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(r.nativeElement, false, false);
            }

            hierarchicalGrid.hideRowSelectors = false;
            rowIsland1.hideRowSelectors = false;
            fix.detectChanges();

            expect(hierarchicalGrid.hideRowSelectors).toBe(false);
            HelperUtils.verifyHeaderRowHasCheckbox(hierarchicalGrid);
            for (const r of hierarchicalGrid.dataRowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(r.nativeElement);
            }

            expect(childGridLevel1.hideRowSelectors).toBe(false);
            HelperUtils.verifyHeaderRowHasCheckbox(childGridLevel1, false);
            for (const r of childGridLevel1.dataRowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(r.nativeElement);
            }
        });

        it('should have fire event onRowSelectionChange', () => {
            hierarchicalGrid.expandChildren = true;
            fix.detectChanges();
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const secondChildGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[1];
            const parentSpy = spyOn<any>(hierarchicalGrid.onRowSelectionChange, 'emit').and.callThrough();
            const childSpy = spyOn<any>(childGrid.onRowSelectionChange, 'emit').and.callThrough();
            const secondChildSpy = spyOn<any>(secondChildGrid.onRowSelectionChange, 'emit').and.callThrough();
            const mockEvent = new MouseEvent('click');

            // Click on a row in child grid
            let row = childGrid.dataRowList.toArray()[0];
            row.nativeElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            expect(secondChildSpy).toHaveBeenCalledTimes(0);
            expect(parentSpy).toHaveBeenCalledTimes(0);
            expect(childSpy).toHaveBeenCalledTimes(1);
            expect(childSpy).toHaveBeenCalledWith({
                added: ['00'],
                cancel: false,
                event: mockEvent,
                newSelection: ['00'],
                oldSelection: [],
                removed: [],
                owner: childGrid
            });

            // Click on checkbox on second row
            HelperUtils.getRowCheckboxDiv(childGrid.dataRowList.toArray()[1].nativeElement).dispatchEvent(mockEvent);
            fix.detectChanges();

            expect(secondChildSpy).toHaveBeenCalledTimes(0);
            expect(parentSpy).toHaveBeenCalledTimes(0);
            expect(childSpy).toHaveBeenCalledTimes(2);
            expect(childSpy).toHaveBeenCalledWith({
                added: ['01'],
                cancel: false,
                event: mockEvent,
                newSelection: ['01'],
                oldSelection: ['00'],
                removed: ['00'],
                owner: childGrid
            });

            // Click on a row in parent grid
            row = hierarchicalGrid.dataRowList.toArray()[1];
            row.nativeElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            expect(secondChildSpy).toHaveBeenCalledTimes(0);
            expect(childSpy).toHaveBeenCalledTimes(2);
            expect(parentSpy).toHaveBeenCalledTimes(1);
            expect(parentSpy).toHaveBeenCalledWith({
                added: ['1'],
                cancel: false,
                event: mockEvent,
                newSelection: ['1'],
                oldSelection: [],
                removed: []
            });

            // Click on a header checkbox in parent grid
            HelperUtils.getRowCheckboxDiv(HelperUtils.getHeaderRow(hierarchicalGrid)).dispatchEvent(mockEvent);
            fix.detectChanges();

            expect(secondChildSpy).toHaveBeenCalledTimes(0);
            expect(childSpy).toHaveBeenCalledTimes(2);
            expect(parentSpy).toHaveBeenCalledTimes(2);
            expect(parentSpy).toHaveBeenCalledWith({
                added: ['0', '2', '3', '4'],
                cancel: false,
                event: mockEvent,
                newSelection: ['1', '0', '2', '3', '4'],
                oldSelection: ['1'],
                removed: []
            });
        });

        it('should able to select multiple rows with Shift and click', () => {
            // Expand first row
            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            firstRow.nativeElement.children[0].click();
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0']);

            const fourthRow = hierarchicalGrid.dataRowList.toArray()[3];
            UIInteractions.simulateClickEvent(fourthRow.nativeElement, true);
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected(
                [firstRow, hierarchicalGrid.dataRowList.toArray()[1], hierarchicalGrid.dataRowList.toArray()[2], fourthRow]);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3']);

            // Verify no rows are selected in the child grid
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.selectedRows()).toEqual([]);
            for (const r of childGrid.dataRowList.toArray()) {
                HelperUtils.verifyRowSelected(r, false);
            }
        });

        it('should able to select multiple rows with Ctrl and click', () => {
            // Expand first row
            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            firstRow.nativeElement.children[0].click();
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0']);

            const fourthRow = hierarchicalGrid.dataRowList.toArray()[3];
            UIInteractions.simulateClickEvent(fourthRow.nativeElement, false, true);
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected([firstRow, fourthRow]);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '3']);

            // Click on a row in the child grid
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.selectedRows()).toEqual([]);

            const childGridFirstRow = childGrid.dataRowList.toArray()[2];
            UIInteractions.simulateClickEvent(childGridFirstRow.nativeElement, false, true);
            fix.detectChanges();

            HelperUtils.verifyRowsArraySelected([firstRow, fourthRow]);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '3']);
            HelperUtils.verifyRowSelected(childGridFirstRow);
            expect(childGrid.selectedRows()).toEqual(['02']);
        });

        it('should able to select only one row when rowSelection is single', () => {
            // Expand first row
            hierarchicalGrid.dataRowList.toArray()[0].nativeElement.children[0].click();
            fix.detectChanges();

            // Click on a row in the child grid
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.selectedRows()).toEqual([]);

            const firstRow = childGrid.dataRowList.toArray()[0];
            const secondRow = childGrid.dataRowList.toArray()[2];

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            expect(childGrid.selectedRows()).toEqual(['00']);

            // Click on second row holding Ctrl
            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow);
            expect(childGrid.selectedRows()).toEqual(['02']);

            // Click on first row holding Shift key
            UIInteractions.simulateClickEvent(firstRow.nativeElement, true);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyRowSelected(secondRow, false);
            expect(childGrid.selectedRows()).toEqual(['00']);

            // Click on second row checkbox
            HelperUtils.clickRowCheckbox(secondRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyRowSelected(secondRow);
            expect(childGrid.selectedRows()).toEqual(['02']);
        });

        it('should able to select/deselect all rows by clicking on the header checkbox', () => {
            // Set multiple selection to first row island
            rowIsland1.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            // Expand first row
            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            firstRow.nativeElement.children[0].click();
            fix.detectChanges();

            // Expand second row
            const secondRow = hierarchicalGrid.dataRowList.toArray()[1];
            secondRow.nativeElement.children[0].click();
            fix.detectChanges();

            // Select all rows in parent
            HelperUtils.clickHeaderRowCheckbox(hierarchicalGrid);
            fix.detectChanges();

            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4']);
            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, true);

            const childGrid1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const childGrid2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[1];
            expect(childGrid1.selectedRows()).toEqual([]);
            expect(childGrid2.selectedRows()).toEqual([]);
            HelperUtils.verifyHeaderRowCheckboxState(childGrid1);
            HelperUtils.verifyHeaderRowCheckboxState(childGrid2);

            // Select all rows in child
            HelperUtils.clickHeaderRowCheckbox(childGrid1);
            fix.detectChanges();

            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4']);
            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, true);

            expect(childGrid1.selectedRows()).toEqual(['00', '01', '02']);
            HelperUtils.verifyHeaderRowCheckboxState(childGrid1, true);
            expect(childGrid2.selectedRows()).toEqual([]);
            HelperUtils.verifyHeaderRowCheckboxState(childGrid2);

            // Deselect all rows in parent
            HelperUtils.clickHeaderRowCheckbox(hierarchicalGrid);
            fix.detectChanges();

            expect(hierarchicalGrid.selectedRows()).toEqual([]);
            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid);

            expect(childGrid1.selectedRows()).toEqual(['00', '01', '02']);
            HelperUtils.verifyHeaderRowCheckboxState(childGrid1, true);
            expect(childGrid2.selectedRows()).toEqual([]);
            HelperUtils.verifyHeaderRowCheckboxState(childGrid2);

            // Deselect all rows in child
            HelperUtils.clickHeaderRowCheckbox(childGrid1);
            fix.detectChanges();

            expect(hierarchicalGrid.selectedRows()).toEqual([]);
            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid);

            expect(childGrid1.selectedRows()).toEqual([]);
            HelperUtils.verifyHeaderRowCheckboxState(childGrid1);
            expect(childGrid2.selectedRows()).toEqual([]);
            HelperUtils.verifyHeaderRowCheckboxState(childGrid2);
        });

        it('should have correct header checkbox state when selecting rows', () => {
            const firstRow = hierarchicalGrid.getRowByIndex(0);
            const secondRow = hierarchicalGrid.getRowByIndex(1);
            HelperUtils.verifyHeaderRowCheckboxState(fix);

            // Select all rows
            hierarchicalGrid.rowList.toArray().forEach(row => {
                HelperUtils.clickRowCheckbox(row);
                fix.detectChanges();
                HelperUtils.verifyRowSelected(row);
            });

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4']);

            // Unselect a row
            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['1', '2', '3', '4']);

            // Click on a row
            secondRow.nativeElement.dispatchEvent(new MouseEvent('click'));
            fix.detectChanges();

            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['1']);
        });

        it('should retain selected row when filtering', () => {
            const firstRow = hierarchicalGrid.getRowByIndex(0);
            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            hierarchicalGrid.filter('ID', '1', IgxStringFilteringOperand.instance().condition('doesNotContain'), true);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(hierarchicalGrid.getRowByIndex(0));
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
        });

        it('should child grid selection should not be changed when filter parent', () => {
            rowIsland1.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            // expand first row
            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            firstRow.nativeElement.children[0].click();
            fix.detectChanges();

            // select second row
            const secondRow = hierarchicalGrid.dataRowList.toArray()[1];
            HelperUtils.clickRowCheckbox(secondRow);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, false, true);

            // Select all rows in child grid
            let childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            HelperUtils.clickHeaderRowCheckbox(childGrid);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(childGrid, true);

            // filter parent grid
            hierarchicalGrid.filter('ID', '1', IgxStringFilteringOperand.instance().condition('equals'), true);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, true);

            // Expand filtered row
            hierarchicalGrid.dataRowList.toArray()[0].nativeElement.children[0].click();
            fix.detectChanges();

            childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[1];
            HelperUtils.verifyHeaderRowCheckboxState(childGrid);
            HelperUtils.verifyRowsArraySelected(childGrid.dataRowList.toArray(), false);

            // Clear filter
            hierarchicalGrid.clearFilter();
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, false, true);
            childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            HelperUtils.verifyHeaderRowCheckboxState(childGrid, true);
            HelperUtils.verifyRowsArraySelected(childGrid.dataRowList.toArray());
        });

        it('should not be able to select deleted row', () => {
            // Expand first row
            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            firstRow.nativeElement.children[0].click();
            fix.detectChanges();

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            // delete selected row
            hierarchicalGrid.deleteRow('0');
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix);
            expect(hierarchicalGrid.selectedRows()).toEqual([]);

            // Click on deleted row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix);
            expect(hierarchicalGrid.selectedRows()).toEqual([]);

            // Click on checkbox for deleted row
            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix);
            expect(hierarchicalGrid.selectedRows()).toEqual([]);

            // Select all rows
            hierarchicalGrid.selectAllRows();
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['1', '2', '3', '4']);

            // Click on a row in the child grid
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.selectedRows()).toEqual([]);

            const childGridFirstRow = childGrid.dataRowList.toArray()[0];
            UIInteractions.simulateClickEvent(childGridFirstRow.nativeElement, false, true);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['1', '2', '3', '4']);
            expect(childGrid.selectedRows()).toEqual(['00']);
        });

        it('should be able to select added row', () => {
            // Set multiple selection to first row island
            rowIsland1.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            // Expand first row
            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            firstRow.nativeElement.children[0].click();
            fix.detectChanges();

            HelperUtils.clickHeaderRowCheckbox(hierarchicalGrid);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4']);

            hierarchicalGrid.addRow({ ID: '5', ChildLevels: 3, ProductName: 'New Product' });
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, false, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4']);
            let lastRow = hierarchicalGrid.dataRowList.toArray()[5];
            HelperUtils.verifyRowSelected(lastRow, false);

            HelperUtils.clickRowCheckbox(lastRow);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4', '5']);

            // Add row in child grid
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.selectedRows()).toEqual([]);
            childGrid.addRow({ ID: '03', ChildLevels: 2, ProductName: 'New Product' });
            fix.detectChanges();

            HelperUtils.clickHeaderRowCheckbox(childGrid);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(childGrid, true);
            expect(childGrid.selectedRows()).toEqual(['00', '01', '02', '03']);
            lastRow = childGrid.dataRowList.toArray()[3];
            HelperUtils.verifyRowSelected(lastRow);
        });
    });

    describe('Row Selection CRUD', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxHierarchicalGridRowSelectionNoTransactionsComponent);
            fix.detectChanges();
            hierarchicalGrid = fix.componentInstance.hgrid;
            rowIsland1 = fix.componentInstance.rowIsland;
            rowIsland2 = fix.componentInstance.rowIsland2;
        }));

        it('should deselect deleted row', () => {
            HelperUtils.clickHeaderRowCheckbox(hierarchicalGrid);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4']);

            hierarchicalGrid.deleteRow('1');
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '2', '3', '4']);
            expect(hierarchicalGrid.dataRowList.length).toEqual(4);

            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, false, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['2', '3', '4']);

            hierarchicalGrid.deleteRow('0');
            fix.detectChanges();

            expect(hierarchicalGrid.dataRowList.length).toEqual(3);
            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['2', '3', '4']);
        });

        it('should be able to select added row', () => {
            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            firstRow.nativeElement.children[0].click();
            fix.detectChanges();

            hierarchicalGrid.addRow({ ID: '5', ChildLevels: 3, ProductName: 'New Product' });
            fix.detectChanges();

            expect(hierarchicalGrid.dataRowList.length).toEqual(6);
            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid);

            hierarchicalGrid.selectAllRows();
            fix.detectChanges();

            let addedRow = hierarchicalGrid.dataRowList.toArray()[5];
            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, true);
            HelperUtils.verifyRowSelected(addedRow);

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            HelperUtils.clickHeaderRowCheckbox(childGrid);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(childGrid, true);

            childGrid.addRow({ ID: '03', ChildLevels: 3, ProductName: 'New Product' });
            fix.detectChanges();

            addedRow = childGrid.dataRowList.toArray()[3];
            HelperUtils.verifyRowSelected(addedRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(childGrid, false, true);
            HelperUtils.verifyHeaderRowCheckboxState(hierarchicalGrid, true);

            HelperUtils.clickRowCheckbox(addedRow);
            fix.detectChanges();
            HelperUtils.verifyRowSelected(addedRow);
            HelperUtils.verifyHeaderRowCheckboxState(childGrid, true);
        });
    });

    describe('Custom row selectors', () => {
        let hGrid;
        let firstLevelChild;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxHierarchicalGridCustomSelectorsComponent);
            fix.detectChanges();
            hGrid = fix.componentInstance.hGrid;
            hGrid.rowSelection = GridSelectionMode.multiple;
            firstLevelChild = fix.componentInstance.firstLevelChild;
        }));

        /** Tests should check root and child grids */

        it('Row context `select` method selects a single row', () => {
            // root grid
            const firstRootRow = hGrid.getRowByIndex(0);
            firstRootRow.nativeElement.click();
            fix.detectChanges();
            HelperUtils.verifyRowSelected(hGrid.getRowByIndex(0));
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            // child grid
            HelperUtils.expandRowIsland(2);
            fix.detectChanges();
            const firstChildRow = firstLevelChild.getRowByIndex(0);
            firstChildRow.nativeElement.click();
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstLevelChild.getRowByIndex(0));
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
        });

        it('Row context `deselect` method deselects an already selected row', () => {
            // root grid
            const firstRootRow = hGrid.getRowByIndex(1);
            HelperUtils.rowCheckboxClick(firstRootRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(hGrid.getRowByIndex(1));
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            HelperUtils.rowCheckboxClick(firstRootRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(hGrid.getRowByIndex(1), false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, false);

            // child grid
            HelperUtils.expandRowIsland(2);
            const firstLevelChildRow = firstLevelChild.getRowByIndex(0);
            HelperUtils.rowCheckboxClick(firstLevelChildRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstLevelChildRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);

            HelperUtils.rowCheckboxClick(firstLevelChildRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstLevelChildRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, false);
        });

        it('Header context `selectAll` method selects all rows', () => {
            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, true, false);
            expect(hGrid.selectionService.areAllRowSelected()).toBeTruthy();
        });

        it('Header context `deselectAll` method deselects all rows', () => {
            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, true, false);
            expect(hGrid.selectionService.areAllRowSelected()).toBeTruthy();

            HelperUtils.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            HelperUtils.verifyHeaderRowCheckboxState(fix, false, false);
            expect(hGrid.selectionService.areAllRowSelected()).toBeFalsy();
        });

        it('Should have the correct properties in the custom row selector header template', () => {
            spyOn(fix.componentInstance, 'handleHeadSelectorClick').and.callThrough();
            HelperUtils.headerCheckboxClick(fix);
            fix.detectChanges();

            expect(fix.componentInstance.handleHeadSelectorClick).toHaveBeenCalledWith(new MouseEvent('click'), {
                selectedCount: 0,
                totalCount: hGrid.data.length,
                selectAll: jasmine.anything(),
                deselectAll: jasmine.anything()
            });
        });

        it('Should have the correct properties in the custom row selector template', () => {
            spyOn(fix.componentInstance, 'handleRowSelectorClick').and.callThrough();

            const firstRootRow = hGrid.getRowByIndex(1);
            HelperUtils.rowCheckboxClick(firstRootRow);
            fix.detectChanges();

            expect(fix.componentInstance.handleRowSelectorClick).toHaveBeenCalledWith(new MouseEvent('click'), {
                index: 1,
                rowID: '1',
                selected: false,
                select: jasmine.anything(),
                deselect: jasmine.anything()
            });
        });

        it('Should have correct indices on all pages', () => {
            hGrid.nextPage();
            fix.detectChanges();

            const firstRootRow = hGrid.getRowByIndex(0);
            expect(firstRootRow.nativeElement.querySelector('.rowNumber').textContent).toEqual('15');
        });
    });
});
