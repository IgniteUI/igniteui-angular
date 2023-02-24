import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RemoteService } from 'src/app/shared/remote.service';
import { Observable } from 'rxjs';
import { IForOfState, IgxDropDownComponent, IgxToastComponent, IgxForOfDirective, DisplayDensity, VerticalAlignment } from 'igniteui-angular';
import { AsyncPipe } from '@angular/common';
import { IgxToastComponent as IgxToastComponent_1 } from '../../../../projects/igniteui-angular/src/lib/toast/toast.component';
import { IgxDropDownItemComponent } from '../../../../projects/igniteui-angular/src/lib/drop-down/drop-down-item.component';
import { IgxForOfDirective as IgxForOfDirective_1 } from '../../../../projects/igniteui-angular/src/lib/directives/for-of/for_of.directive';
import { IgxDropDownComponent as IgxDropDownComponent_1 } from '../../../../projects/igniteui-angular/src/lib/drop-down/drop-down.component';
import { IgxDropDownItemNavigationDirective } from '../../../../projects/igniteui-angular/src/lib/drop-down/drop-down-navigation.directive';
import { IgxToggleActionDirective } from '../../../../projects/igniteui-angular/src/lib/directives/toggle/toggle.directive';
import { IgxButtonDirective } from '../../../../projects/igniteui-angular/src/lib/directives/button/button.directive';

interface DataItem {
  name: string;
  id: number;
}
@Component({
    selector: 'app-drop-down-virtual',
    templateUrl: './drop-down-virtual.component.html',
    styleUrls: ['./drop-down-virtual.component.scss'],
    standalone: true,
    imports: [IgxButtonDirective, IgxToggleActionDirective, IgxDropDownItemNavigationDirective, IgxDropDownComponent_1, IgxForOfDirective_1, IgxDropDownItemComponent, IgxToastComponent_1, AsyncPipe]
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
  public density: DisplayDensity = 'comfortable';
  public displayDensities = [
    { label: 'comfortable', selected: this.density === 'comfortable', togglable: true },
    { label: 'cosy', selected: this.density === 'cosy', togglable: true },
    { label: 'compact', selected: this.density === 'compact', togglable: true }
  ];

  constructor(protected remoteService: RemoteService, protected cdr: ChangeDetectorRef) {
    this.remoteService.urlBuilder = (state) => {
      const chunkSize = state.chunkSize || Math.floor(this.itemsMaxHeight / this.itemHeight) + 1;
      return `${this.remoteService.url}?$count=true&$skip=${state.startIndex}&$top=${chunkSize}`;
    };
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
    this.remoteService.getData(this.remoteVirtDir.state, (data) => {
        this.remoteVirtDir.totalItemCount = data['@odata.count'];
        this.remoteVirtDir.igxForItemSize = this.itemHeight;
    });
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
        evt,
        (data) => {
          this.remoteVirtDir.totalItemCount = data['@odata.count'];
          this.loadingToast.close();
          this.cdr.detectChanges();
    });
  }
}
