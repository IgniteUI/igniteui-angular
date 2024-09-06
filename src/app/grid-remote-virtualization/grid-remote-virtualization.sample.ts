import { Component, ViewChild, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { RemoteService } from '../shared/remote.service';
import { IgxButtonDirective, IgxGridComponent } from 'igniteui-angular';

@Component({
    selector: 'app-grid-remote-virtualization-sample',
    templateUrl: 'grid-remote-virtualization.sample.html',
    standalone: true,
    providers: [RemoteService],
    imports: [IgxGridComponent, IgxButtonDirective, AsyncPipe]
})
export class GridVirtualizationSampleComponent implements OnInit, AfterViewInit {
    @ViewChild('grid1', { static: true })
    public grid: IgxGridComponent;

    public remoteData: any;
    public prevRequest: any;
    public columns: any;
    public loading = true;

    constructor(private remoteService: RemoteService, public cdr: ChangeDetectorRef) { }

    public ngOnInit(): void {
        this.columns = [
            { field: 'ProductID', width: '100px' },
            { field: 'ProductName', width: '200px' },
            { field: 'UnitPrice', width: '100px' },
            { field: 'UnitsInStock', width: '50px' },
            { field: 'QuantityPerUnit', width: '200px' },
            { field: 'Discontinued', width: '50px' }
        ];
        // this.remoteData = this.remoteService.remoteData;
    }

    public loadData() {
        const state = this.grid.virtualizationState;
        this.grid.shouldGenerate = true;
        this.remoteService.getData(state.startIndex, state.chunkSize, null, () => {
            this.remoteData = this.remoteService.remoteData;
        });
    }

    public loadNullData() {
        this.remoteService.nullData();
        this.remoteData = this.remoteService.remoteData;
    }

    public loadUndefinedData() {
        this.remoteService.undefinedData();
        this.remoteData = this.remoteService.remoteData;
    }

    public toggleLoading() {
        this.loading = !this.loading;
        this.grid.cdr.markForCheck();
    }

    public ngAfterViewInit() {
        this.remoteService.nullData();
        this.remoteData = this.remoteService.remoteData;
    }

    public dataLoading(evt) {
        if (this.prevRequest) {
            this.prevRequest.unsubscribe();
        }
        this.prevRequest = this.remoteService.getData(evt.startIndex, evt.chunkSize, null, () => {
            this.cdr.detectChanges();
        });
    }
}
