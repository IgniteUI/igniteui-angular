import { Component, HostBinding, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxPivotNumericAggregate,
    IgxPivotGridComponent,
    IPivotConfiguration,
    PivotAggregation,
    IgxPivotDateDimension,
    IPivotDimension,

    FilteringExpressionsTree,
    FilteringLogic,
    IgxStringFilteringOperand,
    PivotDimensionType,
    IPivotGridRecord,
    IPivotGridColumn,
    IgxExcelExporterService,
    IgxExcelExporterOptions,
    IgxButtonDirective,
    IgxButtonGroupComponent,
    IgxComboComponent,
    IgxPivotDataSelectorComponent,
    IgxPivotValueChipTemplateDirective
} from 'igniteui-angular';

export class IgxTotalSaleAggregate {
    public static totalSale: PivotAggregation = (members, data: any) =>
        data.reduce((accumulator, value) => accumulator + value.UnitPrice * value.UnitsSold, 0);

    public static totalMin: PivotAggregation = (members, data: any) => {
        let min = 0;
        if (data.length === 1) {
            min = data[0].UnitPrice * data[0].UnitsSold;
        } else if (data.length > 1) {
            const mappedData = data.map(x => x.UnitPrice * x.UnitsSold);
            min = mappedData.reduce((a, b) => Math.min(a, b));
        }
        return min;
    };

    public static totalMax: PivotAggregation = (members, data: any) => {
        let max = 0;
        if (data.length === 1) {
            max = data[0].UnitPrice * data[0].UnitsSold;
        } else if (data.length > 1) {
            const mappedData = data.map(x => x.UnitPrice * x.UnitsSold);
            max = mappedData.reduce((a, b) => Math.max(a, b));
        }
        return max;
    };
}

