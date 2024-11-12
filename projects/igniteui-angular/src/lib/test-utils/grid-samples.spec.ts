import { Component, TemplateRef, ViewChild, Input, AfterViewInit, QueryList, ViewChildren, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

import { IgxDateSummaryOperand, IgxNumberSummaryOperand, IgxSummaryResult } from '../grids/summaries/grid-summary';
import { IGridCellEventArgs } from '../grids/common/events';
import {
    BasicGridComponent, BasicGridSearchComponent, GridAutoGenerateComponent,
    GridWithSizeComponent, PagingComponent
} from './grid-base-components.spec';
import { IGridSelection } from './grid-interfaces.spec';
import { SampleTestData, DataParent } from './sample-test-data.spec';
import { ColumnDefinitions, GridTemplateStrings, EventSubscriptions, TemplateDefinitions, ExternalTemplateDefinitions } from './template-strings.spec';
import { IgxColumnComponent } from '../grids/columns/column.component';
import { IgxFilteringOperand, IgxNumberFilteringOperand } from '../data-operations/filtering-condition';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { FilteringStrategy, IgxFilterItem } from '../data-operations/filtering-strategy';
import { ISortingOptions, IgxExcelStyleHeaderIconDirective, IgxGridToolbarAdvancedFilteringComponent, IgxSortAscendingHeaderIconDirective, IgxSortDescendingHeaderIconDirective, IgxSortHeaderIconDirective } from '../grids/public_api';
import { IgxRowAddTextDirective, IgxRowEditActionsDirective, IgxRowEditTabStopDirective, IgxRowEditTemplateDirective, IgxRowEditTextDirective } from '../grids/grid.rowEdit.directive';
import { IgxExcelStyleColumnOperationsTemplateDirective, IgxExcelStyleFilterOperationsTemplateDirective, IgxGridExcelStyleFilteringComponent } from '../grids/filtering/excel-style/excel-style-filtering.component';
import { FilteringLogic } from '../data-operations/filtering-expression.interface';
import { FormattedValuesSortingStrategy, ISortingStrategy, SortingDirection } from '../data-operations/sorting-strategy';
import { IgxActionStripComponent } from '../action-strip/action-strip.component';
import { IDataCloneStrategy } from '../data-operations/data-clone-strategy';
import { IgxColumnLayoutComponent } from '../grids/columns/column-layout.component';
import { IgxPaginatorComponent } from '../paginator/paginator.component';
import { IgxColumnGroupComponent } from '../grids/columns/column-group.component';
import { IgxIconComponent } from '../icon/icon.component';
import { IgxExcelStyleMovingComponent } from '../grids/filtering/excel-style/excel-style-moving.component';
import { IgxExcelStylePinningComponent } from '../grids/filtering/excel-style/excel-style-pinning.component';
import { IgxExcelStyleSearchComponent } from '../grids/filtering/excel-style/excel-style-search.component';
import { IgxExcelStyleSelectingComponent } from '../grids/filtering/excel-style/excel-style-selecting.component';
import { IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxInputDirective, IgxPrefixDirective, IgxSuffixDirective } from '../input-group/public_api';
import { IgxGridToolbarComponent } from '../grids/toolbar/grid-toolbar.component';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { IgxGridToolbarActionsComponent } from '../grids/toolbar/common';
import { IgxGridToolbarHidingComponent } from '../grids/toolbar/grid-toolbar-hiding.component';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxGridEditingActionsComponent } from '../action-strip/grid-actions/grid-editing-actions.component';
import { IgxCellEditorTemplateDirective, IgxCellHeaderTemplateDirective, IgxCellTemplateDirective, IgxCollapsibleIndicatorTemplateDirective, IgxFilterCellTemplateDirective } from '../grids/columns/templates.directive';
import { IgxGroupByRowSelectorDirective, IgxHeadSelectorDirective, IgxRowSelectorDirective } from '../grids/selection/row-selectors';
import { CellType, ColumnType, IgxAdvancedFilteringDialogComponent } from '../grids/public_api';
import { IgxGridComponent } from '../grids/grid/public_api';
import { OverlaySettings } from '../services/public_api';
import { IgxFocusDirective } from '../directives/focus/focus.directive';

@Component({
    template: GridTemplateStrings.declareGrid('', '', `<igx-column field="ID" [hidden]="true"></igx-column>`),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class ColumnHiddenFromMarkupComponent extends BasicGridComponent {
    public override data = SampleTestData.personIDNameData();
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data" [width]="'900px'" [height]="'600px'" [moving]="true">
            <igx-column *ngFor="let c of columns" [field]="c.field"
                [header]="c.field"
                [width]="c.width"
                [editable]="true"
                [pinned]="c.pinned"
                [dataType]="c.type">
            </igx-column>
        </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, NgFor]
})
export class GridAddColumnComponent extends BasicGridComponent implements OnInit {
    public columns: Array<any>;
    public override data = SampleTestData.contactInfoDataFull();
    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', width: 150, type: 'string', pinned: true },
            { field: 'CompanyName', width: 150, type: 'string' },
            { field: 'ContactName', width: 150, type: 'string' },
            { field: 'ContactTitle', width: 150, type: 'string' },
            { field: 'Address', width: 150, type: 'string' }];
    }
}

