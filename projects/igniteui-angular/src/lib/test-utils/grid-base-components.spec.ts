import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SampleTestData } from './sample-test-data.spec';
import { ColumnDefinitions, GridTemplateStrings } from './template-strings.spec';
import { IgxGridComponent } from '../grids/grid/grid.component';
import { IgxColumnActionsComponent } from '../grids/column-actions/column-actions.component';
import { GridPagingMode } from '../grids/common/enums';
import { IgxColumnComponent } from '../grids/columns/column.component';
import { IgxGridToolbarComponent } from '../grids/toolbar/grid-toolbar.component';
import { IgxGridToolbarHidingComponent } from '../grids/toolbar/grid-toolbar-hiding.component';
import { IgxGridToolbarActionsComponent } from '../grids/toolbar/common';
import { IgxPaginatorComponent } from '../paginator/paginator.component';
import { IgxColumnGroupComponent } from '../grids/columns/column-group.component';
import { IgxGridToolbarPinningComponent } from '../grids/toolbar/grid-toolbar-pinning.component';
import { NgFor, NgIf } from '@angular/common';
import { IgxCellTemplateDirective } from '../grids/columns/templates.directive';
import { IgxColumnHidingDirective } from '../grids/column-actions/column-hiding.directive';
import { IgxColumnPinningDirective } from '../grids/column-actions/column-pinning.directive';

@Component({
    template: `
        <igx-grid
            [data]="data"
            [autoGenerate]="true">
        </igx-grid>
    `,
    selector: 'igx-basic-grid',
    imports: [IgxGridComponent]
})
export class BasicGridComponent {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public data = [];
}

@Component({
    template: `
        <igx-grid
            [data]="data"
            [autoGenerate]="autoGenerate">
        </igx-grid>
    `,
    selector: 'igx-auto-generate-grid',
    imports: [IgxGridComponent]
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
    `,
    imports: [IgxGridComponent]
})
export class GridWithSizeComponent extends GridAutoGenerateComponent {
    public width = '100%';
    public height = '100%';

    public scrollTop(newTop: number) {
        this.grid.verticalScrollContainer.getScroll().scrollTop = newTop;
    }
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.generatedEditable),
    imports: [IgxGridComponent, IgxColumnComponent, NgFor]
})
export class GridNxMComponent extends GridWithSizeComponent implements OnInit {
    public colsCount: number;
    public rowsCount: number;
    public columnsType = 'string';
    public hasEditableColumns = true;
    public startFromOne = false;
    public columnNamePrefix = 'col';
    public columns = [];
    public override autoGenerate = false;

    public ngOnInit() {
        this.columns = (this.hasEditableColumns) ?
                                SampleTestData.generateEditableColumns(this.colsCount, this.columnsType, this.columnNamePrefix)
                                : SampleTestData.generateColumnsByType(this.colsCount, this.columnsType, this.columnNamePrefix);
        this.data = SampleTestData.generateDataForColumns(this.columns, this.rowsCount, this.startFromOne);
    }

    public isHorizonatScrollbarVisible() {
        const scrollbar = this.grid.headerContainer.getScroll();
        return scrollbar.offsetWidth < (scrollbar.children[0] as HTMLElement).offsetWidth;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid('', '', ColumnDefinitions.idNameJobHireDate, '', '<igx-paginator *ngIf="paging"></igx-paginator>'),
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent, NgIf]
})
export class BasicGridSearchComponent extends GridWithSizeComponent {
    public highlightClass = 'igx-highlight';
    public activeClass = 'igx-highlight__active';
    public paging = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(``, '', ColumnDefinitions.idNameJobTitle, '', '<igx-paginator *ngIf="paging" [perPage]="perPage"></igx-paginator>'),
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent, NgIf]
})
export class PagingComponent extends GridWithSizeComponent {
    public paging = true;
    public perPage = 3;
    public override data = SampleTestData.personJobDataFull();
}

@Component({
    template: GridTemplateStrings.declareGrid('[pagingMode]="pagingMode"', '', ColumnDefinitions.idNameJobTitle, '', '<igx-paginator [perPage]="perPage" [totalRecords]="totalRecords"></igx-paginator>'),
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent]
})
export class RemotePagingComponent extends GridWithSizeComponent {
    public pagingMode = GridPagingMode.Remote;
    public perPage = 3;
    public totalRecords = 10;
    public override data = SampleTestData.personJobDataFull();
}

@Component({
    template: GridTemplateStrings.declareGrid(` rowSelection = "multiple"`, '', ColumnDefinitions.productBasicNumberID),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class SelectionComponent extends BasicGridComponent {
    public override data = SampleTestData.generateBigValuesData(100);
}

@Component({
    template: GridTemplateStrings.declareGrid(` [autoGenerate]="true" [exportExcel]="exportExcel" [exportCsv]="exportCsv"`, '', ''),
    imports: [IgxGridComponent]
})
export class GridWithToolbarComponent extends GridWithSizeComponent {
    public showToolbar = true;
    public columnHiding = true;
    public columnPinning = true;
    public exportExcel = true;
    public exportCsv = true;

    public override data = SampleTestData.contactInfoData();
}

@Component({
    template: GridTemplateStrings.declareGrid(` [autoGenerate]="true" [rowClasses]="rowClasses"`, '', ''),
    imports: [IgxGridComponent]
})
export class GridRowConditionalStylingComponent extends GridWithSizeComponent {

    public override data = SampleTestData.contactInfoData();
    public evenRowCondition = (row) => row.index % 2 === 0;
    public oddRowCondition = (row) => row.index % 2 !== 0;

    public rowClasses = {
        eventRow: this.evenRowCondition,
        oddRow: this.oddRowCondition
    };
}
@Component({
    template: `<div>
    <igx-column-actions
        igxColumnHiding
        [style.--ig-size]="'var(--ig-size-large)'"
        [grid]="grid"
        *ngIf="showInline"
        [hideFilter]="hideFilter"></igx-column-actions>
    ${GridTemplateStrings.declareGrid('#grid [height]="height" [width]="width"', '', ColumnDefinitions.productHidable, '<igx-grid-toolbar><igx-grid-toolbar-actions>' + '<igx-grid-toolbar-hiding buttonText="Hidden"></igx-grid-toolbar-hiding>' +
        '</igx-grid-toolbar-actions></igx-grid-toolbar>', '<igx-paginator *ngIf="paging"></igx-paginator>')}
    </div>`,
    imports: [
        IgxGridComponent,
        IgxColumnComponent,
        IgxColumnActionsComponent,
        IgxGridToolbarComponent,
        IgxGridToolbarHidingComponent,
        IgxGridToolbarActionsComponent,
        IgxPaginatorComponent,
        IgxColumnHidingDirective,
        NgIf
    ]
})
export class ColumnHidingTestComponent extends GridWithSizeComponent implements OnInit, AfterViewInit {
    @ViewChild(IgxColumnActionsComponent)
    public chooser: IgxColumnActionsComponent;
    public override width = '500px';
    public override height = '500px';
    public showInline = true;
    public hideFilter = false;
    public paging = false;

    constructor(private cdr: ChangeDetectorRef) {
        super();
    }

    public get hiddenColumnsCount(): number {
        return this.chooser.columnItems.filter(c => c.checked).length;
    }

    public ngOnInit() {
        this.data = SampleTestData.productInfoData();
    }

    public ngAfterViewInit() {
        this.cdr.detectChanges();
    }
}

@Component({
    template: `<div>
    <igx-column-actions igxColumnHiding [grid]="grid" *ngIf="showInline"></igx-column-actions>
    ${GridTemplateStrings.declareGrid(' #grid [height]="height" [width]="width" [moving]="true"', '', ColumnDefinitions.contactInfoGroupableColumns)}
    </div>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnActionsComponent, IgxColumnGroupComponent, IgxColumnHidingDirective, NgIf]
})
export class ColumnGroupsHidingTestComponent extends ColumnHidingTestComponent {
    @ViewChild(IgxGridComponent, { static: true }) public override grid: IgxGridComponent;

