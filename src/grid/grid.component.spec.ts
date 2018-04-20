import { ChangeDetectorRef, Component, DebugElement, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

fdescribe("IgxGrid - input properties", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridTestComponent, IgGridTest5x5Component, IgGridTest10x30Component,
                IgGridTest30x1000Component, IgGridTest150x20000Component
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
    it("col width should be >=136px - grid 5x5", () => {
        const fix = TestBed.createComponent(IgGridTest5x5Component);
        fix.detectChanges();

        const grid = fix.componentInstance.gridMinDefaultColWidth;

        expect(grid.columns[0].width).not.toBeLessThan(136);
        expect(grid.columns[2].width).not.toBeLessThan(136);
        expect(grid.width).toMatch("100%");
    });

    it("col width should be >=136px - grid 10x30", () => {
        const fix = TestBed.createComponent(IgGridTest10x30Component);
        fix.detectChanges();

        const grid = fix.componentInstance.gridMinDefaultColWidth;

        expect(grid.columns[0].width).not.toBeLessThan(136);
        expect(grid.columns[4].width).not.toBeLessThan(136);
        expect(grid.columns[6].width).not.toBeLessThan(136);
        expect(grid.width).toMatch("100%");
    });

    it("col width should be >=136px - grid 30x1000", () => {
        const fix = TestBed.createComponent(IgGridTest30x1000Component);
        fix.detectChanges();

        const grid = fix.componentInstance.gridMinDefaultColWidth;
        expect(grid.columns[0].width).not.toBeLessThan(136);
        expect(grid.columns[4].width).not.toBeLessThan(136);
        expect(grid.columns[14].width).not.toBeLessThan(136);
        expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(true);
    });

    it("col width should be >=136px - grid 150x20000", () => {
        const fix = TestBed.createComponent(IgGridTest150x20000Component);
        fix.detectChanges();

        const grid = fix.componentInstance.gridMinDefaultColWidth;

        expect(grid.columns[0].width).not.toBeLessThan(136);
        expect(grid.columns[4].width).not.toBeLessThan(136);
        expect(grid.columns[100].width).not.toBeLessThan(136);
        expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(true);
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
    public data = [{ col1: 1}];

    @ViewChild("grid", { read: IgxGridComponent })
    public grid: IgxGridComponent;
}
@Component({
    template: `
    <igx-grid #gridMinDefaultColWidth [data]="data" (onColumnInit)="init($event)" >
        <igx-column *ngFor="let col of cols" [field]="col.key" [header]="col.key" [dataType]="col.dataType"></igx-column>
    </igx-grid>
    `
})
export class IgGridTest5x5Component {
    public cols;
    public data;

    @ViewChild("gridMinDefaultColWidth", { read: IgxGridComponent })
    public gridMinDefaultColWidth: IgxGridComponent;

    constructor(private _cdr: ChangeDetectorRef) {
        this.generateColumns(5);
        this.generateData(this.cols.length, 5);
    }

    init(column) {
        column.hasSummary = true;
    }
    public generateData(columns, rows) {
        this.data = [];

        for (let r = 0; r < rows; r++) {
            const record = {};
            for (let c = 0; c < columns; c++) {
                record[this.cols[c].key] = c * r;
            }
            this.data.push(record);
        }
    }
    public generateColumns(count) {
        this.cols = [];
        for (let i = 0; i < count; i++) {
            this.cols.push({
                key: "col" +  i,
                dataType: "number"
            });
        }
        return this.cols;
    }
}
@Component({
    template: `
    <igx-grid #gridMinDefaultColWidth [data]="data" (onColumnInit)="init($event)">
        <igx-column *ngFor="let col of cols" [field]="col.key" [header]="col.key" [dataType]="col.dataType"></igx-column>
    </igx-grid>
    `
})
export class IgGridTest10x30Component {
    public cols;
    public data;

    @ViewChild("gridMinDefaultColWidth", { read: IgxGridComponent })
    public gridMinDefaultColWidth: IgxGridComponent;

    constructor(private _cdr: ChangeDetectorRef) {
        this.generateColumns(10);
        this.generateData(this.cols.length, 30);
    }

    init(column) {
        column.hasSummary = true;
    }

    public generateData(columns, rows) {
        this.data = [];

        for (let r = 0; r < rows; r++) {
            const record = {};
            for (let c = 0; c < columns; c++) {
                record[this.cols[c].key] = c * r;
            }
            this.data.push(record);
        }
    }
    public generateColumns(count) {
        this.cols = [];
        for (let i = 0; i < count; i++) {
            this.cols.push({
                key: "col" +  i,
                dataType: "number"
            });
        }
        return this.cols;
    }
}
@Component({
    template: `
    <igx-grid #gridMinDefaultColWidth [data]="data" (onColumnInit)="init($event)" [width]="'1500px'" >
        <igx-column *ngFor="let col of cols" [field]="col.key" [header]="col.key" [dataType]="col.dataType"></igx-column>
    </igx-grid>
    `
})
export class IgGridTest30x1000Component {
    public cols;
    public data;

    @ViewChild("gridMinDefaultColWidth", { read: IgxGridComponent })
    public gridMinDefaultColWidth: IgxGridComponent;

    constructor(private _cdr: ChangeDetectorRef) {
        this.generateColumns(30);
        this.generateData(this.cols.length, 1000);
    }

    init(column) {
        column.hasSummary = true;
    }

    public generateData(columns, rows) {
        this.data = [];

        for (let r = 0; r < rows; r++) {
            const record = {};
            for (let c = 0; c < columns; c++) {
                record[this.cols[c].key] = c * r;
            }
            this.data.push(record);
        }
    }
    public generateColumns(count) {
        this.cols = [];
        for (let i = 0; i < count; i++) {
            this.cols.push({
                key: "col" +  i,
                dataType: "number"
            });
        }
        return this.cols;
    }
    public isHorizonatScrollbarVisible() {
        const scrollbar = this.gridMinDefaultColWidth.parentVirtDir.getHorizontalScroll();
        return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
    }
}
@Component({
    template: `
    <igx-grid #gridMinDefaultColWidth [data]="data" (onColumnInit)="init($event)" [width]="'1500px'" >
        <igx-column *ngFor="let col of cols" [field]="col.key" [header]="col.key" [dataType]="col.dataType"></igx-column>
    </igx-grid>
    `
})
export class IgGridTest150x20000Component {
    public cols;
    public data;

    @ViewChild("gridMinDefaultColWidth", { read: IgxGridComponent })
    public gridMinDefaultColWidth: IgxGridComponent;

    constructor(private _cdr: ChangeDetectorRef) {
        this.generateColumns(150);
        this.generateData(this.cols.length, 20000);
    }

    init(column) {
        column.hasSummary = true;
    }

    public generateData(columns, rows) {
        this.data = [];

        for (let r = 0; r < rows; r++) {
            const record = {};
            for (let c = 0; c < columns; c++) {
                record[this.cols[c].key] = c * r;
            }
            this.data.push(record);
        }
    }
    public generateColumns(count) {
        this.cols = [];
        for (let i = 0; i < count; i++) {
            this.cols.push({
                key: "col" + i,
                dataType: "number"
            });
        }
        return this.cols;
    }
    public isHorizonatScrollbarVisible() {
        const scrollbar = this.gridMinDefaultColWidth.parentVirtDir.getHorizontalScroll();
        return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
    }
}
