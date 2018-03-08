import { Component, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DataType } from "../data-operations/data-util";
import { IgxGridCellComponent } from "./cell.component";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - Cell component", () => {

    const CELL_CSS_CLASS = ".igx-grid__td";

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridComponent,
                CtrlKeyKeyboardNagivationComponent
            ],
            imports: [IgxGridModule.forRoot()]
        }).compileComponents();
    }));

    it("@Input properties and getters", async(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const firstIndexCell = grid.getCellByColumn(0, "index");

        fix.whenStable().then(() => {
            expect(firstIndexCell.columnIndex).toEqual(grid.columnList.first.index);
            expect(firstIndexCell.rowIndex).toEqual(grid.rowList.first.index);
            expect(firstIndexCell.grid).toBe(grid);
            expect(firstIndexCell.nativeElement).toBeDefined();
            expect(firstIndexCell.nativeElement.textContent).toMatch("1");
            expect(firstIndexCell.readonly).toBe(true);
            expect(firstIndexCell.describedby).toMatch(`${grid.id}_${firstIndexCell.column.field}`);
        });
    }));

    it("selection and selection events", async(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const cell = grid.getCellByColumn(0, "index");

        expect(rv.nativeElement.getAttribute("aria-selected")).toMatch("false");

        rv.nativeElement.dispatchEvent(new Event("focus"));

        fix.whenStable().then(() => {
            fix.detectChanges();

            expect(cell.focused).toBe(true);
            expect(cell.selected).toBe(true);
            expect(rv.nativeElement.getAttribute("aria-selected")).toMatch("true");
            expect(cell).toBe(fix.componentInstance.selectedCell);

        });
    }));

    it("edit mode", async(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const cell = grid.getCellByColumn(0, "index");

        cell.column.editable = true;
        rv.nativeElement.dispatchEvent(new Event("focus"));

        fix.whenStable().then(() => {
            fix.detectChanges();

            rv.triggerEventHandler("dblclick", {});
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(cell.inEditMode).toBe(true);
            rv.triggerEventHandler("keydown.escape", null);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(cell.inEditMode).toBe(false);
            rv.triggerEventHandler("keydown.enter", null);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(cell.inEditMode).toBe(true);
            rv.triggerEventHandler("keydown.escape", null);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(cell.inEditMode).toBe(false);
            rv.triggerEventHandler("keydown.f2", null);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(cell.inEditMode).toBe(true);

            rv.triggerEventHandler("keydown.escape", null);
            return fix.whenStable();
        }).then(() => {
            expect(cell.inEditMode).toBe(false);
        });
    }));

    it("edit mode - leaves edit mode on blur", async(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const rv2 = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
        const cell = grid.getCellByColumn(0, "index");
        const cell2 = grid.getCellByColumn(1, "index");

        cell.column.editable = true;
        rv.nativeElement.dispatchEvent(new Event("focus"));

        fix.whenStable().then(() => {
            fix.detectChanges();

            rv.triggerEventHandler("keydown.enter", null);
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(cell.inEditMode).toBe(true);

            rv2.nativeElement.dispatchEvent(new Event("focus"));

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(cell.inEditMode).toBe(false);

        });
    }));

    it("keyboard navigation", async(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const mockEvent = { preventDefault: () => {}};

        let topLeft;
        let topRight;
        let bottomLeft;
        let bottomRight;
        [topLeft, topRight, bottomLeft, bottomRight] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        topLeft.nativeElement.dispatchEvent(new Event("focus"));

        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.value).toEqual(1);
            expect(fix.componentInstance.selectedCell.column.field).toMatch("index");

            topLeft.triggerEventHandler("keydown.arrowdown", mockEvent);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.value).toEqual(2);
            expect(fix.componentInstance.selectedCell.column.field).toMatch("index");

            bottomLeft.triggerEventHandler("keydown.arrowright", mockEvent);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.value).toEqual(2);
            expect(fix.componentInstance.selectedCell.column.field).toMatch("value");

            bottomRight.triggerEventHandler("keydown.arrowup", mockEvent);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.value).toEqual(1);
            expect(fix.componentInstance.selectedCell.column.field).toMatch("value");

            topRight.triggerEventHandler("keydown.arrowleft", mockEvent);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.value).toEqual(1);
            expect(fix.componentInstance.selectedCell.column.field).toMatch("index");
        });
    }));

    it("keyboard navigation - first/last cell jump with Ctrl", async(() => {
        const fix = TestBed.createComponent(CtrlKeyKeyboardNagivationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const rv2 = fix.debugElement.query(By.css(`${CELL_CSS_CLASS}:last-child`));

        rv.nativeElement.dispatchEvent(new Event("focus"));

        fix.whenStable().then(() => {
            fix.detectChanges();
            rv.triggerEventHandler("keydown.control.arrowright", null);
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.value).toEqual(1);
            expect(fix.componentInstance.selectedCell.column.field).toMatch("another");

            rv2.triggerEventHandler("keydown.control.arrowleft", null);
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.value).toEqual(1);
            expect(fix.componentInstance.selectedCell.column.field).toMatch("index");

        });
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
export class DefaultGridComponent {

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
export class CtrlKeyKeyboardNagivationComponent {

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
