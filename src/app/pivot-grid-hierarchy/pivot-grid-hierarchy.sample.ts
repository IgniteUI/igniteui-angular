import { Component, ViewChild } from '@angular/core';
import { IDimensionsChange, IgxPivotGridComponent, IgxPivotNumericAggregate, IPivotConfiguration, IPivotDimension } from 'igniteui-angular';
import { DATA } from '../shared/pivot-data';

@Component({
    providers: [],
    selector: 'app-pivot-grid-hierarchy-sample',
    styleUrls: ['pivot-grid-hierarchy.sample.scss'],
    templateUrl: 'pivot-grid-hierarchy.sample.html'
})

export class PivotGridHierarchySampleComponent {
    @ViewChild('grid1', { static: true }) public grid1: IgxPivotGridComponent;

    public dimensions: IPivotDimension[] = [
        {
            memberName: 'AllSeller',
            memberFunction: () => 'All Sellers',
            enabled: true,
            childLevel:
            {
                memberName: 'Seller',
                memberFunction: (data) => data.Seller.Name,
                enabled: true,
            },
        },
        {
            memberName: 'AllProduct',
            memberFunction: () => 'All Products',
            enabled: true,
            childLevel:
            {

                memberName: 'Product',
                memberFunction: (data) => data.Product.Name,
                enabled: true
            }
        },
        {
            memberName: 'City',
            memberFunction: (data) => data.Seller.City,
            enabled: true,
        },
        {
            memberName: 'Date',
            enabled: true,
        }
    ];
    public selected: IPivotDimension[] = [ this.dimensions[1], this.dimensions[2]];

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

    public pivotConfigHierarchy: IPivotConfiguration = {
        columns: [
            this.dimensions[2]
        ],
        rows: [
            this.dimensions[1]
        ],
        values: [
            {
                member: 'NumberOfUnits',
                aggregate: {
                    aggregator: IgxPivotNumericAggregate.sum,
                    key: 'sum',
                    label: 'Sum'
                },
                enabled: true

            }, {
                member: 'Value',
                aggregate: {
                    aggregator: IgxPivotNumericAggregate.sum,
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

    public dimensionChange(event: IDimensionsChange) {
        const allDims = this.pivotConfigHierarchy.rows.concat(this.pivotConfigHierarchy.columns).concat(this.pivotConfigHierarchy.filters);
        const allEnabled = allDims.filter(x => x && x.enabled);
        this.selected = allEnabled;
    }
}
