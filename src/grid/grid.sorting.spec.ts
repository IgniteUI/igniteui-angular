import { Component, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { ISortingExpression, SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxColumnComponent } from "./column.component";
import { IgxGridFilterComponent } from "./grid-filtering.component";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

fdescribe("IgxGrid - Grid Filtering", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridDeclaredColumns
            ],
            imports: [IgxGridModule.forRoot()]
        })
        .compileComponents();
    });

    it("Grid ascending sort by column name (default)", () => {
        const fixture = TestBed.createComponent(GridDeclaredColumns);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const currentColumn = "Name";

        grid.sort(currentColumn, SortingDirection.Asc);
        let expectedResult = "ALex";

        fixture.detectChanges();

        expect(grid.getCellByColumn(0, currentColumn).value).toEqual(expectedResult);
        expectedResult = "Rick";
        expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual(expectedResult);
    });

    it("Grid descending sort by column name", () => {
        const fixture = TestBed.createComponent(GridDeclaredColumns);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const currentColumn = "Name";

        grid.sort(currentColumn, SortingDirection.Desc);
        fixture.detectChanges();

        let expectedResult = "Rick";

        expect(grid.getCellByColumn(0, currentColumn).value).toEqual(expectedResult);
        expectedResult = "ALex";
        expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual(expectedResult);
    });

    it("Try sort by invalid column should not change anything", () => {
        const fixture = TestBed.createComponent(GridDeclaredColumns);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const invalidColumn = "Age";
        grid.sort(invalidColumn);

        let expectedResult = "Jane";
        expect(grid.getCellByColumn(0, "Name").value).toEqual(expectedResult);
        expectedResult = "Connor";
        expect(grid.getCellByColumn(grid.data.length - 1, "Name").value).toEqual(expectedResult);

    });

    it("Grid sort current column by expression (Ascending)", () => {
        const fixture = TestBed.createComponent(GridDeclaredColumns);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const currentColumn = "ID";
        grid.sortingExpressions = [{ fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: true }];

        fixture.detectChanges();

        expect(grid.getCellByColumn(0, currentColumn).value).toEqual(1);
    });

    it("Grid sort current column by expression (Descending with ignoreCase)", () => {
        const fixture = TestBed.createComponent(GridDeclaredColumns);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const currentColumn = "Name";

        grid.sortingExpressions = [{fieldName: currentColumn, dir: SortingDirection.Desc, ignoreCase: true }];

        fixture.detectChanges();

        const expectedResult = "Alex";
        expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual(expectedResult);
    });

    it("Grid sort by multiple expressions", () => {
        const fixture = TestBed.createComponent(GridDeclaredColumns);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const firstColumn = "ID";
        const secondColumn = "Name";
        const thirdColumn = "LastName";

        grid.sortingExpressions = [{fieldName: secondColumn, dir: SortingDirection.Asc},
            {fieldName: firstColumn, dir: SortingDirection.Desc }];

        fixture.detectChanges();

        let expectedResult = "ALex";
        expect(grid.getCellByColumn(0, secondColumn).value).toEqual(expectedResult);
        expectedResult = "Rick";
        expect(grid.getCellByColumn(grid.data.length - 1, secondColumn).value).toEqual(expectedResult);
        expect(grid.getCellByColumn(grid.data.length - 1, firstColumn).value).toEqual(6);
        expectedResult = "Jones";
        expect(grid.getCellByColumn(grid.data.length - 1 , thirdColumn).value).toEqual(expectedResult);
    });

    it("Grid sort by multiple expressions through API using ignoreCase for the second expression", () => {
        const fixture = TestBed.createComponent(GridDeclaredColumns);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const firstColumn = "ID";
        const secondColumn = "Name";
        const thirdColumn = "LastName";

        grid.sortingExpressions = [{fieldName: secondColumn, dir: SortingDirection.Asc},
            {fieldName: thirdColumn, dir: SortingDirection.Asc, ignoreCase: true}];

        fixture.detectChanges();

        debugger;
    });
});

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column [sortable]="true" field="ID"></igx-column>
            <igx-column field="Name"></igx-column>
            <igx-column field="LastName"></igx-column>
        </igx-grid>
    `
})
export class GridDeclaredColumns {

    public data = [
        { ID: 2, Name: "Jane", LastName: "Brown" },
        { ID: 1, Name: "Brad", LastName: "Williams" },
        { ID: 6, Name: "Rick", LastName: "Jones"},
        { ID: 7, Name: "Rick", LastName: "BRown" },
        { ID: 5, Name: "ALex", LastName: "Smith" },
        { ID: 4, Name: "Alex", LastName: "Wilson" },
        { ID: 3, Name: "Connor", LastName: "Walker" }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}
