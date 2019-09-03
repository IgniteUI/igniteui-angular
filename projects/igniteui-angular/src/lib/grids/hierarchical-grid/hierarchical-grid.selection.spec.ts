import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, fakeAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './index';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { IgxIconModule } from '../../icon';
import { IgxHierarchicalGridTestBaseComponent,
        IgxHierarchicalGridRowSelectionComponent,
        IgxHierarchicalGridRowSelectionNoTransactionsComponent } from '../../test-utils/hierarhical-grid-components.spec';
import { GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { GridSelectionMode } from '../types';

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
                IgxHierarchicalGridRowSelectionNoTransactionsComponent
            ],
            imports: [
                NoopAnimationsModule, IgxHierarchicalGridModule, IgxIconModule]
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

            let firstRow = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            firstRow.toggle();
            fix.detectChanges();
            expect(firstRow.expanded).toBeTruthy();

            let fCell = firstRow.cells.toArray()[0];

            // select parent cell
            fCell.nativeElement.focus();
            await wait(100);
            fix.detectChanges();

            expect(fCell.selected).toBeTruthy();

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const firstChildRow = childGrid.getRowByIndex(0);
            const fChildCell = firstChildRow.cells.toArray()[0];

            // select child cell
            fChildCell.nativeElement.focus();
            await wait(100);
            fix.detectChanges();

            expect(fChildCell.selected).toBeTruthy();
            expect(fCell.selected).toBeFalsy();

            // select parent cell
            firstRow = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
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
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(fix);
            GridSelectionFunctions.verifyHeaderAndRowCheckBoxesAlignment(hierarchicalGrid);

            for (const r of hierarchicalGrid.dataRowList.toArray()) {
                GridSelectionFunctions.verifyRowHasCheckbox(r.nativeElement);
            }

            let childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.rowSelection).toBe(GridSelectionMode.single);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(childGrid, false);
            GridSelectionFunctions.verifyHeaderAndRowCheckBoxesAlignment(childGrid);

            for (const r of childGrid.dataRowList.toArray()) {
                GridSelectionFunctions.verifyRowHasCheckbox(r.nativeElement);
            }

            childGrid = childGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.rowSelection).toBe(GridSelectionMode.none);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(childGrid, false, false);

            for (const r of childGrid.dataRowList.toArray()) {
                GridSelectionFunctions.verifyRowHasCheckbox(r.nativeElement, false, false);
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
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(hierarchicalGrid, false, false);
            for (const r of hierarchicalGrid.dataRowList.toArray()) {
                GridSelectionFunctions.verifyRowHasCheckbox(r.nativeElement, false, false);
            }

            expect(childGridLevel1.rowSelection).toBe(GridSelectionMode.multiple);
            expect(childGridLevel1.selectedRows()).toEqual([]);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(childGridLevel1);
            for (const r of childGridLevel1.dataRowList.toArray()) {
                GridSelectionFunctions.verifyRowHasCheckbox(r.nativeElement);
            }
            GridSelectionFunctions.verifyHeaderAndRowCheckBoxesAlignment(childGridLevel1);

            expect(childGridLevel2.rowSelection).toBe(GridSelectionMode.single);
            expect(childGridLevel2.selectedRows()).toEqual([]);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(childGridLevel2, false);
            for (const r of childGridLevel2.dataRowList.toArray()) {
                GridSelectionFunctions.verifyRowHasCheckbox(r.nativeElement);
            }
            GridSelectionFunctions.verifyHeaderAndRowCheckBoxesAlignment(childGridLevel2);
        });

        it('should able to change showRowCheckboxes at runtime', () => {
            hierarchicalGrid.expandChildren = true;
            fix.detectChanges();

            hierarchicalGrid.hideRowSelectors = true;
            rowIsland1.hideRowSelectors = true;
            fix.detectChanges();

            expect(hierarchicalGrid.hideRowSelectors).toBe(true);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(hierarchicalGrid, false, false);
            for (const r of hierarchicalGrid.dataRowList.toArray()) {
                GridSelectionFunctions.verifyRowHasCheckbox(r.nativeElement, false, false);
            }

            const childGridLevel1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGridLevel1.hideRowSelectors).toBe(true);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(childGridLevel1, false, false);
            for (const r of childGridLevel1.dataRowList.toArray()) {
                GridSelectionFunctions.verifyRowHasCheckbox(r.nativeElement, false, false);
            }

            hierarchicalGrid.hideRowSelectors = false;
            rowIsland1.hideRowSelectors = false;
            fix.detectChanges();

            expect(hierarchicalGrid.hideRowSelectors).toBe(false);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(hierarchicalGrid);
            for (const r of hierarchicalGrid.dataRowList.toArray()) {
                GridSelectionFunctions.verifyRowHasCheckbox(r.nativeElement);
            }

            expect(childGridLevel1.hideRowSelectors).toBe(false);
            GridSelectionFunctions.verifyHeaderRowHasCheckbox(childGridLevel1, false);
            for (const r of childGridLevel1.dataRowList.toArray()) {
                GridSelectionFunctions.verifyRowHasCheckbox(r.nativeElement);
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
            let row = childGrid.getRowByIndex(0);
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
            GridSelectionFunctions.getRowCheckboxDiv(childGrid.getRowByIndex(1).nativeElement).dispatchEvent(mockEvent);
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
            row = hierarchicalGrid.getRowByIndex(2);
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
            GridSelectionFunctions.getRowCheckboxDiv(GridSelectionFunctions.getHeaderRow(hierarchicalGrid)).dispatchEvent(mockEvent);
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
            // Click first row expand button
            const firstRow = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            firstRow.toggle();
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0']);

            const fourthRow = hierarchicalGrid.getRowByIndex(4);
            UIInteractions.simulateClickEvent(fourthRow.nativeElement, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowsArraySelected(
                [firstRow, hierarchicalGrid.getRowByIndex(2), hierarchicalGrid.getRowByIndex(3), fourthRow]);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3']);

            // Verify no rows are selected in the child grid
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.selectedRows()).toEqual([]);
            for (const r of childGrid.dataRowList.toArray()) {
                GridSelectionFunctions.verifyRowSelected(r, false);
            }
        });

        it('should able to select multiple rows with Ctrl and click', () => {
            // Expand first row
            const firstRow = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            firstRow.toggle();
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0']);

            const fourthRow = hierarchicalGrid.getRowByIndex(4);
            UIInteractions.simulateClickEvent(fourthRow.nativeElement, false, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowsArraySelected([firstRow, fourthRow]);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '3']);

            // Click on a row in the child grid
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.selectedRows()).toEqual([]);

            const childGridFirstRow = childGrid.getRowByIndex(2);
            UIInteractions.simulateClickEvent(childGridFirstRow.nativeElement, false, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowsArraySelected([firstRow, fourthRow]);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '3']);
            GridSelectionFunctions.verifyRowSelected(childGridFirstRow);
            expect(childGrid.selectedRows()).toEqual(['02']);
        });

        it('should able to select only one row when rowSelection is single', () => {
            // Expand first row
            const row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            row.toggle();
            fix.detectChanges();

            // Click on a row in the child grid
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.selectedRows()).toEqual([]);

            const firstRow = childGrid.getRowByIndex(0);
            const secondRow = childGrid.getRowByIndex(2);

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            expect(childGrid.selectedRows()).toEqual(['00']);

            // Click on second row holding Ctrl
            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            expect(childGrid.selectedRows()).toEqual(['02']);

            // Click on first row holding Shift key
            UIInteractions.simulateClickEvent(firstRow.nativeElement, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyRowSelected(secondRow, false);
            expect(childGrid.selectedRows()).toEqual(['00']);

            // Click on second row checkbox
            GridSelectionFunctions.clickRowCheckbox(secondRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyRowSelected(secondRow);
            expect(childGrid.selectedRows()).toEqual(['02']);
        });

        it('should able to select/deselect all rows by clicking on the header checkbox', () => {
            // Set multiple selection to first row island
            rowIsland1.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            // Expand first row
            let row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            row.toggle();
            fix.detectChanges();

            // Expand second row
            row = hierarchicalGrid.getRowByIndex(2) as IgxHierarchicalRowComponent;
            row.toggle();
            fix.detectChanges();

            // Select all rows in parent
            GridSelectionFunctions.clickHeaderRowCheckbox(hierarchicalGrid);
            fix.detectChanges();

            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4']);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, true);

            const childGrid1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const childGrid2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[1];
            expect(childGrid1.selectedRows()).toEqual([]);
            expect(childGrid2.selectedRows()).toEqual([]);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid1);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid2);

            // Select all rows in child
            GridSelectionFunctions.clickHeaderRowCheckbox(childGrid1);
            fix.detectChanges();

            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4']);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, true);

            expect(childGrid1.selectedRows()).toEqual(['00', '01', '02']);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid1, true);
            expect(childGrid2.selectedRows()).toEqual([]);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid2);

            // Deselect all rows in parent
            GridSelectionFunctions.clickHeaderRowCheckbox(hierarchicalGrid);
            fix.detectChanges();

            expect(hierarchicalGrid.selectedRows()).toEqual([]);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid);

            expect(childGrid1.selectedRows()).toEqual(['00', '01', '02']);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid1, true);
            expect(childGrid2.selectedRows()).toEqual([]);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid2);

            // Deselect all rows in child
            GridSelectionFunctions.clickHeaderRowCheckbox(childGrid1);
            fix.detectChanges();

            expect(hierarchicalGrid.selectedRows()).toEqual([]);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid);

            expect(childGrid1.selectedRows()).toEqual([]);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid1);
            expect(childGrid2.selectedRows()).toEqual([]);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid2);
        });

        it('should have correct header checkbox state when selecting rows', () => {
            const firstRow = hierarchicalGrid.getRowByIndex(0);
            const secondRow = hierarchicalGrid.getRowByIndex(1);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);

            // Select all rows
            hierarchicalGrid.rowList.toArray().forEach(row => {
                GridSelectionFunctions.clickRowCheckbox(row);
                fix.detectChanges();
                GridSelectionFunctions.verifyRowSelected(row);
            });

            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4']);

            // Unselect a row
            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['1', '2', '3', '4']);

            // Click on a row
            secondRow.nativeElement.dispatchEvent(new MouseEvent('click'));
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(secondRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['1']);
        });

        it('should retain selected row when filtering', () => {
            const firstRow = hierarchicalGrid.getRowByIndex(0);
            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            hierarchicalGrid.filter('ID', '1', IgxStringFilteringOperand.instance().condition('doesNotContain'), true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(hierarchicalGrid.getRowByIndex(0));
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);
        });

        it('should child grid selection should not be changed when filter parent', () => {
            rowIsland1.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            // expand first row
            let row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            row.toggle();
            fix.detectChanges();

            // select second row
            const secondRow = hierarchicalGrid.getRowByIndex(2);
            GridSelectionFunctions.clickRowCheckbox(secondRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, false, true);

            // Select all rows in child grid
            let childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            GridSelectionFunctions.clickHeaderRowCheckbox(childGrid);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid, true);

            // filter parent grid
            hierarchicalGrid.filter('ID', '1', IgxStringFilteringOperand.instance().condition('equals'), true);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, true);

            // Expand filtered row
            row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            row.toggle();
            fix.detectChanges();

            childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[1];
            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid);
            GridSelectionFunctions.verifyRowsArraySelected(childGrid.dataRowList.toArray(), false);

            // Clear filter
            hierarchicalGrid.clearFilter();
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, false, true);
            childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid, true);
            GridSelectionFunctions.verifyRowsArraySelected(childGrid.dataRowList.toArray());
        });

        it('should not be able to select deleted row', () => {
            // Expand first row
            const firstRow = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            firstRow.toggle();
            fix.detectChanges();

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, false, true);

            // delete selected row
            hierarchicalGrid.deleteRow('0');
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            expect(hierarchicalGrid.selectedRows()).toEqual([]);

            // Click on deleted row
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            expect(hierarchicalGrid.selectedRows()).toEqual([]);

            // Click on checkbox for deleted row
            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix);
            expect(hierarchicalGrid.selectedRows()).toEqual([]);

            // Select all rows
            hierarchicalGrid.selectAllRows();
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['1', '2', '3', '4']);

            // Click on a row in the child grid
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.selectedRows()).toEqual([]);

            const childGridFirstRow = childGrid.getRowByIndex(0);
            UIInteractions.simulateClickEvent(childGridFirstRow.nativeElement, false, true);
            fix.detectChanges();

            GridSelectionFunctions.verifyRowSelected(firstRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(fix, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['1', '2', '3', '4']);
            expect(childGrid.selectedRows()).toEqual(['00']);
        });

        it('should be able to select added row', () => {
            // Set multiple selection to first row island
            rowIsland1.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            // Expand first row
            const firstRow = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            firstRow.toggle();
            fix.detectChanges();

            GridSelectionFunctions.clickHeaderRowCheckbox(hierarchicalGrid);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4']);

            hierarchicalGrid.addRow({ ID: '5', ChildLevels: 3, ProductName: 'New Product' });
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, false, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4']);
            let lastRow = hierarchicalGrid.getRowByIndex(6);
            GridSelectionFunctions.verifyRowSelected(lastRow, false);

            GridSelectionFunctions.clickRowCheckbox(lastRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4', '5']);

            // Add row in child grid
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            expect(childGrid.selectedRows()).toEqual([]);
            childGrid.addRow({ ID: '03', ChildLevels: 2, ProductName: 'New Product' });
            fix.detectChanges();

            GridSelectionFunctions.clickHeaderRowCheckbox(childGrid);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid, true);
            expect(childGrid.selectedRows()).toEqual(['00', '01', '02', '03']);
            lastRow = childGrid.getRowByIndex(3);
            GridSelectionFunctions.verifyRowSelected(lastRow);
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
            GridSelectionFunctions.clickHeaderRowCheckbox(hierarchicalGrid);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4']);

            hierarchicalGrid.deleteRow('1');
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '2', '3', '4']);
            expect(hierarchicalGrid.dataRowList.length).toEqual(4);

            const firstRow = hierarchicalGrid.getRowByIndex(0);
            GridSelectionFunctions.clickRowCheckbox(firstRow);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, false, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['2', '3', '4']);

            hierarchicalGrid.deleteRow('0');
            fix.detectChanges();

            expect(hierarchicalGrid.dataRowList.length).toEqual(3);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['2', '3', '4']);
        });

        it('should be able to select added row', () => {
            // Expand first row
            const firstRow = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            firstRow.toggle();
            fix.detectChanges();

            hierarchicalGrid.addRow({ ID: '5', ChildLevels: 3, ProductName: 'New Product' });
            fix.detectChanges();

            expect(hierarchicalGrid.dataRowList.length).toEqual(6);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid);

            hierarchicalGrid.selectAllRows();
            fix.detectChanges();

            let addedRow = hierarchicalGrid.getRowByIndex(5);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, true);
            GridSelectionFunctions.verifyRowSelected(addedRow);

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            GridSelectionFunctions.clickHeaderRowCheckbox(childGrid);
            fix.detectChanges();

            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid, true);

            childGrid.addRow({ ID: '03', ChildLevels: 3, ProductName: 'New Product' });
            fix.detectChanges();

            addedRow = childGrid.getRowByIndex(3);
            GridSelectionFunctions.verifyRowSelected(addedRow, false);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid, false, true);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(hierarchicalGrid, true);

            GridSelectionFunctions.clickRowCheckbox(addedRow);
            fix.detectChanges();
            GridSelectionFunctions.verifyRowSelected(addedRow);
            GridSelectionFunctions.verifyHeaderRowCheckboxState(childGrid, true);
        });
    });
});
