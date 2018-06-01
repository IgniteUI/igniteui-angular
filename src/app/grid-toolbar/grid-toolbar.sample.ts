import { Component, OnInit, ViewChild  } from '@angular/core';
import { IgxGridComponent, IgxCsvExporterService, IgxExcelExporterService } from 'igniteui-angular';

@Component({
    selector: 'app-grid-toolbar-sample',
    styleUrls: ['grid-toolbar.sample.css'],
    templateUrl: 'grid-toolbar.sample.html'
})
export class GridToolbarSampleComponent implements OnInit {
    
    @ViewChild("grid1", { read: IgxGridComponent })
    public igxGrid1: IgxGridComponent;
  
    data = [
        {
            Name: "Alice",
            Age: 25
        },
        {
            Name: "Bob",
            Age: 23
        }
    ];

    constructor() {
    }
    
    ngOnInit() {
    }

    toolbarExportClicked(obj) {
        obj.cancel = true;
        let exporter;
        switch (obj.type) {
            case "excel" :
                exporter = obj.exporter as IgxExcelExporterService
                // configure and perform export operation
                break;
            case "csv" :
                exporter = obj.exporter as IgxCsvExporterService;
                // configure and perform export operation
                break;
        }
    }

}
