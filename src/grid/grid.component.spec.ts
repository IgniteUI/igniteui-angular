import { Component, DebugElement, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

fdescribe("IgxGrid - input properties", () => {
    const MIN_COL_WIDTH = "136px";

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridTestComponent,
                IgxGridTestDefaultWidthHeight
            ],
            imports: [
                NoopAnimationsModule, IgxGridModule.forRoot()]
        })
        .compileComponents();
    }));

    it("height/width should be calculated depending on number of records", async(() => {
        const fix = TestBed.createComponent(IgxGridTestComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridBody = fix.debugElement.query(By.css(".igx-grid__tbody"));
        const gridHeader = fix.debugElement.query(By.css(".igx-grid__thead"));
        const gridFooter = fix.debugElement.query(By.css(".igx-grid__tfoot"));
        const gridScroll = fix.debugElement.query(By.css(".igx-grid__scroll"));

        expect(grid.rowList.length).toEqual(1);
        expect(window.getComputedStyle(gridBody.nativeElement).height).toMatch("50px");

        for (let i = 2; i < 31; i++) {
            grid.addRow({ index: i, value: i});
        }

        fix.detectChanges();
        expect(grid.rowList.length).toEqual(30);
        expect(window.getComputedStyle(gridBody.nativeElement).height).toMatch("1500px");

        grid.height = "200px";
        grid.width = "200px";
        fix.detectChanges();
        let gridBodyHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10);

        expect(grid.rowList.length).toEqual(30);
        expect(window.getComputedStyle(grid.nativeElement).width).toMatch("200px");
        expect(window.getComputedStyle(grid.nativeElement).height).toMatch("200px");
        expect(parseInt(window.getComputedStyle(gridBody.nativeElement).height, 10)).toEqual(gridBodyHeight);

        grid.height = "50%";
        grid.width = "50%";
        fix.detectChanges();
        gridBodyHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10);

        expect(grid.rowList.length).toEqual(30);
        expect(window.getComputedStyle(grid.nativeElement).height).toMatch("300px");
        expect(window.getComputedStyle(grid.nativeElement).width).toMatch("400px");
        expect(parseInt(window.getComputedStyle(gridBody.nativeElement).height, 10)).toEqual(gridBodyHeight);
    }));

    it("should not have column misalignment when no vertical scrollbar is shown", () => {
        const fix = TestBed.createComponent(IgxGridTestComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridBody = fix.debugElement.query(By.css(".igx-grid__tbody"));
        const gridHeader = fix.debugElement.query(By.css(".igx-grid__thead"));

        expect(window.getComputedStyle(gridBody.children[0].nativeElement).width).toEqual(
            window.getComputedStyle(gridHeader.children[0].nativeElement).width
        );
    });

    it("Test rendering of data with 5 columns and 5 rows where 2 of the columns have width set", () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeight);
        fix.detectChanges();
        const grid = fix.componentInstance.grid2;
        fix.componentInstance.generateColumns(5);
        fix.componentInstance.generateData(5, 5);
        fix.detectChanges();

        expect(grid.width).toEqual("100%");
        expect(grid.columns[0].width).toEqual("200px");
        expect(grid.columns[4].width).toEqual("200px");

        expect(parseInt(grid.columns[1].width, 10)).toEqual(parseInt(grid.columns[3].width, 10));
        expect(parseInt(grid.columns[2].width, 10)).toEqual(parseInt(grid.columns[1].width, 10));

        grid.columns.forEach((column) => {
            if (column.index != 0 && column.index != 4) {
                expect(column.width).toEqual(MIN_COL_WIDTH) || expect(column.width > MIN_COL_WIDTH).toEqual(true);
            }
        });

        expect(grid.scr.nativeElement.firstElementChild.hidden).toEqual(true);
        expect(grid.scr.nativeElement.style.display).toEqual("");
    });

    it("Test rendering of data with 5 columns and 5 rows where 2 of the columns have width set and grid has width", () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeight);
        fix.detectChanges();
        const grid = fix.componentInstance.grid2;
        grid.width = "800px";
        fix.componentInstance.generateColumns(5);
        fix.componentInstance.generateData(5, 5);
        fix.detectChanges();

        expect(grid.width).toEqual("800px");
        expect(grid.columns[0].width).toEqual("200px");
        expect(grid.columns[4].width).toEqual("200px");

        expect(parseInt(grid.columns[1].width, 10)).toEqual(parseInt(grid.columns[3].width, 10));
        expect(parseInt(grid.columns[2].width, 10)).toEqual(parseInt(grid.columns[1].width, 10));

        grid.columns.forEach((column) => {
            if (column.index != 0 && column.index != 4) {
                expect(column.width).toEqual(MIN_COL_WIDTH) || expect(column.width > MIN_COL_WIDTH).toEqual(true);
            }
        });

        expect(grid.scr.nativeElement.firstElementChild.hidden).toEqual(true);
        //expect(grid.scr.nativeElement.style.display).toEqual("");
        expect(grid.calcWidth - grid.totalWidth < 0).toEqual(true);
    });

    it("Test rendering of data with 5 columns and 30 rows where 3 of the columns have width set", () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeight);
        fix.detectChanges();
        const grid = fix.componentInstance.grid2;
        fix.componentInstance.generateColumns(5);
        fix.componentInstance.generateData(5, 30);
        fix.detectChanges();

        expect(grid.width).toEqual("100%");
        expect(grid.columns[0].width).toEqual("200px");
        expect(grid.columns[4].width).toEqual("200px");

        expect(parseInt(grid.columns[1].width, 10)).toEqual(parseInt(grid.columns[3].width, 10));
        expect(parseInt(grid.columns[2].width, 10)).toEqual(parseInt(grid.columns[1].width, 10));

        grid.columns.forEach((column) => {
            if (column.index != 0 && column.index != 4) {
                expect(column.width).toEqual(MIN_COL_WIDTH) || expect(column.width > MIN_COL_WIDTH).toEqual(true);
            }
        });

        expect(grid.scr.nativeElement.firstElementChild.hidden).toEqual(true);
        //expect(grid.scr.nativeElement.style.display).toEqual("");
    });

    it("Test rendering of data with 30 columns and 1000 rows where 5 of the columns have width set", () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeight);
        fix.detectChanges();
        const grid = fix.componentInstance.grid2;
        fix.componentInstance.generateColumns(30);
        fix.componentInstance.generateData(30, 1000);
        fix.detectChanges();

        expect(grid.width).toEqual("100%");
        expect(grid.columns[0].width).toEqual("200px");
        expect(grid.columns[3].width).toEqual("200px");
        expect(grid.columns[5].width).toEqual("200px");
        expect(grid.columns[10].width).toEqual("200px");
        expect(grid.columns[25].width).toEqual("200px");

        expect(parseInt(grid.columns[1].width, 10)).toEqual(parseInt(grid.columns[3].width, 10));
        expect(parseInt(grid.columns[2].width, 10)).toEqual(parseInt(grid.columns[1].width, 10));

        grid.columns.forEach((column) => {
            if (column.index != 0 && column.index != 3 && column.index != 5 &&
                    column.index != 10 && column.index != 25) {
                expect(column.width).toEqual(MIN_COL_WIDTH) || expect(column.width > MIN_COL_WIDTH).toEqual(true);
            }
        });

        expect(grid.scr.nativeElement.firstElementChild.hidden).toEqual(true);
        //expect(grid.scr.nativeElement.style.display).toEqual("");
    });

    it("Test rendering of data with 30 columns and 1000 rows where 5 of the columns have width set and grid has width", () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeight);
        fix.detectChanges();
        const grid = fix.componentInstance.grid2;
        grid.width = "800px";
        fix.componentInstance.generateColumns(30);
        fix.componentInstance.generateData(30, 1000);
        fix.detectChanges();

        expect(grid.width).toEqual("800px");
        expect(grid.columns[0].width).toEqual("200px");
        expect(grid.columns[3].width).toEqual("200px");
        expect(grid.columns[5].width).toEqual("200px");
        expect(grid.columns[10].width).toEqual("200px");
        expect(grid.columns[25].width).toEqual("200px");

        grid.columns.forEach((column) => {
            if (column.index != 0 && column.index != 3 && column.index != 5 &&
                    column.index != 10 && column.index != 25) {
                expect(column.width).toEqual(MIN_COL_WIDTH) || expect(column.width > MIN_COL_WIDTH).toEqual(true);
            }
        });

        expect(grid.scr.nativeElement.firstElementChild.hidden).toEqual(false);
        expect(grid.calcWidth - grid.totalWidth < 0).toEqual(true);
        //expect(grid.scr.nativeElement.style.display).toEqual("");
    });

    it("Test rendering of data with 150 columns and 20000 rows where 5 of the columns have width set", () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeight);
        fix.detectChanges();
        const grid = fix.componentInstance.grid2;
        fix.componentInstance.generateColumns(150);
        fix.componentInstance.generateData(150, 20000);
        fix.detectChanges();

        expect(grid.width).toEqual("100%");
        expect(grid.columns[0].width).toEqual("500px");
        expect(grid.columns[3].width).toEqual("500px");
        expect(grid.columns[5].width).toEqual("500px");
        expect(grid.columns[10].width).toEqual("500px");
        expect(grid.columns[50].width).toEqual("500px");

        grid.columns.forEach((column) => {
            if (column.index != 0 && column.index != 3 && column.index != 5 &&
                    column.index != 10 && column.index != 50) {
                expect(column.width).toEqual(MIN_COL_WIDTH) || expect(column.width > MIN_COL_WIDTH).toEqual(true);
            }
        });

        expect(grid.scr.nativeElement.firstElementChild.hidden).toEqual(false);
        expect(grid.calcWidth - grid.totalWidth < 0).toEqual(true);
        //expect(grid.scr.nativeElement.style.display).toEqual("");
    });

    fit("Test rendering of data with 150 columns and 20000 rows where 5 of the columns have width set and grid has width", () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeight);
        fix.detectChanges();
        const grid = fix.componentInstance.grid2;
        grid.width = "800px";
        fix.componentInstance.generateColumns(150);
        fix.componentInstance.generateData(150, 20000);
        fix.detectChanges();

        expect(grid.width).toEqual("800px");
        expect(grid.columns[0].width).toEqual("500px");
        expect(grid.columns[3].width).toEqual("500px");
        expect(grid.columns[5].width).toEqual("500px");
        expect(grid.columns[10].width).toEqual("500px");
        expect(grid.columns[50].width).toEqual("500px");

        grid.columns.forEach((column) => {
            if (column.index != 0 && column.index != 3 && column.index != 5 &&
                    column.index != 10 && column.index != 50) {
                expect(column.width).toEqual(MIN_COL_WIDTH) || expect(column.width > MIN_COL_WIDTH).toEqual(true);
            }
        });

        expect(grid.scr.nativeElement.firstElementChild.hidden).toEqual(false);
        expect(grid.calcWidth - grid.totalWidth < 0).toEqual(true);
        //expect(grid.scr.nativeElement.style.display).toEqual("");
    });
});

