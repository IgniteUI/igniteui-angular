import { Component, DebugElement, TemplateRef, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { GridTemplateStrings, ColumnDefinitions } from '../../test-utils/template-strings.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { ColumnHiddenFromMarkupComponent, ColumnCellFormatterComponent } from '../../test-utils/grid-samples.spec';
import { wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';

describe('IgxGrid - Column properties', () => {
    configureTestSuite();

    const COLUMN_HEADER_CLASS = '.igx-grid__th';
    const COLUMN_HEADER_GROUP_CLASS = '.igx-grid__thead-item';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnsFromIterableComponent,
                TemplatedColumnsComponent,
                TemplatedInputColumnsComponent,
                ColumnCellFormatterComponent,
                ColumnHaederClassesComponent,
                ColumnHiddenFromMarkupComponent
            ],
            imports: [IgxGridModule]
        })
            .compileComponents();
    }));

    it('should correctly initialize column templates', () => {
        const fix = TestBed.createComponent(TemplatedColumnsComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        const headerSpans: DebugElement[] = fix.debugElement.queryAll(By.css('.header'));
        const cellSpans: DebugElement[] = fix.debugElement.queryAll(By.css('.cell'));

        grid.columnList.forEach((column) => expect(column.bodyTemplate).toBeDefined());
        grid.columnList.forEach((column) => expect(column.headerTemplate).toBeDefined());

        headerSpans.forEach((span) => expect(span.nativeElement.textContent).toMatch('Header text'));
        cellSpans.forEach((span) => expect(span.nativeElement.textContent).toMatch('Cell text'));

        // TODO: Add footer tests
    });

    it('should provide a way to change templates dynamically', () => {
        const fix = TestBed.createComponent(TemplatedColumnsComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        grid.columnList.forEach((column) => column.headerTemplate = fix.componentInstance.newHeaderTemplate);
        grid.columnList.forEach((column) => column.bodyTemplate = fix.componentInstance.newCellTemplate);

        fix.detectChanges();

        const headerSpans: DebugElement[] = fix.debugElement.queryAll(By.css('.new-header'));
        const cellSpans: DebugElement[] = fix.debugElement.queryAll(By.css('.new-cell'));

        headerSpans.forEach((span) => expect(span.nativeElement.textContent).toMatch('New header text'));
        cellSpans.forEach((span) => expect(span.nativeElement.textContent).toMatch('New cell text'));

        // TODO: Add footer tests
    });

    it('should reflect column hiding correctly in the DOM dynamically', () => {
        const fix = TestBed.createComponent(TemplatedColumnsComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        grid.columnList.first.hidden = true;
        fix.detectChanges();

        expect(grid.visibleColumns.length).toEqual(1);
        expect(grid.visibleColumns[0].field).toEqual('Name');
        expect(fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS)).length).toEqual(1);

        grid.columnList.first.hidden = false;
        fix.detectChanges();

        expect(grid.visibleColumns.length).toEqual(2);
        expect(grid.visibleColumns[0].field).toEqual('ID');
        expect(fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS)).length).toEqual(2);
    });

    it('should reflect column hiding correctly in the DOM from markup declaration', () => {
        const fix = TestBed.createComponent(ColumnHiddenFromMarkupComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        expect(grid.visibleColumns.length).toEqual(0);
        expect(fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS)).length).toEqual(0);

        grid.columnList.first.hidden = false;
        fix.detectChanges();

        expect(grid.visibleColumns.length).toEqual(1);
        expect(fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS)).length).toEqual(1);
    });

    it('should support providing a custom formatter for cell values', () => {
        const fix = TestBed.createComponent(ColumnCellFormatterComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const formatter = fix.componentInstance.multiplier;

        expect(grid.columnList.first.formatter).toBeDefined();

        for (let i = 0; i < 3; i++) {
            const cell = grid.getCellByColumn(i, 'ID');
            expect(cell.nativeElement.textContent).toMatch(formatter(cell.value));
        }
    });

    it('should reflect the column in the DOM based on its index', () => {
        const fix = TestBed.createComponent(ColumnCellFormatterComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        let headers: DebugElement[];

        expect(grid.columnList.first.field).toMatch('ID');
        expect(grid.columnList.last.field).toMatch('Name');

        headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        expect(headers[0].nativeElement.textContent).toMatch('ID');
        expect(headers[1].nativeElement.textContent).toMatch('Name');

        // Swap columns
        grid.moveColumn(grid.columnList.first, grid.columnList.last);
        fix.detectChanges();

        expect(grid.columnList.first.field).toMatch('Name');
        expect(grid.columnList.last.field).toMatch('ID');

        headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        expect(headers[0].nativeElement.textContent).toMatch('Name');
        expect(headers[1].nativeElement.textContent).toMatch('ID');
    });

    it('should support adding and removing columns through a declared iterable', () => {
        const fix = TestBed.createComponent(ColumnsFromIterableComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        expect(grid.columnList.length).toEqual(2);

        fix.componentInstance.columns.push('MyNewColumn');
        fix.detectChanges();

        expect(grid.columnList.length).toEqual(3);
        expect(grid.columnList.last.field).toMatch('MyNewColumn');

        fix.componentInstance.columns.pop();
        fix.detectChanges();

        expect(grid.columnList.length).toEqual(2);
        expect(grid.columnList.last.field).toMatch('Name');
    });

    it('should apply columnWidth on columns that don\'t have explicit width', () => {
        const fix = TestBed.createComponent(ColumnCellFormatterComponent);
        fix.componentInstance.grid.columnWidth = '200px';
        fix.detectChanges();
        const cols = fix.componentInstance.grid.columnList;

        cols.forEach((item) => {
            expect(item.width).toEqual('200px');
        });
        const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));
        expect(headers[0].nativeElement.style['min-width']).toEqual('200px');
    });

    it('headers and cells classes should be correct after scroll horizontal', ((done) => {
        // Use setTimeout because when scroll the grid whenStable does not work
        const fix = TestBed.createComponent(ColumnHaederClassesComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        const CELL_CSS_CLASS = '.igx-grid__td';
        const COLUMN_NUMBER_CLASS = 'igx-grid__th--number';
        const CELL_NUMBER_CLASS = 'igx-grid__td--number';

        // Verify haeder clases
        let headers: DebugElement[];
        let allCells: DebugElement[];

        allCells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
        allCells.forEach((cell) => expect(cell.nativeElement.className.indexOf(CELL_NUMBER_CLASS)).toBeGreaterThan(-1));
        expect(allCells[3].nativeElement.className.indexOf('headerAlignSyle')).toBeGreaterThan(-1);

        headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        headers.forEach((header) => expect(header.nativeElement.className.indexOf(COLUMN_NUMBER_CLASS)).toBeGreaterThan(-1));
        expect(headers[2].nativeElement.className.indexOf('headerAlignSyle')).toBeGreaterThan(-1);
        grid.parentVirtDir.getHorizontalScroll().scrollLeft = 200;
        setTimeout(() => {
            fix.detectChanges();
            headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
            headers.forEach((header) => expect(header.nativeElement.className.indexOf(COLUMN_NUMBER_CLASS)).toBeGreaterThan(-1));
            expect(headers[0].nativeElement.className.indexOf('headerAlignSyle')).toBeGreaterThan(-1);

            allCells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
            allCells.forEach((cell) => expect(cell.nativeElement.className.indexOf(CELL_NUMBER_CLASS)).toBeGreaterThan(-1));
            expect(allCells[1].nativeElement.className.indexOf('headerAlignSyle')).toBeGreaterThan(-1);

            grid.parentVirtDir.getHorizontalScroll().scrollLeft = 0;
            setTimeout(() => {
                fix.detectChanges();
                headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
                headers.forEach((header) => expect(header.nativeElement.className.indexOf(COLUMN_NUMBER_CLASS)).toBeGreaterThan(-1));
                expect(headers[2].nativeElement.className.indexOf('headerAlignSyle')).toBeGreaterThan(-1);

                allCells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
                allCells.forEach((cell) => expect(cell.nativeElement.className.indexOf(CELL_NUMBER_CLASS)).toBeGreaterThan(-1));
                expect(allCells[3].nativeElement.className.indexOf('headerAlignSyle')).toBeGreaterThan(-1);
                done();
            }, 100);
        }, 100);
    }));

    it('column width should be adjusted after a column has been hidden', async() => {
        const fix = TestBed.createComponent(ColumnsFromIterableComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        grid.width = '600px';
        fix.detectChanges();
        await wait();

        expect(grid.calcWidth).toBe(600);
        expect(grid.columns[0].width).toBe('300');
        expect(!grid.columns[0].widthSetByUser);
        expect(grid.columns[1].width).toBe('300');
        expect(!grid.columns[1].widthSetByUser);
        grid.columns[0].hidden = true;

        expect(grid.columns[1].width).toBe('600');
        grid.columns[0].hidden = false;

        expect(grid.columns[0].width).toBe('300');
        expect(grid.columns[1].width).toBe('300');
    });

    it('should support passing templates through the markup as an input property', () => {
        const fixture = TestBed.createComponent(TemplatedInputColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.instance;

        grid.getColumnByName('Name').cells.forEach(c =>
            expect(c.nativeElement.querySelector('.customCellTemplate')).toBeDefined());

        grid.headerCellList.forEach(header =>
            expect(header.elementRef.nativeElement.querySelector('.customHeaderTemplate')).toBeDefined());

        const cell = grid.getCellByColumn(0, 'ID');
        cell.inEditMode = true;
        fixture.detectChanges();

        expect(cell.nativeElement.querySelector('.customEditorTemplate')).toBeDefined();

    });
});

@Component({
    template: GridTemplateStrings.declareGrid('', '', ColumnDefinitions.iterableComponent)
})
export class ColumnsFromIterableComponent {
    public data = SampleTestData.personIDNameData();
    public columns = ['ID', 'Name'];

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;
}

@Component({
    template: GridTemplateStrings.declareGrid('', '', ColumnDefinitions.columnTemplates) + `
        <ng-template #newHeader>
            <span class="new-header">New header text</span>
        </ng-template>

        <ng-template #newCell>
            <span class="new-cell">New cell text</span>
        </ng-template>
    `
})
export class TemplatedColumnsComponent {
    public data = SampleTestData.personIDNameData();

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    @ViewChild('newHeader', { read: TemplateRef })
    public newHeaderTemplate: TemplateRef<any>;

    @ViewChild('newCell', { read: TemplateRef })
    public newCellTemplate: TemplateRef<any>;
}

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column *ngFor="let field of columns" [field]="field" [editable]="true"
                [cellTemplate]="cell" [headerTemplate]="header"
                [cellEditorTemplate]="editor">
            </igx-column>
        </igx-grid>

        <ng-template #cell let-value>
            <span class="customCellTemplate">{{ value }}</span>
        </ng-template>

        <ng-template #header let-column>
            <span class="customHeaderTemplate">{{ column.field }}</span>
        </ng-template>

        <ng-template #editor let-value>
            <span class="customEditorTemplate">{{ value }}</span>
        </ng-template>
    `
})
export class TemplatedInputColumnsComponent {

    data = SampleTestData.personIDNameRegionData();
    columns = Object.keys(this.data[0]);

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;
}

@Component({
    template: `
        <igx-grid [data]="data" height="500px" width="400px">
            <igx-column field="ProductId"  dataType="number" width="100px"></igx-column>
            <igx-column field="Number1" dataType="number" width="100px"></igx-column>
            <igx-column field="Number2" dataType="number" width="100px" [headerClasses]="'headerAlignSyle'"></igx-column>
            <igx-column field="Number3" dataType="number" width="100px" [cellClasses]="{'headerAlignSyle':true}"></igx-column>
            <igx-column field="Number4" dataType="number" width="100px"></igx-column>
            <igx-column field="Number5" dataType="number" width="100px"></igx-column>
            <igx-column field="Number6" dataType="number" width="100px"></igx-column>
            <igx-column field="Number7" dataType="number" width="100px"></igx-column>
        </igx-grid>
    `,
    styles: [`.headerAlignSyle {text-align: right !important;}`]
})
export class ColumnHaederClassesComponent {
    public data = [
        { ProductId: 1, Number1: 11, Number2: 10, Number3: 5, Number4: 3, Number5: 4, Number6: 6, Number7: 7 }
    ];

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public grid: IgxGridComponent;
}
