import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgxCSVTextDirective, IgxColumnComponent, IgxCsvExporterService, IgxExcelExporterService, IgxExcelTextDirective, IgxGridComponent, IgxGridToolbarActionsComponent, IgxGridToolbarAdvancedFilteringComponent, IgxGridToolbarComponent, IgxGridToolbarExporterComponent, IgxGridToolbarHidingComponent, IgxGridToolbarPinningComponent, IgxGridToolbarTitleComponent, IgxSwitchComponent } from 'igniteui-angular';

@Component({
    selector: 'app-grid-toolbar-sample',
    styleUrls: ['grid-toolbar.sample.scss'],
    templateUrl: 'grid-toolbar.sample.html',
    imports: [IgxGridComponent, NgIf, IgxGridToolbarComponent, IgxGridToolbarTitleComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxGridToolbarAdvancedFilteringComponent, IgxGridToolbarExporterComponent, IgxExcelTextDirective, IgxCSVTextDirective, IgxSwitchComponent, FormsModule]
})
export class GridToolbarSampleComponent {
    public showToolbar = true;
    public title = 'Custom Title';
    public customContent = false;
    public showProgress = false;
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

    constructor() {
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
