import { Component, ViewChild } from '@angular/core';
import {
    IgxNumberSummaryOperand, IgxPivotGridComponent, IPivotConfiguration, IPivotDimension,
    IPivotValue,
    NoopPivotDimensionsStrategy
} from 'igniteui-angular';



export class MyRowStrategy extends NoopPivotDimensionsStrategy {
    public process(collection: any[], _: IPivotDimension[], __: IPivotValue[]): any[] {
        return collection;
    }
}

export class MyColumnStrategy extends NoopPivotDimensionsStrategy {
    public process(collection: any[], _: IPivotDimension[], __: IPivotValue[]): any[] {
        return collection;
    }
}


@Component({
    providers: [],
    selector: 'app-tree-grid-sample',
    styleUrls: ['pivot-grid-noop.sample.css'],
    templateUrl: 'pivot-grid-noop.sample.html'
})

export class PivotGridNoopSampleComponent {
    @ViewChild('grid1', { static: true }) public grid1: IgxPivotGridComponent;
    public pivotConfigHierarchy: IPivotConfiguration = {
        columnStrategy: NoopPivotDimensionsStrategy.instance(),
        rowStrategy: NoopPivotDimensionsStrategy.instance(),
        columns: [

            {
                memberName: 'Country',
                enabled: true
            }
        ]
        ,
        rows: [
            {
                memberName: 'All',
                memberFunction: () => 'AllProd',
                enabled: true,
                childLevel: {
                    memberName: 'ProductCategory',
                    enabled: true
                }
            }
        ],
        values: [
            {
                member: 'UnitsSold',
                aggregate: IgxNumberSummaryOperand.sum,
                enabled: true
            },
        ],
        filters: null
    };

    public mockRemoteData = [
        {
            ProductCategory: 'All', All: 1000, Bulgaria: 774, USA: 829, Uruguay: 524, All_records: [
                { ProductCategory: 'Clothing', Bulgaria: 774, USA: 296, Uruguay: 456 },
                { ProductCategory: 'Bikes', Uruguay: 68 },
                { ProductCategory: 'Accessories', USA: 293 },
                { ProductCategory: 'Components', USA: 240 }
            ]
        }
    ];

}
