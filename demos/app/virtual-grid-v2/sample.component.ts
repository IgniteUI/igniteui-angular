import { Component, Input, ViewChild } from "@angular/core";

import { IgxColumnComponent } from "../../lib/virtual-grid-v2/column.component";
import { IgxVirtGridComponent } from "../../lib/virtual-grid-v2/grid.component";
import { IgxGridComponent } from "../../lib/grid/grid.component";
import { IgxGridAPIService } from '../../lib/virtual-grid-v2/api.service';

@Component({
    selector: "virtual-grid-sample",
    providers: [IgxGridAPIService],
    styleUrls: ["../app.samples.css", "sample.component.css"],
    templateUrl: "sample.component.html"
})
export class VirtualGridV2SampleComponent {
    @ViewChild("grid1") public grid1: IgxGridComponent;

    public localData: any[];
    public cols: any[];
    public rowHeight: number;
    public colWidth: number;

    constructor() {
        this.cols = [];
        this.rowHeight = 30;
        this.colWidth = 200;
        
    }

    public ngOnInit(): void {
        this.generateData();
    }

    generateData() {
        var dummyData = [];
        for(var j = 0; j < 100; j++){
            this.cols.push({field: j.toString(), width: j % 3 === 0 ?
              String(Math.floor((Math.random() * 50) + 50)) :
              (
                j % 3 === 1 ?
                  String(Math.floor((Math.random() * 200) + 50)) :
                  String(Math.floor((Math.random() * 400) + 50))
              )
              });
        }
    
        for(let i = 0; i < 10000; i++) {
            let obj = {};
            for(var j = 0; j <  this.cols.length; j++){
                let col = this.cols[j].field;
                obj[col] = 10*i*j;
            }
                dummyData.push(obj);
        }
    
        this.localData = dummyData;
    }
}
