import { Component, Injectable, ViewChild, OnChanges } from "@angular/core";
import { Http } from "@angular/http";
import { BehaviorSubject, Observable } from "rxjs/Rx";
import { myRow } from './row';
import { myCell } from './cell';

import {
  VirtualContainerComponent, IVirtualizationState
} from "../../lib/main";

@Injectable()
export class RemoteCurstomerService {
  public remoteData: Observable<any[]>;
  private url: string = "http://services.odata.org/V4/Northwind/Northwind.svc/Alphabetical_list_of_products";
  private _remoteData: BehaviorSubject<any[]>;

  constructor(private http: Http) {
    this._remoteData = new BehaviorSubject(null);
    this.remoteData = this._remoteData.asObservable();
  }

  public getData(virtualization?: IVirtualizationState, cb?: () => void): any {
    return this.http
      .get(this.buildUrl(virtualization))
      .map((response) => response.json())
      .map((response) => {
        if (virtualization) {
          const v: IVirtualizationState = virtualization;
          if (v) {
            const countRecs: number = response["@odata.count"];
            v.metadata = {
              totalRecordsCount: countRecs
            };
          }
        }
        if (cb) {
          cb();
        }
        return response;
      })
      .subscribe((data) => {
        this._remoteData.next(data.value);
      });
  }

  private buildUrl(virtualizationState: IVirtualizationState): string {
    let qS: string = "";
    if (virtualizationState) {
            const skip = virtualizationState.chunkStartIndex;
            const top = virtualizationState.chunkEndIndex - virtualizationState.chunkStartIndex;
            qS += `$skip=${skip}&$top=${top}&$count=true`;
        }
    qS = qS ? `?${qS}` : "";
    return `${this.url}${qS}`;
  }
}


@Component({
    selector: "virtual--sample",
    styleUrls: ["../app.samples.css", "sample.component.css"],
    templateUrl: "sample.component.html",
    providers: [RemoteCurstomerService],
})
export class VirtualContainerRemoteSampleComponent { 
  private cols:any;
  private opts:any;
  private data: any;
  private remoteData:any;
  private dataState: IVirtualizationState;
  private prevRequest:any;
   constructor(private remoteService: RemoteCurstomerService) {
    this.cols = [
      {field: "ProductID"},
      {field: "ProductName"},
      {field: "SupplierID"},
      {field: "CategoryID"},
      {field: "QuantityPerUnit"},
      {field: "UnitPrice"},
      {field: "UnitsInStock"},
      {field: "UnitsOnOrder"},
      {field: "Discontinued"},
      {field: "ReorderLevel"},
      {field: "CategoryName"}      
      ];
  
   
    this.data = this.remoteService.remoteData;
    this.opts = {
    columns:this.cols,
    horizontalItemWidth :200,
    verticalItemHeight: 25,
    rowComponent: myRow,
    cellComponent: myCell,
  };

   }

   loadChunk(event){
     if(this.prevRequest){
        this.prevRequest.unsubscribe();
     }
    this.prevRequest = this.remoteService.getData(event);   
   }
   public ngOnInit(): void {
   }
}
