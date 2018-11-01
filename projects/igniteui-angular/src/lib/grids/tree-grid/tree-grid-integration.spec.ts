import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { IgxTreeGridComponent } from './tree-grid.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxTreeGridModule, IgxTreeGridRowComponent } from './index';
import {
    IgxTreeGridSimpleComponent, IgxTreeGridPrimaryForeignKeyComponent,
    IgxTreeGridStringTreeColumnComponent, IgxTreeGridDateTreeColumnComponent, IgxTreeGridBooleanTreeColumnComponent,
    IgxTreeGridRowEditingComponent
} from '../../test-utils/tree-grid-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from '../../test-utils/configure-suite';

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
                IgxTreeGridRowEditingComponent
            ],
            imports: [NoopAnimationsModule, IgxTreeGridModule]
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
            const headerCell = TreeGridFunctions.getHeaderCell(fix, 'ID');
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
            const headerCell = TreeGridFunctions.getHeaderCell(fix, 'ID');
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

        xit('shows the banner above the edited parent node if it is the last one', fakeAsync(() => {
            const grid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
            grid.height = '200px';
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
            console.log(banner.getBoundingClientRect());
            console.log(editRow.getBoundingClientRect());
            console.log(grid.height);

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

            let cell = grid.getCellByColumn(0, 'Name');
            cell.inEditMode = true;
            tick();
            fix.detectChanges();

            let banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            const row = cell.row as IgxTreeGridRowComponent;
            grid.expandRow(row.rowID);
            tick();
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(cell.inEditMode).toBeFalsy();
            //expect(banner.parent.attributes['aria-hidden']).toEqual('true');

            cell = grid.getCellByColumn(0, 'Name');
            cell.inEditMode = true;
            tick();
            fix.detectChanges();

            banner = fix.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
            expect(banner.parent.attributes['aria-hidden']).toEqual('false');

            // TODO
            // Verify the changes are preserved
            // 1.) Expand a parent row while editing it
            // 2.) Collapse an expanded parent row while editing it
            // 3.) Collapse an expanded parent row while editing a child (test with more than 2 levels)
        }));

        it('TAB navigation cannot leave the edited row and the banner.', fakeAsync(() => {
            // TODO
            // Verify the focus do not go to the next row
            // Verify non-editable columns are skipped while navigating
        }));

        it('updates are preserved after Filtering is removed', fakeAsync(() => {
            // TODO
            // Test for parent and child nodes
        }));

        it('updates are preserved after Sorting is removed', fakeAsync(() => {
            treeGrid.sort({ fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            // Verify first level records are desc sorted
            expect(treeGrid.getCellByColumn(0, 'Name').value).toEqual('Ana Sanders');
            expect(treeGrid.getCellByColumn(1, 'Name').value).toEqual('Elizabeth Richards');
            expect(treeGrid.getCellByColumn(8, 'Name').value).toEqual('Thomas Hardy');

            const targetCell = treeGrid.getCellByColumn(1, 'Name');
            targetCell.update('Bojidar Kraev');
            tick();
            fix.detectChanges();

            expect(treeGrid.getCellByColumn(1, 'Name').value).toEqual('Bojidar Kraev');

            treeGrid.clearSort();
            fix.detectChanges();
            expect(treeGrid.getCellByColumn(9, 'Name').value).toEqual('Bojidar Kraev');
            expect(treeGrid.getCellByColumn(8, 'Name').value).toEqual('Ana Sanders');
            expect(treeGrid.getCellByColumn(1, 'Name').value).toEqual('Michael Langdon');
        }));
    });
});