@Component({
    template: GridTemplateStrings.declareGrid('', '', ColumnDefinitions.idNameFormatter),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class ColumnCellFormatterComponent extends BasicGridComponent {
    public override data = SampleTestData.personIDNameData();

    public multiplier(value: number): string {
        return `${value * value}`;
    }

    public containsY(_: number, data: { ID: number; Name: string }) {
        return data.Name.includes('y') ? 'true' : 'false';
    }

    public boolFormatter(value: boolean): string {
        return value ? 'check' : 'close';
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` height="500px"`, '', ColumnDefinitions.productFilterable),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class FilteringComponent extends BasicGridComponent {
    public override data = SampleTestData.productInfoData();
}

@Component({
    template: GridTemplateStrings.declareGrid(` [width]="width" [height]="height" [rowSelection]="'multiple'" [primaryKey]="'ProductID'" [selectedRows]="selectedRows"`, '', ColumnDefinitions.productBasicNumberID, '', '<igx-paginator *ngIf="paging"></igx-paginator>'),
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent, NgIf]
})
export class RowSelectionComponent extends BasicGridComponent {
    public override data = SampleTestData.foodProductDataExtended();
    public width = '800px';
    public height = '600px';
    public selectedRows = [];
    public paging = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(` [width]="width" [height]="height" [rowSelection]="'single'" [primaryKey]="'ProductID'"`, '', ColumnDefinitions.productBasicNumberID),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class SingleRowSelectionComponent extends BasicGridComponent {
    public override data = SampleTestData.foodProductDataExtended();
    public width = '800px';
    public height = '600px';
}

@Component({
    template: GridTemplateStrings.declareGrid(` [width]="width" [height]="height" [rowSelection]="'multiple'"`, '', ColumnDefinitions.idFirstLastNameSortable),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class RowSelectionWithoutPrimaryKeyComponent extends BasicGridComponent {
    public override data = SampleTestData.personIDNameRegionData();
    public width = '800px';
    public height = '600px';
}

@Component({
    template: GridTemplateStrings.declareGrid(` [primaryKey]="'ID'"
          [width]="'900px'"
          [height]="'900px'"
          [columnWidth]="'200px'"`, '', ColumnDefinitions.idNameJobTitleCompany),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class NoScrollsComponent extends GridWithSizeComponent {
    public override data = SampleTestData.personIDNameJobCompany();
}

class DealsSummaryMinMax extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public override operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'min' || obj.key === 'max') {
                return obj;
            }
        });
        return result;
    }
}
@Component({
    template: GridTemplateStrings.declareGrid(`  [primaryKey]="'ProductID'" [height]="null" [allowFiltering]="true"`, '', ColumnDefinitions.productDefaultSummaries),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class SummaryColumnComponent extends BasicGridComponent {
    public override data = SampleTestData.foodProductData();
    public hasSummary = true;

    public numberSummary = new IgxNumberSummaryOperand();
    public dateSummary = new IgxDateSummaryOperand();
    public dealsSummaryMinMax = DealsSummaryMinMax;
}

@Component({
    template: GridTemplateStrings.declareGrid('', '', ColumnDefinitions.productBasic, '', '<igx-paginator *ngIf="paging"></igx-paginator>'),
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent, NgIf]
})
export class ProductsComponent extends BasicGridComponent {
    public override data = SampleTestData.foodProductData();

    public paging = false;

    @ViewChild(IgxPaginatorComponent)
    public paginator: IgxPaginatorComponent;
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.idFirstLastNameSortable),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class GridDeclaredColumnsComponent extends BasicGridComponent {
    @ViewChild('nameColumn', { static: true }) public nameColumn;

    public override data = SampleTestData.personIDNameRegionData();
}

@Component({
    template: GridTemplateStrings.declareGrid(` [autoGenerate]="autoGenerate" [height]="height" [width]="width"`, `${EventSubscriptions.columnInit}${EventSubscriptions.selected}`, ''),
    imports: [IgxGridComponent]
})
export class PinOnInitAndSelectionComponent extends GridWithSizeComponent {
    public override data = SampleTestData.contactInfoDataFull();
    public override width = '800px';
    public override height = '300px';

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
    template: `
        <igx-grid
            [width]='"800px"'
            [height]='"500px"'
            [data]="data"
            [autoGenerate]="false">
            <igx-column-layout *ngFor='let group of colGroups' [pinned]='group.pinned'>
                <igx-column *ngFor='let col of group.columns'
                [rowStart]="col.rowStart" [colStart]="col.colStart"
                [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field'></igx-column>
            </igx-column-layout>
        </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnLayoutComponent, IgxColumnComponent, NgFor]
})
export class GridPinningMRLComponent extends PinOnInitAndSelectionComponent {
    public colGroups = [
        {
            field: 'group1',
            group: 'group1',
            pinned: true,
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1 },
                { field: 'CompanyName', rowStart: 1, colStart: 2 },
                { field: 'ContactName', rowStart: 1, colStart: 3 },
                { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 4, colEnd: 4 },
            ]
        },
        {
            field: 'group2',
            group: 'group2',
            columns: [
                { field: 'Country', rowStart: 1, colStart: 1, colEnd: 4, rowEnd: 3 },
                { field: 'Region', rowStart: 3, colStart: 1 },
                { field: 'PostalCode', rowStart: 3, colStart: 2 },
                { field: 'Fax', rowStart: 3, colStart: 3 }
            ]
        }
    ];
}

@Component({
    template: GridTemplateStrings.declareGrid(` [height]="height" [width]="width"`, `${EventSubscriptions.selected}${EventSubscriptions.columnPin}`, ColumnDefinitions.generatedWithWidth),
    imports: [IgxGridComponent, IgxColumnComponent, NgFor]
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

    public override data = SampleTestData.contactMariaAndersData();
    public override width = '800px';
    public override height = '300px';

    public selectedCell: CellType;
    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }

    public columnPinning($event) {
        $event.insertAtIndex = 0;
    }
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.productFilterSortPin),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class GridFeaturesComponent extends BasicGridComponent {
    public override data = SampleTestData.productInfoData();

}

@Component({
    template: GridTemplateStrings.declareGrid(` columnWidth="200" `, '', ColumnDefinitions.idNameJobHireDate, '', '<igx-paginator *ngIf="paging"></igx-paginator>'),
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent, NgIf]
})
export class ScrollableGridSearchComponent extends BasicGridSearchComponent {
    public override data = SampleTestData.generateFromData(SampleTestData.personJobDataFull(), 30);
    public override paging = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(` columnWidth="200" [height]="null" `, '', ColumnDefinitions.idNameJobTitleCompany, '', '<igx-paginator *ngIf="paging"></igx-paginator>'),
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent, NgIf]
})
export class GroupableGridSearchComponent extends ScrollableGridSearchComponent {
    public override data = SampleTestData.personIDNameJobCompany();
    public override paging = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(` [height]="height" [width]="width" [columnWidth]="columnWidth" `, '', ColumnDefinitions.productAllColumnFeatures),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class GridAllFeaturesComponent extends GridWithSizeComponent {
    @Input()
    public columnWidth = 200;

}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.nameJobTitleId),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class ReorderedColumnsComponent extends BasicGridComponent {
    public override data = SampleTestData.personJobData();
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.simpleDatePercentColumns),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class GridUserMeetingDataComponent extends BasicGridComponent {
    public override data = SampleTestData.personMeetingData();
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.idNameJobTitleEditable),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class GridIDNameJobTitleComponent extends PagingComponent {
    public override data = SampleTestData.personJobDataFull();
    public override width = '100%';
    public override height = '100%';
    public formatter = (value: any, rowData: any) => {
        return `${value} - ${rowData.JobTitle}`;
    };
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.idNameJobHoursHireDatePerformance),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class GridIDNameJobTitleHireDataPerformanceComponent extends BasicGridComponent {
    public override data = SampleTestData.personJobHoursDataPerformance();
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.hireDate),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class GridHireDateComponent extends BasicGridComponent {
    public override data = SampleTestData.hireDate();
}

@Component({
    template: `<div style="margin: 50px;">
            ${GridTemplateStrings.declareGrid('[height]="height" [moving]="true" [width]="width" [rowSelection]="rowSelection" [autoGenerate]="autoGenerate"', EventSubscriptions.columnMovingStart + EventSubscriptions.columnMoving + EventSubscriptions.columnMovingEnd, ColumnDefinitions.movableColumns)}</div>`,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class MovableColumnsComponent extends BasicGridComponent {
    public override data = SampleTestData.personIDNameRegionData();
    public autoGenerate = false;
    public rowSelection = 'none';
    public isFilterable = false;
    public isSortable = false;
    public isResizable = false;
    public isEditable = false;
    public isHidden = false;
    public isGroupable = false;
    public width = '500px';
    public height = '300px';
    public count = 0;
    public countStart = 0;
    public countEnd = 0;
    public cancel = false;
    public source: IgxColumnComponent;
    public target: IgxColumnComponent;

    public columnMovingStarted(event) {
        this.countStart++;
        this.source = event.source;
    }

    public columnMoving(event) {
        this.count++;
        this.source = event.source;

        if (this.cancel) {
            event.cancel = true;
        }
    }

    public columnMovingEnded(event) {
        this.countEnd++;
        this.source = event.source;
        this.target = event.target;

        if (event.target.field === 'Region') {
            event.cancel = true;
        }
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(`[moving]="true" height="300px" width="500px"`, '', ColumnDefinitions.movableColumns),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class MovableTemplatedColumnsComponent extends BasicGridComponent {
    public override data = SampleTestData.personIDNameRegionData();
    public isFilterable = false;
    public isSortable = false;
    public isResizable = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(`height="300px" width="500px" [moving]="true" [autoGenerate]="autoGenerate"`, EventSubscriptions.columnInit, '', '', '<igx-paginator *ngIf="paging"></igx-paginator>'),
    imports: [IgxGridComponent, IgxPaginatorComponent, NgIf]
})
export class MovableColumnsLargeComponent extends GridAutoGenerateComponent {

    public override data = SampleTestData.contactInfoDataFull();

    public width = '500px';
    public height = '400px';

    public columnInit(column: IgxColumnComponent) {
        column.sortable = true;
        column.width = '100px';
    }

    public pinColumn(name: string) {
        const col = this.grid.getColumnByName(name);
        col.pinned = !col.pinned;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(`height="800px"`, '', ColumnDefinitions.multiColHeadersColumns),
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent, IgxCellTemplateDirective, IgxCellHeaderTemplateDirective]
})
export class MultiColumnHeadersComponent extends BasicGridComponent {
    public override data = SampleTestData.contactInfoDataFull();
    public isPinned = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(`[moving]="true" height="800px" width="500px"`, '', ColumnDefinitions.multiColHeadersWithGroupingColumns),
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent]
})
export class MultiColumnHeadersWithGroupingComponent extends BasicGridComponent {
    public override data = SampleTestData.contactInfoDataFull();
    public isPinned = false;
}


@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.nameAvatar),
    imports: [IgxGridComponent, IgxColumnComponent, IgxCellTemplateDirective]
})
export class GridWithAvatarComponent extends GridWithSizeComponent {
    public override data = SampleTestData.personAvatarData();
    public override height = '500px';
}


@Component({
    template: GridTemplateStrings.declareGrid(`height="1000px"  width="900px" primaryKey="ID"`, '', ColumnDefinitions.summariesGroupByColumns, '', '<igx-paginator *ngIf="paging"></igx-paginator>'),
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent, NgIf]
})
export class SummariesGroupByComponent extends BasicGridComponent {
    public override data = SampleTestData.employeeGroupByData();
    public calculationMode = 'rootAndChildLevels';
    public ageSummary = AgeSummary;
    public ageSummaryTest = AgeSummaryTest;
    public paging = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(`height="600px"  width="900px" [batchEditing]="true" primaryKey="ID"`, '', ColumnDefinitions.summariesGroupByTansColumns),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class SummariesGroupByTransactionsComponent extends BasicGridComponent {
    public override data = SampleTestData.employeeGroupByData();
    public calculationMode = 'rootAndChildLevels';
    public ageSummary = AgeSummary;
    public ageSummaryMinMax = DealsSummaryMinMax;
}

class AgeSummary extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public override operate(summaries?: any[]): IgxSummaryResult[] {
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

    public override operate(summaries?: any[]): IgxSummaryResult[] {
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
    template: GridTemplateStrings.declareGrid(`[height]="gridHeight" [columnWidth]="defaultWidth" [width]="gridWidth"`, `${EventSubscriptions.selected}`, ColumnDefinitions.generatedWithWidth),
    imports: [IgxGridComponent, IgxColumnComponent, NgFor]
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
    public selectedCell: CellType;
    constructor() {
        super();
        this.data = this.generateData(1000);
    }
    public generateCols(numCols: number, defaultColWidth = null) {
        const cols = [];
        for (let j = 0; j < numCols; j++) {
            cols.push({
                field: j.toString(),
                width: defaultColWidth || (j % 8 < 2 ? 100 : (j % 6) * 125)
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
        this.grid.verticalScrollContainer.getScroll().scrollTop = newTop;
    }
    public scrollLeft(newLeft: number) {
        this.grid.headerContainer.getScroll().scrollLeft = newLeft;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` [primaryKey]="'ID'"`, '', ColumnDefinitions.idNameJobHireWithTypes),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class GridWithPrimaryKeyComponent extends BasicGridSearchComponent {
    public override data = SampleTestData.personJobDataFull();
}

@Component({
    template: GridTemplateStrings.declareGrid(`height="300px"  width="600px" primaryKey="ID"`, '', ColumnDefinitions.selectionWithScrollsColumns, '', '<igx-paginator *ngIf="paging"></igx-paginator>'),
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent, NgIf]
})
export class SelectionWithScrollsComponent extends BasicGridComponent {
    public override data = SampleTestData.employeeGroupByData();
    public paging = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(`height="300px"  width="600px" primaryKey="ID" cellSelection="none"`, '', ColumnDefinitions.selectionWithScrollsColumns),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class CellSelectionNoneComponent extends BasicGridComponent {
    public override data = SampleTestData.employeeGroupByData();
}

@Component({
    template: GridTemplateStrings.declareGrid(`height="300px"  width="600px" primaryKey="ID" cellSelection="single"`, '', ColumnDefinitions.selectionWithScrollsColumns),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class CellSelectionSingleComponent extends BasicGridComponent {
    public override data = SampleTestData.employeeGroupByData();
}
@Component({
    template: GridTemplateStrings.declareGrid(`height="300px"  width="600px" [batchEditing]="true" primaryKey="ID"`, '', ColumnDefinitions.selectionWithScrollsColumns),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class SelectionWithTransactionsComponent extends BasicGridComponent {
    public override data = SampleTestData.employeeGroupByData();
}

export class CustomFilter extends IgxFilteringOperand {
    private constructor() {
        super();
        this.operations = [{
            name: 'custom',
            isUnary: false,
            logic: (target: string): boolean => target === 'custom',
            iconName: 'custom'
        }];
    }
}
@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date">
        </igx-column>
        <igx-column width="100px" [field]="'ReleaseDateTime'" [header]="'ReleaseDateTime'" headerClasses="header-release-date-time"
            [filterable]="filterable" [resizable]="resizable" dataType="dateTime">
        </igx-column>
        <igx-column width="100px" [field]="'ReleaseTime'" [header]="'ReleaseTime'" headerClasses="header-release-time"
            [filterable]="filterable" [resizable]="resizable" dataType="time">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class IgxGridFilteringComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public override data = SampleTestData.excelFilteringData();
    public activateFiltering(activate: boolean) {
        this.grid.allowFiltering = activate;
        this.grid.cdr.markForCheck();
    }
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true">
        <igx-column width="100px" [field]="'Number'" [header]="'Number'" [filterable]="true" dataType="number"></igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class IgxGridFilteringNumericComponent extends BasicGridComponent {
    public override data = SampleTestData.numericData();
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter">
        </igx-column>
        <igx-column width="100px" [field]="'ReleaseTime'" [header]="'Release Time'" [filterable]="filterable"
            dataType="dateTime">
        </igx-column>
        <igx-column width="100px" [field]="'Revenue'" [header]="'Revenue'" [filterable]="filterable"
            dataType="currency">
        </igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class IgxGridDatesFilteringComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public override data = SampleTestData.excelFilteringData().map(rec => {
        const newRec = Object.assign({}, rec) as any;
        newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.toISOString() : null;
        return newRec;
    });
    public activateFiltering(activate: boolean) {
        this.grid.allowFiltering = activate;
        this.grid.cdr.markForCheck();
    }
}

@Component({
    template: `
    <igx-grid-excel-style-filtering #esf style="height: 700px; width: 350px">
    </igx-grid-excel-style-filtering>
    <igx-grid #grid1 [data]="data" height="500px">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [sortable]="true"
            [filterable]="filterable" [resizable]="resizable" dataType="string" [selectable]="false"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable"
            [selectable]="false" [resizable]="resizable" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxGridExcelStyleFilteringComponent]
})
export class IgxGridExternalESFComponent extends BasicGridComponent implements AfterViewInit {
    @ViewChild('esf', { read: IgxGridExcelStyleFilteringComponent, static: true })
    public esf: IgxGridExcelStyleFilteringComponent;

    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public override data = SampleTestData.excelFilteringData();

    constructor() {
        super();
    }

    public ngAfterViewInit(): void {
        this.esf.column = this.grid.getColumnByName('ProductName');
    }
}

export class CustomFilterStrategy extends FilteringStrategy {
    constructor() {
        super();
    }

    public override findMatchByExpression(rec, expr): boolean {
        const cond = expr.condition;
        const val = this.getFieldValue(rec, expr.fieldName);
        const ignoreCase = expr.fieldName === 'JobTitle' ? false : true;
        return cond.logic(val, expr.searchVal, ignoreCase);
    }

    public override filter<T>(data: T[], expressionsTree: IFilteringExpressionsTree): T[] {
        return super.filter(data, expressionsTree, null, null);
    }

    public override getFieldValue(rec, fieldName: string): any {
        return fieldName === 'Name' ? rec[fieldName]['FirstName'] : rec[fieldName];
    }
}

@Component({
    template: `<igx-grid [data]="data" height="500px" width="600px" [allowFiltering]="true">
        <igx-column [field]="'ID'" [header]="'ID'" [filterable]="false"></igx-column>
        <igx-column width="100px" [field]="'Name'" [filterable]="filterable">
            <ng-template igxCell let-val>
                <span>{{val.FirstName}}</span>
            </ng-template>
        </igx-column>
        <igx-column [field]="'JobTitle'" [filterable]="filterable" ></igx-column>
        <igx-column [field]="'Company'" [filterable]="filterable" ></igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class CustomFilteringStrategyComponent extends BasicGridComponent {
    public strategy = new CustomFilterStrategy();
    public filterable = true;

    public override data = SampleTestData.personNameObjectJobCompany();
}


export class LoadOnDemandFilterStrategy extends FilteringStrategy {
    public override getFilterItems(column: ColumnType, tree: IFilteringExpressionsTree): Promise<IgxFilterItem[]> {
        return new Promise(resolve => setTimeout(() =>
            resolve(super.getFilterItems(column, tree)), 1000));
    }
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true"
                         [filterMode]="'excelStyleFilter'" [uniqueColumnValuesStrategy]="columnValuesStrategy">
        <igx-column width="100px" [field]="'ID'"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" dataType="date">
        </igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class IgxGridFilteringESFLoadOnDemandComponent extends BasicGridComponent {
    public override data = SampleTestData.excelFilteringData();
    public doneCallbackCounter = 0;

    private _filteringStrategy = new FilteringStrategy();

    public columnValuesStrategy = (column: IgxColumnComponent,
        columnExprTree: IFilteringExpressionsTree,
        done: (uniqueValues: any[]) => void) => {
        setTimeout(() => {
            const filteredData = this._filteringStrategy.filter(this.data, columnExprTree, null, null);
            const columnValues = filteredData.map(record => record[column.field]);
            done(columnValues);
            this.doneCallbackCounter++;
        }, 1000);
    };
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true" [filterMode]="'excelStyleFilter'" [moving]="true">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable" [sortable]="true"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"
            [sortable]="true"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"
            [sortable]="true"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"
            [sortable]="true"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date" [sortable]="true">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter" [sortable]="true">
        </igx-column>

        <igx-grid-excel-style-filtering [minHeight]="'0px'" [maxHeight]="'500px'">
            <igx-excel-style-column-operations>Column Operations Template</igx-excel-style-column-operations>
            <igx-excel-style-filter-operations>Filter Operations Template</igx-excel-style-filter-operations>
        </igx-grid-excel-style-filtering>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxGridExcelStyleFilteringComponent, IgxExcelStyleColumnOperationsTemplateDirective, IgxExcelStyleFilterOperationsTemplateDirective]
})
export class IgxGridFilteringESFEmptyTemplatesComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;
    public override data = SampleTestData.excelFilteringData();
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true" [filterMode]="'excelStyleFilter'" [moving]="true">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable" [sortable]="true"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"
            [sortable]="true"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"
            [sortable]="true"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"
            [sortable]="true"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date" [sortable]="true">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter" [sortable]="true">
        </igx-column>

        <ng-template igxExcelStyleHeaderIcon>
            <igx-icon>filter_alt</igx-icon>
        </ng-template>

        <igx-grid-excel-style-filtering [minHeight]="'0px'" [maxHeight]="'500px'">
            <igx-excel-style-column-operations>
                <igx-excel-style-moving></igx-excel-style-moving>
                <igx-excel-style-pinning></igx-excel-style-pinning>
            </igx-excel-style-column-operations>
            <igx-excel-style-filter-operations>
                <igx-excel-style-search></igx-excel-style-search>
            </igx-excel-style-filter-operations>
        </igx-grid-excel-style-filtering>
    </igx-grid>
    <ng-template #template igxExcelStyleHeaderIcon>
            <igx-icon>search</igx-icon>
    </ng-template>
    `,
    imports: [
        IgxGridComponent,
        IgxColumnComponent,
        IgxGridExcelStyleFilteringComponent,
        IgxExcelStyleColumnOperationsTemplateDirective,
        IgxExcelStyleFilterOperationsTemplateDirective,
        IgxIconComponent,
        IgxExcelStyleMovingComponent,
        IgxExcelStylePinningComponent,
        IgxExcelStyleSearchComponent,
        IgxExcelStyleHeaderIconDirective
    ]
})
export class IgxGridFilteringESFTemplatesComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;
    public override data = SampleTestData.excelFilteringData();
    @ViewChild('template', {read: TemplateRef })
    public customExcelHeaderIcon: TemplateRef<any>;
}