    public hasGroupColumns = false;
    public override data = SampleTestData.contactInfoDataFull();
    constructor(cdr: ChangeDetectorRef) {
        super(cdr);
    }
}

@Component({
    template: `<div>
        <igx-column-actions igxColumnPinning [grid]="grid" *ngIf="showInline" [hideFilter]="hideFilter"></igx-column-actions>
        ${GridTemplateStrings.declareGrid('#grid [height]="height" [width]="width"', '', ColumnDefinitions.productFilterable, '<igx-grid-toolbar>' +
        '<igx-grid-toolbar-actions><igx-grid-toolbar-pinning></igx-grid-toolbar-pinning></igx-grid-toolbar-actions>' +
        '</igx-grid-toolbar>')}
    </div>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnActionsComponent, IgxColumnPinningDirective, IgxGridToolbarComponent, IgxGridToolbarPinningComponent, IgxGridToolbarActionsComponent, NgIf]
})
export class ColumnPinningTestComponent extends GridWithSizeComponent implements AfterViewInit, OnInit {
    @ViewChild(IgxColumnActionsComponent) public chooser: IgxColumnActionsComponent;

    public override height = '500px';
    public override width = '500px';
    public showInline = true;
    public hideFilter = false;

    constructor(private cdr: ChangeDetectorRef) {
        super();
    }

    public ngOnInit() {
        this.data = SampleTestData.productInfoData();
    }

    public ngAfterViewInit() {
        this.cdr.detectChanges();
    }
}
@Component({
    template: `
    <igx-grid #grid [height]="height" [width]="width" [autoGenerate]="false" [data]='data'>
    <igx-column field="ID" header="ID">
    </igx-column>
    <igx-column field="ReleaseDate" header="ReleaseDate">
    </igx-column>
    <igx-column field="Downloads" header="Downloads">
    </igx-column>
    <igx-column field="ProductName" [pinned]='true'>
        <ng-template igxCell let-cell="cell" let-val let-row >
            <div style="height:100px;">
                {{val}}
            </div>
        </ng-template>
    </igx-column>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxCellTemplateDirective]
})
export class ColumnPinningWithTemplateTestComponent extends ColumnPinningTestComponent {
}

@Component({
    template: `<div>
    <igx-column-actions igxColumnPinning [grid]="grid" *ngIf="showInline"></igx-column-actions>
    ${GridTemplateStrings.declareGrid(' #grid [height]="height" [moving]="true"', '', ColumnDefinitions.contactInfoGroupableColumns, '<igx-grid-toolbar></igx-grid-toolbar>')}
    </div>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent, IgxGridToolbarComponent, IgxColumnActionsComponent, IgxColumnPinningDirective, NgIf]
})
export class ColumnGroupsPinningTestComponent extends ColumnPinningTestComponent {
    public override data = SampleTestData.contactInfoDataFull();

    constructor(cdr: ChangeDetectorRef) {
        super(cdr);
    }
}
