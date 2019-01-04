import { Component, TemplateRef, ViewChild, Input } from '@angular/core';
import { IgxGridCellComponent } from '../grids/cell.component';
import { IgxDateSummaryOperand, IgxNumberSummaryOperand, IgxSummaryResult } from '../grids/summaries/grid-summary';
import { IGridCellEventArgs, IGridEditEventArgs } from '../grids/grid-base.component';
import { BasicGridComponent, BasicGridSearchComponent, GridAutoGenerateComponent,
        GridNxMComponent, GridWithSizeComponent, PagingComponent } from './grid-base-components.spec';
import { IGridSelection, IEditDone, IGridRowEvents, IGridRowSelectionChange } from './grid-interfaces.spec';
import { SampleTestData } from './sample-test-data.spec';
import { ColumnDefinitions, GridTemplateStrings, EventSubscriptions } from './template-strings.spec';
import { IgxColumnComponent } from '../grids/column.component';

@Component({
    template: `<div style="width: 800px; height: 600px;">
            ${GridTemplateStrings.declareGrid(` [autoGenerate]="autoGenerate"`, '', ColumnDefinitions.indexAndValue)}</div>`
})
export class GridInDivComponent extends GridAutoGenerateComponent {
    data = SampleTestData.oneItemNumberData();
    autoGenerate = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(` width="500px"`, '', ColumnDefinitions.pinnedTwoOfFour)
})
export class PinningAndResizingComponent extends BasicGridComponent {
    data = SampleTestData.personIDNameRegionData();
}

@Component({
    template: GridTemplateStrings.declareGrid(` width="600px" height="600px" [autoGenerate]="false"`, '',
                ColumnDefinitions.pinnedThreeOfEight)
})
export class LargePinnedColGridComponent extends BasicGridComponent {
    data = SampleTestData.generateProductData(75);
}

@Component({
    template: GridTemplateStrings.declareGrid('',
                EventSubscriptions.onColumnResized,
                ColumnDefinitions.gridFeatures)
})
export class SortingAndResizingComponent extends BasicGridComponent {

    public count = 0;
    public column;
    public prevWidth;
    public newWidth;

    data = SampleTestData.productInfoData();

    columnResized(event) {
                this.count++;
                this.column = event.column;
                this.prevWidth = event.prevWidth;
                this.newWidth = event.newWidth;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` [height]="'800px'"`, '',
                ColumnDefinitions.resizableColsComponent)
})
export class ResizableColumnsComponent extends BasicGridComponent {

    public columns = [
        { field: 'ID', resizable: true, maxWidth: 200, minWidth: 70 },
        { field: 'CompanyName', resizable: true },
        { field: 'ContactName', resizable: true },
        { field: 'ContactTitle', resizable: true},
        { field: 'Address', resizable: true },
        { field: 'City', resizable: true },
        { field: 'Region', resizable: true },
        { field: 'PostalCode', resizable: true },
        { field: 'Phone', resizable: true },
        { field: 'Fax', resizable: true }
    ];

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: GridTemplateStrings.declareGrid(` [height]="'800px'"`, '',
                ColumnDefinitions.iterableComponent)
})
export class ColumnsFromIterableComponent extends BasicGridComponent {

    public columns = [ 'ID', 'Name'];
    data = SampleTestData.personIDNameData();
}

@Component({
    template: GridTemplateStrings.declareGrid('', '',
                ColumnDefinitions.columnTemplates)
})
export class TemplatedColumnsComponent extends BasicGridComponent {
    data = SampleTestData.personIDNameData();

    @ViewChild('newHeader', { read: TemplateRef })
    public newHeaderTemplate: TemplateRef<any>;

    @ViewChild('newCell', { read: TemplateRef })
    public newCellTemplate: TemplateRef<any>;
}

@Component({
    template: GridTemplateStrings.declareGrid('', '',
            `<igx-column field="ID" [hidden]="true"></igx-column>`)
})
export class ColumnHiddenFromMarkupComponent extends BasicGridComponent {
    data = SampleTestData.personIDNameData();
}

