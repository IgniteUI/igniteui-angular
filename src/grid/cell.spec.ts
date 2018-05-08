import { Component, DebugElement, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { take } from "rxjs/operators";
import { DataType } from "../data-operations/data-util";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { IGridCellEventArgs, IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - Cell component", () => {

    const CELL_CSS_CLASS = ".igx-grid__td";
    const navigateVerticallyToIndex = (grid: IgxGridComponent, cell: IgxGridCellComponent, index: number, cb?) => {
            // grid - the grid in which to navigate.
            // cell - current cell from which the navigation will start.
            // index - the index to which to navigate
            // cb - callback function that will be called when index is reached.
            const currIndex = cell.rowIndex;
            const dir = currIndex < index ? "ArrowDown" : "ArrowUp";
            const nextIndex = dir === "ArrowDown" ? currIndex + 1 : currIndex - 1;
            const nextRow = grid.getRowByIndex(nextIndex);
            const keyboardEvent = new KeyboardEvent("keydown", {
                code: dir,
                key: dir
            });
            if (!cell.focused) {
                cell.nativeElement.dispatchEvent(new Event("focus"));
                grid.cdr.detectChanges();
            }
            // if index reached return
            if (currIndex === index) { if (cb) { cb(); } return; }
            // else call arrow up/down
            cell.nativeElement.dispatchEvent(keyboardEvent);
            grid.cdr.detectChanges();
            // if next row exists navigate next
            if (nextRow) {
                setTimeout(() => {
                    cell = grid.selectedCells[0];
                    navigateVerticallyToIndex(grid, cell, index, cb);
                });
            } else {
                // else wait for chunk to load.
                cell.row.
                grid.verticalScrollContainer.onChunkLoad.pipe(take(1)).subscribe({
                    next: () => {
                        grid.cdr.detectChanges();
                        cell = grid.selectedCells[0];
                        navigateVerticallyToIndex(grid, cell, index, cb);
                    }
                });
            }
        };
    const navigateHorizontallyToIndex = (grid: IgxGridComponent, cell: IgxGridCellComponent, index: number, cb?) => {
            // grid - the grid in which to navigate.
            // cell - current cell from which the navigation will start.
            // index - the index to which to navigate
            // cb - callback function that will be called when index is reached.

            const currIndex = cell.visibleColumnIndex;
            const dir = currIndex < index ? "ArrowRight" : "ArrowLeft";
            const nextIndex = dir === "ArrowRight" ? currIndex + 1 : currIndex - 1;
            const nextCol = grid.visibleColumns[nextIndex];
            const nextCell = nextCol ? grid.getCellByColumn(0, nextCol.field) : null;
            const keyboardEvent = new KeyboardEvent("keydown", {
                code: dir,
                key: dir
            });
            if (!cell.focused) {
                cell.nativeElement.dispatchEvent(new Event("focus"));
                grid.cdr.detectChanges();
            }
            // if index reached return
            if (currIndex === index) { if (cb) { cb(); } return; }
            // else call arrow up/down
            cell.nativeElement.dispatchEvent(keyboardEvent);

            grid.cdr.detectChanges();
            // if next row exists navigate next
            if (nextCell) {
                setTimeout(() => {
                    cell = grid.selectedCells[0];
                    navigateHorizontallyToIndex(grid, cell, index, cb);
                });
            } else {
                // else wait for chunk to load.
                cell.row.virtDirRow.onChunkLoad.pipe(take(1)).subscribe({
                    next: () => {
                        grid.cdr.detectChanges();
                        cell = grid.selectedCells[0];
                        navigateHorizontallyToIndex(grid, cell, index, cb);
                    }
                });
            }
    };
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridComponent,
                CtrlKeyKeyboardNagivationComponent,
                VirtualGridComponent,
                GridWithEditableColumnComponent,
                NoColumnWidthGridComponent
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

    it("Should trigger onContextMenu event when right click into cell", async(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const cellElem = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const firstCell = grid.getCellByColumn(0, "index");

        spyOn(grid.onContextMenu, "emit").and.callThrough();
        const event = new Event("contextmenu");
        cellElem.nativeElement.dispatchEvent(event);
        const args: IGridCellEventArgs = {
            cell: firstCell,
            event
        };

        fix.whenStable().then(() => {
            fix.detectChanges();

            expect(grid.onContextMenu.emit).toHaveBeenCalledWith(args);
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
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        const rows = fix.componentInstance.instance.rowList;
        rows.forEach((item) => {
            expect(item.cells.last.width).toEqual("182px");
        });
    });

    it("should use default column width for cells with width in %.", () => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.componentInstance.defaultWidth = "25%";
        fix.detectChanges();
        const rows = fix.componentInstance.instance.rowList;
        rows.forEach((item) => {
            expect(item.cells.last.width).toEqual("25%");
        });
    });

    it("should scroll first row into view when pressing arrow up", async(() => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();

        // the 2nd sell on the row with index 1
        const cell =  fix.debugElement.queryAll(By.css(`${CELL_CSS_CLASS}:nth-child(2)`))[1];

        fix.componentInstance.scrollTop(25);
        fix.whenStable().then(() => {
            fix.detectChanges();
            const scrollContainer = fix.componentInstance.instance.verticalScrollContainer.dc.instance._viewContainer;
            const scrollContainerOffset = scrollContainer.element.nativeElement.offsetTop;

            expect(scrollContainerOffset).toEqual(-25);

            cell.nativeElement.dispatchEvent(new Event("focus"));

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.value).toEqual(1);
            expect(fix.componentInstance.selectedCell.column.field).toMatch("value");

            cell.nativeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "arrowup", code: "38" }));

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            const scrollContainer = fix.componentInstance.instance.verticalScrollContainer.dc.instance._viewContainer;
            const scrollContainerOffset = scrollContainer.element.nativeElement.offsetTop;

            expect(scrollContainerOffset).toEqual(0);
            expect(fix.componentInstance.selectedCell.value).toEqual(0);
            expect(fix.componentInstance.selectedCell.column.field).toMatch("value");
        });
    }));

    it("should not reduce the width of last pinned cell when there is vertical scroll.", () => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        const columns = fix.componentInstance.instance.columnList;
        const lastCol: IgxColumnComponent = columns.last;
        lastCol.pin();
        fix.detectChanges();
        lastCol.cells.forEach((cell) => {
            expect(cell.width).toEqual("200px");
        });
        const rows = fix.componentInstance.instance.rowList;
        rows.forEach((item) => {
            expect(item.cells.last.width).toEqual("182px");
        });
    });

    it("should not make last column width 0 when no column width is set", () => {
        const fix = TestBed.createComponent(NoColumnWidthGridComponent);
        fix.detectChanges();
        const columns = fix.componentInstance.instance.columnList;
        const lastCol: IgxColumnComponent = columns.last;
        lastCol.cells.forEach((cell) => {
            expect(cell.nativeElement.clientWidth).toBeGreaterThan(100);
        });
    });

    it("keyboard navigation - should allow vertical navigation in virtualized grid.", (done) => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        const cell = grid.getCellByColumn(4, "index");
        const cbFunc = () => {
            // verify first cell 100th row is selected.
            expect(fix.componentInstance.selectedCell.rowIndex).toEqual(100);
            fix.detectChanges();
            const cbFunc2 = () => {
                expect(fix.componentInstance.selectedCell.rowIndex).toEqual(0);
                done();
            };

            // navigate back up to 0
            navigateVerticallyToIndex(grid, fix.componentInstance.selectedCell, 0, cbFunc2);

        };
        // navigate down to 100th row.
        navigateVerticallyToIndex(grid, cell, 100, cbFunc);
    });
    it("keyboard navigation - should allow horizontal navigation in virtualized grid.", (done) => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        const cols = [];
        for (let i = 0; i < 10; i++) {
            cols.push({field: "col" + i});
        }
        fix.componentInstance.cols = cols;
        fix.componentInstance.data = fix.componentInstance.generateData();
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        const cell = grid.getCellByColumn(0, "col3");

        const cbFunc = () => {
            expect(fix.componentInstance.selectedCell.columnIndex).toEqual(9);
            fix.detectChanges();
            const cbFunc2 = () => {
                expect(fix.componentInstance.selectedCell.columnIndex).toEqual(1);
                done();
            };
            navigateHorizontallyToIndex(grid, fix.componentInstance.selectedCell, 1, cbFunc2);
        };
        navigateHorizontallyToIndex(grid, cell, 9, cbFunc);
    });
    it("keyboard navigation - should allow horizontal navigation in virtualized grid with pinned cols.", (done) => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        const cols = [];
        for (let i = 0; i < 10; i++) {
            cols.push({field: "col" + i});
        }
        fix.componentInstance.cols = cols;
        fix.componentInstance.data = fix.componentInstance.generateData();
        fix.detectChanges();
        const grid = fix.componentInstance.instance;

        grid.pinColumn("col1");
        grid.pinColumn("col3");
        const cell = grid.getCellByColumn(0, "col1");
        const cbFunc = () => {
            expect(fix.componentInstance.selectedCell.visibleColumnIndex).toEqual(9);
            const cbFunc2 = () => {
                expect(fix.componentInstance.selectedCell.visibleColumnIndex).toEqual(1);
                done();
            };
            navigateHorizontallyToIndex(grid, fix.componentInstance.selectedCell, 1, cbFunc2);
        };
        navigateHorizontallyToIndex(grid, cell, 9, cbFunc);

    });

    it("keyboard navigation - should allow vertical navigation in virtualized grid with pinned cols.", (done) => {
        const fix = TestBed.createComponent(VirtualGridComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        grid.pinColumn("index");
        const cell = grid.getCellByColumn(4, "index");
        const cbFunc = () => {
            // verify first cell 100th row is selected.
            expect(fix.componentInstance.selectedCell.rowIndex).toEqual(100);
            fix.detectChanges();
            const cbFunc2 = () => {
                expect(fix.componentInstance.selectedCell.rowIndex).toEqual(0);
                done();
            };

            // navigate back up to 0
            navigateVerticallyToIndex(grid, fix.componentInstance.selectedCell, 0, cbFunc2);

        };
        // navigate down to 100th row.
        navigateVerticallyToIndex(grid, cell, 100, cbFunc);
    });
    it("When cell in edit mode and try to navigate the caret around the cell text the focus should remain.", async(() => {
        const fix = TestBed.createComponent(GridWithEditableColumnComponent);
        fix.detectChanges();

        // const firstCellOfColumn: DebugElement = fix.componentInstance.grid.columnList.first.cells[0];
        const firstCell: DebugElement = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const cellElem = firstCell.nativeElement;
        const component = fix.debugElement.query(By.css("igx-grid"));

        component.triggerEventHandler("keydown.home" , null);
        fix.detectChanges();

        fix.whenStable().then(() => {
            fix.detectChanges();
            cellElem.dispatchEvent(new MouseEvent("dblclick"));
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            const elem = findCellByInputElem(cellElem, document.activeElement);
            expect(cellElem).toBe(elem);

            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            triggerKeyDownEvtUponElem("ArrowRight", inputElem);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            const elem = findCellByInputElem(cellElem, document.activeElement);
            expect(cellElem).toBe(elem);

            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            triggerKeyDownEvtUponElem("ArrowLeft", inputElem);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            const elem = findCellByInputElem(cellElem, document.activeElement);
            expect(cellElem).toBe(elem);
        }).then(() => {
            fix.detectChanges();

            const elem = findCellByInputElem(cellElem, document.activeElement);
            expect(cellElem).toBe(elem);

            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            triggerKeyDownEvtUponElem("control.ArrowLeft", inputElem);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            const elem = findCellByInputElem(cellElem, document.activeElement);
            expect(cellElem).toBe(elem);

            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            triggerKeyDownEvtUponElem("control.ArrowRight", inputElem);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            const elem = findCellByInputElem(cellElem, document.activeElement);
            expect(cellElem).toBe(elem);

            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            triggerKeyDownEvtUponElem("ArrowUp", inputElem);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            const elem = findCellByInputElem(cellElem, document.activeElement);
            expect(cellElem).toBe(elem);

            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            triggerKeyDownEvtUponElem("ArrowDown", inputElem);

            return fix.whenStable();
        });

        function triggerKeyDownEvtUponElem(evtName, elem) {
            const evtArgs: KeyboardEventInit = { key: evtName, bubbles: true};
            elem.dispatchEvent(new KeyboardEvent("keydown", evtArgs));
            fix.detectChanges();
        }

        function findCellByInputElem(elem, focusedElem) {
            if (!focusedElem.parentElement) {
                return null;
            }

            if (elem === focusedElem) {
                return elem;
            }

            return findCellByInputElem(elem, focusedElem.parentElement);
        }
    }));
});

