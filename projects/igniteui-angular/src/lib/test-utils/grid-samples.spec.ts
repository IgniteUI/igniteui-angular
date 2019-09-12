import { Component, TemplateRef, ViewChild, Input, AfterViewInit, ChangeDetectorRef, QueryList, ViewChildren, OnInit } from '@angular/core';
import { IgxGridCellComponent } from '../grids/cell.component';
import { IgxDateSummaryOperand, IgxNumberSummaryOperand, IgxSummaryResult } from '../grids/summaries/grid-summary';
import { IGridCellEventArgs, IGridEditEventArgs, IgxGridTransaction } from '../grids/grid-base.component';
import { BasicGridComponent, BasicGridSearchComponent, GridAutoGenerateComponent,
        GridNxMComponent, GridWithSizeComponent, PagingComponent } from './grid-base-components.spec';
import { IGridSelection } from './grid-interfaces.spec';
import { SampleTestData, DataParent } from './sample-test-data.spec';
import { ColumnDefinitions, GridTemplateStrings, EventSubscriptions } from './template-strings.spec';
import { IgxColumnComponent } from '../grids/column.component';
import { IgxTransactionService } from '../services';
import { IgxFilteringOperand } from '../data-operations/filtering-condition';
import { ExpressionUI } from '../grids/filtering/grid-filtering.service';
import { IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { FilteringStrategy } from '../data-operations/filtering-strategy';
import { IgxGridComponent } from '../grids/grid';
import { IgxRowEditTabStopDirective } from '../grids/grid.rowEdit.directive';

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

    @ViewChild('newHeader', { read: TemplateRef, static: true })
    public newHeaderTemplate: TemplateRef<any>;

    @ViewChild('newCell', { read: TemplateRef, static: true })
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
    template: GridTemplateStrings.declareGrid(
            ` #gridSelection3 [primaryKey]="'ID'" [width]="'800px'" [height]="'600px'" [autoGenerate]="true" [rowSelection]="'multiple'"`,
            '', '')
})
export class SelectionComponent extends BasicGridComponent {
    data = SampleTestData.generateBigValuesData(20);
}

@Component({
    template: GridTemplateStrings.declareGrid(
            ` [width]="width" [height]="height" [rowSelection]="'multiple'" [primaryKey]="'ProductID'"`,
            '', ColumnDefinitions.productBasicNumberID)
})
export class RowSelectionComponent extends BasicGridComponent {
    data = SampleTestData.foodProductDataExtended();
    public width = '800px';
    public height = '600px';
}

@Component({
    template: GridTemplateStrings.declareGrid(
            ` [width]="width" [height]="height" [rowSelection]="'single'" [primaryKey]="'ProductID'"`,
            '', ColumnDefinitions.productBasicNumberID)
})
export class SingleRowSelectionComponent extends BasicGridComponent {
    data = SampleTestData.foodProductDataExtended();
    public width = '800px';
    public height = '600px';
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` [width]="width" [height]="height" [rowSelection]="'multiple'"`,
            '',
            ColumnDefinitions.idFirstLastNameSortable)
})

export class RowSelectionWithoutPrimaryKeyComponent extends BasicGridComponent {
    public data = SampleTestData.personIDNameRegionData();
    public width = '800px';
    public height = '600px';
}
@Component({
    template: GridTemplateStrings.declareGrid(
            ` rowSelection = "multiple"`,
            EventSubscriptions.onRowSelectionChange,
            ColumnDefinitions.productBasic)
})
export class SelectionCancellableComponent extends BasicGridComponent {
    data = SampleTestData.foodProductData();

