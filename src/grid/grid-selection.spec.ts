import { Component, OnInit, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Calendar } from "../calendar";
import { DataType } from "../data-operations/data-util";
import { SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxInputDirective } from "../directives/input/input.directive";
import { STRING_FILTERS } from "../main";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
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

function simulateKeyDown(element, key) {
    const keyOptions: KeyboardEventInit = {
        key
    };

    const keypressEvent = new KeyboardEvent("keydown", keyOptions);

    return new Promise((resolve, reject) => {
        element.dispatchEvent(keypressEvent);
        resolve();
    });
}

describe("IgxGrid - Row Selection", () => {

    beforeEach(async(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [
                GridWithPrimaryKeyComponent,
                GridWithPagingAndSelectionComponent,
                GridWithSelectionComponent,
                GridWithSelectionFilteringComponent,
                GridWithScrollsComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxGridModule.forRoot()
            ]
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
            expect(targetCell.gridAPI.get_cell_by_visible_index).toHaveBeenCalledTimes(3);
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

    it("Should persist through paging - multiple", async(() => {
        const fix = TestBed.createComponent(GridWithPagingAndSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection2;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        const nextBtn: HTMLElement = fix.nativeElement.querySelector(".nextPageBtn");
        const prevBtn: HTMLElement = fix.nativeElement.querySelector(".prevPageBtn");
        expect(grid.rowList.length).toEqual(50, "All 50 rows should initialized");
        const firstRow = grid.getRowByIndex(0);
        const middleRow = grid.getRowByIndex(4);
        const lastRow = grid.getRowByIndex(9);
        expect(firstRow).toBeDefined();
        expect(middleRow).toBeDefined();
        expect(lastRow).toBeDefined();
        const checkboxElement1: HTMLElement = firstRow.nativeElement.querySelector(".igx-checkbox__input");
        const checkboxElement2: HTMLElement = middleRow.nativeElement.querySelector(".igx-checkbox__input");
        const checkboxElement3: HTMLElement = lastRow.nativeElement.querySelector(".igx-checkbox__input");
        // query(By.css(".igx-checkbox__input"))
        expect(firstRow.isSelected).toBeFalsy();
        expect(middleRow.isSelected).toBeFalsy();
        expect(lastRow.isSelected).toBeFalsy();
        checkboxElement1.click();
        checkboxElement2.click();
        checkboxElement3.click();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeTruthy();
            expect(middleRow.isSelected).toBeTruthy();
            expect(lastRow.isSelected).toBeTruthy();
            // expect(selectedRow.nativeElement.class).toContain("igx-grid__tr--selected");
            nextBtn.click();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeFalsy();
            expect(middleRow.isSelected).toBeFalsy();
            expect(lastRow.isSelected).toBeFalsy();
            prevBtn.click();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeTruthy();
            expect(middleRow.isSelected).toBeTruthy();
            expect(lastRow.isSelected).toBeTruthy();
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
    it("Should persist through scrolling", async(() => {
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
            expect(grid.selectedRows()).toBeDefined();
            expect(grid.rowList.first).toBeDefined();
            expect(grid.rowList.first.isSelected).toBeTruthy();
            selectedCell = grid.getCellByColumn("2_0", "Column2");
            const scrollBar = gridElement.querySelector(".igx-vhelper--vertical");
            scrollBar.scrollTop = 500;
            setTimeout(() => {
                fix.detectChanges();
                return fix.whenStable().then(() => {
                    expect(grid.selectedRows()).toBeDefined();
                    expect(grid.rowList.first).toBeDefined();
                    expect(grid.rowList.first.isSelected).toBeFalsy();
                    scrollBar.scrollTop = 0;
                    setTimeout(() => {
                        fix.detectChanges();
                        return fix.whenStable().then(() => {
                            expect(selectedRow.isSelected).toBeTruthy();
                            expect(grid.selectedRows()).toBeDefined();
                            expect(grid.rowList.first).toBeDefined();
                            expect(grid.rowList.first.isSelected).toBeTruthy();
                        });
                    });
                });
            }, 500);
            // expect(selectedRow.nativeElement.class).toContain("igx-grid__tr--selected");
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

    it("Checkbox should select/deselect row", async(() => {
        const fix = TestBed.createComponent(GridWithPagingAndSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection2;
        expect(grid.rowList.length).toEqual(50, "All 50 rows should initialized");
        const firstRow = grid.getRowByIndex(0);
        const secondRow = grid.getRowByIndex(1);
        spyOn(grid, "triggerRowSelectionChange").and.callThrough();
        spyOn(grid.onRowSelectionChange, "emit").and.callThrough();
        expect(firstRow).toBeDefined();
        expect(secondRow).toBeDefined();
        const targetCheckbox: HTMLElement = firstRow.nativeElement.querySelector(".igx-checkbox__input");
        expect(firstRow.isSelected).toBeFalsy();
        expect(secondRow.isSelected).toBeFalsy();
        targetCheckbox.click();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeTruthy();
            expect(secondRow.isSelected).toBeFalsy();
            targetCheckbox.click();
        }).then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeFalsy();
            expect(secondRow.isSelected).toBeFalsy();
            expect(grid.triggerRowSelectionChange).toHaveBeenCalledTimes(2);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
        });
    }));

    it("Should have checkbox on each row if rowSelectable is true", async(() => {
        const fix = TestBed.createComponent(GridWithScrollsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection5;

        grid.rowSelectable = false;

        for (const row of grid.rowList.toArray()) {
            const checkBoxElement = row.nativeElement.querySelector("div.igx-grid__cbx-selection");
            expect(checkBoxElement).toBeNull();
        }

        grid.rowSelectable = true;
        for (const row of grid.rowList.toArray()) {
            const checkBoxElement = row.nativeElement.querySelector("div.igx-grid__cbx-selection");
            expect(checkBoxElement).toBeDefined();

            const checkboxInputElement = checkBoxElement.querySelector(".igx-checkbox__input");
            expect(checkboxInputElement).toBeDefined();
        }

        const horScroll = grid.parentVirtDir.getHorizontalScroll();
        horScroll.scrollLeft = 1000;
        fix.whenStable().then(() => {
            for (const row of grid.rowList.toArray()) {
                // ensure we were scroll - the first cell's column index should not be 0
                const firstCellColumnIndex = row.cells.toArray()[0].columnIndex;
                expect(firstCellColumnIndex).not.toEqual(0);

                const checkBoxElement = row.nativeElement.querySelector("div.igx-grid__cbx-selection");
                expect(checkBoxElement).toBeDefined();

                const checkboxInputElement = checkBoxElement.querySelector(".igx-checkbox__input");
                expect(checkboxInputElement).toBeDefined();
            }
        });
    }));

    // API Methods

    it("Filtering and row selection", async(() => {
        const fix = TestBed.createComponent(GridWithSelectionFilteringComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection4;
        const secondRow = grid.getRowByIndex(1);
        const targetCheckbox: HTMLElement = secondRow.nativeElement.querySelector(".igx-checkbox__input");

        targetCheckbox.click();
        fix.detectChanges();
        expect(grid.getRowByIndex(1).isSelected).toBeTruthy();
        spyOn(grid.onRowSelectionChange, "emit").and.callFake((args) => { args.newSelection = args.oldSelection; });
        targetCheckbox.click();
        fix.detectChanges();
        expect(grid.getRowByIndex(1).isSelected).toBeTruthy();
        expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);
    }));

    it("Should be able to select/deselect rows programatically", async(() => {
        const fix = TestBed.createComponent(GridWithSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection3;
        let rowsCollection = [];
        const firstRow = grid.getRowByKey("0_0");
        const secondRow = grid.getRowByKey("0_1");
        const thirdRow = grid.getRowByKey("0_2");
        spyOn(grid, "triggerRowSelectionChange").and.callThrough();
        spyOn(grid.onRowSelectionChange, "emit").and.callThrough();
        rowsCollection = grid.selectedRows();
        expect(rowsCollection).toBeUndefined();
        expect(firstRow.isSelected).toBeFalsy();
        expect(secondRow.isSelected).toBeFalsy();
        expect(thirdRow.isSelected).toBeFalsy();
        grid.deselectRows(["0_0", "0_1", "0_2"]);
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(rowsCollection).toBeUndefined();
        });
        grid.selectRows(["0_0", "0_1", "0_2"], false);
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeTruthy();
            expect(secondRow.isSelected).toBeTruthy();
            expect(thirdRow.isSelected).toBeTruthy();
            rowsCollection = grid.selectedRows();
            expect(rowsCollection.length).toEqual(3);
            grid.deselectRows(["0_0", "0_1", "0_2"]);
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeFalsy();
            expect(secondRow.isSelected).toBeFalsy();
            expect(thirdRow.isSelected).toBeFalsy();
            rowsCollection = grid.selectedRows();
            expect(rowsCollection.length).toEqual(0);
            expect(grid.triggerRowSelectionChange).toHaveBeenCalledTimes(3);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(3);
        });
    }));

    it("Should be able to select/deselect ALL rows programatically", async(() => {
        const fix = TestBed.createComponent(GridWithSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection3;
        let rowsCollection = [];
        const firstRow = grid.getRowByKey("0_0");
        rowsCollection = grid.selectedRows();
        expect(rowsCollection).toBeUndefined();
        expect(firstRow.isSelected).toBeFalsy();
        spyOn(grid, "triggerRowSelectionChange").and.callThrough();
        spyOn(grid.onRowSelectionChange, "emit").and.callThrough();
        grid.selectAllRows();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeTruthy();
            rowsCollection = grid.selectedRows();
            expect(rowsCollection.length).toEqual(500);
            grid.deselectAllRows();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeFalsy();
            rowsCollection = grid.selectedRows();
            expect(rowsCollection.length).toEqual(0);
            expect(grid.triggerRowSelectionChange).toHaveBeenCalledTimes(2);
            expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);
        });
    }));

    it("Filtering and row selection", async(() => {
        const fix = TestBed.createComponent(GridWithSelectionFilteringComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection4;
        const headerRow: HTMLElement = fix.nativeElement.querySelector(".igx-grid__thead");
        const headerCheckbox: HTMLInputElement = headerRow.querySelector(".igx-checkbox__input");
        spyOn(grid.onRowSelectionChange, "emit").and.callThrough();

        const secondRow = grid.getRowByIndex(1);
        expect(secondRow).toBeDefined();
        const targetCheckbox: HTMLElement = secondRow.nativeElement.querySelector(".igx-checkbox__input");
        expect(secondRow.isSelected).toBeFalsy();

        let rowsCollection = [];

        rowsCollection = grid.selectedRows();
        expect(rowsCollection).toBeUndefined();

        grid.filter("ProductName", "Ignite", STRING_FILTERS.contains, true);
        fix.detectChanges();
        expect(headerCheckbox.checked).toBeFalsy();
        expect(headerCheckbox.indeterminate).toBeFalsy();
        expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(0);
        rowsCollection = grid.selectedRows();
        expect(rowsCollection).toBeUndefined();
        expect(headerCheckbox.getAttribute("aria-checked")).toMatch("false");
        expect(headerCheckbox.getAttribute("aria-label")).toMatch("Select all filtered");
        grid.clearFilter("ProductName");
        expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(0);
        fix.detectChanges();

        targetCheckbox.click();
        fix.detectChanges();
        expect(secondRow.isSelected).toBeTruthy();
        expect(headerCheckbox.checked).toBeFalsy();
        expect(headerCheckbox.indeterminate).toBeTruthy();
        expect(secondRow.isSelected).toBeTruthy();
        expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);

        grid.filter("ProductName", "Ignite", STRING_FILTERS.contains, true);
        fix.detectChanges();
        expect(headerCheckbox.checked).toBeFalsy();
        expect(headerCheckbox.indeterminate).toBeFalsy();
        expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(1);

        headerCheckbox.click();
        fix.detectChanges();
        expect(headerCheckbox.checked).toBeTruthy();
        expect(headerCheckbox.indeterminate).toBeFalsy();
        expect(headerCheckbox.getAttribute("aria-checked")).toMatch("true");
        expect(headerCheckbox.getAttribute("aria-label")).toMatch("Deselect all filtered");
        expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(2);

        grid.clearFilter("ProductName");
        fix.detectChanges();
        // expect(headerCheckbox.checked).toBeFalsy();
        expect(headerCheckbox.indeterminate).toBeTruthy();
        expect(grid.getRowByIndex(0).isSelected).toBeTruthy();
        expect(grid.getRowByIndex(1).isSelected).toBeTruthy();
        expect(grid.getRowByIndex(2).isSelected).toBeTruthy();

        grid.filter("ProductName", "Ignite", STRING_FILTERS.contains, true);
        fix.detectChanges();
        expect(headerCheckbox.checked).toBeTruthy();
        expect(headerCheckbox.indeterminate).toBeFalsy();
        headerCheckbox.click();
        fix.detectChanges();
        expect(headerCheckbox.checked).toBeFalsy();
        expect(headerCheckbox.indeterminate).toBeFalsy();
        expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(3);

        grid.clearFilter("ProductName");
        fix.detectChanges();
        expect(headerCheckbox.checked).toBeFalsy();
        expect(headerCheckbox.indeterminate).toBeTruthy();
        expect(grid.getRowByIndex(0).isSelected).toBeFalsy();
        expect(grid.getRowByIndex(1).isSelected).toBeTruthy();
        expect(grid.getRowByIndex(2).isSelected).toBeFalsy();
        expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(3);

        grid.getRowByIndex(0).nativeElement.querySelector(".igx-checkbox__input").click();
        fix.detectChanges();
        expect(headerCheckbox.checked).toBeFalsy();
        expect(headerCheckbox.indeterminate).toBeTruthy();
        expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(4);

        grid.filter("ProductName", "Ignite", STRING_FILTERS.contains, true);
        fix.detectChanges();
        expect(headerCheckbox.checked).toBeFalsy();
        expect(headerCheckbox.indeterminate).toBeTruthy();
        expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(4);

        headerCheckbox.click();
        fix.detectChanges();
        headerCheckbox.click();
        fix.detectChanges();
        expect(headerCheckbox.checked).toBeFalsy();
        expect(headerCheckbox.indeterminate).toBeFalsy();
        expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(6);

        grid.clearFilter("ProductName");
        fix.detectChanges();
        expect(grid.getRowByIndex(0).isSelected).toBeFalsy();
        expect(grid.getRowByIndex(1).isSelected).toBeTruthy();
        expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(6);
    }));

    it("Should have persistent selection through data operations - sorting", async(() => {
        const fix = TestBed.createComponent(GridWithSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection3;
        const headerRow: HTMLElement = fix.nativeElement.querySelector(".igx-grid__thead");
        const headerCheckbox: HTMLInputElement = headerRow.querySelector(".igx-checkbox__input");
        const firstRow = grid.getRowByIndex(0);
        const secondRow = grid.getRowByIndex(1);
        expect(firstRow).toBeDefined();
        expect(secondRow).toBeDefined();
        const targetCheckbox: HTMLElement = secondRow.nativeElement.querySelector(".igx-checkbox__input");
        expect(firstRow.isSelected).toBeFalsy();
        expect(secondRow.isSelected).toBeFalsy();
        let rowsCollection = [];
        rowsCollection = grid.selectedRows();
        expect(rowsCollection).toBeUndefined();

        grid.selectRows(["0_0", "0_1"], false);
        fix.detectChanges();
        expect(firstRow.isSelected).toBeTruthy();
        expect(secondRow.isSelected).toBeTruthy();
        expect(grid.rowList.find((row) => row === firstRow)).toBeTruthy();

        grid.sort("Column1", SortingDirection.Desc, true);
        console.log("Sorting started");
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeFalsy();
            expect(secondRow.isSelected).toBeFalsy();
            grid.clearSort("Column1");
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeTruthy();
            expect(secondRow.isSelected).toBeTruthy();
        });
    }));

    it("Clicking any other cell is not selecting the row", async(() => {
        const fix = TestBed.createComponent(GridWithPagingAndSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection2;
        expect(grid.rowList.length).toEqual(50, "All 50 rows should initialized");
        const firstRow = grid.getRowByIndex(0);
        const rv = fix.debugElement.query(By.css(".igx-grid__td"));
        expect(firstRow).toBeDefined();
        expect(firstRow.isSelected).toBeFalsy();

        rv.nativeElement.dispatchEvent(new Event("focus"));

        fix.whenStable().then(() => {
            fix.detectChanges();
            rv.triggerEventHandler("click", {});
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeFalsy();
        });
    }));

    it("Clicking any other cell is not deselecting the row", async(() => {
        const fix = TestBed.createComponent(GridWithPagingAndSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection2;
        expect(grid.rowList.length).toEqual(50, "All 50 rows should initialized");
        const firstRow = grid.getRowByIndex(0);
        const rv = fix.debugElement.query(By.css(".igx-grid__td"));
        expect(rv).toBeDefined();
        expect(firstRow).toBeDefined();
        const targetCheckbox: HTMLElement = firstRow.nativeElement.querySelector(".igx-checkbox__input");
        expect(firstRow.isSelected).toBeFalsy();
        targetCheckbox.click();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeTruthy();
            rv.nativeElement.dispatchEvent(new Event("focus"));
            rv.triggerEventHandler("click", {});
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(firstRow.isSelected).toBeTruthy();
        });
    }));

    it("ARIA support", async(() => {
        const fix = TestBed.createComponent(GridWithSelectionFilteringComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection4;
        const firstRow = grid.getRowByIndex(0).nativeElement;
        const headerRow: HTMLElement = fix.nativeElement.querySelector(".igx-grid__thead");
        const headerCheckboxElement: HTMLElement = headerRow.querySelector(".igx-checkbox__input");

        fix.detectChanges();

        expect(firstRow.getAttribute("aria-selected")).toMatch("false");
        expect(headerCheckboxElement.getAttribute("aria-checked")).toMatch("false");
        expect(headerCheckboxElement.getAttribute("aria-label")).toMatch("Select all");
        headerCheckboxElement.click();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(firstRow.getAttribute("aria-selected")).toMatch("true");
            expect(headerCheckboxElement.getAttribute("aria-checked")).toMatch("true");
            expect(headerCheckboxElement.getAttribute("aria-label")).toMatch("Deselect all");
            headerCheckboxElement.click();
        }).then(() => {
            fix.detectChanges();
            expect(firstRow.getAttribute("aria-selected")).toMatch("false");
            expect(headerCheckboxElement.getAttribute("aria-checked")).toMatch("false");
            expect(headerCheckboxElement.getAttribute("aria-label")).toMatch("Select all");
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
        [autoGenerate]="true" [rowSelectable]="true" [paging]="true" [perPage]="50">
        </igx-grid>
        <button class="prevPageBtn" (click)="ChangePage(-1)">Prev page</button>
        <button class="nextPageBtn" (click)="ChangePage(1)">Next page</button>
    `
})
export class GridWithPagingAndSelectionComponent implements OnInit {
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
        [autoGenerate]="true" [rowSelectable]="true">
        </igx-grid>
    `
})
export class GridWithSelectionComponent implements OnInit {
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

@Component({
    template: `<igx-grid #gridSelection4 [data]="data" height="500px" [rowSelectable]="true">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" [filterable]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
            [filterable]="true" dataType="date">
        </igx-column>
    </igx-grid>`
})
export class GridWithSelectionFilteringComponent {

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    @ViewChild("gridSelection4", { read: IgxGridComponent })
    public gridSelection4: IgxGridComponent;

    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: "Ignite UI for JavaScript",
            ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 15),
            Released: false
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: "NetAdvantage",
            ReleaseDate: this.timeGenerator.timedelta(this.today, "month", -1),
            Released: true
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: "Ignite UI for Angular",
            ReleaseDate: null,
            Released: null
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, "day", -1),
            Released: true
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: "",
            ReleaseDate: undefined,
            Released: ""
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: "Some other item with Script",
            ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 1),
            Released: null
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, "month", 1),
            Released: true
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: this.today,
            Released: false
        }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

@Component({
    template: `
            <igx-grid #gridSelection3
            [data]="data"
            [primaryKey]="'ID'"
            [width]="'800px'"
            [height]="'600px'"
            [autoGenerate]="true"
            [rowSelectable]="true"
            (onColumnInit)="columnCreated($event)"
        >
        </igx-grid>
    `
})
export class GridWithScrollsComponent implements OnInit {
    public data = [];

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public gridSelection5: IgxGridComponent;

    ngOnInit() {
        this.data = this.getData();
    }

    public getData(rows: number = 100, cols: number = 100): any[] {
        const bigData = [];
        for (let i = 0; i < rows; i++) {
            const row = {};
            row["ID"] = i.toString();
            for (let j = 1; j < cols; j++) {
                row["Column " + j] = i * j;
            }

            bigData.push(row);
        }
        return bigData;
    }

    public columnCreated(column: IgxColumnComponent) {
        column.width = "50px";
    }
}
