import { Component, DebugElement, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BOOLEAN_FILTERS, DATE_FILTERS, FilteringCondition,
    NUMBER_FILTERS, STRING_FILTERS } from "../../src/data-operations/filtering-condition";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - Filtering actions", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFiltering
            ],
            imports: [IgxGridModule.forRoot()]
        })
        .compileComponents();
    }));

    it("should correctly filter by 'string' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFiltering);
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
        expect(grid.rowList.length).toEqual(7);

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
        expect(grid.rowList.length).toEqual(5);

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
        expect(grid.rowList.length).toEqual(6);

        // Null filter
        grid.clearFilter("ProductName");
        fix.detectChanges();
        grid.filter("ProductName", null , STRING_FILTERS.null, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

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
        expect(grid.rowList.length).toEqual(3);

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
        const fix = TestBed.createComponent(IgxGridFiltering);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        // DoesNotEqual filter
        grid.filter("Downloads", 254, NUMBER_FILTERS.doesNotEqual);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(6);

        // Equal filter
        grid.clearFilter("Downloads");
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);
        grid.filter("Downloads", 127, NUMBER_FILTERS.equals, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // GreaterThan filter
        grid.clearFilter("Downloads");
        fix.detectChanges();
        grid.filter("Downloads", 100, NUMBER_FILTERS.greaterThan, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(3);

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
        expect(grid.rowList.length).toEqual(4);

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
        expect(grid.rowList.length).toEqual(6);

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
        expect(grid.rowList.length).toEqual(6);
    });

    it("should correctly filter by 'boolean' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFiltering);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        // Empty filter
        grid.filter("Released", null, BOOLEAN_FILTERS.empty);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        // False filter
        grid.clearFilter("Released");
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);
        grid.filter("Released", null, BOOLEAN_FILTERS.false);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(4);

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
        expect(grid.rowList.length).toEqual(5);

        // NotNull filter
        grid.clearFilter("Released");
        fix.detectChanges();
        grid.filter("Released", null, BOOLEAN_FILTERS.notNull);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(5);

        // Null filter
        grid.clearFilter("Released");
        fix.detectChanges();
        grid.filter("Released", null, BOOLEAN_FILTERS.null);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);
    });

    it("should correctly filter by 'date' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFiltering);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const today = new Date();

        // After filter
        grid.filter("ReleaseDate", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 4),
        DATE_FILTERS.after);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        // Before filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(7);
        grid.filter("ReleaseDate", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 4),
        DATE_FILTERS.before);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(4);

        // DoesNotEqual filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 15),
        DATE_FILTERS.doesNotEqual);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(6);

        // Equals filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 15),
        DATE_FILTERS.equals);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // Empty filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.empty);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        // LastMonth filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.lastMonth);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // NextMonth filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.nextMonth);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        // ThisYear filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.thisYear);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(4);

        // LastYear filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.lastYear);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // NextYear filter
        grid.clearFilter("ReleaseDate");
        fix.detectChanges();
        grid.filter("ReleaseDate", null, DATE_FILTERS.nextYear);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(0);

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
        expect(grid.rowList.length).toEqual(6);

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
        expect(grid.rowList.length).toEqual(5);
    });

    // it("UI - should correctly filter by 'number' filtering conditions", () => {
    //     const fix = TestBed.createComponent(IgxGridFiltering);
    //     fix.detectChanges();
    //     // let filterButton;

    //     const grid = fix.componentInstance.grid;
    //     const gridNative = fix.debugElement;
    // });
});

@Component({
    template: `<igx-grid [data]="data">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" [filterable]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
            [filterable]="true" dataType="date">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFiltering {
    public data = [
        { Downloads: 254, ID: 1, ProductName: "Ignite UI for JavaScript",
          ReleaseDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 15),
          Released: false },
        { Downloads: 127, ID: 2, ProductName: "NetAdvantage",
          ReleaseDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 30),
          Released: true },
        { Downloads: 20, ID: 3, ProductName: "Ignite UI for Angular",
          ReleaseDate: null, Released: null },
        { Downloads: null, ID: 4, ProductName: null,
          ReleaseDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1),
          Released: true },
        { Downloads: 100, ID: 5, ProductName: "",
          ReleaseDate: undefined, Released: "" },
        { Downloads: 702, ID: 6, ProductName: "Some other item with Script",
          ReleaseDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1),
          Released: null },
        { Downloads: 0, ID: 7, ProductName: null,
          ReleaseDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 30),
          Released: true }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    public ngOnInit(): void {
    }
}
