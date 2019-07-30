import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-grid-column-moving-sample',
    styleUrls: ['grid-column-moving.sample.css'],
    templateUrl: 'grid-column-moving.sample.html'
})

export class GridColumnMovingSampleComponent implements OnInit {

    public data: Array<any>;
    public columns: Array<any>;

    @ViewChild('grid1', { static: true }) public grid1: IgxGridComponent;
    public density = 'comfortable';
    public displayDensities;

    log(event) {
        console.log(event);
    }

    public ngOnInit(): void {
        this.displayDensities = [
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'compact', selected: this.density === 'compact', togglable: true }
        ];

        this.data = SAMPLE_DATA.slice(0);

        this.columns = [
            { field: 'ID', width: 150, resizable: true, movable: true, sortable: false, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'CompanyName', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string'},
            { field: 'ContactName', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'ContactTitle', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'Address', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'City', width: 150, resizable: true, movable: true, sortable: false, filterable: false, groupable: true, summary: true, type: 'string' },
            { field: 'Region', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'PostalCode', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'Phone', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'Fax', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'Employees', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: false, type: 'number' },
            { field: 'DateCreated', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: false, type: 'date' },
            { field: 'Contract', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'boolean' }
        ];
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    toggleColumn(name: string) {
        const col = this.grid1.getColumnByName(name);
        col.pinned ? col.pinned = false : col.pinned = true;
    }

    onColumnMovingStart(event) {

    }

    onColumnMoving(event) {
        // if (event.target.field === 'ID') {
        //     event.cancel = true;
        // }
    }

    onColumnMovingEnd(event) {
        // if (event.target.field === 'Fax') {
        //     event.cancel = true;
        // }
    }
}