@Component({
    providers: [],
    selector: 'app-tree-grid-sample',
    styleUrls: ['pivot-grid.sample.scss'],
    templateUrl: 'pivot-grid.sample.html',
    imports: [IgxComboComponent, FormsModule, IgxButtonGroupComponent, IgxButtonDirective, IgxPivotGridComponent, IgxPivotValueChipTemplateDirective, IgxPivotDataSelectorComponent]
})
export class PivotGridSampleComponent {
    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return this.size === "superCompact" ? `var(--ig-size-small)` : `var(--ig-size-${this.size})`;
    }
    @ViewChild('grid1', { static: true }) public grid1: IgxPivotGridComponent;
    public size = 'superCompact';

    public filterExpTree = new FilteringExpressionsTree(FilteringLogic.And);

    constructor(private excelExportService: IgxExcelExporterService) {
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
            displayName: 'Country',
            enabled: true
        },
        new IgxPivotDateDimension(
            {
                memberName: 'Date',
                displayName: 'Date',
                enabled: true
            },
            {
                months: true,
                quarters: true
            }
        ),
        {
            memberFunction: () => 'All',
            memberName: 'AllProducts',
            displayName: "All Products",
            enabled: true,
            childLevel: {
                memberFunction: (data) => data.ProductCategory,
                memberName: 'ProductCategory',
                displayName: 'Product Category',
                enabled: true
            }
        },
        {
            memberName: 'AllSeller',
            displayName: 'All Sellers',
            enabled: true,
            childLevel: {
                enabled: true,
                memberName: 'SellerName',
                displayName: 'Seller Name'
            }
        },
    ];

    public selected: IPivotDimension[] = [this.dimensions[0], this.dimensions[1], this.dimensions[2]];

    public pivotConfigHierarchy: IPivotConfiguration = {
        columns: [
            {
                memberName: 'City',
                displayName: 'City',
                enabled: true,
                width: 'auto'
            },
        ],
        rows: [
            {
                memberName: 'SellerName',
                displayName: 'Seller Name',
                enabled: true,
                width: "auto"
                //filter: this.filterExpTree
            }
        ],
        values: [
            {
                member: 'UnitsSold',
                displayName: 'Units Sold',
                aggregate: {
                    key: 'SUM',
                    aggregatorName: 'SUM',
                    label: 'Sum'
                },
                enabled: true,
                styles: {
                    upFont: (rowData: IPivotGridRecord, columnData: IPivotGridColumn): boolean => rowData.aggregationValues.get(columnData.field) > 300,
                    downFont: (rowData: IPivotGridRecord, columnData: IPivotGridColumn): boolean => rowData.aggregationValues.get(columnData.field) <= 300
                },
                // dataType: 'currency',
                formatter: (value) => {
                    return value ? value + '$' : undefined;
                }
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
        }];

    public data2 = [{
        ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
        Country: 'Bulgaria', City: 'Plovdiv', Date: '01/19/2020', UnitsSold: 492
    },
    {
        ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
        Country: 'Bulgaria', City: 'Plovdiv', Date: '02/19/2020', UnitsSold: 492
    },
    {
        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
        Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '03/19/2020', UnitsSold: 456
    },
    {
        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
        Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '04/19/2020', UnitsSold: 456
    },
    {
        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
        Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '05/19/2020', UnitsSold: 456
    },
    {
        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
        Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '06/19/2020', UnitsSold: 456
    },
    {
        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
        Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '07/19/2020', UnitsSold: 456
    },
    {
        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
        Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '08/19/2020', UnitsSold: 456
    },
    {
        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
        Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '09/19/2020', UnitsSold: 456
    },
    {
        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
        Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '10/19/2020', UnitsSold: 456
    },
    {
        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
        Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '11/19/2020', UnitsSold: 456
    },
    {
        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
        Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '12/19/2020', UnitsSold: 456
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

    public dimensionChange() {
        const allDims = this.pivotConfigHierarchy.rows.concat(this.pivotConfigHierarchy.columns).concat(this.pivotConfigHierarchy.filters);
        const allEnabled = allDims.filter(x => x && x.enabled);
        this.selected = allEnabled;
    }

    public setDensity(density) {
        this.size = density;
    }

    public autoSizeRow(ind) {
        this.grid1.autoSizeRowDimension(this.pivotConfigHierarchy.rows[ind]);
    }

    public setRowDimWidth(rowDimIndex, widthValue) {
        const newPivotConfig = { ...this.pivotConfigHierarchy };
        newPivotConfig.rows[rowDimIndex].width = widthValue;

        this.grid1.pivotConfiguration = newPivotConfig;
    }

    public remove() {
        this.grid1.removeDimension({ memberName: 'test', enabled: true });
    }

    public toggle() {
        this.grid1.toggleDimension(this.pivotConfigHierarchy.filters[0]);
    }

    public move() {
        this.grid1.moveDimension({ memberName: 'test', enabled: true }, PivotDimensionType.Filter, 0);
    }

    public insert() {
        this.grid1.insertDimensionAt({
            memberName: 'Country',
            displayName: 'Country',
            enabled: true
        }, PivotDimensionType.Filter, 0);
    }


    public removeVal() {
        this.grid1.removeValue({
            member: 'test', enabled: true, aggregate: {
                key: 'SUM',
                aggregator: IgxPivotNumericAggregate.sum,
                label: 'Sum'
            }
        });
    }

    public toggleVal() {
        this.grid1.toggleValue({
            member: 'test', enabled: true, aggregate: {
                key: 'SUM',
                aggregator: IgxPivotNumericAggregate.sum,
                label: 'Sum'
            }
        });
    }

    public moveVal() {
        this.grid1.moveValue({
            member: 'test', enabled: true, aggregate: {
                key: 'SUM',
                aggregator: IgxPivotNumericAggregate.sum,
                label: 'Sum'
            }
        }, 0);
    }

    public insertVal() {
        this.grid1.insertValueAt({
            member: 'test', enabled: true, aggregate: {
                key: 'SUM',
                aggregator: IgxPivotNumericAggregate.sum,
                label: 'Sum'
            }
        }, 0);
    }

    public filterDim() {
        const set = new Set();
        set.add('New York');
        // for excel-style filters, condition is 'in' and value is a Set of values.
        this.grid1.filterDimension(this.pivotConfigHierarchy.columns[0], set, IgxStringFilteringOperand.instance().condition('in'));
    }

    public newConfig() {
        this.pivotConfigHierarchy = {
            columns: [
                {
                    memberName: 'City',
                    displayName: 'City',
                    enabled: true,
                },
            ],
            rows: [
                {
                    memberName: 'SellerName',
                    displayName: 'Seller Name',
                    enabled: true,
                    filter: this.filterExpTree
                }
            ],
            values: [
                {
                    member: 'UnitsSold',
                    displayName: 'Units Sold',
                    aggregate: {
                        key: 'SUM',
                        aggregatorName: 'SUM',
                        label: 'Sum'
                    },
                    enabled: true,
                }
            ]
        };
    }

    public exportButtonHandler() {
        this.excelExportService.export(this.grid1, new IgxExcelExporterOptions('ExportedFile'));
    }
}
