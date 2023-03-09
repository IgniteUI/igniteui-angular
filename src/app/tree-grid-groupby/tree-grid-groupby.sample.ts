import { Component, ViewChild, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IgxGroupedTreeGridSorting, ITreeGridAggregation } from 'projects/igniteui-angular/src/lib/grids/tree-grid/tree-grid.grouping.pipe';
import { SAMPLE_DATA } from '../shared/sample-data';
import { IgxTreeGridGroupingPipe } from '../../../projects/igniteui-angular/src/lib/grids/tree-grid/tree-grid.grouping.pipe';
import { IgxColumnComponent } from '../../../projects/igniteui-angular/src/lib/grids/columns/column.component';
import { IgxTreeGridGroupByAreaComponent } from '../../../projects/igniteui-angular/src/lib/grids/grouping/tree-grid-group-by-area.component';
import { IgxTreeGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/tree-grid/tree-grid.component';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxButtonGroupComponent } from '../../../projects/igniteui-angular/src/lib/buttonGroup/buttonGroup.component';
import { DisplayDensity } from '../../../projects/igniteui-angular/src/lib/core/displayDensity';
import { IGroupingExpression } from '../../../projects/igniteui-angular/src/lib/data-operations/grouping-expression.interface';
import { DefaultSortingStrategy } from '../../../projects/igniteui-angular/src/lib/data-operations/sorting-strategy';
import { ITreeGridRecord, TreeGridFilteringStrategy } from '../../../projects/igniteui-angular/src/lib/grids/tree-grid/public_api';
import { GridSelectionMode } from '../../../projects/igniteui-angular/src/lib/grids/common/enums';

@Component({
    providers: [],
    selector: 'app-tree-grid-groupby-sample',
    styleUrls: ['tree-grid-groupby.sample.css'],
    templateUrl: 'tree-grid-groupby.sample.html',
    standalone: true,
    imports: [IgxButtonGroupComponent, NgIf, IgxSwitchComponent, FormsModule, IgxTreeGridComponent, IgxTreeGridGroupByAreaComponent, IgxColumnComponent, NgFor, IgxTreeGridGroupingPipe]
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
    public childDataKey = 'ChildCompanies';
    public sorting = IgxGroupedTreeGridSorting.instance();
    public filteringStrategy = new TreeGridFilteringStrategy([this.groupKey]);

    public employeeAggregations: ITreeGridAggregation[] = [{
        field: 'Employees',
        aggregate: (parent: ITreeGridRecord, children: any[]) => children.map((c) => c.Employees).reduce((sum, n) => sum + n, 0)
    }];

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
        this.density = this.displayDensities[event.index].label;
    }

    public cellEditDone() {
        this.groupingExpressions = [...this.groupingExpressions]; // will trigger grouping pipe
    }
}
