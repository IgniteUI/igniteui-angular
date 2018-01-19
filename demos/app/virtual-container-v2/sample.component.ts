import { Component, Input } from "@angular/core";
import { CellComponent } from './cell.component';
import { RowComponent } from './row.component';

@Component({
    selector: "virtual-container-sample",
    styleUrls: ["../app.samples.css", "sample.component.css"],
    templateUrl: "sample.component.html"
})
export class VirtualContainerV2SampleComponent {

    public localData: any[];
    public cols: any[];
    public rowHeight: number;
    public colWidth: number;
    public cellComponent: any;
    public rowComponent: any;

    constructor() {
        this.cols = [];
        this.rowHeight = 35;
        this.colWidth = 150;
        this.cellComponent = CellComponent;
        this.rowComponent = RowComponent;
    }

    public ngOnInit(): void {
        this.generateData();
    }

    generateData() {
        var dummyData = [];
        for(let j = 0; j < 100; j++) {
            this.cols.push({
                field: j.toString(),
                width: this.colWidth
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