@Component({
    template: `
    <igx-grid-excel-style-filtering #esf style="height: 700px; width: 350px">
        <igx-excel-style-column-operations>
            <igx-excel-style-selecting></igx-excel-style-selecting>
        </igx-excel-style-column-operations>
        <igx-excel-style-filter-operations>Filter Operations Template</igx-excel-style-filter-operations>
    </igx-grid-excel-style-filtering>
    <igx-grid #grid1 [data]="data" height="500px">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [sortable]="true"
            [filterable]="filterable" [resizable]="resizable" dataType="string" [selectable]="false"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable"
            [selectable]="false" [resizable]="resizable" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`,
    imports: [
        IgxGridComponent,
        IgxColumnComponent,
        IgxGridExcelStyleFilteringComponent,
        IgxExcelStyleColumnOperationsTemplateDirective,
        IgxExcelStyleFilterOperationsTemplateDirective,
        IgxExcelStyleSelectingComponent
    ]
})
export class IgxGridExternalESFTemplateComponent extends BasicGridComponent implements OnInit {
    @ViewChild('esf', { read: IgxGridExcelStyleFilteringComponent, static: true })
    public esf: IgxGridExcelStyleFilteringComponent;

    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public override data = SampleTestData.excelFilteringData();

    constructor() {
        super();
    }

    public ngOnInit(): void {
        this.esf.column = this.grid.getColumnByName('Downloads');
    }
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true">
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
        <igx-column width="100px" field="Licensed" [filterable]="filterable"
                    [resizable]="resizable" dataType="boolean">
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
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxInputGroupComponent, IgxPrefixDirective, IgxSuffixDirective, IgxInputDirective, IgxFilterCellTemplateDirective, IgxIconComponent]
})
export class IgxGridFilteringTemplateComponent extends BasicGridComponent {
    public resizable = false;
    public filterable = true;

