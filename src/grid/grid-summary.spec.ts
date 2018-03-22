import { Component, DebugElement, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - Summaries", () => {
    const summaryClass = ".igx-grid-summary";
    const summaryLabel = ".igx-grid-summary-item__label";
    const summaryValue = "igx-grid-summary-item__result";
    const itemClass = "igx-grid-summary-item";
    const hiddenItemClass = "igx-grid-summary-item--inactive";

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                NoActiveSummariesComponent,
                SummaryColumnComponent
            ],
            imports: [IgxGridModule.forRoot()]
        })
            .compileComponents();
    }));
    it("should not have summary if no summary is active ", () => {
        const fixture = TestBed.createComponent(NoActiveSummariesComponent);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css(summaryClass))).toBeNull();
    });
    it("should enableSummaries through grid API ", () => {
        const fixture = TestBed.createComponent(NoActiveSummariesComponent);
        fixture.detectChanges();

        const button: DebugElement = fixture.debugElement.query(By.css("button"));
        const grid = fixture.componentInstance.grid1;
        button.triggerEventHandler("click", null);
        fixture.detectChanges();

        const summaries = fixture.debugElement.queryAll(By.css(summaryClass)).length;
        expect(grid.hasSummarizedColumns).toBe(true);
        expect(summaries).toBe(2);
        expect(grid.getColumnByName("ProductID").hasSummary).toBe(true);
        expect(grid.getColumnByName("ProductName").hasSummary).toBe(true);
        expect(grid.getColumnByName("OrderDate").hasSummary).toBe(false);
    });
    it("should have summary per each column that 'hasSummary'= true", () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(summaryClass))).toBeDefined();

        let summaries = 0;
        const summariedColumns = fixture.componentInstance.grid1.columnList.filter((col) => col.hasSummary === true).length;
        fixture.debugElement.queryAll(By.css(summaryClass)).forEach((x) => {
            summaries ++;
        });
        expect(summaries).toBe(summariedColumns);
    });
    it("should have count summary for string and boolean data types", () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const sum = fixture.componentInstance.grid1;
        const summaries = fixture.debugElement.queryAll(By.css("igx-grid-summary"));

        let index = 0;
        sum.columnList.forEach((col) => {
            if (col.hasSummary && (col.dataType === "string" || col.dataType === "boolean")) {
                const labels = summaries[index].queryAll(By.css(summaryLabel));
                expect(labels.length).toBe(1);
                expect(labels[0].nativeElement.innerText).toBe("Count:");
            }
            index++;
        });
    });
    it("should have count, min, max, avg and sum summary for numeric data types", () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const sum = fixture.componentInstance.grid1;
        const summaries = fixture.debugElement.queryAll(By.css("igx-grid-summary"));

        let index = 0;
        sum.columnList.forEach((col) => {
            if (col.hasSummary && (col.dataType === "number")) {
                const labels = summaries[index].queryAll(By.css(summaryLabel));
                expect(labels.length).toBe(5);
                expect(labels[0].nativeElement.innerText).toBe("Count:");
                expect(labels[1].nativeElement.innerText).toBe("Min:");
                expect(labels[2].nativeElement.innerText).toBe("Max:");
                expect(labels[3].nativeElement.innerText).toBe("Sum:");
                expect(labels[4].nativeElement.innerText).toBe("Average:");
            }
            index++;
        });
    });
    it("should have count, earliest and latest summary for numeric data types", () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const sum = fixture.componentInstance.grid1;
        const summaries = fixture.debugElement.queryAll(By.css("igx-grid-summary"));

        let index = 0;
        sum.columnList.forEach((col) => {
            if (col.hasSummary && (col.dataType === "date")) {
                const labels = summaries[index].queryAll(By.css(summaryLabel));
                expect(labels.length).toBe(3);
                expect(labels[0].nativeElement.innerText).toBe("Count:");
                expect(labels[1].nativeElement.innerText).toBe("Earliest:");
                expect(labels[2].nativeElement.innerText).toBe("Latest:");
            }
            index++;
        });
    });
    it("should make inactive/active summary function by click on it's label", () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const summary = fixture.debugElement.queryAll(By.css("igx-grid-summary"))[3];
        const min: DebugElement = summary.query(By.css("[title='Min']"));

        expect(min.parent.nativeElement.classList.contains(itemClass)).toBeTruthy();
        min.triggerEventHandler("click", null);
        fixture.detectChanges();

        expect(min.parent.nativeElement.classList.contains(hiddenItemClass)).toBeTruthy();
        min.triggerEventHandler("click", null);
        fixture.detectChanges();

        expect(min.parent.nativeElement.classList.contains(itemClass)).toBeTruthy();
    });
    it("should recalculate summary functions onRowAdded", () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        const summaries = fixture.debugElement.queryAll(By.css(summaryClass));
        const addButton: DebugElement =  fixture.debugElement.query(By.css("#btnAddRow"));
        let countValue;
        summaries.forEach((summary) => {
            const countLabel = summary.query(By.css("[title='Count']"));
            countValue = countLabel.nativeElement.nextSibling.innerText;
        });
        expect(+countValue).toBe(grid.rowList.length);

        addButton.triggerEventHandler("click", null);
        fixture.detectChanges();

        summaries.forEach((summary) => {
            const countLabel = summary.query(By.css("[title='Count']"));
            countValue = countLabel.nativeElement.nextSibling.innerText;
        });

        expect(+countValue).toBe(grid.rowList.length);
    });
    it("should recalculate summary functions onRowDeleted", () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        const summaries = fixture.debugElement.queryAll(By.css(summaryClass));
        const addButton: DebugElement =  fixture.debugElement.query(By.css("#btnDeleteRow"));
        let countValue;
        summaries.forEach((summary) => {
            const countLabel = summary.query(By.css("[title='Count']"));
            countValue = countLabel.nativeElement.nextSibling.innerText;
        });
        expect(+countValue).toBe(grid.rowList.length);

        addButton.triggerEventHandler("click", null);
        fixture.detectChanges();

        summaries.forEach((summary) => {
            const countLabel = summary.query(By.css("[title='Count']"));
            countValue = countLabel.nativeElement.nextSibling.innerText;
        });
        expect(+countValue).toBe(grid.rowList.length);
    });
    it("should recalculate summary functions updateRow", () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        const summaries = fixture.debugElement.queryAll(By.css(summaryClass));
        const updateButton: DebugElement =  fixture.debugElement.query(By.css("#btnUpdateRow"));
        const productNameCell = grid.getCellByColumn(0, "ProductName");
        const unitsInStockCell = grid.getCellByColumn(0, "UnitsInStock");
        let countValue;
        summaries.forEach((summary) => {
            const countLabel = summary.query(By.css("[title='Count']"));
            countValue = countLabel.nativeElement.nextSibling.innerText;
        });
        expect(+countValue).toBe(grid.rowList.length);
        expect(productNameCell.value).toBe("Chai");
        expect(unitsInStockCell.value).toBe(2760);

        updateButton.triggerEventHandler("click", null);
        fixture.detectChanges();

        expect(+countValue).toBe(grid.rowList.length);
        expect(productNameCell.value).toBe("Spearmint");
        expect(unitsInStockCell.value).toBe(1);
    });
});

