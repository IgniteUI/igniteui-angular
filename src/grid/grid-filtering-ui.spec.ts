import { Component, DebugElement, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BOOLEAN_FILTERS, DATE_FILTERS, FilteringCondition,
    NUMBER_FILTERS, STRING_FILTERS } from "../../src/data-operations/filtering-condition";
import { Calendar, ICalendarDate } from "../calendar/calendar";
import { FilteringLogic, IFilteringExpression } from "../data-operations/filtering-expression.interface";
import { IgxInputDirective } from "../directives/input/input.directive";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - Filtering actions", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxGridModule.forRoot()]
        })
        .compileComponents();
    }));

    it("UI - do not filter when selecting not unary conditions and input is empty", async(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.query(By.css("igx-grid-filter"));
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        let input = filterUIContainer.query(By.directive(IgxInputDirective));
        const select = filterUIContainer.query(By.css("div > select"));
        const options = select.nativeElement.options;
        const resetButt = filterUIContainer.queryAll(By.css("button"))[0];
        const filtButt = filterUIContainer.queryAll(By.css("button"))[1];

        expect(grid.rowList.length).toEqual(8);

        filterIcon.nativeElement.click();
        fix.detectChanges();

        fix.whenStable().then(() => {
            fix.detectChanges();

            // starts with
            options[1].selected = true;
            select.nativeElement.dispatchEvent(new Event("change"));
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(8);
            expect(filtButt.nativeElement.classList.contains("igx-button--disabled")).toBeTruthy();
            expect(resetButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

            // ends with
            options[2].selected = true;
            select.nativeElement.dispatchEvent(new Event("change"));
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(8);
            expect(filtButt.nativeElement.classList.contains("igx-button--disabled")).toBeTruthy();
            expect(resetButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

            // does not contain
            options[3].selected = true;
            select.nativeElement.dispatchEvent(new Event("change"));
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(8);
            expect(filtButt.nativeElement.classList.contains("igx-button--disabled")).toBeTruthy();
            expect(resetButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

            // equals
            options[4].selected = true;
            select.nativeElement.dispatchEvent(new Event("change"));
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(8);
            expect(filtButt.nativeElement.classList.contains("igx-button--disabled")).toBeTruthy();
            expect(resetButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

            // does not equal
            options[5].selected = true;
            select.nativeElement.dispatchEvent(new Event("change"));
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(8);
            expect(filtButt.nativeElement.classList.contains("igx-button--disabled")).toBeTruthy();
            expect(resetButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

            // null
            options[6].selected = true;
            select.nativeElement.dispatchEvent(new Event("change"));
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(3);
            expect(filtButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(resetButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(input.nativeElement.offsetHeight).toEqual(0);

            // not null
            options[7].selected = true;
            select.nativeElement.dispatchEvent(new Event("change"));
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(5);
            expect(filtButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(resetButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(input.nativeElement.offsetHeight).toEqual(0);

            // empty
            options[8].selected = true;
            select.nativeElement.dispatchEvent(new Event("change"));
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(4);
            expect(filtButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(resetButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(input.nativeElement.offsetHeight).toEqual(0);

            // not empty
            options[9].selected = true;
            select.nativeElement.dispatchEvent(new Event("change"));
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(4);
            expect(filtButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(resetButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(input.nativeElement.offsetHeight).toEqual(0);

            // contains - filter should keep its state and not be reset
            options[0].selected = true;
            select.nativeElement.dispatchEvent(new Event("change"));
            fix.detectChanges();
            input = filterUIContainer.query(By.directive(IgxInputDirective));
            expect(grid.rowList.length).toEqual(4);
            expect(filtButt.nativeElement.classList.contains("igx-button--disabled")).toBeTruthy();
            expect(resetButt.nativeElement.classList.contains("igx-button--disabled")).toBeFalsy();
            expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
        });
    }));

    // UI tests string column
    it("UI - should correctly filter string column by 'Contains' filtering conditions", (done) => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.query(By.css("igx-grid-filter"));
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();

        sendInput(input, "NetAdvantage", fix).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterUIContainer, grid);
            expect(grid.rowList.length).toEqual(1);
            expect(grid.getCellByColumn(0, "ID").value).toEqual(2);
            expect(grid.getCellByColumn(0, "ProductName").value).toMatch("NetAdvantage");
            done();
        });
    });

    it("UI - should correctly filter string column by 'DoesNotContain' filtering conditions", (done) => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.query(By.css("igx-grid-filter"));
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));
        const select = filterUIContainer.query(By.css("div > select"));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "doesNotContain";
        select.nativeElement.dispatchEvent(new Event("change"));

        sendInput(input, "Ignite", fix).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterUIContainer, grid);
            expect(grid.rowList.length).toEqual(6);
            expect(grid.getCellByColumn(0, "ProductName").value).toMatch("NetAdvantage");
            expect(grid.getCellByColumn(1, "ProductName").value).toEqual(null);
            expect(grid.getCellByColumn(2, "ProductName").value).toMatch("");
            expect(grid.getCellByColumn(3, "ProductName").value).toMatch("Some other item with Script");
            done();
        });
    });

    it("UI - should correctly filter string column by 'StartsWith' filtering conditions", (done) => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.query(By.css("igx-grid-filter"));
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));
        const select = filterUIContainer.query(By.css("div > select"));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "startsWith";
        select.nativeElement.dispatchEvent(new Event("change"));

        sendInput(input, "Net", fix).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterUIContainer, grid);
            expect(grid.rowList.length).toEqual(1);
            expect(grid.getCellByColumn(0, "ID").value).toEqual(2);
            expect(grid.getCellByColumn(0, "ProductName").value).toMatch("NetAdvantage");
            done();
        });
    });

    it("UI - should correctly filter string column by 'EndsWith' filtering conditions", (done) => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.query(By.css("igx-grid-filter"));
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));
        const select = filterUIContainer.query(By.css("div > select"));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "endsWith";
        select.nativeElement.dispatchEvent(new Event("change"));

        sendInput(input, "for", fix).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterUIContainer, grid);
            expect(grid.rowList.length).toEqual(0);
            done();
        });
    });

    it("UI - should correctly filter string column by 'Equals' filtering conditions", (done) => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.query(By.css("igx-grid-filter"));
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));
        const select = filterUIContainer.query(By.css("div > select"));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "equals";
        select.nativeElement.dispatchEvent(new Event("change"));

        sendInput(input, "Some other item with Script", fix).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterUIContainer, grid);
            expect(grid.rowList.length).toEqual(1);
            expect(grid.getCellByColumn(0, "ID").value).toEqual(6);
            expect(grid.getCellByColumn(0, "ProductName").value).toMatch("Some other item with Script");
            done();
        });
    });

    it("UI - should correctly filter string column by 'doesNotEqual' filtering conditions", (done) => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.query(By.css("igx-grid-filter"));
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));
        const select = filterUIContainer.query(By.css("div > select"));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "doesNotEqual";
        select.nativeElement.dispatchEvent(new Event("change"));

        sendInput(input, "NetAdvantage", fix).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterUIContainer, grid);
            expect(grid.rowList.length).toEqual(7);
            expect(grid.getCellByColumn(0, "ProductName").value).toMatch("Ignite UI for JavaScript");
            expect(grid.getCellByColumn(1, "ProductName").value).toMatch("Ignite UI for Angular");
            expect(grid.getCellByColumn(4, "ProductName").value).toMatch("Some other item with Script");
            done();
        });
    });

    it("UI - should correctly filter string column by 'Empty' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.query(By.css("igx-grid-filter"));
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "empty";
        select.nativeElement.dispatchEvent(new Event("change"));

        fix.detectChanges();
        expect(grid.rowList.length).toEqual(4);
        expect(grid.getCellByColumn(0, "ProductName").value).toMatch("");
        expect(grid.getCellByColumn(1, "ProductName").value).toMatch("");
        expect(grid.getCellByColumn(2, "ProductName").value).toMatch("");
        expect(grid.getCellByColumn(3, "ProductName").value).toMatch("");

    });

    it("UI - should correctly filter string column by 'NotEmpty' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.query(By.css("igx-grid-filter"));
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "notEmpty";
        select.nativeElement.dispatchEvent(new Event("change"));

        fix.detectChanges();
        expect(grid.rowList.length).toEqual(4);
        expect(grid.getCellByColumn(0, "ProductName").value).toMatch("Ignite UI for JavaScript");
        expect(grid.getCellByColumn(1, "ProductName").value).toMatch("NetAdvantage");
        expect(grid.getCellByColumn(2, "ProductName").value).toMatch("Ignite UI for Angular");
        expect(grid.getCellByColumn(3, "ProductName").value).toMatch("Some other item with Script");
    });

    it("UI - should correctly filter string column by 'null' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.query(By.css("igx-grid-filter"));
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "null";
        select.nativeElement.dispatchEvent(new Event("change"));

        fix.detectChanges();
        expect(grid.rowList.length).toEqual(3);
        expect(grid.getCellByColumn(0, "ProductName").value).toEqual(null);
        expect(grid.getCellByColumn(1, "ProductName").value).toEqual(null);
        expect(grid.getCellByColumn(2, "ProductName").value).toEqual(null);

    });

    it("UI - should correctly filter string column by 'NotNull' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.query(By.css("igx-grid-filter"));
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "notNull";
        select.nativeElement.dispatchEvent(new Event("change"));

        fix.detectChanges();
        expect(grid.rowList.length).toEqual(5);
        expect(grid.getCellByColumn(3, "ProductName").value).toMatch("");
    });

    // UI tests boolean column
    it("UI - should correctly filter boolean by 'true' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[2];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));

        filterIcon.nativeElement.click();
        fix.detectChanges();

        select.nativeElement.value = "true";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(3);
        expect(grid.getCellByColumn(0, "Released").value).toBe(true);
        expect(grid.getCellByColumn(1, "Released").value).toBe(true);
        expect(grid.getCellByColumn(2, "Released").value).toBe(true);
    });

    it("UI - should correctly filter boolean by 'false' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[2];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "false";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(5);
        expect(grid.getCellByColumn(0, "Released").value).toBeFalsy();
        expect(grid.getCellByColumn(1, "Released").value).toBeFalsy();
        expect(grid.getCellByColumn(2, "Released").value).toBeFalsy();
        expect(grid.getCellByColumn(1, "Released").value).toBeFalsy();
        expect(grid.getCellByColumn(2, "Released").value).toBeFalsy();
    });

    it("UI - should correctly filter boolean by 'null' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[2];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "null";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);
        expect(grid.getCellByColumn(0, "Released").value).toEqual(null);
        expect(grid.getCellByColumn(1, "Released").value).toEqual(null);
    });

    it("UI - should correctly filter boolean by 'notNull' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[2];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "notNull";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(6);
        expect(grid.getCellByColumn(0, "Released").value).toBe(false);
        expect(grid.getCellByColumn(1, "Released").value).toBe(true);
        expect(grid.getCellByColumn(2, "Released").value).toBe(true);
        expect(grid.getCellByColumn(3, "Released").value).toMatch("");
        expect(grid.getCellByColumn(4, "Released").value).toBe(true);
        expect(grid.getCellByColumn(5, "Released").value).toBe(false);
    });

    it("UI - should correctly filter boolean by 'empty' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[2];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "empty";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);
        expect(grid.getCellByColumn(0, "Released").value).toEqual(null);
        expect(grid.getCellByColumn(1, "Released").value).toEqual(null);
    });

    it("UI - should correctly filter boolean by 'notEmpty' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[2];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "notEmpty";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(6);
        expect(grid.getCellByColumn(0, "Released").value).toBe(false);
        expect(grid.getCellByColumn(1, "Released").value).toBe(true);
        expect(grid.getCellByColumn(2, "Released").value).toBe(true);
        expect(grid.getCellByColumn(3, "Released").value).toMatch("");
        expect(grid.getCellByColumn(4, "Released").value).toBe(true);
        expect(grid.getCellByColumn(5, "Released").value).toBe(false);
    });

    // UI tests number column
    it("UI - should correctly filter number column by 'Equal' filtering conditions", (done) => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[1];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));
        const select = filterUIContainer.query(By.css("div > select"));
        const options = select.nativeElement.options;

        filterIcon.nativeElement.click();
        fix.detectChanges();

        options[0].selected = true;
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        sendInput(input, 100, fix).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterUIContainer, grid);
            expect(grid.rowList.length).toEqual(1);
            expect(grid.getCellByColumn(0, "Downloads").value).toEqual(100);
            done();
        });
    });

    it("UI - should correctly filter number column by 'DoesNotEqual' filtering conditions", (done) => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[1];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "doesNotEqual";
        select.nativeElement.dispatchEvent(new Event("change"));

        sendInput(input, 100, fix).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterUIContainer, grid);
            expect(grid.rowList.length).toEqual(7);
            expect(grid.getCellByColumn(6, "Downloads").value).toEqual(1000);
            done();
        });
    });

    it("UI - should correctly filter number column by 'GreaterThan' filtering conditions", (done) => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[1];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "greaterThan";
        select.nativeElement.dispatchEvent(new Event("change"));

        sendInput(input, 300, fix).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterUIContainer, grid);
            expect(grid.rowList.length).toEqual(2);
            expect(grid.getCellByColumn(0, "Downloads").value).toEqual(702);
            expect(grid.getCellByColumn(1, "Downloads").value).toEqual(1000);
            done();
        });
    });

    it("UI - should correctly filter number column by 'LessThan' filtering conditions", (done) => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[1];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "lessThan";
        select.nativeElement.dispatchEvent(new Event("change"));

        sendInput(input, 100, fix).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterUIContainer, grid);
            expect(grid.rowList.length).toEqual(3);
            expect(grid.getCellByColumn(0, "Downloads").value).toEqual(20);
            expect(grid.getCellByColumn(1, "Downloads").value).toEqual(null);
            expect(grid.getCellByColumn(2, "Downloads").value).toEqual(0);
            done();
        });
    });

    it("UI - should correctly filter number column by 'greaterThanOrEqualTo' filtering conditions", (done) => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[1];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "greaterThanOrEqualTo";
        select.nativeElement.dispatchEvent(new Event("change"));

        sendInput(input, 254, fix).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterUIContainer, grid);
            expect(grid.rowList.length).toEqual(3);
            expect(grid.getCellByColumn(0, "Downloads").value).toEqual(254);
            expect(grid.getCellByColumn(1, "Downloads").value).toEqual(702);
            expect(grid.getCellByColumn(2, "Downloads").value).toEqual(1000);
            done();
        });
    });

    it("UI - should correctly filter number column by 'lessThanOrEqualTo' filtering conditions", (done) => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[1];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "lessThanOrEqualTo";
        select.nativeElement.dispatchEvent(new Event("change"));

        sendInput(input, 20, fix).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterUIContainer, grid);
            expect(grid.rowList.length).toEqual(3);
            expect(grid.getCellByColumn(0, "Downloads").value).toEqual(20);
            expect(grid.getCellByColumn(1, "Downloads").value).toEqual(null);
            expect(grid.getCellByColumn(2, "Downloads").value).toEqual(0);
            done();
        });
    });

    it("UI - should correctly filter number column number column by 'null' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[1];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.triggerEventHandler("mousedown", null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "null";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, "ID").value).toEqual(4);
        expect(grid.getCellByColumn(0, "Downloads").value).toEqual(null);
    });

    it("UI - should correctly filter number column by 'notNull' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[1];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "notNull";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(7);
    });

    it("UI - should correctly filter number column by 'empty' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[1];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "empty";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, "ID").value).toEqual(4);
        expect(grid.getCellByColumn(0, "Downloads").value).toEqual(null);
    });

    it("UI - should correctly filter number column by 'notEmpty' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[1];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        select.nativeElement.value = "notEmpty";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(7);
    });

    // UI tests date column
    it("UI - should correctly filter date column by 'today' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));

        filterUIContainer.triggerEventHandler("mousedown", null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterUIContainer, grid);
        select.nativeElement.value = "today";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        // only one record is populated with "today" date, this is why rows must be 1
        expect(grid.rowList.length).toEqual(1);
    });

    it("UI - should correctly filter date column by 'yesterday' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const filterIcon = filterUIContainer.query(By.css("igx-icon"));
        const select = filterUIContainer.query(By.css("div > select"));

        filterUIContainer.triggerEventHandler("mousedown", null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterUIContainer, grid);

        select.nativeElement.value = "yesterday";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        // only one record is populated with (today - 1 day)  date, this is why rows must be 1
        expect(grid.rowList.length).toEqual(1);
    });

    it("UI - should correctly filter date column by 'this month' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const select = filterIcon.query(By.css("div > select"));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler("mousedown", null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = "thisMonth";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[5]);
    });

    it("UI - should correctly filter date column by 'next month' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];

        const select = filterIcon.query(By.css("div > select"));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler("mousedown", null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = "nextMonth";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[1]);
    });

    it("UI - should correctly filter date column by 'last month' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const select = filterIcon.query(By.css("div > select"));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler("mousedown", null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = "lastMonth";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[0]);
    });

    it("UI - should correctly filter date column by 'empty' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const select = filterIcon.query(By.css("div > select"));

        filterIcon.triggerEventHandler("mousedown", null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = "empty";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);
    });

    it("UI - should correctly filter date column by 'notEmpty' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const select = filterIcon.query(By.css("div > select"));

        filterIcon.triggerEventHandler("mousedown", null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = "notEmpty";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(6);
    });

    it("UI - should correctly filter date column by 'null' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const select = filterIcon.query(By.css("div > select"));

        filterIcon.triggerEventHandler("mousedown", null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = "null";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
    });

    it("UI - should correctly filter date column by 'notNull' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const select = filterIcon.query(By.css("div > select"));

        filterIcon.triggerEventHandler("mousedown", null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = "notNull";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(7);
    });

    it("UI - should correctly filter date column by 'thisYear' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const select = filterIcon.query(By.css("div > select"));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler("mousedown", null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = "thisYear";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[2]);
    });

    it("UI - should correctly filter date column by 'lastYear' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const select = filterIcon.query(By.css("div > select"));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler("mousedown", null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = "lastYear";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[4]);
    });

    it("UI - should correctly filter date column by 'nextYear' filtering conditions", () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const select = filterIcon.query(By.css("div > select"));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler("mousedown", null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = "nextYear";
        select.nativeElement.dispatchEvent(new Event("change"));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[3]);
    });

    it("UI - should correctly filter date column by 'equals' filtering conditions", async(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const select = filterIcon.query(By.css("div > select"));
        const input = filterIcon.query(By.directive(IgxInputDirective));

        fix.whenStable().then(() => {
            filterIcon.triggerEventHandler("mousedown", null);
            fix.detectChanges();
            filterIcon.nativeElement.click();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterIcon, grid);
            select.nativeElement.value = "equals";
            select.nativeElement.dispatchEvent(new Event("change"));
            input.nativeElement.click();
            return fix.whenRenderingDone();
        }).then(() => {
            fix.detectChanges();
             // pick a date from the date picker
            const calendar = fix.debugElement.query(By.css("igx-calendar"));
            const currentDay = calendar.query(By.css("span.igx-calendar__date--current"));
            currentDay.nativeElement.click();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            input.nativeElement.dispatchEvent(new Event("change"));
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(1);
        });

    }));

    it("UI - should correctly filter date column by 'doesNotEqual' filtering conditions", async(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const select = filterIcon.query(By.css("div > select"));
        const input = filterIcon.query(By.directive(IgxInputDirective));

        fix.whenStable().then(() => {
            filterIcon.triggerEventHandler("mousedown", null);
            fix.detectChanges();
            filterIcon.nativeElement.click();
            verifyFilterUIPosition(filterIcon, grid);
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            select.nativeElement.value = "doesNotEqual";
            select.nativeElement.dispatchEvent(new Event("change"));
            input.nativeElement.click();
            return fix.whenRenderingDone();
        }).then(() => {
            fix.detectChanges();
             // pick a date from the date picker
            const calendar = fix.debugElement.query(By.css("igx-calendar"));
            const currentDay = calendar.query(By.css("span.igx-calendar__date--current"));
            currentDay.nativeElement.click();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            input.nativeElement.dispatchEvent(new Event("change"));
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(7);
        });
    }));

    it("UI - should correctly filter date column by 'after' filtering conditions", async(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const select = filterIcon.query(By.css("div > select"));
        const input = filterIcon.query(By.directive(IgxInputDirective));

        fix.whenStable().then(() => {
            filterIcon.triggerEventHandler("mousedown", null);
            fix.detectChanges();
            filterIcon.nativeElement.click();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterIcon, grid);
            select.nativeElement.value = "after";
            select.nativeElement.dispatchEvent(new Event("change"));
            input.nativeElement.click();
            return fix.whenRenderingDone();
        }).then(() => {
            fix.detectChanges();
             // pick a date from the date picker
            const calendar = fix.debugElement.query(By.css("igx-calendar"));
            const currentDay = calendar.query(By.css("span.igx-calendar__date--current"));
            currentDay.nativeElement.click();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            input.nativeElement.dispatchEvent(new Event("change"));
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(3);
        });
    }));

    it("UI - should correctly filter date column by 'before' filtering conditions", async(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const select = filterIcon.query(By.css("div > select"));
        const input = filterIcon.query(By.directive(IgxInputDirective));

        fix.whenStable().then(() => {
            filterIcon.triggerEventHandler("mousedown", null);
            fix.detectChanges();
            filterIcon.nativeElement.click();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            verifyFilterUIPosition(filterIcon, grid);
            select.nativeElement.value = "before";
            select.nativeElement.dispatchEvent(new Event("change"));
            input.nativeElement.click();
            return fix.whenRenderingDone();
        }).then(() => {
            fix.detectChanges();
             // pick a date from the date picker
            const calendar = fix.debugElement.query(By.css("igx-calendar"));
            const currentDay = calendar.query(By.css("span.igx-calendar__date--current"));
            currentDay.nativeElement.click();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            input.nativeElement.dispatchEvent(new Event("change"));
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(4);
        });
    }));

    it("Should correctly select month from month view datepicker/calendar component", async(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const input = filterIcon.query(By.directive(IgxInputDirective));

        fix.whenStable().then(() => {
            filterIcon.triggerEventHandler("mousedown", null);
            fix.detectChanges();
            filterIcon.nativeElement.click();
            fix.detectChanges();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            input.nativeElement.click();
            fix.detectChanges();

            const calendar = fix.debugElement.query(By.css("igx-calendar"));
            const monthView = calendar.queryAll(By.css(".date__el"))[0];
            monthView.nativeElement.click();

            fix.detectChanges();

            const firstMonth = calendar.queryAll(By.css(".igx-calendar__month"))[0];
            firstMonth.nativeElement.click();

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            const calendar = fix.debugElement.query(By.css("igx-calendar"));
            const month = calendar.queryAll(By.css(".date__el"))[0];

            expect(month.nativeElement.textContent.trim()).toEqual("Jan");
        });
    }));

    it("Should correctly select year from year view datepicker/calendar component", async(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        const filterIcon = fix.debugElement.queryAll(By.css("igx-grid-filter"))[3];
        const input = filterIcon.query(By.directive(IgxInputDirective));

        fix.whenStable().then(() => {
            filterIcon.triggerEventHandler("mousedown", null);
            fix.detectChanges();
            filterIcon.nativeElement.click();
            fix.detectChanges();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            input.nativeElement.click();
            fix.detectChanges();

            const calendar = fix.debugElement.query(By.css("igx-calendar"));
            const monthView = calendar.queryAll(By.css(".date__el"))[1];
            monthView.nativeElement.click();

            fix.detectChanges();

            const firstMonth = calendar.queryAll(By.css(".igx-calendar__year"))[0];
            firstMonth.nativeElement.click();

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            const calendar = fix.debugElement.query(By.css("igx-calendar"));
            const month = calendar.queryAll(By.css(".date__el"))[1];

            const today = new Date(Date.now());

            const expectedResult = today.getFullYear() - 3;
            expect(month.nativeElement.textContent.trim()).toEqual(expectedResult.toString());
        });
    }));
});