    public rowSelectionChange(evt) {
        if (evt.added.length > 0  && (evt.added[0].ProductID) % 2 === 0) {
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
            rowSelection = "multiple"`,
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
            ` rowSelection = "multiple"`,
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
            `  [primaryKey]="'ProductID'" [height]="null" [allowFiltering]="true"`,
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

    @ViewChild('nameColumn', { static: true }) public nameColumn;
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
        ` columnWidth="200" [height]="null" `,
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
                `[height]="height" [width]="width" [rowSelection]="rowSelection" [autoGenerate]="autoGenerate"`,
                EventSubscriptions.onColumnMovingStart + EventSubscriptions.onColumnMoving + EventSubscriptions.onColumnMovingEnd,
                ColumnDefinitions.movableColumns)}</div>`
})
export class MovableColumnsComponent extends BasicGridComponent {
    data = SampleTestData.personIDNameRegionData();
    autoGenerate = false;
    rowSelection = 'none';
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
    ColumnDefinitions.summariesGroupByColumns)}`
})
export class SummariesGroupByComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
    public calculationMode = 'rootAndChildLevels';
    public ageSummary = AgeSummary;
    public ageSummaryTest = AgeSummaryTest;
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="600px"  width="900px" [primaryKey]="'ID'"`, '',
    ColumnDefinitions.summariesGroupByTansColumns)}`,
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }]
})
export class SummariesGroupByTransactionsComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
    public calculationMode = 'rootAndChildLevels';
    public ageSummary = AgeSummary;
    public ageSummaryMinMax = DealsSummaryMinMax;
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="800px"  width="400px" [primaryKey]="'ID'"`, '',
    ColumnDefinitions.summariesGroupByColumns)}`
})
export class SummariesGroupByWithScrollsComponent extends BasicGridComponent {
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
     public generateCols(numCols: number, defaultColWidth: number = null) {
        const cols = [];
        for (let j = 0; j < numCols; j++) {
            cols.push({
                field: j.toString(),
                width: defaultColWidth || j % 8 < 2 ? 100 : (j % 6) * 125
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

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="300px"  width="600px" [primaryKey]="'ID'"`, '',
    ColumnDefinitions.selectionWithScrollsColumns)}`,
})
export class SelectionWithScrollsComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="300px"  width="600px" [primaryKey]="'ID'" cellSelection="none"`, '',
    ColumnDefinitions.selectionWithScrollsColumns)}`,
})
export class CellSelectionNoneComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="300px"  width="600px" [primaryKey]="'ID'" cellSelection="single"`, '',
    ColumnDefinitions.selectionWithScrollsColumns)}`,
})
export class CellSelectionSingleComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
}
@Component({
    template: `${GridTemplateStrings.declareGrid(`height="300px"  width="600px" [primaryKey]="'ID'"`, '',
    ColumnDefinitions.selectionWithScrollsColumns)}`,
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }]
})
export class SelectionWithTransactionsComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
}

export class CustomFilter extends IgxFilteringOperand {
    private constructor () {
        super();
        this.operations = [{
            name: 'custom',
            isUnary: false,
            logic: (target: string): boolean => {
                return target === 'custom';
            },
            iconName: 'custom'
        }];
    }
}
@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]='true'>
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Anogther Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public data = SampleTestData.excelFilteringData();
    public activateFiltering(activate: boolean) {
        this.grid.allowFiltering = activate;
        this.grid.cdr.markForCheck();
    }
}

export class CustomFilterStrategy extends FilteringStrategy {
    public constructor() { super(); }

    public findMatchByExpression(rec: object, expr): boolean {
        const cond = expr.condition;
        const val = this.getFieldValue(rec, expr.fieldName);
        const ignoreCase = expr.fieldName === 'JobTitle' ? false : true;
        return cond.logic(val, expr.searchVal, ignoreCase);
    }
/*     public matchRecord(rec: object, expressions): boolean {
        return super.matchRecord(rec, expressions);
    }

    public filter<T>(data: T[], expressionsTree: IFilteringExpressionsTree): T[]  {
        filter last name that is longer than 5 symbols
        return super.filter(data, expressionsTree);
    } */

    public getFieldValue(rec: object, fieldName: string): any {
        return fieldName === 'Name' ?  rec[fieldName]['FirstName'] :  rec[fieldName];
    }
 }

@Component({
    template: `<igx-grid [data]="data" height="500px" width="600px" [allowFiltering]='true'>
        <igx-column [field]="'ID'" [header]="'ID'" [filterable]="false"></igx-column>
        <igx-column width="100px" [field]="'Name'" [filterable]="filterable">
            <ng-template igxCell let-val>
                <span>{{val.FirstName}}</span>
            </ng-template>
        </igx-column>
        <igx-column [field]="'JobTitle'" [filterable]="filterable" ></igx-column>
        <igx-column [field]="'Company'" [filterable]="filterable" ></igx-column>
    </igx-grid>`
})
export class CustomFilteringStrategyComponent extends BasicGridComponent {
    public strategy = new CustomFilterStrategy();
    public filterable = true;

    public data = SampleTestData.personNameObjectJobCompany();
}



@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]='true'
                         [filterMode]="'excelStyleFilter'" [uniqueColumnValuesStrategy]="columnValuesStrategy">
        <igx-column width="100px" [field]="'ID'"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" dataType="date">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringESFLoadOnDemandComponent extends BasicGridComponent {
    private _filteringStrategy = new FilteringStrategy();
    public data = SampleTestData.excelFilteringData();

    public columnValuesStrategy = (column: IgxColumnComponent,
                                   columnExprTree: IFilteringExpressionsTree,
                                   done: (uniqueValues: any[]) => void) => {
        setTimeout(() => {
            const filteredData = this._filteringStrategy.filter(this.data, columnExprTree);
            const columnValues = filteredData.map(record => record[column.field]);
            done(columnValues);
        }, 1000);
    }
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]='true' [filterMode]="'excelStyleFilter'">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable" [sortable]="'true'" [movable]="'true'"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"
            [sortable]="'true'" [movable]="'true'"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"
            [sortable]="'true'" [movable]="'true'"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"
            [sortable]="'true'" [movable]="'true'"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date" [sortable]="'true'" [movable]="'true'">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter" [sortable]="'true'" [movable]="'true'">
        </igx-column>
        <ng-template igxExcelStyleSorting><div class="esf-custom-sorting">Sorting Template</div></ng-template>
        <ng-template igxExcelStyleHiding><div class="esf-custom-hiding">Hiding Template</div></ng-template>
        <ng-template igxExcelStyleMoving><div class="esf-custom-moving">Moving Template</div></ng-template>
        <ng-template igxExcelStylePinning><div class="esf-custom-pinning">Pinning Template</div></ng-template>
    </igx-grid>`
})
export class IgxGridFilteringESFTemplatesComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;
    public data = SampleTestData.excelFilteringData();
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]='true'>
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"
                    [filterCellTemplate]="filterTemplate"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"
                    [filterCellTemplate]="filterTemplate"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"
                    [filterCellTemplate]="filterTemplate"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
                    [filterable]="filterable" [resizable]="resizable" dataType="date" [filterCellTemplate]="filterTemplate">
        </igx-column>
    </igx-grid>
    <ng-template #filterTemplate igxFilterCellTemplate let-column="column">
        <div class="custom-filter" style="flex-grow: 1;">
            <igx-input-group class="filter-input" type="box">
                <igx-prefix>
                    <igx-icon>search</igx-icon>
                </igx-prefix>
                <input #input igxInput tabindex="0" placeholder="Filter..." />
                <igx-suffix tabindex="0">
                    <igx-icon>clear</igx-icon>
                </igx-suffix>
            </igx-input-group>
        </div>
    </ng-template>
    `
})
export class IgxGridFilteringTemplateComponent extends BasicGridComponent {
    public resizable = false;
    public filterable = true;

    public data = SampleTestData.excelFilteringData();
}

@Component({
    template: `<igx-grid [data]="data" height="500px" width="500px" [allowFiltering]="true">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" dataType="number" [filterable]="false"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            dataType="date">
        </igx-column>
        <igx-column [field]="'AnotherField'" [header]="'Another Field'"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringScrollComponent extends IgxGridFilteringComponent { }

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true">
    <igx-column-group header="General Information" field='General'>
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column-group header="Details" field='Details'>
            <igx-column [field]="'Downloads'" dataType="number" [filterable]="false"></igx-column>
            <igx-column [field]="'Released'" dataType="boolean"></igx-column>
            <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
                dataType="date">
            </igx-column>
        </igx-column-group>
    </igx-column-group>
        <igx-column [field]="'AnotherField'" [header]="'Another Field'"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringMCHComponent extends IgxGridFilteringComponent {}

