import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { IgxTreeGridComponent } from './tree-grid.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxTreeGridModule, IgxTreeGridRowComponent } from './index';
import {
    IgxTreeGridSimpleComponent, IgxTreeGridPrimaryForeignKeyComponent,
    IgxTreeGridStringTreeColumnComponent, IgxTreeGridDateTreeColumnComponent, IgxTreeGridBooleanTreeColumnComponent,
    IgxTreeGridRowEditingComponent, IgxTreeGridMultiColHeadersComponent
} from '../../test-utils/tree-grid-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxToggleModule } from '../../directives/toggle/toggle.directive';
import { IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';

const CSS_CLASS_BANNER = 'igx-banner';

describe('IgxTreeGrid - Integration', () => {
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
                IgxTreeGridMultiColHeadersComponent
            ],
            imports: [NoopAnimationsModule, IgxToggleModule, IgxTreeGridModule]
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

        it('shows the banner below the edited parent node', fakeAsync(() => {
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
                tick();
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
        }));

        it('shows the banner below the edited child node', fakeAsync(() => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.expandAll();
            fix.detectChanges();
            const cell = grid.getCellByColumn(1, 'Name');
            cell.inEditMode = true;
            tick();
            fix.detectChanges();

            const editRow = cell.row.nativeElement;
            const banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER)).nativeElement;

            const bannerTop = banner.getBoundingClientRect().top;
            const editRowBottom = editRow.getBoundingClientRect().bottom;

            // The banner appears below the row
            expect(bannerTop).toBeGreaterThanOrEqual(editRowBottom);
            // No much space between the row and the banner
            expect(bannerTop - editRowBottom).toBeLessThan(2);
        }));

        it('shows the banner above the edited parent node if it is the last one', fakeAsync(() => {
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

        it('shows the banner above the edited child node if it is the last one', fakeAsync(() => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.expandAll();
            fix.detectChanges();
            const cell = grid.getCellByColumn(9, 'Name');
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

        it('banner hides when you expand/collapse the edited row', fakeAsync(() => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.collapseAll();
            fix.detectChanges();

            const cell = grid.getCellByColumn(0, 'Name');
            cell.inEditMode = true;
            tick();
            fix.detectChanges();

            const banner = document.getElementsByClassName(CSS_CLASS_BANNER)[0];
            console.log(banner.attributes);

            // let banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            // expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            // const row = cell.row as IgxTreeGridRowComponent;
            // grid.expandRow(row.rowID);
            // tick();
            // fix.detectChanges();

            // banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            // expect(cell.inEditMode).toBeFalsy();
            // // expect(banner.parent.attributes['aria-hidden']).toEqual('true');

            // cell = grid.getCellByColumn(0, 'Name');
            // cell.inEditMode = true;
            // tick();
            // fix.detectChanges();

            // banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            // expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            // grid.collapseRow(row.rowID);
            // tick();
            // fix.detectChanges();

            // banner = fix.debugElement.query(By.css('.igx-overlay__content'));
            // // console.log(banner);
            // expect(cell.inEditMode).toBeFalsy();
            // expect(banner.parent.attributes['aria-hidden']).toEqual('true');



            // TODO
            // Verify the changes are preserved
            // 1.) Expand a parent row while editing it
            // 2.) Collapse an expanded parent row while editing it
            // 3.) Collapse an expanded parent row while editing a child (test with more than 2 levels)
        }));

        it('TAB navigation cannot leave the edited row and the banner.', fakeAsync(() => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            const cell = grid.getCellByColumn(2, 'Name');
            cell.inEditMode = true;
            tick();
            fix.detectChanges();
            // TODO
            // Verify the focus do not go to the next row
            // Verify non-editable columns are skipped while navigating
        }));

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
            grid.sort({ fieldName: 'Age', dir: SortingDirection.Desc, ignoreCase: false, strategy: DefaultSortingStrategy.instance() });
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

            const header = TreeGridFunctions.getHeaderCell(fix, 'General Information').nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 100, 40);
            UIInteractions.simulatePointerEvent('pointermove', header, 106, 46);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 800, 40);
            UIInteractions.simulatePointerEvent('pointerup', header, 800, 40);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumnInMultiColHeaders(fix, 'HireDate', 4);
        }));
    });
});
