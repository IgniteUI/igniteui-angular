import { CurrencyPipe } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FilteringExpressionsTree, FilteringLogic, IgxPivotDateDimension, IgxPivotGridComponent, IPivotConfiguration, IPivotValue, SortingDirection } from 'igniteui-angular';
import { DataService } from '../services/data.service';

// Custom aggregator to calculate profit value
export class IgxSaleProfitAggregate {
    public static totalProfit = (_, data: any[] | undefined) =>
        data?.reduce((accumulator, value) => accumulator + (value.Sale - value.Cost), 0) || 0;

    public static averageProfit = (_, data: any[] | undefined) => {
        let average = 0;
        if (data?.length === 1) {
            average = data[0].Sale - data[0].Cost;
        } else if (data && data.length > 1) {
            const mappedData = data.map(x => x.Sale - x.Cost);
            average = mappedData.reduce((a, b) => a + b) / mappedData.length;
        }
        return average;
    }

    public static minProfit = (_, data: any[] | undefined) => {
        let min = 0;
        if (data?.length === 1) {
            min = data[0].Sale - data[0].Cost;
        } else if (data && data.length > 1) {
            const mappedData = data.map(x => x.Sale - x.Cost);
            min = mappedData.reduce((a, b) => Math.min(a, b));
        }
        return min;
    };

    public static maxProfit = (_, data: any[] | undefined) => {
        let max = 0;
        if (data?.length === 1) {
            max = data[0].Sale - data[0].Cost;
        } else if (data && data.length > 1) {
            const mappedData = data.map(x => x.Sale - x.Cost);
            max = mappedData.reduce((a, b) => Math.max(a, b));
        }
        return max;
    };
}

@Component({
    selector: 'app-pivot-grid',
    imports: [IgxPivotGridComponent],
    templateUrl: './pivot-grid.component.html',
    styleUrl: './pivot-grid.component.scss'
})
export class PivotGridComponent {
    @ViewChild(IgxPivotGridComponent, { static: true })
    public pivotGrid!: IgxPivotGridComponent;

    private currencyPipe = new CurrencyPipe('en-US');
    private brandFilter = new FilteringExpressionsTree(FilteringLogic.Or, 'Brand');
    private dataService = inject(DataService);

    protected data: any;
    protected saleValue: IPivotValue = {
        enabled: true,
        member: 'Sale',
        displayName: 'Sales',
        aggregate: {
            key: 'SUM',
            aggregatorName: 'SUM',
            label: 'Sum'
        },
        aggregateList: [
            {
                key: 'AVG',
                aggregatorName: 'AVG',
                label: 'Average'
            },
            {
                key: 'COUNT',
                aggregatorName: 'COUNT',
                label: 'Count'
            },
            {
                key: 'MAX',
                aggregatorName: 'MAX',
                label: 'Maximum'
            },
            {
                key: 'MIN',
                aggregatorName: 'MIN',
                label: 'Minimum'
            },
            {
                key: 'SUM',
                aggregatorName: 'SUM',
                label: 'Sum'
            },
        ],
        formatter: (value, _, __) => {
            return this.currencyFormatter(value, 'Sale');
        }
    };
    protected profitValue: IPivotValue = {
        enabled: true,
        member: 'Cost',
        displayName: 'Profit',
        aggregate: {
            key: 'SUM',
            aggregator: IgxSaleProfitAggregate.totalProfit,
            label: 'Sum'
        },
        aggregateList: [
            {
                key: 'AVG',
                aggregator: IgxSaleProfitAggregate.averageProfit,
                label: 'Average'
            },
            {
                key: 'COUNT',
                aggregatorName: 'COUNT',
                label: 'Count'
            },
            {
                key: 'MAX',
                aggregator: IgxSaleProfitAggregate.maxProfit,
                label: 'Maximum'
            },
            {
                key: 'MIN',
                aggregator: IgxSaleProfitAggregate.minProfit,
                label: 'Minimum'
            },
            {
                key: 'SUM',
                aggregator: IgxSaleProfitAggregate.totalProfit,
                label: 'Sum'
            },
        ],
        formatter: (value, _, __) => {
            return this.currencyFormatter(value, 'Cost');
        }
    };

    protected pivotConfigBrands: IPivotConfiguration = {
        columns: [

            {
                enabled: true,
                memberName: 'Brand',
                displayName: 'Brand',
                filter: this.brandFilter
            },
            {
                enabled: true,
                memberName: 'Country',
                displayName: 'Country',
            }

        ],
        rows: [
            {
                enabled: false,
                sortDirection: SortingDirection.Asc,
                memberName: 'Store',
                displayName: 'Store',

            },
            {
                enabled: false,
                memberName: 'Country',
                displayName: 'Country',
                childLevel: {
                    enabled: true,
                    memberName: 'Store',
                    displayName: 'Store',

                }
            },


            new IgxPivotDateDimension({
                memberName: 'Date',
                displayName: 'All Periods',
                enabled: true,
                sortDirection: SortingDirection.None
            },
                {
                    fullDate: false,
                    quarters: true,
                    months: false,
                }),
        ],
        values: [
            this.saleValue,
            this.profitValue
        ]
    };

    constructor() {
        this.data = this.dataService.generatePivotData(1_000_000);
    }

    private currencyFormatter(value: any, field: string) {
        var valueConfig = this.pivotGrid.values.find(value => value.member === field);
        if (!valueConfig || valueConfig.aggregate.key === "COUNT") {
            return value;
        }
        return this.currencyPipe.transform(value, 'USD', 'symbol', '1.0-2');
    }
}
