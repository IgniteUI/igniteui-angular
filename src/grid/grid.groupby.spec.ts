import { Component, ViewChild } from "@angular/core";
import { async, discardPeriodicTasks, fakeAsync, flush, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { Calendar } from "../calendar";
import { KEYCODES } from "../core/utils";
import { DataType } from "../data-operations/data-util";
import { STRING_FILTERS } from "../data-operations/filtering-condition";
import { ISortingExpression, SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { IgxGridHeaderComponent } from "./grid-header.component";
import { IGridCellEventArgs, IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - GropBy", () => {
    const COLUMN_HEADER_CLASS = ".igx-grid__th";
    const CELL_CSS_CLASS = ".igx-grid__td";
    const FIXED_CELL_CSS = "igx-grid__th--pinned";

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule.forRoot()]
        }).compileComponents();
    }));
    function checkGroups(groupRows, expectedGroupOrder, grExpr?) {
        // verify group rows are sorted correctly, their indexes in the grid are correct and their group records match the group value.
        let count = 0;
        const maxLevel = grExpr ? grExpr.length - 1 : 0;
        for (const groupRow of groupRows) {
            const recs = groupRow.groupRow.records;
            const val = groupRow.groupRow.value;
            const index = groupRow.index;
            const field = groupRow.groupRow.expression.fieldName;
            const level = groupRow.groupRow.level;
            expect(level).toEqual(grExpr ? grExpr.indexOf(groupRow.groupRow.expression) : 0);
            expect(index).toEqual(count);
            count++;
            expect(val).toEqual(expectedGroupOrder[groupRows.indexOf(groupRow)]);
            for (const rec of recs) {
                if (level === maxLevel) {
                    count++;
                }
                expect(rec[field]).toEqual(val);
            }
        }
    }
    it("should allow grouping by different data types.", () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        // group by string column
        const grid = fix.componentInstance.instance;
        grid.groupBy("ProductName", SortingDirection.Desc, false);
        fix.detectChanges();

        // verify grouping expressions
        const grExprs = grid.groupingExpressions;
        expect(grExprs.length).toEqual(1);
        expect(grExprs[0].fieldName).toEqual("ProductName");

        // verify rows
        let groupRows = grid.groupedRowList.toArray();
        let dataRows = grid.rowList.toArray();

        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);

        checkGroups(groupRows, ["NetAdvantage", "Ignite UI for JavaScript", "Ignite UI for Angular", "", null]);

        // ungroup
        grid.groupBy("ProductName", SortingDirection.None, false);
        fix.detectChanges();

         // verify no groups are present
        expect(grid.groupedRowList.toArray().length).toEqual(0);

        // group by number
        grid.groupBy("Downloads", SortingDirection.Desc, false);
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.rowList.toArray();

        expect(groupRows.length).toEqual(6);
        expect(dataRows.length).toEqual(8);

        checkGroups(groupRows, [1000, 254, 100, 20,  0, null]);

        // ungroup and group by boolean column
        grid.groupBy("Downloads", SortingDirection.None, false);
        fix.detectChanges();
        grid.groupBy("Released", SortingDirection.Desc, false);
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.rowList.toArray();

        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(8);

        checkGroups(groupRows, [true, false, null]);

        // ungroup and group by date column
        grid.groupBy("Released", SortingDirection.None, false);
        fix.detectChanges();
        grid.groupBy("ReleaseDate", SortingDirection.Asc, false);
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.rowList.toArray();

        expect(groupRows.length).toEqual(4);
        expect(dataRows.length).toEqual(8);

        checkGroups(
             groupRows,
             [null, fix.componentInstance.prevDay, fix.componentInstance.today, fix.componentInstance.nextDay ]);
    });

    it("should allow grouping by multiple columns.", () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.componentInstance.height = null;
        fix.detectChanges();

        // group by 2 columns
        const grid = fix.componentInstance.instance;
        grid.groupBy("ProductName", SortingDirection.Desc, false);
        grid.groupBy("Released", SortingDirection.Desc, false);
        fix.detectChanges();

        let groupRows = grid.groupedRowList.toArray();
        let dataRows = grid.rowList.toArray();

        // verify groups and data rows count
        expect(groupRows.length).toEqual(13);
        expect(dataRows.length).toEqual(8);
        // verify groups
        checkGroups(groupRows,
        ["NetAdvantage", true, false, "Ignite UI for JavaScript", true, false, "Ignite UI for Angular", false, null, "", true, null, true],
        grid.groupingExpressions);

        // group by 3rd column

        grid.groupBy("Downloads", SortingDirection.Desc, false);
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.rowList.toArray();

        // verify groups and data rows count
        expect(groupRows.length).toEqual(21);
        expect(dataRows.length).toEqual(8);
        // verify groups
        checkGroups(groupRows,
        ["NetAdvantage", true, 1000, false, 1000, "Ignite UI for JavaScript", true, null, false, 254, "Ignite UI for Angular",
         false, 20, null, 1000, "", true, 100, null, true, 0],
        grid.groupingExpressions);
    });
    it("should allows expanding/collapsing groups.", () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        grid.primaryKey = "ID";
        fix.detectChanges();
        grid.groupBy("Released", SortingDirection.Desc, false);
        fix.detectChanges();

        let groupRows = grid.groupedRowList.toArray();
        let dataRows = grid.rowList.toArray();
        // verify groups and data rows count
        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(8);

        // toggle grouprow - collapse
        expect(groupRows[0].expanded).toEqual(true);
        grid.toggleGroup(groupRows[0].groupRow);
        fix.detectChanges();
        expect(groupRows[0].expanded).toEqual(false);
        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.rowList.toArray();
        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(4);
        // verify collapsed group sub records are not rendered

        for (const rec of groupRows[0].groupRow.records) {
           expect(grid.getRowByKey(rec.ID)).toBeUndefined();
        }

        // toggle grouprow - expand
        grid.toggleGroup(groupRows[0].groupRow);
        fix.detectChanges();
        expect(groupRows[0].expanded).toEqual(true);
        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.rowList.toArray();
        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(8);

        // verify expanded group sub records are rendered
        for (const rec of groupRows[0].groupRow.records) {
           expect(grid.getRowByKey(rec.ID)).not.toBeUndefined();
        }
    });
    it("should allow changing the order of the groupBy columns.", () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        // set groupingExpressions
        const grid = fix.componentInstance.instance;
        const exprs: ISortingExpression[] = [
            {fieldName: "ProductName", dir: SortingDirection.Desc},
            {fieldName: "Released", dir: SortingDirection.Desc}
        ];
        grid.groupingExpressions = exprs;
        fix.detectChanges();

        let groupRows = grid.groupedRowList.toArray();
        let dataRows = grid.rowList.toArray();

        expect(groupRows.length).toEqual(13);
        expect(dataRows.length).toEqual(8);
        // verify groups
        checkGroups(groupRows,
        ["NetAdvantage", true, false, "Ignite UI for JavaScript", true,
         false, "Ignite UI for Angular", false, null, "", true, null, true],
        grid.groupingExpressions);

        // change order
        grid.groupingExpressions = [
            {fieldName: "Released", dir: SortingDirection.Asc},
            {fieldName: "ProductName", dir: SortingDirection.Asc}
        ];
        grid.sortingExpressions = [
            {fieldName: "Released", dir: SortingDirection.Asc},
            {fieldName: "ProductName", dir: SortingDirection.Asc}
        ];
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.rowList.toArray();
        expect(groupRows.length).toEqual(11);
        expect(dataRows.length).toEqual(8);
        // verify groups
        checkGroups(groupRows,
        [null, "Ignite UI for Angular", false, "Ignite UI for Angular", "Ignite UI for JavaScript",
         "NetAdvantage",  true, null, "",  "Ignite UI for JavaScript", "NetAdvantage"],
        grid.groupingExpressions);

    });

    // GroupBy + Sorting integration
    it("should apply sorting on each group's records when non-grouped column is sorted.", () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        grid.groupBy("ProductName", SortingDirection.Desc, false);
        fix.detectChanges();
        const groupRows = grid.groupedRowList.toArray();
        const dataRows = grid.rowList.toArray();
        // verify groups and data rows count
        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);

        grid.sort("Released", SortingDirection.Asc, false);
        fix.detectChanges();

        // verify groups
        checkGroups(groupRows, ["NetAdvantage", "Ignite UI for JavaScript", "Ignite UI for Angular", "", null]);

        // verify data records order
        const expectedDataRecsOrder = [false, true, false, true, null, false, true, true];
        dataRows.forEach((row, index) => {
            expect(row.rowData.Released).toEqual(expectedDataRecsOrder[index]);
        });

    });
    it("should apply the specified sort order on the group rows when already grouped columnn is sorted in asc/desc order.", () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        grid.groupBy("ProductName", SortingDirection.Desc, false);
        fix.detectChanges();

        let groupRows = grid.groupedRowList.toArray();
        let dataRows = grid.rowList.toArray();

        // verify groups and data rows count
        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);

        // verify group order
        checkGroups(groupRows, ["NetAdvantage", "Ignite UI for JavaScript", "Ignite UI for Angular", "", null]);
        grid.sort("ProductName", SortingDirection.Asc, false);
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.rowList.toArray();

        // verify group order
        checkGroups(groupRows, [null, "", "Ignite UI for Angular", "Ignite UI for JavaScript", "NetAdvantage" ]);

    });
    it("should remove grouping when already grouped columnn is sorted with order 'None'.", () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        grid.groupBy("ProductName", SortingDirection.Desc, false);
        fix.detectChanges();

        let groupRows = grid.groupedRowList.toArray();
        let dataRows = grid.rowList.toArray();

        // verify groups and data rows count
        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);

        // verify group order
        checkGroups(groupRows, ["NetAdvantage", "Ignite UI for JavaScript", "Ignite UI for Angular", "", null]);
        grid.sort("ProductName", SortingDirection.None, false);
        fix.detectChanges();
        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.rowList.toArray();

         // verify groups and data rows count
        expect(groupRows.length).toEqual(0);
        expect(dataRows.length).toEqual(8);

    });
    it("should group by the specified field when grouping by an already sorted field.", () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        grid.sort("ProductName", SortingDirection.Desc, false);
        fix.detectChanges();

        grid.groupBy("ProductName", SortingDirection.Asc, false);
        fix.detectChanges();
        const groupRows = grid.groupedRowList.toArray();
        // verify group order
        checkGroups(groupRows, [null, "", "Ignite UI for Angular", "Ignite UI for JavaScript", "NetAdvantage" ]);
    });
});
@Component({
    template: `
        <igx-grid
            [width]='width'
            [height]='height'
            [data]="data"
            [autoGenerate]="true">
        </igx-grid>
    `
})
export class DefaultGridComponent {
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    public nextDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 0, 0, 0);
    public prevDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 0, 0, 0);
    public width = "800px";
    public height = null;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;
    public enableSorting = false;

    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: "Ignite UI for JavaScript",
            ReleaseDate: this.today,
            Released: false
        },
        {
            Downloads: 1000,
            ID: 2,
            ProductName: "NetAdvantage",
            ReleaseDate: this.nextDay,
            Released: true
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: "Ignite UI for Angular",
            ReleaseDate: null,
            Released: false
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: "Ignite UI for JavaScript",
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: "",
            ReleaseDate: null,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 6,
            ProductName: "Ignite UI for Angular",
            ReleaseDate: this.nextDay,
            Released: null
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: "NetAdvantage",
            ReleaseDate: this.today,
            Released: false
        }
    ];

    public columnCreated(column: IgxColumnComponent) {
        column.sortable = this.enableSorting;
    }
}
