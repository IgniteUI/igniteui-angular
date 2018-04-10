import { Component, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DataType } from "../data-operations/data-util";
import { IgxGridCellComponent } from "./cell.component";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

const selectedCellClass = ".igx-grid__td--selected";
let data = [
    { ID: 1, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
    { ID: 2, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
    { ID: 3, Name: "Tanya Bennett", JobTitle: "Director", HireDate: "2005-11-18T11:23:17.714Z" },
    { ID: 4, Name: "Jack Simon", JobTitle: "Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
    { ID: 5, Name: "Celia Martinez", JobTitle: "Senior Software Developer", HireDate: "2007-12-19T11:23:17.714Z" },
    { ID: 6, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
    { ID: 7, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
    { ID: 8, Name: "Erika Wells", JobTitle: "Software Development Team Lead", HireDate: "2005-10-14T11:23:17.714Z" },
    { ID: 9, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", HireDate: "2013-10-10T11:23:17.714Z" },
    { ID: 10, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "2011-11-28T11:23:17.714Z" }
];

describe("IgxGrid - Row Selection", () => {

    beforeEach(async(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [
                GridWithPrimaryKeyComponent,
                GridWithPagingAndSelectionComponent,
                GridWithSelectionComponent
            ],
            imports: [IgxGridModule.forRoot()]
        })
            .compileComponents();
        data = [
            { ID: 1, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
            { ID: 2, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
            { ID: 3, Name: "Tanya Bennett", JobTitle: "Software Developer", HireDate: "2005-11-18T11:23:17.714Z" },
            { ID: 4, Name: "Jack Simon", JobTitle: "Senior Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
            { ID: 5, Name: "Celia Martinez", JobTitle: "CEO", HireDate: "2007-12-19T11:23:17.714Z" },
            { ID: 6, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
            { ID: 7, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
            { ID: 8, Name: "Erika Wells", JobTitle: "Software Development Team Lead", HireDate: "2005-10-14T11:23:17.714Z" },
            { ID: 9, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", HireDate: "2013-10-10T11:23:17.714Z" },
            { ID: 10, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "2011-11-28T11:23:17.714Z" }
        ];
    }));

    it("Should be able to select row through primaryKey and index", async(() => {
        const fix = TestBed.createComponent(GridWithPrimaryKeyComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection1;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");

        expect(grid.primaryKey).toBeTruthy();
        expect(grid.rowList.length).toEqual(10, "All 10 rows should initialized");
        expect(grid.getRowByKey(2).rowData["Name"]).toMatch("Gilberto Todd");
        expect(grid.getRowByIndex(1).rowData["Name"]).toMatch("Gilberto Todd");
    }));

    it("Should be able to update a cell in a row through primaryKey", async(() => {
        const fix = TestBed.createComponent(GridWithPrimaryKeyComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection1;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        expect(grid.primaryKey).toBeTruthy();
        expect(grid.rowList.length).toEqual(10, "All 10 rows should initialized");
        expect(grid.getRowByKey(2).rowData["JobTitle"]).toMatch("Director");
        grid.updateCell("Vice President", 2, "JobTitle");
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(grid.getRowByKey(2).rowData["JobTitle"]).toMatch("Vice President");
        });
    }));

    it("Should be able to update row through primaryKey", async(() => {
        const fix = TestBed.createComponent(GridWithPrimaryKeyComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection1;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        spyOn(grid.cdr, "markForCheck").and.callThrough();
        expect(grid.primaryKey).toBeTruthy();
        expect(grid.rowList.length).toEqual(10, "All 10 rows should initialized");
        expect(grid.getRowByKey(2).rowData["JobTitle"]).toMatch("Director");
        grid.updateRow({ ID: 2, Name: "Gilberto Todd", JobTitle: "Vice President" }, 2);
        expect(grid.cdr.markForCheck).toHaveBeenCalledTimes(1);
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(grid.getRowByIndex(1).rowData["JobTitle"]).toMatch("Vice President");
            expect(grid.getRowByKey(2).rowData["JobTitle"]).toMatch("Vice President");
        });
    }));

    it("Should be able to delete a row through primaryKey", async(() => {
        const fix = TestBed.createComponent(GridWithPrimaryKeyComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection1;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        expect(grid.primaryKey).toBeTruthy();
        expect(grid.rowList.length).toEqual(10, "All 10 rows should initialized");
        expect(grid.getRowByKey(2)).toBeDefined();
        grid.deleteRow(2);
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(grid.getRowByKey(2)).toBeUndefined();
            expect(grid.getRowByIndex(2)).toBeDefined();
        });
    }));

    it("Should handle update by not overwriting the value in the data column specified as primaryKey", async(() => {
        const fix = TestBed.createComponent(GridWithPrimaryKeyComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection1;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        expect(grid.primaryKey).toBeTruthy();
        expect(grid.rowList.length).toEqual(10, "All 10 rows should initialized");
        expect(grid.getRowByKey(2)).toBeDefined();
        grid.updateRow({ ID: 7, Name: "Gilberto Todd", JobTitle: "Vice President" }, 2);
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(grid.getRowByKey(2)).toBeDefined();
            expect(grid.getRowByIndex(1)).toBeDefined();
            expect(grid.getRowByIndex(1).rowData[grid.primaryKey]).toEqual(2);
        });
    }));

    it("Should handle keydown events on cells properly even when primaryKey is specified", async(() => {
        const fix = TestBed.createComponent(GridWithPrimaryKeyComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection1;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        expect(grid.primaryKey).toBeTruthy();
        expect(grid.rowList.length).toEqual(10, "All 10 rows should initialized");
        const targetCell = grid.getCellByColumn(2, "Name");
        const targetCellElement: HTMLElement = grid.getCellByColumn(2, "Name").nativeElement;
        spyOn(grid.getCellByColumn(2, "Name"), "onFocus").and.callThrough();
        expect(grid.getCellByColumn(2, "Name").focused).toEqual(false);
        targetCellElement.focus();
        spyOn(targetCell.gridAPI, "get_cell_by_visible_index").and.callThrough();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(targetCell.focused).toEqual(true);
            const targetCellDebugElement = fix.debugElement.query(By.css(".igx-grid__td--selected"));
            // targetCellDebugElement.triggerEventHandler("keydown.arrowdown", { preventDefault: () => {}});
            targetCellElement.dispatchEvent(new KeyboardEvent("keydown", {
                key: "arrowdown",
                code: "40"
            }));
            // targetCellElement.dispatchEvent(new Event("blur"));
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(targetCell.gridAPI.get_cell_by_visible_index).toHaveBeenCalledTimes(1);
            expect(grid.getCellByColumn(3, "Name").focused).toEqual(true);
            expect(targetCell.focused).toEqual(false);
            expect(grid.selectedCells.length).toEqual(1);
            expect(grid.selectedCells[0].row.rowData[grid.primaryKey]).toEqual(3);
        });
    }));
    it("Should persist through paging", async(() => {
        const fix = TestBed.createComponent(GridWithPagingAndSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection2;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        const nextBtn: HTMLElement = fix.nativeElement.querySelector(".nextPageBtn");
        const prevBtn: HTMLElement = fix.nativeElement.querySelector(".prevPageBtn");
        expect(grid.rowList.length).toEqual(50, "All 50 rows should initialized");
        const selectedRow = grid.getRowByIndex(5);
        expect(selectedRow).toBeDefined();
        const checkboxElement: HTMLElement = selectedRow.nativeElement.querySelector(".igx-checkbox__input");
        // query(By.css(".igx-checkbox__input"))
        expect(selectedRow.isSelected).toBeFalsy();
        checkboxElement.click();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(selectedRow.isSelected).toBeTruthy();
            // expect(selectedRow.nativeElement.class).toContain("igx-grid__tr--selected");
            nextBtn.click();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(selectedRow.isSelected).toBeFalsy();
            prevBtn.click();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(selectedRow.isSelected).toBeTruthy();
        });
    }));
    it("Should persist through paging - multiple selection", async(() => {
        const fix = TestBed.createComponent(GridWithPagingAndSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection2;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        const nextBtn: HTMLElement = fix.nativeElement.querySelector(".nextPageBtn");
        const prevBtn: HTMLElement = fix.nativeElement.querySelector(".prevPageBtn");
        expect(grid.rowList.length).toEqual(50, "All 50 rows should initialized");
        const selectedRow1 = grid.getRowByIndex(5);
        const selectedRow2 = grid.getRowByIndex(3);
        const selectedRow3 = grid.getRowByIndex(0);
        expect(selectedRow1).toBeDefined();
        expect(selectedRow2).toBeDefined();
        expect(selectedRow3).toBeDefined();
        const checkboxElement1: HTMLElement = selectedRow1.nativeElement.querySelector(".igx-checkbox__input");
        const checkboxElement2: HTMLElement = selectedRow2.nativeElement.querySelector(".igx-checkbox__input");
        const checkboxElement3: HTMLElement = selectedRow3.nativeElement.querySelector(".igx-checkbox__input");
        // query(By.css(".igx-checkbox__input"))
        expect(selectedRow1.isSelected).toBeFalsy();
        expect(selectedRow2.isSelected).toBeFalsy();
        expect(selectedRow3.isSelected).toBeFalsy();
        checkboxElement1.click();
        checkboxElement2.click();
        checkboxElement3.click();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(selectedRow1.isSelected).toBeTruthy();
            expect(selectedRow2.isSelected).toBeTruthy();
            expect(selectedRow3.isSelected).toBeTruthy();
            // expect(selectedRow.nativeElement.class).toContain("igx-grid__tr--selected");
            nextBtn.click();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(selectedRow1.isSelected).toBeFalsy();
            expect(selectedRow2.isSelected).toBeFalsy();
            expect(selectedRow3.isSelected).toBeFalsy();
            prevBtn.click();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(selectedRow1.isSelected).toBeTruthy();
            expect(selectedRow2.isSelected).toBeTruthy();
            expect(selectedRow3.isSelected).toBeTruthy();
        });
    }));
    xit("Should persist through scrolling", async(() => {
        let selectedCell;
        const fix = TestBed.createComponent(GridWithSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection3;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        const nextBtn: HTMLElement = fix.nativeElement.querySelector(".nextPageBtn");
        const prevBtn: HTMLElement = fix.nativeElement.querySelector(".prevPageBtn");
        expect(grid.rowList.length).toBeLessThan(500, "Not all 500 rows should be in the viewport");
        const selectedRow = grid.getRowByIndex(0);
        expect(selectedRow).toBeDefined();
        const checkboxElement: HTMLElement = selectedRow.nativeElement.querySelector(".igx-checkbox__input");
        // query(By.css(".igx-checkbox__input"))
        expect(selectedRow.isSelected).toBeFalsy();
        checkboxElement.click();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(selectedRow.isSelected).toBeTruthy();
            selectedCell = grid.getCellByColumn("2_0", "Column2");
            // tslint:disable-next-line:no-debugger
            debugger;
            // expect(selectedRow.nativeElement.class).toContain("igx-grid__tr--selected");
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            selectedCell.nativeElement.dispatchEvent(new KeyboardEvent("keydown", {
                key: "arrowdown",
                code: "40"
            }));
            // tslint:disable-next-line:no-debugger
            debugger;
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            // tslint:disable-next-line:no-debugger
            debugger;
            expect(grid.getRowByIndex(0).isSelected).toBeFalsy();
            selectedCell.nativeElement.dispatchEvent(new KeyboardEvent("keydown", {
                key: "arrowup",
                code: "38"
            }));
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(selectedRow.isSelected).toBeTruthy();
        });
    }));

    it("Header checkbox should select/deselect all rows", async(() => {
        const fix = TestBed.createComponent(GridWithPagingAndSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection2;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        expect(grid.rowList.length).toEqual(50, "All 50 rows should initialized");
        const headerRow: HTMLElement = fix.nativeElement.querySelector(".igx-grid__thead");
        const firstRow = grid.getRowByIndex(0);
        const middleRow = grid.getRowByIndex(25);
        const lastRow = grid.getRowByIndex(49);
        expect(headerRow).toBeDefined();
        expect(firstRow).toBeDefined();
        expect(middleRow).toBeDefined();
        expect(lastRow).toBeDefined();
        const headerCheckboxElement: HTMLElement = headerRow.querySelector(".igx-checkbox__input");
        expect(firstRow.isSelected).toBeFalsy();
        expect(middleRow.isSelected).toBeFalsy();
        expect(lastRow.isSelected).toBeFalsy();
        headerCheckboxElement.click();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeTruthy();
            expect(middleRow.isSelected).toBeTruthy();
            expect(lastRow.isSelected).toBeTruthy();
            headerCheckboxElement.click();
        }).then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeFalsy();
            expect(middleRow.isSelected).toBeFalsy();
            expect(lastRow.isSelected).toBeFalsy();
        });
    }));

});

