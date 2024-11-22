import { Component, ViewChild, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { SampleTestData } from './sample-test-data.spec';
import { ColumnType, IPinningConfig, IgxAdvancedFilteringDialogComponent, IgxColumnComponent, IgxNumberSummaryOperand, IgxSummaryResult } from '../grids/public_api';
import { IgxHierarchicalGridComponent } from '../grids/hierarchical-grid/hierarchical-grid.component';
import { IgxRowIslandComponent } from '../grids/hierarchical-grid/row-island.component';
import { ColumnPinningPosition, RowPinningPosition } from '../grids/common/enums';
import { IgxActionStripComponent, IgxGridEditingActionsComponent, IgxGridPinningActionsComponent } from '../action-strip/public_api';
import { HIERARCHICAL_SAMPLE_DATA, HIERARCHICAL_SAMPLE_DATA_SHORT } from 'src/app/shared/sample-data';
import { IgxHierarchicalTransactionServiceFactory } from '../grids/hierarchical-grid/hierarchical-grid-base.directive';
import { IgxGridToolbarComponent } from '../grids/toolbar/grid-toolbar.component';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { IgxPaginatorComponent, IgxPaginatorContentDirective } from '../paginator/paginator.component';
import { IgxColumnGroupComponent } from '../grids/columns/column-group.component';
import { IgxIconComponent } from '../icon/icon.component';
import { IgxHeadSelectorDirective, IgxRowSelectorDirective } from '../grids/selection/row-selectors';
import { IgxGridToolbarDirective } from '../grids/toolbar/common';
import { IgxCellHeaderTemplateDirective } from '../grids/columns/templates.directive';
import { IgxPaginatorDirective } from '../paginator/paginator-interfaces';

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [allowFiltering]="true" [rowEditable]="true" [pinning]='pinningConfig'
     [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'" [moving]="true">
        <igx-column field="ID" [groupable]="true"></igx-column>
        <igx-column-group header="Information">
                <igx-column field="ChildLevels" [groupable]="true" [sortable]="true" [editable]="true"></igx-column>
                <igx-column field="ProductName" [groupable]="true" [hasSummary]='true'></igx-column>
        </igx-column-group>
        <igx-paginator *ngIf="paging"></igx-paginator>
        <igx-row-island [key]="'childData'" #rowIsland [allowFiltering]="true" [rowEditable]="true" [primaryKey]="'ID'">
            <igx-grid-toolbar *igxGridToolbar></igx-grid-toolbar>
            <igx-column field="ID" [groupable]="true" [hasSummary]='true'>
                <ng-template igxHeader let-columnRef="column">
                    <div>
                        <span>ID</span>
                        <igx-icon (click)="pinColumn(columnRef)">lock</igx-icon>
                    </div>
                </ng-template>
            </igx-column>
            <igx-column-group header="Information">
                    <igx-column field="ChildLevels" [groupable]="true" [sortable]="true" [editable]="true"></igx-column>
                    <igx-column field="ProductName" [groupable]="true"></igx-column>
            </igx-column-group>
            <igx-row-island [key]="'childData'" #rowIsland2 >
                <igx-column field="ID" [groupable]="true" ></igx-column>
                <igx-column-group header="Information">
                        <igx-column field="ChildLevels" [groupable]="true" [sortable]="true" [editable]="true"></igx-column>
                        <igx-column field="ProductName" [groupable]="true" [hasSummary]='true'></igx-column>
                </igx-column-group>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [
        IgxHierarchicalGridComponent,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxRowIslandComponent,
        IgxPaginatorComponent,
        IgxGridToolbarComponent,
        IgxIconComponent,
        IgxCellHeaderTemplateDirective,
        NgIf
    ]
})
export class IgxHierarchicalGridTestBaseComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true })
    public hgrid: IgxHierarchicalGridComponent;

    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true })
    public rowIsland: IgxRowIslandComponent;

    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true })
    public rowIsland2: IgxRowIslandComponent;

    public data;
    public pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Top };
    public paging = false;

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(40, 3);
    }

    public pinColumn(column: ColumnType) {
        if (column.pinned) {
            column.unpin();
        } else {
            column.pin();
        }
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [allowFiltering]="true" [rowEditable]="true" [pinning]='pinningConfig'
     [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'" [moving]="true">
        <igx-column field="ID" [groupable]="true"></igx-column>
        <igx-column-group header="Information">
                <igx-column field="ChildLevels" [groupable]="true" [sortable]="true" [editable]="true"></igx-column>
                <igx-column field="ProductName" [groupable]="true" [hasSummary]='true'></igx-column>
        </igx-column-group>
        <igx-paginator *ngIf="paging"></igx-paginator>
        <igx-row-island [key]="'childData'" #rowIsland [allowFiltering]="true" [rowEditable]="true" [primaryKey]="'ID'">
            <igx-grid-toolbar *igxGridToolbar></igx-grid-toolbar>
            <igx-column field="ID" [groupable]="true" [hasSummary]='true'>
                <ng-template igxHeader let-columnRef="column">
                    <div>
                        <span>ID</span>
                        <igx-icon (click)="pinColumn(columnRef)">lock</igx-icon>
                    </div>
                </ng-template>
            </igx-column>
            <igx-column-group header="Information">
                    <igx-column field="ChildLevels" [groupable]="true" [sortable]="true" [editable]="true"></igx-column>
                    <igx-column field="ProductName" [groupable]="true"></igx-column>
            </igx-column-group>
            <igx-row-island [key]="'childData'" #rowIsland2 >
                <igx-column field="ID" [groupable]="true" ></igx-column>
                <igx-column-group header="Information">
                        <igx-column field="ChildLevels" [groupable]="true" [sortable]="true" [editable]="true"></igx-column>
                        <igx-column field="ProductName" [groupable]="true" [hasSummary]='true'></igx-column>
                </igx-column-group>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    providers: [IgxHierarchicalTransactionServiceFactory],
    imports: [
        IgxHierarchicalGridComponent,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxRowIslandComponent,
        IgxPaginatorComponent,
        IgxGridToolbarComponent,
        IgxIconComponent,
        NgIf
    ]
})
export class IgxHierarchicalGridWithTransactionProviderComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true })
    public hgrid: IgxHierarchicalGridComponent;

    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true })
    public rowIsland: IgxRowIslandComponent;

    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true })
    public rowIsland2: IgxRowIslandComponent;

    public data;
    public pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Top };
    public paging = false;

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(40, 3);
    }

    public pinColumn(column: IgxColumnComponent) {
        if (column.pinned) {
            column.unpin();
        } else {
            column.pin();
        }
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [batchEditing]="true"
        [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'"
        [rowSelection]="'multiple'" [selectedRows]="selectedRows">
        <igx-column field="ID" ></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland [primaryKey]="'ID'" [rowSelection]="'single'">
            <igx-column field="ID"> </igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData'" #rowIsland2 [primaryKey]="'ID'" [rowSelection]="'none'">
                <igx-column field="ID"></igx-column>
                <igx-column field="ChildLevels"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridRowSelectionComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    public data;
    public selectedRows = [];

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(5, 3);
    }
}
@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'"
        [rowSelection]="'multiple'" [selectedRows]="selectedRows" [selectRowOnClick]="false">
        <igx-column field="ID" ></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland [primaryKey]="'ID'" [rowSelection]="'single'">
            <igx-column field="ID"> </igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData'" #rowIsland2 [primaryKey]="'ID'" [rowSelection]="'none'">
                <igx-column field="ID"></igx-column>
                <igx-column field="ChildLevels"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridRowSelectionTestSelectRowOnClickComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    public data;
    public selectedRows = [];

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(5, 3);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'"
        [rowSelection]="'multiple'">
        <igx-column field="ID" ></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland [primaryKey]="'ID'" [rowSelection]="'multiple'">
            <igx-column field="ID"> </igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData'" #rowIsland2 [primaryKey]="'ID'" [rowSelection]="'multiple'">
                <igx-column field="ID"></igx-column>
                <igx-column field="ChildLevels"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridRowSelectionNoTransactionsComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    public data;

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(5, 3);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid [data]="data" [cellSelection]="'none'" [height]="'600px'"
        [width]="'700px'" #hGridCustomSelectors [primaryKey]="'ID'"
        [rowSelection]="'multiple'">
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-paginator></igx-paginator>
        <igx-row-island [key]="'childData'" #rowIsland1 [primaryKey]="'ID'" [rowSelection]="'single'">
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-paginator *igxPaginator></igx-paginator>
            <ng-template igxHeadSelector let-headContext>
                <igx-checkbox [readonly]="true" (click)="handleHeadSelectorClick(headContext)"
                    [checked]="headContext.selectedCount === headContext.totalCount"
                    [indeterminate]="headContext.selectedCount !== headContext.totalCount && headContext.selectedCount !== 0">
                </igx-checkbox>
            </ng-template>
            <ng-template igxRowSelector let-rowContext>
                <span class="rowNumberChild">{{ rowContext.index }}</span>
                <igx-checkbox (click)="handleRowSelectorClick(rowContext)" [checked]="rowContext.selected">
                </igx-checkbox>
            </ng-template>
        </igx-row-island>
        <ng-template igxHeadSelector let-headContext>
            <igx-checkbox [readonly]="true" (click)="handleHeadSelectorClick(headContext)"
                [checked]="headContext.selectedCount === headContext.totalCount"
                [indeterminate]="headContext.selectedCount !== headContext.totalCount && headContext.selectedCount !== 0">
            </igx-checkbox>
        </ng-template>
        <ng-template igxRowSelector let-rowContext>
            <span class="rowNumber">{{ rowContext.index }}</span>
            <igx-checkbox [readonly]="true" (click)="handleRowSelectorClick(rowContext)" [checked]="rowContext.selected">
            </igx-checkbox>
        </ng-template>
    </igx-hierarchical-grid>`,
    imports: [
        IgxHierarchicalGridComponent,
        IgxColumnComponent,
        IgxRowIslandComponent,
        IgxCheckboxComponent,
        IgxPaginatorComponent,
        IgxPaginatorDirective,
        IgxRowSelectorDirective,
        IgxHeadSelectorDirective
    ]
})
export class IgxHierarchicalGridCustomSelectorsComponent implements OnInit {
    @ViewChild('hGridCustomSelectors', { read: IgxHierarchicalGridComponent, static: true })
    public hGrid: IgxHierarchicalGridComponent;

    @ViewChild('rowIsland1', { read: IgxRowIslandComponent, static: true })
    public firstLevelChild: IgxRowIslandComponent;

    public data = [];

    public ngOnInit(): void {
        // 2 level hierarchy
        this.data = SampleTestData.generateHGridData(40, 2);
    }

    public handleHeadSelectorClick(headContext) {
        if (headContext.totalCount !== headContext.selectedCount) {
            headContext.selectAll();
        } else {
            headContext.deselectAll();
        }
    }

    public handleRowSelectorClick(rowContext) {
        if (rowContext.selected) {
            rowContext.deselect();
        } else {
            rowContext.select();
        }
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid
        [primaryKey]="'ID'" [autoGenerate]="true">
        <igx-grid-toolbar>
            <button type="button" igxButton="contained">Parent Button</button>
        </igx-grid-toolbar>
        <igx-row-island [key]="'childData1'" #rowIsland1 [primaryKey]="'ID'" [autoGenerate]="true">
            <igx-grid-toolbar *igxGridToolbar>
                <button type="button" igxButton="contained">Child 1 Button</button>
            </igx-grid-toolbar>
        </igx-row-island>
        <igx-row-island [key]="'childData2'" #rowIsland2 [primaryKey]="'ID'" [autoGenerate]="true">
            <igx-grid-toolbar *igxGridToolbar>
                <button type="button" igxButton="contained">Child2 Button</button>
            </igx-grid-toolbar>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxGridToolbarComponent, IgxGridToolbarDirective, IgxRowIslandComponent, IgxButtonDirective]
})
export class IgxHierarchicalGridTestCustomToolbarComponent extends IgxHierarchicalGridTestBaseComponent { }

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid
        [primaryKey]="'ID'" [autoGenerate]="true">
        <igx-grid-toolbar>
            <button type="button" igxButton="contained">Parent Button</button>
        </igx-grid-toolbar>
        <ng-template #toolbarTemplate let-grid>
            <igx-grid-toolbar>
                <button type="button" igxButton="contained"> {{grid.parentIsland.key}} Button</button>
            </igx-grid-toolbar>
        </ng-template>
        <igx-row-island [key]="'childData1'" #rowIsland1 [primaryKey]="'ID'" [autoGenerate]="true" [toolbarTemplate]="toolbarTemplate">
        </igx-row-island>
        <igx-row-island [key]="'childData2'" #rowIsland2 [primaryKey]="'ID'" [autoGenerate]="true" [toolbarTemplate]="toolbarTemplate">
        </igx-row-island>

    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxGridToolbarComponent, IgxGridToolbarDirective, IgxRowIslandComponent, IgxButtonDirective]
})
export class IgxHierarchicalGridTestInputToolbarComponent extends IgxHierarchicalGridTestBaseComponent { }

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid
        [primaryKey]="'ID'" [autoGenerate]="true">
        <igx-grid-toolbar>
            <button type="button" igxButton="contained">Parent Button</button>
        </igx-grid-toolbar>
        <ng-template #paginatorTemplate let-grid>
            <igx-paginator>
                <igx-paginator-content>
                    <button type="button" igxButton="contained"> {{grid.parentIsland.key}} Button</button>
                </igx-paginator-content>
            </igx-paginator>
        </ng-template>
        <igx-row-island [key]="'childData1'" #rowIsland1 [primaryKey]="'ID'" [autoGenerate]="true" [paginatorTemplate]="paginatorTemplate">
        </igx-row-island>
        <igx-row-island [key]="'childData2'" #rowIsland2 [primaryKey]="'ID'" [autoGenerate]="true" [paginatorTemplate]="paginatorTemplate">
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxGridToolbarComponent, IgxPaginatorComponent, IgxPaginatorContentDirective, IgxRowIslandComponent, IgxButtonDirective]
})
export class IgxHierarchicalGridTestInputPaginatorComponent extends IgxHierarchicalGridTestBaseComponent { }

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid
        [primaryKey]="'ID'" [autoGenerate]="true" [rowEditable]='true'>
        <igx-action-strip #actionStrip1>
            <igx-grid-pinning-actions></igx-grid-pinning-actions>
            <igx-grid-editing-actions></igx-grid-editing-actions>
        </igx-action-strip>
        <igx-row-island [key]="'childData1'" #rowIsland1 [primaryKey]="'ID'" [autoGenerate]="true">
        </igx-row-island>
        <igx-row-island [key]="'childData2'" #rowIsland2 [primaryKey]="'ID'" [autoGenerate]="true">
            <igx-action-strip #actionStrip2>
                <igx-grid-pinning-actions></igx-grid-pinning-actions>
                <igx-grid-editing-actions [asMenuItems]="true"></igx-grid-editing-actions>
            </igx-action-strip>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [
        IgxHierarchicalGridComponent,
        IgxActionStripComponent,
        IgxGridPinningActionsComponent,
        IgxGridEditingActionsComponent,
        IgxRowIslandComponent
    ]
})
export class IgxHierarchicalGridActionStripComponent extends IgxHierarchicalGridTestBaseComponent {
    @ViewChild('actionStrip1', { read: IgxActionStripComponent, static: true })
    public actionStripRoot: IgxActionStripComponent;

    @ViewChild('actionStrip2', { read: IgxActionStripComponent, static: true })
    public actionStripChild: IgxActionStripComponent;
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'300px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'">
        <igx-column field="ID" ></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland [primaryKey]="'ID'" [rowSelection]="'single'">
            <igx-column field="ID"> </igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData'" #rowIsland2 [primaryKey]="'ID'" [rowSelection]="'none'">
                <igx-column field="ID"></igx-column>
                <igx-column field="ChildLevels"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>
    <igx-advanced-filtering-dialog [grid]="grid1">
    </igx-advanced-filtering-dialog>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent, IgxAdvancedFilteringDialogComponent]
})
export class IgxHierGridExternalAdvancedFilteringComponent extends IgxHierarchicalGridTestBaseComponent {
    // @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true })
    // public hgrid: IgxHierarchicalGridComponent;

    public override data = SampleTestData.generateHGridData(5, 3);
}

@Component({
    template: `
    <igx-hierarchical-grid [data]="data" [height]="'1200px'" [width]="'700px'"
        [allowFiltering]="true" [filterMode]="'excelStyleFilter'" #hierarchicalGrid>
        <igx-column field="Artist" [filterable]="true" [sortable]="true"></igx-column>
        <igx-column field="Debut" [sortable]="true" dataType="number"></igx-column>
        <igx-column field="GrammyNominations" header="Grammy Nominations" [sortable]="true"></igx-column>
        <igx-column field="GrammyAwards" header="Grammy Awards" [sortable]="true"></igx-column>

        <igx-row-island [key]="'Albums'" [allowFiltering]='true' [filterMode]="'excelStyleFilter'" [autoGenerate]="false">
            <igx-column field="Album"></igx-column>
            <igx-column field="LaunchDate" header="Launch Date" [dataType]="'date'"></igx-column>
            <igx-column field="BillboardReview" header="Billboard Review"></igx-column>
            <igx-column field="USBillboard200" header="US Billboard 200"></igx-column>
            <igx-row-island [key]="'Songs'" [allowFiltering]='true' [filterMode]="'excelStyleFilter'" [autoGenerate]="false">
                <igx-column field="Number" header="No."></igx-column>
                <igx-column field="Title"></igx-column>
                <igx-column field="Released" dataType="date"></igx-column>
                <igx-column field="Genre"></igx-column>
            </igx-row-island>
        </igx-row-island>

        <igx-row-island [key]="'Tours'" [autoGenerate]="false">
            <igx-column field="Tour"></igx-column>
            <igx-column field="StartedOn" header="Started on"></igx-column>
            <igx-column field="Location"></igx-column>
            <igx-column field="Headliner"></igx-column>
        <igx-row-island [key]="'TourData'" [autoGenerate]="false">
                <igx-column field="Country"></igx-column>
                <igx-column field="TicketsSold" header="Tickets Sold"></igx-column>
                <igx-column field="Attendants"></igx-column>
        </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>
    `,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridExportComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hGrid: IgxHierarchicalGridComponent;
    public data = SampleTestData.hierarchicalGridExportData();
}


@Component({
    template: `
    <igx-hierarchical-grid [data]="data" [height]="'1200px'" [width]="'700px'" #hierarchicalGrid [moving]="true">
        <igx-column field="CustomerID" [sortable]="true" [resizable]="true"></igx-column>
        <igx-column-group [pinned]="false" header="General Information">
            <igx-column field="CompanyName" [sortable]="true" [resizable]="true"></igx-column>
            <igx-column-group header="Personal Details">
                <igx-column field="ContactName" [sortable]="true" [resizable]="true"></igx-column>
                <igx-column field="ContactTitle" [sortable]="true" [resizable]="true"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group header="Address Information">
            <igx-column-group header="Location">
                <igx-column field="Address" [sortable]="true" [resizable]="true"></igx-column>
                <igx-column field="City" [sortable]="true" [resizable]="true"></igx-column>
                <igx-column field="PostalCode" [sortable]="true" [resizable]="true"></igx-column>
                <igx-column field="Country" [sortable]="true" [resizable]="true"></igx-column>
            </igx-column-group>
            <igx-column-group header="Contact Information">
                <igx-column field="Phone" [sortable]="true" [resizable]="true"></igx-column>
                <igx-column field="Fax" [sortable]="true" [resizable]="true"></igx-column>
            </igx-column-group>
        </igx-column-group>

        <igx-row-island [key]="'ChildCompanies'" [autoGenerate]="false">
            <igx-column-group [pinned]="false" header="General Information">
                <igx-column field="CompanyName" [sortable]="true" [resizable]="true"></igx-column>
                <igx-column-group header="Personal Details">
                    <igx-column field="ContactName" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="ContactTitle" [sortable]="true" [resizable]="true"></igx-column>
                </igx-column-group>
            </igx-column-group>
            <igx-column-group header="Address Information">
                <igx-column-group header="Location">
                    <igx-column field="Address" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="City" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="PostalCode" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="Country" [sortable]="true" [resizable]="true"></igx-column>
                </igx-column-group>
                <igx-column-group header="Contact Information">
                    <igx-column field="Phone" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="Fax" [sortable]="true" [resizable]="true"></igx-column>
                </igx-column-group>
            </igx-column-group>
        </igx-row-island>
    </igx-hierarchical-grid>
    `,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxColumnGroupComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridMultiColumnHeadersExportComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hGrid: IgxHierarchicalGridComponent;
    public data = HIERARCHICAL_SAMPLE_DATA;
}

@Component({
    template: `
    <igx-hierarchical-grid [data]="data" [height]="'1200px'" [width]="'700px'" #hierarchicalGrid>
        <igx-column field="CompanyName" [sortable]="true" [resizable]="true"></igx-column>

        <igx-row-island [key]="'ChildCompanies'" [autoGenerate]="false">
            <igx-column-group [pinned]="false" header="General Information">
                <igx-column field="CompanyName" [sortable]="true" [resizable]="true"></igx-column>
                <igx-column-group header="Personal Details">
                    <igx-column field="ContactName" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="ContactTitle" [sortable]="true" [resizable]="true"></igx-column>
                </igx-column-group>
            </igx-column-group>
            <igx-column-group header="Address Information">
                <igx-column-group header="Location">
                    <igx-column field="Address" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="City" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="PostalCode" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="Country" [sortable]="true" [resizable]="true"></igx-column>
                </igx-column-group>
                <igx-column-group header="Contact Information">
                    <igx-column field="Phone" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="Fax" [sortable]="true" [resizable]="true"></igx-column>
                </igx-column-group>
            </igx-column-group>
        </igx-row-island>
    </igx-hierarchical-grid>
    `,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxColumnGroupComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridMultiColumnHeaderIslandsExportComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hGrid: IgxHierarchicalGridComponent;
    public data = HIERARCHICAL_SAMPLE_DATA_SHORT;
}

@Component({
    template: `
    <igx-hierarchical-grid igxPreventDocumentScroll class="hgrid" [data]="data" [autoGenerate]="false"
        [height]="'1500px'" [width]="'100%'" #hierarchicalGrid>

        <igx-column field="Artist" [hasSummary]="true"></igx-column>
        <igx-column field="Debut" [hasSummary]="true"></igx-column>
        <igx-column field="GrammyNominations" header="Grammy Nominations" [hasSummary]="true" dataType="number" [summaries]="mySummary"></igx-column>
        <igx-column field="GrammyAwards" header="Grammy Awards" [hasSummary]="true" [summaries]="mySummary" dataType="number"></igx-column>

        <igx-row-island [height]="null" [key]="'Albums'" [autoGenerate]="false">
            <igx-column field="Album"></igx-column>
            <igx-column field="LaunchDate" header="Launch Date" [dataType]="'date'"></igx-column>
            <igx-column field="BillboardReview" header="Billboard Review" [hasSummary]="true" dataType="number" [summaries]="mySummary"></igx-column>
            <igx-column field="USBillboard200" header="US Billboard 200" [hasSummary]="true" dataType="number" [summaries]="mySummary"></igx-column>
            <igx-row-island [height]="null" [key]="'Songs'" [autoGenerate]="false" >
                <igx-column field="Number" header="No."></igx-column>
                <igx-column field="Title" [hasSummary]="true" [summaries]="myChildSummary"></igx-column>
                <igx-column field="Released" dataType="date"></igx-column>
                <igx-column field="Genre"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>
    `,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridSummariesExportComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hGrid: IgxHierarchicalGridComponent;
    public data = SampleTestData.hierarchicalGridExportData();

    public mySummary = MySummary;
    public myChildSummary = MyChildSummary;
}


class MySummary  {

    public operate(data?: any[]): IgxSummaryResult[] {
        const result = [];
        result.push(
        {
            key: 'min',
            label: 'Min',
            summaryResult: IgxNumberSummaryOperand.min(data)
        },
        {
            key: 'max',
            label: 'Max',
            summaryResult: IgxNumberSummaryOperand.max(data)
        },
        {
          key: 'avg',
          label: 'Avg',
          summaryResult: IgxNumberSummaryOperand.average(data)
        });
        return result;
    }
}
class MyChildSummary {

    public operate(data?: any[]): IgxSummaryResult[] {
        const result = [];
        result.push(
        {
            key: 'count',
            label: 'Count',
            summaryResult: IgxNumberSummaryOperand.count(data)
        });
        return result;
    }
}

@Component({
    template: `
    <igx-hierarchical-grid [data]="data" [autoGenerate]="false" [allowFiltering]='true'
        [height]="'600px'" [width]="'100%'" [rowHeight]="'65px'" [primaryKey]="'ID'" #hierarchicalGrid>
        <igx-column field="ID" [hidden]="true"></igx-column>
        <igx-column field="Artist"></igx-column>
        <igx-column field="Debut" dataType="number"></igx-column>
        <igx-column field="GrammyNominations" header="Grammy Nominations" dataType="number"></igx-column>
        <igx-column field="GrammyAwards" header="Grammy Awards" dataType="number"></igx-column>

        <igx-row-island [height]="null" [key]="'Albums'" [autoGenerate]="false" [allowFiltering]='true'>
            <igx-column field="Album"></igx-column>
            <igx-column field="LaunchDate" header="Launch Date" [dataType]="'date'"></igx-column>
            <igx-column field="BillboardReview" header="Billboard Review" dataType="number"></igx-column>
            <igx-column field="USBillboard200" header="US Billboard 200" dataType="number"></igx-column>
        <igx-row-island [height]="null" [key]="'Songs'" [autoGenerate]="false" >
                <igx-column field="Number" header="No."></igx-column>
                <igx-column field="Title"></igx-column>
                <igx-column field="Released" dataType="date"></igx-column>
                <igx-column field="Genre"></igx-column>
        </igx-row-island>
        </igx-row-island>

        <igx-row-island [height]="null" [key]="'Tours'" [autoGenerate]="false" [allowFiltering]='true'>
            <igx-column field="Tour"></igx-column>
            <igx-column field="StartedOn" header="Started on"></igx-column>
            <igx-column field="Location"></igx-column>
            <igx-column field="Headliner"></igx-column>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridDefaultComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true })
    public hierarchicalGrid: IgxHierarchicalGridComponent;

    public data;

    constructor() {
        this.data = SampleTestData.hierarchicalGridSingersFullData();
    }
}
