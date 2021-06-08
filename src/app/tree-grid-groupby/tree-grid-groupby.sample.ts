import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxTreeGridComponent, IGroupingExpression,  GridSelectionMode, DisplayDensity, DefaultSortingStrategy } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-tree-grid-groupby-sample',
    styleUrls: ['tree-grid-groupby.sample.css'],
    templateUrl: 'tree-grid-groupby.sample.html'
})

export class TreeGridGroupBySampleComponent implements OnInit {
    @ViewChild('grid1', { static: true }) public grid1: IgxTreeGridComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public selectionMode;
    public density: DisplayDensity = 'comfortable';
    public displayDensities;
    public groupingExpressions: IGroupingExpression[] = [
        { fieldName: 'ContactTitle', dir: 1, ignoreCase: true, strategy: DefaultSortingStrategy.instance() },
    ];
    public groupKey = 'Groups';
    public primaryKey = 'Groups';
    public childDataKey = 'ChildCompanies';

    public ngOnInit(): void {
        this.selectionMode = GridSelectionMode.multiple;
        this.displayDensities = [
            { label: 'compact', selected: this.density === 'compact', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true }
        ];

        this.columns = [
            { field: 'ID', width: 150, resizable: true, movable: true },
            { field: 'CompanyName', width: 150, resizable: true, movable: true },
            { field: 'ContactName', width: 150, resizable: true, movable: true },
            { field: 'ContactTitle', width: 150, resizable: true, movable: true },
            { field: 'Address', width: 150, resizable: true, movable: true },
            { field: 'City', width: 150, resizable: true, movable: true },
            { field: 'Region', width: 150, resizable: true, movable: true },
            { field: 'PostalCode', width: 150, resizable: true, movable: true },
            { field: 'Phone', width: 150, resizable: true, movable: true },
            { field: 'Fax', width: 150, resizable: true, movable: true }
        ];
        this.data = SAMPLE_DATA.slice(0);
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }
}
