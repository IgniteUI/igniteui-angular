import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { IgxTreeGridComponent } from './tree-grid.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxTreeGridModule, IgxTreeGridRowComponent } from './index';
import {
    IgxTreeGridSimpleComponent, IgxTreeGridPrimaryForeignKeyComponent,
    IgxTreeGridStringTreeColumnComponent, IgxTreeGridDateTreeColumnComponent, IgxTreeGridBooleanTreeColumnComponent,
    IgxTreeGridRowEditingComponent, IgxTreeGridMultiColHeadersComponent,
     IgxTreeGridRowEditingTransactionComponent,
    IgxTreeGridRowEditingHierarchicalDSTransactionComponent
} from '../../test-utils/tree-grid-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxNumberFilteringOperand } from '../../../public_api';
import { IgxGridCommonModule } from '../grid-common.module';
import { IgxToggleModule } from '../../directives/toggle/toggle.directive';
import { IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxHierarchicalTransactionService } from '../../services/transaction/igx-hierarchical-transaction';
import { IgxGridTransaction } from '../grid-base.component';


const CSS_CLASS_BANNER = 'igx-banner';

fdescribe('IgxTreeGrid - Integration', () => {
    configureTestSuite();
    let fix;
    let treeGrid: IgxTreeGridComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSimpleComponent,
                IgxTreeGridPrimaryForeignKeyComponent,
                IgxTreeGridStringTreeColumnComponent,
                IgxTreeGridDateTreeColumnComponent,
                IgxTreeGridBooleanTreeColumnComponent,
                IgxTreeGridRowEditingComponent,
                IgxTreeGridMultiColHeadersComponent,
                IgxTreeGridRowEditingTransactionComponent,
                IgxTreeGridRowEditingHierarchicalDSTransactionComponent
            ],
            imports: [NoopAnimationsModule, IgxToggleModule, IgxTreeGridModule],
            providers: [
                { provide: IgxGridTransaction, useClass: IgxHierarchicalTransactionService }
            ]
        })
            .compileComponents();
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
        configureTestSuite();
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

            const column = treeGrid.columns.filter(c => c.field === 'ID')[0];
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

            const column = treeGrid.columns.filter(c => c.field === 'Age')[0];
            column.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 3);
        });

        it('(API) should transform a non-tree column into a tree column when moving the original tree-column through', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);

            // Move tree-column
            const sourceColumn = treeGrid.columns.filter(c => c.field === 'ID')[0];
            const targetColumn = treeGrid.columns.filter(c => c.field === 'HireDate')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'Name', 4);
        });

        it('(UI) should transform a non-tree column into a tree column when moving the original tree-column through', (async () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);

            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.movable = true;

            const header = TreeGridFunctions.getHeaderCell(fix, 'ID').nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 50);
            UIInteractions.simulatePointerEvent('pointermove', header, 56, 56);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 490, 30);
            UIInteractions.simulatePointerEvent('pointerup', header, 490, 30);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'Name', 4);
        }));

        it('(API) should autosize tree-column', () => {
            const headerCell = TreeGridFunctions.getHeaderCell(fix, 'ID');
            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];

            expect((<HTMLElement>headerCell.nativeElement).getBoundingClientRect().width).toBe(225, 'incorrect column width');
            expect(parseInt(column.width, 10)).toBe(225);

            // API autosizing
            column.autosize();
            fix.detectChanges();

            expect((<HTMLElement>headerCell.nativeElement).getBoundingClientRect().width).toBe(152, 'incorrect headerCell width');
            expect(parseInt(column.width, 10)).toBe(152);
        });

        it('(UI) should autosize tree-column', () => {
            const headerCell = TreeGridFunctions.getHeaderCell(fix, 'ID').parent;
            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.resizable = true;

            expect((<HTMLElement>headerCell.nativeElement).getBoundingClientRect().width).toBe(225, 'incorrect column width');
            expect(parseInt(column.width, 10)).toBe(225);

            // UI autosizing
            const resizer = headerCell.query(By.css('.igx-grid__th-resize-handle')).nativeElement;
            UIInteractions.simulateMouseEvent('dblclick', resizer, 225, 5);

            expect((<HTMLElement>headerCell.nativeElement).getBoundingClientRect().width).toBe(152, 'incorrect headerCell width');
            expect(parseInt(column.width, 10)).toBe(152);
        });
    });

    describe('Primary/Foreign key', () => {
        configureTestSuite();
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

            const column = treeGrid.columns.filter(c => c.field === 'ID')[0];
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

            const column = treeGrid.columns.filter(c => c.field === 'Age')[0];
            column.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);
        });

        it('(API) should transform a non-tree column into a tree column when moving the original tree-column through', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);

            // Move tree-column
            const sourceColumn = treeGrid.columns.filter(c => c.field === 'ID')[0];
            const targetColumn = treeGrid.columns.filter(c => c.field === 'JobTitle')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ParentID', 5);
        });

        it('(UI) should transform a non-tree column into a tree column when moving the original tree-column through', (async () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);

            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.movable = true;

            const header = TreeGridFunctions.getHeaderCell(fix, 'ID').nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 50);
            UIInteractions.simulatePointerEvent('pointermove', header, 56, 56);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 490, 30);
            UIInteractions.simulatePointerEvent('pointerup', header, 490, 30);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ParentID', 5);
        }));

        it('(API) should autosize tree-column', () => {
            const headerCell = TreeGridFunctions.getHeaderCell(fix, 'ID');
            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];

            expect((<HTMLElement>headerCell.nativeElement).getBoundingClientRect().width).toBe(180, 'incorrect column width');
            expect(parseInt(column.width, 10)).toBe(180);

            // API autosizing
            column.autosize();
            fix.detectChanges();

            expect((<HTMLElement>headerCell.nativeElement).getBoundingClientRect().width).toBe(152, 'incorrect headerCell width');
            expect(parseInt(column.width, 10)).toBe(152);
        });

        it('(UI) should autosize tree-column', () => {
            const headerCell = TreeGridFunctions.getHeaderCell(fix, 'ID').parent;
            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.resizable = true;

            expect((<HTMLElement>headerCell.nativeElement).getBoundingClientRect().width).toBe(180, 'incorrect column width');
            expect(parseInt(column.width, 10)).toBe(180);

            // UI autosizing
            const resizer = headerCell.query(By.css('.igx-grid__th-resize-handle')).nativeElement;
            UIInteractions.simulateMouseEvent('dblclick', resizer, 225, 5);

            expect((<HTMLElement>headerCell.nativeElement).getBoundingClientRect().width).toBe(152, 'incorrect headerCell width');
            expect(parseInt(column.width, 10)).toBe(152);
        });
    });

    describe('Row editing', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('banner has no indentation when editing a parent node.', fakeAsync(() => {
            // TODO
            // Verify the overlay has the same width as the row that is edited
        }));

        it('should show the banner below the edited parent node', () => {
            // Collapsed state
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.collapseAll();
            fix.detectChanges();
            verifyBannerPositioning(0);

            // Expanded state
            grid.expandAll();
            fix.detectChanges();
            verifyBannerPositioning(3);

            function verifyBannerPositioning(columnIndex: number) {
                const cell = grid.getCellByColumn(columnIndex, 'Name');
                cell.inEditMode = true;
                fix.detectChanges();

                const editRow = cell.row.nativeElement;
                const banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER)).nativeElement;

                const bannerTop = banner.getBoundingClientRect().top;
                const editRowBottom = editRow.getBoundingClientRect().bottom;

                // The banner appears below the row
                expect(bannerTop).toBeGreaterThanOrEqual(editRowBottom);
                // No much space between the row and the banner
                expect(bannerTop - editRowBottom).toBeLessThan(2);
            }
        });

        it('should show the banner below the edited child node', () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.expandAll();
            fix.detectChanges();

            const cell = grid.getCellByColumn(1, 'Name');
            cell.inEditMode = true;
            fix.detectChanges();

            const editRow = cell.row.nativeElement;
            const banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER)).nativeElement;

            const bannerTop = banner.getBoundingClientRect().top;
            const editRowBottom = editRow.getBoundingClientRect().bottom;

            // The banner appears below the row
            expect(bannerTop).toBeGreaterThanOrEqual(editRowBottom);
            // No much space between the row and the banner
            expect(bannerTop - editRowBottom).toBeLessThan(2);
        });

        it('should show the banner above the last parent node when in edit mode', fakeAsync(() => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.height = '200px';
            tick(16); // height animationFrame
            fix.detectChanges();

            grid.collapseAll();
            fix.detectChanges();

            const cell = grid.getCellByColumn(2, 'Name');
            cell.inEditMode = true;
            tick();
            fix.detectChanges();

            const editRow = cell.row.nativeElement;
            const banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER)).nativeElement;

            const bannerBottom = banner.getBoundingClientRect().bottom;
            const editRowTop = editRow.getBoundingClientRect().top;

            // The banner appears below the row
            expect(bannerBottom).toBeLessThanOrEqual(editRowTop);
            // No much space between the row and the banner
            expect(editRowTop - bannerBottom).toBeLessThan(2);
        }));

        it('should show the banner above the last child node when in edit mode', () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.expandAll();
            fix.detectChanges();

            const cell = grid.getCellByColumn(grid.rowList.length - 1, 'Name');
            cell.inEditMode = true;
            fix.detectChanges();

            const editRow = cell.row.nativeElement;
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
            cell.inEditMode = true;
            fix.detectChanges();

            let banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            // Expand parent row
            grid.expandRow(cell.row.rowID);
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(cell.inEditMode).toBeFalsy();
            expect(banner.parent.attributes['aria-hidden']).toEqual('true');

            // Edit parent row cell
            cell.inEditMode = true;
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            // Collapse parent row
            grid.collapseRow(cell.row.rowID);
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(cell.inEditMode).toBeFalsy();
            expect(banner.parent.attributes['aria-hidden']).toEqual('true');
        });

        it('should hide banner when edited child row is being expanded/collapsed', () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.expandAll();
            fix.detectChanges();

            // Edit child row child cell
            const childCell = grid.getCellByColumn(4, 'Name');
            childCell.inEditMode = true;
            fix.detectChanges();

            let banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            // Collapse parent child row
            let parentRow = grid.getRowByIndex(3);
            grid.collapseRow(parentRow.rowID);
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(childCell.inEditMode).toBeFalsy();
            expect(banner.parent.attributes['aria-hidden']).toEqual('true');

            // Edit child row cell
            const parentCell = grid.getCellByColumn(3, 'Name');
            parentCell.inEditMode = true;
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            // Collapse parent row
            parentRow = grid.getRowByIndex(0);
            grid.collapseRow(parentRow.rowID);
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(parentCell.inEditMode).toBeFalsy();
            expect(banner.parent.attributes['aria-hidden']).toEqual('true');
        });

        it('TAB navigation should not leave the edited row and the banner.', async () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            const row = grid.getRowByIndex(2);
            const dateCell = grid.getCellByColumn(2, 'HireDate');
            const nameCell = grid.getCellByColumn(2, 'Name');
            const idCell = grid.getCellByColumn(2, 'ID');
            const ageCell = grid.getCellByColumn(2, 'Age');
            dateCell.inEditMode = true;
            await wait(30);
            fix.detectChanges();

            await TreeGridFunctions.moveGridCellWithTab(fix, dateCell);
            expect(dateCell.inEditMode).toBeFalsy();
            expect(nameCell.inEditMode).toBeTruthy();

            await TreeGridFunctions.moveGridCellWithTab(fix, nameCell);
            expect(nameCell.inEditMode).toBeFalsy();
            expect(idCell.inEditMode).toBeFalsy();
            expect(ageCell.inEditMode).toBeTruthy();

            const cancelBtn = fix.debugElement.queryAll(By.css('.igx-button--flat'))[0] as DebugElement;
            const doneBtn = fix.debugElement.queryAll(By.css('.igx-button--flat'))[1];
            spyOn(cancelBtn.nativeElement, 'focus').and.callThrough();
            spyOn<any>(grid.rowEditTabs.first, 'move').and.callThrough();
            spyOn<any>(grid.rowEditTabs.last, 'move').and.callThrough();

            await TreeGridFunctions.moveGridCellWithTab(fix, ageCell);
            expect(cancelBtn.nativeElement.focus).toHaveBeenCalled();

            const mockObj = jasmine.createSpyObj('mockObj', ['stopPropagation', 'preventDefault']);
            cancelBtn.triggerEventHandler('keydown.Tab', mockObj);
            await wait(30);
            fix.detectChanges();
            expect((<any>grid.rowEditTabs.first).move).not.toHaveBeenCalled();
            expect(mockObj.preventDefault).not.toHaveBeenCalled();
            expect(mockObj.stopPropagation).toHaveBeenCalled();

            doneBtn.triggerEventHandler('keydown.Tab', mockObj);
            await wait(30);
            fix.detectChanges();
            expect(dateCell.inEditMode).toBeTruthy();
            expect((<any>grid.rowEditTabs.last).move).toHaveBeenCalled();
            expect(mockObj.preventDefault).toHaveBeenCalled();
            expect(mockObj.stopPropagation).toHaveBeenCalled();
        });

        it('should preserve updates after removing Filtering', () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.filter('Age', 40, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();

            const childCell = grid.getCellByColumn(2, 'Age');
            const childRowID = childCell.row.rowID;
            const parentCell = grid.getCellByColumn(0, 'Age');
            const parentRowID = parentCell.row.rowID;

            childCell.update(18);
            parentCell.update(33);
            fix.detectChanges();

            grid.clearFilter();
            fix.detectChanges();

            const childRow = grid.rowList.filter(r => r.rowID === childRowID)[0] as IgxTreeGridRowComponent;
            const editedChildCell = childRow.cells.filter(c => c.column.field === 'Age')[0];
            expect(editedChildCell.value).toEqual(18);

            const parentRow = grid.rowList.filter(r => r.rowID === parentRowID)[0] as IgxTreeGridRowComponent;
            const editedParentCell = parentRow.cells.filter(c => c.column.field === 'Age')[0];
            expect(editedParentCell.value).toEqual(33);

        });

        it('should preserve updates after removing Sorting', () => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.sort({ fieldName: 'Age', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            const childCell = grid.getCellByColumn(0, 'Age');
            const childRowID = childCell.row.rowID;
            const parentCell = grid.getCellByColumn(1, 'Age');
            const parentRowID = parentCell.row.rowID;

            childCell.update(14);
            parentCell.update(80);
            fix.detectChanges();

            grid.clearSort();
            fix.detectChanges();

            const childRow = grid.rowList.filter(r => r.rowID === childRowID)[0] as IgxTreeGridRowComponent;
            const editedChildCell = childRow.cells.filter(c => c.column.field === 'Age')[0];
            expect(editedChildCell.value).toEqual(14);

            const parentRow = grid.rowList.filter(r => r.rowID === parentRowID)[0] as IgxTreeGridRowComponent;
            const editedParentCell = parentRow.cells.filter(c => c.column.field === 'Age')[0];
            expect(editedParentCell.value).toEqual(80);
        });

        it('Children are transformed into parent nodes after their parent is deleted', fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;

            const row: HTMLElement = treeGrid.getRowByIndex(0).nativeElement;
            treeGrid.cascadeOnDelete = false;
            const trans = treeGrid.transactions;

            treeGrid.deleteRowById(1);
            fix.detectChanges();
            tick();

            expect(row.classList).toContain('igx-grid__tr--deleted');
            expect(treeGrid.getRowByKey(1).index).toBe(0);
            expect(treeGrid.getRowByKey(2).index).toBe(1);
            expect(treeGrid.getRowByKey(3).index).toBe(2);
            trans.commit(treeGrid.data);
            tick();

            expect(row.classList).not.toContain('igx-grid__tr--deleted');
            expect(treeGrid.getRowByKey(2).index).toBe(0);
            expect(treeGrid.getRowByKey(3).index).toBe(1);
            expect(trans.canUndo).toBe(false);
        }));

        it('Children are deleted along with their parent', fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            treeGrid.cascadeOnDelete = true;
            const trans = treeGrid.transactions;

            treeGrid.deleteRowById(1);
            fix.detectChanges();
            tick();

            for (let i = 0; i < 5; i++) {
                const curRow: HTMLElement = treeGrid.getRowByIndex(i).nativeElement;
                expect(curRow.classList).toContain('igx-grid__tr--deleted');
            }
            expect(treeGrid.getRowByKey(1).index).toBe(0);
            expect(treeGrid.getRowByKey(2).index).toBe(1);
            expect(treeGrid.getRowByKey(3).index).toBe(2);
            expect(treeGrid.getRowByKey(7).index).toBe(3);
            expect(treeGrid.getRowByKey(4).index).toBe(4);

            trans.commit(treeGrid.data);
            tick();

            expect(treeGrid.getRowByKey(1)).toBeUndefined();
            expect(treeGrid.getRowByKey(2)).toBeUndefined();
            expect(treeGrid.getRowByKey(3)).toBeUndefined();
            expect(treeGrid.getRowByKey(7)).toBeUndefined();
            expect(treeGrid.getRowByKey(4)).toBeUndefined();

            expect(treeGrid.getRowByKey(6).index).toBe(0);
            expect(treeGrid.getRowByKey(10).index).toBe(1);
            expect(trans.canUndo).toBe(false);
        }));

        it('Editing a cell is posible with Hierarchical DS', () => {
            // TODO:
            // 1. Enter row edit mode in a gridwith Hierarchical DS
            // 2. Update a cell
            // 3. Press ENTER or click Done
            // 4. Verify the value is updated and the correct style is applied before committing
            // 5. Commit
            // 6. Verify the correct value is set
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
        });

        it('Add parent node to a Flat DS tree grid', fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            const trans = treeGrid.transactions;

            treeGrid.addRow({ ID: 11, ParentID: -1, Name: 'Dan Kolov', JobTitle: 'wrestler', Age: 32 });
            fix.detectChanges();
            tick();

            expect(trans.canUndo).toBe(true);
            expect(treeGrid.getRowByKey(11).nativeElement.classList).toContain('igx-grid__tr--edited');

            trans.commit(treeGrid.data);
            tick();

            expect(treeGrid.getRowByKey(11).nativeElement.classList).not.toContain('igx-grid__tr--edited');
            expect(trans.canUndo).toBe(false);

            treeGrid.addRow({ ID: 12, ParentID: -1, Name: 'Kubrat Pulev', JobTitle: 'Boxer', Age: 33 });
            fix.detectChanges();
            tick();

            expect(trans.canUndo).toBe(true);
            expect(treeGrid.getRowByKey(12).nativeElement.classList).toContain('igx-grid__tr--edited');
        }));

        it('Add parent node to a Hierarchical DS tree grid', () => {
            // TODO:
            // 1. Add a row at level 0 to the grid
            // 2. Verify the new row is pending with the correct styles
            // 3. Commit
            // 4. Verify the row is committed, the styles are OK and the Undo stack is empty
            // 5. Add another row at level 0
            // 6. verify the pending styles is applied only to the newly added row
            // and not to the previously added row
        });

        it('Add a child node to a previously added parent node - Flat DS', () => {
            // TODO:
            // 1. Add a row at level 0 to the grid
            // 2. Add a child row to that parent
            // 3. Verify the new rows are pending with the correct styles
            // 4. Commit
            // 5. verify the rows are committed, the styles are OK
            // 6. Add another child row at level 2 (grand-child of the first row)
            // 7. verify the pending styles is applied only to the newly added row
            // and not to the previously added rows
        });

        it('Add a child node to a previously added parent node - Hierarchical DS', () => {
            // TODO:
            // 1. Add a row at level 0 to the grid
            // 2. Add a child row to that parent
            // 3. Verify the new rows are pending with the correct styles
            // 4. Commit
            // 5. verify the rows are committed, the styles are OK
            // 6. Add another child row at level 2 (grand-child of the first row)
            // 7. verify the pending styles is applied only to the newly added row
            // and not to the previously added rows
        });

        it('Delete a pending parent node - Flat DS', () => {
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
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
            treeGrid.addRow(newRow, 0);
            fix.detectChanges();

            const addedRow = treeGrid.rowList.filter(r => r.rowID === addedRowId)[0] as IgxTreeGridRowComponent;
            treeGrid.selectRows([treeGrid.getRowByIndex(addedRow.index).rowID], true);
            fix.detectChanges();
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            const transParams = {id: addedRowId, type: 'add', newValue: newRow};
            expect(trans.add).toHaveBeenCalledWith(transParams);

            treeGrid.deleteRowById(treeGrid.selectedRows()[0]);
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.rowID === addedRowId).length).toEqual(0);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(2);
            expect(treeGrid.transactions.getTransactionLog()[1].id).toEqual(addedRowId);
            expect(treeGrid.transactions.getTransactionLog()[1].type).toEqual('delete');
            expect(treeGrid.transactions.getTransactionLog()[1].newValue).toBeNull();

            treeGrid.transactions.undo();
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.rowID === addedRowId).length).toEqual(1);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(2);
            expect(trans.add).toHaveBeenCalledWith(transParams);
        });

        it('Delete a pending parent node - Hierarchical DS', fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingHierarchicalDSTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            const trans = treeGrid.transactions;
            spyOn(trans, 'add').and.callThrough();

            const parentRow = treeGrid.getRowByIndex(0) as IgxTreeGridRowComponent;
            const addedRowId = treeGrid.rowList.length;
            const newRow = {
                ID: addedRowId,
                Name: 'John Dow',
                HireDate: new Date(2018, 10, 20),
                Age: 22,
                OnPTO: false,
                Employees: []
            };

            treeGrid.addRow(newRow, parentRow.rowID);
            fix.detectChanges();

            const addedRow = treeGrid.rowList.filter(r => r.rowID === addedRowId)[0] as IgxTreeGridRowComponent;
            treeGrid.selectRows([treeGrid.getRowByIndex(addedRow.index).rowID], true);
            tick(20);
            fix.detectChanges();
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            const transParams = {id: addedRowId, path: [parentRow.rowID], newValue: newRow, type: 'add'};
            expect(trans.add).toHaveBeenCalledWith(transParams, null);

            treeGrid.deleteRowById(treeGrid.selectedRows()[0]);
            tick();
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.rowID === addedRowId).length).toEqual(0);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(2);
            expect(treeGrid.transactions.getTransactionLog()[1].id).toEqual(addedRowId);
            expect(treeGrid.transactions.getTransactionLog()[1].type).toEqual('delete');
            expect(treeGrid.transactions.getTransactionLog()[1].newValue).toBeNull();

            treeGrid.transactions.undo();
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.rowID === addedRowId).length).toEqual(1);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(2);
            expect(trans.add).toHaveBeenCalledWith(transParams, null);
        }));

        it('Delete a pending child node - Flat DS', () => {
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
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

            const addedRow = treeGrid.rowList.filter(r => r.rowID === addedRowId)[0] as IgxTreeGridRowComponent;
            treeGrid.selectRows([treeGrid.getRowByIndex(addedRow.index).rowID], true);
            fix.detectChanges();
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            const transParams = {id: addedRowId, type: 'add', newValue: newRow};
            expect(trans.add).toHaveBeenCalledWith(transParams);

            treeGrid.deleteRowById(treeGrid.selectedRows()[0]);
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.rowID === addedRowId).length).toEqual(0);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(2);
            expect(treeGrid.transactions.getTransactionLog()[1].id).toEqual(addedRowId);
            expect(treeGrid.transactions.getTransactionLog()[1].type).toEqual('delete');
            expect(treeGrid.transactions.getTransactionLog()[1].newValue).toBeNull();

            treeGrid.transactions.undo();
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.rowID === addedRowId).length).toEqual(1);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(2);
            expect(trans.add).toHaveBeenCalledWith(transParams);
        });

        it('Delete a pending child node - Hierarchical DS', fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingHierarchicalDSTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            const trans = treeGrid.transactions;
            spyOn(trans, 'add').and.callThrough();

            const parentRow = treeGrid.getRowByIndex(1) as IgxTreeGridRowComponent;
            const addedRowId = treeGrid.rowList.length;
            const newRow = {
                ID: addedRowId,
                Name: 'John Dow',
                HireDate: new Date(2018, 10, 20),
                Age: 22,
                OnPTO: false,
                Employees: []
            };

            treeGrid.addRow(newRow, parentRow.rowID);
            fix.detectChanges();

            const addedRow = treeGrid.rowList.filter(r => r.rowID === addedRowId)[0] as IgxTreeGridRowComponent;
            treeGrid.selectRows([treeGrid.getRowByIndex(addedRow.index).rowID], true);
            tick(20);
            fix.detectChanges();
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            const transPasrams = {
                id: addedRowId,
                path: [treeGrid.getRowByIndex(0).rowID, parentRow.rowID],
                newValue: newRow,
                type: 'add'};
            expect(trans.add).toHaveBeenCalledWith(transPasrams, null);

            treeGrid.deleteRowById(treeGrid.selectedRows()[0]);
            tick();
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.rowID === addedRowId).length).toEqual(0);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(2);
            expect(treeGrid.transactions.getTransactionLog()[1].id).toEqual(addedRowId);
            expect(treeGrid.transactions.getTransactionLog()[1].type).toEqual('delete');
            expect(treeGrid.transactions.getTransactionLog()[1].newValue).toBeNull();

            treeGrid.transactions.undo();
            fix.detectChanges();
            expect(treeGrid.rowList.filter(r => r.rowID === addedRowId).length).toEqual(1);
            expect(treeGrid.transactions.getTransactionLog().length).toEqual(1);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(2);
            expect(trans.add).toHaveBeenCalledWith(transPasrams, null);

        }));
    });

    describe('Multi-column header', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridMultiColHeadersComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('Should transform a hidden column to a tree column when it becomes visible and it is part of a column group', () => {
            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 4);

            const column = treeGrid.columns.filter(c => c.field === 'ID')[0];
            column.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'Name', 3);

            column.hidden = false;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 4);
        });

        it('Should transform a hidden column to a tree column when all columns from left-most group are hidden', () => {
            // hide Name column so that the tested columns (ID and HireDate) are not part of the same group
            const columnName = treeGrid.columns.filter(c => c.field === 'Name')[0];
            columnName.hidden = true;

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 3);

            const column = treeGrid.columns.filter(c => c.field === 'ID')[0];
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
            const sourceColumn = treeGrid.columns.filter(c => c.field === 'ID')[0];
            const targetColumn = treeGrid.columns.filter(c => c.field === 'Name')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'Name', 4);
        });

        it('(UI) Should transform a non-tree column into a tree column when moving it first within a group', (async () => {
            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 4);

            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.movable = true;

            const header = TreeGridFunctions.getHeaderCellMultiColHeaders(fix, 'ID').nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 100, 90);
            UIInteractions.simulatePointerEvent('pointermove', header, 106, 96);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 420, 90);
            UIInteractions.simulatePointerEvent('pointerup', header, 420, 90);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'Name', 4);
        }));

        it('(API) Should transform a non-tree column of a column group to a tree column when its group is moved first', () => {
            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 4);

            // Move group-column
            const sourceColumn = treeGrid.columns.filter(c => c.header === 'General Information')[0];
            const targetColumn = treeGrid.columns.filter(c => c.header === 'Additional Information')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'HireDate', 4);
        });

        it('(UI) Should transform a non-tree column of a column group to a tree column when its group is moved first', (async () => {
            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'ID', 4);

            const column = treeGrid.columnList.filter(c => c.header === 'General Information')[0];
            column.movable = true;
            fix.detectChanges();

            const header = fix.debugElement.queryAll(By.css('.igx-grid__thead-item'))[0].nativeElement;

            UIInteractions.simulatePointerEvent('pointerdown', header, 100, 40);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 106, 46);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', header, 700, 40);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', header, 700, 40);
            await wait();
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'HireDate', 4);
        }));
    });
});