@Component({
    template: GridTemplateStrings.declareGrid('', '',
                ColumnDefinitions.idNameFormatter)
})
export class ColumnCellFormatterComponent extends BasicGridComponent {
    data = SampleTestData.personIDNameData();

    public multiplier(value: number): string {
        return `${value * value}`;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` height="500px"`, '',
                ColumnDefinitions.productFilterable)
})
export class FilteringComponent extends BasicGridComponent {
    data = SampleTestData.productInfoData();
}

@Component({
    template: `
        <igx-grid #gridSelection2 [data]="data" [primaryKey]="'ID'"
        [autoGenerate]="true" [rowSelectable]="true" [paging]="true" [perPage]="50">
        </igx-grid>
        <button class="prevPageBtn" (click)="ChangePage(-1)">Prev page</button>
        <button class="nextPageBtn" (click)="ChangePage(1)">Next page</button>
    `
})
export class SelectionAndPagingComponent extends BasicGridComponent {
    data = SampleTestData.generateBigValuesData(100);

    public ChangePage(val) {
        switch (val) {
            case -1:
                this.grid.previousPage();
                break;
            case 1:
                this.grid.nextPage();
                break;
            default:
                this.grid.paginate(val);
                break;
        }
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(
            ` #gridSelection3 [primaryKey]="'ID'" [width]="'800px'" [height]="'600px'" [autoGenerate]="true" [rowSelectable]="true"`,
            '', '')
})
export class SelectionComponent extends BasicGridComponent {
    data = SampleTestData.generateBigValuesData(100);
}

@Component({
    template: GridTemplateStrings.declareGrid(
            ` [rowSelectable]="true"`,
            EventSubscriptions.onRowSelectionChange,
            ColumnDefinitions.productBasic)
})
export class SelectionCancellableComponent extends BasicGridComponent {
    data = SampleTestData.foodProductData();

    public rowSelectionChange(evt) {
        if (evt.row && (evt.row.index + 1) % 2 === 0) {
            evt.newSelection = evt.oldSelection || [];
        }
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(
            ` #gridSelection3
            [primaryKey]="'ID'"
            [width]="'800px'"
            [height]="'600px'"
            [autoGenerate]="true"
            [rowSelectable]="true"`,
            EventSubscriptions.onColumnInit, '')
})
export class ScrollsComponent extends BasicGridComponent {
    data = SampleTestData.generateBigDataRowsAndCols(16, 16);
    public columnInit(column) {
        // column.width = '50px';
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(
            ` [rowSelectable]="true"`,
            '', ColumnDefinitions.productDefaultSummaries)
})
export class SummariesComponent extends BasicGridComponent {
    data = SampleTestData.foodProductData();
}

class DealsSummaryMinMax extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'min' || obj.key === 'max') {
                const summaryResult = obj.summaryResult;
                // apply formatting to float numbers
                if (Number(summaryResult) === summaryResult) {
                    obj.summaryResult = summaryResult.toLocaleString('en-us', { maximumFractionDigits: 2 });
                }
                return obj;
            }
        });
        return result;
    }
}
@Component({
    template: GridTemplateStrings.declareGrid(
            `  [primaryKey]="'ProductID'" [allowFiltering]="true"`,
            '', ColumnDefinitions.productDefaultSummaries)
})
export class SummaryColumnComponent extends BasicGridComponent {
    data = SampleTestData.foodProductData();
    public hasSummary = true;

    public numberSummary = new IgxNumberSummaryOperand();
    public dateSummary = new IgxDateSummaryOperand();
    public dealsSummaryMinMax = DealsSummaryMinMax;
}

@Component({
    template: GridTemplateStrings.declareGrid(
            ` [width]="width" [height]="height"`,
            '', ColumnDefinitions.productDefaultSummaries)
})
export class VirtualSummaryColumnComponent extends BasicGridComponent {
    data = SampleTestData.foodProductDataExtended();

    public width = '800px';
    public height = '600px';

    public numberSummary = new IgxNumberSummaryOperand();
    public dateSummary = new IgxDateSummaryOperand();

