import { Component, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DataType } from "../data-operations/data-util";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { IGridCellEventArgs, IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - Cell component", () => {

    const CELL_CSS_CLASS = ".igx-grid__td";

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridComponent,
                CtrlKeyKeyboardNagivationComponent,
                VirtualtGridComponent
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

        spyOn(grid.onSelection, "emit").and.callThrough();
        const event = new Event("focus");
        rv.nativeElement.dispatchEvent(event);
        const args: IGridCellEventArgs = {
            cell,
            event
        };

        fix.whenStable().then(() => {
            fix.detectChanges();

            expect(grid.onSelection.emit).toHaveBeenCalledWith(args);
            expect(cell.focused).toBe(true);
            expect(cell.selected).toBe(true);
            expect(rv.nativeElement.getAttribute("aria-selected")).toMatch("true");
            expect(cell).toBe(fix.componentInstance.selectedCell);

        });
    }));

    it("Should trigger onCellClick event when click into cell", async(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const cellElem = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const firstCell = grid.getCellByColumn(0, "index");

        spyOn(grid.onCellClick, "emit").and.callThrough();
        const event = new Event("click");
        cellElem.nativeElement.dispatchEvent(event);
        const args: IGridCellEventArgs = {
            cell: firstCell,
            event
        };

        fix.whenStable().then(() => {
            fix.detectChanges();

            expect(grid.onCellClick.emit).toHaveBeenCalledWith(args);
            expect(firstCell).toBe(fix.componentInstance.clickedCell);
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
    it("should fit last cell in the available display container when there is vertical scroll.", () => {
        const fix = TestBed.createComponent(VirtualtGridComponent);
        fix.detectChanges();
        const rows = fix.componentInstance.instance.rowList;
        rows.forEach((item) => {
            expect(item.cells.last.width).toEqual("182px");
        });
    });
});

@Component({
    template: `
        <igx-grid
            (onSelection)="cellSelected($event)"
            (onCellClick)="cellClick($event)"
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

    public selectedCell: IgxGridCellComponent;
    public clickedCell: IgxGridCellComponent;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }

    public cellClick(evt) {
        this.clickedCell = evt.cell;
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

    public selectedCell: IgxGridCellComponent;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }
}

@Component({
    template: `
        <igx-grid [height]="'300px'" [width]="'800px'" [data]="data"
        [autoGenerate]="true" (onColumnInit)="columnCreated($event)"></igx-grid>
    `
})
export class VirtualtGridComponent {
    public data = [];
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;
    constructor() {
        this.data = this.generateData();
    }
    public generateData() {
        const data = [];
        for (let i = 0; i < 1000; i++) {
            data.push({ index: i, value: i, other: i, another: i });
        }
        return data;
    }

    public columnCreated(column: IgxColumnComponent) {
        column.width = "200px";
    }
}