@Component({
    template: `<div style="width: 800px; height: 600px;">
    <igx-grid #grid [data]="data" [autoGenerate]="false">
        <igx-column field="index" header="index" dataType="number"></igx-column>
        <igx-column field="value" header="value" dataType="number"></igx-column>
    </igx-grid></div>`
})
export class IgxGridTestComponent {
    public data = [{ index: 1, value: 1}];
    @ViewChild("grid") public grid: IgxGridComponent;
}

@Component({
    template: `<igx-grid #grid2 style="margin-bottom: 20px;" [data]="data" (onColumnInit)="initColumns($event)">
                <igx-column *ngFor="let c of cols" [field]="c.field" [header]="c.header" [hasSummary]="true">
                </igx-column>
                </igx-grid>`
})
export class IgxGridTestDefaultWidthHeight {
    public data =[];
    public cols = []
    @ViewChild("grid2") public grid2: IgxGridComponent;
    
    ngOnInit () {
        //this.cols = this.generateColumns(5);
        //this.data = this.generateData(5, 5);
    }
    initColumns(column) {
        switch (this.grid2.columnList.length) {
            case 5: 
                if (column.index == 0 || column.index == 4) {
                    column.width = "200px";
                }
            break;
            case 30: 
                if (column.index == 0 || column.index == 5 || column.index == 3 || column.index == 10 || column.index == 25) {
                    column.width = "200px";
                }
            break;
            case 150: 
                if (column.index == 0 || column.index == 5 || column.index == 3 || column.index == 10 || column.index == 50) {
                    column.width = "500px";
                }
            break;
        }
        
      }
    public generateColumns(count) {
        this.cols = [];
        for (let i = 0; i < count; i++) {
            this.cols.push({
                field: "col" + i,
                header: "col" + i
            })
        }
        return this.cols;
    }
    public generateData(columns, rows) {
        const data = [], cols = [];
     
        for (let r = 0; r < rows; r++) {
          const record = {};
          for (let c = 0; c < columns; c++) {
            record[this.cols[c].field] = c * r;
          }
          this.data.push(record);
        }
     
        return this.data;
    }
}
