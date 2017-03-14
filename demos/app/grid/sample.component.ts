import { BehaviorSubject, Observable } from "rxjs/Rx";
import { Http } from "@angular/http";

import { IgxGridComponent } from "../../../src/grid/grid.component";
import { Component, Injectable, ViewChild } from "@angular/core";

@Injectable()
export class RemoteService {
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

@Component({
    providers: [RemoteService],
    moduleId: module.id,
    selector: "grid-sample",
    templateUrl: "sample.component.html",
})
export class GridSampleComponent {
    constructor(private service: RemoteService) {}
    @ViewChild("grid1") grid1: IgxGridComponent;
    @ViewChild("grid2") grid2: IgxGridComponent;
    data: Observable<any[]>;
    local_data: any[];
    ngOnInit(): void {
    this.data = this.service.records;
    this.service.getData();
    this.local_data = [
        {ID: 1, Name: "A"},
        {ID: 2, Name: "B"},
        {ID: 3, Name: "C"},
        {ID: 4, Name: "D"},
        {ID: 5, Name: "E"},
      ];
    }
}