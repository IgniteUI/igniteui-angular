import { Component, ViewChild, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';
import { debounceTime } from 'rxjs/operators';
import { RemoteService } from '../shared/remote.service';
import { RemoteVirtService } from '../shared/remoteProductsData.service';

@Component({
    selector: 'app-grid-remote-virtualization-scroll',
    templateUrl: 'grid-remote-virtualization-scroll.sample.html',
    providers: [RemoteVirtService, RemoteService]
})

export class GridVirtualizationScrollSampleComponent implements OnInit, AfterViewInit {

    public remoteData: any;
    public prevRequest: any;
    public columns: any;
    public loading = true;

    @ViewChild('grid1', { static: true })
    public grid: IgxGridComponent;

    public clipboardOptions = {
        enabled: true,
        copyHeaders: false,
        copyFormatters: true,
        separator: '\t'
    };
    constructor(
        private remoteService: RemoteVirtService,
        private rs: RemoteService,
        public cdr: ChangeDetectorRef
    ) { }

    public ngOnInit(): void {
        this.remoteData = this.remoteService.data;
    }

    public ngAfterViewInit() {
        this.grid.isLoading = true;

        this.remoteService.getData(this.grid.virtualizationState, this.grid.sortingExpressions[0], true, (data) => {
            this.grid.totalItemCount = data['@odata.count'];
            this.grid.isLoading = false;
        });

        this.grid.onDataPreLoad.pipe(debounceTime(500)).subscribe(() => {
            this.processData(false);
        });
    }

    public handlePreLoad() {
        if (this.remoteService.hasItemsInCache(this.grid.virtualizationState)) {
            this.processData(false);
        }
    }

    public processData(reset) {
        if (this.prevRequest) {
            this.prevRequest.unsubscribe();
        }
        this.prevRequest = this.remoteService.getData(this.grid.virtualizationState,
            this.grid.sortingExpressions[0], reset, () => {
                this.cdr.detectChanges();
            });
    }

    public a(): void {
        this.remoteData = this.rs.remoteData;
        this.remoteData = this.remoteService.data;
    }
}
