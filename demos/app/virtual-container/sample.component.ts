import { Component, Injectable, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { BehaviorSubject, Observable } from "rxjs/Rx";
import { myRow } from './row';
import { myCell } from './cell';

import {
  VirtualContainerComponent
} from "../../lib/main";



@Component({
    selector: "virtual--sample",
    styleUrls: ["../app.samples.css", "sample.component.css"],
    templateUrl: "sample.component.html"
})
export class VirtualContainerSampleComponent { 
  private cols:any;
  private opts:any;
   constructor() {
    this.cols = [];
    var dummyData = [];
    for(var j = 0; j < 100; j++){
       this.cols.push({field: j.toString()});
   }
    for(var i = 0; i < 10000; i++){

      var obj = {};
       for(var j = 0; j <  this.cols.length; j++){
         var col = this.cols[j].field;
         obj[col] = 10*i*j;
       }
        dummyData.push(obj);
     }
    this.opts = {
    data: dummyData,
    columns:this.cols,
    horizontalItemWidth :100,
    verticalItemHeight: 25,
    rowComponent: myRow,
    cellComponent: myCell,
  };

   }
}
