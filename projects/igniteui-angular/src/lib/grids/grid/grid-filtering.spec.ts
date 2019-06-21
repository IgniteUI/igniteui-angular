import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Calendar } from '../../calendar/calendar';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxChipComponent } from '../../chips';
import { HelperUtils } from '../../test-utils/helper-utils.spec';
import { IgxStringFilteringOperand,
    IgxNumberFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxDateFilteringOperand } from '../../data-operations/filtering-condition';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxGridFilteringComponent, CustomFilter } from '../../test-utils/grid-samples.spec';
import { ExpressionUI } from '../filtering/grid-filtering.service';

describe('IgxGrid - Filtering actions', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxGridModule]
        })
        .compileComponents();
    }));

    let fix, grid;
    beforeEach(fakeAsync(() => {
        fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        grid = fix.componentInstance.grid;
    }));

    it('should correctly filter by \'string\' filtering conditions', fakeAsync(() => {
        // Contains filter
        grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);
        expect(grid.getCellByColumn(0, 'ID').value).toEqual(1);
        expect(grid.getCellByColumn(1, 'ID').value).toEqual(3);

        // Clear filtering
        grid.clearFilter('ProductName');
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(8);

        // StartsWith filter
        grid.filter('ProductName', 'Net', IgxStringFilteringOperand.instance().condition('startsWith'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, 'ID').value).toEqual(2);

        // EndsWith filter
        grid.clearFilter('ProductName');
        fix.detectChanges();
        grid.filter('ProductName', 'Script', IgxStringFilteringOperand.instance().condition('endsWith'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        // DoesNotContain filter
        grid.clearFilter('ProductName');
        fix.detectChanges();
        grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('doesNotContain'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(6);

        // Equals filter
        grid.clearFilter('ProductName');
        fix.detectChanges();
        grid.filter('ProductName', 'NetAdvantage', IgxStringFilteringOperand.instance().condition('equals'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // DoesNotEqual filter
        grid.clearFilter('ProductName');
        fix.detectChanges();
        grid.filter('ProductName', 'NetAdvantage', IgxStringFilteringOperand.instance().condition('doesNotEqual'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);

        // Null filter
        grid.clearFilter('ProductName');
        fix.detectChanges();
        grid.filter('ProductName', null , IgxStringFilteringOperand.instance().condition('null'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(3);

        // NotNull filter
        grid.clearFilter('ProductName');
        fix.detectChanges();
        grid.filter('ProductName', null, IgxStringFilteringOperand.instance().condition('notNull'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(5);

        // Empty filter
        grid.clearFilter('ProductName');
        fix.detectChanges();
        grid.filter('ProductName', null, IgxStringFilteringOperand.instance().condition('empty'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(4);

        // NotEmpty filter
        grid.clearFilter('ProductName');
        fix.detectChanges();
        grid.filter('ProductName', null, IgxStringFilteringOperand.instance().condition('notEmpty'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(4);

        // Ignorecase filter 'false'
        grid.clearFilter('ProductName');
        fix.detectChanges();
        grid.filter('ProductName', 'Ignite UI for Angular', IgxStringFilteringOperand.instance().condition('equals'), false);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // Custom Filter
        grid.clearFilter('ProductName');
        fix.detectChanges();
        grid.filter('AnotherField', '', CustomFilter.instance().condition('custom'), false);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);
    }));

    it('should correctly filter by \'number\' filtering conditions', fakeAsync(() => {
        // DoesNotEqual filter
        grid.filter('Downloads', 254, IgxNumberFilteringOperand.instance().condition('doesNotEqual'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);

        // Equal filter
        grid.clearFilter('Downloads');
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(8);
        grid.filter('Downloads', 127, IgxNumberFilteringOperand.instance().condition('equals'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // GreaterThan filter
        grid.clearFilter('Downloads');
        fix.detectChanges();
        grid.filter('Downloads', 100, IgxNumberFilteringOperand.instance().condition('greaterThan'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(4);

        // LessThan filter
        grid.clearFilter('Downloads');
        fix.detectChanges();
        grid.filter('Downloads', 100, IgxNumberFilteringOperand.instance().condition('lessThan'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(3);

        // GreaterThanOrEqualTo filter
        grid.clearFilter('Downloads');
        fix.detectChanges();
        grid.filter('Downloads', 100, IgxNumberFilteringOperand.instance().condition('greaterThanOrEqualTo'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(5);

        // LessThanOrEqualTo filter
        grid.clearFilter('Downloads');
        fix.detectChanges();
        grid.filter('Downloads', 20, IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(3);

        // Null filter
        grid.clearFilter('Downloads');
        fix.detectChanges();
        grid.filter('Downloads', null, IgxNumberFilteringOperand.instance().condition('null'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // NotNull filter
        grid.clearFilter('Downloads');
        fix.detectChanges();
        grid.filter('Downloads', null, IgxNumberFilteringOperand.instance().condition('notNull'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);

        // Empty filter
        grid.clearFilter('Downloads');
        fix.detectChanges();
        grid.filter('Downloads', null, IgxNumberFilteringOperand.instance().condition('empty'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // NotEmpty filter
        grid.clearFilter('Downloads');
        fix.detectChanges();
        grid.filter('Downloads', null, IgxNumberFilteringOperand.instance().condition('notEmpty'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);
    }));

    it('should correctly filter by \'boolean\' filtering conditions', fakeAsync(() => {
        // Empty filter
        grid.filter('Released', null, IgxBooleanFilteringOperand.instance().condition('empty'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(3);

        // False filter
        grid.clearFilter('Released');
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(8);
        grid.filter('Released', null, IgxBooleanFilteringOperand.instance().condition('false'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        // True filter
        grid.clearFilter('Released');
        fix.detectChanges();
        grid.filter('Released', null, IgxBooleanFilteringOperand.instance().condition('true'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(3);

        // NotEmpty filter
        grid.clearFilter('Released');
        fix.detectChanges();
        grid.filter('Released', null, IgxBooleanFilteringOperand.instance().condition('notEmpty'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(5);

        // NotNull filter
        grid.clearFilter('Released');
        fix.detectChanges();
        grid.filter('Released', null, IgxBooleanFilteringOperand.instance().condition('notNull'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(6);

        // Null filter
        grid.clearFilter('Released');
        fix.detectChanges();
        grid.filter('Released', null, IgxBooleanFilteringOperand.instance().condition('null'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);
    }));

    it('should correctly filter by \'date\' filtering conditions', fakeAsync(() => {
        const cal = SampleTestData.timeGenerator;
        const today = SampleTestData.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        // After filter
        grid.filter('ReleaseDate', cal.timedelta(today, 'day', 4),
        IgxDateFilteringOperand.instance().condition('after'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        // Before filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(8);
        grid.filter('ReleaseDate', cal.timedelta(today, 'day', 4),
        IgxDateFilteringOperand.instance().condition('before'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(4);

        // DoesNotEqual filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        grid.filter('ReleaseDate', cal.timedelta(today, 'day', 15),
        IgxDateFilteringOperand.instance().condition('doesNotEqual'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);

        // Equals filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        grid.filter('ReleaseDate', cal.timedelta(today, 'day', 15),
        IgxDateFilteringOperand.instance().condition('equals'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // LastMonth filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        grid.filter('ReleaseDate', null, IgxDateFilteringOperand.instance().condition('lastMonth'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(expectedResults[0]);

        // NextMonth filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        grid.filter('ReleaseDate', null, IgxDateFilteringOperand.instance().condition('nextMonth'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(expectedResults[1]);

        // ThisYear filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        grid.filter('ReleaseDate', null, IgxDateFilteringOperand.instance().condition('thisYear'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(expectedResults[2]);

        // LastYear filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        grid.filter('ReleaseDate', null, IgxDateFilteringOperand.instance().condition('lastYear'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(expectedResults[4]);

        // NextYear filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        grid.filter('ReleaseDate', null, IgxDateFilteringOperand.instance().condition('nextYear'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(expectedResults[3]);

        // Null filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        grid.filter('ReleaseDate', null, IgxDateFilteringOperand.instance().condition('null'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // NotNull filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        grid.filter('ReleaseDate', null, IgxDateFilteringOperand.instance().condition('notNull'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);

        // Empty filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        grid.filter('ReleaseDate', null, IgxDateFilteringOperand.instance().condition('empty'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        // NotEmpty filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        grid.filter('ReleaseDate', null, IgxDateFilteringOperand.instance().condition('notEmpty'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(6);

        // Today filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        grid.filter('ReleaseDate', null, IgxDateFilteringOperand.instance().condition('today'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // Yesterday filter
        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        grid.filter('ReleaseDate', null, IgxDateFilteringOperand.instance().condition('yesterday'));
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);
    }));

    it('should correctly apply multiple filtering through API', fakeAsync(() => {
        const gridExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        gridExpressionsTree.filteringOperands = [
            { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('greaterThanOrEqualTo') },
            { fieldName: 'ID', searchVal: 4, condition: IgxNumberFilteringOperand.instance().condition('greaterThan') }
        ];

        grid.filteringExpressionsTree = gridExpressionsTree;
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(3);
        expect(grid.filteringExpressionsTree.filteringOperands.length).toEqual(2);
        let expression = grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpression;
        expect(expression).toBeDefined();
        expression = grid.filteringExpressionsTree.filteringOperands[1] as IFilteringExpression;
        expect(expression).toBeDefined();

        grid.clearFilter();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(grid.filteringExpressionsTree.filteringOperands.length).toEqual(0);
    }));

    it('should correctly apply global filtering', fakeAsync(() => {
        grid.filteringLogic = FilteringLogic.Or;
        grid.filterGlobal('some', IgxStringFilteringOperand.instance().condition('contains'));
        fix.detectChanges();

        expect(grid.filteringExpressionsTree.filteringOperands.length).toEqual(grid.columns.length);
        expect(grid.rowList.length).toEqual(1);
    }));

    it('Should render chip when filtering using the API.', fakeAsync(() => {
        const firstHeaderCell = fix.debugElement.query(By.css('.header-release-date'));
        let filteringChips = firstHeaderCell.parent.queryAll(By.directive(IgxChipComponent));
        expect(filteringChips.length).toEqual(1);
        let chipContent = filteringChips[0].query(By.css('.igx-chip__content')).nativeElement.innerText;
        expect(chipContent).toEqual('Filter');

        grid.filter('ReleaseDate', null, IgxDateFilteringOperand.instance().condition('today'));
        fix.detectChanges();
        filteringChips = firstHeaderCell.parent.queryAll(By.directive(IgxChipComponent));
        expect(filteringChips.length).toEqual(1);
        chipContent = filteringChips[0].query(By.css('.igx-chip__content')).nativeElement.innerText;
        expect(chipContent).not.toEqual('Filter');

        grid.clearFilter('ReleaseDate');
        fix.detectChanges();
        filteringChips = firstHeaderCell.parent.queryAll(By.directive(IgxChipComponent));
        expect(filteringChips.length).toEqual(1);
        chipContent = filteringChips[0].query(By.css('.igx-chip__content')).nativeElement.innerText;
        expect(chipContent).toEqual('Filter');
    }));

    it('Should correctly apply two conditions to two columns at once.', fakeAsync(() => {
        const colDownloadsExprTree = new FilteringExpressionsTree(FilteringLogic.And, 'Downloads');
        colDownloadsExprTree.filteringOperands = [
            { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('greaterThanOrEqualTo') },
            { fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo') }
        ];

        const colIdExprTree = new FilteringExpressionsTree(FilteringLogic.And, 'ID');
        colIdExprTree.filteringOperands = [
            { fieldName: 'ID', searchVal: 1, condition: IgxNumberFilteringOperand.instance().condition('greaterThan') },
            { fieldName: 'ID', searchVal: 5, condition: IgxNumberFilteringOperand.instance().condition('lessThan') }
        ];

        const gridExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        gridExpressionsTree.filteringOperands = [ colDownloadsExprTree, colIdExprTree ];

        grid.filteringExpressionsTree = gridExpressionsTree;
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
        expect(grid.filteringExpressionsTree.filteringOperands.length).toEqual(2);

        grid.clearFilter();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(grid.filteringExpressionsTree.filteringOperands.length).toEqual(0);
    }));

    it('Should correctly apply two conditions to number column.', fakeAsync(() => {
        const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'Downloads');
        const expression = {
            fieldName: 'Downloads',
            searchVal: 50,
            condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
        };
        const expression1 = {
            fieldName: 'Downloads',
            searchVal: 500,
            condition: IgxNumberFilteringOperand.instance().condition('lessThan')
        };
        filteringExpressionsTree.filteringOperands.push(expression);
        filteringExpressionsTree.filteringOperands.push(expression1);
        grid.filter('Downloads', null, filteringExpressionsTree);

        fix.detectChanges();

        expect(grid.rowList.length).toEqual(3);
        expect((grid.filteringExpressionsTree.filteringOperands[0] as FilteringExpressionsTree).filteringOperands.length).toEqual(2);
    }));

    it('Should correctly apply two conditions to string column.', fakeAsync(() => {
        const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        const expression = {
             fieldName: 'ProductName',
             searchVal: 'Ignite',
             condition: IgxStringFilteringOperand.instance().condition('startsWith')
        };
        const expression1 = {
            fieldName: 'ProductName',
            searchVal: 'Angular',
            condition: IgxStringFilteringOperand.instance().condition('contains')
        };
        filteringExpressionsTree.filteringOperands.push(expression);
        filteringExpressionsTree.filteringOperands.push(expression1);
        grid.filter('ProductName', null, filteringExpressionsTree);

        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
        expect((grid.filteringExpressionsTree.filteringOperands[0] as FilteringExpressionsTree).filteringOperands.length).toEqual(2);
    }));

    it('Should correctly apply two conditions to date column.', fakeAsync(() => {
        const today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

        const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ReleaseDate');
        const expression = {
            fieldName: 'ReleaseDate',
            searchVal: null,
            condition: IgxDateFilteringOperand.instance().condition('yesterday')
        };
        const expression1 = {
            fieldName: 'ReleaseDate',
            searchVal: today,
            condition: IgxDateFilteringOperand.instance().condition('after')
        };
        filteringExpressionsTree.filteringOperands.push(expression);
        filteringExpressionsTree.filteringOperands.push(expression1);
        grid.filter('ReleaseDate', null, filteringExpressionsTree);

        fix.detectChanges();

        expect(grid.rowList.length).toEqual(4);
        expect((grid.filteringExpressionsTree.filteringOperands[0] as FilteringExpressionsTree).filteringOperands.length).toEqual(2);
    }));

    it('Should correctly update summary.', fakeAsync(() => {
        const gridExpressionsTree = new FilteringExpressionsTree(FilteringLogic.Or);
        const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ReleaseDate');
        const expression = {
            fieldName: 'ReleaseDate',
            searchVal: null,
            condition: IgxDateFilteringOperand.instance().condition('yesterday')
        };
        filteringExpressionsTree.filteringOperands.push(expression);
        gridExpressionsTree.filteringOperands.push(filteringExpressionsTree);
        grid.filteringExpressionsTree = gridExpressionsTree;

        fix.detectChanges();
        tick(100);

        expect(grid.rowList.length).toEqual(1);

        const summaryRow = fix.debugElement.query(By.css('igx-grid-summary-row'));
        HelperUtils.verifyColumnSummaries(summaryRow, 0, ['Count'], ['1']);
    }));

    it('Should return true for areAllColumnsInView of filteringService.', fakeAsync(() => {
        expect(grid.filteringService.areAllColumnsInView).toBeTruthy();
    }));

    it('should correctly show and hide the "No records found." message.', fakeAsync(() => {
        grid.filter('ProductName', 'asdf', IgxStringFilteringOperand.instance().condition('contains'), true);
        fix.detectChanges();
        let noRecordsSpan = fix.debugElement.query(By.css('.igx-grid__tbody-message'));
        expect(grid.rowList.length).toEqual(0);
        expect(noRecordsSpan).toBeTruthy();
        expect(noRecordsSpan.nativeElement.innerText).toBe('No records found.');

        grid.filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        fix.detectChanges();
        noRecordsSpan = fix.debugElement.query(By.css('.igx-grid__tbody-message'));
        expect(grid.rowList.length).toEqual(8);
        expect(noRecordsSpan).toBeFalsy();
    }));

    it('Should generate the expressions UI list correctly.', fakeAsync(() => {
        const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ProductName');
        const expression = {
             fieldName: 'ProductName',
             searchVal: 'Ignite',
             condition: IgxStringFilteringOperand.instance().condition('startsWith')
        };
        const expression1 = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        const expression11 = {
            fieldName: 'ProductName',
            searchVal: 'Angular',
            condition: IgxStringFilteringOperand.instance().condition('contains')
        };
        const expression12 = {
            fieldName: 'ProductName',
            searchVal: 'jQuery',
            condition: IgxStringFilteringOperand.instance().condition('contains')
        };
        const expression2 = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        const expression21 = {
            fieldName: 'ProductName',
            searchVal: 'Angular',
            condition: IgxStringFilteringOperand.instance().condition('contains')
        };
        const expression22 = {
            fieldName: 'ProductName',
            searchVal: 'jQuery',
            condition: IgxStringFilteringOperand.instance().condition('contains')
        };
        expression1.filteringOperands.push(expression11);
        expression1.filteringOperands.push(expression12);
        expression2.filteringOperands.push(expression21);
        expression2.filteringOperands.push(expression22);
        filteringExpressionsTree.filteringOperands.push(expression);
        filteringExpressionsTree.filteringOperands.push(expression1);
        filteringExpressionsTree.filteringOperands.push(expression2);
        grid.filter('ProductName', null, filteringExpressionsTree);

        const expressionUIs: ExpressionUI[] = [];
        grid.filteringService.generateExpressionsList(grid.filteringExpressionsTree, grid.filteringLogic, expressionUIs);

        verifyExpressionUI(expressionUIs[0], expression, FilteringLogic.Or, undefined);
        verifyExpressionUI(expressionUIs[1], expression11, FilteringLogic.And, FilteringLogic.Or);
        verifyExpressionUI(expressionUIs[2], expression12, FilteringLogic.Or, FilteringLogic.And);
        verifyExpressionUI(expressionUIs[3], expression21, FilteringLogic.And, FilteringLogic.Or);
        verifyExpressionUI(expressionUIs[4], expression22, null, FilteringLogic.And);
    }));

    it('Should do nothing when clearing filter of non-existing column.', fakeAsync(() => {
        grid.filter('ProductName', 'ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        grid.clearFilter('NonExistingColumnName');
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);
    }));

    it('Should emit onFilteringDone when filtering globally', fakeAsync(() => {
        spyOn(grid.onFilteringDone, 'emit');

        grid.filteringLogic = FilteringLogic.Or;
        grid.filterGlobal('some', IgxStringFilteringOperand.instance().condition('contains'));
        tick(100);
        fix.detectChanges();

        expect(grid.onFilteringDone.emit).toHaveBeenCalledWith(grid.filteringExpressionsTree);
    }));

    it('Should keep existing expressionTree when filtering with a null expressionTree.', fakeAsync(() => {
        const expression1 = new FilteringExpressionsTree(FilteringLogic.Or, 'ProductName');
        const expression11 = {
            fieldName: 'ProductName',
            searchVal: 'Angular',
            condition: IgxStringFilteringOperand.instance().condition('contains')
        };

        // Verify results after filtering.
        expression1.filteringOperands.push(expression11);
        grid.filter('ProductName', null, expression1);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);
        expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for Angular');

        // Verify that passing null for expressionTree with a new searchVal will keep the existing expressionTree.
        grid.filter('ProductName', 'ignite', null);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);
        expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for Angular');
    }));

    it('Should throw descriptive error when filter() is called without condition', fakeAsync(() => {
        expect(() => {
            grid.filter('Downloads', 100);
            fix.detectChanges();
        }).toThrowError('Invalid condition or Expression Tree!');
    }));

    it('Should not clear previous filtering when filterGlobal() is called with invalid condition', fakeAsync(() => {
        grid.filter('Downloads', 100, IgxNumberFilteringOperand.instance().condition('greaterThan'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(4);
        expect(grid.getCellByColumn(0, 'Downloads').value).toEqual(254);

        // Execute global filtering with invalid condition.
        grid.filterGlobal(1000, null);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(4);
        expect(grid.getCellByColumn(0, 'Downloads').value).toEqual(254);
    }));
});

const expectedResults = [];

// Fill expected results for 'date' filtering conditions based on the current date
function fillExpectedResults(grid: IgxGridComponent, calendar: Calendar, today) {
    // day + 15
    const dateItem0 = generateICalendarDate(grid.data[0].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // month - 1
    const dateItem1 = generateICalendarDate(grid.data[1].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // day - 1
    const dateItem3 = generateICalendarDate(grid.data[3].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // day + 1
    const dateItem5 = generateICalendarDate(grid.data[5].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // month + 1
    const dateItem6 = generateICalendarDate(grid.data[6].ReleaseDate,
        today.getFullYear(), today.getMonth());

    let thisMonthCountItems = 1;
    let nextMonthCountItems = 1;
    let lastMonthCountItems = 1;
    let thisYearCountItems = 6;
    let nextYearCountItems = 0;
    let lastYearCountItems = 0;

    // LastMonth filter
    if (dateItem3.isPrevMonth) {
        lastMonthCountItems++;
    }
    expectedResults[0] = lastMonthCountItems;

    // thisMonth filter
    if (dateItem0.isCurrentMonth) {
        thisMonthCountItems++;
    }

    if (dateItem3.isCurrentMonth) {
        thisMonthCountItems++;
    }

    if (dateItem5.isCurrentMonth) {
        thisMonthCountItems++;
    }

    // NextMonth filter
    if (dateItem0.isNextMonth) {
        nextMonthCountItems++;
    }

    if (dateItem5.isNextMonth) {
        nextMonthCountItems++;
    }
    expectedResults[1] = nextMonthCountItems;

    // ThisYear, NextYear, PreviousYear filter

    // day + 15
    if (!dateItem0.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem0.isNextYear) {
        nextYearCountItems++;
    }

    // month - 1
    if (!dateItem1.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem1.isLastYear) {
        lastYearCountItems++;
    }

    // day - 1
    if (!dateItem3.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem3.isLastYear) {
        lastYearCountItems++;
    }

    // day + 1
    if (!dateItem5.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem5.isNextYear) {
        nextYearCountItems++;
    }

    // month + 1
    if (!dateItem6.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem6.isNextYear) {
        nextYearCountItems++;
    }

    // ThisYear filter result
    expectedResults[2] = thisYearCountItems;

    // NextYear filter result
    expectedResults[3] = nextYearCountItems;

    // PreviousYear filter result
    expectedResults[4] = lastYearCountItems;

    // ThisMonth filter result
    expectedResults[5] = thisMonthCountItems;
}

function generateICalendarDate(date: Date, year: number, month: number) {
    return {
        date,
        isCurrentMonth: date.getFullYear() === year && date.getMonth() === month,
        isLastYear: isLastYear(date, year),
        isNextMonth: isNextMonth(date, year, month),
        isNextYear: isNextYear(date, year),
        isPrevMonth: isPreviousMonth(date, year, month),
        isThisYear: isThisYear(date, year)
    };
}

function isPreviousMonth(date: Date, year: number, month: number): boolean {
    if (date.getFullYear() === year) {
        return date.getMonth() < month;
    }
    return date.getFullYear() < year;
}

function isNextMonth(date: Date, year: number, month: number): boolean {
    if (date.getFullYear() === year) {
        return date.getMonth() > month;
    }
    return date.getFullYear() > year;
}

function isThisYear(date: Date, year: number): boolean {
    return date.getFullYear() === year;
}

function isLastYear(date: Date, year: number): boolean {
    return date.getFullYear() < year;
}

function isNextYear(date: Date, year: number): boolean {
    return date.getFullYear() > year;
}

function verifyExpressionUI(expressionUI: ExpressionUI, expression: IFilteringExpression,
    afterOperator: FilteringLogic, beforeOperator: FilteringLogic) {
    expect(expressionUI.expression).toBe(expression);
    expect(expressionUI.afterOperator).toBe(afterOperator);
    expect(expressionUI.beforeOperator).toBe(beforeOperator);
}
