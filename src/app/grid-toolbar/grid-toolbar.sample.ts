import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxGridToolbarExporterComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-exporter.component';
import { IgxGridToolbarAdvancedFilteringComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-advanced-filtering.component';
import { IgxGridToolbarHidingComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-hiding.component';
import { IgxGridToolbarPinningComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-pinning.component';
import { IgxGridToolbarTitleComponent, IgxGridToolbarActionsComponent, IgxExcelTextDirective, IgxCSVTextDirective } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/common';
import { IgxGridToolbarComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar.component';
import { IgxGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';
import { DisplayDensity } from '../../../projects/igniteui-angular/src/lib/core/displayDensity';
import { IgxCsvExporterService, IgxExcelExporterService } from '../../../projects/igniteui-angular/src/lib/services/public_api';
import { IgxColumnComponent } from '../../../projects/igniteui-angular/src/lib/grids/public_api';

@Component({
    selector: 'app-grid-toolbar-sample',
    styleUrls: ['grid-toolbar.sample.scss'],
    templateUrl: 'grid-toolbar.sample.html',
    standalone: true,
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
