import { Component, ViewChild, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { FilterMode, IgxButtonGroupComponent, IgxColumnComponent, IgxGridComponent, IgxGridToolbarActionsComponent, IgxGridToolbarAdvancedFilteringComponent, IgxGridToolbarComponent, IgxGridToolbarHidingComponent, IgxGridToolbarPinningComponent, IgxIconService } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-grid-column-types-sample',
    styleUrls: ['grid-column-types.sample.scss'],
    templateUrl: 'grid-column-types.sample.html',
    imports: [IgxButtonGroupComponent, IgxGridComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxGridToolbarAdvancedFilteringComponent, NgFor, IgxColumnComponent]
})
export class GridColumnTypesSampleComponent implements OnInit {
    @ViewChild('grid1', { static: true }) public grid1: IgxGridComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public newIndex = 0;
    public gridMCHNewIndex = 0;
    public filterMode: FilterMode = FilterMode.quickFilter;
    public filterModes;
    public dataWithImages = [{
        avatar: 'assets/images/avatar/1.jpg',
        phone: '770-504-2217',
        text: 'Terrance Orta',
        available: false
    }, {
        avatar: 'assets/images/avatar/2.jpg',
        phone: '423-676-2869',
        text: 'Richard Mahoney',
        available: true
    }, {
        avatar: 'assets/images/avatar/3.jpg',
        phone: '859-496-2817',
        text: 'Donna Price',
        available: true
    }, {
        avatar: 'assets/images/avatar/4.jpg',
        phone: '901-747-3428',
        text: 'Lisa Landers',
        available: true
    }, {
        avatar: 'assets/images/avatar/12.jpg',
        phone: '573-394-9254',
        text: 'Dorothy H. Spencer',
        available: true
    }, {
        avatar: 'assets/images/avatar/13.jpg',
        phone: '323-668-1482',
        text: 'Stephanie May',
        available: false
    }, {
        avatar: 'assets/images/avatar/14.jpg',
        phone: '401-661-3742',
        text: 'Marianne Taylor',
        available: true
    }];

    constructor(private _iconService: IgxIconService) {
    }

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
            { field: 'ID', width: 150, resizable: true, sortable: false, filterable: true, groupable: true,
                summary: true, type: 'string', pinned: false },
            { field: 'CompanyName', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'},
            { field: 'Employees', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: false, type: 'number' },
            { field: 'DateCreated', width: 150, resizable: true, pinned: false, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'dateTime' },
            { field: 'Time', width: 150, resizable: true, pinned: false, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'time' },
            { field: 'Discount', width: 150, resizable: true, pinned: false, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'percent' },
            { field: 'Contract', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'boolean' },
            { field: 'ContactName', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string' },
            { field: 'ContactTitle', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string' },
            { field: 'Address', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string' },
            { field: 'City', width: 150, resizable: true, sortable: false, filterable: false, groupable: true,
                summary: true, type: 'string' },
            { field: 'Phone', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string', pinned: false }
        ];

        this._iconService.setIconRef("contains", "default", {
            family: "fa-solid",
            name: "fa-car",
        });
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