    public scrollTop(newTop: number) {
        const vScrollbar = this.grid.verticalScrollContainer.getVerticalScroll();
        vScrollbar.scrollTop = newTop;
    }

    public scrollLeft(newLeft: number) {
        const hScrollbar = this.grid.parentVirtDir.getHorizontalScroll();
        hScrollbar.scrollLeft = newLeft;
    }

}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.productBasic)
})
export class ProductsComponent extends BasicGridComponent {
    data = SampleTestData.foodProductData();
}

@Component({
    template: GridTemplateStrings.declareGrid(` style="margin-bottom: 20px;"`,
        EventSubscriptions.onColumnInit,
        ColumnDefinitions.generatedWithSummaries)
})
export class DefaultSizeAndSummaryComponent extends BasicGridComponent {
    public columns = [];

    columnInit(column) {
        switch (this.grid.columnList.length) {
            case 5:
                if (column.index === 0 || column.index === 4) {
                    column.width = '200px';
                }
                break;
            case 30:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 25) {
                    column.width = '200px';
                }
                break;
            case 150:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 50) {
                    column.width = '500px';
                }
                break;
        }
    }

    public isHorizonatScrollbarVisible() {
        const scrollbar = this.grid.parentVirtDir.getHorizontalScroll();
        return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` [autoGenerate]="autoGenerate"`,
        EventSubscriptions.onColumnInit, ColumnDefinitions.generatedWithDataType)
})
export class NxMWithSummaryComponent extends GridNxMComponent {
    columnsType = 'number';
    columnInit(column) {
        column.hasSummary = true;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` [autoGenerate]="autoGenerate"`,
        EventSubscriptions.onColumnInit, ColumnDefinitions.generatedEditable)
})
export class NxMWithSummaryEditableComponent extends NxMWithSummaryComponent {
    hasEditableColumns = true;
    startFromOne = true;
}

@Component({
    template: GridTemplateStrings.declareGrid(` [autoGenerate]="autoGenerate"`,
                EventSubscriptions.onColumnInit, '')
})
export class NxMColumnWidthAndSummaryComponent extends NxMWithSummaryComponent {
    columnInit(column) {
        switch (this.grid.columnList.length) {
            case 5:
                if (column.index === 0 || column.index === 4) {
                    column.width = '200px';
                }
                break;
            case 30:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 25) {
                    column.width = '200px';
                }
                break;
            case 150:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 50) {
                    column.width = '500px';
                }
                break;
        }
    }
}

@Component({
    template: GridTemplateStrings.declareGrid('',
        EventSubscriptions.onColumnInit,
        ColumnDefinitions.generatedEditable)
})
export class Grid5x5WithSummariesComponent extends NxMWithSummaryEditableComponent {
    colsCount = 5;
    rowsCount = 5;
}
// export class Summaries5x5Component extends BasicGridComponent {
//     public columns = [];

//     constructor() {
//         super();
//         this.columns = SampleTestData.generateEditableColumns(5, 'number');
//         this.data = SampleTestData.generateDataForColumns(this.columns, 5, true);
//     }

//     init(column) {
//         column.hasSummary = true;
//     }
// }

@Component({
    template: GridTemplateStrings.declareGrid('',
        EventSubscriptions.onColumnInit,
        ColumnDefinitions.generatedWithDataType)
})
export class Grid10x30WithSummariesComponent extends NxMWithSummaryComponent {
    colsCount = 10;
    rowsCount = 30;
}
// export class Summaries10x30Component extends SummariesNxMComponent {
//     constructor() {
//         super(30, 10, 'number');
//     }
// }

@Component({
    template: GridTemplateStrings.declareGrid(` [width]="'1500px'"`,
        EventSubscriptions.onColumnInit,
        ColumnDefinitions.generatedWithDataType)
})
export class Grid30x1000WithSummariesComponent extends NxMWithSummaryComponent {
    colsCount = 30;
    rowsCount = 1000;
}
// export class Summaries30x1000Component extends SummariesNxMComponent {
//     constructor() {
//         super(1000, 30, 'number');
//     }
// }

