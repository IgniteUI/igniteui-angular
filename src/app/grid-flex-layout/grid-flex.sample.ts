import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-grid-flex-sample',
    styleUrls: ['grid-flex.sample.css'],
    templateUrl: 'grid-flex.sample.html'
})

export class GridFlexSampleComponent implements OnInit, AfterViewInit {
    public localData;
    @ViewChild('grid1', { static: true })
    grid1: IgxGridComponent;
    columns;

    constructor(){
    }

    ngOnInit() {
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
    ngAfterViewInit() {
        this.grid1.cdr.detectChanges();
        // this.remoteService.getData(this.grid3.data);
    }
}
