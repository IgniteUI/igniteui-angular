
import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgxButtonDirective, IgxCSVTextDirective, IgxColumnComponent, IgxExcelTextDirective, IgxGridComponent, IgxGridToolbarActionsComponent, IgxGridToolbarAdvancedFilteringComponent, IgxGridToolbarComponent, IgxGridToolbarExporterComponent, IgxGridToolbarHidingComponent, IgxGridToolbarPinningComponent, IgxIconComponent, IgxRippleDirective, IgxSwitchComponent } from 'igniteui-angular';


@Component({
    selector: 'app-grid-toolbar-custom-sample',
    styleUrls: ['grid-toolbar-custom.sample.scss'],
    templateUrl: 'grid-toolbar-custom.sample.html',
    imports: [IgxGridComponent, NgIf, IgxGridToolbarComponent, IgxButtonDirective, IgxRippleDirective, IgxIconComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxGridToolbarAdvancedFilteringComponent, IgxGridToolbarExporterComponent, IgxExcelTextDirective, IgxCSVTextDirective, IgxSwitchComponent, FormsModule]
})
export class GridToolbarCustomSampleComponent {
    public showToolbar = true;
    public columnHiding = true;
    public columnPinning = true;
    public exportExcel = true;
    public exportCsv = true;
    public toolbarTitle = 'Grid Toolbar';

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