@Component({
    template: `
        <igx-grid #gridSelection1 [data]="data" [primaryKey]="'ID'">
            <igx-column field="ID"></igx-column>
            <igx-column field="Name"></igx-column>
            <igx-column field="JobTitle"></igx-column>
            <igx-column field="HireDate"></igx-column>
        </igx-grid>
    `
})
export class GridWithPrimaryKeyComponent {
    public data = data;

    @ViewChild("gridSelection1", { read: IgxGridComponent })
    public gridSelection1: IgxGridComponent;
}

@Component({
    template: `
        <igx-grid #gridSelection2 [data]="data" [primaryKey]="'ID'"
        [autoGenerate]="true" rowSelectable="true" [paging]="true" [perPage]="50">
        </igx-grid>
        <button class="prevPageBtn" (click)="ChangePage(-1)">Prev page</button>
        <button class="nextPageBtn" (click)="ChangePage(1)">Next page</button>
    `
})
export class GridWithPagingAndSelectionComponent {
    public data = [];

    @ViewChild("gridSelection2", { read: IgxGridComponent })
    public gridSelection2: IgxGridComponent;

    ngOnInit() {
        const bigData = [];
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 5; j++) {
                bigData.push({
                    ID: i.toString() + "_" + j.toString(),
                    Column1: i * j,
                    Column2: i * j * Math.pow(10, i),
                    Column3: i * j * Math.pow(100, i)
                });
            }
        }
        this.data = bigData;
    }

    public ChangePage(val) {
        console.log("Changing page: ", val);
        switch (val) {
            case -1:
                this.gridSelection2.previousPage();
                break;
            case 1:
                this.gridSelection2.nextPage();
                break;
            default:
                this.gridSelection2.paginate(val);
                break;
        }
    }
}

@Component({
    template: `
        <igx-grid #gridSelection3 [data]="data" [primaryKey]="'ID'" [width]="'800px'" [height]="'600px'"
        [autoGenerate]="true" rowSelectable="true">
        </igx-grid>
    `
})
export class GridWithSelectionComponent {
    public data = [];

    @ViewChild("gridSelection3", { read: IgxGridComponent })
    public gridSelection3: IgxGridComponent;

    ngOnInit() {
        const bigData = [];
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 5; j++) {
                bigData.push({
                    ID: i.toString() + "_" + j.toString(),
                    Column1: i * j,
                    Column2: i * j * Math.pow(10, i),
                    Column3: i * j * Math.pow(100, i)
                });
            }
        }
        this.data = bigData;
    }
}
