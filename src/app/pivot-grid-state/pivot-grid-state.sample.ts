import { Component, ViewChild } from '@angular/core';
import {
    IgxPivotNumericAggregate,
    IgxPivotGridComponent,
    IPivotConfiguration,
    PivotAggregation,
    IgxPivotDateDimension,
    IPivotDimension,
    IgxGridStateDirective,
    IGridStateOptions,
    IPivotValue
} from 'igniteui-angular';
import { IgxPivotDataSelectorComponent } from '../../../projects/igniteui-angular/src/lib/grids/pivot-grid/pivot-data-selector.component';
import { IgxGridStateDirective as IgxGridStateDirective_1 } from '../../../projects/igniteui-angular/src/lib/grids/state.directive';
import { IgxPivotGridComponent as IgxPivotGridComponent_1 } from '../../../projects/igniteui-angular/src/lib/grids/pivot-grid/pivot-grid.component';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';

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
    styleUrls: ['pivot-grid-state.sample.scss'],
    templateUrl: 'pivot-grid-state.sample.html',
    standalone: true,
    imports: [IgxButtonDirective, IgxPivotGridComponent_1, IgxGridStateDirective_1, IgxPivotDataSelectorComponent]
})
export class PivotGridStateSampleComponent {
    @ViewChild('grid1', { static: true }) public grid1: IgxPivotGridComponent;

    public pivotConfigHierarchy: IPivotConfiguration = {
        columns: [
            new IgxPivotDateDimension(
                {
                    memberName: 'Date',
                    enabled: true
                },
                {
                    months: true,
                    quarters: true
                }
            ),
        ],
        rows: [
            {
                memberName: 'AllCities',
                memberFunction: () => 'All',
                enabled: true,
                childLevel: {
                    memberName: 'City',
                    enabled: true,
                    width: '100px'
                }
            },
            {
                memberName: 'SellerName',
                enabled: true
            }
        ],
        values: [
            {
                member: 'UnitsSold',
                aggregate: {
                    key: 'SUM',
                    aggregator: IgxPivotNumericAggregate.sum,
                    label: 'Sum'
                },
                enabled: true
            },
            {
                member: 'AmountOfSale',
                displayName: 'Amount of Sale',
                aggregate: {
                    key: 'SUM',
                    aggregator: IgxTotalSaleAggregate.totalSale,
                    label: 'Sum of Sale'
                },
                enabled: true,
                dataType: 'currency'
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


    public options: IGridStateOptions = {
        pivotConfiguration: true
    };
    @ViewChild(IgxGridStateDirective, { static: true })
    public state!: IgxGridStateDirective;

    public saveState() {
        const state = this.state.getState() as string;
        window.sessionStorage.setItem('grid-state', state);
    }

    public restoreState() {
        const state = window.sessionStorage.getItem('grid-state');
        this.state.setState(state as string);
    }

    public onValueInit(value: IPivotValue) {
        // Needed only for custom aggregators, formatter or styles.
        if (value.member === 'AmountOfSale') {
            value.aggregate.aggregator = IgxTotalSaleAggregate.totalSale;
        }
    }

    public onDimensionInit(dim: IPivotDimension) {
        if (dim.memberName === 'AllCities') {
            dim.memberFunction = () => 'All';
        }
    }


}
