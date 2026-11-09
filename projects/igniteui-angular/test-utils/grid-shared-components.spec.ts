import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { IgxCheckboxComponent } from 'igniteui-angular/checkbox';
import { GridSelectionMode, IgxColumnComponent, IgxColumnLayoutComponent, IgxGridDetailTemplateDirective } from 'igniteui-angular/grids/core';
import { IgxInputDirective, IgxInputGroupComponent } from 'igniteui-angular/input-group';
import { IgxPaginatorComponent } from 'igniteui-angular/paginator';
import { IgxGridComponent } from '../grids/grid/src/grid.component';
import { IgxHierarchicalGridComponent } from '../grids/hierarchical-grid/src/hierarchical-grid.component';
import { IgxRowIslandComponent } from '../grids/hierarchical-grid/src/row-island.component';
import { SampleTestData } from './sample-test-data.spec';

// Test host components shared by several spec files. They live here (not in a spec with tests)
// because importing a spec file registers all of its suites in the importing file.

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px" [rowEditable]='true' [primaryKey]="'ID'">
        @for (group of colGroups; track group.group) {
            <igx-column-layout>
                @for (col of group.columns; track col.field) {
                    <igx-column
                        [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
                    [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field' [editable]='col.editable'></igx-column>
                }
            </igx-column-layout>
        }
    </igx-grid>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnLayoutComponent, IgxColumnComponent]
})
export class ColumnLayoutTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
    public cols: Array<any> = [
        { field: 'ID', rowStart: 1, colStart: 1 },
        { field: 'CompanyName', rowStart: 1, colStart: 2 },
        { field: 'ContactName', rowStart: 1, colStart: 3 },
        { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 4, colEnd: 4 },
    ];
    public colGroups = [
        {
            group: 'group1',
            columns: this.cols
        }
    ];
    public data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data"
        [autoGenerate]="false" [height]="'400px'" [width]="width" #hierarchicalGrid>
        <igx-column field="ID"></igx-column>
        @if (showAnotherCol) {
            <igx-column field="AnotherColumn"></igx-column>
        }
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" [autoGenerate]="false" #rowIsland>
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-column field="Col1"></igx-column>
            <igx-column field="Col2"></igx-column>
            <igx-column field="Col3"></igx-column>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland2 >
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridTestBaseComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true })
    public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true })
    public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true })
    public rowIsland2: IgxRowIslandComponent;
    public data;
    public width = '500px';
    public showAnotherCol = false;
    constructor() {
        // 3 level hierarchy
        this.data = this.generateDataUneven(20, 3);
    }
    public generateDataUneven(count: number, level: number, parentID: string = null) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parentID ? parentID + i : i.toString();
            if (level > 0) {
                // Have child grids for row with even id less rows by not multiplying by 2
                children = this.generateDataUneven((i % 2 + 1) * Math.round(count / 3), currLevel - 1, rowID);
            }
            prods.push({
                ID: rowID, ChildLevels: currLevel, ProductName: 'Product: A' + i, Col1: i,
                Col2: i, Col3: i, childData: children, childData2: children
            });
        }
        return prods;
    }

    public clearData() {
        this.data = [];
    }
}

@Component({
    template: `
    <igx-grid [data]="data" [width]="width" [height]="height" [primaryKey]="'ID'" [allowFiltering]="true" [rowSelection]="rowSelectable">
        @for (c of columns; track c.field) {
            <igx-column [field]="c.field" [width]="c.width">
            </igx-column>
        }
        @if (paging) {
            <igx-paginator></igx-paginator>
        }

        <ng-template igxGridDetail let-dataItem>
            <div>
                <div class="checkboxArea">
                    <igx-checkbox [disableRipple]="true"></igx-checkbox>
                    <span style="font-weight: 600">Available</span>
                </div>
                <div class="addressArea">{{dataItem.Address}}</div>
                <igx-input-group class="igxInputGroup">
                    <input igxInput />
                </igx-input-group>
            </div>
        </ng-template>
    </igx-grid>
    <ng-template igxGridDetail let-dataItem #detailTemplate>
        <div>
            NEW TEMPLATE
        </div>
    </ng-template>
    <ng-template igxGridDetail #gridTemplate>
        <igx-grid #childGrid>
            <igx-column [field]="'ColA'" [width]="'400px'"></igx-column>
            <igx-column [field]="'ColB'" [width]="'400px'"></igx-column>
        </igx-grid>
    </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent, IgxGridDetailTemplateDirective, IgxCheckboxComponent, IgxPaginatorComponent, IgxInputGroupComponent, IgxInputDirective]
})
export class DefaultGridMasterDetailComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild('detailTemplate', { read: TemplateRef, static: true })
    public detailTemplate: TemplateRef<any>;

    @ViewChild('gridTemplate', { read: TemplateRef, static: true })
    public gridTemplate: TemplateRef<any>;

    @ViewChildren('childGrid', { read: IgxGridComponent })
    public childGrid: IgxGridComponent;

    public width = '800px';
    public height = '500px';
    public data = SampleTestData.contactInfoDataFull();
    public columns = [
        { field: 'ContactName', width: '400px' },
        { field: 'CompanyName', width: '400px' }
    ];
    public paging = false;
    public perPage = 15;
    public rowSelectable = GridSelectionMode.none;
}
