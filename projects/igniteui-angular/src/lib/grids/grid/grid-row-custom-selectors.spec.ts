import { Component, OnInit, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { Calendar } from '../../calendar';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule, IgxColumnComponent } from './index';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { IgxHierarchicalGridMultiLayoutComponent } from '../hierarchical-grid/hierarchical-grid.spec';
import { IgxHierarchicalGridModule } from '../hierarchical-grid/hierarchical-grid.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';

describe('IgxGrid - Custom Row Selectors', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridWithPagingAndSelectionComponent,
                GridWithSelectionFilteringComponent,
                GridSummaryComponent,
                GridCancelableComponent,
                GridFeaturesComponent,
                HierarchicalGridRowSelectableIslandComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule,
                IgxHierarchicalGridModule
            ]
        })
            .compileComponents();
    }));


    // Events
    it('Firing onRowSelectionChange event', () => { });
    it('Canceling onRowSelectionChange event', () => { });
    it('Firing onHeaderSelectionChange event???', () => { });
    it('Canceling onHeaderSelectionChange event???', () => { });

    // Testing with different row selector templates
    it('Row selector template and header selector template with different sizes', () => { });

    // API
    it('', () => { });

    // Feature integration
    it('Pinned columns', () => { });
    it('Multi-column headers', () => { });
    it('Multi-row layout', () => { });

    // Aplication scenario test
    it('Conditional row selectors', () => { });

    it('',
        () => {
        // fakeAsync(() => {
        // async () => {
        const fix = TestBed.createComponent(GridWithPagingAndSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.gridSelection2;
        expect(true).toBeTruthy();
        expect(10).toEqual(10, '10');
        const checkboxElement1: HTMLElement = grid.getRowByIndex(5).nativeElement.querySelector('.igx-checkbox__input');

        spyOn(grid, 'triggerRowSelectionChange').and.callThrough();
        spyOn(grid.onRowSelectionChange, 'emit').and.callThrough();
        expect(grid.triggerRowSelectionChange).toHaveBeenCalledTimes(0);
        expect(grid.onRowSelectionChange.emit).toHaveBeenCalledTimes(0);

    });

});

@Component({
    template: `
        <igx-grid #gridSelection2 [height]="'600px'" [data]="data" [primaryKey]="'ID'"
        [autoGenerate]="true" [rowSelectable]="true" [paging]="true" [perPage]="50">
        </igx-grid>
        <button class="prevPageBtn" (click)="ChangePage(-1)">Prev page</button>
        <button class="nextPageBtn" (click)="ChangePage(1)">Next page</button>
    `
})
export class GridWithPagingAndSelectionComponent implements OnInit {
    public data = [];

    @ViewChild('gridSelection2', { read: IgxGridComponent, static: true })
    public gridSelection2: IgxGridComponent;

    ngOnInit() {
        const bigData = [];
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 5; j++) {
                bigData.push({
                    ID: i.toString() + '_' + j.toString(),
                    Column1: i * j,
                    Column2: i * j * Math.pow(10, i),
                    Column3: i * j * Math.pow(100, i)
                });
            }
        }
        this.data = bigData;
    }

    public ChangePage(val) {
        switch (val) {
            case -1:
                this.gridSelection2.previousPage();
                break;
            case 1:
                this.gridSelection2.nextPage();
                break;
            default:
                this.gridSelection2.paginate(val);
                break;
        }
    }
}

@Component({
    template: `
        <igx-grid #gridSelection4 [data]="data" height="500px" [rowSelectable]="true">
            <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
            <igx-column [field]="'ProductName'" [filterable]="true" dataType="string"></igx-column>
            <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
            <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
            <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
                        [filterable]="true" dataType="date">
            </igx-column>
        </igx-grid>`
})
export class GridWithSelectionFilteringComponent {

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    @ViewChild('gridSelection4', { read: IgxGridComponent, static: true })
    public gridSelection4: IgxGridComponent;

    public data = SampleTestData.productInfoData();

    @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;
}



@Component({
    template: `
        <igx-grid #grid1 [data]="data" [rowSelectable]="true">
            <igx-column field="ProductID" header="Product ID">
            </igx-column>
            <igx-column field="ProductName" [hasSummary]="true">
            </igx-column>
            <igx-column field="InStock" [dataType]="'boolean'" [hasSummary]="true">
            </igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true">
            </igx-column>
            <igx-column field="OrderDate" width="200px" [dataType]="'date'" [sortable]="true" [hasSummary]="true">
            </igx-column>
        </igx-grid>
    `
})
export class GridSummaryComponent {
    public data = SampleTestData.foodProductData();
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public gridSummaries: IgxGridComponent;
}

@Component({
    template: `
        <igx-grid #gridCancelable [data]="data" [rowSelectable]="true" (onRowSelectionChange)="cancelClick($event)">
            <igx-column field="ProductID" header="Product ID">
            </igx-column>
            <igx-column field="ProductName">
            </igx-column>
            <igx-column field="InStock" [dataType]="'boolean'">
            </igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'">
            </igx-column>
            <igx-column field="OrderDate" width="200px" [dataType]="'date'">
            </igx-column>
        </igx-grid>
    `
})
export class GridCancelableComponent {
    public data = SampleTestData.foodProductData();
    @ViewChild('gridCancelable', { read: IgxGridComponent, static: true })
    public gridCancelable: IgxGridComponent;

    public cancelClick(evt) {
        if (evt.row && (evt.row.index + 1) % 2 === 0) {
            evt.newSelection = evt.oldSelection || [];
        }
    }
}

@Component({
    template: `
    <igx-grid #grid1 [data]="data" [autoGenerate]="true" height="400px" width="600px" (onColumnInit)="initColumns($event)"
        [showToolbar]="true"
        toolbarTitle="Grid Toolbar"
        [columnHiding] = "true"
        hiddenColumnsText = "Hidden"
        columnHidingTitle = "Column Hiding"
        [exportExcel]="true"
        [exportCsv]="true"
        exportText="Export"
        exportExcelText="Export to Excel"
        exportCsvText="Export to CSV"
        [rowSelectable]="true"
    >
    </igx-grid>
    `
})
export class GridFeaturesComponent {

    @ViewChild('grid1', { read: IgxGridComponent, static: true }) public grid: IgxGridComponent;
    public data = [
        {
            Name: 'Alice',
            Age: 25
        },
        {
            Name: 'Bob',
            Age: 23
        }
    ];

    public initColumns(column: IgxColumnComponent) {
        column.filterable = true;
        column.sortable = true;
        column.editable = true;
        column.resizable = true;
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [autoGenerate]="false" [height]="'400px'" [width]="'500px'" #hierarchicalGrid>
    <igx-column field="ID"></igx-column>
    <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" [autoGenerate]="false" [height]="height" #rowIsland1 [rowSelectable]="true">
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
        </igx-row-island>
        <igx-row-island [key]="'childData2'" [autoGenerate]="false" [height]="height" #rowIsland2 [rowSelectable]="true">
            <igx-column field="Col1"></igx-column>
            <igx-column field="Col2"></igx-column>
            <igx-column field="Col3"></igx-column>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class HierarchicalGridRowSelectableIslandComponent extends IgxHierarchicalGridMultiLayoutComponent { }
