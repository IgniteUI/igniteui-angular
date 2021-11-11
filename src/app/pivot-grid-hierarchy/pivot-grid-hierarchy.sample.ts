import { Component, ViewChild } from '@angular/core';
import { IgxNumberSummaryOperand, IgxPivotGridComponent, IPivotConfiguration } from 'igniteui-angular';
import { DATA } from '../shared/pivot-data';

@Component({
    providers: [],
    selector: 'app-pivot-grid-hierarchy-sample',
    styleUrls: ['pivot-grid-hierarchy.sample.scss'],
    templateUrl: 'pivot-grid-hierarchy.sample.html'
})

export class PivotGridHierarchySampleComponent {
    @ViewChild('grid1', { static: true }) public grid1: IgxPivotGridComponent;

    public pivotConfigHierarchy: IPivotConfiguration = {
        columns: [{
            memberName: 'All',
            memberFunction: () => 'All',
            enabled: true,
            childLevel:
            {

                memberName: 'Product',
                memberFunction: (data) => data.Product.Name,
                enabled: true,
                childLevel:
                {
                    memberName: 'City',
                    memberFunction: (data) => data.Seller.City,
                    enabled: true,
                }

            }
        },
        ],
        rows: [{
            memberName: 'AllSeller',
            memberFunction: () => 'All',
            enabled: true,
            childLevel:
            {
                memberName: 'Seller',
                memberFunction: (data) => data.Seller.Name,
                enabled: true,
            }
        }],
        values: [
            {
                member: 'NumberOfUnits',
                aggregate: {
                    aggregator:  IgxNumberSummaryOperand.sum,
                    key: 'sum',
                    label: 'Sum'
                },
                enabled: true

            }, {
                member: 'Value',
                aggregate: {
                    aggregator:  IgxNumberSummaryOperand.sum,
                    key: 'sum',
                    label: 'Sum'
                },
                enabled: true,
                formatter: (val) => val ? parseFloat(val).toFixed(2) : undefined
            }
        ],
        filters: null
    };

    public origData = DATA;
}
