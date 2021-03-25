import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxGridComponent, GridSelectionMode, DisplayDensity } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-grid-column-moving-sample',
    styleUrls: ['grid-auto-size.sample.css'],
    templateUrl: 'grid-auto-size.sample.html'
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

        // this.data = SAMPLE_DATA.slice(0);

        /* eslint-disable max-len */
        this.columns = [
            { field: 'ID', width: '25%', resizable: true, movable: true, sortable: false, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'CompanyName', width: '25%', resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string'},
            { field: 'ContactName', width: '25%', resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
            { field: 'ContactTitle', width: '25%', resizable: true, movable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
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
