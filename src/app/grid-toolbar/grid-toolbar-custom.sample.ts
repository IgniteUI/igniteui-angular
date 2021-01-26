
import { Component } from '@angular/core';
import { IgxColumnComponent, IgxCsvExporterService, IgxExcelExporterService } from 'igniteui-angular';

@Component({
    selector: 'app-grid-toolbar-custom-sample',
    styleUrls: ['grid-toolbar-custom.sample.css'],
    templateUrl: 'grid-toolbar-custom.sample.html'
})
export class GridToolbarCustomSampleComponent {

    showToolbar = true;
    title = 'Custom Title';
    hidingEnabled = true;
    pinningEnabled = true;
    csv = true;
    excel = true;

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