@Component({
    template: GridTemplateStrings.declareGrid(` [width]="'1500px'"`,
        EventSubscriptions.onColumnInit,
        ColumnDefinitions.generatedWithDataType)
})
export class Grid150x200WithSummariesComponent extends NxMWithSummaryComponent {
    colsCount = 150;
    rowsCount = 200;
}
// export class Summaries150x200Component extends SummariesNxMComponent {
//     constructor() {
//         super(200, 150, 'number');
//     }
// }

@Component({
    template: `
    <div style="width: 800px; height: 600px;">
        <igx-grid #grid [data]="data" [autoGenerate]="true" [height]="width" [width]="height">
        </igx-grid>
    </div>`
})
export class WidthAndHeightComponent extends BasicGridComponent {
    public width: string;
    public height: string;

    data = SampleTestData.generateData(30, 3);
}

@Component({
    template: `
    <div style="height: 200px; overflow: auto;">
        <igx-grid #grid [data]="data" [autoGenerate]="true" [height]="null">
        </igx-grid>
    </div>`
})
export class NullHeightComponent extends BasicGridComponent {
    data = SampleTestData.generateData(20, 5);
}

@Component({
    template: `
        <igx-grid
            [data]="data"
            ${ EventSubscriptions.onRowAdded }
            ${ EventSubscriptions.onRowDeleted }
            ${ EventSubscriptions.onEditDone }
            [autoGenerate]="true">
        </igx-grid>
    `
})
export class DefaultCRUDGridComponent extends BasicGridComponent {
    public rowsAdded = 0;
    public rowsDeleted = 0;

    public rowAdded(event) {
        this.rowsAdded++;
    }

    public rowDeleted(event) {
        this.rowsDeleted++;
    }

    public editDone(event: IGridEditEventArgs) {
        if (event.newValue === 'change') {
            event.newValue = event.cellID ? 200 : { index: 200, value: 200 };
        }
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` [paging]="paging" [perPage]="perPage"`,
        '', ColumnDefinitions.idNameJobTitleEditable) + `
        <button id="prevPageBtn" igxButton (click)="GoToPage(-2)">Prev page</button>
        <button id="nextPageBtn" igxButton (click)="GoToPage(-1)">Next page</button>
        <button id="idxPageBtn" igxButton (click)="GoToPage(2)">Go to 3rd page</button>
        `
})
export class PagingAndEditingComponent extends PagingComponent {
    perPage = 4;

    public GoToPage(val) {
        switch (val) {
            case -2:
                this.grid.previousPage();
                break;
            case -1:
                this.grid.nextPage();
                break;
            default:
                this.grid.paginate(val);
                break;
        }
    }
}

@Component({
    template: GridTemplateStrings.declareGrid('', '',
                ColumnDefinitions.idNameHiddenJobHirePinned)
})
export class GridSearchHiddenColumnsComponent extends BasicGridSearchComponent {
    data = SampleTestData.personJobData();
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.idFirstLastNameSortable)
})
export class GridDeclaredColumnsComponent extends BasicGridComponent {
    data = SampleTestData.personIDNameRegionData();

    @ViewChild('nameColumn') public nameColumn;
}

@Component({
    template: GridTemplateStrings.declareGrid(` [autoGenerate]="autoGenerate" [height]="height" [width]="width"`,
                `${ EventSubscriptions.onColumnInit }${ EventSubscriptions.onSelection }`, '')
})
export class PinOnInitAndSelectionComponent extends GridWithSizeComponent {
    data = SampleTestData.contactInfoDataFull();
    width = '800px';
    height = '300px';

    public selectedCell;
    public columnInit(column) {
        if (column.field === 'CompanyName' || column.field === 'ContactName') {
            column.pinned = true;
        }
        column.width = '200px';
    }