    public override data = SampleTestData.excelFilteringData();
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
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent]
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
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent]
})
export class IgxGridFilteringMCHComponent extends IgxGridFilteringComponent { }

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowAdvancedFiltering]="true">
        <igx-grid-toolbar></igx-grid-toolbar>
        <igx-column width="100px" [field]="'ID'" [header]="'HeaderID'" [hasSummary]="true"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" dataType="number" [hasSummary]="true"></igx-column>
        <igx-column width="100px" [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" dataType="date" headerClasses="header-release-date"></igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" dataType="string" [filters]="customFilter">
        <igx-column width="100px" [field]="'ReleaseTime'" dataType="time"></igx-column>
        </igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxGridToolbarComponent]
})
export class IgxGridAdvancedFilteringComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public override data = SampleTestData.excelFilteringData();
    public activateFiltering(activate: boolean) {
        this.grid.allowFiltering = activate;
        this.grid.cdr.markForCheck();
    }
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowAdvancedFiltering]="true">
        <igx-grid-toolbar></igx-grid-toolbar>
        <igx-column *ngFor="let c of columns"
            [field]="c.field"
            [header]="c.header"
            [width]="c.width"
            [filterable]="true"
            [dataType]="c.type">
        </igx-column>
    </igx-grid>`,
    imports: [NgFor, IgxGridComponent, IgxColumnComponent, IgxGridToolbarComponent]
})
export class IgxGridAdvancedFilteringDynamicColumnsComponent extends BasicGridComponent implements OnInit  {
    public override data = [];
    public columns = [];

    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', header: 'HeaderID', width: '100px', type: 'number' },
            { field: 'ProductName', header: 'Product Name', width: '200px', type: 'string'},
            { field: 'Downloads', header: 'Downloads', width: '100px', type: 'number' },
            { field: 'Released', header: 'Released', width: '100px', type: 'boolean' },
            { field: 'ReleaseDate', header: 'Release Date', width: '200px', type: 'date' },
            { field: 'AnotherField', header: 'Another Field', width: '200px', type: 'string' },
        ];
        this.data = SampleTestData.excelFilteringData();
    }
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowAdvancedFiltering]="true">
        <igx-grid-toolbar>
            <igx-grid-toolbar-advanced-filtering
                #filtering
                [overlaySettings]="filteringOverlaySettings">
            </igx-grid-toolbar-advanced-filtering>
        </igx-grid-toolbar>
        <igx-column width="100px" [field]="'ID'" [header]="'HeaderID'" [hasSummary]="true"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" dataType="number" [hasSummary]="true"></igx-column>
        <igx-column width="100px" [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" dataType="date" headerClasses="header-release-date"></igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxGridToolbarComponent, IgxGridToolbarHidingComponent, IgxGridToolbarAdvancedFilteringComponent]
})
export class IgxGridAdvancedFilteringOverlaySettingsComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public hidingOverlaySettings: OverlaySettings = {};
    public override data = SampleTestData.excelFilteringData();

    public filteringOverlaySettings: OverlaySettings = {
        closeOnEscape: false
    };
}

@Component({
    template: `
    <igx-grid #grid1 [data]="data" height="400px">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" dataType="date" headerClasses="header-release-date"></igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>
    <igx-advanced-filtering-dialog [grid]="grid1">
    </igx-advanced-filtering-dialog>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxAdvancedFilteringDialogComponent]
})
export class IgxGridExternalAdvancedFilteringComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public override data = SampleTestData.excelFilteringData();
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowAdvancedFiltering]="true">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" dataType="number" [hasSummary]="true"></igx-column>
        <igx-column-group header="Released Group">
            <igx-column width="100px" [field]="'Released'" dataType="boolean"></igx-column>
            <igx-column width="100px" [field]="'ReleaseDate'" dataType="date" headerClasses="header-release-date"></igx-column>
        </igx-column-group>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" dataType="string" [filters]="customFilter"></igx-column>
        <igx-column width="100px" [field]="'DateTimeCreated'" dataType="dateTime"></igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent]
})
export class IgxGridAdvancedFilteringColumnGroupComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public override data = SampleTestData.excelFilteringData();
    public activateFiltering(activate: boolean) {
        this.grid.allowFiltering = activate;
        this.grid.cdr.markForCheck();
    }
}

@Component({
    template: `
    <igx-grid [data]="data" height="500px" width="500px" [allowFiltering]="allowFiltering">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [editable]="true" [header]="'ProductNameHeader'"
            [formatter]="formatter"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [editable]="true" dataType="number" [header]="'Downloads'"></igx-column>
        <igx-column width="100px" [field]="'Released'" [editable]="true" dataType="boolean" [header]="'Released'"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" dataType="date"></igx-column>
        <igx-paginator *ngIf="paging"></igx-paginator>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent, NgIf]
})
export class IgxGridClipboardComponent extends BasicGridComponent {
    public override data = SampleTestData.excelFilteringData();
    public formatter = (value: any) => `** ${value} **`;
    public allowFiltering = false;
    public paging = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(`id="testGridSum" [height]="height" [width]="width"`, ``, ColumnDefinitions.generatedWithDataType),
    imports: [IgxGridComponent, IgxColumnComponent, NgFor]
})
export class DynamicColumnsComponent extends GridWithSizeComponent {
    public columns = [
        { field: 'ID', width: 100, dataType: 'string' },
        { field: 'CompanyName', width: 300, dataType: 'string' },
        { field: 'ContactName', width: 200, dataType: 'string' },
        { field: 'ContactTitle', width: 200, dataType: 'string' },
        { field: 'Address', width: 300, dataType: 'string' },
        { field: 'City', width: 100, dataType: 'string' },
        { field: 'Region', width: 100, dataType: 'string' }
    ];

    public override data = SampleTestData.contactInfoDataFull();
    public override width = '800px';
    public override height = '800px';
}

@Component({
    template: `
    <igx-grid #gridCustomSelectors [primaryKey]="'ID'" [data]="data" [rowSelection]="'multiple'" [autoGenerate]="false">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column width="100px" [field]="'CompanyName'"></igx-column>
        <igx-column width="100px" [field]="'ContactName'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'ContactTitle'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Address'" dataType="string"></igx-column>
        <igx-paginator></igx-paginator>
        <ng-template igxRowSelector let-rowContext>
            <span class="rowNumber">{{ rowContext.index }}</span>
            <igx-checkbox [checked]="rowContext.selected" (click)="onRowCheckboxClick($event, rowContext)"></igx-checkbox>
        </ng-template>
        <ng-template igxHeadSelector let-headContext>
            <igx-checkbox [checked]="headContext.totalCount === headContext.selectedCount"
                (click)="onHeaderCheckboxClick($event, headContext)"></igx-checkbox>
        </ng-template>
    </igx-grid>
    <ng-template #customRow igxRowSelector let-rowContext>
            <span class="rowNumber">CUSTOM SELECTOR: {{ rowContext.index }}</span>
    </ng-template>
    <ng-template #customHeader igxHeadSelector let-headContext>
        <span>CUSTOM HEADER SELECTOR</span>
    </ng-template>
    <ng-template #customGroupRow igxGroupByRowSelector>
        <span>CUSTOM GROUP SELECTOR</span>
    </ng-template>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxCheckboxComponent, IgxPaginatorComponent, IgxRowSelectorDirective, IgxHeadSelectorDirective, IgxGroupByRowSelectorDirective]
})
export class GridCustomSelectorsComponent extends BasicGridComponent implements OnInit {
    @ViewChild('gridCustomSelectors', { static: true })
    public override grid: IgxGridComponent;
    public rowCheckboxClick: any;
    public headerCheckboxClick: any;
    @ViewChild('customRow', {read: TemplateRef, static: true })
    public customRowTemplate: TemplateRef<any>;

    @ViewChild('customHeader', {read: TemplateRef, static: true })
    public customHeaderTemplate: TemplateRef<any>;

    @ViewChild('customGroupRow', {read: TemplateRef, static: true })
    public customGroupRowTemplate: TemplateRef<any>;

    public ngOnInit(): void {
        this.data = SampleTestData.contactInfoDataFull();
    }

    public onRowCheckboxClick(event, rowContext) {
        this.rowCheckboxClick = event;
        event.stopPropagation();
        event.preventDefault();
        if (rowContext.selected) {
            this.grid.deselectRows([rowContext.rowID]);
        } else {
            this.grid.selectRows([rowContext.rowID]);
        }
    }

    public onHeaderCheckboxClick(event, headContext) {
        this.headerCheckboxClick = event;
        event.stopPropagation();
        event.preventDefault();
        if (headContext.selected) {
            this.grid.deselectAllRows();
        } else {
            this.grid.selectAllRows();
        }
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="900px" height="600px" [rowEditable]="true">
        <igx-grid-toolbar *ngIf="showToolbar">
            <igx-grid-toolbar-actions>
                <igx-grid-toolbar-hiding></igx-grid-toolbar-hiding>
            </igx-grid-toolbar-actions>
        </igx-grid-toolbar>
        <igx-column field="ProductID" header="Product ID" [editable]="false" width="200px"></igx-column>
        <igx-column field="ReorderLevel" header="Reorder Lever" [dataType]="'number'" [editable]="true" width="100px">
        </igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" [editable]="true" [sortable]="true" width="200px">
        </igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" [editable]="true" width="200px"></igx-column>
        <igx-paginator *ngIf="paging"></igx-paginator>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarHidingComponent, IgxPaginatorComponent, NgIf]
})
export class IgxGridRowEditingComponent extends BasicGridComponent {
    public showToolbar = false;
    public paging = false;
    public override data = SampleTestData.foodProductData();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="700px" height="400px" [rowEditable]="true">
        <igx-column>
            <ng-template igxCell let-cell="cell" let-val>
                <button type="button">Delete</button>
            </ng-template>
        </igx-column>
        <igx-column field="ProductID" header="Product ID"></igx-column>
        <igx-column field="ReorderLevel" header="Reorder Lever" [dataType]="'number'" [editable]="true" width="100px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="150px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" width="150px" [editable]="false"></igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxCellTemplateDirective]
})
export class IgxGridRowEditingWithoutEditableColumnsComponent extends BasicGridComponent {
    public override data = SampleTestData.foodProductData();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ID'" width="700px" height="400px" [rowEditable]="true" [moving]="true">
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
        <igx-column-group header="Column Group 1" *ngIf="columnGroupingFlag">
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
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent, NgIf]
})
export class IgxGridWithEditingAndFeaturesComponent extends BasicGridComponent {
    /* Data fields: Downloads:number, ID: number, ProductName: string, ReleaseDate: Date,
                Released: boolean, Category: string, Items: string, Test: string. */
    public pinnedFlag = false;
    public hiddenFlag = false;
    public columnGroupingFlag = false;
    public override data = SampleTestData.generateProductData(11);
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
                    <button type="button" igxButton igxRowEditTabStop (click)="endEdit(false)">Cancel</button>
                    <button type="button" igxButton igxRowEditTabStop (click)="endEdit(true)">Done</button>
                </div>
            </div>
        </ng-template>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxRowEditTabStopDirective, IgxRowEditTemplateDirective, IgxButtonDirective]
})
export class IgxGridCustomOverlayComponent extends BasicGridComponent {
    @ViewChildren(IgxRowEditTabStopDirective) public buttons: QueryList<IgxRowEditTabStopDirective>;
    public override data = SampleTestData.foodProductData();

    public get gridAPI() {
        return this.grid.gridAPI;
    }

    public get cellInEditMode() {
        return this.grid.gridAPI.crudService.cell;
    }

    public getCurrentEditCell(): CellType {
        const grid = this.grid as any;
        const currentCell = grid.gridAPI.crudService.cell;
        return this.grid.getCellByColumn(currentCell.id.rowIndex, currentCell.column.field);
    }

    public moveNext(shiftKey: boolean): void {
        this.grid.navigation.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'tab',
            code: 'tab',
            shiftKey
        }));
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="700px" height="400px" [rowEditable]="true">
        <igx-column field="ProductID" header="Product ID"></igx-column>
        <igx-column field="ReorderLevel" header="Reorder Lever" [dataType]="'number'" [editable]="true" width="100px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="150px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" width="150px" [editable]="false"></igx-column>
        <ng-template igxRowEdit >
        </ng-template>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxRowEditTemplateDirective]
})
export class IgxGridEmptyRowEditTemplateComponent extends BasicGridComponent {
    public override data = SampleTestData.foodProductData();
}


