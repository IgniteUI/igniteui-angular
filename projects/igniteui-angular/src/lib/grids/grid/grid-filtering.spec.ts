import { Component, DebugElement, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Calendar, ICalendarDate } from '../../calendar/calendar';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { IgxStringFilteringOperand, IgxNumberFilteringOperand,
    IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxFilteringOperand, FilteringExpressionsTree } from '../../../public_api';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxChipComponent } from '../../chips';
import { HelperUtils } from '../../test-utils/helper-utils.spec';

const FILTERING_TOGGLE_CLASS = 'igx-filtering__toggle';
const FILTERING_TOGGLE_FILTERED_CLASS = 'igx-filtering__toggle--filtered';

describe('IgxGrid - Filtering actions', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxGridModule.forRoot()]
        })
        .compileComponents();
    }));

    it('should correctly filter by \'string\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

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
    });

    it('should correctly filter by \'number\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

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
    });

    it('should correctly filter by \'boolean\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

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
    });

    it('should correctly filter by \'date\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

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
    });

    it('should correctly apply multiple filtering through API', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
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
    });

    it('should correctly apply global filtering', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        grid.filteringLogic = FilteringLogic.Or;
        grid.filterGlobal('some', IgxStringFilteringOperand.instance().condition('contains'));
        fix.detectChanges();

        expect(grid.filteringExpressionsTree.filteringOperands.length).toEqual(grid.columns.length);
        expect(grid.rowList.length).toEqual(1);
    });

    it('Should render chip when filtering using the API.', () => {
        const fixture = TestBed.createComponent(IgxGridFilteringComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;

        const firstHeaderCell = fixture.debugElement.query(By.css('.header-release-date'));
        let filteringChips = firstHeaderCell.parent.queryAll(By.directive(IgxChipComponent));
        expect(filteringChips.length).toEqual(1);
        let chipContent = filteringChips[0].query(By.css('.igx-chip__content')).nativeElement.innerText;
        expect(chipContent).toEqual('Filter');

        grid.filter('ReleaseDate', null, IgxDateFilteringOperand.instance().condition('today'));
        fixture.detectChanges();
        filteringChips = firstHeaderCell.parent.queryAll(By.directive(IgxChipComponent));
        expect(filteringChips.length).toEqual(1);
        chipContent = filteringChips[0].query(By.css('.igx-chip__content')).nativeElement.innerText;
        expect(chipContent).not.toEqual('Filter');

        grid.clearFilter('ReleaseDate');
        fixture.detectChanges();
        filteringChips = firstHeaderCell.parent.queryAll(By.directive(IgxChipComponent));
        expect(filteringChips.length).toEqual(1);
        chipContent = filteringChips[0].query(By.css('.igx-chip__content')).nativeElement.innerText;
        expect(chipContent).toEqual('Filter');
    });

    it('Should correctly apply two conditions to two columns at once.', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

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
    });

    it('Should correctly apply two conditions to number column.', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

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
    });

    it('Should correctly apply two conditions to string column.', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

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
    });

    it('Should correctly apply two conditions to date column.', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
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
    });

    it('Should correctly update summary.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

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
});

export class CustomFilter extends IgxFilteringOperand {
    private static _instance: CustomFilter;

    private constructor () {
        super();
        this.operations = [{
            name: 'custom',
            isUnary: false,
            logic: (target: string): boolean => {
                return target === 'custom';
            },
            iconName: 'custom'
        }];
    }

    public static instance(): CustomFilter {
        return this._instance || (this._instance = new this());
    }
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]='true'>
        <igx-column [field]="'ID'" [header]="'ID'" [hasSummary]="true"></igx-column>
        <igx-column [field]="'ProductName'" [filterable]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="true" dataType="date">
        </igx-column>
        <igx-column [field]="'AnotherField'" [header]="'Anogther Field'" [filterable]="true"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringComponent {

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    public customFilter = CustomFilter;

    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', 15),
            Released: false,
            AnotherField: 'a'
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'month', -1),
            Released: true,
            AnotherField: 'a'
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: null,
            AnotherField: 'a'
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', -1),
            Released: true,
            AnotherField: 'a'
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: undefined,
            Released: false,
            AnotherField: 'a'
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: 'Some other item with Script',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', 1),
            Released: null,
            AnotherField: 'a'
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'month', 1),
            Released: true,
            AnotherField: 'a'
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: this.today,
            Released: undefined,
            AnotherField: 'custom'
        }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

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
