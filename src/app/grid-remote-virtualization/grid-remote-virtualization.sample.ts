import { Component, ViewChild, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';

@Component({
    selector: 'app-grid-remote-virtualization-sample',
    templateUrl: 'grid-remote-virtualization.sample.html'
})

export class GridVirtualizationSampleComponent implements OnInit, AfterViewInit {

    public remoteData: any;
    public prevRequest: any;
    public columns: any;

    @ViewChild('grid1')
    public grid: IgxGridComponent;

    constructor(private remoteService: RemoteService, public cdr: ChangeDetectorRef) {
        this.remoteService.urlBuilder = (dataState) => {
            let qS = '?', requiredChunkSize: number;
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
        //this.remoteData = this.remoteService.remoteData;
    }

    public loadData() {
        this.grid.shouldGenerate = true;
        this.remoteData = this.remoteService.remoteData;
    }

    public ngAfterViewInit() {
        this.remoteService.getData(this.grid.virtualizationState, (data) => {
            this.grid.totalItemCount = data['@odata.count'];
        });
    }

    dataLoading(evt) {
        if (this.prevRequest) {
            this.prevRequest.unsubscribe();
        }
        this.prevRequest = this.remoteService.getData(evt, () => {
            this.cdr.detectChanges();
        });
    }
}
