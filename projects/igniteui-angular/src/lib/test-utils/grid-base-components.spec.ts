import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SampleTestData } from './sample-test-data.spec';
import { ColumnDefinitions, GridTemplateStrings } from './template-strings.spec';
import { IgxColumnHidingComponent, IgxColumnPinningComponent } from '../grids';
import { IgxGridComponent } from '../grids/grid/grid.component';

@Component({
    template: `
        <igx-grid
            [data]="data"
            [autoGenerate]="true">
        </igx-grid>
    `
})
export class BasicGridComponent {
    public data = [];

    @ViewChild(IgxGridComponent)
    public grid: IgxGridComponent;
}

@Component({
    template: `
        <igx-grid
            [data]="data"
            [autoGenerate]="autoGenerate">
        </igx-grid>
    `
})
export class GridAutoGenerateComponent extends BasicGridComponent {
    public autoGenerate = true;
}

@Component({
    template: `
        <igx-grid
            [data]="data"
            [autoGenerate]="autoGenerate"
            [height]="height" [width]="width">
        </igx-grid>
    `
})
export class GridWithSizeComponent extends GridAutoGenerateComponent {
    public width = '100%';
    public height = '100%';

    public scrollTop(newTop: number) {
        this.grid.verticalScrollContainer.getVerticalScroll().scrollTop = newTop;
    }
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.generatedEditable)
})
export class GridNxMComponent extends GridWithSizeComponent implements OnInit {
    public colsCount: number;
    public rowsCount: number;
    public columnsType = 'string';
    public hasEditableColumns = true;
    public startFromOne = false;
    public columnNamePrefix = 'col';
    public columns = [];

    autoGenerate = false;

    ngOnInit() {
        this.columns = (this.hasEditableColumns) ?
                                SampleTestData.generateEditableColumns(this.colsCount, this.columnsType, this.columnNamePrefix)
                                : SampleTestData.generateColumnsByType(this.colsCount, this.columnsType, this.columnNamePrefix);
        this.data = SampleTestData.generateDataForColumns(this.columns, this.rowsCount, this.startFromOne);
    }

    public isHorizonatScrollbarVisible() {
        const scrollbar = this.grid.parentVirtDir.getHorizontalScroll();
        return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
    }
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.idNameJobHireDate)
})
export class BasicGridSearchComponent extends GridWithSizeComponent {
    public highlightClass = 'igx-highlight';
    public activeClass = 'igx-highlight__active';
}

@Component({
    template: GridTemplateStrings.declareGrid(` [paging]="paging" [perPage]="perPage"`,
        '', ColumnDefinitions.idNameJobTitle)
})
export class PagingComponent extends GridWithSizeComponent {
    public paging = true;
    public perPage = 3;

    data = SampleTestData.personJobDataFull();
}

@Component({
    template: GridTemplateStrings.declareGrid(` [rowSelectable]="rowSelectable"`,
        '', ColumnDefinitions.productBasic)
})
export class SelectionComponent extends BasicGridComponent {
    public rowSelectable = true;

    data = SampleTestData.generateBigValuesData(100);
}

@Component({
    template: GridTemplateStrings.declareGrid(` [autoGenerate]="true" [showToolbar]="showToolbar" [columnHiding]="columnHiding"
    [columnPinning]="columnPinning" [exportExcel]="exportExcel" [exportCsv]="exportCsv"`,
        '', '')
})
export class GridWithToolbarComponent extends GridWithSizeComponent {
    public showToolbar = true;
    public columnHiding = true;
    public columnPinning = true;
    public exportExcel = true;
    public exportCsv = true;

    data = SampleTestData.contactInfoData();
}

@Component({
    template: `<div>
    <igx-column-hiding [columns]="grid.columns" *ngIf="showInline"></igx-column-hiding>
    ${ GridTemplateStrings.declareGrid(` #grid [height]="height" [width]="width"`, ``, ColumnDefinitions.productHidable) }
    </div>`
})
export class ColumnHidingTestComponent extends GridWithSizeComponent implements OnInit, AfterViewInit {
    @ViewChild(IgxColumnHidingComponent) public chooser: IgxColumnHidingComponent;
    width = '500px';
    height = '500px';
    showInline = true;

    constructor(private cdr: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.data = SampleTestData.productInfoData();
    }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }
}

@Component({
    template: `<div>
    <igx-column-hiding [columns]="grid.columns" *ngIf="showInline"></igx-column-hiding>
    ${ GridTemplateStrings.declareGrid(` #grid [height]="height" [width]="width"`, ``, ColumnDefinitions.contactInfoGroupableColumns) }
    </div>`
})
export class ColumnGroupsHidingTestComponent extends ColumnHidingTestComponent {
    constructor(cdr: ChangeDetectorRef) { super(cdr); }
    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `<div>
        <igx-column-pinning [columns]="grid.columns" *ngIf="showInline"></igx-column-pinning>
        ${GridTemplateStrings.declareGrid(`#grid [height]="height" [width]="width"`, ``, ColumnDefinitions.productFilterable)}
    </div>`
})
export class ColumnPinningTestComponent extends GridWithSizeComponent implements AfterViewInit, OnInit {
    @ViewChild(IgxColumnPinningComponent) public chooser: IgxColumnPinningComponent;

    height = '500px';
    width = '500px';
    showInline = true;

    constructor(private cdr: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.data = SampleTestData.productInfoData();
    }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }
}

@Component({
    template: `<div>
    <igx-column-pinning [columns]="grid.columns" *ngIf="showInline"></igx-column-pinning>
    ${ GridTemplateStrings.declareGrid(` #grid [height]="height" `, ``, ColumnDefinitions.contactInfoGroupableColumns) }
    </div>`
})
export class ColumnGroupsPinningTestComponent extends ColumnPinningTestComponent {
    constructor(cdr: ChangeDetectorRef) { super(cdr); }
    data = SampleTestData.contactInfoDataFull();
}
