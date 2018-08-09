import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { IgxGridComponent } from '../grid/grid.component';
import { SampleTestData } from './sample-test-data.spec';
import { ColumnDefinitions, GridTemplateStrings } from './template-strings.spec';

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

export class BasicVirtualGridComponent extends BasicGridComponent implements OnInit, OnDestroy {

    ngOnInit(): void {
        this.grid.verticalScrollContainer.onChunkLoad.subscribe(
            next => {
                this.grid.markForCheck();
            }
        );
    }
    ngOnDestroy(): void {
        this.grid.verticalScrollContainer.onChunkLoad.unsubscribe();
    }

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

    data = SampleTestData.personJobDataFull;
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
export class GridWithToolbarComponent extends BasicGridComponent {
    public showToolbar = true;
    public columnHiding = true;
    public columnPinning = true;
    public exportExcel = true;
    public exportCsv = true;

    data = SampleTestData.contactInfoData;
}

