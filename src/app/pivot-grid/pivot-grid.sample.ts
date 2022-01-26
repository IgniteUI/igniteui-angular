import { trigger } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import {
    IgxPivotNumericAggregate,
    IgxPivotGridComponent,
    IPivotConfiguration,
    PivotAggregation,
    IgxPivotDateDimension,
    IPivotDimension,
    IDimensionsChange,
    DisplayDensity,
    FilteringExpressionsTree,
    FilteringLogic,
    IgxStringFilteringOperand
} from 'igniteui-angular';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';

export class IgxTotalSaleAggregate {
    public static totalSale: PivotAggregation = (members, data: any) =>
        data.reduce((accumulator, value) => accumulator + value.UnitPrice * value.UnitsSold, 0);

    public static totalMin: PivotAggregation = (members, data: any) => {
        let min = 0;
        if (data.length === 1) {
            min = data[0].UnitPrice * data[0].UnitsSold;
        } else if (data.length > 1) {
            min = data.reduce((a, b) => Math.min(a.UnitPrice * a.UnitsSold, b.UnitPrice * b.UnitsSold));
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

@Component({
    providers: [],
    selector: 'app-tree-grid-sample',
    styleUrls: ['pivot-grid.sample.scss'],
    templateUrl: 'pivot-grid.sample.html'
})
export class PivotGridSampleComponent {
    @ViewChild('grid1', { static: true }) public grid1: IgxPivotGridComponent;
    public comfortable: DisplayDensity = DisplayDensity.comfortable;
    public cosy: DisplayDensity = DisplayDensity.cosy;
    public compact: DisplayDensity = DisplayDensity.compact;

    public filterExpTree = new FilteringExpressionsTree(FilteringLogic.And);

    constructor() {
        this.filterExpTree.filteringOperands = [
            {
                condition: IgxStringFilteringOperand.instance().condition('equals'),
                fieldName: 'SellerName',
                searchVal: 'Stanley'
            }
        ];
    }

    public dimensions: IPivotDimension[] = [
        {
            memberName: 'Country',
            enabled: true
        },
        new IgxPivotDateDimension(
            {
                memberName: 'Date',
                enabled: true
            },
            {
                months: false
            }
        ),
        {
            memberFunction: () => 'All',
            memberName: 'AllProducts',
            enabled: true,
            width: '25%',
            childLevel: {
                memberFunction: (data) => data.ProductCategory,
                memberName: 'ProductCategory',
                enabled: true
            }
        },
        {
            memberName: 'AllSeller',
            memberFunction: () => 'All Sellers',
            enabled: true,
            childLevel: {
                enabled: true,
                memberName: 'SellerName'
            }
        },
    ];

    public selected: IPivotDimension[] = [this.dimensions[0], this.dimensions[1], this.dimensions[2]];

    public pivotConfigHierarchy: IPivotConfiguration = {
        columns: [
            this.dimensions[1]
        ],
        rows: [
            this.dimensions[0],
            this.dimensions[2]
        ],
        values: [
            {
                member: 'UnitsSold',
                aggregate: {
                    key: 'SUM',
                    aggregator: IgxPivotNumericAggregate.sum,
                    label: 'Sum'
                },
                enabled: true,
                styles: {
                    upFont: (rowData: any, columnKey: any): boolean => rowData[columnKey] > 300,
                    downFont: (rowData: any, columnKey: any): boolean => rowData[columnKey] <= 300
                },
                // dataType: 'currency',
                formatter: (value) => value ? value + '$' : undefined
            },
            {
                member: 'AmountOfSale',
                displayName: 'Amount of Sale',
                aggregate: {
                    key: 'SUM',
                    aggregator: IgxTotalSaleAggregate.totalSale,
                    label: 'Sum of Sale'
                },
                aggregateList: [{
                    key: 'SUM',
                    aggregator: IgxTotalSaleAggregate.totalSale,
                    label: 'Sum of Sale'
                }, {
                    key: 'MIN',
                    aggregator: IgxTotalSaleAggregate.totalMin,
                    label: 'Minimum of Sale'
                }, {
                    key: 'MAX',
                    aggregator: IgxTotalSaleAggregate.totalMax,
                    label: 'Maximum of Sale'
                }],
                enabled: true,
                dataType: 'currency',
                styles: {
                    upFont1: (rowData: any, columnKey: any): boolean => rowData[columnKey] > 50,
                    downFont1: (rowData: any, columnKey: any): boolean => rowData[columnKey] <= 50
                },
            }
        ],
        filters: [
            {
                memberName: 'SellerName',
                enabled: true,
                //filter: this.filterExpTree
            }
        ]
    };

    public origData = [
        {
            ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
            Country: 'Bulgaria', City: 'Sofia', Date: '01/01/2021', UnitsSold: 282
        },
        {
            ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
            Country: 'USA', City: 'New York', Date: '01/05/2019', UnitsSold: 296
        },
        {
            ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
            Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '01/06/2020', UnitsSold: 68
        },
        {
            ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David',
            Country: 'USA', City: 'New York', Date: '04/07/2021', UnitsSold: 293
        },
        {
            ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John',
            Country: 'USA', City: 'New York', Date: '12/08/2021', UnitsSold: 240
        },
        {
            ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
            Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '05/12/2020', UnitsSold: 456
        },
        {
            ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
            Country: 'Bulgaria', City: 'Plovdiv', Date: '02/19/2020', UnitsSold: 492
        }];

    public handleChange(event) {
        let isColumnChange = false
        const allDims = this.pivotConfigHierarchy.rows.concat(this.pivotConfigHierarchy.columns).concat(this.pivotConfigHierarchy.filters);
        if (event.added.length > 0) {
            const dim = allDims.find(x => x && x.memberName === event.added[0].memberName);
            isColumnChange = this.pivotConfigHierarchy.columns.indexOf(dim) !== -1;
            if (dim) {
                dim.enabled = true;
            } else {
                // add as row by default
                this.pivotConfigHierarchy.rows = this.pivotConfigHierarchy.rows.concat(event.added);
            }
        } else if (event.removed.length > 0) {
            const dims = allDims.filter(x => x && event.removed.indexOf(x) !== -1);
            dims.forEach(x => x.enabled = false);
            isColumnChange = dims.some(x => this.pivotConfigHierarchy.columns.indexOf(x) !== -1);
        }
        this.grid1.notifyDimensionChange(isColumnChange);
    }

    public dimensionChange(event: IDimensionsChange) {
        const allDims = this.pivotConfigHierarchy.rows.concat(this.pivotConfigHierarchy.columns).concat(this.pivotConfigHierarchy.filters);
        const allEnabled = allDims.filter(x => x && x.enabled);
        this.selected = allEnabled;
    }

    public setDensity(density: DisplayDensity) {
        this.grid1.displayDensity = density;
    }

    public autoSizeRow(ind) {
        this.grid1.autoSizeRowDimension(this.pivotConfigHierarchy.rows[ind]);
    }

    public setRowDimWidth(rowDimIndex, widthValue) {
        const newPivotConfig = {...this.pivotConfigHierarchy};
        newPivotConfig.rows[rowDimIndex].width = widthValue;

        this.grid1.pivotConfiguration = newPivotConfig;
    }
}
