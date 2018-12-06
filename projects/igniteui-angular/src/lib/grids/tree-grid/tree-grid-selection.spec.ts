import { async, TestBed, fakeAsync, tick, ComponentFixture } from '@angular/core/testing';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridModule, IgxGridCellComponent } from './index';
import { IgxTreeGridCellComponent } from './tree-cell.component';
import {
    IgxTreeGridSimpleComponent,
    IgxTreeGridCellSelectionComponent,
    IgxTreeGridSelectionRowEditingComponent
} from '../../test-utils/tree-grid-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    TreeGridFunctions,
    TREE_ROW_SELECTION_CSS_CLASS,
    ROW_EDITING_BANNER_OVERLAY_CLASS,
    TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS
} from '../../test-utils/tree-grid-functions.spec';
import { IgxStringFilteringOperand, IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { wait } from '../../test-utils/ui-interactions.spec';
import { transpileModule } from 'typescript';
import { TestabilityRegistry } from '@angular/core';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';

describe('IgxTreeGrid - Selection', () => {
    configureTestSuite();
    let fix;
    let treeGrid: IgxTreeGridComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSimpleComponent,
                IgxTreeGridCellSelectionComponent,
                IgxTreeGridSelectionRowEditingComponent
            ],
            imports: [IgxTreeGridModule, NoopAnimationsModule]
        })
            .compileComponents();
    }));

    describe('API Row Selection', () => {
        configureTestSuite();
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
            fix.detectChanges();

            treeGrid = fix.componentInstance.treeGrid;
            treeGrid.rowSelectable = true;
            await wait();
            fix.detectChanges();
        });

        it('should have checkbox on each row if rowSelectable is true', () => {
            const rows = TreeGridFunctions.getAllRows(fix);

            expect(rows.length).toBe(10);
            rows.forEach((row) => {
                const checkBoxElement = row.nativeElement.querySelector(TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS);
                expect(checkBoxElement).not.toBeNull();
            });

            treeGrid.rowSelectable = false;

            expect(rows.length).toBe(10);
            rows.forEach((row) => {
                const checkBoxElement = row.nativeElement.querySelector(TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS);
                expect(checkBoxElement).toBeNull();
            });
        });

        it('should be able to select/deselect all rows', () => {
            treeGrid.selectAllRows();
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            treeGrid.deselectAllRows();
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [], true);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it('when all items are selected and then some of the selected rows are deleted, still all the items should be selected', () => {
            treeGrid.selectAllRows();
            fix.detectChanges();
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            treeGrid.deleteRowById(treeGrid.selectedRows()[0]);
            fix.detectChanges();
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            treeGrid.deleteRowById(treeGrid.selectedRows()[0]);
            fix.detectChanges();
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            treeGrid.deleteRowById(treeGrid.selectedRows()[0]);
            fix.detectChanges();
             // When deleting the last selected row, header checkbox will be unchecked.
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it('should be able to select row of any level', () => {
            treeGrid.selectRows([treeGrid.getRowByIndex(0).rowID], true);
            fix.detectChanges();

            // Verify selection.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.selectRows([treeGrid.getRowByIndex(2).rowID], false);
            fix.detectChanges();

            // Verify new selection by keeping the old one.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2], true);

            treeGrid.selectRows([treeGrid.getRowByIndex(1).rowID, treeGrid.getRowByIndex(3).rowID,
            treeGrid.getRowByIndex(6).rowID, treeGrid.getRowByIndex(8).rowID], true);
            fix.detectChanges();

            // Verify new selection by NOT keeping the old one.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2], false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 3, 6, 8], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('should be able to deselect row of any level', () => {
            treeGrid.selectRows([treeGrid.getRowByIndex(1).rowID, treeGrid.getRowByIndex(3).rowID,
            treeGrid.getRowByIndex(6).rowID, treeGrid.getRowByIndex(8).rowID,
            treeGrid.getRowByIndex(9).rowID], true);
            fix.detectChanges();

            treeGrid.deselectRows([treeGrid.getRowByIndex(1).rowID, treeGrid.getRowByIndex(3).rowID]);
            fix.detectChanges();

            // Verify modified selection
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 3], false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [6, 8, 9], true);
        });

        it('should persist the selection after sorting', () => {
            treeGrid.selectRows([treeGrid.getRowByIndex(0).rowID, treeGrid.getRowByIndex(4).rowID], true);
            fix.detectChanges();

            treeGrid.sort({ fieldName: 'Age', dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            // Verification indices are different since the sorting changes rows' positions.
            TreeGridFunctions.verifyDataRowsSelection(fix, [2, 7], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.clearSort();
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 4], true);
        });

        it('should persist the selection after filtering', fakeAsync(() => {
            treeGrid.selectRows([treeGrid.getRowByIndex(0).rowID, treeGrid.getRowByIndex(5).rowID,
            treeGrid.getRowByIndex(8).rowID], true);
            fix.detectChanges();

            treeGrid.filter('Age', 40, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();
            tick(100);

            // Verification indices are different since the sorting changes rows' positions.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2, 4], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.clearFilter();
            fix.detectChanges();
            tick(100);

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 5, 8], true);
        }));

        it('should persist the selection after expand/collapse', () => {
            treeGrid.selectRows([treeGrid.getRowByIndex(0).rowID, treeGrid.getRowByIndex(3).rowID,
            treeGrid.getRowByIndex(5).rowID], true);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(3);

            // Collapse row and verify visible selected rows
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
            expect(getVisibleSelectedRows(fix).length).toBe(1);

            // Expand same row and verify visible selected rows
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
            expect(getVisibleSelectedRows(fix).length).toBe(3);

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 3, 5], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('should persist selection after paging', () => {
            treeGrid.selectRows([treeGrid.getRowByIndex(0).rowID, treeGrid.getRowByIndex(3).rowID,
            treeGrid.getRowByIndex(5).rowID], true);
            fix.detectChanges();

            treeGrid.paging = true;
            treeGrid.perPage = 4;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 2, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, true);

            treeGrid.page = 1;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 2, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, false);

            treeGrid.page = 2;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, false);
        });
    });

    describe('UI Row Selection', () => {
        configureTestSuite();
        beforeEach(async() => {
            fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
            fix.detectChanges();

            treeGrid = fix.componentInstance.treeGrid;
            treeGrid.rowSelectable = true;
            await wait();
            fix.detectChanges();
        });

        it('should be able to select/deselect all rows', () => {
            TreeGridFunctions.clickHeaderRowSelectionCheckbox(fix);
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            TreeGridFunctions.clickHeaderRowSelectionCheckbox(fix);
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [], true);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it('should be able to select row of any level', () => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            fix.detectChanges();
            TreeGridFunctions.verifyDataRowsSelection(fix, [0], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            TreeGridFunctions.clickRowSelectionCheckbox(fix, 2);
            fix.detectChanges();
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2], true);

            // Deselect rows
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 2);
            fix.detectChanges();

            // Select new rows
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 1);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 6);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 8);
            fix.detectChanges();

            // Verify new selection
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2], false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 3, 6, 8], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('should be able to deselect row of any level', () => {
            // Select rows
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 1);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 6);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 8);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 9);
            fix.detectChanges();

            // Deselect rows
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 1);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            fix.detectChanges();

            // Verify modified selection
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 3], false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [6, 8, 9], true);
        });

        it('should persist the selection after sorting', () => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 4);

            treeGrid.columnList.filter(c => c.field === 'Age')[0].sortable = true;
            fix.detectChanges();
            treeGrid.sort({ fieldName: 'Age', dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            // Verification indices are different since the sorting changes rows' positions.
            TreeGridFunctions.verifyDataRowsSelection(fix, [2, 7], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.clearSort();
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 4], true);
        });

        it('should persist the selection after filtering', fakeAsync(() => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 5);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 8);

            treeGrid.filter('Age', 40, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();
            tick(100);

            // Verification indices are different since the sorting changes rows' positions.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2, 4], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.clearFilter();
            fix.detectChanges();
            tick(100);

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 5, 8], true);
        }));

        it('should update header checkbox when reselecting all filtered-in rows', fakeAsync(() => {
            pending('General Grid Issue #2793');
            treeGrid.filter('Age', 30, IgxNumberFilteringOperand.instance().condition('lessThan'));
            tick(100);

            TreeGridFunctions.clickHeaderRowSelectionCheckbox(fix);
            fix.detectChanges();

            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true); // Verify header checkbox is selected
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0); // Unselect row
            fix.detectChanges();
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null); // Verify header checkbox is indeterminate
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0); // Reselect same row
            fix.detectChanges();
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true); // Verify header checkbox is selected
        }));

        it('should persist the selection after expand/collapse', () => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 5);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(3);

            // Collapse row and verify visible selected rows
            TreeGridFunctions.clickRowIndicator(fix, 0);
            expect(getVisibleSelectedRows(fix).length).toBe(1);

            // Expand same row and verify visible selected rows
            TreeGridFunctions.clickRowIndicator(fix, 0);
            expect(getVisibleSelectedRows(fix).length).toBe(3);

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 3, 5], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('should persist selection after paging', () => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 5);
            fix.detectChanges();

            treeGrid.paging = true;
            treeGrid.perPage = 4;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 2, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, true);

            treeGrid.page = 1;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 2, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, false);

            treeGrid.page = 2;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, false);
        });
    });

    describe('Cell Selection', () => {
        configureTestSuite();
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridCellSelectionComponent);
            fix.detectChanges();

            treeGrid = fix.componentInstance.treeGrid;
            fix.detectChanges();
        });

        it('should return the correct type of cell when clicking on a cells', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            const normalCells = TreeGridFunctions.getNormalCells(rows[0]);
            normalCells[0].triggerEventHandler('focus', new Event('focus'));

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxGridCellComponent).toBe(true);

            let treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            treeGridCell.triggerEventHandler('focus', new Event('focus'));

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);

            // perform 2 clicks and check selection again
            treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            treeGridCell.triggerEventHandler('focus', new Event('focus'));
            treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            treeGridCell.triggerEventHandler('focus', new Event('focus'));
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
        });

        it('should return the correct type of cell when clicking on child cells', () => {
            const rows = TreeGridFunctions.getAllRows(fix);

            // level 1
            let treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            treeGridCell.triggerEventHandler('focus', new Event('focus'));
            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(147);

            // level 2
            treeGridCell = TreeGridFunctions.getTreeCell(rows[1]);
            treeGridCell.triggerEventHandler('focus', new Event('focus'));
            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(475);

            // level 3
            treeGridCell = TreeGridFunctions.getTreeCell(rows[2]);
            treeGridCell.triggerEventHandler('focus', new Event('focus'));
            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(957);
        });

        it('should persist selection after paging', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            const treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            treeGridCell.triggerEventHandler('focus', new Event('focus'));
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(TreeGridFunctions.verifyGridCellHasSelectedClass(treeGridCell)).toBe(true);

            navigateToNextPage(fix);
            navigateToFirstPage(fix);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(TreeGridFunctions.verifyGridCellHasSelectedClass(treeGridCell)).toBe(true);

            navigateToLastPage(fix);
            navigateToFirstPage(fix);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(TreeGridFunctions.verifyGridCellHasSelectedClass(treeGridCell)).toBe(true);
        });

        it('should persist selection after filtering', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            const treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            treeGridCell.triggerEventHandler('focus', new Event('focus'));

            treeGrid.filter('ID', '14', IgxStringFilteringOperand.instance().condition('startsWith'), true);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(TreeGridFunctions.verifyGridCellHasSelectedClass(treeGridCell)).toBe(true);

            // set new filtering
            treeGrid.clearFilter('ProductName');
            treeGrid.filter('ID', '8', IgxStringFilteringOperand.instance().condition('startsWith'), true);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(0);
        });

        it('should persist selection after scrolling', async () => {
            treeGrid.paging = false;
            fix.detectChanges();

            const rows = TreeGridFunctions.getAllRows(fix);
            const treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            treeGridCell.triggerEventHandler('focus', new Event('focus'));
            await wait(100);
            fix.detectChanges();

            // scroll down 150 pixels
            treeGrid.verticalScrollContainer.getVerticalScroll().scrollTop = 150;
            treeGrid.parentVirtDir.getHorizontalScroll().dispatchEvent(new Event('scroll'));
            await wait(100);
            fix.detectChanges();

            // then scroll back to top
            treeGrid.verticalScrollContainer.getVerticalScroll().scrollTop = 0;
            treeGrid.parentVirtDir.getHorizontalScroll().dispatchEvent(new Event('scroll'));
            await wait(100);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(147);
        });

        it('should persist selection after sorting', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            const treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            treeGridCell.triggerEventHandler('focus', new Event('focus'));
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(147);

            treeGrid.sort({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(147);
        });

        it('should persist selection after row delete', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            const treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            treeGridCell.triggerEventHandler('focus', new Event('focus'));
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(147);

            treeGrid.deleteRow(847);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(147);

            treeGrid.deleteRow(147);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(0);
        });

    });

    describe('Cell/Row Selection With Row Editing', () => {
        configureTestSuite();
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxTreeGridSelectionRowEditingComponent);
            fix.detectChanges();

            treeGrid = fix.componentInstance.treeGrid;
            await wait();
            fix.detectChanges();
        });

        it('should display the banner correctly on row selection', fakeAsync(() => {
            const targetCell = treeGrid.getCellByColumn(1, 'Name');
            treeGrid.rowSelectable = true;
            treeGrid.rowEditable = true;

            // select the second row
            treeGrid.selectRows([targetCell.cellID.rowID], true);
            tick();
            fix.detectChanges();

            // check if any rows were selected
            expect(treeGrid.selectedRows().length).toBeGreaterThan(0);

            // enter edit mode
            targetCell.inEditMode = true;
            tick();
            fix.detectChanges();

            // the banner should appear
            const banner = document.getElementsByClassName(ROW_EDITING_BANNER_OVERLAY_CLASS);
            expect(banner).toBeTruthy();
            expect(banner[0]).toBeTruthy();
        }));

        it('should display the banner correctly on cell selection', fakeAsync(() => {
            treeGrid.rowEditable = true;

            const allRows = TreeGridFunctions.getAllRows(fix);
            const treeGridCells = TreeGridFunctions.getNormalCells(allRows[0]);

            // select a cell
            const targetCell = treeGridCells[0];
            targetCell.triggerEventHandler('focus', new Event('focus'));
            tick();
            fix.detectChanges();

            // there should be at least one selected cell
            expect(treeGrid.selectedCells.length).toBeGreaterThan(0);

            // enter edit mode
            targetCell.triggerEventHandler('dblclick', new Event('dblclick'));
            tick();
            fix.detectChanges();

            // the banner should appear
            const banner = document.getElementsByClassName(ROW_EDITING_BANNER_OVERLAY_CLASS);
            expect(banner).toBeTruthy();
            expect(banner[0]).toBeTruthy();
        }));
    });
});

function getVisibleSelectedRows(fix) {
    return TreeGridFunctions.getAllRows(fix).filter(
        (row) => row.nativeElement.classList.contains(TREE_ROW_SELECTION_CSS_CLASS));
}

function navigateToFirstPage(fix) {
    clickPagerButton(fix, 0);
}

function navigateToPrevPage(fix) {
    clickPagerButton(fix, 1);
}

function navigateToNextPage(fix) {
    clickPagerButton(fix, 2);
}

function navigateToLastPage(fix) {
    clickPagerButton(fix, 3);
}

function clickPagerButton(fix, button: number) {
    const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');
    const pagingButtons = gridElement.querySelectorAll('.igx-paginator > button');
    pagingButtons[button].dispatchEvent(new Event('click'));
}
