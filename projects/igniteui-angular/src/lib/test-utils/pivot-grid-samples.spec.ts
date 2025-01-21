import { Component, TemplateRef, ViewChild } from '@angular/core';
import { IgxPivotDataSelectorComponent } from '../grids/pivot-grid/pivot-data-selector.component';
import { IgxPivotNumericAggregate } from '../grids/pivot-grid/pivot-grid-aggregate';
import { IgxPivotGridComponent } from '../grids/pivot-grid/pivot-grid.component';
import { IPivotConfiguration, IPivotGridColumn, IPivotGridRecord, PivotAggregation } from '../grids/pivot-grid/pivot-grid.interface';
import { IgxGridStateDirective } from '../grids/state.directive';

@Component({
    template: `
    <div style="display:flex; --ig-size: 2;">
        <igx-pivot-grid #grid [width]="'1500px'" [height]="'800px'" [data]="data" [pivotConfiguration]="pivotConfigHierarchy"
            [rowSelection]="'single'" [columnSelection]="'single'" [defaultExpandState]="defaultExpand">
        </igx-pivot-grid>
        <igx-pivot-data-selector #selector [grid]="grid"
            [(filtersExpanded)]="filterExpandState" [(rowsExpanded)]="rowExpandState"
            [(columnsExpanded)]="columnExpandState" [(valuesExpanded)]="valueExpandState">
        </igx-pivot-data-selector>
    </div>
    <ng-template #emptyTemplate>
        <span>Custom empty template.</span>
    </ng-template>
    <ng-template #chipValue let-value>
     {{value.member}}
    </ng-template>
    `,
    imports: [IgxPivotGridComponent, IgxPivotDataSelectorComponent]
})
export class IgxPivotGridTestBaseComponent {
    public defaultExpand = true;
    @ViewChild('emptyTemplate', { read: TemplateRef, static: true }) public emptyTemplate: TemplateRef<any>;
    @ViewChild('chipValue', { read: TemplateRef, static: true }) public chipValueTemplate: TemplateRef<any>;
    @ViewChild('grid', { read: IgxPivotGridComponent, static: true }) public pivotGrid: IgxPivotGridComponent;
    @ViewChild('selector', { read: IgxPivotDataSelectorComponent, static: true }) public dataSelector: IgxPivotDataSelectorComponent;
    public data;

    public cellClasses;

    public pivotConfigHierarchy: IPivotConfiguration;
    public filterExpandState = true;
    public columnExpandState = true;
    public rowExpandState = true;
    public valueExpandState = true;

    constructor() {
        this.data = [
            {
                ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                Country: 'Bulgaria', Date: '01/01/2021', UnitsSold: 282
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                Country: 'USA', Date: '01/05/2019', UnitsSold: 296
            },
            {
                ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
                Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68
            },
            {
                ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David',
                Country: 'USA', Date: '04/07/2021', UnitsSold: 293
            },
            {
                ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John',
                Country: 'USA', Date: '12/08/2021', UnitsSold: 240
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                Country: 'Uruguay', Date: '05/12/2020', UnitsSold: 456
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492
            }];

        this.cellClasses = {
            test: this.callback,
            test2: this.callback1
        };

        this.pivotConfigHierarchy = {
            columns: [{
                memberName: 'Country',
                enabled: true
            },
            ],
            rows: [{
                memberName: 'All',
                memberFunction: () => 'All',
                enabled: true,
                childLevel: {
                    memberName: 'ProductCategory',
                    memberFunction: (data) => data.ProductCategory,
                    enabled: true
                }
            }],
            values: [
                {
                    member: 'UnitsSold',
                    aggregate: {
                        aggregator: IgxPivotNumericAggregate.sum,
                        key: 'SUM',
                        label: 'Sum',
                    },
                    enabled: true,
                    // dataType: 'currency',
                    formatter: (value) => value ? value + '$' : undefined,
                    styles: this.cellClasses
                },
                {
                    member: 'UnitPrice',
                    aggregate: {
                        aggregator: IgxPivotNumericAggregate.sum,
                        key: 'SUM',
                        label: 'Sum',
                    },
                    enabled: true,
                    dataType: 'currency'
                }
            ],
            filters: []
        };
    }
    public callback = (rowData: IPivotGridRecord, columnData: IPivotGridColumn) => rowData.aggregationValues.get(columnData.field) >= 5;
    public callback1 = (rowData: IPivotGridRecord, columnData: IPivotGridColumn) => rowData.aggregationValues.get(columnData.field) < 5;
}

