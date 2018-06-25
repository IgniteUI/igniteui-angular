import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';

@Component({
    selector: 'app-grid-performance-sample',
    templateUrl: 'grid-performance.sample.html'
})

export class GridPerformanceSampleComponent implements OnInit {

    @ViewChild('grid1')
    grid1: IgxGridComponent;

    localData: any[] = [];
    columns;

    ngOnInit() {

        const cols = [];
        for (let j = 0; j < 300; j++) {
            cols.push({
                field: j.toString(),
                width: j % 3 === 0 ?
                    Math.floor((Math.random() * 50) + 50) :
                    (
                        j % 3 === 1 ?
                            Math.floor((Math.random() * 60) + 50) :
                            Math.floor((Math.random() * 70) + 50)
                    )
            });
        }

        this.columns = cols;

        for (let i = 0; i < 100000; i++) {
            const obj = {};
            for (let j = 0; j < cols.length; j++) {
                const col = cols[j].field;
                obj[col] = 10 * i * j;
            }
            this.localData.push(obj);
        }
    }

    ToggleCol() {
        if (this.columns[0].field === '0') {
            this.columns.splice(0, 1);
        } else {
            this.columns.unshift({ field: '0', width: '200px' });
        }
        this.grid1.markForCheck();
    }

    ToggleRow() {
        if (this.localData[0][1] === 0) {
            this.localData.splice(0, 1);
        } else {
            const obj = {};
            for (let j = 0; j < this.columns.length; j++) {
                const col = this.columns[j].field;
                obj[col] = 0;
            }
            this.localData.unshift(obj);
        }
        this.grid1.markForCheck();
    }
}
