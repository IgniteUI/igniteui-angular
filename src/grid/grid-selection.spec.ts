import { Component, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DataType } from "../data-operations/data-util";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";
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
                GridWithPrimaryKeyComponent
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
        grid.updateRow({ID: 2, Name: "Gilberto Todd", JobTitle: "Vice President"}, 2);
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
