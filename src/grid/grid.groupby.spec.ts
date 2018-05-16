import { Component, ViewChild } from "@angular/core";
import { async, discardPeriodicTasks, fakeAsync, flush, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { Calendar } from "../calendar";
import { KEYCODES } from "../core/utils";
import { DataType } from "../data-operations/data-util";
import { STRING_FILTERS } from "../data-operations/filtering-condition";
import { SortingDirection } from "../data-operations/sorting-expression.interface";
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
    function checkGroupsForColumn(groupedColName, groupRows, expectedGroupOrder) {
        // verify group rows are sorted correctly, their indexes in the grid are correct and their group records match the group value.
        let count = 0;
        for (const groupRow of groupRows) {
            const recs = groupRow.groupRow.records;
            const val = groupRow.groupRow.value;
            const index = groupRow.index;
            expect(index).toEqual(count);
            count++;
            expect(val).toEqual(expectedGroupOrder[groupRows.indexOf(groupRow)]);
            for (const rec of recs) {
                count++;
                expect(rec[groupedColName]).toEqual(val);
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

        checkGroupsForColumn("ProductName", groupRows, ["NetAdvantage", "Ignite UI for JavaScript", "Ignite UI for Angular", "", null]);

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

        checkGroupsForColumn("Downloads", groupRows, [1000, 254, 100, 20,  0, null]);

        // ungroup and group by boolean column
        grid.groupBy("Downloads", SortingDirection.None, false);
        fix.detectChanges();
        grid.groupBy("Released", SortingDirection.Desc, false);
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.rowList.toArray();

        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(8);

        checkGroupsForColumn("Released", groupRows, [true, false, null]);

        // ungroup and group by date column
        grid.groupBy("Released", SortingDirection.None, false);
        fix.detectChanges();
        grid.groupBy("ReleaseDate", SortingDirection.Asc, false);
        fix.detectChanges();

        groupRows = grid.groupedRowList.toArray();
        dataRows = grid.rowList.toArray();

        expect(groupRows.length).toEqual(4);
        expect(dataRows.length).toEqual(8);

        checkGroupsForColumn(
            "ReleaseDate",
             groupRows,
             [null, fix.componentInstance.prevDay, fix.componentInstance.today, fix.componentInstance.nextDay ]);
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
    public height = "800px";

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

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
}