    public cellSelected(event) {
        this.selectedCell = event.cell;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` [height]="height" [width]="width"`,
                `${ EventSubscriptions.onSelection }${ EventSubscriptions.onColumnPinning }`,
                ColumnDefinitions.generatedWithWidth)
})
export class PinningComponent extends GridWithSizeComponent
                                implements IGridSelection {

    public column: IgxColumnComponent;
    public columns = [
        { field: 'ID', width: 100 },
        { field: 'CompanyName', width: 300 },
        { field: 'ContactName', width: 200 },
        { field: 'ContactTitle', width: 200 },
        { field: 'Address', width: 300 },
        { field: 'City', width: 100 },
        { field: 'Region', width: 100 },
        { field: 'PostalCode', width: 100 },
        { field: 'Phone', width: 150 },
        { field: 'Fax', width: 150 }
    ];

    data = SampleTestData.contactMariaAndersData();
    width = '800px';
    height = '300px';

    selectedCell: IgxGridCellComponent;
    cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }

    public columnPinning($event) {
        $event.insertAtIndex = 0;
    }
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.productFilterSortPin)
})
export class GridFeaturesComponent extends BasicGridComponent {
    data = SampleTestData.productInfoData();

}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` columnWidth="200" `,
        '', ColumnDefinitions.idNameJobHireDate)
})
export class ScrollableGridSearchComponent extends BasicGridSearchComponent {
    data = SampleTestData.generateFromData(SampleTestData.personJobDataFull(), 30);
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` columnWidth="200" `,
        '', ColumnDefinitions.idNameJobTitleCompany)
})
export class GroupableGridSearchComponent extends ScrollableGridSearchComponent {
    data = SampleTestData.personIDNameJobCompany();
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` [height]="height" [width]="width" [columnWidth]="columnWidth" `,
        '', ColumnDefinitions.productAllColumnFeatures)
})
export class GridAllFeaturesComponent extends GridWithSizeComponent {
    @Input()
    public columnWidth = 200;

}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.nameJobTitleId)
})
export class ReorderedColumnsComponent extends BasicGridComponent {
    data = SampleTestData.personJobData();
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.idNameJobTitleEditable)
})
export class GridIDNameJobTitleComponent extends PagingComponent {
    data = SampleTestData.personJobDataFull();
    width = '100%';
    height = '100%';
}

@Component({
    template: `<div style="margin: 50px;">
            ${GridTemplateStrings.declareGrid(
                `[height]="height" [width]="width" [rowSelectable]="enableRowSelection" [autoGenerate]="autoGenerate"`,
                EventSubscriptions.onColumnMovingStart + EventSubscriptions.onColumnMoving + EventSubscriptions.onColumnMovingEnd,
                ColumnDefinitions.movableColumns)}</div>`
})
export class MovableColumnsComponent extends BasicGridComponent {
    data = SampleTestData.personIDNameRegionData();
    autoGenerate = false;
    enableRowSelection = false;
    isFilterable = false;
    isSortable = false;
    isResizable = false;
    isEditable = false;
    isHidden = false;
    isGroupable = false;
    width = '500px';
    height = '300px';
    count = 0;
    countStart = 0;
    countEnd = 0;
    cancel = false;
    source: IgxColumnComponent;
    target: IgxColumnComponent;

    onColumnMovingStarted(event) {
        this.countStart++;
        this.source = event.source;
    }

    onColumnMoving(event) {
        this.count++;
        this.source = event.source;

        if (this.cancel) {
            event.cancel = true;
        }
    }

    onColumnMovingEnded(event) {
        this.countEnd++;
        this.source = event.source;
        this.target = event.target;

        if (event.target.field === 'Region') {
            event.cancel = true;
        }
    }
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="300px" width="500px"`, '', ColumnDefinitions.movableColumns)}`
})
export class MovableTemplatedColumnsComponent extends BasicGridComponent {
    data = SampleTestData.personIDNameRegionData();
    isFilterable = false;
    isSortable = false;
    isResizable = false;
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="300px" width="500px" [autoGenerate]="autoGenerate" [paging]="paging"`,
        EventSubscriptions.onColumnInit, '')}`
})
export class MovableColumnsLargeComponent extends GridAutoGenerateComponent {

    data = SampleTestData.contactInfoDataFull();

    width = '500px';
    height = '400px';
    paging = false;

    public columnInit(column: IgxColumnComponent) {
        column.movable = true;
        column.sortable = true;
        column.width = '100px';
    }

