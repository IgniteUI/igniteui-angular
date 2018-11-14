import { async, TestBed } from '@angular/core/testing';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridModule } from './index';
import { IgxTreeGridSortingComponent } from '../../test-utils/tree-grid-components.spec';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';

describe('IgxTreeGrid - Sorting', () => {
    configureTestSuite();
    let fix;
    let treeGrid: IgxTreeGridComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSortingComponent
            ],
            imports: [IgxTreeGridModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fix = TestBed.createComponent(IgxTreeGridSortingComponent);
        fix.detectChanges();
        treeGrid = fix.componentInstance.treeGrid;
    });

    describe('API sorting', () => {
        it('should sort descending all treeGrid levels by column name through API', () => {
            treeGrid.sort({ fieldName: 'Name', dir: SortingDirection.Desc, ignoreCase: false,
                strategy: DefaultSortingStrategy.instance() });
            fix.detectChanges();

            // Verify first level records are desc sorted
            expect(treeGrid.getCellByColumn(0, 'Name').value).toEqual('Yang Wang');
            expect(treeGrid.getCellByColumn(1, 'Name').value).toEqual('John Winchester');
            expect(treeGrid.getCellByColumn(8, 'Name').value).toEqual('Ana Sanders');

            // Verify second level records are desc sorted
            expect(treeGrid.getCellByColumn(2, 'Name').value).toEqual('Thomas Hardy');
            expect(treeGrid.getCellByColumn(3, 'Name').value).toEqual('Monica Reyes');
            expect(treeGrid.getCellByColumn(7, 'Name').value).toEqual('Michael Langdon');

            // Verify third level records are desc sorted
            expect(treeGrid.getCellByColumn(4, 'Name').value).toEqual('Sven Ottlieb');
            expect(treeGrid.getCellByColumn(5, 'Name').value).toEqual('Roland Mendel');
            expect(treeGrid.getCellByColumn(6, 'Name').value).toEqual('Peter Lewis');
        });

        it('should sort ascending all treeGrid levels by column name through API', () => {
            treeGrid.sort({ fieldName: 'Age', dir: SortingDirection.Asc, ignoreCase: false, strategy: DefaultSortingStrategy.instance() });
            fix.detectChanges();

            // Verify first level records are asc sorted
            expect(treeGrid.getCellByColumn(0, 'Age').value).toEqual(42);
            expect(treeGrid.getCellByColumn(2, 'Age').value).toEqual(55);
            expect(treeGrid.getCellByColumn(9, 'Age').value).toEqual(61);

            // Verify second level records are asc sorted
            expect(treeGrid.getCellByColumn(3, 'Age').value).toEqual(29);
            expect(treeGrid.getCellByColumn(4, 'Age').value).toEqual(30);
            expect(treeGrid.getCellByColumn(5, 'Age').value).toEqual(31);

            // Verify third level records are asc sorted
            expect(treeGrid.getCellByColumn(6, 'Age').value).toEqual(25);
            expect(treeGrid.getCellByColumn(7, 'Age').value).toEqual(35);
            expect(treeGrid.getCellByColumn(8, 'Age').value).toEqual(44);
        });

        it('should not sort treeGrid when trying to sort by invalid column through API', () => {
            treeGrid.sort({ fieldName: 'TEST', dir: SortingDirection.Desc, ignoreCase: false,
                strategy: DefaultSortingStrategy.instance() });
            fix.detectChanges();

            // Verify first level records with default order
            expect(treeGrid.getCellByColumn(0, 'Name').value).toEqual('John Winchester');
            expect(treeGrid.getCellByColumn(7, 'Name').value).toEqual('Yang Wang');
            expect(treeGrid.getCellByColumn(8, 'Name').value).toEqual('Ana Sanders');

            // Verify second level records with default order
            expect(treeGrid.getCellByColumn(1, 'Name').value).toEqual('Michael Langdon');
            expect(treeGrid.getCellByColumn(2, 'Name').value).toEqual('Thomas Hardy');
            expect(treeGrid.getCellByColumn(3, 'Name').value).toEqual('Monica Reyes');

            // Verify third level records with default order
            expect(treeGrid.getCellByColumn(4, 'Name').value).toEqual('Roland Mendel');
            expect(treeGrid.getCellByColumn(5, 'Name').value).toEqual('Sven Ottlieb');
            expect(treeGrid.getCellByColumn(6, 'Name').value).toEqual('Peter Lewis');
        });

        it('should clear sorting of treeGrid through API', () => {
            // Verify first record of all 3 levels (default layout)
            expect(treeGrid.getCellByColumn(0, 'Age').value).toEqual(55);
            expect(treeGrid.getCellByColumn(1, 'Age').value).toEqual(30);
            expect(treeGrid.getCellByColumn(4, 'Age').value).toEqual(35);

            treeGrid.sort({ fieldName: 'Age', dir: SortingDirection.Asc, ignoreCase: false, strategy: DefaultSortingStrategy.instance() });
            fix.detectChanges();

            // Verify first record of all 3 levels (sorted layout)
            expect(treeGrid.getCellByColumn(0, 'Age').value).toEqual(42);
            expect(treeGrid.getCellByColumn(3, 'Age').value).toEqual(29);
            expect(treeGrid.getCellByColumn(6, 'Age').value).toEqual(25);

            treeGrid.clearSort();
            fix.detectChanges();

            // Verify first record of all 3 levels (default layout)
            expect(treeGrid.getCellByColumn(0, 'Age').value).toEqual(55);
            expect(treeGrid.getCellByColumn(1, 'Age').value).toEqual(30);
            expect(treeGrid.getCellByColumn(4, 'Age').value).toEqual(35);
        });

        it('should sort treeGrid by multiple expressions through API', () => {
            // Test prerequisites (need to have multiple records with the same name on every level)
            treeGrid.data[0].Name = 'Ana Sanders';
            treeGrid.data[0].Employees[1].Name = 'Michael Langdon';
            treeGrid.data[0].Employees[2].Employees[0].Name = 'Peter Lewis';
            fix.detectChanges();

            const exprs = [
                { fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: true, strategy: DefaultSortingStrategy.instance() },
                { fieldName: 'Age', dir: SortingDirection.Desc, ignoreCase: true, strategy: DefaultSortingStrategy.instance() }
            ];

            treeGrid.sort(exprs);
            fix.detectChanges();

            expect(treeGrid.sortingExpressions.length).toBe(2);

            // Verify first level multiple expressions sorting
            expect(treeGrid.getCellByColumn(0, 'Name').value).toEqual('Ana Sanders');
            expect(treeGrid.getCellByColumn(0, 'Age').value).toEqual(55);

            expect(treeGrid.getCellByColumn(7, 'Name').value).toEqual('Ana Sanders');
            expect(treeGrid.getCellByColumn(7, 'Age').value).toEqual(42);

            expect(treeGrid.getCellByColumn(9, 'Name').value).toEqual('Yang Wang');
            expect(treeGrid.getCellByColumn(9, 'Age').value).toEqual(61);

            // Verify second level multiple expressions sorting
            expect(treeGrid.getCellByColumn(1, 'Name').value).toEqual('Michael Langdon');
            expect(treeGrid.getCellByColumn(1, 'Age').value).toEqual(30);

            expect(treeGrid.getCellByColumn(2, 'Name').value).toEqual('Michael Langdon');
            expect(treeGrid.getCellByColumn(2, 'Age').value).toEqual(29);

            expect(treeGrid.getCellByColumn(3, 'Name').value).toEqual('Monica Reyes');
            expect(treeGrid.getCellByColumn(3, 'Age').value).toEqual(31);

            // Verify third level multiple expressions sorting
            expect(treeGrid.getCellByColumn(4, 'Name').value).toEqual('Peter Lewis');
            expect(treeGrid.getCellByColumn(4, 'Age').value).toEqual(35);

            expect(treeGrid.getCellByColumn(5, 'Name').value).toEqual('Peter Lewis');
            expect(treeGrid.getCellByColumn(5, 'Age').value).toEqual(25);

            expect(treeGrid.getCellByColumn(6, 'Name').value).toEqual('Sven Ottlieb');
            expect(treeGrid.getCellByColumn(6, 'Age').value).toEqual(44);
        });

        it('should clear sorting of treeGrid for one column only through API', () => {
            // Test prerequisites (need to have multiple records with the same name on every level)
            treeGrid.getCellByColumn(0, 'Name').value = 'Ana Sanders';
            treeGrid.getCellByColumn(2, 'Name').value = 'Michael Langdon';
            treeGrid.getCellByColumn(4, 'Name').value = 'Peter Lewis';
            fix.detectChanges();

            const exprs = [
                { fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: true, strategy: DefaultSortingStrategy.instance() },
                { fieldName: 'Age', dir: SortingDirection.Desc, ignoreCase: true, strategy: DefaultSortingStrategy.instance() }
            ];

            treeGrid.sort(exprs);
            fix.detectChanges();

            treeGrid.clearSort('Name');
            fix.detectChanges();

            expect(treeGrid.sortingExpressions.length).toBe(1);

            // Verify first level single expression sorting
            expect(treeGrid.getCellByColumn(0, 'Age').value).toEqual(61);
            expect(treeGrid.getCellByColumn(1, 'Age').value).toEqual(55);
            expect(treeGrid.getCellByColumn(8, 'Age').value).toEqual(42);

            // Verify second level single expression sorting
            expect(treeGrid.getCellByColumn(2, 'Age').value).toEqual(31);
            expect(treeGrid.getCellByColumn(6, 'Age').value).toEqual(30);
            expect(treeGrid.getCellByColumn(7, 'Age').value).toEqual(29);

            // Verify third level single expression sorting
            expect(treeGrid.getCellByColumn(3, 'Age').value).toEqual(44);
            expect(treeGrid.getCellByColumn(4, 'Age').value).toEqual(35);
            expect(treeGrid.getCellByColumn(5, 'Age').value).toEqual(25);
        });
    });

    describe('UI sorting', () => {
        it('should sort descending all treeGrid levels by column name through UI', () => {
            TreeGridFunctions.clickHeaderCell(fix, 'Name');
            TreeGridFunctions.clickHeaderCell(fix, 'Name');
            fix.detectChanges();

            // Verify first level records are desc sorted
            expect(treeGrid.getCellByColumn(0, 'Name').value).toEqual('Yang Wang');
            expect(treeGrid.getCellByColumn(1, 'Name').value).toEqual('John Winchester');
            expect(treeGrid.getCellByColumn(8, 'Name').value).toEqual('Ana Sanders');

            // Verify second level records are desc sorted
            expect(treeGrid.getCellByColumn(2, 'Name').value).toEqual('Thomas Hardy');
            expect(treeGrid.getCellByColumn(3, 'Name').value).toEqual('Monica Reyes');
            expect(treeGrid.getCellByColumn(7, 'Name').value).toEqual('Michael Langdon');

            // Verify third level records are desc sorted
            expect(treeGrid.getCellByColumn(4, 'Name').value).toEqual('Sven Ottlieb');
            expect(treeGrid.getCellByColumn(5, 'Name').value).toEqual('Roland Mendel');
            expect(treeGrid.getCellByColumn(6, 'Name').value).toEqual('Peter Lewis');
        });

        it('should sort ascending all treeGrid levels by column name through UI', () => {
            TreeGridFunctions.clickHeaderCell(fix, 'Age');
            fix.detectChanges();

            // Verify first level records are asc sorted
            expect(treeGrid.getCellByColumn(0, 'Age').value).toEqual(42);
            expect(treeGrid.getCellByColumn(2, 'Age').value).toEqual(55);
            expect(treeGrid.getCellByColumn(9, 'Age').value).toEqual(61);

            // Verify second level records are asc sorted
            expect(treeGrid.getCellByColumn(3, 'Age').value).toEqual(29);
            expect(treeGrid.getCellByColumn(4, 'Age').value).toEqual(30);
            expect(treeGrid.getCellByColumn(5, 'Age').value).toEqual(31);

            // Verify third level records are asc sorted
            expect(treeGrid.getCellByColumn(6, 'Age').value).toEqual(25);
            expect(treeGrid.getCellByColumn(7, 'Age').value).toEqual(35);
            expect(treeGrid.getCellByColumn(8, 'Age').value).toEqual(44);
        });

        it('should clear sorting of treeGrid when header cell is clicked 3 times through UI', () => {
            // Verify first record of all 3 levels (default layout)
            expect(treeGrid.getCellByColumn(0, 'Age').value).toEqual(55);
            expect(treeGrid.getCellByColumn(1, 'Age').value).toEqual(30);
            expect(treeGrid.getCellByColumn(4, 'Age').value).toEqual(35);

            // Click header once
            TreeGridFunctions.clickHeaderCell(fix, 'Age');
            fix.detectChanges();

            // Verify first record of all 3 levels (sorted layout)
            expect(treeGrid.getCellByColumn(0, 'Age').value).toEqual(42);
            expect(treeGrid.getCellByColumn(3, 'Age').value).toEqual(29);
            expect(treeGrid.getCellByColumn(6, 'Age').value).toEqual(25);

            // Click header two more times
            TreeGridFunctions.clickHeaderCell(fix, 'Age');
            fix.detectChanges();
            TreeGridFunctions.clickHeaderCell(fix, 'Age');
            fix.detectChanges();

            // Verify first record of all 3 levels (default layout)
            expect(treeGrid.getCellByColumn(0, 'Age').value).toEqual(55);
            expect(treeGrid.getCellByColumn(1, 'Age').value).toEqual(30);
            expect(treeGrid.getCellByColumn(4, 'Age').value).toEqual(35);
        });

        it('should sort treeGrid by multiple expressions through UI', () => {
            // Test prerequisites (need to have multiple records with the same name on every level)
            treeGrid.data[0].Name = 'Ana Sanders';
            treeGrid.data[0].Employees[1].Name = 'Michael Langdon';
            treeGrid.data[0].Employees[2].Employees[0].Name = 'Peter Lewis';
            fix.detectChanges();

            // Sort by 'Name' in asc order and by 'Age' in desc order
            TreeGridFunctions.clickHeaderCell(fix, 'Name');
            fix.detectChanges();
            TreeGridFunctions.clickHeaderCell(fix, 'Age');
            fix.detectChanges();
            TreeGridFunctions.clickHeaderCell(fix, 'Age');
            fix.detectChanges();

            expect(treeGrid.sortingExpressions.length).toBe(2);

            // Verify first level multiple expressions sorting
            expect(treeGrid.getCellByColumn(0, 'Name').value).toEqual('Ana Sanders');
            expect(treeGrid.getCellByColumn(0, 'Age').value).toEqual(55);

            expect(treeGrid.getCellByColumn(7, 'Name').value).toEqual('Ana Sanders');
            expect(treeGrid.getCellByColumn(7, 'Age').value).toEqual(42);

            expect(treeGrid.getCellByColumn(9, 'Name').value).toEqual('Yang Wang');
            expect(treeGrid.getCellByColumn(9, 'Age').value).toEqual(61);

            // Verify second level multiple expressions sorting
            expect(treeGrid.getCellByColumn(1, 'Name').value).toEqual('Michael Langdon');
            expect(treeGrid.getCellByColumn(1, 'Age').value).toEqual(30);

            expect(treeGrid.getCellByColumn(2, 'Name').value).toEqual('Michael Langdon');
            expect(treeGrid.getCellByColumn(2, 'Age').value).toEqual(29);

            expect(treeGrid.getCellByColumn(3, 'Name').value).toEqual('Monica Reyes');
            expect(treeGrid.getCellByColumn(3, 'Age').value).toEqual(31);

            // Verify third level multiple expressions sorting
            expect(treeGrid.getCellByColumn(4, 'Name').value).toEqual('Peter Lewis');
            expect(treeGrid.getCellByColumn(4, 'Age').value).toEqual(35);

            expect(treeGrid.getCellByColumn(5, 'Name').value).toEqual('Peter Lewis');
            expect(treeGrid.getCellByColumn(5, 'Age').value).toEqual(25);

            expect(treeGrid.getCellByColumn(6, 'Name').value).toEqual('Sven Ottlieb');
            expect(treeGrid.getCellByColumn(6, 'Age').value).toEqual(44);
        });

        it('should clear sorting of treeGrid for one column only through UI', () => {
            // Test prerequisites (need to have multiple records with the same name on every level)
            treeGrid.getCellByColumn(0, 'Name').value = 'Ana Sanders';
            treeGrid.getCellByColumn(2, 'Name').value = 'Michael Langdon';
            treeGrid.getCellByColumn(4, 'Name').value = 'Peter Lewis';
            fix.detectChanges();

            // Sort by 'Name' in asc order and by 'Age' in desc order
            TreeGridFunctions.clickHeaderCell(fix, 'Name');
            fix.detectChanges();
            TreeGridFunctions.clickHeaderCell(fix, 'Age');
            fix.detectChanges();
            TreeGridFunctions.clickHeaderCell(fix, 'Age');
            fix.detectChanges();

            // Clear sorting for 'Name' column
            TreeGridFunctions.clickHeaderCell(fix, 'Name');
            fix.detectChanges();
            TreeGridFunctions.clickHeaderCell(fix, 'Name');
            fix.detectChanges();

            expect(treeGrid.sortingExpressions.length).toBe(1);

            // Verify first level single expression sorting
            expect(treeGrid.getCellByColumn(0, 'Age').value).toEqual(61);
            expect(treeGrid.getCellByColumn(1, 'Age').value).toEqual(55);
            expect(treeGrid.getCellByColumn(8, 'Age').value).toEqual(42);

            // Verify second level single expression sorting
            expect(treeGrid.getCellByColumn(2, 'Age').value).toEqual(31);
            expect(treeGrid.getCellByColumn(6, 'Age').value).toEqual(30);
            expect(treeGrid.getCellByColumn(7, 'Age').value).toEqual(29);

            // Verify third level single expression sorting
            expect(treeGrid.getCellByColumn(3, 'Age').value).toEqual(44);
            expect(treeGrid.getCellByColumn(4, 'Age').value).toEqual(35);
            expect(treeGrid.getCellByColumn(5, 'Age').value).toEqual(25);
        });
    });
});
