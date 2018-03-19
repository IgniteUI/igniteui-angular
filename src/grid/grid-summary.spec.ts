import { Component, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - Summaries", () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                NoActiveSummariesComponent,
                SummariedColumnComponent
            ],
            imports: [IgxGridModule.forRoot()]
        })
            .compileComponents();
    }));
    it("should not have summary if no summary is active ", () => {
        const fixture = TestBed.createComponent(NoActiveSummariesComponent);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css("igx-grid-summary"))).toBeNull();
    });
    it("should have summary per each column that 'hasSummary'=true", () => {
        const fixture = TestBed.createComponent(SummariedColumnComponent);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css("igx-grid-summary"))).toBeDefined();
        let summaries = 0;
        const summariedColumns = fixture.componentInstance.instance.columnList.filter((col) => col.hasSummary === true).length;
        fixture.debugElement.queryAll(By.css("igx-grid-summary")).forEach((x) => {
            if (x.childNodes.length > 1) {summaries ++; } });
        expect(summaries).toBe(summariedColumns);
    });
    it("should have count summary for string and boolean data types", () => {
        const fixture = TestBed.createComponent(SummariedColumnComponent);
        fixture.detectChanges();
        const sum = fixture.componentInstance.instance;
        sum.ngAfterContentInit();
        fixture.detectChanges();
        const summaries = fixture.debugElement.queryAll(By.css("igx-grid-summary"));
        let index = 0;
        sum.columnList.forEach((col) => {
            if (col.hasSummary && (col.dataType === "string" || col.dataType === "boolean")) {
                const td = summaries[index].queryAll(By.css("td"));
                expect(td.length).toBe(2);
                expect(td[0].nativeElement.innerText).toBe("Count:");
            }
            index++;
        });
    });
    it("should have count, min, max, avg and sum summary for numeric data types", () => {
        const fixture = TestBed.createComponent(SummariedColumnComponent);
        fixture.detectChanges();
        const sum = fixture.componentInstance.instance;
        sum.ngAfterContentInit();
        fixture.detectChanges();
        const summaries = fixture.debugElement.queryAll(By.css("igx-grid-summary"));
        let index = 0;
        sum.columnList.forEach((col) => {
            if (col.hasSummary && (col.dataType === "number")) {
                const td = summaries[index].queryAll(By.css("td"));
                expect(td.length).toBe(10);
                expect(td[0].nativeElement.innerText).toBe("Count:");
                expect(td[2].nativeElement.innerText).toBe("Min:");
                expect(td[4].nativeElement.innerText).toBe("Max:");
                expect(td[6].nativeElement.innerText).toBe("Sum:");
                expect(td[8].nativeElement.innerText).toBe("Average:");
            }
            index++;
        });
    });
    it("should have count, earliest and latest summary for numeric data types", () => {
        const fixture = TestBed.createComponent(SummariedColumnComponent);
        fixture.detectChanges();
        const sum = fixture.componentInstance.instance;
        sum.ngAfterContentInit();
        fixture.detectChanges();
        const summaries = fixture.debugElement.queryAll(By.css("igx-grid-summary"));
        let index = 0;
        sum.columnList.forEach((col) => {
            if (col.hasSummary && (col.dataType === "date")) {
                const td = summaries[index].queryAll(By.css("td"));
                expect(td.length).toBe(6);
                expect(td[0].nativeElement.innerText).toBe("Count:");
                expect(td[2].nativeElement.innerText).toBe("Earliest:");
                expect(td[4].nativeElement.innerText).toBe("Latest:");
            }
            index++;
        });
    });
});

@Component({
    template: `
        <igx-grid [data]="data">
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
    `
})
export class  NoActiveSummariesComponent{

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

}

@Component({
    template: `
        <igx-grid [data]="data">
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
    `
})
export class  SummariedColumnComponent{

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
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

}
