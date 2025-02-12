import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { IgxColumnComponent, IgxFlexDirective, IgxGridComponent, IgxGridToolbarActionsComponent, IgxGridToolbarComponent, IgxGridToolbarHidingComponent, IgxGridToolbarPinningComponent, IgxHierarchicalGridComponent, IgxLayoutDirective, IgxPaginatorComponent, IgxRowIslandComponent, IgxTreeGridComponent } from 'igniteui-angular';


@Component({
    providers: [],
    selector: 'app-grid-flex-sample',
    styleUrls: ['grid-flex.sample.scss'],
    templateUrl: 'grid-flex.sample.html',
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