@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="700px" height="400px" [rowEditable]="true">
        <igx-column field="ProductID" header="Product ID"></igx-column>
        <igx-column field="ReorderLevel" header="Reorder Lever" [dataType]="'number'" [editable]="true" width="100px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="150px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" width="150px" [editable]="false"></igx-column>
    </igx-grid>
    <ng-template #editActions igxRowEditActions>
        CUSTOM EDIT ACTIONS
    </ng-template>
    <ng-template #addText igxRowAddText>
        CUSTOM ADD TEXT
    </ng-template>
    <ng-template #editText igxRowEditText>
        CUSTOM EDIT TEXT
    </ng-template>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxRowEditActionsDirective, IgxRowAddTextDirective, IgxRowEditTextDirective]
})
export class IgxGridCustomRowEditTemplateComponent extends BasicGridComponent {
    public override data = SampleTestData.foodProductData();
    @ViewChild('editActions', {read: TemplateRef })
    public editActions: TemplateRef<any>;

    @ViewChild('addText', {read: TemplateRef })
    public addText: TemplateRef<any>;

    @ViewChild('editText', {read: TemplateRef })
    public editText: TemplateRef<any>;
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [batchEditing]="true" [primaryKey]="'ProductID'" width="900px" height="900px" [rowEditable]="true" >
        <igx-column field="ProductID" header="Product ID" width="150px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="200px"></igx-column>
        <igx-column field="InStock" header="In Stock" [dataType]="'boolean'" width="100px"></igx-column>
        <igx-column field="UnitsInStock" header="Units in Stock" [dataType]="'number'" width="150px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" width="200px"></igx-column>
        <igx-paginator *ngIf="paging" [perPage]="7"></igx-paginator>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent, NgIf]
})
export class IgxGridRowEditingTransactionComponent extends BasicGridComponent {
    public override data = SampleTestData.foodProductData();
    public paging = false;
}