@Component({
    template: `
        <igx-grid #grid1 [data]="data">
            <igx-column field="ProductID" header="Product ID">
            </igx-column>
            <igx-column field="ProductName">
            </igx-column>
            <igx-column field="InStock" [dataType]="'boolean'">
            </igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'">
            </igx-column>
            <igx-column field="OrderDate" width="200px" [dataType]="'date'">
            </igx-column>
        </igx-grid>
        <button (click)="enableSummary()">Enable Summary</button>
    `
})
export class  NoActiveSummariesComponent {

    @ViewChild("grid1", { read: IgxGridComponent })
    public grid1: IgxGridComponent;

    public data = [
        { ProductID: 1, ProductName: "Chai", InStock: true, UnitsInStock: 2760, OrderDate: new Date("2005-03-21") },
        { ProductID: 2, ProductName: "Aniseed Syrup", InStock: false, UnitsInStock: 198, OrderDate: new Date("2008-01-15") },
        { ProductID: 3, ProductName: "Chef Antons Cajun Seasoning", InStock: true, UnitsInStock: 52, OrderDate: new Date("2010-11-20") },
        { ProductID: 4, ProductName: "Grandmas Boysenberry Spread", InStock: false, UnitsInStock: 0, OrderDate: new Date("2007-10-11") },
        { ProductID: 5, ProductName: "Uncle Bobs Dried Pears", InStock: false, UnitsInStock: 0, OrderDate: new Date("2001-07-27") },
        { ProductID: 6, ProductName: "Northwoods Cranberry Sauce", InStock: true, UnitsInStock: 1098, OrderDate: new Date("1990-05-17") },
        { ProductID: 7, ProductName: "Queso Cabrales", InStock: false, UnitsInStock: 0, OrderDate: new Date("2005-03-03") },
        { ProductID: 8, ProductName: "Tofu", InStock: true, UnitsInStock: 7898, OrderDate: new Date("2017-09-09") },
        { ProductID: 9, ProductName: "Teatime Chocolate Biscuits", InStock: true, UnitsInStock: 6998, OrderDate: new Date("2025-12-25") },
        { ProductID: 10, ProductName: "Chocolate", InStock: true, UnitsInStock: 20000, OrderDate: new Date("2018-03-01") }
    ];
    public enableSummary() {
        this.grid1.enableSummaries([{fieldName: "ProductName"},
        {fieldName: "ProductID"}]);
    }

}

