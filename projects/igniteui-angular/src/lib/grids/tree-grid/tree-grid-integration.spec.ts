import { async, TestBed } from '@angular/core/testing';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridModule } from './index';
import {
    IgxTreeGridSimpleComponent, IgxTreeGridPrimaryForeignKeyComponent,
    IgxTreeGridStringTreeColumnComponent, IgxTreeGridDateTreeColumnComponent, IgxTreeGridBooleanTreeColumnComponent
} from '../test-utils/tree-grid-components.spec';
import { TreeGridFunctions } from '../test-utils/tree-grid-functions.spec';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { By } from '@angular/platform-browser';

describe('IgxTreeGrid - Integration', () => {
    let fix;
    let treeGrid: IgxTreeGridComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSimpleComponent,
                IgxTreeGridPrimaryForeignKeyComponent,
                IgxTreeGridStringTreeColumnComponent,
                IgxTreeGridDateTreeColumnComponent,
                IgxTreeGridBooleanTreeColumnComponent
            ],
            imports: [IgxTreeGridModule]
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
});
