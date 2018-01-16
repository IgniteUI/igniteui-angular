import { Component, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ISortingExpression, SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxColumnComponent } from "./column.component";
import { IgxGridFilterComponent } from "./grid-filtering.component";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - Grid Filtering", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridDeclaredColumns
            ],
            imports: [IgxGridModule.forRoot()]
        })
        .compileComponents();
    });

    it("Grid sort ascending by column name (default)", () => {
        const fixture = TestBed.createComponent(GridDeclaredColumns);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const currentColumn = "Name";
        const lastNameColumn = "LastName";

        grid.sort(currentColumn, SortingDirection.Asc);

        fixture.detectChanges();

        let expectedResult = "ALex";
        expect(grid.getCellByColumn(0, currentColumn).value).toEqual(expectedResult);
        expectedResult = "Smith";
        expect(grid.getCellByColumn(0, lastNameColumn).value).toEqual(expectedResult);
        expectedResult = "Rick";
        expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual(expectedResult);
        expectedResult = "BRown";
        expect(grid.getCellByColumn(grid.data.length - 1, lastNameColumn).value).toEqual(expectedResult);
    });

    it("Grid sort descending by column name", () => {
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
        const gridData = fixture.componentInstance.data;
        const invalidColumn = "Age";
        grid.sort(invalidColumn);

        let expectedResult = "Jane";
        expect(grid.getCellByColumn(0, "Name").value).toEqual(expectedResult);
        expectedResult = "Connor";
        expect(grid.getCellByColumn(grid.data.length - 1, "Name").value).toEqual(expectedResult);

        grid.rowList.map((item, index) =>
            expect(grid.getCellByColumn(index, "ID").value).toEqual(gridData[index].ID));
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
            {fieldName: thirdColumn, dir: SortingDirection.Desc, ignoreCase: true}];

        fixture.detectChanges();
        let expectedResult = "ALex";
        expect(grid.getCellByColumn(0, secondColumn).value).toEqual(expectedResult);
        expectedResult = "Smith";
        expect(grid.getCellByColumn(0, thirdColumn).value).toEqual(expectedResult);
        expect(grid.getCellByColumn(0, firstColumn).value).toEqual(5);
        expectedResult = "Rick";
        expect(grid.getCellByColumn(grid.data.length - 1, secondColumn).value).toEqual(expectedResult);
        expectedResult = "BRown";
        expect(grid.getCellByColumn(grid.data.length - 1, thirdColumn).value).toEqual(expectedResult);
        expect(grid.getCellByColumn(grid.data.length - 1, firstColumn).value).toEqual(7);
    });

    it("Grid sort by invalid expressions fieldName shouldn't change anything", () => {
        const fixture = TestBed.createComponent(GridDeclaredColumns);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const gridData = fixture.componentInstance.data;
        const firstColumn = "ID";
        const secondColumn = "Name";
        const thirdColumn = "LastName";
        const invalidExpressions = [{FieldName: secondColumn, dir: SortingDirection.Desc },
            {FieldName: firstColumn }];

        grid.sortingExpressions = invalidExpressions;

        fixture.detectChanges();

        let expectedResult = "Jane";
        expect(grid.getCellByColumn(0, secondColumn).value).toEqual(expectedResult);
        expectedResult = "Brown";
        expect(grid.getCellByColumn(0, thirdColumn).value).toEqual(expectedResult);
        expectedResult = "Connor";
        expect(grid.getCellByColumn(grid.data.length - 1, secondColumn).value).toEqual(expectedResult);
        expectedResult = "Walker";
        expect(grid.getCellByColumn(grid.data.length - 1, thirdColumn).value).toEqual(expectedResult);

        grid.rowList.map((item, index) =>
            expect(grid.getCellByColumn(index, firstColumn).value).toEqual(gridData[index].ID));
    });

    it(`Grid sort by mixed valid and invalid expressions should update the
            data only by valid ones (through API)`, () => {
        const fixture = TestBed.createComponent(GridDeclaredColumns);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const firstColumn = "ID";
        const secondColumn = "Name";
        const thirdColumn = "LastName";
        const invalidAndValidExp = [{FieldName: secondColumn, dir: SortingDirection.Desc },
            {fieldName: firstColumn }];

        grid.sortMultiple(invalidAndValidExp);

        fixture.detectChanges();

        let expectedResult = "Brad";
        expect(grid.getCellByColumn(0, secondColumn).value).toEqual(expectedResult);
        expectedResult = "Williams";
        expect(grid.getCellByColumn(0, thirdColumn).value).toEqual(expectedResult);
        expect(grid.getCellByColumn(0, firstColumn).value).toEqual(1);
        expectedResult = "Rick";
        expect(grid.getCellByColumn(grid.data.length - 1, secondColumn).value).toEqual(expectedResult);
        expectedResult = "BRown";
        expect(grid.getCellByColumn(grid.data.length - 1, thirdColumn).value).toEqual(expectedResult);
        expect(grid.getCellByColumn(grid.data.length - 1, firstColumn).value).toEqual(7);
    });

    // UI Tests

    it("Grid sort ascending by clicking once on first header cell UI", () => {
        const fixture = TestBed.createComponent(GridDeclaredColumns);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const firstHeaderCell = fixture.debugElement.query(By.css("igx-grid-header"));

        clickCurrentRow(firstHeaderCell);
        fixture.detectChanges();

        const firstRowFirstCell = getCurrentCellFromGrid(grid, 0, 0);
        const firstRowSecondCell =  getCurrentCellFromGrid(grid, 0, 1);
        let expectedResult = "Brad";
        expect(getValueFromCellElement(firstRowSecondCell)).toEqual(expectedResult);
        expectedResult = "1";
        expect(getValueFromCellElement(firstRowFirstCell)).toEqual(expectedResult);

        const lastRowFirstCell = getCurrentCellFromGrid(grid, grid.data.length - 1, 0);
        const lastRowSecondCell = getCurrentCellFromGrid(grid, grid.data.length - 1, 1);
        expectedResult = (fixture.componentInstance.data.length).toString();
        expect(getValueFromCellElement(lastRowFirstCell)).toEqual(expectedResult);
        expectedResult = "Rick";
        expect(getValueFromCellElement(lastRowSecondCell)).toEqual(expectedResult);
    });

    it("Grid sort descending by clicking twice on header cell UI", () => {
        const fixture = TestBed.createComponent(GridDeclaredColumns);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const firstHeaderCell = fixture.debugElement.query(By.css("igx-grid-header"));

        clickCurrentRow(firstHeaderCell);
        fixture.detectChanges();
        clickCurrentRow(firstHeaderCell);
        fixture.detectChanges();

        const firstRowFirstCell = getCurrentCellFromGrid(grid, 0, 0);
        const firstRowSecondCell = getCurrentCellFromGrid(grid, 0, 1);
        let expectedResult = "7";
        expect(getValueFromCellElement(firstRowFirstCell)).toEqual(expectedResult);
        expectedResult = "Rick";
        expect(getValueFromCellElement(firstRowSecondCell)).toEqual(expectedResult);

        const lastRowFirstCell = getCurrentCellFromGrid(grid, grid.data.length - 1, 0);
        const lastRowSecondCell = getCurrentCellFromGrid(grid, grid.data.length - 1, 1);
        expectedResult = "1";
        expect(getValueFromCellElement(lastRowFirstCell)).toEqual(expectedResult);
        expectedResult = "Brad";
        expect(getValueFromCellElement(lastRowSecondCell)).toEqual(expectedResult);
    });

    it("Grid sort none when we click three time on header cell UI", () => {
        const fixture = TestBed.createComponent(GridDeclaredColumns);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const gridData = fixture.componentInstance.data;
        const firstHeaderCell = fixture.debugElement.query(By.css("igx-grid-header"));

        clickCurrentRow(firstHeaderCell);
        fixture.detectChanges();
        clickCurrentRow(firstHeaderCell);
        fixture.detectChanges();
        clickCurrentRow(firstHeaderCell);
        fixture.detectChanges();

        const firstRowSecondCell = getCurrentCellFromGrid(grid, 0, 1);
        let expectedResult = "Jane";
        expect(getValueFromCellElement(firstRowSecondCell)).toEqual(expectedResult);

        const lastRowSecondCell = getCurrentCellFromGrid(grid, grid.data.length - 1, 1);
        expectedResult = "Connor";
        expect(getValueFromCellElement(lastRowSecondCell)).toEqual(expectedResult);

        grid.rowList.map((item, index) =>
            expect(grid.getCellByColumn(index, "ID").value).toEqual(gridData[index].ID));
    });
});

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column [sortable]="true" field="ID"></igx-column>
            <igx-column [sortable]="true" field="Name"></igx-column>
            <igx-column [sortable]="true" field="LastName"></igx-column>
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
    @ViewChild("nameColumn") public nameColumn;
}

function getCurrentCellFromGrid(grid, row, cell) {
    const gridRow = grid.rowList.toArray()[row];
    const gridCell = gridRow.cells.toArray()[cell];
    return gridCell;
}

function clickCurrentRow(row) {
    return row.triggerEventHandler("click", new Event("click"));
}

function getValueFromCellElement(cell) {
    return cell.nativeElement.textContent.trim();
}
