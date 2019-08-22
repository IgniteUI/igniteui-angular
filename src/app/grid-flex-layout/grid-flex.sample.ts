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

    constructor(){
    }

    ngOnInit() {
        this.localData = [
            { ID: 1, Name: 'A' },
            { ID: 2, Name: 'B' },
            { ID: 3, Name: 'C' },
            { ID: 4, Name: 'D' },
            { ID: 5, Name: 'E' }
        ];
    }
    ngAfterViewInit() {
        this.grid1.cdr.detectChanges();
        // this.remoteService.getData(this.grid3.data);
    }
}
