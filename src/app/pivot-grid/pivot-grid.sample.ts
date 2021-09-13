import { Component, ViewChild } from '@angular/core';
import { IgxPivotGridComponent } from 'igniteui-angular';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-tree-grid-sample',
    styleUrls: ['pivot-grid.sample.css'],
    templateUrl: 'pivot-grid.sample.html'
})

export class PivotGridSampleComponent {
    @ViewChild('grid1', { static: true }) public grid1: IgxPivotGridComponent;

    // note: this is the potential processed by the pipes data
    // used just for testing purposes until the pipes are fully implemented
    public data = [
        { ProductCategory: 'Clothing', Bulgaria: 774, USA: 296, Uruguay: 456 },
        { ProductCategory: 'Bikes', Uruguay: 68 },
        { ProductCategory: 'Accessories', USA: 293 },
        { ProductCategory: 'Components', USA: 240 }
    ];
}