    pinColumn(name: string) {
        const col = this.grid.getColumnByName(name);
        col.pinned = !col.pinned;
    }
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="800px"`, '', ColumnDefinitions.multiColHeadersColumns)}`
})
export class MultiColumnHeadersComponent extends BasicGridComponent {
    data = SampleTestData.contactInfoDataFull();
    isPinned = false;
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="800px"  width="500px"`, '',
        ColumnDefinitions.multiColHeadersWithGroupingColumns)}`
})
export class MultiColumnHeadersWithGroupingComponent extends BasicGridComponent {
    data = SampleTestData.contactInfoDataFull();
    isPinned = false;
}


@Component({
    template: `${GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.nameAvatar)}`
})
export class GridWithAvatarComponent extends GridWithSizeComponent {
    data = SampleTestData.personAvatarData();
    height = '500px';
}


@Component({
    template: `${GridTemplateStrings.declareGrid(`height="1000px"  width="900px" [primaryKey]="'ID'"`, '',
    ColumnDefinitions.summariesGoupByColumns)}`
})
export class SummarieGroupByComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
    public calculationMode = 'rootAndChildLevels';
    public ageSummary = AgeSummary;
    public ageSummaryTest = AgeSummaryTest;
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="800px"  width="400px" [primaryKey]="'ID'"`, '',
    ColumnDefinitions.summariesGoupByColumns)}`
})
export class SummarieGroupByWithScrollsComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
    public calculationMode = 'rootAndChildLevels';
    public ageSummary = AgeSummary;
    public ageSummaryTest = AgeSummaryTest;
}

class AgeSummary extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'average' || obj.key === 'sum' || obj.key === 'count') {
                const summaryResult = obj.summaryResult;
                // apply formatting to float numbers
                if (Number(summaryResult) === summaryResult) {
                    obj.summaryResult = summaryResult.toLocaleString('en-us', { maximumFractionDigits: 2 });
                }
                return obj;
            }
        });
        return result;
    }
}

class AgeSummaryTest extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries);
        result.push({
            key: 'test',
            label: 'Test',
            summaryResult: summaries.filter(rec => rec > 10 && rec < 40).length
        });

        return result;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(`[height]="gridHeight" [columnWidth]="defaultWidth" [width]="gridWidth"`,
    `${ EventSubscriptions.onSelection }`, ColumnDefinitions.generatedWithWidth)
})
export class VirtualGridComponent extends BasicGridComponent {
    public gridWidth = '800px';
    public gridHeight = '300px';
    public defaultWidth = '200px';
    public columns = [
        { field: 'index' },
        { field: 'value' },
        { field: 'other' },
        { field: 'another' }
    ];
     public selectedCell: IgxGridCellComponent;
     constructor() {
        super();
        this.data = this.generateData(1000);
    }
     public generateCols(numCols: number, defaultColWidth = null) {
        const cols = [];
        for (let j = 0; j < numCols; j++) {
            cols.push({
                field: j.toString(),
                width: defaultColWidth !== null ? defaultColWidth : j % 8 < 2 ? 100 : (j % 6) * 125
            });
        }
        return cols;
    }
     public generateData(numRows: number) {
        const data = [];
         for (let i = 0; i < numRows; i++) {
            const obj = {};
            for (let j = 0; j < this.columns.length; j++) {
                const col = this.columns[j].field;
                obj[col] = 10 * i * j;
            }
            data.push(obj);
        }
        return data;
    }
     public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }
     public scrollTop(newTop: number) {
        this.grid.verticalScrollContainer.getVerticalScroll().scrollTop = newTop;
    }
     public scrollLeft(newLeft: number) {
        this.grid.parentVirtDir.getHorizontalScroll().scrollLeft = newLeft;
    }
}
 @Component({
    template: GridTemplateStrings.declareGrid(
        ` [primaryKey]="'ID'"`,
        '', ColumnDefinitions.idNameJobHireDate)
})
export class GridWithPrimaryKeyComponent extends BasicGridSearchComponent {
    data = SampleTestData.personJobDataFull();
}
