import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';

@Component({
    selector: 'app-grid-performance-sample',
    templateUrl: 'grid-performance.sample.html'
})

export class GridPerformanceSampleComponent implements OnInit {

    @ViewChild('grid1', { static: true })
    grid1: IgxGridComponent;

    localData: any[] = [];
    columns;
    _timer;

    ngOnInit() {

        const cols = [];
        cols.push({
            field: 'ID',
            width: 90
        });
        for (let j = 0; j < 300; j++) {
            cols.push({
                field: (j + 1).toString(),
                width: (Math.random() * 80) + 90
            });
        }

        this.columns = cols;

        const obj = {};
        for (let j = 0; j < cols.length; j++) {
            const col = cols[j].field;
            obj[col] = j;
        }

        for (let i = 0; i < 100000; i++) {
            const newObj = Object.create(obj);
            newObj['ID'] = i;
            this.localData.push(newObj);
        }
    }

    ToggleCol() {
        if (this.columns[0].field === 'new column') {
            this.columns.splice(0, 1);
        } else {
            this.columns.unshift({ field: 'new column', width: '200px' });
            for (let i = 0; i < 100000; i++) {
                this.localData[i]['new column'] = i * 3;
            }
        }
        this.grid1.markForCheck();
    }

    toggleVis() {
        this.grid1.columnList.forEach(c => c.hidden = !c.hidden);
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
    public scrollTo(grid, index) {
        const date = new Date().getTime();
        grid.verticalScrollContainer.scrollTo(parseInt(index, 10));
        grid.cdr.detectChanges();
        console.log(new Date().getTime() - date);
    }

    public startLiveData() {
        this._timer = setInterval(() => this.ticker(), 100);
    }

    public stopLiveData() {
        if (this._timer) {
            clearInterval(this._timer);
        }
    }

    private ticker() {
        this.grid1.data = this.updateRandomValues(this.grid1.data);
    }

    private updateRandomValues(data: any[]): any {
        const newData = data.slice();
        let y = 0;
        for (let i = Math.round(Math.random() * 10); i < newData.length; i += Math.round(Math.random() * 10)) {
            newData[i]['1'] = Math.round(Math.random() * 10);
            newData[i]['2'] = Math.round(Math.random() * 10);
            newData[i]['3'] = Math.round(Math.random() * 10);
            y++;
        }
        return newData;
    }
}
