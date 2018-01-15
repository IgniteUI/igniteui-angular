import { Component, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { DataType } from "../data-operations/data-util";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - CRUD operations", () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultCRUDGrid
            ],
            imports: [IgxGridModule.forRoot()]
        }).compileComponents();
    }));

    it("should support adding rows through the grid API", () => {
        const fix = TestBed.createComponent(DefaultCRUDGrid);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const data = fix.componentInstance.data;

        expect(grid.data.length).toEqual(data.length);
        expect(grid.rowList.length).toEqual(grid.data.length);

        for (let i = 0; i < 10; i++) {
            grid.addRow({ index: i, value: i});
        }
        fix.detectChanges();

        expect(fix.componentInstance.rowsAdded).toEqual(10);
        expect(grid.data.length).toEqual(data.length);
        expect(grid.rowList.length).toEqual(grid.data.length);
    });

    it("should support adding rows by manipulating the `data` @Input of the grid", () => {
        const fix = TestBed.createComponent(DefaultCRUDGrid);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        // Add to the data array without changing the reference
        // with manual detection
        for (let i = 0; i < 10; i++) {
            fix.componentInstance.data.push({ index: i, value: i});
        }

        grid.cdr.markForCheck();
        fix.detectChanges();

        expect(grid.data.length).toEqual(fix.componentInstance.data.length);
        expect(grid.rowList.length).toEqual(fix.componentInstance.data.length);

        // Add to the data array with changing the reference
        // without manual detection

        for (let i = 0; i < 10; i++) {
            fix.componentInstance.data.push({ index: i, value: i});
        }
        fix.componentInstance.data = fix.componentInstance.data.slice();
        fix.detectChanges();

        expect(grid.data.length).toEqual(fix.componentInstance.data.length);
        expect(grid.rowList.length).toEqual(fix.componentInstance.data.length);
    });

    it("should support deleting rows through the grid API", () => {
        const fix = TestBed.createComponent(DefaultCRUDGrid);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const data = fix.componentInstance.data;

        grid.deleteRow(0);
        fix.detectChanges();

        expect(grid.data.length).toEqual(0);
        expect(data.length).toEqual(0);
        expect(grid.rowList.length).toEqual(0);

        for (let i = 0; i < 10; i++) {
            grid.addRow({ index: i, value: i});
        }
        fix.detectChanges();

        // Delete first and last rows
        grid.deleteRow(grid.rowList.first.index);
        grid.deleteRow(grid.rowList.last.index);

        fix.detectChanges();

        expect(grid.data.length).toEqual(data.length);
        expect(grid.rowList.length).toEqual(data.length);
        expect(fix.componentInstance.rowsDeleted).toEqual(3);

        expect(grid.rowList.first.cells.first.value).toEqual(1);
        expect(grid.rowList.last.cells.first.value).toEqual(8);

        // Try to delete a non-existant row
        grid.deleteRow(-1e7);
        fix.detectChanges();

        expect(grid.data.length).toEqual(8);
        expect(fix.componentInstance.rowsDeleted).toEqual(3);
    });

    it("should support removing rows by manipulating the `data` @Input of the grid", () => {
        const fix = TestBed.createComponent(DefaultCRUDGrid);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        // Remove from the data array without changing the reference
        // with manual detection
        fix.componentInstance.data.pop();
        grid.cdr.markForCheck();
        fix.detectChanges();

        expect(grid.data.length).toEqual(0);
        expect(grid.rowList.length).toEqual(0);

        for (let i = 0; i < 10; i++) {
            fix.componentInstance.data.push({ index: i, value: i});
        }
        fix.componentInstance.data = fix.componentInstance.data.slice();
        fix.detectChanges();

        expect(grid.data.length).toEqual(fix.componentInstance.data.length);
        expect(grid.rowList.length).toEqual(fix.componentInstance.data.length);

        // Remove from the data array with changing the reference
        // without manual detection
        fix.componentInstance.data.splice(0, 5);
        fix.componentInstance.data = fix.componentInstance.data.slice();
        fix.detectChanges();

        expect(grid.data.length).toEqual(5);
        expect(grid.rowList.length).toEqual(5);
        expect(grid.rowList.first.cells.first.value).toEqual(5);
    });

    it("should support updating a row through the grid API", () => {
        const fix = TestBed.createComponent(DefaultCRUDGrid);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const data = fix.componentInstance.data;

        // Update non-existing row
        grid.updateRow({ index: -100, value: -100 }, 100);
        fix.detectChanges();

        expect(grid.rowList.first.cells.first.value).not.toEqual(-100);
        expect(grid.data[0].index).not.toEqual(-100);

        // Update an existing row
        grid.updateRow({ index: 100, value: 100 }, 0);
        fix.detectChanges();

        expect(grid.rowList.first.cells.first.value).toEqual(100);
        expect(grid.data[0].index).toEqual(100);
    });

    it("should support updating a cell value through the grid API", () => {
        const fix = TestBed.createComponent(DefaultCRUDGrid);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        // Update a non-existing cell
        grid.updateCell(-100, 100, "index");
        fix.detectChanges();

        expect(grid.rowList.first.cells.first.value).not.toEqual(-100);
        expect(grid.rowList.first.cells.first.nativeElement.textContent).not.toMatch("-100");

        // Update an existing cell
        grid.updateCell(100, 0, "index");
        fix.detectChanges();

        expect(grid.rowList.first.cells.first.value).toEqual(100);
        expect(grid.rowList.first.cells.first.nativeElement.textContent).toMatch("100");
    });

    it("should support updating a cell value through the cell object", () => {
        const fix = TestBed.createComponent(DefaultCRUDGrid);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        const firstCell = grid.getCellByColumn(0, "index");
        firstCell.value = 100;

        fix.detectChanges();

        expect(grid.rowList.first.cells.first.value).toEqual(100);
        expect(grid.rowList.first.cells.first.nativeElement.textContent).toMatch("100");
    });
});

@Component({
    template: `
        <igx-grid
            [data]="data"
            (onRowAdded)="rowAdded($event)"
            (onRowDeleted)="rowDeleted($event)"
            [autogenerate]="true">
        </igx-grid>
    `
})
export class DefaultCRUDGrid {

    public data = [
        { index: 1, value: 1}
    ];

    public rowsAdded = 0;
    public rowsDeleted = 0;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    public rowAdded(event) {
        this.rowsAdded++;
    }

    public rowDeleted(event) {
        this.rowsDeleted++;
    }
}