@Component({
    template: `
    <igx-pivot-grid #grid [data]="data" [pivotConfiguration]="pivotConfigHierarchy"
        [rowSelection]="'single'" [columnSelection]="'single'"
        [defaultExpandState]='defaultExpand'>
    </igx-pivot-grid>`,
    imports: [IgxPivotGridComponent]
})
export class IgxPivotGridTestComplexHierarchyComponent extends IgxPivotGridTestBaseComponent {
    @ViewChild('grid', { read: IgxPivotGridComponent, static: true }) public override pivotGrid: IgxPivotGridComponent;

    public override defaultExpand = true;
    constructor() {
        super();
        this.data = [
            {
                ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley Brooker',
                Country: 'Bulgaria', City: 'Plovdiv', Date: '01/01/2012', UnitsSold: 282
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa Longbottom',
                Country: 'US', City: 'New York', Date: '01/05/2013', UnitsSold: 296
            },
            {
                ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia Burson',
                Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '01/06/2011', UnitsSold: 68
            },
            {
                ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David Haley',
                Country: 'UK', City: 'London', Date: '04/07/2012', UnitsSold: 293
            },
            {
                ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John Smith',
                Country: 'Japan', City: 'Yokohama', Date: '12/08/2012', UnitsSold: 240
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry Lieb',
                Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '05/12/2011', UnitsSold: 456
            },
            {
                ProductCategory: 'Components', UnitPrice: 16.05, SellerName: 'Walter Pang',
                Country: 'Bulgaria', City: 'Sofia', Date: '02/19/2013', UnitsSold: 492
            }];
        this.pivotConfigHierarchy = {
            columns: [

                {
                    memberName: 'Country',
                    enabled: true
                }
            ]
            ,
            rows: [{
                memberName: 'All cities',
                memberFunction: () => 'All Cities',
                enabled: true,
                childLevel: {
                    memberName: 'City',
                    enabled: true
                }
            }, {
                memberFunction: () => 'AllProducts',
                memberName: 'AllProducts',
                enabled: true,
                childLevel:
                {
                    memberFunction: (data) => data.ProductCategory,
                    memberName: 'ProductCategory',
                    enabled: true
                }
            }],
            values: [
                {
                    member: 'UnitsSold',
                    aggregate: {
                        aggregator: IgxPivotNumericAggregate.sum,
                        key: 'SUM',
                        label: 'Sum'
                    },
                    enabled: true
                },
                {
                    member: 'AmountOfSale',
                    displayName: 'Amount of Sale',
                    aggregate: {
                        aggregator: IgxTotalSaleAggregate.totalSale,
                        key: 'TOTAL',
                        label: 'Total'
                    },
                    enabled: true
                }
            ]
        };
    }
}

@Component({
    template: `
    <igx-pivot-grid #grid igxGridState [width]="'1500px'" [height]="'800px'" [data]="data" [pivotConfiguration]="pivotConfigHierarchy">
    </igx-pivot-grid>
    `,
    imports: [IgxPivotGridComponent, IgxGridStateDirective]
})
export class IgxPivotGridPersistanceComponent {
    @ViewChild(IgxGridStateDirective, { static: true }) public state: IgxGridStateDirective;
    @ViewChild('grid', { read: IgxPivotGridComponent, static: true }) public pivotGrid: IgxPivotGridComponent;
    public data = [
        {
            ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley Brooker',
            Country: 'Bulgaria', City: 'Plovdiv', Date: '01/01/2012', UnitsSold: 282
        },
        {
            ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa Longbottom',
            Country: 'US', City: 'New York', Date: '01/05/2013', UnitsSold: 296
        },
        {
            ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia Burson',
            Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '01/06/2011', UnitsSold: 68
        },
        {
            ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David Haley',
            Country: 'UK', City: 'London', Date: '04/07/2012', UnitsSold: 293
        },
        {
            ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John Smith',
            Country: 'Japan', City: 'Yokohama', Date: '12/08/2012', UnitsSold: 240
        },
        {
            ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry Lieb',
            Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '05/12/2011', UnitsSold: 456
        },
        {
            ProductCategory: 'Components', UnitPrice: 16.05, SellerName: 'Walter Pang',
            Country: 'Bulgaria', City: 'Sofia', Date: '02/19/2013', UnitsSold: 492
        }];
    public pivotConfigHierarchy = {
        columns: [
            {
                memberName: 'Country',
                enabled: true
            }
        ]
        ,
        rows: [
            {
                memberName: 'City',
                enabled: true
            },
            {
                memberName: 'ProductCategory',
                enabled: true
            }],
        values: [
            {
                member: 'UnitsSold',
                aggregate: {
                    aggregator: IgxPivotNumericAggregate.sum,
                    key: 'SUM',
                    label: 'Sum'
                },
                enabled: true
            }
        ]
    };
}

