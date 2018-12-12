
import { Component } from '@angular/core';
import { IgxColumnComponent } from 'igniteui-angular';

@Component({
    selector: 'app-grid-toolbar-custom-sample',
    styleUrls: ['grid-toolbar-custom.sample.css'],
    templateUrl: 'grid-toolbar-custom.sample.html'
})
export class GridToolbarCustomSampleComponent {

    data = [
        {
            Name: 'Alice',
            Age: 25
        },
        {
            Name: 'Bob',
            Age: 23
        }
    ];

    constructor() {
    }

    public initColumns(column: IgxColumnComponent) {
        column.filterable = true;
        column.sortable = true;
    }
}