@Component({
    template:
    `
    <igx-grid #grid1 [data]="data" height="500px" width="500px" [allowFiltering]="true">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" dataType="number" [filterable]="false"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            dataType="date">
        </igx-column>
        <igx-column [field]="'AnotherField'" [header]="'Another Field'"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>
    <igx-excel-style-date-expression *ngIf="grid1.columns.length > 0"
                                     [column]="grid1.columns[4]"
                                     [grid]="grid1"
                                     [expressionUI]="exprUI"
                                     [expressionsList]="exprList">
    </igx-excel-style-date-expression>`
})
export class IgxTestExcelFilteringDatePickerComponent extends IgxGridFilteringComponent implements AfterViewInit {
    exprUI: ExpressionUI;
    exprList: Array<ExpressionUI>;

    constructor(private cd: ChangeDetectorRef) {
        super();

        this.exprUI = new ExpressionUI();
        this.exprUI.expression = {
            fieldName: 'ReleaseDate',
            condition: {
                name: 'equals',
                isUnary: false,
                iconName: 'equals',
                logic: (target: Date, searchVal: Date) => {
                    return true;
                }
            },
        };

        this.exprList = [ this.exprUI ];
    }

    ngAfterViewInit() {
        this.cd.detectChanges();
    }
}

@Component({
    template: `
    <igx-grid [data]="data" height="500px" width="500px">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [editable]="true" [header]="'ProductNameHeader'"
            [formatter]="formatter"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [editable]="true" dataType="number" [header]="'Downloads'"></igx-column>
        <igx-column width="100px" [field]="'Released'" [editable]="true" dataType="boolean" [header]="'Released'"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" dataType="date"></igx-column>
    </igx-grid>`
})
export class IgxGridClipboardComponent extends BasicGridComponent {
    public data = SampleTestData.excelFilteringData();
    formatter = (value: any) => `** ${value} **`;
}

