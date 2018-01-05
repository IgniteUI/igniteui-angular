import { Component, Injectable, ViewChild, OnChanges } from "@angular/core";
import { Http } from "@angular/http";
import { BehaviorSubject, Observable } from "rxjs/Rx";
import { myRow } from './row';
import { myCell } from './cell';

import {
  VirtualContainerComponent, IVirtualizationState
} from "../../lib/main";


@Injectable()
export class LocalDataService {
    public records: Observable<any[]>;
    private _records: BehaviorSubject<any[]>;
    private sampleData: any[];

    constructor(private http: Http) {
      this.sampleData = [];

      this._records = new BehaviorSubject([]);
      this.records = this._records.asObservable();
    }

    public getData() {
      var cols = [];
        for(var j = 0; j < 100; j++){
          cols.push({field: j.toString()});
      }
      for(var i = 0; i < 10000; i++){

        var obj = {};
        for(var j = 0; j <  cols.length; j++){
          var col = cols[j].field;
           obj[col] = 10*i*j;
       }
        this.sampleData.push(obj);
      }
      this._records.next(this.sampleData);
    }

}


@Component({
    selector: "virtual--sample",
    styleUrls: ["../app.samples.css", "sample.component.css"],
    templateUrl: "sample.component.html",
    providers: [LocalDataService],
})
export class VirtualContainerSampleComponent { 
  private cols:any;
  private opts:any;
  private data: any;
  private remoteData:any;
  private dataState: IVirtualizationState;
  private prevRequest:any;
   constructor(private localService: LocalDataService) {
      var cols = [];
        for(var j = 0; j < 100; j++){
          cols.push({field: j.toString()});
      }
      this.cols = cols;
  
   
    this.data = this.localService.records;
    this.opts = {
    columns:this.cols,
    horizontalItemWidth :200,
    verticalItemHeight: 25,
    rowComponent: myRow,
    cellComponent: myCell,
  };

   }
   public ngOnInit(): void {
     this.localService.getData();
   }
}
