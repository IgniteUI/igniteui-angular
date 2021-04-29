import { Component, ViewChild, OnInit } from '@angular/core';
import { FilterMode, IgxGridComponent } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-grid-column-types-sample',
    templateUrl: 'grid-column-types.sample.html'
})

export class GridColumnTypesSampleComponent implements OnInit {
    @ViewChild('grid1', { static: true }) public grid1: IgxGridComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public newIndex = 0;
    public gridMCHNewIndex = 0;
    public filterMode: FilterMode = FilterMode.quickFilter;
    public filterModes;

    public log(event) {
        console.log(event);
    }

    public ngOnInit(): void {
        this.filterModes = [
            { label: 'quickFilter', selected: this.filterMode === FilterMode.quickFilter, togglable: true },
            { label: 'excelStyleFilter', selected: this.filterMode === FilterMode.excelStyleFilter, togglable: true }
        ];

        this.data = SAMPLE_DATA;

        this.columns = [
            { field: 'ID', width: 150, resizable: true, movable: true, sortable: false, filterable: true, groupable: true,
                summary: true, type: 'string', pinned: false },
            { field: 'CompanyName', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'},
            { field: 'Employees', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true,
                summary: false, type: 'number' },
            { field: 'DateCreated', width: 150, resizable: true, pinned: false, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'dateTime' },
            { field: 'Time', width: 150, resizable: true, pinned: false, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'time' },
            { field: 'Discount', width: 150, resizable: true, pinned: false, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'percent' },
            { field: 'Contract', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'boolean' },
            { field: 'ContactName', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string' },
            { field: 'ContactTitle', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string' },
            { field: 'Address', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string' },
            { field: 'City', width: 150, resizable: true, movable: true, sortable: false, filterable: false, groupable: true,
                summary: true, type: 'string' },
            { field: 'Phone', width: 150, resizable: true, movable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string', pinned: false }
        ];
    }

    public selectDensity(event) {
        this.filterMode = this.filterModes[event.index].label;
    }

    public moveColumn() {
        const col = this.grid1.selectedColumns()[0];
        col.move(this.newIndex);
    }


    public toggleColumn(name: string) {
        const col = this.grid1.getColumnByName(name);
        col.pinned = !col.pinned;
    }
}
