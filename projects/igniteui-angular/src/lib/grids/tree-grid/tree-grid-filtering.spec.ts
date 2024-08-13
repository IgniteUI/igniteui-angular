
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridComponent } from './public_api';
import { IgxTreeGridFilteringComponent, IgxTreeGridFilteringESFTemplatesComponent, IgxTreeGridFilteringRowEditingComponent } from '../../test-utils/tree-grid-components.spec';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxStringFilteringOperand, IgxNumberFilteringOperand, IgxDateFilteringOperand } from '../../data-operations/filtering-condition';
import { FilteringStrategy } from '../../data-operations/filtering-strategy';
import { TreeGridFilteringStrategy, TreeGridFormattedValuesFilteringStrategy, TreeGridMatchingRecordsOnlyFilteringStrategy } from './tree-grid.filtering.strategy';
import { FilterMode } from '../common/enums';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { By } from '@angular/platform-browser';

const IGX_CHECKBOX_LABEL = '.igx-checkbox__label';

describe('IgxTreeGrid - Filtering actions #tGrid', () => {
    configureTestSuite();
    let fix;
    let grid;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxTreeGridFilteringComponent,
                IgxTreeGridFilteringRowEditingComponent,
                IgxTreeGridFilteringESFTemplatesComponent
            ]
        }).compileComponents();
    }));

    beforeEach(waitForAsync(() => {
        fix = TestBed.createComponent(IgxTreeGridFilteringComponent);
        fix.detectChanges();
        grid = fix.componentInstance.treeGrid;
    }));

    it('should correctly filter a string column using the \'contains\' filtering conditions', () => {
        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(i))).toEqual(true);
        }

        grid.filter('Name', 'an', IgxStringFilteringOperand.instance().condition('contains'), true);
        fix.detectChanges();

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(0))).toEqual(true);
        expect(grid.getCellByColumn(0, 'Name').value).toEqual('John Winchester');

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(1))).toEqual(true);
        expect(grid.getCellByColumn(1, 'Name').value).toEqual('Michael Langdon');

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(2))).toEqual(true);
        expect(grid.getCellByColumn(2, 'Name').value).toEqual('Monica Reyes');

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(3))).toEqual(true);
        expect(grid.getCellByColumn(3, 'Name').value).toEqual('Roland Mendel');

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(4))).toEqual(true);
        expect(grid.getCellByColumn(4, 'Name').value).toEqual('Ana Sanders');

        grid.clearFilter();
        fix.detectChanges();

        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(i))).toEqual(true);
        }
    });

    it('should correctly filter a string column using the \'endswith\' filtering conditions', () => {
        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(i))).toEqual(true);
        }

        grid.filter('Name', 'n', IgxStringFilteringOperand.instance().condition('endsWith'), true);
        fix.detectChanges();

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(0))).toEqual(true);
        expect(grid.getCellByColumn(0, 'Name').value).toEqual('John Winchester');

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(1))).toEqual(true);
        expect(grid.getCellByColumn(1, 'Name').value).toEqual('Michael Langdon');

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(2))).toEqual(true);
        expect(grid.getCellByColumn(2, 'Name').value).toEqual('Ana Sanders');

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(3))).toEqual(true);
        expect(grid.getCellByColumn(3, 'Name').value).toEqual('Laurence Johnson');

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(4))).toEqual(true);
        expect(grid.getCellByColumn(4, 'Name').value).toEqual('Victoria Lincoln');

        grid.clearFilter();
        fix.detectChanges();

        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(i))).toEqual(true);
        }
    });

    it('should correctly filter a number column using the \'greaterThan\' filtering conditions', () => {
        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(i))).toEqual(true);
        }

        grid.filter('ID', 500, IgxNumberFilteringOperand.instance().condition('greaterThan'));
        fix.detectChanges();

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(0))).toEqual(true);
        expect(grid.getCellByColumn(0, 'ID').value).toEqual(147);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(1))).toEqual(true);
        expect(grid.getCellByColumn(1, 'ID').value).toEqual(957);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(2))).toEqual(true);
        expect(grid.getCellByColumn(2, 'ID').value).toEqual(317);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(3))).toEqual(true);
        expect(grid.getCellByColumn(3, 'ID').value).toEqual(711);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(4))).toEqual(true);
        expect(grid.getCellByColumn(4, 'ID').value).toEqual(998);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(5))).toEqual(true);
        expect(grid.getCellByColumn(5, 'ID').value).toEqual(847);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(6))).toEqual(true);
        expect(grid.getCellByColumn(6, 'ID').value).toEqual(663);

        grid.clearFilter();
        fix.detectChanges();

        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(i))).toEqual(true);
        }
    });

    it('should correctly filter a number column using the \'lessThan\' filtering conditions', () => {
        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(i))).toEqual(true);
        }

        grid.filter('ID', 200, IgxNumberFilteringOperand.instance().condition('lessThan'));
        fix.detectChanges();

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(0))).toEqual(true);
        expect(grid.getCellByColumn(0, 'ID').value).toEqual(147);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(1))).toEqual(true);
        expect(grid.getCellByColumn(1, 'ID').value).toEqual(847);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(2))).toEqual(true);
        expect(grid.getCellByColumn(2, 'ID').value).toEqual(663);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(3))).toEqual(true);
        expect(grid.getCellByColumn(3, 'ID').value).toEqual(141);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(4))).toEqual(true);
        expect(grid.getCellByColumn(4, 'ID').value).toEqual(19);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(5))).toEqual(true);
        expect(grid.getCellByColumn(5, 'ID').value).toEqual(15);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(6))).toEqual(true);
        expect(grid.getCellByColumn(6, 'ID').value).toEqual(17);

        grid.clearFilter();
        fix.detectChanges();

        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(i))).toEqual(true);
        }
    });

    it('should correctly filter a date column using the \'before\' filtering conditions', () => {
        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(i))).toEqual(true);
        }

        grid.filter('HireDate', new Date(2010, 6, 25), IgxDateFilteringOperand.instance().condition('before'));
        fix.detectChanges();

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(0))).toEqual(true);
        expect(grid.getCellByColumn(0, 'ID').value).toEqual(147);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(1))).toEqual(true);
        expect(grid.getCellByColumn(1, 'ID').value).toEqual(957);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(2))).toEqual(true);
        expect(grid.getCellByColumn(2, 'ID').value).toEqual(317);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(3))).toEqual(true);
        expect(grid.getCellByColumn(3, 'ID').value).toEqual(998);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(4))).toEqual(true);
        expect(grid.getCellByColumn(4, 'ID').value).toEqual(847);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(5))).toEqual(true);
        expect(grid.getCellByColumn(5, 'ID').value).toEqual(663);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(6))).toEqual(true);
        expect(grid.getCellByColumn(6, 'ID').value).toEqual(141);

        grid.clearFilter();
        fix.detectChanges();

        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(i))).toEqual(true);
        }
    });

    it('should correctly filter a date column using the \'after\' filtering conditions', () => {
        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(i))).toEqual(true);
        }

        grid.filter('HireDate', new Date(2015, 6, 25), IgxDateFilteringOperand.instance().condition('after'));
        fix.detectChanges();

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(0))).toEqual(true);
        expect(grid.getCellByColumn(0, 'ID').value).toEqual(147);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(1))).toEqual(true);
        expect(grid.getCellByColumn(1, 'ID').value).toEqual(317);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(2))).toEqual(true);
        expect(grid.getCellByColumn(2, 'ID').value).toEqual(711);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(3))).toEqual(true);
        expect(grid.getCellByColumn(3, 'ID').value).toEqual(847);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(4))).toEqual(true);
        expect(grid.getCellByColumn(4, 'ID').value).toEqual(663);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(5))).toEqual(true);
        expect(grid.getCellByColumn(5, 'ID').value).toEqual(17);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.gridAPI.get_row_by_index(6))).toEqual(true);
        expect(grid.getCellByColumn(6, 'ID').value).toEqual(12);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(7))).toEqual(true);
        expect(grid.getCellByColumn(7, 'ID').value).toEqual(109);

        grid.clearFilter();
        fix.detectChanges();

        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.gridAPI.get_row_by_index(i))).toEqual(true);
        }
    });

    it('should allow row collapsing after filtering is applied', () => {
        grid.filter('Name', 'an', IgxStringFilteringOperand.instance().condition('contains'), true);
        fix.detectChanges();

        // check initial rows count after applying filtering
        let rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(10);

        // collapse first row
        grid.toggleRow(grid.getRowByIndex(0).key);
        fix.detectChanges();
        rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(7);
    });

    it('should update expand indicator after filtering is applied', () => {
        grid.filter('ID', 147, IgxStringFilteringOperand.instance().condition('equals'), true);
        fix.detectChanges();

        let rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(1);
        TreeGridFunctions.verifyTreeRowExpandIndicatorVisibility(rows[0], 'hidden');

        grid.clearFilter('ID');
        fix.detectChanges();

        rows = TreeGridFunctions.getAllRows(fix);
        TreeGridFunctions.verifyTreeRowExpandIndicatorVisibility(rows[0]);
        TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[0]);
    });

    it('should filter cell by its formatted data when using FormattedValuesFilteringStrategy', () => {
        const formattedStrategy = new TreeGridFormattedValuesFilteringStrategy();
        grid.filterStrategy = formattedStrategy;
        const idFormatter = (val: number): number => val % 2;
        grid.columnList.get(0).formatter = idFormatter;
        fix.detectChanges();

        grid.filter('ID', 0, IgxNumberFilteringOperand.instance().condition('equals'));
        fix.detectChanges();
        let rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toEqual(5, 'Wrong rows count');

        grid.filter('ID', 1, IgxNumberFilteringOperand.instance().condition('equals'));
        fix.detectChanges();
        rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toEqual(17, 'Wrong rows count');
    });

    it('\'Blanks\' should be always visible', fakeAsync(() => {
        const formattedStrategy = new TreeGridFormattedValuesFilteringStrategy();
        grid.filterStrategy = formattedStrategy;
        const idFormatter = (val: Date): string => {
            if (val) {
                if (val.getFullYear() <= 2010) {
                    return 'Senior';
                } else if (val.getFullYear() < 2014) {
                    return 'Middle';
                } else {
                    return 'Junior';
                }
            } else {
                return null;
            }
        };
        const newData = SampleTestData.employeeTreeData();
        newData[0].HireDate = null;
        newData[1].HireDate = null;

        grid.data = newData;
        grid.allowFiltering = true;
        grid.filterMode = FilterMode.excelStyleFilter;
        grid.columnList.get(2).formatter = idFormatter;
        grid.columnList.get(2).dataType = 'string';
        fix.detectChanges();

        GridFunctions.clickExcelFilterIcon(fix, 'HireDate');
        tick();
        fix.detectChanges();
        let searchComponent = GridFunctions.getExcelFilteringSearchComponent(fix, null, 'igx-tree-grid');
        let items = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
        expect(items.length).toBe(5);
        expect(items[1].textContent).toBe(' (Blanks) ');

        const checkboxes = GridFunctions.getExcelStyleFilteringCheckboxes(fix, null, 'igx-tree-grid');
        checkboxes[0].click();
        checkboxes[2].click();
        tick();
        GridFunctions.clickApplyExcelStyleFiltering(fix, null, 'igx-tree-grid');
        fix.detectChanges();

        GridFunctions.clickExcelFilterIcon(fix, 'HireDate');
        tick();
        fix.detectChanges();
        searchComponent = GridFunctions.getExcelFilteringSearchComponent(fix, null, 'igx-tree-grid');
        items = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
        expect(items.length).toBe(5);
        expect(items[1].textContent).toBe(' (Blanks) ');
    }));

    describe('Tree grid ESF', () => {
        let tGrid: IgxTreeGridComponent;

        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridFilteringComponent);
            tGrid = fix.componentInstance.treeGrid;

            const hierarchicalFilterStrategy = new TreeGridFilteringStrategy(['ID']);
            tGrid.filterStrategy = hierarchicalFilterStrategy;
            tGrid.allowFiltering = true;
            tGrid.filterMode = FilterMode.excelStyleFilter;
            fix.detectChanges();
        }));

        it('Should render and expand tree nodes correctly', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            let treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fix, null);
            expect(treeItems.length).toBe(4, 'incorrect rendered tree node count');

            GridFunctions.clickExcelTreeNodeExpandIcon(fix, 0);
            fix.detectChanges();
            tick();

            treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fix, null);
            expect(treeItems.length).toBe(6, 'incorrect rendered tree node count');
        }));

        it('Should change arrow icon on expand', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            const icon = GridFunctions.getExcelFilterTreeNodeIcon(fix, 0);
            let iconText = icon.children[0].innerText;
            expect(iconText).toBe('chevron_right', 'incorrect rendered icon');

            GridFunctions.clickExcelTreeNodeExpandIcon(fix, 0);
            fix.detectChanges();
            tick();

            iconText = icon.children[0].innerText;
            expect(iconText).toBe('expand_more', 'incorrect rendered icon');
        }));

        it('Should display Select All item', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            const label = fix.debugElement.queryAll(By.css(IGX_CHECKBOX_LABEL))[0].nativeElement;
            expect(label.innerText).toBe('Select All');
        }));

        it('Should display "Add current selection to filter" item correctly', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent, 'igx-tree-grid');
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '1', fix);
            fix.detectChanges();
            tick();

            const label = fix.debugElement.queryAll(By.css(IGX_CHECKBOX_LABEL))[1].nativeElement;
            expect(label.innerText).toBe('Add current selection to filter');
        }));

        it('Should set indeterminate state correctly', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            GridFunctions.clickExcelTreeNodeExpandIcon(fix, 0);
            fix.detectChanges();
            tick();

            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix, 'igx-tree-grid');

            let checkboxes: any[] = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu, 'igx-tree-grid');
            checkboxes[2].parentElement.click();
            fix.detectChanges();
            tick();

            checkboxes = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu, 'igx-tree-grid'));
            expect(checkboxes[0].indeterminate && !checkboxes[0].checked).toBe(true);
            expect(checkboxes[1].indeterminate && !checkboxes[1].checked).toBe(true);
            expect(checkboxes[2].checked).toBe(false);

            // Click Select All twice to deselect all items and check only one child item
            checkboxes[0].click();
            checkboxes[0].click();
            fix.detectChanges();
            tick();

            checkboxes[2].click();
            fix.detectChanges();
            tick();

            // Apply changes and open excel style filter dialog
            GridFunctions.clickApplyExcelStyleFiltering(fix, null, 'igx-tree-grid');
            fix.detectChanges();
            tick();

            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            // Verify Select All is indeterminate
            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix, 'igx-tree-grid');
            checkboxes = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu, 'igx-tree-grid'));
            expect(checkboxes[0].indeterminate).toBe(true);
        }));

        it('Should filter items and clear the search component correctly', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');

            let treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fix, searchComponent);
            expect(treeItems.length).toBe(4, 'incorrect rendered items count');

            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent, 'igx-tree-grid');
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '6', fix);
            fix.detectChanges();
            tick();

            treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fix, searchComponent);
            expect(treeItems.length).toBe(2, 'incorrect rendered items count');

            const clearIcon: any = Array.from(searchComponent.querySelectorAll('igx-icon'))
                .find((icon: any) => icon.innerText === 'clear');

            clearIcon.click();
            fix.detectChanges();

            treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fix, searchComponent);
            expect(treeItems.length).toBe(4, 'incorrect rendered items count');
        }));

        it('Should filter items and clear filters correctly', fakeAsync(() => {
            let gridCellValues = GridFunctions.getColumnCells(fix, 'ID', 'igx-tree-grid-cell')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(18);

            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            let searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');
            let treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fix, searchComponent);
            expect(treeItems.length).toBe(4, 'incorrect rendered items count');

            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent, 'igx-tree-grid');
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '8', fix);
            fix.detectChanges();
            tick();

            treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fix, searchComponent);
            expect(treeItems.length).toBe(4, 'incorrect rendered items count');

            GridFunctions.clickApplyExcelStyleFiltering(fix, null, 'igx-tree-grid');
            fix.detectChanges();
            tick();

            gridCellValues = GridFunctions.getColumnCells(fix, 'ID', 'igx-tree-grid-cell')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(7);

            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix, 'igx-tree-grid');
            const btn = GridFunctions.getExcelFilteringClearFiltersComponent(fix, excelMenu);
            const clearIcon: any = btn.querySelector('igx-icon');
            clearIcon.click();
            fix.detectChanges();
            tick();

            searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');
            treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fix, searchComponent);
            expect(treeItems.length).toBe(4, 'incorrect rendered tree node items count');

            GridFunctions.clickApplyExcelStyleFiltering(fix, null, 'igx-tree-grid');
            fix.detectChanges();
            tick();

            gridCellValues = GridFunctions.getColumnCells(fix, 'ID', 'igx-tree-grid-cell')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(18, 'incorrect rendered grid items count');
        }));

        it('Should update checkboxes after clearing column filters correctly', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            let searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');

            let inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent, 'igx-tree-grid');
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '8', fix);
            fix.detectChanges();
            tick();

            GridFunctions.clickApplyExcelStyleFiltering(fix, null, 'igx-tree-grid');
            fix.detectChanges();
            tick();

            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix, 'igx-tree-grid');
            const btn = GridFunctions.getExcelFilteringClearFiltersComponent(fix, excelMenu);
            const clearIcon: any = btn.querySelector('igx-icon');
            clearIcon.click();
            fix.detectChanges();
            tick();

            let checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu, 'igx-tree-grid'));
            checkboxes.forEach(ch => expect(ch.checked).toBe(true, 'incorrect checkbox state'));

            searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');
            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent, 'igx-tree-grid');
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '8', fix);
            fix.detectChanges();
            tick();

            checkboxes = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu, 'igx-tree-grid'));
            const addToFilterCheckbox = checkboxes.splice(1,1)[0];

            expect(addToFilterCheckbox.checked).toBe(false, 'incorrect checkbox state')
            checkboxes.forEach(ch => expect(ch.checked).toBe(true, 'incorrect checkbox state'));
        }));

        it('Should filter tree grid correctly', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent, 'igx-tree-grid');

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '6', fix);
            fix.detectChanges();
            tick();

            const treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fix, searchComponent);
            expect(treeItems.length).toEqual(2, 'incorrect rendered items count');

            GridFunctions.clickApplyExcelStyleFiltering(fix, null, 'igx-tree-grid');
            fix.detectChanges();
            tick();

            const gridCellValues = GridFunctions.getColumnCells(fix, 'ID', 'igx-tree-grid-cell')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(3);

            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix, 'igx-tree-grid');
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu, 'igx-tree-grid'));
            expect(!checkboxes[1].checked && !checkboxes[2].checked && !checkboxes[3].checked && checkboxes[4].indeterminate).toBe(true);
        }));

        it('Should add list items to current filtered items when "Add current selection to filter" is selected', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            let searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');
            let inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent, 'igx-tree-grid');

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '6', fix);
            fix.detectChanges();
            tick();

            GridFunctions.clickApplyExcelStyleFiltering(fix, null, 'igx-tree-grid');
            fix.detectChanges();
            tick();

            let gridCellValues = GridFunctions.getColumnCells(fix, 'ID', 'igx-tree-grid-cell')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(3);

            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');
            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent, 'igx-tree-grid');

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '15', fix);
            fix.detectChanges();
            tick();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix, 'igx-tree-grid');
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu, 'igx-tree-grid')[1];
            checkbox.click();
            fix.detectChanges();
            tick();

            GridFunctions.clickApplyExcelStyleFiltering(fix, null, 'igx-tree-grid');
            fix.detectChanges();
            tick();

            gridCellValues = GridFunctions.getColumnCells(fix, 'ID', 'igx-tree-grid-cell')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(5);
        }));

        it('Should display message when search results are empty', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent, 'igx-tree-grid');

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '77', fix);
            fix.detectChanges();
            tick();

            const emptyTextEl = searchComponent.querySelector('.igx-excel-filter__empty');
            expect(emptyTextEl.innerText).toEqual('No matches');
        }));

        it('Should display message when there is no data', fakeAsync(() => {
            const data = tGrid.data;
            tGrid.data = [];
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            let searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');
            let emptyTextEl = searchComponent.querySelector('.igx-excel-filter__empty');
            expect(emptyTextEl.innerText).toEqual('No matches');

            tGrid.data = data;
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');
            emptyTextEl = searchComponent.querySelector('.igx-excel-filter__empty');
            expect(emptyTextEl).toBeFalsy();

        }));

        it('Should display message when the last row is deleted', fakeAsync(() => {
            tGrid.data = [];
            tGrid.primaryKey = 'ID';
            const row = {
                ID: 0,
                Name: 'John Winchester',
                HireDate: new Date(2008, 3, 20),
                Age: 55,
                OnPTO: false,
                Employees: []
            };
            tGrid.addRow(row);
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            let searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');
            let emptyTextEl = searchComponent.querySelector('.igx-excel-filter__empty');
            expect(emptyTextEl).toBeFalsy();

            tGrid.deleteRowById(0);
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');
            emptyTextEl = searchComponent.querySelector('.igx-excel-filter__empty');
            expect(emptyTextEl.innerText).toEqual('No matches');
        }));
    });

    describe('Tree grid ESF templates', () => {
        let tGrid: IgxTreeGridComponent;

        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridFilteringESFTemplatesComponent);
            tGrid = fix.componentInstance.treeGrid;

            const hierarchicalFilterStrategy = new TreeGridFilteringStrategy(['ID']);
            tGrid.filterStrategy = hierarchicalFilterStrategy;
            tGrid.allowFiltering = true;
            tGrid.filterMode = FilterMode.excelStyleFilter;
            fix.detectChanges();
        }));

        it('Should use custom templates for ESF components instead of default ones.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix, 'igx-tree-grid');

            expect(excelMenu.querySelector('igx-excel-style-column-operations')).not.toBeNull();
            expect(excelMenu.querySelector('igx-excel-style-filter-operations')).not.toBeNull();
            expect(GridFunctions.getExcelFilteringSortComponent(fix, excelMenu)).not.toBeNull();
            expect(GridFunctions.getExcelFilteringSearchComponent(fix, excelMenu)).not.toBeNull();

            expect(GridFunctions.getExcelFilteringHeaderComponent(fix, excelMenu)).toBeNull();
            expect(GridFunctions.getExcelFilteringMoveComponent(fix, excelMenu)).toBeNull();
            expect(GridFunctions.getExcelFilteringPinComponent(fix, excelMenu)).toBeNull();
            expect(GridFunctions.getExcelFilteringHideComponent(fix, excelMenu)).toBeNull();
            expect(GridFunctions.getExcelFilteringColumnSelectionComponent(fix, excelMenu)).toBeNull();
            expect(GridFunctions.getExcelFilteringClearFiltersComponent(fix, excelMenu)).toBeNull();
            expect(GridFunctions.getExcelFilteringConditionalFilterComponent(fix, excelMenu)).toBeNull();
        }));

        it('Should filter tree grid with templates correctly', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, null, 'igx-tree-grid');
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent, 'igx-tree-grid');

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '6', fix);
            fix.detectChanges();
            tick();

            const treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fix, searchComponent);
            expect(treeItems.length).toEqual(2, 'incorrect rendered items count');

            GridFunctions.clickApplyExcelStyleFiltering(fix, null, 'igx-tree-grid');
            fix.detectChanges();
            tick();

            const gridCellValues = GridFunctions.getColumnCells(fix, 'ID', 'igx-tree-grid-cell')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(3);

            GridFunctions.clickExcelFilterIcon(fix, 'ID');
            fix.detectChanges();
            tick();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix, 'igx-tree-grid');
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu, 'igx-tree-grid'));
            expect(!checkboxes[1].checked && !checkboxes[2].checked && !checkboxes[3].checked && checkboxes[4].indeterminate).toBe(true);
        }));

        it('Should use custom excel style filter icon instead of default one.', () => {
            const header = GridFunctions.getColumnHeader('ID', fix);
            fix.detectChanges();
            const icon = GridFunctions.getHeaderFilterIcon(header);
            fix.detectChanges();
            expect(icon).not.toBeNull();
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('filter_alt');
        });
    });

    describe('Filtering: Row editing', () => {
        let treeGrid: IgxTreeGridComponent;
        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridFilteringRowEditingComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        }));

        it('should remove a filtered parent row from the filtered list', fakeAsync(() => {
            const newCellValue = 'John McJohn';
            treeGrid.filter('Name', 'in', IgxStringFilteringOperand.instance().condition('contains'), true);
            tick();

            // modify the first filtered node
            const targetCell = treeGrid.getCellByColumn(0, 'Name');
            targetCell.update(newCellValue);
            tick();
            fix.detectChanges();

            // verify that the edited row was removed from the filtered list
            expect(treeGrid.filteredData.length).toBe(1);

            treeGrid.clearFilter();
            tick();
            fix.detectChanges();

            // check if the changes made were preserved
            expect(treeGrid.data.filter(c => c.Name === newCellValue).length).toBeGreaterThan(0);
        }));

        it('should not remove an edited parent node from the filtered list if it has a child node that meets the criteria',
            fakeAsync(() => {
                const newCellValue = 'John McJohn';
                treeGrid.filter('Name', 'on', IgxStringFilteringOperand.instance().condition('contains'), true);
                tick();

                // modify a parent node which has a child that matches the filtering condition
                const targetCell = treeGrid.getCellByColumn(0, 'Name');
                targetCell.update(newCellValue);
                tick();
                fix.detectChanges();

                // verify that the parent node is still in the filtered list
                expect(treeGrid.filteredData.filter(p => p.Name === targetCell.value).length).toBeGreaterThan(0);

                treeGrid.clearFilter();
                tick();
                fix.detectChanges();

                // verify the changes were preserved after the filtering is removed
                expect(treeGrid.data.filter(p => p.Name === targetCell.value).length).toBeGreaterThan(0);
            }));

        it(`should remove the parent node from the filtered list if
                its only matching child is modified and does not match the filtering condition anymore`,
            fakeAsync(() => {
                const newCellValue = 'John McJohn';
                const filterValue = 'Langdon';
                treeGrid.filter('Name', filterValue, IgxStringFilteringOperand.instance().condition('contains'), true);
                tick();

                // modify the first child node that meets the filtering condition
                const targetCell = treeGrid.getCellByColumn(1, 'Name');
                targetCell.update(newCellValue);
                tick();
                fix.detectChanges();

                // verify that the parent node is no longer in the filtered list
                expect(grid.filteredData).toBeFalsy();

                treeGrid.clearFilter();
                tick();
                fix.detectChanges();

                // verify that there is a parent which contains the updated child node
                const filteredParentNodes = treeGrid.data.filter(n => n.Employees.filter(e => e.Name === newCellValue).length !== 0);

                // if there are any parent nodes in this collection then the changes were preserved
                expect(filteredParentNodes.length).toBeGreaterThan(0);
            }));

        it('should not remove a parent node from the filtered list if it has at least one child node which matches the filtering condition',
            fakeAsync(() => {
                const newCellValue = 'Peter Peterson';
                treeGrid.filter('Name', 'h', IgxStringFilteringOperand.instance().condition('contains'), true);
                tick();

                // modify the first child node which meets the filtering condition
                const targetCell = treeGrid.getCellByColumn(1, 'Name');
                targetCell.update(newCellValue);
                tick();
                fix.detectChanges();

                // check if the edited child row is removed
                expect(treeGrid.filteredData.filter(c => c.Name === newCellValue).length).toBe(0);

                // check if the parent which contains the edited row is not removed
                expect(treeGrid.filteredData.filter(p => p.Name === targetCell.row.parent.data.Name).length).toBeGreaterThan(0);

                treeGrid.clearFilter();
                tick();
                fix.detectChanges();

                // verify that there is a parent which contains the updated child node
                const filteredParentNodes = treeGrid.data.filter(n => n.Employees.filter(e => e.Name === newCellValue).length !== 0);

                // if there are any parent nodes in this collection then the changes were preserved
                expect(filteredParentNodes.length).toBeGreaterThan(0);
            }));

            it('should be able to apply custom filter strategy', fakeAsync(() => {
                expect(treeGrid.filterStrategy).toBeDefined();
                treeGrid.filter('Name', 'd', IgxStringFilteringOperand.instance().condition('contains'), true);
                tick();
                fix.detectChanges();

                expect(treeGrid.rowList.length).toBe(9);

                treeGrid.clearFilter();
                fix.detectChanges();

                const customFilter = new CustomTreeGridFilterStrategy();
                // apply the same filter condition but with custu
                treeGrid.filterStrategy = customFilter;
                fix.detectChanges();

                treeGrid.filter('Name', 'd', IgxStringFilteringOperand.instance().condition('contains'), true);
                tick();
                fix.detectChanges();

                expect(treeGrid.rowList.length).toBe(4);
                expect(treeGrid.filteredData.map(rec => rec.ID)).toEqual([ 847, 225, 663, 141]);
            }));

            it('should display only the filtered records when using TreeGridMatchingRecordsOnlyFilteringStrategy', fakeAsync(() => {
                expect(treeGrid.filterStrategy).toBeDefined();
                treeGrid.filter('Name', 'Trevor', IgxStringFilteringOperand.instance().condition('contains'), true);
                tick();
                fix.detectChanges();

                expect(treeGrid.rowList.length).toBe(3);

                const matchingRecordsOnlyStrategy = new TreeGridMatchingRecordsOnlyFilteringStrategy();
                treeGrid.filterStrategy = matchingRecordsOnlyStrategy;
                fix.detectChanges();

                treeGrid.filter('Name', 'Trevor', IgxStringFilteringOperand.instance().condition('contains'), true);
                tick();
                fix.detectChanges();

                expect(treeGrid.rowList.length).toBe(1);
                expect(treeGrid.filteredData.map(rec => rec.ID)).toEqual([141]);
            }));
    });
    class CustomTreeGridFilterStrategy  extends FilteringStrategy {

        public override filter(data: [], expressionsTree): any[] {
                const result = [];
                if (!expressionsTree || !expressionsTree.filteringOperands ||
                    expressionsTree.filteringOperands.length === 0 || !data.length) {
                    return data;
                }
                data.forEach((rec: any) => {
                    if (this.matchRecord(rec.data, expressionsTree)) {
                        result.push(rec);
                    }
                });
                return result;
            }
    }
});
