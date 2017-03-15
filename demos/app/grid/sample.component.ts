import { Http } from "@angular/http";
import { Component, Injectable, ViewChild } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs/Rx";

import { IgxGridBindingBehavior, IgxGridComponent } from '../../../src/grid/grid.component';
import { DataState, SortingDirection, IgxToast, IgxSnackbar, DataContainer, PagingState, PagingError } from "../../../src/main";


@Injectable()
export class LocalService {
    private url: string = "http://services.odata.org/V4/Northwind/Northwind.svc/Alphabetical_list_of_products";
    public records: Observable<any[]>;
    private _records: BehaviorSubject<any[]>;
    private dataStore: any[];

    constructor(private http: Http) {
      this.dataStore = [];
      this._records = new BehaviorSubject([]);
      this.records = this._records.asObservable();
    }

    getData() {
      return this.http.get(this.url)
        .map(response => response.json())
        .subscribe(data => {
          this.dataStore = data.value;
          this._records.next(this.dataStore);
        });
    }

}

@Injectable()
export class RemoteService {
  private url: string = "http://services.odata.org/V4/Northwind/Northwind.svc/Products";
  public remoteData: Observable<any[]>;
  private _remoteData: BehaviorSubject<any[]>;

  constructor(private http: Http) {
    this._remoteData = new BehaviorSubject([]);
    this.remoteData = this._remoteData.asObservable();
  }

  private buildUrl(dataState: DataState): string {
    let qS: string = "";
    if (dataState && dataState.paging) {
            let skip = dataState.paging.index * dataState.paging.recordsPerPage;
            let top = dataState.paging.recordsPerPage;
            qS += `$skip=${skip}&$top=${top}&$count=true`;
        }
    if (dataState && dataState.sorting) {
        let s = dataState.sorting;
        if (s && s.expressions && s.expressions.length) {
            qS += (qS ? "&" : "") + "$orderby=";
            s.expressions.forEach((e, ind) => {
                qS += ind ? "," : "";
                qS += `${e.fieldName} ${e.dir === SortingDirection.Asc?"asc":"desc"}`;
            });
        }
    }
    qS = qS ? `?${qS}`: "";
    return `${this.url}${qS}`;
  }

  public getData(dataState?: DataState, cb?: Function): any {
    return this.http
      .get(this.buildUrl(dataState))
      .map(response => response.json())
      .map(response => {
        if (dataState) {
          let p: PagingState = dataState.paging;
          if (p) {
            let countRecs: number = response["@odata.count"];
            p.metadata = {
              countRecords: countRecs,
              countPages: Math.ceil(countRecs / p.recordsPerPage),
              error: PagingError.None
            };
          }
        }
        if (cb) {
          cb();
        }
        return response;
      })
      .subscribe(data => {
        this._remoteData.next(data.value);
      });
  }
}


@Component({
    providers: [LocalService, RemoteService],
    moduleId: module.id,
    selector: "grid-sample",
    templateUrl: "sample.component.html",
})
export class GridSampleComponent {
    constructor(private localService: LocalService,
                private remoteService: RemoteService) {}
    @ViewChild("grid1") grid1: IgxGridComponent;
    @ViewChild("grid2") grid2: IgxGridComponent;
    @ViewChild("grid3") grid3: IgxGridComponent;
    @ViewChild("toast") toast: IgxToast;
    @ViewChild("snax") snax: IgxSnackbar;
    data: Observable<any[]>;
    remote: Observable<any[]>;
    local_data: any[];
    selectedCell;
    selectedRow;
    ngOnInit(): void {
      this.data = this.localService.records;
      this.remote = this.remoteService.remoteData;

      this.localService.getData();

      this.local_data = [
          {ID: 1, Name: "A"},
          {ID: 2, Name: "B"},
          {ID: 3, Name: "C"},
          {ID: 4, Name: "D"},
          {ID: 5, Name: "E"},
        ];

        this.grid3.state = {
          paging: {
            index: 2,
            recordsPerPage: 10
          },
          sorting: {
            expressions: [
              {fieldName: "ProductID", dir: SortingDirection.Desc}
            ]
          }
        };
    }

    ngAfterViewInit() {
      this.remoteService.getData(this.grid3.dataContainer.state);
    }

    onProcess(event: IgxGridBindingBehavior): void {
      event.process = (dataContainer: DataContainer) => {
        if (dataContainer.data.length) {
          dataContainer.transformedData = dataContainer.data;
        }
      };
    }

    process(event) {
      this.toast.message = "Loading remote data";
      this.toast.show();
      this.remoteService.getData(this.grid3.dataContainer.state, () => {
        this.toast.hide();
      });
    }

    selectCell(event) {
      this.selectedCell = event.cell;
    }

    deleteRow(event) {
      this.selectedRow = Object.assign({}, this.grid1.getRow(this.selectedCell.rowIndex));
      this.grid1.deleteRow(this.selectedCell.rowIndex);
      this.snax.show();
    }

    restore() {
      this.grid1.addRow(this.selectedRow.record, this.selectedRow.index);
      this.snax.hide();
    }
}