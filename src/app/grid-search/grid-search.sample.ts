import { Component, ViewChild, OnInit, HostBinding } from '@angular/core';
import { NgFor } from '@angular/common';


import { SAMPLE_DATA } from '../shared/sample-data';
import { GridSelectionMode, IGX_BUTTON_GROUP_DIRECTIVES, IGX_GRID_DIRECTIVES, IgxGridComponent } from 'igniteui-angular';
import { GridSearchBoxComponent } from '../grid-search-box/grid-search-box.component';

@Component({
    providers: [],
    selector: 'app-grid-search-sample',
    styleUrls: ['grid-search.sample.scss'],
    templateUrl: 'grid-search.sample.html',
    imports: [NgFor, IGX_GRID_DIRECTIVES, IGX_BUTTON_GROUP_DIRECTIVES, GridSearchBoxComponent]
})

export class GridSearchComponent implements OnInit {
    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return `var(--ig-size-${this.size})`;
    }
    @ViewChild('grid1', { static: true }) public grid1: IgxGridComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public sizes;
    public size = 'large';
    public selectionMode;

    public ngOnInit(): void {
        this.selectionMode = GridSelectionMode.multiple;
        this.sizes = [
            { label: 'large', selected: this.size === 'large', togglable: true },
            { label: 'medium', selected: this.size === 'medium', togglable: true },
            { label: 'small', selected: this.size === 'small', togglable: true }
        ];

        this.columns = [
            { field: 'ID', width: 80, resizable: true },
            { field: 'CompanyName', width: 150, resizable: true, type: 'string'},
            { field: 'ContactName', width: 150, resizable: true, type: 'string' },
            { field: 'Employees', width: 150, resizable: true, type: 'number' },
            { field: 'ContactTitle', width: 150, resizable: true, type: 'string' },
            { field: 'DateCreated', width: 150, resizable: true, type: 'date' },
            { field: 'Address', width: 150, resizable: true, type: 'string' },
            { field: 'City', width: 150, resizable: true, type: 'string' },
            { field: 'Region', width: 150, resizable: true, type: 'string' },
            { field: 'PostalCode', width: 150, resizable: true, type: 'string' },
            { field: 'Phone', width: 150, resizable: true, type: 'string' },
            { field: 'Fax', width: 150, resizable: true, type: 'string' },
            { field: 'Contract', width: 150, resizable: true, type: 'boolean' }
        ];
        this.data = SAMPLE_DATA;
    }

    public selectDensity(event) {
        this.size = this.sizes[event.index].label;
    }

    public toggleColumn(name: string) {
        const col = this.grid1.getColumnByName(name);
        col.pinned = !col.pinned;
    }
}