@Component({
    template: `
    <igx-grid #grid [data]="data" [batchEditing]="true"
        [primaryKey]="'ProductID'" width="900px" height="900px">
        <igx-column field="ProductID" header="Product ID" width="150px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="200px"></igx-column>
        <igx-column field="InStock" header="In Stock" [dataType]="'boolean'" width="100px"></igx-column>
        <igx-column field="UnitsInStock" header="Units in Stock" [dataType]="'currency'" width="150px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" width="200px"></igx-column>
        <igx-paginator *ngIf="paging" [perPage]="7"></igx-paginator>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent, NgIf]
})
export class IgxGridCurrencyColumnComponent extends BasicGridComponent {
    public override data = SampleTestData.foodProductData();
    public paging = false;
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [batchEditing]="true" [primaryKey]="'ProductID'" width="900px" height="900px">
        <igx-column field="ProductID" header="Product ID" width="150px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="200px"></igx-column>
        <igx-column field="InStock" header="In Stock" [dataType]="'boolean'" width="100px"></igx-column>
        <igx-column field="UnitsInStock" header="Units in Stock" [dataType]="'currency'" width="150px"></igx-column>
        <igx-column field="Discount" header="Order Date" [dataType]="'percent'" width="200px"></igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class IgxGridPercentColumnComponent extends BasicGridComponent {
    public override data = SampleTestData.foodPercentProductData();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [batchEditing]="true"
    [primaryKey]="'ProductID'" width="900px" height="900px">
        <igx-column field="ProductID" header="Product ID" width="150px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="200px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'dateTime'" width="250px" [editable]="true"></igx-column>
        <igx-column field="ReceiveTime" header="Receive Time" [dataType]="'time'" width="200px" [editable]="true"></igx-column>
        <igx-column field="ProducedDate" header="Produced Date" [dataType]="'date'" width="250px" [editable]="true"></igx-column>
        <igx-column field="InStock" header="In Stock" [dataType]="'boolean'" width="100px"></igx-column>
        <igx-column field="UnitsInStock" header="Units in Stock" [dataType]="'currency'" width="150px"></igx-column>
        <igx-paginator *ngIf="paging" [perPage]="7"></igx-paginator>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent, NgIf]
})
export class IgxGridDateTimeColumnComponent extends BasicGridComponent {
    public override data = SampleTestData.foodProductDateTimeData();
    public paging = false;

    public testFormatter = (val: string) => 'test' + val;
}

@Component({
    template: `
        <igx-grid
            [width]='width'
            [height]='height'
            [data]="data"
            [autoGenerate]="true" (columnInit)="columnsCreated($event)" (groupingDone)="groupingDoneHandler($event)"
            [rowEditable]="enableRowEditing">
        </igx-grid>
        <ng-template #dropArea>
            <span> Custom template </span>
        </ng-template>
    `,
    imports: [IgxGridComponent]
})
export class IgxGridRowEditingWithFeaturesComponent extends DataParent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild('dropArea', { read: TemplateRef, static: true })
    public dropAreaTemplate: TemplateRef<any>;

    public width = '800px';
    public height = null;

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
    public groupingDoneHandler(sortExpr) {
        this.currentSortExpressions = sortExpr;
    }
}

@Component({
    template: `
        <igx-grid
            [width]='width'
            [height]='height'
            [data]="data"
            [columnWidth] = "'100px'"
            [autoGenerate]="true" (columnInit)="columnsCreated($event)" (groupingDone)="groupingDoneHandler($event)"
            [rowEditable]="enableRowEditing">
        </igx-grid>
        <ng-template #dropArea>
            <span> Custom template </span>
        </ng-template>
    `,
    imports: [IgxGridComponent]
})
export class IgxGridGroupByComponent extends DataParent implements OnInit {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild('dropArea', { read: TemplateRef, static: true })
    public dropAreaTemplate: TemplateRef<any>;

    public width = '600px';
    public height = '600px';

    public enableSorting = false;
    public enableFiltering = false;
    public enableResizing = false;
    public enableEditing = true;
    public enableGrouping = true;
    public enableRowEditing = false;
    public currentSortExpressions;

    public columnsCreated(column: IgxColumnComponent) {
        column.sortable = this.enableSorting;
        column.filterable = this.enableFiltering;
        column.resizable = this.enableResizing;
        column.editable = this.enableEditing;
        column.groupable = this.enableGrouping;
    }
    public groupingDoneHandler(sortExpr) {
        this.currentSortExpressions = sortExpr;
    }

    public ngOnInit() {
        this.grid.groupingExpressions = [
            { fieldName: 'ProductName', dir: SortingDirection.Desc }
        ];
    }
}

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column [editable]="true" field="fullName">
            </igx-column>
            <igx-column field="age" [editable]="true" [dataType]="'number'">
            </igx-column>
            <igx-column field="isActive" [editable]="true" [dataType]="'boolean'"></igx-column>
            <igx-column field="birthday" [editable]="true" [dataType]="'date'"></igx-column>
            <igx-column [editable]="true" field="personNumber" [dataType]="'number'">
            </igx-column>
        </igx-grid>
        <ng-template #cellEdit igxCellEditor let-cell="cell">
            <input name="fullName" [value]="cell.editValue" (change)="onChange($event,cell)"  [igxFocus]="true"/>
        </ng-template>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxCellTemplateDirective, IgxCellEditorTemplateDirective, IgxFocusDirective]
})
export class CellEditingCustomEditorTestComponent extends BasicGridComponent {
    @ViewChild('cellEdit', { read: TemplateRef }) public templateCell;
    public override data = [
        { personNumber: 0, fullName: 'John Brown', age: 20, isActive: true, birthday: new Date('08/08/2001') },
        { personNumber: 1, fullName: 'Ben Affleck', age: 30, isActive: false, birthday: new Date('08/08/1991') },
        { personNumber: 2, fullName: 'Tom Riddle', age: 50, isActive: true, birthday: new Date('08/08/1961') }
    ];

    public onChange(event: any, cell: CellType) {
        cell.editValue = event.target.value;
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
    `,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class CellEditingTestComponent extends BasicGridComponent {
    public override data = [
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
        <button type="button" class="btnTest">Test</button>
    `,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class CellEditingScrollTestComponent extends BasicGridComponent {
    public override data = [
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

@Component({
    template: GridTemplateStrings.declareGrid(` [width]="width" [height]="height" [primaryKey]="'ProductID'"`, '', ColumnDefinitions.productBasic, '', '<igx-paginator [perPage]="perPage"></igx-paginator>'),
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent]
})
export class GridWithUndefinedDataComponent implements OnInit {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;
    public data;
    public perPage = 5;
    public width = '800px';
    public height = '600px';

    public ngOnInit(): void {
        requestAnimationFrame(() => {
            this.data = SampleTestData.foodProductDataExtended();
        });
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px" width="1300px" columnWidth="100px">
        <igx-column field="ID"></igx-column>
        <igx-column-group header="General Information" [collapsible]="generalInfCollapsible" [expanded]="generalInfExpanded">
            <igx-column  field="CompanyName" [visibleWhenCollapsed]="companyNameVisibleWhenCollapse"></igx-column>
            <igx-column-group header="Person Details"
                [collapsible]="personDetailsCollapsible"
                [expanded]="personDetailsExpanded" [visibleWhenCollapsed]="personDetailsVisibleWhenCollapse">
                <igx-column  field="ContactName"></igx-column>
                <igx-column  field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group header="Address Information" [collapsible]="true">
            <igx-column-group header="Country Information" [visibleWhenCollapsed]="true" [collapsible]="true">
                <igx-column  field="Country" [visibleWhenCollapsed]="true"></igx-column>
                <igx-column  field="Empty"></igx-column>
                <igx-column-group header="Region Information" [visibleWhenCollapsed]="true" [collapsible]="true">
                    <igx-column field="Region" [visibleWhenCollapsed]="true"></igx-column>
                    <igx-column field="PostalCode" [visibleWhenCollapsed]="true"></igx-column>
                </igx-column-group>
                <igx-column-group header="City Information" [visibleWhenCollapsed]="true" [collapsible]="true">
                    <igx-column field="City"></igx-column>
                    <igx-column field="Address"></igx-column>
                </igx-column-group>
            </igx-column-group>
            <igx-column-group header="Contact Information" [visibleWhenCollapsed]="false"
                    [collapsible]="true" [hidden]="hideContactInformation">
                <igx-column field="Phone" [visibleWhenCollapsed]="false"></igx-column>
                <igx-column field="Fax" [visibleWhenCollapsed]="false"></igx-column>
            </igx-column-group>
        </igx-column-group>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent]
})
export class CollapsibleColumnGroupTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
    public generalInfCollapsible;
    public generalInfExpanded;
    public personDetailsCollapsible;
    public personDetailsExpanded;
    public personDetailsVisibleWhenCollapse;
    public companyNameVisibleWhenCollapse;
    public hideContactInformation = true;
    public data = SampleTestData.contactInfoDataFull();
}


@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px" width="1000px" columnWidth="100px" [columnSelection]="'multiple'">
        <igx-column-group header="General Information" >
            <igx-column  field="CompanyName" ></igx-column>
            <igx-column-group header="Person Details">
                <igx-column  field="ContactName"></igx-column>
                <igx-column  field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column field="ID"></igx-column>
        <igx-column-group header="Country Information">
            <igx-column-group header="Region Information">
                <igx-column  field="Country" [selectable]="false"></igx-column>
                <igx-column field="Region" ></igx-column>
                <igx-column field="PostalCode" ></igx-column>
            </igx-column-group>
            <igx-column-group header="City Information" >
                <igx-column field="City" [selectable]="false" ></igx-column>
                <igx-column field="Address" [selectable]="false"></igx-column>
            </igx-column-group>
        </igx-column-group>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent]
})
export class ColumnSelectionGroupTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
    public data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <ng-template #indicatorTemplate let-column="column">
        <igx-icon>{{column.expanded ? 'lock' : 'lock_open'}} </igx-icon>
    </ng-template>

    <igx-grid #grid [data]="data" height="500px" width="1300px" columnWidth="100px">
        <igx-column field="ID"></igx-column>
        <igx-column-group header="General Information" [collapsible]="true">
            <igx-column  field="CompanyName" [visibleWhenCollapsed]="true"></igx-column>
            <igx-column-group header="Person Details" [visibleWhenCollapsed]="false">
                <igx-column  field="ContactName"></igx-column>
                <igx-column  field="ContactTitle"></igx-column>
            </igx-column-group>
            <ng-template igxCollapsibleIndicator let-column="column">
                <igx-icon>{{column.expanded ? 'remove' : 'add'}} </igx-icon>
            </ng-template>
        </igx-column-group>
        <igx-column-group header="Address Information" [collapsible]="true">
                <igx-column  field="Country" [visibleWhenCollapsed]="true"></igx-column>
                <igx-column-group header="Region Information" [visibleWhenCollapsed]="true">
                    <igx-column field="Region"></igx-column>
                    <igx-column field="PostalCode"></igx-column>
                </igx-column-group>
                <igx-column-group header="City Information" [visibleWhenCollapsed]="false">
                    <igx-column field="City"></igx-column>
                    <igx-column field="Address"></igx-column>
                </igx-column-group>
        </igx-column-group>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent, IgxIconComponent, IgxCollapsibleIndicatorTemplateDirective]
})
export class CollapsibleGroupsTemplatesTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild('indicatorTemplate', { read: TemplateRef, static: false })
    public indicatorTemplate;

    public data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
        <igx-grid [data]="data" height="500px" width="800px" columnWidth="100px">
            <igx-column-group *ngFor="let colGroup of columnGroups" [header]="colGroup.columnHeader" [collapsible]="colGroup.collapsible">
                <igx-column *ngFor="let column of colGroup.columns" [field]="column.field" [dataType]="column.type"
                    [visibleWhenCollapsed]="column.visibleWhenCollapsed"></igx-column>
            </igx-column-group>
        </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent, NgFor]
})
export class CollapsibleGroupsDynamicColComponent {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public columnGroups: Array<any>;
    public data = SampleTestData.contactInfoDataFull();

    constructor() {
        this.columnGroups = [
            {
                columnHeader: 'First', collapsible: true, columns: [
                    { field: 'ID', type: 'string', visibleWhenCollapsed: true },
                    { field: 'CompanyName', type: 'string', visibleWhenCollapsed: true },
                    { field: 'ContactName', type: 'string', visibleWhenCollapsed: true },
                ]
            },
            {
                columnHeader: 'Second', collapsible: true, columns: [
                    { field: 'ContactTitle', type: 'string', visibleWhenCollapsed: true },
                    { field: 'Address', type: 'string', visibleWhenCollapsed: true },
                    { field: 'PostlCode', type: 'string', visibleWhenCollapsed: false },
                    { field: 'Contry', type: 'string', visibleWhenCollapsed: false }
                ]
            }
        ];
    }

    public removeColumnFromGroup(groupIndex = 0) {
        this.columnGroups[groupIndex].columns.pop();
    }

    public addColumnToGroup(groupIndex = 0, visibleWhenCollapsed = false) {
        this.columnGroups[groupIndex].columns.push({ field: 'Missing', type: 'string', visibleWhenCollapsed });
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px" width="1300px" columnWidth="100px">

        <igx-column-group header="General Information">
            <igx-column  field="CompanyName" ></igx-column>
            <igx-column-group header="Person Details">
                <igx-column  field="ContactName"></igx-column>
                <igx-column  field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column field="ID"></igx-column>
        <igx-column-group header="Address Information" >
            <igx-column field="Region"></igx-column>
            <igx-column-group header="Country Information">
                <igx-column  field="Country"></igx-column>
                <igx-column-group header="City Information">
                    <igx-column field="City"></igx-column>
                    <igx-column field="Address"></igx-column>
                </igx-column-group>
            </igx-column-group>
        </igx-column-group>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent]
})
export class ColumnGroupsNavigationTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
    public data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-grid [data]="data" height="500px" [allowFiltering]="true" [(filteringExpressionsTree)]="filterTree">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true" [filterable]="false" [resizable]="resizable">
        </igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"></igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class IgxGridFilteringBindingComponent extends BasicGridComponent implements OnInit {
    public resizable = false;
    public filterable = true;
    public filterTree: IFilteringExpressionsTree;

    public override data = SampleTestData.excelFilteringData();

    public ngOnInit(): void {
        this.filterTree = new FilteringExpressionsTree(FilteringLogic.And);
        this.filterTree.filteringOperands = [
            {
                condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                fieldName: 'Downloads',
                searchVal: 200
            }
        ];
    }
}

@Component({
    template: `
    <igx-grid [data]="data" height="500px" [allowAdvancedFiltering]="true" [(advancedFilteringExpressionsTree)]="filterTree">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true" [filterable]="false" [resizable]="resizable">
        </igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"></igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class IgxGridAdvancedFilteringBindingComponent extends BasicGridComponent implements OnInit {
    public resizable = false;
    public filterable = true;
    public filterTree: IFilteringExpressionsTree;

    public override data = SampleTestData.excelFilteringData();

    public ngOnInit(): void {
        this.filterTree = new FilteringExpressionsTree(FilteringLogic.And);
        this.filterTree.filteringOperands = [
            {
                condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                fieldName: 'Downloads',
                searchVal: 200
            }
        ];
    }
}

@Component({
    template: `
        <igx-grid [data]="data" width="300px" height="250px">
            <igx-column field="firstName"></igx-column>
            <igx-column field="lastName"></igx-column>
            <igx-column field="age" [editable]="true" [dataType]="'number'"></igx-column>
            <igx-column field="isActive" [editable]="true" [dataType]="'boolean'"></igx-column>
            <igx-column field="birthday" [editable]="false" [dataType]="'date'"></igx-column>
            <igx-column field="fullName" [editable]="false"></igx-column>
        </igx-grid>
        <button type="button" class="btnTest">Test</button>
    `,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class ColumnEditablePropertyTestComponent extends BasicGridComponent {
    public override data = [
        { personNumber: 0, fullName: 'John Brown', age: 20, isActive: true, birthday: new Date('08/08/2001') },
        { personNumber: 1, fullName: 'Ben Affleck', age: 30, isActive: false, birthday: new Date('08/08/1991') },
        { personNumber: 2, fullName: 'Tom Riddle', age: 50, isActive: true, birthday: new Date('08/08/1961') }
    ];
}

@Component({
    template: `
        <igx-grid [height]="'300px'" [width]="'800px'" [data]="data" [autoGenerate]="true"></igx-grid>
    `,
    imports: [IgxGridComponent]
})
export class NoColumnWidthGridComponent extends BasicGridComponent {
    public override data = SampleTestData.generateNumberData(1000);
}

@Component({
    template: GridTemplateStrings.declareGrid('', '', ColumnDefinitions.idFirstLastNameSortable, '', '', TemplateDefinitions.sortIconTemplates)
        + ExternalTemplateDefinitions.sortIconTemplates,
    imports: [IgxGridComponent, IgxColumnComponent, IgxIconComponent, IgxSortHeaderIconDirective, IgxSortAscendingHeaderIconDirective, IgxSortDescendingHeaderIconDirective]
})
export class SortByParityComponent extends GridDeclaredColumnsComponent implements ISortingStrategy {
     @ViewChild('sortIcon', {read: TemplateRef })
     public sortIconTemplate: TemplateRef<any>;

     @ViewChild('sortAscIcon', {read: TemplateRef })
     public sortAscIconTemplate: TemplateRef<any>;

     @ViewChild('sortDescIcon', {read: TemplateRef })
     public sortDescIconTemplate: TemplateRef<any>;

    public sort(data: any[], fieldName: string, dir: SortingDirection) {
        const key = fieldName;
        const reverse = (dir === SortingDirection.Desc ? -1 : 1);
        const cmpFunc = (obj1, obj2) => this.compareObjects(obj1, obj2, key, reverse);
        return data.sort(cmpFunc);
    }
    protected sortByParity(a: any, b: any) {
        return a % 2 === 0 ? -1 : b % 2 === 0 ? 1 : 0;
    }
    protected compareObjects(obj1, obj2, key: string, reverse: number) {
        const a = obj1[key];
        const b = obj2[key];
        return reverse * this.sortByParity(a, b);
    }
}

@Component({
    template: GridTemplateStrings.declareGrid('', '', ColumnDefinitions.idFirstLastNameSortable, '', '', ''),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class SortByAnotherColumnComponent extends GridDeclaredColumnsComponent implements ISortingStrategy {

    public sort(data: any[]) {
        const key = 'Name';
        const cmpFunc = (obj1, obj2) => this.compareObjects(obj1, obj2, key);
        return data.sort(cmpFunc);
    }

    protected compareObjects(obj1, obj2, key: string) {
        const a = obj1[key].toLowerCase();
        const b = obj2[key].toLowerCase();
        return a > b ? 1 : a < b ? -1 : 0;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid('[sortingOptions]="sortingOptions"', '', ColumnDefinitions.idFirstLastNameSortable, '', '', ''),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class SortOnInitComponent extends GridDeclaredColumnsComponent implements OnInit {
   public sortingOptions: ISortingOptions = { mode: 'single' };
   public ngOnInit(): void {
        this.grid.sortingExpressions = [{ fieldName: 'Name', dir: SortingDirection.Asc }];
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="900px" height="600px">
        <igx-column field="ProductID" header="Product ID" [sortable]="true"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" [sortable]="true"
                    [formatter]="formatProductName" [sortStrategy]="sortStrategy"></igx-column>
        <igx-column field="QuantityPerUnit" header="Quantity Per Unit" [dataType]="'string'" [sortable]="true"
                    [formatter]="formatQuantity" [sortStrategy]="sortStrategy"></igx-column>
        <igx-column field="UnitPrice" header="Unit Price" [dataType]="'number'" [sortable]="true"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" [sortable]="true"></igx-column>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class IgxGridFormattedValuesSortingComponent extends BasicGridComponent {
    public override data = SampleTestData.gridProductData();
    public sortStrategy = new FormattedValuesSortingStrategy();

    public formatProductName = (value: string) => {
        if (!value) {
            return 'a';
        }
        const prefix = value.length > 10 ? 'a' : 'b';
        return `${prefix}-${value}`;
    }

    public formatQuantity = (value: string) => {
        if (!value) {
            return 'c';
        }
        const prefix = value.length > 10 ? 'c' : 'd';
        return `${prefix}-${value}`;
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [height]="'500px'" [width]="'500px'">
        <igx-column-layout *ngFor='let group of colGroups' [hidden]='group.hidden' [pinned]='group.pinned' [field]='group.group'>
            <igx-column *ngFor='let col of group.columns'
            [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
            [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field' [editable]='col.editable'></igx-column>
        </igx-column-layout>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnLayoutComponent, IgxColumnComponent, NgFor]
})
export class MRLTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
    public colGroups: Array<any> = [
        {
            group: 'group1',
            columns: [
                { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, editable: true },
                { field: 'ContactName', rowStart: 2, colStart: 1, editable: false, width: '100px' },
                { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true, width: '100px' },
                { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true, width: '100px' }
            ]
        },
        {
            group: 'group2',
            columns: [
                { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true },
                { field: 'Region', rowStart: 3, colStart: 1, editable: true },
                { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true }
            ]
        },
        {
            group: 'group3',
            columns: [
                { field: 'Country', rowStart: 1, colStart: 1 },
                { field: 'Phone', rowStart: 1, colStart: 2 },
                { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
            ]
        }
    ];
    public data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
<igx-grid #grid [data]="data" [width]="'800px'" [height]="'500px'"
    [rowEditable]="true" [primaryKey]="'ID'" [allowFiltering]="true" [moving]="true">
    <igx-column *ngFor="let c of columns" [sortable]="true" [field]="c.field" [header]="c.field"
        [width]="c.width" [resizable]="true">
    </igx-column>
    <igx-paginator *ngIf="paging"></igx-paginator>

    <igx-action-strip #actionStrip>
        <igx-grid-editing-actions [addRow]='true'></igx-grid-editing-actions>
    </igx-action-strip>
    <ng-template igxRowAddText>
            Adding Row
    </ng-template>
</igx-grid>
`,
    imports: [IgxGridComponent, IgxColumnComponent, IgxActionStripComponent, IgxGridEditingActionsComponent, IgxPaginatorComponent, IgxRowAddTextDirective, NgFor, NgIf]
})
export class IgxAddRowComponent implements OnInit {
    @ViewChild('actionStrip', { read: IgxActionStripComponent, static: true })
    public actionStrip: IgxActionStripComponent;

    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    public data: any[];
    public columns: any[];
    public paging = false;

    public ngOnInit() {

        this.columns = [
            { field: 'ID', width: '200px', hidden: false },
            { field: 'CompanyName', width: '200px' },
            { field: 'ContactName', width: '200px', pinned: false },
            { field: 'ContactTitle', width: '300px', pinned: false },
        ];

        this.data = [
            { ID: 'ALFKI', CompanyName: 'Alfreds Futterkiste', ContactName: 'Maria Anders', ContactTitle: 'Sales Representative' },
            { ID: 'ANATR', CompanyName: 'Ana Trujillo Emparedados y helados', ContactName: 'Ana Trujillo', ContactTitle: 'Owner' },
            { ID: 'ANTON', CompanyName: 'Antonio Moreno Taquería', ContactName: 'Antonio Moreno', ContactTitle: 'Owner' },
            { ID: 'AROUT', CompanyName: 'Around the Horn', ContactName: 'Thomas Hardy', ContactTitle: 'Sales Representative' },
            { ID: 'BERGS', CompanyName: 'Berglunds snabbköp', ContactName: 'Christina Berglund', ContactTitle: 'Order Administrator' },
            { ID: 'BLAUS', CompanyName: 'Blauer See Delikatessen', ContactName: 'Hanna Moos', ContactTitle: 'Sales Representative' },
            { ID: 'BLONP', CompanyName: 'Blondesddsl père et fils', ContactName: 'Frédérique Citeaux', ContactTitle: 'Marketing Manager' },
            { ID: 'BOLID', CompanyName: 'Bólido Comidas preparadas', ContactName: 'Martín Sommer', ContactTitle: 'Owner' },
            { ID: 'BONAP', CompanyName: 'Bon app\'', ContactName: 'Laurence Lebihan', ContactTitle: 'Owner' },
            { ID: 'BOTTM', CompanyName: 'Bottom-Dollar Markets', ContactName: 'Elizabeth Lincoln', ContactTitle: 'Accounting Manager' },
            { ID: 'BSBEV', CompanyName: 'B\'s Beverages', ContactName: 'Victoria Ashworth', ContactTitle: 'Sales Representative', Address: 'Fauntleroy Circus', City: 'London', Region: null, PostalCode: 'EC2 5NT', Country: 'UK', Phone: '(171) 555-1212', Fax: null },
            { ID: 'CACTU', CompanyName: 'Cactus Comidas para llevar', ContactName: 'Patricio Simpson', ContactTitle: 'Sales Agent', Address: 'Cerrito 333', City: 'Buenos Aires', Region: null, PostalCode: '1010', Country: 'Argentina', Phone: '(1) 135-5555', Fax: '(1) 135-4892' },
            { ID: 'CENTC', CompanyName: 'Centro comercial Moctezuma', ContactName: 'Francisco Chang', ContactTitle: 'Marketing Manager', Address: 'Sierras de Granada 9993', City: 'México D.F.', Region: null, PostalCode: '05022', Country: 'Mexico', Phone: '(5) 555-3392', Fax: '(5) 555-7293' },
            { ID: 'CHOPS', CompanyName: 'Chop-suey Chinese', ContactName: 'Yang Wang', ContactTitle: 'Owner', Address: 'Hauptstr. 29', City: 'Bern', Region: null, PostalCode: '3012', Country: 'Switzerland', Phone: '0452-076545', Fax: null },
            { ID: 'COMMI', CompanyName: 'Comércio Mineiro', ContactName: 'Pedro Afonso', ContactTitle: 'Sales Associate', Address: 'Av. dos Lusíadas, 23', City: 'Sao Paulo', Region: 'SP', PostalCode: '05432-043', Country: 'Brazil', Phone: '(11) 555-7647', Fax: null },
            { ID: 'CONSH', CompanyName: 'Consolidated Holdings', ContactName: 'Elizabeth Brown', ContactTitle: 'Sales Representative', Address: 'Berkeley Gardens 12 Brewery', City: 'London', Region: null, PostalCode: 'WX1 6LT', Country: 'UK', Phone: '(171) 555-2282', Fax: '(171) 555-9199' },
            { ID: 'DRACD', CompanyName: 'Drachenblut Delikatessen', ContactName: 'Sven Ottlieb', ContactTitle: 'Order Administrator', Address: 'Walserweg 21', City: 'Aachen', Region: null, PostalCode: '52066', Country: 'Germany', Phone: '0241-039123', Fax: '0241-059428' },
            { ID: 'DUMON', CompanyName: 'Du monde entier', ContactName: 'Janine Labrune', ContactTitle: 'Owner', Address: '67, rue des Cinquante Otages', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.67.88.88', Fax: '40.67.89.89' },
            { ID: 'EASTC', CompanyName: 'Eastern Connection', ContactName: 'Ann Devon', ContactTitle: 'Sales Agent', Address: '35 King George', City: 'London', Region: null, PostalCode: 'WX3 6FW', Country: 'UK', Phone: '(171) 555-0297', Fax: '(171) 555-3373' },
            { ID: 'ERNSH', CompanyName: 'Ernst Handel', ContactName: 'Roland Mendel', ContactTitle: 'Sales Manager', Address: 'Kirchgasse 6', City: 'Graz', Region: null, PostalCode: '8010', Country: 'Austria', Phone: '7675-3425', Fax: '7675-3426' },
            { ID: 'FAMIA', CompanyName: 'Familia Arquibaldo', ContactName: 'Aria Cruz', ContactTitle: 'Marketing Assistant', Address: 'Rua Orós, 92', City: 'Sao Paulo', Region: 'SP', PostalCode: '05442-030', Country: 'Brazil', Phone: '(11) 555-9857', Fax: null },
            { ID: 'FISSA', CompanyName: 'FISSA Fabrica Inter. Salchichas S.A.', ContactName: 'Diego Roel', ContactTitle: 'Accounting Manager', Address: 'C/ Moralzarzal, 86', City: 'Madrid', Region: null, PostalCode: '28034', Country: 'Spain', Phone: '(91) 555 94 44', Fax: '(91) 555 55 93' },
            { ID: 'FOLIG', CompanyName: 'Folies gourmandes', ContactName: 'Martine Rancé', ContactTitle: 'Assistant Sales Agent', Address: '184, chaussée de Tournai', City: 'Lille', Region: null, PostalCode: '59000', Country: 'France', Phone: '20.16.10.16', Fax: '20.16.10.17' },
            { ID: 'FOLKO', CompanyName: 'Folk och fä HB', ContactName: 'Maria Larsson', ContactTitle: 'Owner', Address: 'Åkergatan 24', City: 'Bräcke', Region: null, PostalCode: 'S-844 67', Country: 'Sweden', Phone: '0695-34 67 21', Fax: null },
            { ID: 'FRANK', CompanyName: 'Frankenversand', ContactName: 'Peter Franken', ContactTitle: 'Marketing Manager', Address: 'Berliner Platz 43', City: 'München', Region: null, PostalCode: '80805', Country: 'Germany', Phone: '089-0877310', Fax: '089-0877451' },
            { ID: 'FRANR', CompanyName: 'France restauration', ContactName: 'Carine Schmitt', ContactTitle: 'Marketing Manager', Address: '54, rue Royale', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.32.21.21', Fax: '40.32.21.20' },
            { ID: 'FRANS', CompanyName: 'Franchi S.p.A.', ContactName: 'Paolo Accorti', ContactTitle: 'Sales Representative', Address: 'Via Monte Bianco 34', City: 'Torino', Region: null, PostalCode: '10100', Country: 'Italy', Phone: '011-4988260', Fax: '011-4988261' }
        ];
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` [hideGroupedColumns]="true"`, '', ColumnDefinitions.exportGroupedDataColumns),
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class GridExportGroupedDataComponent extends BasicGridComponent {
    public override data = SampleTestData.exportGroupedDataColumns();
}

@Component({
    template: GridTemplateStrings.declareGrid(`[moving]="true" height="1000px"`, '', ColumnDefinitions.multiColHeadersExportColumns),
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent]
})
export class MultiColumnHeadersExportComponent extends BasicGridComponent {
    public override data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: GridTemplateStrings.declareGrid(`height="1000px"`, '', ColumnDefinitions.multiColHeadersExportColumns),
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent]
})
export class GridWithThreeLevelsOfMultiColumnHeadersAndTwoRowsExportComponent extends BasicGridComponent {
    public override data = SampleTestData.contactInfoDataTwoRecords();
}

@Component({
    template: `
    <igx-grid #grid1 [data]="data">
        <igx-column>
            <ng-template igxCell>
                <button type="button">SimpleBtn</button>
            </ng-template>
        </igx-column>
        <igx-column header="" field="ID"></igx-column>
        <igx-column header="  " field=""></igx-column>
        <igx-column header="Name" field="Name"></igx-column>
        <igx-column header="JobTitle" field="JobTitle"></igx-column>
    </igx-grid>`,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class GridWithEmptyColumnsComponent {
    @ViewChild('grid1', { static: true }) public grid: IgxGridComponent;

    public data = SampleTestData.personJobDataFull();
}

@Component({
    template: `
    <igx-grid #grid1 [data]="" [width]="'100%'" [height]="'700px'">
    </igx-grid>`,
    imports: [IgxGridComponent]
})
export class EmptyGridComponent {
    @ViewChild('grid1', { static: true }) public grid: IgxGridComponent;
}

/** Issue 9872 */
@Component({
    template: GridTemplateStrings.declareGrid('', '', ColumnDefinitions.generatedWithDataType),
    imports: [IgxGridComponent, IgxColumnComponent, NgFor]
})
export class ColumnsAddedOnInitComponent extends BasicGridComponent implements OnInit {
    public columns = [];
    public override data = [];
    public ngOnInit(): void {
        this.columns = [
            { field: 'CompanyName' },
            { field: 'ContactName' },
            { field: 'Address' }];
        this.data = SampleTestData.contactInfoData();

        for (let i = 0; i < 3; i++) {
            this.columns.push({ field: i.toString() }); //add columns for the horizon
            this.data.forEach(
                c => (c[i] = i * 2500)
            ); //add random quantity to each customer for each period in the horizon
        }
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(' [hideGroupedColumns]="true"', '', ColumnDefinitions.generatedGroupableWithEnabledSummariesAndDataType),
    imports: [IgxGridComponent, IgxColumnComponent, NgFor]
})
export class GroupedGridWithSummariesComponent extends BasicGridComponent implements OnInit {
    public columns = [];
    public override data = [];

    public ngOnInit(): void {
        this.columns = [
            { dataType: 'string', field: 'City', groupable: true },
            { dataType: 'boolean', field: 'Shipped', groupable: true },
            { dataType: 'string', field: 'ContactTitle', groupable: true },
            { dataType: 'number', field: 'PTODays', groupable: false },
        ];

        this.data = SampleTestData.contactInfoWithPTODaysData();
    }
}

@Component({
    template: GridTemplateStrings.declareGrid('', '', ColumnDefinitions.generatedWithColumnBasedSummariesAndDataType),
    imports: [IgxGridComponent, IgxColumnComponent, NgFor]
})
export class GridCurrencySummariesComponent extends BasicGridComponent implements OnInit {
    public columns = [];
    public override data = [];

    public ngOnInit(): void {
        this.columns = [
            { dataType: 'string', field: 'ProductID', header: "Product ID", hasSummary: false },
            { dataType: 'string', field: 'ProductName', header: "Product Name", hasSummary: true },
            { dataType: 'currency', field: 'UnitPrice', header: "Price", hasSummary: true },
            { dataType: 'number', field: 'UnitsInStock', header: "Units In Stock", hasSummary: false },
            { dataType: 'boolean', field: 'Discontinued', hasSummary: true },
            { dataType: 'date', field: 'OrderDate', hasSummary: true },
        ];

        this.data = SampleTestData.gridProductData();
    }
}

class CustomSummaryWithNullAndZero {
    public operate(): IgxSummaryResult[] {
        const result = [];

        result.push({
        key: 'total',
        label: null,
        summaryResult: 0,
        });

        result.push({
        key: 'totalDiscontinued',
        label: 0,
        summaryResult: null,
        });
        return result;
    }
}

class CustomSummaryWithUndefinedZeroAndValidNumber {
    public operate(): IgxSummaryResult[] {
        const result = [];

        result.push({
        key: 'total',
        label: undefined,
        summaryResult: 0,
        });

        result.push({
        key: 'totalDiscontinued',
        label: 23,
        summaryResult: undefined,
        });
        return result;
    }
}

class CustomSummaryWithUndefinedAndNull {
    public operate(): IgxSummaryResult[] {
        const result = [];

        result.push({
        key: 'total',
        label: undefined,
        summaryResult: null,
        });

        result.push({
        key: 'totalDiscontinued',
        label: null,
        summaryResult: undefined,
        });
        return result;
    }
}

class DiscontinuedSummary {
    public operate(data?: any[], allData = [], fieldName = ''): IgxSummaryResult[] {
        const result = [];

        result.push({
            key: 'total',
            label: IgxNumberSummaryOperand.sum(data).toString(),
            summaryResult: '',
        });

        result.push({
            key: 'totalDiscontinued',
            label: IgxNumberSummaryOperand.sum(
                allData.filter((rec) => rec['Discontinued']).map((r) => r[fieldName])
            ).toString(),
            summaryResult: '',
        });
        return result;
    }
}

class CustomSummaryWithDate {
    public operate(): IgxSummaryResult[] {
        const result = [];

        result.push({
            key: 'total',
            label: new Date(2015, 11, 8),
            summaryResult: null,
        });

        result.push({
            key: 'totalDiscontinued',
            label: null,
            summaryResult: new Date(2020, 4, 12),
        });
        return result;
    }
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data">
            <igx-column field="ProductID" header="Product ID" [hasSummary]="true" [summaries]="customSummary"></igx-column>
            <igx-column field="UnitPrice" [dataType]="'number'" [hasSummary]="true" [summaries]="customSummary"></igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true" [summaries]="customSummary"></igx-column>
        </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, NgFor]
})
export class GridCustomSummaryComponent extends BasicGridComponent implements OnInit {
    public override data = [];
    public customSummary = DiscontinuedSummary;

    public ngOnInit(): void {
        this.data = SampleTestData.gridCustomSummaryData();
    }
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data">
            <igx-column field="ProductID" header="Product ID" [hasSummary]="true" [summaries]="customSummary"></igx-column>
            <igx-column field="UnitPrice" [dataType]="'number'" [hasSummary]="true" [summaries]="customSummary"></igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true" [summaries]="customSummary"></igx-column>
        </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, NgFor]
})
export class GridCustomSummaryWithNullAndZeroComponent extends BasicGridComponent implements OnInit {
    public override data = [];
    public customSummary = CustomSummaryWithNullAndZero;

    public ngOnInit(): void {
        this.data = SampleTestData.gridCustomSummaryData();
    }
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data">
            <igx-column field="ProductID" header="Product ID" [hasSummary]="true" [summaries]="customSummary"></igx-column>
            <igx-column field="UnitPrice" [dataType]="'number'" [hasSummary]="true" [summaries]="customSummary"></igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true" [summaries]="customSummary"></igx-column>
        </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, NgFor]
})
export class GridCustomSummaryWithUndefinedZeroAndValidNumberComponent extends BasicGridComponent implements OnInit {
    public override data = [];
    public customSummary = CustomSummaryWithUndefinedZeroAndValidNumber;

    public ngOnInit(): void {
        this.data = SampleTestData.gridCustomSummaryData();
    }
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data">
            <igx-column field="ProductID" header="Product ID" [hasSummary]="true" [summaries]="customSummary"></igx-column>
            <igx-column field="UnitPrice" [dataType]="'number'" [hasSummary]="true" [summaries]="customSummary"></igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true" [summaries]="customSummary"></igx-column>
        </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, NgFor]
})
export class GridCustomSummaryWithUndefinedAndNullComponent extends BasicGridComponent implements OnInit {
    public override data = [];
    public customSummary = CustomSummaryWithUndefinedAndNull;

    public ngOnInit(): void {
        this.data = SampleTestData.gridCustomSummaryData();
    }
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data">
            <igx-column field="ProductID" header="Product ID" [hasSummary]="true" [summaries]="customSummary"></igx-column>
            <igx-column field="UnitPrice" [dataType]="'number'" [hasSummary]="true" [summaries]="customSummary"></igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true" [summaries]="customSummary"></igx-column>
        </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, NgFor]
})
export class GridCustomSummaryWithDateComponent extends BasicGridComponent implements OnInit {
    public override data = [];
    public customSummary = CustomSummaryWithDate;

    public ngOnInit(): void {
        this.data = SampleTestData.gridCustomSummaryData();
    }
}
export class ObjectCloneStrategy implements IDataCloneStrategy {
    public clone(data: any): any {
        const clonedData = {};
        if (data) {
            const clone = Object.defineProperties({}, Object.getOwnPropertyDescriptors(data));
            for (const key in clone) {
                clonedData[key] = clone[key]
            }

            clonedData['cloned'] = true;
        }

        return clonedData;
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [batchEditing]="true" [primaryKey]="'ProductID'" width="900px" height="900px" [rowEditable]="true" >
        <igx-column field="ProductID" header="Product ID" width="150px" [hidden]="true"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="200px"></igx-column>
        <igx-column field="InStock" header="In Stock" [dataType]="'boolean'" width="100px"></igx-column>
    </igx-grid>`,
    imports: [IgxColumnComponent, IgxGridComponent]
})
export class IgxGridRowEditingDefinedColumnsComponent extends BasicGridComponent {
    public override data = SampleTestData.foodProductData();
}