@Component({
    template: GridTemplateStrings.declareGrid(` [height]="height" [width]="width"`, ``,
                ColumnDefinitions.generatedWithDataType)
})
export class DynamicColumnsComponent extends GridWithSizeComponent {
    public columns = [
        { field: 'ID', width: 100 , dataType: 'number'},
        { field: 'CompanyName', width: 300 , dataType: 'string'},
        { field: 'ContactName', width: 200 , dataType: 'string'},
        { field: 'ContactTitle', width: 200 , dataType: 'string'},
        { field: 'Address', width: 300 , dataType: 'string'},
        { field: 'City', width: 100 , dataType: 'string'},
        { field: 'Region', width: 100 , dataType: 'string'}
    ];

    data = SampleTestData.contactInfoDataFull();
    width = '800px';
    height = '800px';
}

@Component({
    template: `
    <igx-grid #gridCustomSelectors [primaryKey]="'ID'" [data]="data" [paging]="true" [rowSelection]="'multiple'" [autoGenerate]="false">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column width="100px" [field]="'CompanyName'"></igx-column>
        <igx-column width="100px" [field]="'ContactName'" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'ContactTitle'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Address'" dataType="string"></igx-column>
        <ng-template igxRowSelector let-rowContext>
            <span class="rowNumber">{{ rowContext.index }}</span>
            <igx-checkbox [checked]="rowContext.selected" (click)="onRowCheckboxClick($event, rowContext)"></igx-checkbox>
        </ng-template>
        <ng-template igxHeadSelector let-headContext>
            <igx-checkbox [checked]="headContext.totalCount === headContext.selectedCount"
                (click)="onHeaderCheckboxClick($event, headContext)"></igx-checkbox>
        </ng-template>
    </igx-grid>`
})
export class GridCustomSelectorsComponent extends BasicGridComponent implements OnInit {
    @ViewChild('gridCustomSelectors', { static: true })
    public grid: IgxGridComponent;
    public ngOnInit(): void {
        this.data = SampleTestData.contactInfoDataFull();
    }

    public onRowCheckboxClick(event, rowContext) {
        event.stopPropagation();
        event.preventDefault();
        rowContext.selected ? this.grid.deselectRows([rowContext.rowID]) : this.grid.selectRows([rowContext.rowID]);
    }

