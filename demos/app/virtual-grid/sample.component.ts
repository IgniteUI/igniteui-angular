import { Component, Injectable, ViewChild, OnChanges } from "@angular/core";
import { Http } from "@angular/http";
import { BehaviorSubject, Observable } from "rxjs/Rx";

import {
  IVirtualizationState
} from "../../lib/main";

import { IgxColumnComponent } from "../../lib/grid/column.component";
import {  IgxGridComponent} from "../../lib/grid/grid.component";

@Injectable()
export class LocalDataService {
    public records: Observable<any[]>;
    private _records: BehaviorSubject<any[]>;
    public sampleData: any[];

    constructor(private http: Http) {
      this.sampleData = [];
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
      this._records = new BehaviorSubject([]);
      this.records = this._records.asObservable();
    }

    public getData(virtualization?: IVirtualizationState) {
      virtualization.metadata = {totalRecordsCount : this.sampleData.length};
      this._records.next(this.sampleData.slice(virtualization.chunkStartIndex, virtualization.chunkEndIndex));
    }

}


@Component({
    selector: "virtual--sample",
    styleUrls: ["../app.samples.css", "sample.component.css"],
    templateUrl: "sample.component.html",
    providers: [LocalDataService],
})
export class VirtualGridSampleComponent { 
  private columns:any;
  private opts:any;
  private data: any;
  private remoteData:any;
  private dataState: IVirtualizationState;
  private prevRequest:any;
  private localData:any;
   constructor(private localService: LocalDataService) {
      var cols = [];
        for(var j = 0; j < 100; j++){
          cols.push({field: j.toString(), width:"200"});
      }
      this.columns = cols;
  
   
    this.data = this.localService.records;
    
   }
  ngOnInit(event){
     this.localData = this.localService.sampleData;
     //this.localService.getData(event);
   }
}
