
import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxGridToolbarExporterComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-exporter.component';
import { IgxGridToolbarAdvancedFilteringComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-advanced-filtering.component';
import { IgxGridToolbarHidingComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-hiding.component';
import { IgxGridToolbarPinningComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-pinning.component';
import { IgxGridToolbarActionsComponent, IgxExcelTextDirective, IgxCSVTextDirective } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/common';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxRippleDirective } from '../../../projects/igniteui-angular/src/lib/directives/ripple/ripple.directive';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxGridToolbarComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar.component';
import { IgxGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';
import { IgxColumnComponent } from '../../../projects/igniteui-angular/src/lib/grids/public_api';

@Component({
    selector: 'app-grid-toolbar-custom-sample',
    styleUrls: ['grid-toolbar-custom.sample.scss'],
    templateUrl: 'grid-toolbar-custom.sample.html',
    standalone: true,
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
