
import { Component } from '@angular/core';
import { IgxColumnComponent } from 'igniteui-angular';

@Component({
    selector: 'app-grid-toolbar-custom-sample',
    styleUrls: ['grid-toolbar-custom.sample.css'],
    templateUrl: 'grid-toolbar-custom.sample.html'
})
export class GridToolbarCustomSampleComponent {

    public showToolbar = true;
    public title = 'Custom Title';
    public hidingEnabled = true;
    public pinningEnabled = true;
    public csv = true;
    public excel = true;

    public data = [
        {
            Name: 'Alice',
            Age: 25
        },
        {
            Name: 'Bob',
            Age: 23
        }
    ];

    public initColumns(column: IgxColumnComponent) {
        column.filterable = true;
        column.sortable = true;
    }
}
