import { Component, DebugElement, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { BOOLEAN_FILTERS, DATE_FILTERS, FilteringCondition,
    NUMBER_FILTERS, STRING_FILTERS } from "../../src/data-operations/filtering-condition";
import { Calendar, ICalendarDate } from "../calendar/calendar";
import { FilteringLogic, IFilteringExpression } from "../data-operations/filtering-expression.interface";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - Filtering actions", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent
            ],
            imports: [
                IgxGridModule.forRoot()]
        })
        .compileComponents();
    }));

    it("should correctly filter by 'string' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        // Contains filter
        grid.filter("ProductName", "Ignite", STRING_FILTERS.contains, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);
        expect(grid.getCellByColumn(0, "ID").value).toEqual(1);
        expect(grid.getCellByColumn(1, "ID").value).toEqual(3);

        // Clear filtering
        grid.clearFilter("ProductName");
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(8);

        // StartsWith filter
        grid.filter("ProductName", "Net", STRING_FILTERS.startsWith, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, "ID").value).toEqual(2);

        // EndsWith filter
        grid.clearFilter("ProductName");
        fix.detectChanges();
        grid.filter("ProductName", "Script", STRING_FILTERS.endsWith, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        // DoesNotContain filter
        grid.clearFilter("ProductName");
        fix.detectChanges();
        grid.filter("ProductName", "Ignite", STRING_FILTERS.doesNotContain, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(6);

        // Equals filter
        grid.clearFilter("ProductName");
        fix.detectChanges();
        grid.filter("ProductName", "NetAdvantage", STRING_FILTERS.equals, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // DoesNotEqual filter
        grid.clearFilter("ProductName");
        fix.detectChanges();
        grid.filter("ProductName", "NetAdvantage", STRING_FILTERS.doesNotEqual, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);

        // Null filter
        grid.clearFilter("ProductName");
        fix.detectChanges();
        grid.filter("ProductName", null , STRING_FILTERS.null, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(3);

        // NotNull filter
        grid.clearFilter("ProductName");
        fix.detectChanges();
        grid.filter("ProductName", null, STRING_FILTERS.notNull, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(5);

        // Empty filter
        grid.clearFilter("ProductName");
        fix.detectChanges();
        grid.filter("ProductName", null, STRING_FILTERS.empty, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(4);

        // NotEmpty filter
        grid.clearFilter("ProductName");
        fix.detectChanges();
        grid.filter("ProductName", null, STRING_FILTERS.notEmpty, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(4);

        // Ignorecase filter 'false'
        grid.clearFilter("ProductName");
        fix.detectChanges();
        grid.filter("ProductName", "Ignite UI for Angular", STRING_FILTERS.equals, false);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);
    });

    it("should correctly filter by 'number' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        // DoesNotEqual filter
        grid.filter("Downloads", 254, NUMBER_FILTERS.doesNotEqual);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);

        // Equal filter
        grid.clearFilter("Downloads");
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(8);
        grid.filter("Downloads", 127, NUMBER_FILTERS.equals, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // GreaterThan filter
        grid.clearFilter("Downloads");
        fix.detectChanges();
        grid.filter("Downloads", 100, NUMBER_FILTERS.greaterThan, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(4);

        // LessThan filter
        grid.clearFilter("Downloads");
        fix.detectChanges();
        grid.filter("Downloads", 100, NUMBER_FILTERS.lessThan, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(3);

        // GreaterThanOrEqualTo filter
        grid.clearFilter("Downloads");
        fix.detectChanges();
        grid.filter("Downloads", 100, NUMBER_FILTERS.greaterThanOrEqualTo, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(5);

        // LessThanOrEqualTo filter
        grid.clearFilter("Downloads");
        fix.detectChanges();
        grid.filter("Downloads", 20, NUMBER_FILTERS.lessThanOrEqualTo, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(3);

        // Null filter
        grid.clearFilter("Downloads");
        fix.detectChanges();
        grid.filter("Downloads", null, NUMBER_FILTERS.null, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // NotNull filter
        grid.clearFilter("Downloads");
        fix.detectChanges();
        grid.filter("Downloads", null, NUMBER_FILTERS.notNull, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);

        // Empty filter
        grid.clearFilter("Downloads");
        fix.detectChanges();
        grid.filter("Downloads", null, NUMBER_FILTERS.empty, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // NotEmpty filter
        grid.clearFilter("Downloads");
        fix.detectChanges();
        grid.filter("Downloads", null, NUMBER_FILTERS.notEmpty, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);
    });

    it("should correctly filter by 'boolean' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        // Empty filter
        grid.filter("Released", null, BOOLEAN_FILTERS.empty);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        // False filter
        grid.clearFilter("Released");
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(8);
        grid.filter("Released", null, BOOLEAN_FILTERS.false);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(5);

        // True filter
        grid.clearFilter("Released");
        fix.detectChanges();
        grid.filter("Released", null, BOOLEAN_FILTERS.true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(3);

        // NotEmpty filter
        grid.clearFilter("Released");
        fix.detectChanges();
        grid.filter("Released", null, BOOLEAN_FILTERS.notEmpty);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(6);

        // NotNull filter
        grid.clearFilter("Released");
        fix.detectChanges();
        grid.filter("Released", null, BOOLEAN_FILTERS.notNull);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(6);

        // Null filter
        grid.clearFilter("Released");
        fix.detectChanges();
        grid.filter("Released", null, BOOLEAN_FILTERS.null);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);
    });

    it("should correctly filter by 'date' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        // After filter
        grid.filter("ReleaseDate", cal.timedelta(today, "day", 4),
        DATE_FILTERS.after);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        // Before filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(8);
        grid.filter("ReleaseDate", cal.timedelta(today, "day", 4),
        DATE_FILTERS.before);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(5);

        // DoesNotEqual filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", cal.timedelta(today, "day", 15),
        DATE_FILTERS.doesNotEqual);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);

        // Equals filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", cal.timedelta(today, "day", 15),
        DATE_FILTERS.equals);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // LastMonth filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.lastMonth);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(expectedResults[0]);

        // NextMonth filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.nextMonth);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(expectedResults[1]);

        // ThisYear filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.thisYear);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(expectedResults[2]);

        // LastYear filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.lastYear);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(expectedResults[4]);

        // NextYear filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.nextYear);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(expectedResults[3]);

        // Null filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.null);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // NotNull filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.notNull);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);

        // Empty filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.empty);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        // NotEmpty filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.notEmpty);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(6);

        // Today filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.today);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // Yesterday filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.yesterday);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);
    });

    it("should correctly apply multiple filtering through API", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const exprs: IFilteringExpression[] = [
            { fieldName: "Downloads", searchVal: 20, condition: NUMBER_FILTERS.greaterThanOrEqualTo },
            { fieldName: "ID", searchVal: 4, condition: NUMBER_FILTERS.greaterThan }
        ];

        grid.filter(exprs);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(3);
        expect(grid.filteringExpressions.length).toEqual(2);

        grid.clearFilter();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(grid.filteringExpressions.length).toEqual(0);
    });

    it("should correctly apply global filtering", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        grid.filteringLogic = FilteringLogic.Or;
        grid.filterGlobal("some", STRING_FILTERS.contains);
        fix.detectChanges();

        expect(grid.filteringExpressions.length).toEqual(grid.columns.length);
        expect(grid.rowList.length).toEqual(1);
    });
});

@Component({
    template: `<igx-grid [data]="data" height="500px">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" [filterable]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
            [filterable]="true" dataType="date">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringComponent {

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: "Ignite UI for JavaScript",
            ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 15),
            Released: false
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: "NetAdvantage",
            ReleaseDate: this.timeGenerator.timedelta(this.today, "month", -1),
            Released: true
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: "Ignite UI for Angular",
            ReleaseDate: null,
            Released: null
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, "day", -1),
            Released: true
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: "",
            ReleaseDate: undefined,
            Released: ""
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: "Some other item with Script",
            ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 1),
            Released: null
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, "month", 1),
            Released: true
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: this.today,
            Released: false
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
    } else if (dateItem0.isNextYear) {
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
