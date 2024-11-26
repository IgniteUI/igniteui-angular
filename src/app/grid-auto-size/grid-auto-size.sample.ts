import { Component, ViewChild, OnInit, HostBinding } from '@angular/core';
import { NgFor } from '@angular/common';

import { SAMPLE_DATA } from '../shared/sample-data';
import { GridSelectionMode, IgxGridComponent, IGX_BUTTON_GROUP_DIRECTIVES, IGX_GRID_DIRECTIVES } from 'igniteui-angular';

@Component({
    providers: [],
    selector: 'app-grid-column-moving-sample',
    styleUrls: ['grid-auto-size.sample.scss'],
    templateUrl: 'grid-auto-size.sample.html',
    imports: [NgFor, IGX_GRID_DIRECTIVES, IGX_BUTTON_GROUP_DIRECTIVES]
})

export class GridAutoSizeSampleComponent implements OnInit {
    @ViewChild('grid1', { static: true })
    private grid1: IgxGridComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public size : "large" | "medium" | "small" = "large";
    public sizes;
    public height = '100%';
    public gridContainerHidden = false;
    public containerHeight;
    public selectionMode;
    public ngOnInit(): void {
        this.sizes = [
            { label: 'large', selected: this.size === "large", togglable: true },
            { label: 'medium', selected: this.size === "medium", togglable: true },
            { label: 'small', selected: this.size === "small", togglable: true }
        ];

        this.grid1.moving = true;
        // this.data = SAMPLE_DATA.slice(0);

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
        this.selectionMode = GridSelectionMode.multiple;
    }

    public selectDensity(event) {
        this.size = this.sizes[event.index].label;
    }

    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return `var(--ig-size-${this.size})`;
    }

    public checkCols(): void {
        const columns = this.grid1.columns;
        columns.forEach(c => console.log(c.width));
    }


    public setData(count?) {
        this.data = SAMPLE_DATA.slice(0, count);
    }
}
