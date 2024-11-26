import { Component, ViewChild, OnInit, HostBinding } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SAMPLE_DATA } from '../shared/sample-data';
import { IgxButtonGroupComponent, IgxSwitchComponent, IgxTreeGridComponent, IgxTreeGridGroupByAreaComponent, IgxColumnComponent, IgxTreeGridGroupingPipe, IGroupingExpression, DefaultSortingStrategy, IgxGroupedTreeGridSorting, TreeGridFilteringStrategy, ITreeGridAggregation, ITreeGridRecord, GridSelectionMode } from 'igniteui-angular';


@Component({
    providers: [],
    selector: 'app-tree-grid-groupby-sample',
    styleUrls: ['tree-grid-groupby.sample.scss'],
    templateUrl: 'tree-grid-groupby.sample.html',
    imports: [IgxButtonGroupComponent, NgIf, IgxSwitchComponent, FormsModule, IgxTreeGridComponent, IgxTreeGridGroupByAreaComponent, IgxColumnComponent, NgFor, IgxTreeGridGroupingPipe]
})

export class TreeGridGroupBySampleComponent implements OnInit {
    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return `var(--ig-size-${this.size})`;
    }
    @ViewChild('grid1', { static: true }) public grid1: IgxTreeGridComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public selectionMode;
    public size = 'large';
    public sizes;
    public groupingExpressions: IGroupingExpression[] = [
        { fieldName: 'ContactTitle', dir: 1, ignoreCase: true, strategy: DefaultSortingStrategy.instance() },
        { fieldName: 'Country', dir: 2, ignoreCase: true, strategy: DefaultSortingStrategy.instance() }
    ];
    public groupKey = 'Groups';
    public childDataKey = 'ChildCompanies';
    public sorting = IgxGroupedTreeGridSorting.instance();
    public filteringStrategy = new TreeGridFilteringStrategy([this.groupKey]);

    public employeeAggregations: ITreeGridAggregation[] = [{
        field: 'Employees',
        aggregate: (parent: ITreeGridRecord, children: any[]) => children.map((c) => c.Employees).reduce((sum, n) => sum + n, 0)
    }];

    public ngOnInit(): void {
        this.selectionMode = GridSelectionMode.multiple;
        this.sizes = [
            { label: 'small', selected: this.size === 'small', togglable: true },
            { label: 'medium', selected: this.size === 'medium', togglable: true },
            { label: 'large', selected: this.size === 'large', togglable: true }
        ];

        this.columns = [
            { dataType: 'string', field: 'ID', width: 100, hidden: true },
            { dataType: 'string', field: 'CompanyName', width: 200, groupable: true },
            { dataType: 'date', field: 'DateCreated', width: 150, groupable: true },
            { dataType: 'number', field: 'Employees', width: 150 },
            { dataType: 'string', field: 'ContactTitle', width: 200, groupable: true },
            { dataType: 'string', field: 'Address', width: 300, groupable: true },
            { dataType: 'string', field: 'Country', width: 150, groupable: true },
            { dataType: 'string', field: 'City', width: 150, groupable: true },
            { dataType: 'string', field: 'PostalCode', width: 150, groupable: true },
            { dataType: 'string', field: 'Phone', width: 150, groupable: true }
        ];
        this.data = SAMPLE_DATA.slice(0);
    }

    public print() {
        console.log('Sorting: ', this.grid1.sortingExpressions);
        console.log('Grouping: ', this.grid1.treeGroupArea, this.groupingExpressions);
    }
    public selectDensity(event) {
        this.size = this.sizes[event.index].label;
    }

    public cellEditDone() {
        this.groupingExpressions = [...this.groupingExpressions]; // will trigger grouping pipe
    }
}
