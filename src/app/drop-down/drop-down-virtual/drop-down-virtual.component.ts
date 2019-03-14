import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RemoteService } from 'src/app/shared/remote.service';
import { Observable } from 'rxjs';
import { IgxForOfDirective, IForOfState } from 'igniteui-angular';

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
  @ViewChild(`asyncFor`, { read: IgxForOfDirective })
  private igxForOf: IgxForOfDirective<any>;
  public itemsAsync: Observable<any[]>;
  public localItems: DataItem[];
  public totalItemCount = 0;
  public prevRequest: any;
  public startIndex = 0;

  constructor(protected remoteService: RemoteService, protected cdr: ChangeDetectorRef) {
    this.itemsAsync = this.remoteService.remoteData;
    this.remoteService.urlBuilder = (state) => {
      const chunkSize = state.chunkSize || 10;
      return `${this.remoteService.url}?$count=true&$skip=${state.startIndex}&$top=${chunkSize}`;
    };
    this.localItems = Array.apply(null, {length: 2000}).map((e, i) => ({
      name: `Item ${i + 1}`,
      id: i
    }));
  }

  public itemHeight = 48;
  public itemsMaxHeight = 480;

  public getIndex(index: number) {
    return this.startIndex + index;
  }
  public dataLoading(evt: IForOfState) {
    if (this.prevRequest) {
      this.prevRequest.unsubscribe();
    }
    this.startIndex = this.igxForOf.state.startIndex;
    this.prevRequest = this.remoteService.getData(
      evt,
      (data) => {
        this.igxForOf.totalItemCount = data['@odata.count'];
        this.cdr.detectChanges();
      });
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.remoteService.getData(this.igxForOf.state, (result) => {
      this.igxForOf.totalItemCount = result['@odata.count'];
    });
  }
}
