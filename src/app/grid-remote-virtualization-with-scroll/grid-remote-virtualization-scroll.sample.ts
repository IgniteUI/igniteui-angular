import { Component, ViewChild, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { IgxColumnComponent, IgxGridComponent } from 'igniteui-angular';
import { debounceTime } from 'rxjs/operators';
import { RemoteVirtService } from '../shared/remoteProductsData.service';
import { AsyncPipe } from '@angular/common';
import { IgxGridComponent as IgxGridComponent_1 } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';

@Component({
    selector: 'app-grid-remote-virtualization-scroll',
    templateUrl: 'grid-remote-virtualization-scroll.sample.html',
    providers: [RemoteVirtService],
    standalone: true,
    imports: [IgxGridComponent_1, AsyncPipe]
})

export class GridVirtualizationScrollSampleComponent implements OnInit, AfterViewInit {
    @ViewChild('grid1', { static: true })
    public grid: IgxGridComponent;

    public remoteData: any;
    public prevRequest: any;
    public columns: any;
    public loading = true;
    public areAllRowsSelected = false;

    public clipboardOptions = {
        enabled: true,
        copyHeaders: false,
        copyFormatters: true,
        separator: '\t'
    };
    constructor(private remoteService: RemoteVirtService, public cdr: ChangeDetectorRef) { }

    public ngOnInit(): void {
        this.remoteData = this.remoteService.data;
    }

    public onColumnInit(col: IgxColumnComponent) {
        col.editable = true;
    }

    public ngAfterViewInit() {
        this.grid.isLoading = true;

        this.remoteService.getData(this.grid.virtualizationState, this.grid.sortingExpressions[0], true, (data) => {
            this.grid.totalItemCount = data['@odata.count'];
            this.grid.isLoading = false;
        });

        this.grid.dataPreLoad.pipe(debounceTime(500)).subscribe(() => {
            this.processData(false);
        });

        this.grid.dataChanged.subscribe(() => {
            if (this.areAllRowsSelected) {
                this.grid.selectAllRows();
            }
        });

        this.grid.rowSelectionChanging.subscribe((args) => {
            this.areAllRowsSelected = args.allRowsSelected;
            if (args.allRowsSelected) {
                this.grid.selectAllRows();
            }
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
}