    public onHeaderCheckboxClick(event, headContext) {
        event.stopPropagation();
        event.preventDefault();
        headContext.selected ? this.grid.deselectAllRows() : this.grid.selectAllRows();
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'"
    width="900px" height="600px" [rowEditable]="true" >
        <igx-column field="ProductID" header="Product ID" [editable]="false" width="200px"></igx-column>
        <igx-column field="ReorderLevel" header="Reorder Lever" [dataType]="'number'" editable="true" width="100px">
        </igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" editable="true" [sortable]="true" width="200px">
        </igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" editable="true" width="200px"></igx-column>
    </igx-grid>`
})
export class IgxGridRowEditingComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductData();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="700px" height="400px" [rowEditable]="true">
        <igx-column>
            <ng-template igxCell let-cell="cell" let-val>
                <button>Delete</button>
            </ng-template>
        </igx-column>
        <igx-column field="ProductID" header="Product ID"></igx-column>
        <igx-column field="ReorderLevel" header="Reorder Lever" [dataType]="'number'" [editable]="true" width="100px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="150px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" width="150px" [editable]="false"></igx-column>
    </igx-grid>`
})
export class IgxGridRowEditingWithoutEditableColumnsComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductData();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ID'" width="700px" height="400px" [rowEditable]="true">
        <igx-column
        field="Downloads" header="Downloads" [dataType]="'number'" [pinned]="pinnedFlag" [editable]="true">
        </igx-column>
        <igx-column field="ID" header="ID" [dataType]="'number'"
        [editable]="false" [pinned]="pinnedFlag" [hidden]="hiddenFlag" width="60px">
        </igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" [editable]="false" [hidden]="hiddenFlag" width="150px">
        </igx-column>
        <igx-column field="ReleaseDate" header="Release Date" [dataType]="'date'" [editable]="true" [hidden]="hiddenFlag" width="150px">
        </igx-column>
        <igx-column-group [movable]="true" header="Column Group 1" *ngIf="columnGroupingFlag">
            <igx-column field="Released" header="Released" [dataType]="'boolean'" [pinned]="pinnedFlag" [editable]="true" width="100px">
            </igx-column>
            <igx-column field="Category" header="Category" [dataType]="'string'" [editable]="false" [hidden]="hiddenFlag" width="150px">
            </igx-column>
        </igx-column-group>
        <ng-container *ngIf="!columnGroupingFlag">
            <igx-column field="Released" header="Released" [dataType]="'boolean'" [pinned]="pinnedFlag" [editable]="true" width="100px">
            </igx-column>
            <igx-column field="Category" header="Category" [dataType]="'string'" [editable]="true" [hidden]="hiddenFlag" width="150px">
            </igx-column>
        </ng-container>
        <igx-column field="Items" header="Items" [dataType]="'string'" [editable]="true" width="150px">
        </igx-column>
        <igx-column field="Test" header="Test" [dataType]="'string'" [editable]="true" [hidden]="hiddenFlag" width="150px">
        </igx-column>
    </igx-grid>`
})
export class IgxGridWithEditingAndFeaturesComponent extends BasicGridComponent {
    /* Data fields: Downloads:number, ID: number, ProductName: string, ReleaseDate: Date,
                Released: boolean, Category: string, Items: string, Test: string. */
    public pinnedFlag = false;
    public hiddenFlag = false;
    public columnGroupingFlag = false;
    public data = SampleTestData.generateProductData(11);
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="700px" height="400px" [rowEditable]="true">
        <igx-column field="ProductID" header="Product ID"></igx-column>
        <igx-column field="ReorderLevel" header="Reorder Lever" [dataType]="'number'" [editable]="true" width="100px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="150px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" width="150px" [editable]="false"></igx-column>
        <ng-template igxRowEdit let-rowChangesCount="rowChangesCount" let-endEdit="endEdit">
            <div class="igx-banner__message">
                <span class="igx-banner__text">{{ rowChangesCount }} </span>
            </div>
            <div class="igx-banner__actions">
                <div class="igx-banner__row">
                    <button igxButton igxRowEditTabStop (click)="endEdit(false)">Cancel</button>
                    <button igxButton igxRowEditTabStop (click)="endEdit(true)">Done</button>
                </div>
            </div>
        </ng-template>
    </igx-grid>
    `
})
export class IgxGridCustomOverlayComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductData();
    @ViewChildren(IgxRowEditTabStopDirective) public buttons: QueryList<IgxRowEditTabStopDirective>;

    public get gridAPI() {
        return (<any>this.grid).gridAPI;
    }

    public get cellInEditMode() {
        return this.gridAPI.get_cell_inEditMode();
    }

    public getCurrentEditCell(): IgxGridCellComponent {
        const grid = this.grid as any;
        const currentCell = grid.gridAPI.get_cell_inEditMode();
        return this.grid.getCellByColumn(currentCell.id.rowIndex, currentCell.column.field);
    }

    public moveNext(shiftKey: boolean): void {
        this.getCurrentEditCell().dispatchEvent(new KeyboardEvent('keydown', {
            key: 'tab',
            code: 'tab',
            shiftKey
        }));
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="900px" height="900px" [rowEditable]="true"
    [paging]="paging" [perPage]="7">
        <igx-column field="ProductID" header="Product ID" width="150px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="200px"></igx-column>
        <igx-column field="InStock" header="In Stock" [dataType]="'boolean'" width="100px"></igx-column>
        <igx-column field="UnitsInStock" header="Units in Stock" [dataType]="'number'" width="150px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" width="200px"></igx-column>
    </igx-grid>`,
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }],
})
export class IgxGridRowEditingTransactionComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductData();
    public paging = false;
}

@Component({
    template: `
        <igx-grid
            [width]='width'
            [height]='height'
            [data]="data"
            [autoGenerate]="true" (onColumnInit)="columnsCreated($event)" (onGroupingDone)="onGroupingDoneHandler($event)"
            [rowEditable]="enableRowEditing">
        </igx-grid>
        <ng-template #dropArea>
            <span> Custom template </span>
        </ng-template>
    `
})
export class IgxGridRowEditingWithFeaturesComponent extends DataParent {
    public width = '800px';
    public height = null;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    @ViewChild('dropArea', { read: TemplateRef, static: true })
    public dropAreaTemplate: TemplateRef<any>;

    public enableSorting = false;
    public enableFiltering = false;
    public enableResizing = false;
    public enableEditing = true;
    public enableGrouping = true;
    public enableRowEditing = true;
    public currentSortExpressions;

    public columnsCreated(column: IgxColumnComponent) {
        column.sortable = this.enableSorting;
        column.filterable = this.enableFiltering;
        column.resizable = this.enableResizing;
        column.editable = this.enableEditing;
        column.groupable = this.enableGrouping;
    }
    public onGroupingDoneHandler(sortExpr) {
        this.currentSortExpressions = sortExpr;
    }
}

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column [editable]="true" field="fullName"></igx-column>
            <igx-column field="age" [editable]="true" [dataType]="'number'"></igx-column>
            <igx-column field="isActive" [editable]="true" [dataType]="'boolean'"></igx-column>
            <igx-column field="birthday" [editable]="true" [dataType]="'date'"></igx-column>
            <igx-column [editable]="true" field="personNumber" [dataType]="'number'"></igx-column>
        </igx-grid>
    `
})
export class CellEditingTestComponent extends BasicGridComponent {
    public data = [
        { personNumber: 0, fullName: 'John Brown', age: 20, isActive: true, birthday: new Date('08/08/2001') },
        { personNumber: 1, fullName: 'Ben Affleck', age: 30, isActive: false, birthday: new Date('08/08/1991') },
        { personNumber: 2, fullName: 'Tom Riddle', age: 50, isActive: true, birthday: new Date('08/08/1961') }
    ];
}

