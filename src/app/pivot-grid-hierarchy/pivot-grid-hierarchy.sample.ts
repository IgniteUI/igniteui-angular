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
            member: () => 'All',
            enabled: true,
            childLevels: [
                {

                    member: (data) => data.Product.Name,
                    enabled: true,
                    childLevels: [
                        {
                            member: (data) => data.Seller.City,
                            enabled: true,
                            childLevels: []
                        }
                    ]
                },

            ]
        },
        ],
        rows: [{
            member: () => 'All',
            enabled: true,
            childLevels: [
                {
                    member: (data) => data.Seller.Name,
                    enabled: true,
                    childLevels: [],
                }
            ]
        }],
        values: [
            {
                member: 'NumberOfUnits',
                aggregate: IgxNumberSummaryOperand.sum,
                enabled: true

            }, {
                member: 'Value',
                aggregate: IgxNumberSummaryOperand.sum,
                enabled: true,
                formatter: (val) => val ? parseFloat(val).toFixed(2) : undefined
            }
        ],
        filters: null
    };

    public origData = DATA;
}
