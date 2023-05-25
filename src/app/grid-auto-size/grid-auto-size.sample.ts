import { Component, ViewChild, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';

import { SAMPLE_DATA } from '../shared/sample-data';
import { IgxColumnComponent } from '../../../projects/igniteui-angular/src/lib/grids/columns/column.component';
import { IgxGridToolbarHidingComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-hiding.component';
import { IgxGridToolbarPinningComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-pinning.component';
import { IgxGridToolbarActionsComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/common';
import { IgxGridToolbarComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar.component';
import { IgxGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxButtonGroupComponent } from '../../../projects/igniteui-angular/src/lib/buttonGroup/buttonGroup.component';
import { DisplayDensity } from '../../../projects/igniteui-angular/src/lib/core/density';
import { GridSelectionMode } from '../../../projects/igniteui-angular/src/lib/grids/common/enums';

@Component({
    providers: [],
    selector: 'app-grid-column-moving-sample',
    styleUrls: ['grid-auto-size.sample.scss'],
    templateUrl: 'grid-auto-size.sample.html',
    standalone: true,
    imports: [IgxButtonGroupComponent, IgxButtonDirective, IgxGridComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, NgFor, IgxColumnComponent]
})

export class GridAutoSizeSampleComponent implements OnInit {
    @ViewChild('grid1', { static: true })
    private grid1: IgxGridComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public density: DisplayDensity = 'comfortable';
    public displayDensities;
    public height = '100%';
    public gridContainerHidden = false;
    public containerHeight;
    public selectionMode;

    public ngOnInit(): void {
        this.displayDensities = [
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'compact', selected: this.density === 'compact', togglable: true }
        ];

        this.grid1.moving = true;
        // this.data = SAMPLE_DATA.slice(0);

        /* eslint-disable max-len */
        this.columns = [
            { field: 'ID', width: 'auto', resizable: true, sortable: false, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'CompanyName', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string'},
            { field: 'ContactName', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'ContactTitle', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'Address', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'City', width: 'auto', resizable: true, sortable: false, filterable: false, groupable: true, summary: true, type: 'string' },
            { field: 'Region', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'PostalCode', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'Phone', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'Fax', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'Employees', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: false, type: 'number' },
            { field: 'DateCreated', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: false, type: 'date' },
            { field: 'Contract', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'boolean' }
        ];
        /* eslint-enable max-len */
        this.selectionMode = GridSelectionMode.multiple;
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    public checkCols(): void {
        const columns = this.grid1.columns;
        columns.forEach(c => console.log(c.width));
    }


    public setData(count?) {
        this.data = SAMPLE_DATA.slice(0, count);
    }
}
