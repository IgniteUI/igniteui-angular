import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { IgxColumnComponent } from '../grid/column.component';
import { IgxGridComponent } from '../grid/grid.component';
import { SampleTestData } from './sample-test-data.spec';
import { ColumnDefinitions, GridTemplateStrings } from './template-strings.spec';

@Component({
    template: `
        <igx-grid
            [data]="data">
        </igx-grid>
    `
})
export class BasicGridComponent {
    @Input()
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
    @Input()
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
    @Input()
    public width: string;

    @Input()
    public height: string;
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
export class GridNxMComponent extends GridWithSizeComponent implements OnInit {
    public colsCount: number;
    public rowsCount: number;
    public columnsType = 'string';
    public hasEditableColumns = false;
    public startFromOne = false;
    public columnNamePrefix = 'col';
    public columns = [];

    ngOnInit() {
        this.columns = (this.hasEditableColumns) ? SampleTestData.generateEditableColumns(this.colsCount, this.columnNamePrefix)
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
export class BasicGridSearchComponent extends BasicGridComponent {
    public highlightClass = 'igx-highlight';
    public activeClass = 'igx-highlight__active';
}

/* To be removed!!! */
// @Component({
//     template: GridTemplateStrings.declareGrid('',
//         ` (onColumnInit)="init($event)"`,
//         ColumnDefinitions.generatedWithDataType)
// })
// export class SummariesNxMComponent extends BasicGridComponent {
//     public columns = [];

//     constructor(rows: number, cols: number, colsType: string) {
//         super();
//         this.columns = SampleTestData.generateColumnsByType(cols, colsType);
//         this.data = SampleTestData.generateDataForColumns(this.columns, rows);
//     }

//     init(column: IgxColumnComponent) {
//         column.hasSummary = true;
//     }

//     public isHorizonatScrollbarVisible() {
//         const scrollbar = this.grid.parentVirtDir.getHorizontalScroll();
//         return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
//     }
// }

@Component({
    template: GridTemplateStrings.declareGrid(` [paging]="paging" [perPage]="perPage"`,
        '', ColumnDefinitions.idNameJobTitle)
})
export class PagingComponent extends BasicGridComponent {
    public paging = true;
    public perPage = 3;

    data = SampleTestData.personJobData;
}

@Component({
    template: GridTemplateStrings.declareGrid(` [rowSelectable]="rowSelectable"`,
        '', ColumnDefinitions.productBasic)
})
export class SelectionComponent extends BasicGridComponent {
    public rowSelectable = true;
}