@Component({
    template: `
        <igx-grid
            (onSelection)="cellSelected($event)"
            (onCellClick)="cellClick($event)"
            (onContextMenu)="cellRightClick($event)"
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

    public cellRightClick(evt) {
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
        <igx-grid [height]="'300px'" [width]="'800px'" [columnWidth]="defaultWidth" [data]="data" [autoGenerate]="true"
         (onSelection)="cellSelected($event)">
        </igx-grid>
    `
})
export class VirtualGridComponent {

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    public data = [];
    public cols = [{ field: "index" }, { field: "value" }, { field: "other" }, { field: "another"}];
    public defaultWidth = "200px";
    public selectedCell: IgxGridCellComponent;

    constructor() {
        this.data = this.generateData();
    }

    public generateData() {
        const data = [];
        for (let i = 0; i < 1000; i++) {
            const obj = {};
            for (const col of this.cols) {
                obj[col.field] = i;
            }
            data.push(obj);
        }
        return data;
    }

    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }

    public scrollTop(newTop: number) {
        this.instance.verticalScrollContainer.getVerticalScroll().scrollTop = newTop;
    }

    public scrollLeft(newLeft: number) {
        this.instance.parentVirtDir.getHorizontalScroll().scrollLeft = newLeft;
    }
}

@Component({
    template: `
        <igx-grid [height]="'300px'" [width]="'800px'" [data]="data" [autoGenerate]="true"></igx-grid>
    `
})
export class NoColumnWidthGridComponent {
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
}

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column [editable]="true" field="FirstName"></igx-column>
            <igx-column field="LastName"></igx-column>
            <igx-column field="age"></igx-column>
        </igx-grid>
        <input type="text" value="text" id="input-test" />
    `
})
export class GridWithEditableColumnComponent {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    public data = [
        { FirstName: "John", LastName: "Brown", age: 20 },
        { FirstName: "Ben", LastName: "Affleck", age: 30 },
        { FirstName: "Tom", LastName: "Riddle", age: 50 }
    ];
}
