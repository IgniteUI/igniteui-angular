import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Observable, takeUntil } from 'rxjs';

import { RemoteService } from 'src/app/shared/remote.service';
import { IForOfState, IgxButtonDirective, IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective, IgxForOfDirective, IgxToastComponent, IgxToggleActionDirective, VerticalAlignment } from 'igniteui-angular';

interface DataItem {
    name: string;
    id: number;
}
@Component({
    selector: 'app-drop-down-virtual',
    templateUrl: './drop-down-virtual.component.html',
    styleUrls: ['./drop-down-virtual.component.scss'],
    standalone: true,
    providers: [RemoteService],
    imports: [IgxButtonDirective, IgxToggleActionDirective, IgxDropDownItemNavigationDirective, IgxDropDownComponent, IgxForOfDirective, IgxDropDownItemComponent, IgxToastComponent, AsyncPipe]
})
export class DropDownVirtualComponent implements OnInit, AfterViewInit {
    @ViewChild('loadingToast', { read: IgxToastComponent, static: true })
    public loadingToast: IgxToastComponent;
    @ViewChild('asyncFor', { read: IgxForOfDirective, static: true })
    public remoteVirtDir: IgxForOfDirective<any>;
    @ViewChild('dropdown', { read: IgxDropDownComponent, static: true })
    public remoteDropDown: IgxDropDownComponent;
    public itemsAsync: Observable<any[]>;
    public localItems: DataItem[];
    public totalItemCount = 0;
    public prevRequest: any;
    public startIndex = 0;
    public itemHeight = 40;
    public itemsMaxHeight = 320;

    constructor(protected remoteService: RemoteService, protected cdr: ChangeDetectorRef) {
        this.localItems = Array.apply(null, { length: 2000 }).map((e, i) => ({
            name: `Item ${i + 1}`,
            id: i
        }));
    }

    public getIndex(index: number) {
        return this.startIndex + index;
    }

    public ngOnInit() {
        this.itemsAsync = this.remoteService.remoteData;
    }

    public ngAfterViewInit() {
        this.remoteService.totalCount.pipe(takeUntilDestroyed()).subscribe((data) => {
            this.remoteVirtDir.totalItemCount = data;
            this.remoteVirtDir.igxForItemSize = this.itemHeight;
        })
        this.remoteService.getData(this.remoteVirtDir.state.startIndex, this.remoteVirtDir.state.chunkSize);
    }

    public dataLoading(evt: IForOfState) {
        if (this.prevRequest) {
            this.prevRequest.unsubscribe();
        }
        this.loadingToast.positionSettings.verticalDirection = VerticalAlignment.Middle;
        this.loadingToast.autoHide = false;
        this.loadingToast.open('Loading Remote Data...');
        this.cdr.detectChanges();
        this.prevRequest = this.remoteService.getData(
            evt.startIndex,
            evt.chunkSize,
            null,
            (data) => {
                this.remoteVirtDir.totalItemCount = data['totalItemCount'];
                this.loadingToast.close();
                this.cdr.detectChanges();
            });
    }
}