@Component({
    template: `
    <igx-pivot-grid #grid [data]="data" [pivotConfiguration]="pivotConfigHierarchy" [defaultExpandState]="true">
    </igx-pivot-grid>`,
    imports: [IgxPivotGridComponent]
})
export class IgxPivotGridMultipleRowComponent extends IgxPivotGridTestBaseComponent {
    @ViewChild('grid', { read: IgxPivotGridComponent, static: true }) public override pivotGrid: IgxPivotGridComponent;

    constructor() {
        super();
        this.pivotConfigHierarchy = {
            columns: [{
                memberName: 'SellerName',
                enabled: true
            },
            ],
            rows: [{
                memberName: 'ProductCategory',
                memberFunction: (data) => data.ProductCategory,
                enabled: true
            }, {
                memberName: 'Country',
                enabled: true
            }, {
                memberName: 'Date',
                enabled: true
            }],
            values: [
                {
                    member: 'UnitsSold',
                    aggregate: {
                        aggregator: IgxPivotNumericAggregate.sum,
                        key: 'UnitsSoldSUM',
                        label: 'Sum of Units Sold'
                    },
                    enabled: true,
                    // dataType: 'currency',
                    formatter: (value) => value ? value + '$' : undefined
                },
                {
                    member: 'UnitPrice',
                    aggregate: {
                        aggregator: IgxPivotNumericAggregate.sum,
                        key: 'UnitPriceSUM',
                        label: 'Sum of Unit Price'
                    },
                    enabled: true,
                    dataType: 'currency'
                }
            ],
            filters: null
        };
    }
}


@Component({
    styles: `
    .pivot-container {
    display: flex;
    align-items: flex-start;
    flex: 1 1 auto;
    order: 0;
    align-items: stretch;
    }
    `,
    template: `
    <div class="pivot-container">
        <div>
            <igx-pivot-grid #grid [width]="'100%'" [height]="'800px'" [data]="data" [pivotConfiguration]="pivotConfigHierarchy"
                [rowSelection]="'single'" [columnSelection]="'single'" [defaultExpandState]="defaultExpand">
            </igx-pivot-grid>
        </div>
    </div>
    `,
    standalone: true,
    imports: [IgxPivotGridComponent]
})
export class IgxPivotGridFlexContainerComponent extends IgxPivotGridTestBaseComponent{
}

export class IgxTotalSaleAggregate {
    public static totalSale: PivotAggregation = (members, data: any) =>
        data.reduce((accumulator, value) => accumulator + value.UnitPrice * value.UnitsSold, 0);

    public static totalMin: PivotAggregation = (members, data: any) => {
        let min = 0;
        if (data.length === 1) {
            min = data[0].UnitPrice * data[0].UnitsSold || 0;
        } else if (data.length > 1) {
            min = data.reduce((a, b) => Math.min(a.UnitPrice * a.UnitsSold || 0, b.UnitPrice * b.UnitsSold || 0));
        }
        return min;
    };

    public static totalMax: PivotAggregation = (members, data: any) => {
        let max = 0;
        if (data.length === 1) {
            max = data[0].UnitPrice * data[0].UnitsSold;
        } else if (data.length > 1) {
            max = data.reduce((a, b) => Math.max(a.UnitPrice * a.UnitsSold, b.UnitPrice * b.UnitsSold));
        }
        return max;
    };
}