@Component({
    template: `
        <igx-grid [data]="data" width="300px" height="250px">
            <igx-column [editable]="true" field="firstName"></igx-column>
            <igx-column [editable]="true" field="lastName"></igx-column>
            <igx-column field="age" [editable]="true" [dataType]="'number'"></igx-column>
            <igx-column field="isActive" [editable]="true" [dataType]="'boolean'"></igx-column>
            <igx-column field="birthday" [editable]="true" [dataType]="'date'"></igx-column>
            <igx-column field="fullName" [editable]="true"></igx-column>
        </igx-grid>
        <button class="btnTest">Test</button>
    `
})
export class CellEditingScrollTestComponent extends BasicGridComponent {
    public data = [
        { firstName: 'John', lastName: 'Brown', age: 20, isActive: true, birthday: new Date('08/08/2001'), fullName: 'John Brown' },
        { firstName: 'Ben', lastName: 'Hudson', age: 30, isActive: false, birthday: new Date('08/08/1991'), fullName: 'Ben Hudson' },
        { firstName: 'Tom', lastName: 'Riddle', age: 50, isActive: true, birthday: new Date('08/08/1967'), fullName: 'Tom Riddle' },
        { firstName: 'John', lastName: 'David', age: 27, isActive: true, birthday: new Date('08/08/1990'), fullName: 'John David' },
        { firstName: 'David', lastName: 'Affleck', age: 36, isActive: false, birthday: new Date('08/08/1982'), fullName: 'David Affleck' },
        { firstName: 'Jimmy', lastName: 'Johnson', age: 57, isActive: true, birthday: new Date('08/08/1961'), fullName: 'Jimmy Johnson' },
        { firstName: 'Martin', lastName: 'Brown', age: 31, isActive: true, birthday: new Date('08/08/1987'), fullName: 'Martin Brown' },
        { firstName: 'Tomas', lastName: 'Smith', age: 81, isActive: false, birthday: new Date('08/08/1931'), fullName: 'Tomas Smith' },
        { firstName: 'Michael', lastName: 'Parker', age: 48, isActive: true, birthday: new Date('08/08/1970'), fullName: 'Michael Parker' }
    ];
}
