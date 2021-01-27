import { Component, OnInit } from '@angular/core';
import { IgxCsvExporterService, IgxExcelExporterService, IgxColumnComponent, DisplayDensity } from 'igniteui-angular';

@Component({
    selector: 'app-grid-toolbar-sample',
    styleUrls: ['grid-toolbar.sample.css'],
    templateUrl: 'grid-toolbar.sample.html'
})
export class GridToolbarSampleComponent implements OnInit {
    public showToolbar = true;
    public title = 'Custom Title';
    public customContent = false;
    public showProgress = false;
    public hidingEnabled = true;
    public pinningEnabled = true;
    public csv = true;
    public excel = true;

    public _displayDensity = [DisplayDensity.comfortable, DisplayDensity.cosy, DisplayDensity.compact];

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

    constructor() {
    }

    public ngOnInit() {
    }

    public toolbarExportClicked(obj) {
        obj.cancel = true;
        let exporter;
        switch (obj.type) {
            case 'excel' :
                exporter = obj.exporter as IgxExcelExporterService;
                // configure and perform export operation
                break;
            case 'csv' :
                exporter = obj.exporter as IgxCsvExporterService;
                // configure and perform export operation
                break;
        }
    }

    public initColumns(column: IgxColumnComponent) {
        column.filterable = true;
        column.sortable = true;
        column.editable = true;
        column.resizable = true;
        // column.pinned = true;
        // column.hidden = true;
        // column.width = '150';
        // column.hasSummary = true;
    }

}
