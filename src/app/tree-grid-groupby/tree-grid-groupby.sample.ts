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
        { fieldName: 'Country', dir: 2, ignoreCase: true, strategy: DefaultSortingStrategy.instance() }
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
            { dataType: 'string', field: 'ID', width: 100, hidden: true },
            { dataType: 'string', field: 'CompanyName', width: 200, groupable: true },
            { dataType: 'number', field: 'Employees', width: 150 },
            { dataType: 'string', field: 'ContactTitle', width: 200, groupable: true },
            { dataType: 'string', field: 'Address', width: 300, groupable: true },
            { dataType: 'string', field: 'Country', width: 150, groupable: true },
            { dataType: 'string', field: 'City', width: 150, groupable: true },
            { dataType: 'string', field: 'PostalCode', width: 150, groupable: true },
            { dataType: 'string', field: 'Phone', width: 150, groupable: true },
            { dataType: 'string', field: 'Fax', width: 150, groupable: true }
        ];
        this.data = SAMPLE_DATA.slice(0);
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }
}