@Component({
    template: `<igx-grid [data]="data" height="500px">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" [filterable]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
            [filterable]="true" dataType="date">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringComponent {

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

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

const expectedResults = [];

function sendInput(element, text, fix) {
    element.nativeElement.value = text;
    element.nativeElement.dispatchEvent(new Event("input"));
    fix.detectChanges();
    return fix.whenStable();
}

function verifyFilterUIPosition(filterUIContainer, grid) {
    const filterUiRightBorder = filterUIContainer.nativeElement.offsetParent.offsetLeft +
    filterUIContainer.nativeElement.offsetLeft + filterUIContainer.nativeElement.offsetWidth;
    expect(filterUiRightBorder).toBeLessThanOrEqual(grid.nativeElement.offsetWidth);
}

// Fill expected results for 'date' filtering conditions based on the current date
function fillExpectedResults(grid: IgxGridComponent, calendar: Calendar, today) {
    // day + 15
    const dateItem0 = generateICalendarDate(grid.data[0].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // month - 1
    const dateItem1 = generateICalendarDate(grid.data[1].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // day - 1
    const dateItem3 = generateICalendarDate(grid.data[3].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // day + 1
    const dateItem5 = generateICalendarDate(grid.data[5].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // month + 1
    const dateItem6 = generateICalendarDate(grid.data[6].ReleaseDate,
        today.getFullYear(), today.getMonth());

    let thisMonthCountItems = 1;
    let nextMonthCountItems = 1;
    let lastMonthCountItems = 1;
    let thisYearCountItems = 6;
    let nextYearCountItems = 0;
    let lastYearCountItems = 0;

    // LastMonth filter
    if (dateItem3.isPrevMonth) {
        lastMonthCountItems++;
    }
    expectedResults[0] = lastMonthCountItems;

    // thisMonth filter
    if (dateItem0.isCurrentMonth) {
        thisMonthCountItems++;
    }

    if (dateItem3.isCurrentMonth) {
        thisMonthCountItems++;
    }

    if (dateItem5.isCurrentMonth) {
        thisMonthCountItems++;
    }

    // NextMonth filter
    if (dateItem0.isNextMonth) {
        nextMonthCountItems++;
    }

    if (dateItem5.isNextMonth) {
        nextMonthCountItems++;
    }
    expectedResults[1] = nextMonthCountItems;

    // ThisYear, NextYear, PreviousYear filter

    // day + 15
    if (!dateItem0.isThisYear) {
        thisYearCountItems--;
    } else if (dateItem0.isNextYear) {
        nextYearCountItems++;
    }

    // month - 1
    if (!dateItem1.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem1.isLastYear) {
        lastYearCountItems++;
    }

    // day - 1
    if (!dateItem3.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem3.isLastYear) {
        lastYearCountItems++;
    }

    // day + 1
    if (!dateItem5.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem5.isNextYear) {
        nextYearCountItems++;
    }

    // month + 1
    if (!dateItem6.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem6.isNextYear) {
        nextYearCountItems++;
    }

    // ThisYear filter result
    expectedResults[2] = thisYearCountItems;

    // NextYear filter result
    expectedResults[3] = nextYearCountItems;

    // PreviousYear filter result
    expectedResults[4] = lastYearCountItems;

    // ThisMonth filter result
    expectedResults[5] = thisMonthCountItems;
}

function generateICalendarDate(date: Date, year: number, month: number) {
    return {
        date,
        isCurrentMonth: date.getFullYear() === year && date.getMonth() === month,
        isLastYear: isLastYear(date, year),
        isNextMonth: isNextMonth(date, year, month),
        isNextYear: isNextYear(date, year),
        isPrevMonth: isPreviousMonth(date, year, month),
        isThisYear: isThisYear(date, year)
    };
}

function isPreviousMonth(date: Date, year: number, month: number): boolean {
    if (date.getFullYear() === year) {
        return date.getMonth() < month;
    }
    return date.getFullYear() < year;
}

function isNextMonth(date: Date, year: number, month: number): boolean {
    if (date.getFullYear() === year) {
        return date.getMonth() > month;
    }
    return date.getFullYear() > year;
}

function isThisYear(date: Date, year: number): boolean {
    return date.getFullYear() === year;
}

function isLastYear(date: Date, year: number): boolean {
    return date.getFullYear() < year;
}

function isNextYear(date: Date, year: number): boolean {
    return date.getFullYear() > year;
}
