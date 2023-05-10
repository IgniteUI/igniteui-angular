import { TestBed, ComponentFixture, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { IgxTreeGridComponent } from './tree-grid.component';
import {
    IgxTreeGridSimpleComponent, IgxTreeGridPrimaryForeignKeyComponent,
    IgxTreeGridStringTreeColumnComponent, IgxTreeGridDateTreeColumnComponent, IgxTreeGridBooleanTreeColumnComponent,
    IgxTreeGridRowEditingComponent, IgxTreeGridMultiColHeadersComponent,
    IgxTreeGridRowEditingTransactionComponent,
    IgxTreeGridRowEditingHierarchicalDSTransactionComponent,
    IgxTreeGridRowPinningComponent
} from '../../test-utils/tree-grid-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxNumberFilteringOperand, IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { IgxHierarchicalTransactionService } from '../../services/transaction/igx-hierarchical-transaction';
import { HierarchicalTransaction, TransactionType } from '../../services/public_api';
import { DropPosition } from '../moving/moving.service';
import { IgxTreeGridRowComponent } from './tree-grid-row.component';
import { IgxGridTransaction } from '../common/types';
import { SortingDirection } from '../../data-operations/sorting-strategy';
import { CellType, IgxTreeGridRow } from '../public_api';

const CSS_CLASS_BANNER = 'igx-banner';
const CSS_CLASS_ROW_EDITED = 'igx-grid__tr--edited';
const GRID_RESIZE_CLASS = '.igx-grid-th__resize-handle';

describe('IgxTreeGrid - Integration #tGrid', () => {
    configureTestSuite();
    let fix: ComponentFixture<any>;
    let treeGrid: IgxTreeGridComponent;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxTreeGridSimpleComponent,
                IgxTreeGridPrimaryForeignKeyComponent,
                IgxTreeGridStringTreeColumnComponent,
                IgxTreeGridDateTreeColumnComponent,
                IgxTreeGridBooleanTreeColumnComponent,
                IgxTreeGridRowEditingComponent,
                IgxTreeGridRowPinningComponent,
                IgxTreeGridMultiColHeadersComponent,
                IgxTreeGridRowEditingTransactionComponent,
                IgxTreeGridRowEditingHierarchicalDSTransactionComponent
            ],
            providers: [
                { provide: IgxGridTransaction, useClass: IgxHierarchicalTransactionService }
            ]
        }).compileComponents();
    }));

    it('should have tree-column with a \'string\' dataType', () => {
        // Init test
        fix = TestBed.createComponent(IgxTreeGridStringTreeColumnComponent);
        fix.detectChanges();
        treeGrid = fix.componentInstance.treeGrid;

        TreeGridFunctions.verifyTreeColumn(fix, 'Name', 4);
    });

    it('should have tree-column with a \'date\' dataType', () => {
        // Init test
        fix = TestBed.createComponent(IgxTreeGridDateTreeColumnComponent);
        fix.detectChanges();
        treeGrid = fix.componentInstance.treeGrid;

        TreeGridFunctions.verifyTreeColumn(fix, 'HireDate', 4);
    });

    it('should have tree-column with a \'boolean\' dataType', () => {
        // Init test
        fix = TestBed.createComponent(IgxTreeGridBooleanTreeColumnComponent);
        fix.detectChanges();
        treeGrid = fix.componentInstance.treeGrid;

        TreeGridFunctions.verifyTreeColumn(fix, 'PTO', 5);
    });

    describe('Child Collection', () => {
        // configureTestSuite();
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('should transform a non-tree column into a tree column when pinning it', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);

            treeGrid.pinColumn('Age');
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'Age', 4);

            treeGrid.unpinColumn('Age');
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);
        });

        it('should transform a non-tree column into a tree column when hiding the original tree-column', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);

            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'Name', 3);

            column.hidden = false;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);
        });

        it('should transform the first visible column into tree column when pin and hide another column before that', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);

            treeGrid.pinColumn('Age');
            fix.detectChanges();

            const column = treeGrid.columnList.filter(c => c.field === 'Age')[0];
            column.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 3);
        });

        it('(API) should transform a non-tree column into a tree column when moving the original tree-column through', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);

            // Move tree-column
            const sourceColumn = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            const targetColumn = treeGrid.columnList.filter(c => c.field === 'HireDate')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'Name', 4);
        });

        it('(UI) should transform a non-tree column into a tree column when moving the original tree-column through', async () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);

            treeGrid.moving = true;

            const header = TreeGridFunctions.getHeaderCell(fix, 'ID').nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 50);
            UIInteractions.simulatePointerEvent('pointermove', header, 56, 56);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 490, 30);
            UIInteractions.simulatePointerEvent('pointerup', header, 490, 30);
            await wait();
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'Name', 4);
        });

        it('(API) should autosize tree-column', () => {
            const headerCell = TreeGridFunctions.getHeaderCell(fix, 'ID');
            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];

            expect(headerCell.nativeElement.getBoundingClientRect().width).toBe(225, 'incorrect column width');
            expect(parseInt(column.width, 10)).toBe(225);

            // API autosizing
            column.autosize();
            fix.detectChanges();

            expect(headerCell.nativeElement.getBoundingClientRect().width).toBe(148, 'incorrect headerCell width');
            expect(parseInt(column.width, 10)).toBe(148);
        });

        it('(UI) should autosize tree-column', () => {
            const headerCell = TreeGridFunctions.getHeaderCell(fix, 'ID').parent;
            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.resizable = true;
            treeGrid.cdr.detectChanges();

            expect(headerCell.nativeElement.getBoundingClientRect().width).toBe(225, 'incorrect column width');
            expect(parseInt(column.width, 10)).toBe(225);

            // UI autosizing
            const resizer = headerCell.query(By.css(GRID_RESIZE_CLASS)).nativeElement;
            UIInteractions.simulateMouseEvent('dblclick', resizer, 225, 5);
            fix.detectChanges();

            expect(headerCell.nativeElement.getBoundingClientRect().width).toBe(148, 'incorrect headerCell width');
            expect(parseInt(column.width, 10)).toBe(148);
        });
    });

    describe('Primary/Foreign key', () => {

        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('should transform a non-tree column into a tree column when pinning it', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);

            treeGrid.pinColumn('Name');
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'Name', 5);

            treeGrid.unpinColumn('Name');
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);
        });

        it('should transform a non-tree column into a tree column when hiding the original tree-column', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);

            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ParentID', 4);

            column.hidden = false;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);
        });

        it('should transform the first visible column into tree column when pin and hide another column before that', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);

            treeGrid.pinColumn('Age');
            fix.detectChanges();

            const column = treeGrid.columnList.filter(c => c.field === 'Age')[0];
            column.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);
        });

        it('(API) should transform a non-tree column into a tree column when moving the original tree-column through', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);

            // Move tree-column
            const sourceColumn = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            const targetColumn = treeGrid.columnList.filter(c => c.field === 'JobTitle')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ParentID', 5);
        });

        it('(UI) should transform a non-tree column into a tree column when moving the original tree-column through', async () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);

            treeGrid.moving = true;

            const header = TreeGridFunctions.getHeaderCell(fix, 'ID').nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 50);
            UIInteractions.simulatePointerEvent('pointermove', header, 56, 56);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 490, 30);
            UIInteractions.simulatePointerEvent('pointerup', header, 490, 30);
            await wait()
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ParentID', 5);
        });

        it('(API) should autosize tree-column', () => {
            const headerCell = TreeGridFunctions.getHeaderCell(fix, 'ID');
            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];

            expect(headerCell.nativeElement.getBoundingClientRect().width).toBe(180, 'incorrect column width');
            expect(parseInt(column.width, 10)).toBe(180);

            // API autosizing
            column.autosize();
            fix.detectChanges();

            expect(headerCell.nativeElement.getBoundingClientRect().width).toBe(135, 'incorrect headerCell width');
            expect(parseInt(column.width, 10)).toBe(135);
        });

        it('(UI) should autosize tree-column', () => {
            const headerCell = TreeGridFunctions.getHeaderCell(fix, 'ID').parent;
            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.resizable = true;
            treeGrid.cdr.detectChanges();

            expect(headerCell.nativeElement.getBoundingClientRect().width).toBe(180, 'incorrect column width');
            expect(parseInt(column.width, 10)).toBe(180);

            // UI autosizing
            const resizer = headerCell.query(By.css(GRID_RESIZE_CLASS)).nativeElement;
            UIInteractions.simulateMouseEvent('dblclick', resizer, 225, 5);
            fix.detectChanges();

            expect(headerCell.nativeElement.getBoundingClientRect().width).toBe(135, 'incorrect headerCell width');
            expect(parseInt(column.width, 10)).toBe(135);
        });
    });

    describe('Row editing', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('should show the banner below the edited parent node', () => {
            // Collapsed state
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;

            const verifyBannerPositioning = (columnIndex: number) => {
                const cellElem = grid.gridAPI.get_cell_by_index(columnIndex, 'Name');
                const cell = grid.getCellByColumn(columnIndex, 'Name');
                cell.editMode = true;
                fix.detectChanges();

                const editRow = (cellElem as any).intRow.nativeElement;
                const banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER)).nativeElement;

                const bannerTop = banner.getBoundingClientRect().top;
                const editRowBottom = editRow.getBoundingClientRect().bottom;

                // The banner appears below the row
                expect(bannerTop).toBeGreaterThanOrEqual(editRowBottom);
                // No much space between the row and the banner
                expect(bannerTop - editRowBottom).toBeLessThan(2);
            };

            grid.collapseAll();
            fix.detectChanges();
            verifyBannerPositioning(0);

            // Expanded state
            grid.expandAll();
            fix.detectChanges();
            verifyBannerPositioning(3);
        });

        it('should show the banner below the edited child node', () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.expandAll();
            fix.detectChanges();

            const cell = grid.gridAPI.get_cell_by_index(1, 'Name');
            cell.setEditMode(true);
            fix.detectChanges();

            // const editRow = cell.row.nativeElement;
            const editRow =  grid.gridAPI.get_row_by_index(1).nativeElement;
            const banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER)).nativeElement;

            const bannerTop = banner.getBoundingClientRect().top;
            const editRowBottom = editRow.getBoundingClientRect().bottom;

            // The banner appears below the row
            expect(bannerTop).toBeGreaterThanOrEqual(editRowBottom);
            // No much space between the row and the banner
            expect(bannerTop - editRowBottom).toBeLessThan(2);
        });

        it('should show the banner above the last parent node when in edit mode', () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.height = '200px';
            fix.detectChanges();

            grid.collapseAll();
            fix.detectChanges();

            const cell = grid.gridAPI.get_cell_by_index(2, 'Name');
            cell.setEditMode(true);
            fix.detectChanges();

            // const editRow = cell.row.nativeElement;
            const editRow =  grid.gridAPI.get_row_by_index(2).nativeElement;
            const banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER)).nativeElement;

            const bannerBottom = banner.getBoundingClientRect().bottom;
            const editRowTop = editRow.getBoundingClientRect().top;

            // The banner appears below the row
            expect(bannerBottom).toBeLessThanOrEqual(editRowTop);
            // No much space between the row and the banner
            expect(editRowTop - bannerBottom).toBeLessThan(2);
        });

        it('should show the banner above the last child node when in edit mode', () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.expandAll();
            fix.detectChanges();

            const cell = grid.gridAPI.get_cell_by_index(grid.rowList.length - 1, 'Name');
            cell.setEditMode(true);
            fix.detectChanges();

            // const editRow = cell.row.nativeElement;
            const editRow =  grid.gridAPI.get_row_by_index(grid.rowList.length - 1).nativeElement;
            const banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER)).nativeElement;

            const bannerBottom = banner.getBoundingClientRect().bottom;
            const editRowTop = editRow.getBoundingClientRect().top;

            // The banner appears below the row
            expect(bannerBottom).toBeLessThanOrEqual(editRowTop);
            // No much space between the row and the banner
            expect(editRowTop - bannerBottom).toBeLessThan(2);
        });

        it('should hide banner when edited parent row is being expanded/collapsed', () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.collapseAll();
            fix.detectChanges();

            // Edit parent row cell
            const cell = grid.getCellByColumn(0, 'Name');
            cell.editMode = true;
            fix.detectChanges();

            let banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            // Expand parent row
            grid.expandRow(cell.row.key);
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            // K.D. 01 Mar, 2022 #10634 Don't trigger endEdit/commit upon row expansion state change
            expect(cell.editMode).toBe(true);
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            // Edit parent row cell
            cell.editMode = true;
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            // Collapse parent row
            grid.collapseRow(cell.row.key);
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            // K.D. 01 Mar, 2022 #10634 Don't trigger endEdit/commit upon row expansion state change
            expect(cell.editMode).toBe(true);
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');
        });

        it('should hide banner when edited child row is being expanded/collapsed', () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.expandAll();
            fix.detectChanges();

            // Edit child row child cell
            const childCell = grid.getCellByColumn(4, 'Name');
            childCell.editMode = true;
            fix.detectChanges();

            let banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            // Collapse parent child row
            let parentRow = grid.getRowByIndex(3);
            grid.collapseRow(parentRow.key);
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(childCell.editMode).toBe(false);
            // K.D. 28 Feb, 2022 #10634 Don't trigger endEdit/commit upon row expansion state change
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            // Edit child row cell
            const parentCell = grid.getCellByColumn(3, 'Name');
            parentCell.editMode = true;
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            // Collapse parent row
            parentRow = grid.getRowByIndex(0);
            grid.collapseRow(parentRow.key);
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(parentCell.editMode).toBe(false);
            // K.D. 01 Mar, 2022 #10634 Don't trigger endEdit/commit upon row expansion state change
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');
        });

        it('TAB navigation should not leave the edited row and the banner.', async () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            const dateCell = grid.getCellByColumn(2, 'HireDate');
            const nameCell = grid.getCellByColumn(2, 'Name');
            const idCell = grid.getCellByColumn(2, 'ID');
            const ageCell = grid.getCellByColumn(2, 'Age');
            UIInteractions.simulateDoubleClickAndSelectEvent(grid.gridAPI.get_cell_by_index(2, 'HireDate'));
            await wait(30);
            fix.detectChanges();

            await TreeGridFunctions.moveGridCellWithTab(fix, grid.gridAPI.get_cell_by_index(2, 'HireDate'));
            expect(dateCell.editMode).toBeFalsy();
            expect(nameCell.editMode).toBeTruthy();

            await TreeGridFunctions.moveGridCellWithTab(fix, grid.gridAPI.get_cell_by_index(2, 'Name'));
            expect(nameCell.editMode).toBeFalsy();
            expect(idCell.editMode).toBeFalsy();
            expect(ageCell.editMode).toBeTruthy();

            const cancelBtn = fix.debugElement.queryAll(By.css('.igx-button--flat'))[0] as DebugElement;
            const doneBtn = fix.debugElement.queryAll(By.css('.igx-button--flat'))[1];
            spyOn(cancelBtn.nativeElement, 'focus').and.callThrough();
            spyOn<any>(grid.rowEditTabs.first, 'move').and.callThrough();
            spyOn<any>(grid.rowEditTabs.last, 'move').and.callThrough();

            await TreeGridFunctions.moveGridCellWithTab(fix, grid.gridAPI.get_cell_by_index(2, 'Age'));
            expect(cancelBtn.nativeElement.focus).toHaveBeenCalled();

            const mockObj = jasmine.createSpyObj('mockObj', ['stopPropagation', 'preventDefault']);
            cancelBtn.triggerEventHandler('keydown.Tab', mockObj);
            await wait(30);
            fix.detectChanges();
            expect((grid.rowEditTabs.first as any).move).not.toHaveBeenCalled();
            expect(mockObj.preventDefault).not.toHaveBeenCalled();
            expect(mockObj.stopPropagation).toHaveBeenCalled();

            doneBtn.triggerEventHandler('keydown.Tab', mockObj);
            await wait(30);
            fix.detectChanges();
            expect(dateCell.editMode).toBeTruthy();
            expect((grid.rowEditTabs.last as any).move).toHaveBeenCalled();
            expect(mockObj.preventDefault).toHaveBeenCalled();
            expect(mockObj.stopPropagation).toHaveBeenCalled();
        });

        it('should preserve updates after removing Filtering', () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.filter('Age', 40, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();

            const childCell = grid.getCellByColumn(2, 'Age');
            const childRowID = childCell.row.key;
            const parentCell = grid.getCellByColumn(0, 'Age');
            const parentRowID = parentCell.row.key;

            childCell.update(18);
            parentCell.update(33);
            fix.detectChanges();

            grid.clearFilter();
            fix.detectChanges();

            const childRow = grid.rowList.filter(r => r.key === childRowID)[0] as IgxTreeGridRowComponent;
            const editedChildCell = childRow.cells.filter(c => c.column.field === 'Age')[0];
            expect(editedChildCell.value).toEqual(18);

            const parentRow = grid.rowList.filter(r => r.key === parentRowID)[0] as IgxTreeGridRowComponent;
            const editedParentCell = parentRow.cells.filter(c => c.column.field === 'Age')[0];
            expect(editedParentCell.value).toEqual(33);

        });

        it('should preserve updates after removing Sorting', () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.sort({ fieldName: 'Age', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            const childCell = grid.gridAPI.get_cell_by_index(0, 'Age');
            const childRowID = childCell.row.key;
            childCell.update(14);
            const parentCell = grid.gridAPI.get_cell_by_index(1, 'Age');
            const parentRowID = parentCell.row.key;
            parentCell.update(80);
            fix.detectChanges();

            grid.clearSort();
            fix.detectChanges();

            const childRow = grid.rowList.filter(r => r.key === childRowID)[0] as IgxTreeGridRowComponent;
            const editedChildCell = childRow.cells.filter(c => c.column.field === 'Age')[0];
            expect(editedChildCell.value).toEqual(14);

            const parentRow = grid.rowList.filter(r => r.key === parentRowID)[0] as IgxTreeGridRowComponent;
            const editedParentCell = parentRow.cells.filter(c => c.column.field === 'Age')[0];
            expect(editedParentCell.value).toEqual(80);
        });

        it('should select the text when the first cell (tree grid cell) enters edit mode', fakeAsync(() => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.expandAll();
            fix.detectChanges();

            // move the 'string' column 'Name' to first position, so its cells are the tree grid cells
            const colName = grid.getColumnByName('Name');
            const colHireDate = grid.getColumnByName('HireDate');
            grid.moveColumn(colName, colHireDate, DropPosition.BeforeDropTarget);
            fix.detectChanges();
            tick(100);

            const cell = grid.gridAPI.get_cell_by_index(0, 'Name');
            cell.setEditMode(true);
            fix.detectChanges();
            tick(100);

            expect(cell.editMode).toBe(true);
            expect(document.activeElement.nodeName).toEqual('INPUT')
            expect((document.activeElement as HTMLInputElement).value).toBe('John Winchester');
            expect((document.activeElement as HTMLInputElement).selectionStart).toEqual(0);
            expect((document.activeElement as HTMLInputElement).selectionEnd).toEqual(15);
        }));
    });

    describe('Batch Editing', () => {
        it('Children are transformed into parent nodes after their parent is deleted', () => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;

            const row: HTMLElement = treeGrid.gridAPI.get_row_by_index(0).nativeElement;
            treeGrid.cascadeOnDelete = false;
            const trans = treeGrid.transactions;

            treeGrid.deleteRowById(1);
            fix.detectChanges();

            expect(row.classList).toContain('igx-grid__tr--deleted');
            expect(treeGrid.getRowByKey(1).index).toBe(0);
            expect(treeGrid.getRowByKey(2).index).toBe(1);
            expect(treeGrid.getRowByKey(3).index).toBe(2);
            trans.commit(treeGrid.data);
            fix.detectChanges();

            expect(row.classList).not.toContain('igx-grid__tr--deleted');
            expect(treeGrid.getRowByKey(2).index).toBe(0);
            expect(treeGrid.getRowByKey(3).index).toBe(1);
            expect(trans.canUndo).toBe(false);

            expect(treeGrid.getRowByIndex(-1)).toBeUndefined();
            expect(treeGrid.getRowByKey(-1)).toBeUndefined();
        });

        it('Children are deleted along with their parent', () => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            treeGrid.cascadeOnDelete = true;
            const trans = treeGrid.transactions;

            treeGrid.deleteRowById(1);
            fix.detectChanges();

            for (let i = 0; i < 5; i++) {
                const curRow: HTMLElement = treeGrid.gridAPI.get_row_by_index(i).nativeElement;
                expect(curRow.classList).toContain('igx-grid__tr--deleted');
            }
            expect(treeGrid.getRowByKey(1).index).toBe(0);
            expect(treeGrid.getRowByKey(2).index).toBe(1);
            expect(treeGrid.getRowByKey(3).index).toBe(2);
            expect(treeGrid.getRowByKey(7).index).toBe(3);
            expect(treeGrid.getRowByKey(4).index).toBe(4);

            trans.commit(treeGrid.data);
            fix.detectChanges();

            expect(treeGrid.getRowByKey(1)).toBeUndefined();
            expect(treeGrid.getRowByKey(2)).toBeUndefined();
            expect(treeGrid.getRowByKey(3)).toBeUndefined();
            expect(treeGrid.getRowByKey(7)).toBeUndefined();
            expect(treeGrid.getRowByKey(4)).toBeUndefined();

            expect(treeGrid.getRowByKey(6).index).toBe(0);
            expect(treeGrid.getRowByKey(10).index).toBe(1);
            expect(trans.canUndo).toBe(false);
        });

        it('Editing a cell is possible with Hierarchical DS', () => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingHierarchicalDSTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            const trans = treeGrid.transactions;

            const targetCell = treeGrid.getCellByColumn(3, 'Age');
            targetCell.editMode = true;
            targetCell.update('333');
            fix.detectChanges();

            //  ged DONE button and click it
            const rowEditingBannerElement = fix.debugElement.query(By.css('.igx-banner__row')).nativeElement;
            const doneButtonElement = rowEditingBannerElement.lastElementChild;
            doneButtonElement.dispatchEvent(new Event('click'));
            fix.detectChanges();

            // Verify the value is updated and the correct style is applied before committing
            expect(targetCell.editMode).toBeFalsy();
            expect(targetCell.value).toBe(333);
            expect(treeGrid.gridAPI.get_cell_by_index(3, 'Age').nativeElement.classList).toContain('igx-grid__td--edited');

            // Commit
            trans.commit(treeGrid.data, treeGrid.primaryKey, treeGrid.childDataKey);

            // Verify the correct value is set
            expect(targetCell.value).toBe(333);

            // Add new root lv row
            treeGrid.addRow({ ID: 11, ParentID: -1, Name: 'Dan Kolov', JobTitle: 'wrestler', Age: 32, OnPTO: true });
            fix.detectChanges();

            // Edit a cell value and check it is correctly updated
            const newTargetCell = treeGrid.getCellByColumn(10, 'Age');
            newTargetCell.editMode = true;
            newTargetCell.update('666');
            fix.detectChanges();

            expect(newTargetCell.value).toBe(666);
            expect(treeGrid.gridAPI.get_cell_by_index(10, 'Age').nativeElement.classList).toContain('igx-grid__td--edited');
        });

        it('Undo/Redo keeps the correct number of steps with Hierarchical DS', () => {
            // TODO:
            // 1. Update a cell in three different rows
            // 2. Execute "Undo" three times
            // 3. Verify the initial state is shown
            // 4. Execute "Redo" three times
            // 5. Verify all the updates are shown with correct styles
            // 6. Press "Commit"
            // 7. Verify the changes are comitted
            fix = TestBed.createComponent(IgxTreeGridRowEditingHierarchicalDSTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            const trans = treeGrid.transactions;
            const treeGridData = treeGrid.data;
            // Get initial data
            const rowData = {
                147: Object.assign({}, treeGrid.getRowByKey(147).data),
                475: Object.assign({}, treeGrid.getRowByKey(475).data),
                19: Object.assign({}, treeGrid.getRowByKey(19).data)
            };
            const initialData = treeGrid.data.map(e => Object.assign({}, e));
            let targetCell: CellType;
            // Get 147 row
            targetCell = treeGrid.getCellByKey(147, 'Name');
            expect(targetCell.value).toEqual('John Winchester');
            // Edit 'Name'
            targetCell.update('Testy Testington');
            fix.detectChanges();
            // Get 475 row (1st child of 147)
            targetCell = treeGrid.getCellByKey(475, 'Age');
            expect(targetCell.value).toEqual(30);
            // Edit Age
            targetCell.update(42);
            fix.detectChanges();
            // Get 19 row
            targetCell = treeGrid.getCellByKey(19, 'Name');
            // Edit Name
            expect(targetCell.value).toEqual('Yang Wang');
            targetCell.update('Old Richard');
            fix.detectChanges();
            expect(rowData[147].Name).not.toEqual(treeGrid.getRowByKey(147).data.Name);
            expect(rowData[475].Age).not.toEqual(treeGrid.getRowByKey(475).data.Age);
            expect(rowData[19].Name).not.toEqual(treeGrid.getRowByKey(19).data.Name);
            expect(treeGridData[0].Employees[475]).toEqual(initialData[0].Employees[475]);
            expect(trans.canUndo).toBeTruthy();
            expect(trans.canRedo).toBeFalsy();
            trans.undo();
            fix.detectChanges();
            trans.undo();
            fix.detectChanges();
            trans.undo();
            fix.detectChanges();
            expect(rowData[147].Name).toEqual(treeGrid.getRowByKey(147).data.Name);
            expect(rowData[475].Age).toEqual(treeGrid.getRowByKey(475).data.Age);
            expect(rowData[19].Name).toEqual(treeGrid.getRowByKey(19).data.Name);
            expect(trans.canUndo).toBeFalsy();
            expect(trans.canRedo).toBeTruthy();
            trans.redo();
            fix.detectChanges();
            trans.redo();
            fix.detectChanges();
            trans.redo();
            fix.detectChanges();
            expect(rowData[147].Name).not.toEqual(treeGrid.getRowByKey(147).data.Name);
            expect(rowData[475].Age).not.toEqual(treeGrid.getRowByKey(475).data.Age);
            expect(rowData[19].Name).not.toEqual(treeGrid.getRowByKey(19).data.Name);
            expect(treeGridData[0].Employees[475]).toEqual(initialData[0].Employees[475]);
            trans.commit(treeGridData, treeGrid.primaryKey, treeGrid.childDataKey);
            fix.detectChanges();
            expect(treeGridData[0].Name).toEqual('Testy Testington');
            expect(treeGridData[0].Employees[0].Age).toEqual(42);
            expect(treeGridData[1].Name).toEqual('Old Richard');
        });

        it('Add parent node to a Flat DS tree grid', () => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            const trans = treeGrid.transactions;

            treeGrid.addRow({ ID: 11, ParentID: -1, Name: 'Dan Kolov', JobTitle: 'wrestler', Age: 32 });
            fix.detectChanges();

            expect(trans.canUndo).toBe(true);
            expect(treeGrid.gridAPI.get_row_by_key(11).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);

            trans.commit(treeGrid.data);
            fix.detectChanges();

            expect(treeGrid.gridAPI.get_row_by_key(11).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(trans.canUndo).toBe(false);

            treeGrid.addRow({ ID: 12, ParentID: -1, Name: 'Kubrat Pulev', JobTitle: 'Boxer', Age: 33 });
            fix.detectChanges();

            expect(trans.canUndo).toBe(true);
            expect(treeGrid.gridAPI.get_row_by_key(12).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);
        });

        it('Add parent node to a Hierarchical DS tree grid', () => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingHierarchicalDSTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            const initialDataLength = treeGrid.data.length;
            const trans = treeGrid.transactions;
            spyOn(trans, 'add').and.callThrough();

            const addedRowId_1 = treeGrid.rowList.length;
            const newRow = {
                ID: addedRowId_1,
                Name: 'John Dow',
                HireDate: new Date(2018, 10, 20),
                Age: 22,
                OnPTO: false,
                Employees: []
            };

            treeGrid.addRow(newRow);
            fix.detectChanges();

            expect(trans.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            const transParams: HierarchicalTransaction = {
                id: addedRowId_1,
                type: TransactionType.ADD,
                newValue: newRow
            };
            expect(trans.add).toHaveBeenCalledWith(transParams);

            expect(treeGrid.records.get(addedRowId_1).level).toBe(0);
            expect(treeGrid.gridAPI.get_row_by_key(addedRowId_1).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);

            trans.commit(treeGrid.data);
            fix.detectChanges();

            expect(treeGrid.data.length).toEqual(initialDataLength + 1);
            expect(treeGrid.data[initialDataLength]).toEqual(newRow);
            expect(treeGrid.records.get(addedRowId_1).level).toBe(0);
            expect(treeGrid.gridAPI.get_row_by_key(addedRowId_1).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(trans.getTransactionLog().length).toEqual(0);
            expect(trans.canUndo).toBeFalsy();

            const addedRowId_2 = treeGrid.rowList.length;
            const newParentRow = {
                ID: addedRowId_2,
                Name: 'Brad Pitt',
                HireDate: new Date(2016, 8, 14),
                Age: 54,
                OnPTO: false
            };

            treeGrid.addRow(newParentRow);
            fix.detectChanges();

            expect(treeGrid.records.get(addedRowId_2).level).toBe(0);
            expect(treeGrid.gridAPI.get_row_by_key(addedRowId_2).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(addedRowId_1).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
        });

        it('Add a child node to a previously added parent node - Flat DS', () => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            const rootRow = { ID: 11, ParentID: -1, Name: 'Kubrat Pulev', JobTitle: 'wrestler', Age: 32 };
            const childRow = { ID: 12, ParentID: 11, Name: 'Tervel Pulev', JobTitle: 'wrestler', Age: 30 };
            const grandChildRow = { ID: 13, ParentID: 12, Name: 'Asparuh Pulev', JobTitle: 'wrestler', Age: 14 };
            const trans = treeGrid.transactions;

            treeGrid.addRow(rootRow);
            fix.detectChanges();

            treeGrid.addRow(childRow, 11);
            fix.detectChanges();

            expect(treeGrid.gridAPI.get_row_by_key(11).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(12).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);

            trans.commit(treeGrid.data);
            fix.detectChanges();

            expect(treeGrid.gridAPI.get_row_by_key(11).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(12).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);

            treeGrid.addRow(grandChildRow, 12);
            fix.detectChanges();

            expect(treeGrid.gridAPI.get_row_by_key(11).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(12).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(13).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);
        });

        it('Add a child node to a previously added parent node - Hierarchical DS', () => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            const rowData = {
                parent: { ID: 13, Name: 'Dr. Evil', JobTitle: 'Doctor of Evilness', Age: 52 },
                child: { ID: 133, Name: 'Scott', JobTitle: `Annoying Teen, Dr. Evil's son`, Age: 17 },
                grandChild: { ID: 1337, Name: 'Mr. Bigglesworth', JobTitle: 'Evil Cat', Age: 13 }
            };
            // 1. Add a row at level 0 to the grid
            treeGrid.addRow(rowData.parent);
            fix.detectChanges();
            // 2. Add a child row to that parent
            treeGrid.addRow(rowData.child, rowData.parent.ID);
            fix.detectChanges();
            // 3. Verify the new rows are pending with the correct styles
            expect(treeGrid.gridAPI.get_row_by_key(13).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(133).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.data.findIndex(e => e.ID === rowData.parent.ID)).toEqual(-1);
            expect(treeGrid.data.findIndex(e => e.ID === rowData.child.ID)).toEqual(-1);
            expect(treeGrid.transactions.getAggregatedChanges(true).length).toEqual(2);
            // 4. Commit
            treeGrid.transactions.commit(treeGrid.data);
            fix.detectChanges();
            // 5. verify the rows are committed, the styles are OK
            expect(treeGrid.data.findIndex(e => e.ID === rowData.parent.ID)).not.toEqual(-1);
            expect(treeGrid.data.findIndex(e => e.ID === rowData.child.ID)).not.toEqual(-1);
            expect(treeGrid.gridAPI.get_row_by_key(13).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(133).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.transactions.getAggregatedChanges(true).length).toEqual(0);
            // 6. Add another child row at level 2 (grand-child of the first row)
            treeGrid.addRow(rowData.grandChild, rowData.child.ID);
            fix.detectChanges();
            // 7. verify the pending styles is applied only to the newly added row
            // and not to the previously added rows
            expect(treeGrid.gridAPI.get_row_by_key(13).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(133).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(1337).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.transactions.getAggregatedChanges(true).length).toEqual(1);
        });

        it('Delete a pending parent node - Flat DS', () => {
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            treeGrid.batchEditing = true;
            fix.detectChanges();
            const trans = treeGrid.transactions;
            spyOn(trans, 'add').and.callThrough();
            treeGrid.foreignKey = 'ParentID';

            const addedRowId = treeGrid.data.length;
            const newRow = {
                ID: addedRowId,
                ParentID: 1,
                Name: 'John Dow',
                JobTitle: 'Copywriter',
                Age: 22
            };
            treeGrid.addRow(newRow);
            fix.detectChanges();

            const addedRow = treeGrid.rowList.filter(r => r.key === addedRowId)[0] as IgxTreeGridRowComponent;
            treeGrid.selectRows([treeGrid.getRowByIndex(addedRow.index).key], true);
            fix.detectChanges();
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            const transParams: HierarchicalTransaction = {
                id: addedRowId,
                type: TransactionType.ADD,
                newValue: newRow
            };
            expect(trans.add).toHaveBeenCalledWith(transParams);

            treeGrid.deleteRowById(treeGrid.selectedRows[0]);
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.key === addedRowId).length).toEqual(0);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(2);
            expect(treeGrid.transactions.getTransactionLog()[1].id).toEqual(addedRowId);
            expect(treeGrid.transactions.getTransactionLog()[1].type).toEqual('delete');
            expect(treeGrid.transactions.getTransactionLog()[1].newValue).toBeNull();

            treeGrid.transactions.undo();
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.key === addedRowId).length).toEqual(1);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(2);
            expect(trans.add).toHaveBeenCalledWith(transParams);
        });

        it('Delete a pending parent node - Hierarchical DS', () => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingHierarchicalDSTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            const trans = treeGrid.transactions;
            spyOn(trans, 'add').and.callThrough();

            const parentRow = treeGrid.getRowByIndex(0);
            const addedRowId = treeGrid.rowList.length;
            const newRow = {
                ID: addedRowId,
                Name: 'John Dow',
                HireDate: new Date(2018, 10, 20),
                Age: 22,
                OnPTO: false,
                Employees: []
            };

            treeGrid.addRow(newRow, parentRow.key);
            fix.detectChanges();

            const addedRow = treeGrid.rowList.filter(r => r.key === addedRowId)[0] as IgxTreeGridRowComponent;
            treeGrid.selectRows([treeGrid.getRowByIndex(addedRow.index).key], true);
            fix.detectChanges();
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            const transParams: HierarchicalTransaction = {
                id: addedRowId,
                path: [parentRow.key],
                newValue: newRow,
                type: TransactionType.ADD
            };
            expect(trans.add).toHaveBeenCalledWith(transParams, null);

            treeGrid.deleteRowById(treeGrid.selectedRows[0]);
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.key === addedRowId).length).toEqual(0);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(2);
            expect(treeGrid.transactions.getTransactionLog()[1].id).toEqual(addedRowId);
            expect(treeGrid.transactions.getTransactionLog()[1].type).toEqual('delete');
            expect(treeGrid.transactions.getTransactionLog()[1].newValue).toBeNull();

            treeGrid.transactions.undo();
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.key === addedRowId).length).toEqual(1);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(2);
            expect(trans.add).toHaveBeenCalledWith(transParams, null);
        });

        it('Delete a pending child node - Flat DS', () => {
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            treeGrid.batchEditing = true;
            fix.detectChanges();
            const trans = treeGrid.transactions;
            spyOn(trans, 'add').and.callThrough();
            treeGrid.foreignKey = 'ParentID';

            const addedRowId = treeGrid.data.length;
            const newRow = {
                ID: addedRowId,
                ParentID: 1,
                Name: 'John Dow',
                JobTitle: 'Copywriter',
                Age: 22
            };
            treeGrid.addRow(newRow, 1);
            fix.detectChanges();

            const addedRow = treeGrid.rowList.filter(r => r.key === addedRowId)[0] as IgxTreeGridRowComponent;
            treeGrid.selectRows([treeGrid.getRowByIndex(addedRow.index).key], true);
            fix.detectChanges();
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            const transParams: HierarchicalTransaction = { id: addedRowId, type: TransactionType.ADD, newValue: newRow };
            expect(trans.add).toHaveBeenCalledWith(transParams);

            treeGrid.deleteRowById(treeGrid.selectedRows[0]);
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.key === addedRowId).length).toEqual(0);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(2);
            expect(treeGrid.transactions.getTransactionLog()[1].id).toEqual(addedRowId);
            expect(treeGrid.transactions.getTransactionLog()[1].type).toEqual('delete');
            expect(treeGrid.transactions.getTransactionLog()[1].newValue).toBeNull();

            treeGrid.transactions.undo();
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.key === addedRowId).length).toEqual(1);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(2);
            expect(trans.add).toHaveBeenCalledWith(transParams);
        });

        it('Delete a pending child node - Hierarchical DS', () => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingHierarchicalDSTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            const trans = treeGrid.transactions;
            spyOn(trans, 'add').and.callThrough();

            const parentRow = treeGrid.getRowByIndex(1);
            const addedRowId = treeGrid.rowList.length;
            const newRow = {
                ID: addedRowId,
                Name: 'John Dow',
                HireDate: new Date(2018, 10, 20),
                Age: 22,
                OnPTO: false,
                Employees: []
            };

            treeGrid.addRow(newRow, parentRow.key);
            fix.detectChanges();

            const addedRow = treeGrid.rowList.filter(r => r.key === addedRowId)[0] as IgxTreeGridRowComponent;
            treeGrid.selectRows([treeGrid.getRowByIndex(addedRow.index).key], true);
            fix.detectChanges();
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            const transPasrams: HierarchicalTransaction = {
                id: addedRowId,
                path: [treeGrid.getRowByIndex(0).key, parentRow.key],
                newValue: newRow,
                type: TransactionType.ADD
            };
            expect(trans.add).toHaveBeenCalledWith(transPasrams, null);

            treeGrid.deleteRowById(treeGrid.selectedRows[0]);
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.key === addedRowId).length).toEqual(0);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(2);
            expect(treeGrid.transactions.getTransactionLog()[1].id).toEqual(addedRowId);
            expect(treeGrid.transactions.getTransactionLog()[1].type).toEqual('delete');
            expect(treeGrid.transactions.getTransactionLog()[1].newValue).toBeNull();

            treeGrid.transactions.undo();
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.key === addedRowId).length).toEqual(1);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(2);
            expect(trans.add).toHaveBeenCalledWith(transPasrams, null);
        });

        it('Should not add child row to deleted parent row - Hierarchical DS', () => {
            const fixture = TestBed.createComponent(IgxTreeGridRowEditingHierarchicalDSTransactionComponent);
            const grid = fixture.componentInstance.treeGrid;
            fixture.detectChanges();

            grid.deleteRowById(147);
            expect(grid.transactions.getTransactionLog().length).toBe(1);

            expect(() => grid.addRow(grid.data, 147)).toThrow(Error(`Cannot add child row to deleted parent row`));
            expect(grid.transactions.getTransactionLog().length).toBe(1);
        });

        it('Should not add child row to deleted parent row - Flat DS', () => {
            const fixture = TestBed.createComponent(IgxTreeGridRowEditingTransactionComponent);
            const grid = (fixture as ComponentFixture<IgxTreeGridRowEditingTransactionComponent>).componentInstance.treeGrid;
            grid.cascadeOnDelete = false;
            fixture.detectChanges();

            grid.deleteRowById(1);
            expect(grid.transactions.getTransactionLog().length).toBe(1);

            expect(() => grid.addRow(grid.data, 1)).toThrow(Error(`Cannot add child row to deleted parent row`));
            expect(grid.transactions.getTransactionLog().length).toBe(1);
        });

        it('should return correctly the rowData', () => {
            const fixture = TestBed.createComponent(IgxTreeGridRowEditingTransactionComponent);
            const grid = (fixture as ComponentFixture<IgxTreeGridRowEditingTransactionComponent>).componentInstance.treeGrid;
            grid.cascadeOnDelete = false;
            fixture.detectChanges();

            const row = {ID: 2, ParentID: 1, Name: 'Gilberto Todd', JobTitle: 'Director', Age: 41};
            expect(grid.getRowData(2)).toEqual(row);

            grid.sort({ fieldName: 'Age', dir: SortingDirection.Desc, ignoreCase: true });
            fixture.detectChanges();

            expect(grid.getRowData(2)).toEqual(row);
            expect(grid.getRowData(11)).toEqual({});

            grid.filter('Age', 43, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fixture.detectChanges();

            expect(grid.getRowData(2)).toEqual(row);
            expect(grid.getRowData(11)).toEqual({});

            const newRow = {ID: 11, ParentID: 1, Name: 'Joe Peterson', JobTitle: 'Manager', Age: 37};
            grid.addRow(newRow);
            fixture.detectChanges();

            grid.clearFilter();
            fixture.detectChanges();

            expect(grid.transactions.getTransactionLog().length).toEqual(1);
            expect(grid.getRowData(11)).toEqual(newRow);
        });

        it('Should have transactions enabled when batchEditing === false and service is provider', () => {
            const fixture = TestBed.createComponent(IgxTreeGridRowEditingHierarchicalDSTransactionComponent);
            const grid = fixture.componentInstance.treeGrid;
            fixture.detectChanges();

            grid.batchEditing = false;
            fixture.detectChanges();

            expect(grid.batchEditing).toBeFalsy();
            expect(grid.transactions.enabled).toBeTruthy();

            grid.deleteRowById(147);
            expect(grid.transactions.getTransactionLog().length).toBe(1);
        });
    });

    describe('Multi-column header', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridMultiColHeadersComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('Should transform a hidden column to a tree column when it becomes visible and it is part of a column group', () => {
            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 4);

            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'Name', 3);

            column.hidden = false;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 4);
        });

        it('Should transform a hidden column to a tree column when all columns from left-most group are hidden', () => {
            // hide Name column so that the tested columns (ID and HireDate) are not part of the same group
            const columnName = treeGrid.columnList.filter(c => c.field === 'Name')[0];
            columnName.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 3);

            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'HireDate', 2);

            column.hidden = false;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 3);
        });

        it('(API) Should transform a non-tree column into a tree column when moving it first and both are part of the same group', () => {
            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 4);

            // Move tree-column
            const sourceColumn = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            const targetColumn = treeGrid.columnList.filter(c => c.field === 'Name')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'Name', 4);
        });

        it('(UI) Should transform a non-tree column into a tree column when moving it first within a group', async () => {
            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 4);

            treeGrid.moving = true;

            const header = TreeGridFunctions.getHeaderCellMultiColHeaders(fix, 'ID').nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 100, 90);
            UIInteractions.simulatePointerEvent('pointermove', header, 106, 96);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 420, 90);
            UIInteractions.simulatePointerEvent('pointerup', header, 420, 90);
            await wait()
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'Name', 4);
        });

        it('(API) Should transform a non-tree column of a column group to a tree column when its group is moved first', () => {
            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 4);

            // Move group-column
            const sourceColumn = treeGrid.columnList.filter(c => c.header === 'General Information')[0];
            const targetColumn = treeGrid.columnList.filter(c => c.header === 'Additional Information')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'HireDate', 4);
        });

        it('(UI) Should transform a non-tree column of a column group to a tree column when its group is moved first', async () => {
            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 4);

            treeGrid.moving = true;
            fix.detectChanges();

            // const header = fix.debugElement.queryAll(By.css('.igx-grid-thead__item'))[0].nativeElement;
            const header = treeGrid.headerGroups[0].nativeElement;

            UIInteractions.simulatePointerEvent('pointerdown', header, 100, 40);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 106, 46);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 700, 40);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 700, 40);
            await wait();
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'HireDate', 4);
        });

        it('Add rows to empty grid - Hierarchical DS', () => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingHierarchicalDSTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            // set empty data
            treeGrid.data = [];
            fix.detectChanges();

            const trans = treeGrid.transactions;
            const rootRow = {
                ID: 11,
                Name: 'Kubrat Pulev',
                HireDate: new Date(2018, 10, 20),
                Age: 32,
                OnPTO: false,
                Employees: []
            };
            const childRow = {
                ID: 12,
                Name: 'Tervel Pulev',
                HireDate: new Date(2018, 10, 10),
                Age: 30,
                OnPTO: true,
                Employees: []
            };
            const grandChildRow = {
                ID: 13,
                Name: 'Asparuh Pulev',
                HireDate: new Date(2017, 10, 10),
                Age: 14,
                OnPTO: true,
                Employees: []
            };
            treeGrid.addRow(rootRow);
            fix.detectChanges();
            treeGrid.addRow(childRow, 11);
            fix.detectChanges();
            expect(treeGrid.gridAPI.get_row_by_key(11).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(12).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);
            trans.commit(treeGrid.data, treeGrid.primaryKey, treeGrid.childDataKey);
            fix.detectChanges();
            expect(treeGrid.gridAPI.get_row_by_key(11).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(12).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            treeGrid.addRow(grandChildRow, 12);
            fix.detectChanges();
            expect(treeGrid.gridAPI.get_row_by_key(11).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(12).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(13).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.records.get(11).level).toBe(0);
            expect(treeGrid.records.get(12).level).toBe(1);
            expect(treeGrid.records.get(13).level).toBe(2);
        });

        it('Add rows to empty grid - Flat DS', () => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            // set empty data
            treeGrid.data = [];
            fix.detectChanges();

            const rootRow = { ID: 11, ParentID: -1, Name: 'Kubrat Pulev', JobTitle: 'wrestler', Age: 32 };
            const childRow = { ID: 12, ParentID: 11, Name: 'Tervel Pulev', JobTitle: 'wrestler', Age: 30 };
            const grandChildRow = { ID: 13, ParentID: 12, Name: 'Asparuh Pulev', JobTitle: 'wrestler', Age: 14 };
            const trans = treeGrid.transactions;

            treeGrid.addRow(rootRow);
            fix.detectChanges();

            treeGrid.addRow(childRow, 11);
            fix.detectChanges();

            expect(treeGrid.gridAPI.get_row_by_key(11).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(12).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);

            trans.commit(treeGrid.data);
            fix.detectChanges();

            expect(treeGrid.gridAPI.get_row_by_key(11).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(12).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);

            treeGrid.addRow(grandChildRow, 12);
            fix.detectChanges();

            expect(treeGrid.gridAPI.get_row_by_key(11).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(12).nativeElement.classList).not.toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.gridAPI.get_row_by_key(13).nativeElement.classList).toContain(CSS_CLASS_ROW_EDITED);
            expect(treeGrid.records.get(11).level).toBe(0);
            expect(treeGrid.records.get(12).level).toBe(1);
            expect(treeGrid.records.get(13).level).toBe(2);
        });
    });

    describe('Column Pinning', () => {
        it('should have right pinning applied correctly', () => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingHierarchicalDSTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            treeGrid.columnList.find(x => x.field === 'Age').pinned = true;
            treeGrid.pinning.columns = 1;

            fix.detectChanges();
            const rightMostGridPart = treeGrid.nativeElement.getBoundingClientRect().right;
            const leftMostGridPart = treeGrid.nativeElement.getBoundingClientRect().left;
            const leftMostRightPinnedCellsPart = treeGrid.gridAPI.get_cell_by_index(0, 'Age').nativeElement.getBoundingClientRect().left;
            const pinnedCellWidth = treeGrid.gridAPI.get_cell_by_index(0, 'Age').width;
            // Expects that right pinning has been in action
            expect(leftMostGridPart !== leftMostRightPinnedCellsPart).toBeTruthy();
            // Expects that pinned column is in the visible grid's area
            expect(leftMostRightPinnedCellsPart < rightMostGridPart).toBeTruthy();
            // Expects that the whole pinned column is visible
            expect(leftMostRightPinnedCellsPart + Number.parseInt(pinnedCellWidth, 10) <= rightMostGridPart).toBeTruthy();
        });
    });

    describe('Row Pinning', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridRowPinningComponent);
            fix.detectChanges();

            treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
        });

        it('should pin/unpin a row', () => {
            treeGrid.pinRow(711);

            expect(treeGrid.pinnedRecordsCount).toBe(1);
            expect(treeGrid.getRowByKey(711).pinned).toBe(true);

            treeGrid.getRowByKey(711).pinned = false;
            fix.detectChanges();

            expect(treeGrid.pinnedRecordsCount).toBe(0);
            expect(treeGrid.getRowByKey(711).pinned).toBe(false);

            treeGrid.getRowByKey(711).pin();
            expect(treeGrid.pinnedRecordsCount).toBe(1);

            treeGrid.getRowByKey(711).unpin();
            expect(treeGrid.pinnedRecordsCount).toBe(0);


            treeGrid.getRowByKey(711).pinned = true;
            fix.detectChanges();
            expect(treeGrid.pinnedRecordsCount).toBe(1);

            treeGrid.getRowByKey(711).pinned = false;
            fix.detectChanges();
            expect(treeGrid.pinnedRecordsCount).toBe(0);
        });

        it('should pin/unpin a row at the bottom', () => {
            /* Pin rows to bottom */
            treeGrid.pinning.rows = 1;

            const visibleRecordsLength = treeGrid.records.size;
            treeGrid.pinRow(711);

            expect(treeGrid.getRowByIndex(visibleRecordsLength).key).toBe(711);
        });

        it('should calculate row indices correctly after row pinning', () => {
            const firstRow = treeGrid.getRowByIndex(0);
            const secondRow = treeGrid.getRowByIndex(1);

            treeGrid.pinRow(711);

            expect(treeGrid.getRowByIndex(0).key).toBe(711);
            expect(treeGrid.getRowByIndex(1).key).toBe(firstRow.key);
            expect(treeGrid.getRowByIndex(2).key).toBe(secondRow.key);

            treeGrid.unpinRow(711);

            expect(treeGrid.getRowByIndex(0).key).toBe(firstRow.key);
            expect(treeGrid.getRowByIndex(1).key).toBe(secondRow.key);
        });

        it('should disable pinned row instance in the body', () => {
            const rowToPin = treeGrid.getRowByIndex(0);
            const primaryKey = treeGrid.primaryKey;

            treeGrid.pinRow(rowToPin.data[primaryKey]);

            expect(treeGrid.gridAPI.get_row_by_index(0).disabled).toBe(false);
            expect(treeGrid.gridAPI.get_row_by_index(1).disabled).toBe(true);

            treeGrid.unpinRow(rowToPin.data[primaryKey]);

            expect(treeGrid.gridAPI.get_row_by_index(0).disabled).toBe(false);
            expect(treeGrid.gridAPI.get_row_by_index(1).disabled).toBe(false);

        });

        it('should add pinned chip in the pinned row instance in the body', () => {
            const rowToPin = treeGrid.getRowByIndex(0);
            const primaryKey = treeGrid.primaryKey;

            treeGrid.pinRow(rowToPin.data[primaryKey]);

            const firstColumnField = treeGrid.columnList.get(0).field;
            const pinnedChipPosition = treeGrid.gridAPI.get_cell_by_index(1, firstColumnField);
            const pinnedRowCell = treeGrid.gridAPI.get_cell_by_index(0, firstColumnField);
            const wrongChipPosition = treeGrid.gridAPI.get_cell_by_index(2, firstColumnField);

            expect(pinnedChipPosition.nativeElement.getElementsByClassName('igx-grid__td--pinned-chip').length).toBe(1);
            expect(pinnedRowCell.nativeElement.getElementsByClassName('igx-grid__td--pinned-chip').length).toBe(0);
            expect(wrongChipPosition.nativeElement.getElementsByClassName('igx-grid__td--pinned-chip').length).toBe(0);
        });

        it('pinned chip should always be in the first column', () => {
            const rowToPin = treeGrid.getRowByIndex(0);
            const primaryKey = treeGrid.primaryKey;

            treeGrid.pinRow(rowToPin.data[primaryKey]);

            const thirdColumnField = treeGrid.columnList.get(2).field;

            treeGrid.moveColumn(treeGrid.columnList.get(2), treeGrid.columnList.get(0), DropPosition.BeforeDropTarget);
            fix.detectChanges();

            const pinnedChipExpectedPosition = treeGrid.gridAPI.get_cell_by_index(1, thirdColumnField);
            expect(pinnedChipExpectedPosition.nativeElement.getElementsByClassName('igx-grid__td--pinned-chip').length).toBe(1);
        });

        it('should expand/collapse a pinned row with children', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            const rowToPin = treeGrid.getRowByIndex(0);

            rowToPin.pin();

            // collapse pinned row
            treeGrid.toggleRow(rowToPin.key);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(5);

            // expand the pinned row
            treeGrid.toggleRow(rowToPin.key);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(11);
        });

        it('should search in both pinned and unpinned rows', () => {
            let searchResultsCount = treeGrid.findNext('John');
            expect(searchResultsCount).toBe(1);

            const rowToPin = treeGrid.getRowByIndex(0);
            rowToPin.pin();

            searchResultsCount = treeGrid.findNext('John');
            expect(searchResultsCount).toBe(2);
        });

        it('should apply filtering to both pinned and unpinned rows', () => {
            treeGrid.pinRow(147);
            treeGrid.pinRow(711);

            treeGrid.filter('ID', 147, IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            const gridFilterData = treeGrid.filteredData;
            expect(gridFilterData.length).toBe(2);
            expect(gridFilterData[0].ID).toBe(147);
            expect(gridFilterData[1].ID).toBe(147);
        });

        it('should apply sorting to both pinned and unpinned rows', () => {
            treeGrid.pinRow(147);
            treeGrid.pinRow(711);

            expect(treeGrid.getRowByIndex(0).key).toBe(147);
            expect(treeGrid.getRowByIndex(1).key).toBe(711);
            expect(treeGrid.getRowByIndex(2).key).toBe(147);

            treeGrid.sort({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            expect(treeGrid.getRowByIndex(0).key).toBe(711);
            expect(treeGrid.getRowByIndex(1).key).toBe(147);
            expect(treeGrid.getRowByIndex(2).key).toBe(847);
        });

        it('should not take into account pinned rows when changing items per page', () => {
            treeGrid.pinRow(147);

            fix.componentInstance.paging = true;
            fix.detectChanges();
            treeGrid.paginator.perPage = 5;
            fix.detectChanges();

            expect(treeGrid.dataView.length).toBe(6);

            treeGrid.paginator.perPage = 10;
            fix.detectChanges();

            expect(treeGrid.dataView.length).toBe(11);
        });

        it('should correctly apply paging state for grid and paginator when there are pinned rows.', () => {
            fix.componentInstance.paging = true;
            fix.detectChanges();
            const paginator = treeGrid.paginator;
            paginator.perPage = 3;
            treeGrid.height = '700px';
            fix.detectChanges();
            // pin the first row
            treeGrid.getRowByIndex(0).pin();
            expect(treeGrid.rowList.length).toEqual(4);
            expect(paginator.perPage).toEqual(3);
            expect(paginator.totalRecords).toEqual(10);
            expect(paginator.totalPages).toEqual(4);

            // pin the second row
            treeGrid.getRowByIndex(2).pin();

            expect(treeGrid.rowList.length).toEqual(5);
            expect(paginator.perPage).toEqual(3);
            expect(paginator.totalRecords).toEqual(10);
            expect(paginator.totalPages).toEqual(4);
        });

        it('should have the correct records shown for pages with pinned rows', () => {
            fix.componentInstance.paging = true;
            fix.detectChanges();
            treeGrid.paginator.perPage = 6;
            treeGrid.height = '700px';
            fix.detectChanges();
            treeGrid.getRowByIndex(0).pin();

            let rows = treeGrid.rowList.toArray();

            [147, 147, 475, 957, 317, 711, 998].forEach((x, index) => expect(parseInt(rows[index].cells.first.value, 10)).toEqual(x));

            treeGrid.paginator.paginate(1);
            fix.detectChanges();

            rows = treeGrid.rowList.toArray();

            [147, 299, 19, 847, 663].forEach((x, index) => expect(parseInt(rows[index].cells.first.value, 10)).toEqual(x));
        });

        it('should make a correct selection', () => {
            treeGrid.pinRow(147);

            const range = { rowStart: 0, rowEnd: 2, columnStart: 'ID', columnEnd: 'Name' };
            treeGrid.selectRange(range);
            fix.detectChanges();

            const selectedRange = treeGrid.getSelectedData();
            expect(selectedRange).toEqual([
                {ID: 147, Name: 'John Winchester'},
                {ID: 147, Name: 'John Winchester'},
                {ID: 475, Name: 'Michael Langdon'},
            ]);
        });

        it('should remove the pinned chip for filtered out parent', () => {
            treeGrid.pinRow(147);

            treeGrid.filter('ID', 957, IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            const firstRow = treeGrid.getRowByIndex(0);

            // Check getRowByIndex expanded, children and parent members
            expect(firstRow.expanded).toBe(true);
            // children.length equals the filtered our chidlren!
            expect(firstRow.children.length).toEqual(1);
            expect(treeGrid.getRowByIndex(1).parent.key).toEqual(147);

            const firstColumnField = treeGrid.columnList.get(0).field;
            const pinnedChipExpectedPosition = treeGrid.gridAPI.get_cell_by_index(1, firstColumnField);

            expect(pinnedChipExpectedPosition.nativeElement.getElementsByClassName('igx-grid__td--pinned-chip').length).toBe(0);
        });

        it('should test getRowByIndex API members', () => {
            treeGrid.filter('ID', 957, IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            const firstRow = treeGrid.getRowByIndex(0);

            // Check getRowByIndex expanded, children and parent members
            expect(firstRow.expanded).toBe(true);
            expect(firstRow.hasChildren).toBe(true);
            expect(firstRow.children[0].hasChildren).toBeFalse();
            // children.length equals the filtered our chidlren!
            expect(firstRow.children.length).toEqual(1);
            expect(firstRow.children[0] instanceof IgxTreeGridRow).toBeTrue();
            expect(firstRow.children[0].parent instanceof IgxTreeGridRow).toBeTrue();
            expect(firstRow.children[0].parent.key).toBe(firstRow.key);
            expect(treeGrid.getRowByIndex(1).parent.key).toEqual(147);

            firstRow.expanded = false;
            expect(firstRow.expanded).toBe(false);

            expect(firstRow.pinned).toBeFalse();
            firstRow.pinned = true;
            expect(firstRow.pinned).toBeTrue();
        });

        it('should delete pinned row without errors', () => {
            treeGrid.pinRow(147);
            fix.detectChanges();
            const firstRow = treeGrid.pinnedRows[0];

            expect(firstRow.isRoot).toBe(true);
            expect(firstRow.pinned).toBeTrue();
            expect(firstRow.data.ID).toEqual(147);

            treeGrid.deleteRowById(147);
            fix.detectChanges();

            expect(firstRow.isRoot).toBe(false);
        });
    });
});
