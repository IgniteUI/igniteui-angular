import { Component, ViewChild } from "@angular/core";
import { async, fakeAsync, flush, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { KEYCODES } from "../core/utils";
import { DataType } from "../data-operations/data-util";
import { IgxGridCellComponent } from "./cell.component";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - Cell component", () => {

    const CELL_CSS_CLASS = ".igx-grid__td";

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGrid,
                CtrlKeyKeyboardNagivation
            ],
            imports: [IgxGridModule.forRoot()]
        }).compileComponents();
    }));

    it("@Input properties and getters", () => {
        const fix = TestBed.createComponent(DefaultGrid);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const firstIndexCell = grid.getCellByColumn(0, "index");

        expect(firstIndexCell.columnIndex).toEqual(grid.columnList.first.index);
        expect(firstIndexCell.rowIndex).toEqual(grid.rowList.first.index);
        expect(firstIndexCell.grid).toBe(grid);
        expect(firstIndexCell.nativeElement).toBeDefined();
        expect(firstIndexCell.nativeElement.textContent).toMatch("1");
        expect(firstIndexCell.readonly).toBe(true);
        expect(firstIndexCell.describedby).toMatch(`${grid.id}-${firstIndexCell.column.field}`);
    });

    it("selection and selection events", () => {
        const fix = TestBed.createComponent(DefaultGrid);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const cell = grid.getCellByColumn(0, "index");

        expect(rv.nativeElement.getAttribute("aria-selected")).toMatch("false");

        rv.triggerEventHandler("focus", new Event("focus"));
        fix.detectChanges();

        expect(cell.focused).toBe(true);
        expect(cell.selected).toBe(true);
        expect(rv.nativeElement.getAttribute("aria-selected")).toMatch("true");
        expect(cell).toBe(fix.componentInstance.selectedCell);
    });

    it("edit mode", fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGrid);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const cell = grid.getCellByColumn(0, "index");

        cell.column.editable = true;
        fix.detectChanges();

        rv.triggerEventHandler("dblclick", {});
        tick();
        fix.detectChanges();

        expect(cell.inEditMode).toBe(true);

        rv.triggerEventHandler("keydown", { keyCode: KEYCODES.ESCAPE });
        tick();
        fix.detectChanges();

        expect(cell.inEditMode).toBe(false);

        rv.triggerEventHandler("keydown", { keyCode: KEYCODES.ENTER });
        tick();
        fix.detectChanges();

        expect(cell.inEditMode).toBe(true);

        rv.triggerEventHandler("keydown", { keyCode: KEYCODES.ESCAPE });
        tick();
        fix.detectChanges();

        expect(cell.inEditMode).toBe(false);

        rv.triggerEventHandler("keydown", { keyCode: KEYCODES.F2 });
        tick();
        fix.detectChanges();

        expect(cell.inEditMode).toBe(true);
    }));

    it("edit mode - leaves edit mode on blur", fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGrid);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const rv2 = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
        const cell = grid.getCellByColumn(0, "index");
        const cell2 = grid.getCellByColumn(1, "index");

        cell.column.editable = true;
        fix.detectChanges();

        rv.triggerEventHandler("keydown", { keyCode: KEYCODES.ENTER });
        tick();
        fix.detectChanges();

        expect(cell.inEditMode).toBe(true);

        rv2.triggerEventHandler("focus", {});
        tick();
        fix.detectChanges();

        expect(cell.inEditMode).toBe(false);
    }));

    it("keyboard navigation", fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGrid);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        let topLeft;
        let topRight;
        let bottomLeft;
        let bottomRight;
        [topLeft, topRight, bottomLeft, bottomRight] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        topLeft.triggerEventHandler("focus", {});
        tick();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch("index");

        topLeft.triggerEventHandler("keydown", { keyCode: KEYCODES.DOWN_ARROW });
        tick();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(2);
        expect(fix.componentInstance.selectedCell.column.field).toMatch("index");

        bottomLeft.triggerEventHandler("keydown", { keyCode: KEYCODES.RIGHT_ARROW });
        tick();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(2);
        expect(fix.componentInstance.selectedCell.column.field).toMatch("value");

        bottomRight.triggerEventHandler("keydown", { keyCode: KEYCODES.UP_ARROW });
        tick();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch("value");

        topRight.triggerEventHandler("keydown", { keyCode: KEYCODES.LEFT_ARROW });
        tick();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch("index");
    }));

    it("keyboard navigation - first/last cell jump with Ctrl", fakeAsync(() => {
        const fix = TestBed.createComponent(CtrlKeyKeyboardNagivation);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const rv2 = fix.debugElement.query(By.css(`${CELL_CSS_CLASS}:last-child`));

        rv.triggerEventHandler("focus", {});
        rv.triggerEventHandler("keydown", { keyCode: KEYCODES.RIGHT_ARROW, ctrlKey: true});
        tick();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch("another");

        rv2.triggerEventHandler("keydown", { keyCode: KEYCODES.LEFT_ARROW, ctrlKey: true});
        tick();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch("index");
    }));
});

@Component({
    template: `
        <igx-grid
            (onSelection)="cellSelected($event)"
            [data]="data"
            [autoGenerate]="true">
        </igx-grid>
    `
})
export class DefaultGrid {

    public data = [
        { index: 1, value: 1},
        { index: 2, value: 2}
    ];

    public selectedCell;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    public cellSelected(event) {
        this.selectedCell = event;
    }
}

@Component({
    template: `
        <igx-grid (onSelection)="cellSelected($event)" [data]="data" [autoGenerate]="true"></igx-grid>
    `
})
export class CtrlKeyKeyboardNagivation {

    public data = [
        { index: 1, value: 1, other: 1, another: 1},
        { index: 2, value: 2, other: 2, another: 2}
    ];

    public selectedCell;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    public cellSelected(event) {
        this.selectedCell = event;
    }
}
