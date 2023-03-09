import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { NgFor } from '@angular/common';

import { IgxTreeGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/tree-grid/tree-grid.component';
import { IgxRowIslandComponent } from '../../../projects/igniteui-angular/src/lib/grids/hierarchical-grid/row-island.component';
import { IgxHierarchicalGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/hierarchical-grid/hierarchical-grid.component';
import { IgxPaginatorComponent } from '../../../projects/igniteui-angular/src/lib/paginator/paginator.component';
import { IgxColumnComponent } from '../../../projects/igniteui-angular/src/lib/grids/columns/column.component';
import { IgxGridToolbarHidingComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-hiding.component';
import { IgxGridToolbarPinningComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-pinning.component';
import { IgxGridToolbarActionsComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/common';
import { IgxGridToolbarComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar.component';
import { IgxGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';
import { IgxLayoutDirective, IgxFlexDirective } from '../../../projects/igniteui-angular/src/lib/directives/layout/layout.directive';

@Component({
    providers: [],
    selector: 'app-grid-flex-sample',
    styleUrls: ['grid-flex.sample.css'],
    templateUrl: 'grid-flex.sample.html',
    standalone: true,
    imports: [IgxLayoutDirective, IgxFlexDirective, IgxGridComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, NgFor, IgxColumnComponent, IgxPaginatorComponent, IgxHierarchicalGridComponent, IgxRowIslandComponent, IgxTreeGridComponent]
})

export class GridFlexSampleComponent implements OnInit, AfterViewInit {
    @ViewChild('grid1', { static: true })
    private grid1: IgxGridComponent;

    public localData;
    public columns;

    constructor() {
    }

    public ngOnInit() {
        const data = [];
        for (let i = 0; i < 20; i++) {
            data.push(  { ID: i, Name: 'A' + i });
        }
        this.localData = data;

        this.columns = [
            { field: 'ID', width: 800, resizable: true, maxWidth: 1000, minWidth: 70 },
            { field: 'Name', width: 800, resizable: true, maxWidth: 1000, minWidth: 70 }
        ];
    }
    public ngAfterViewInit() {
        this.grid1.cdr.detectChanges();
        // this.remoteService.getData(this.grid3.data);
    }
}