@Component({
    template: `
        <igx-grid #grid1 [data]="data">
            <igx-column field="ProductID" header="Product ID">
            </igx-column>
            <igx-column field="ProductName" [hasSummary]="true">
            </igx-column>
            <igx-column field="InStock" [dataType]="'boolean'" [hasSummary]="true">
            </igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true">
            </igx-column>
            <igx-column field="OrderDate" width="200px" [dataType]="'date'" [sortable]="true" [hasSummary]="true">
            </igx-column>
        </igx-grid>
        <button id="btnAddRow" (click)="addRow()">Add new row</button>
        <button id="btnDeleteRow" (click)="deleteRow()">Delete first row</button>
        <button id="btnUpdateRow" (click)="updateRow()">Update first row</button>
    `
})
export class  SummaryColumnComponent {

    public data = [
        { ProductID: 1, ProductName: "Chai", InStock: true, UnitsInStock: 2760, OrderDate: new Date("2005-03-21") },
        { ProductID: 2, ProductName: "Aniseed Syrup", InStock: false, UnitsInStock: 198, OrderDate: new Date("2008-01-15") },
        { ProductID: 3, ProductName: "Chef Antons Cajun Seasoning", InStock: true, UnitsInStock: 52, OrderDate: new Date("2010-11-20") },
        { ProductID: 4, ProductName: "Grandmas Boysenberry Spread", InStock: false, UnitsInStock: 0, OrderDate: new Date("2007-10-11") },
        { ProductID: 5, ProductName: "Uncle Bobs Dried Pears", InStock: false, UnitsInStock: 0, OrderDate: new Date("2001-07-27") },
        { ProductID: 6, ProductName: "Northwoods Cranberry Sauce", InStock: true, UnitsInStock: 1098, OrderDate: new Date("1990-05-17") },
        { ProductID: 7, ProductName: "Queso Cabrales", InStock: false, UnitsInStock: 0, OrderDate: new Date("2005-03-03") },
        { ProductID: 8, ProductName: "Tofu", InStock: true, UnitsInStock: 7898, OrderDate: new Date("2017-09-09") },
        { ProductID: 9, ProductName: "Teatime Chocolate Biscuits", InStock: true, UnitsInStock: 6998, OrderDate: new Date("2025-12-25") },
        { ProductID: 10, ProductName: "Chocolate", InStock: true, UnitsInStock: 20000, OrderDate: new Date("2018-03-01") }
    ];
    @ViewChild("grid1", { read: IgxGridComponent })
    public grid1: IgxGridComponent;

    public addRow() {
        this.grid1.addRow({
            ProductID: 11, ProductName: "Belgian Chocolate", InStock: true, UnitsInStock: 99000, OrderDate: new Date("2018-03-01")
        });
    }
    public deleteRow() {
        this.grid1.deleteRow(0);
    }
    public updateRow() {
        this.grid1.updateRow({
            ProductID: 1, ProductName: "Spearmint", InStock: true, UnitsInStock: 1, OrderDate: new Date("2005-03-21") }, 0);
    }
}
