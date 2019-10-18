import { Component, ViewChild, OnInit } from '@angular/core';
import { SampleTestData } from './sample-test-data.spec';
import { IgxColumnComponent } from '../grids';
import { IgxHierarchicalTransactionServiceFactory, IgxHierarchicalGridComponent, IgxRowIslandComponent } from 'igniteui-angular';

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [allowFiltering]="true" [rowEditable]="true"
     [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'">
        <igx-column field="ID" [groupable]='true' [movable]='true'></igx-column>
        <igx-column-group header="Information">
                <igx-column field="ChildLevels" [groupable]='true' [sortable]='true' [editable]="true" [movable]='true'></igx-column>
                <igx-column field="ProductName" [groupable]='true' [hasSummary]='true' [movable]='true'></igx-column>
        </igx-column-group>
        <igx-row-island [key]="'childData'" #rowIsland [allowFiltering]="true" [rowEditable]="true"
            [primaryKey]="'ID'" [showToolbar]="true" [columnHiding]="true" [columnPinning]="true">
            <igx-column field="ID" [groupable]='true' [hasSummary]='true' [movable]='true'>
                <ng-template igxHeader let-columnRef="column">
                    <div>
                        <span>ID</span>
                        <igx-icon fontSet="material" (click)="pinColumn(columnRef)">lock</igx-icon>
                    </div>
                </ng-template>
            </igx-column>
            <igx-column-group header="Information">
                    <igx-column field="ChildLevels" [groupable]='true' [sortable]='true' [editable]="true"></igx-column>
                    <igx-column field="ProductName" [groupable]='true'></igx-column>
            </igx-column-group>
            <igx-row-island [key]="'childData'" #rowIsland2 >
                <igx-column field="ID" [groupable]='true' ></igx-column>
                <igx-column-group header="Information">
                        <igx-column field="ChildLevels" [groupable]='true' [sortable]='true' [editable]="true"></igx-column>
                        <igx-column field="ProductName" [groupable]='true' [hasSummary]='true'></igx-column>
                </igx-column-group>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    providers: [ IgxHierarchicalTransactionServiceFactory ]
})
export class IgxHierarchicalGridTestBaseComponent {
    public data;
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(40, 3);
    }

    pinColumn(column: IgxColumnComponent) {
        column.pinned ? column.unpin() : column.pin();
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'"
        [rowSelection]="'multiple'">
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
    providers: [ IgxHierarchicalTransactionServiceFactory ]
})
export class IgxHierarchicalGridRowSelectionComponent {
    public data;
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;

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
})
export class IgxHierarchicalGridRowSelectionNoTransactionsComponent {
    public data;
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(5, 3);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid [paging]="true" [data]="data" [cellSelection]="false" [height]="'600px'"
        [width]="'700px'" #hGridCustomSelectors [primaryKey]="'ID'"
        [rowSelection]="'multiple'">
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland1 [paging]="true" [primaryKey]="'ID'" [rowSelection]="'single'">
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
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
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridCustomSelectorsComponent implements OnInit {
    public data = [];

    @ViewChild('hGridCustomSelectors', { read: IgxHierarchicalGridComponent, static: true })
    public hGrid: IgxHierarchicalGridComponent;

    @ViewChild('rowIsland1', { read: IgxRowIslandComponent, static: true })
    public firstLevelChild: IgxRowIslandComponent;

    public ngOnInit(): void {
        // 2 level hierarchy
        this.data = SampleTestData.generateHGridData(40, 2);
    }

    public handleHeadSelectorClick(headContext) {
        headContext.totalCount !== headContext.selectedCount ? headContext.selectAll() : headContext.deselectAll();
    }

    public handleRowSelectorClick(rowContext) {
        rowContext.selected ? rowContext.deselect() : rowContext.select();
    }
}
