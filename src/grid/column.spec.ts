import { Component, DebugElement, TemplateRef, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DataType } from "../data-operations/data-util";
import { IgxColumnComponent } from "./column.component";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - Column properties", () => {

    const COLUMN_HEADER_CLASS = ".igx-grid__th-content";

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TemplatedColumns,
                ColumnHiddenFromMarkup,
                ColumnCellFormatter
            ],
            imports: [IgxGridModule.forRoot()]
        })
        .compileComponents();
    }));

    it("should correctly initialize column templates", () => {
        const fix = TestBed.createComponent(TemplatedColumns);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        const headerSpans: DebugElement[] = fix.debugElement.queryAll(By.css(".header"));
        const cellSpans: DebugElement[] = fix.debugElement.queryAll(By.css(".cell"));

        grid.columnList.forEach((column) => expect(column.bodyTemplate).toBeDefined());
        grid.columnList.forEach((column) => expect(column.headerTemplate).toBeDefined());
        grid.columnList.forEach((column) => expect(column.footerTemplate).toBeDefined());

        headerSpans.forEach((span) => expect(span.nativeElement.textContent).toMatch("Header text"));
        cellSpans.forEach((span) => expect(span.nativeElement.textContent).toMatch("Cell text"));

        // TODO: Add footer tests
    });

    it("should provide a way to change templates dynamically", () => {
        const fix = TestBed.createComponent(TemplatedColumns);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        grid.columnList.forEach((column) => column.headerTemplate = fix.componentInstance.newHeaderTemplate);
        grid.columnList.forEach((column) => column.bodyTemplate = fix.componentInstance.newCellTemplate);

        fix.detectChanges();

        const headerSpans: DebugElement[] = fix.debugElement.queryAll(By.css(".new-header"));
        const cellSpans: DebugElement[] = fix.debugElement.queryAll(By.css(".new-cell"));

        headerSpans.forEach((span) => expect(span.nativeElement.textContent).toMatch("New header text"));
        cellSpans.forEach((span) => expect(span.nativeElement.textContent).toMatch("New cell text"));

        // TODO: Add footer tests
    });

    it("should reflect column hiding correctly in the DOM dynamically", () => {
        const fix = TestBed.createComponent(TemplatedColumns);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        grid.columnList.first.hidden = true;
        fix.detectChanges();

        expect(grid.visibleColumns.length).toEqual(1);
        expect(grid.visibleColumns[0].field).toEqual("Name");
        expect(fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS)).length).toEqual(1);

        grid.columnList.first.hidden = false;
        fix.detectChanges();

        expect(grid.visibleColumns.length).toEqual(2);
        expect(grid.visibleColumns[0].field).toEqual("ID");
        expect(fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS)).length).toEqual(2);
    });

    it("should reflect column hiding correctly in the DOM from markup declaration", () => {
        const fix = TestBed.createComponent(ColumnHiddenFromMarkup);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        expect(grid.visibleColumns.length).toEqual(0);
        expect(fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS)).length).toEqual(0);

        grid.columnList.first.hidden = false;
        fix.detectChanges();

        expect(grid.visibleColumns.length).toEqual(1);
        expect(fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS)).length).toEqual(1);
    });

    it("should support providing a custom formatter for cell values", () => {
        const fix = TestBed.createComponent(ColumnCellFormatter);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const formatter = fix.componentInstance.multiplier;

        expect(grid.columnList.first.formatter).toBeDefined();

        for (let i = 0; i < 3; i++) {
            const cell = grid.getCellByColumn(i, "ID");
            expect(cell.nativeElement.textContent).toMatch(formatter(cell.value));
        }
    });

    it("should reflect the column in the DOM based on its index", () => {
        const fix = TestBed.createComponent(ColumnCellFormatter);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        let headers: DebugElement[];

        expect(grid.columnList.first.index).toEqual(0);
        expect(grid.columnList.first.field).toMatch("ID");
        expect(grid.columnList.last.index).toEqual(1);
        expect(grid.columnList.last.field).toMatch("Name");

        headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        expect(headers[0].nativeElement.textContent).toMatch("ID");
        expect(headers[1].nativeElement.textContent).toMatch("Name");

        grid.columnList.first.index = 1;
        grid.columnList.last.index = 0;
        fix.detectChanges();

        expect(grid.columnList.first.index).toEqual(1);
        expect(grid.columnList.first.field).toMatch("ID");
        expect(grid.columnList.last.index).toEqual(0);
        expect(grid.columnList.last.field).toMatch("Name");

        headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        expect(headers[0].nativeElement.textContent).toMatch("Name");
        expect(headers[1].nativeElement.textContent).toMatch("ID");
    });
});

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column field="ID">
                <ng-template igxHeader>
                    <span class="header">Header text</span>
                </ng-template>

                <ng-template igxCell>
                    <span class="cell">Cell text</span>
                </ng-template>

                <ng-template igxFooter>
                    <span class="footer">Footer text</span>
                </ng-template>
            </igx-column>
            <igx-column field="Name">
                <ng-template igxHeader>
                    <span class="header">Header text</span>
                </ng-template>

                <ng-template igxCell>
                    <span class="cell">Cell text</span>
                </ng-template>

                <ng-template igxFooter>
                    <span class="footer">Footer text</span>
                </ng-template>
            </igx-column>
        </igx-grid>

        <ng-template #newHeader>
            <span class="new-header">New header text</span>
        </ng-template>

        <ng-template #newCell>
            <span class="new-cell">New cell text</span>
        </ng-template>
    `
})
export class TemplatedColumns {

    public data = [
        { ID: 1, Name: "Johny" },
        { ID: 2, Name: "Sally" },
        { ID: 3, Name: "Tim" }
    ];

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    @ViewChild("newHeader", { read: TemplateRef })
    public newHeaderTemplate: TemplateRef<any>;

    @ViewChild("newCell", { read: TemplateRef })
    public newCellTemplate: TemplateRef<any>;
}

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column field="ID" [hidden]="true"></igx-column>
        </igx-grid>
    `
})
export class ColumnHiddenFromMarkup {

    public data = [
        { ID: 1, Name: "Johny" },
        { ID: 2, Name: "Sally" },
        { ID: 3, Name: "Tim" }
    ];

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;
}

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column field="ID" [formatter]="multiplier"></igx-column>
            <igx-column field="Name"></igx-column>
        </igx-grid>
    `
})
export class ColumnCellFormatter {

    public data = [
        { ID: 1, Name: "Johny" },
        { ID: 2, Name: "Sally" },
        { ID: 3, Name: "Tim" }
    ];

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    public multiplier(value: number): string {
        return `${value * value}`;
    }
}
