import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RemoteService } from 'src/app/shared/remote.service';
import { Observable } from 'rxjs';
import { IForOfState, IgxDropDownComponent, IgxToastComponent, IgxToastPosition } from 'igniteui-angular';

interface DataItem {
  name: string;
  id: number;
}
@Component({
  selector: 'app-drop-down-virtual',
  templateUrl: './drop-down-virtual.component.html',
  styleUrls: ['./drop-down-virtual.component.scss']
})
export class DropDownVirtualComponent implements OnInit, AfterViewInit {
  @ViewChild('loadingToast', { read: IgxToastComponent})
  public loadingToast: IgxToastComponent;
  @ViewChild('dropdown', { read: IgxDropDownComponent })
  public remoteDropDown: IgxDropDownComponent;
  public itemsAsync: Observable<any[]>;
  public localItems: DataItem[];
  public totalItemCount = 0;
  public prevRequest: any;
  public startIndex = 0;
  public itemHeight = 48;
  public itemsMaxHeight = 480;

  constructor(protected remoteService: RemoteService, protected cdr: ChangeDetectorRef) {
    this.remoteService.urlBuilder = (state) => {
      const chunkSize = state.chunkSize || 11;
      return `${this.remoteService.url}?$count=true&$skip=${state.startIndex}&$top=${chunkSize}`;
    };
    this.localItems = Array.apply(null, {length: 2000}).map((e, i) => ({
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
    this.remoteService.getData(this.remoteDropDown.virtDir.state, (data) => {
        this.remoteDropDown.virtDir.totalItemCount = data['@odata.count'];
        this.remoteDropDown.virtDir.igxForItemSize = this.itemHeight;
    });
}

public dataLoading(evt: IForOfState) {
  console.log(evt);
    if (this.prevRequest) {
        this.prevRequest.unsubscribe();
    }
    this.loadingToast.message = 'Loading Remote Data...';
    this.loadingToast.position = IgxToastPosition.Middle;
    this.loadingToast.autoHide = false;
    this.loadingToast.show();
    this.cdr.detectChanges();
    this.prevRequest = this.remoteService.getData(
        evt,
        (data) => {
          this.remoteDropDown.virtDir.totalItemCount = data['@odata.count'];
          this.loadingToast.hide();
          this.cdr.detectChanges();
    });
}
}
