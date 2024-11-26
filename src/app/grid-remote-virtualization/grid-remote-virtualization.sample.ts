import { Component, ViewChild, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { RemoteService } from '../shared/remote.service';
import { IgxButtonDirective, IgxGridComponent } from 'igniteui-angular';

@Component({
    selector: 'app-grid-remote-virtualization-sample',
    templateUrl: 'grid-remote-virtualization.sample.html',
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

    constructor(private remoteService: RemoteService, public cdr: ChangeDetectorRef) {
        this.remoteService.urlBuilder = (dataState) => {
            let qS = '?'; let requiredChunkSize: number;
            if (dataState) {
                const skip = dataState.startIndex;

                requiredChunkSize = dataState.chunkSize === 0 ?
                    // Set initial chunk size, the best value is igxForContainerSize divided on igxForItemSize
                    12 : dataState.chunkSize;
                const top = requiredChunkSize;
                qS += `$skip=${skip}&$top=${top}&$count=true`;
            }
            return `${this.remoteService.url}${qS}`;
        };
    }

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
        this.remoteService.getData(this.grid.virtualizationState, () => {
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
        this.prevRequest = this.remoteService.getData(evt, () => {
            this.cdr.detectChanges();
        });
    }
}
