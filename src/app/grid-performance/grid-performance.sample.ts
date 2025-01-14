import { Component, OnInit, ViewChild } from '@angular/core';
import { NgFor } from '@angular/common';
import { GridSelectionMode, IgxColumnComponent, IgxGridComponent, IgxGridToolbarActionsComponent, IgxGridToolbarComponent, IgxGridToolbarHidingComponent, IgxGridToolbarPinningComponent } from 'igniteui-angular';


@Component({
    selector: 'app-grid-performance-sample',
    templateUrl: 'grid-performance.sample.html',
    styleUrls: ['grid-performance.sample.scss'],
    imports: [IgxGridComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, NgFor, IgxColumnComponent]
})

export class GridPerformanceSampleComponent implements OnInit {

    @ViewChild('grid1', { static: true })
    private grid1: IgxGridComponent;

    public localData: any[] = [];
    public columns;
    public selectionMode;

    public ngOnInit() {
        this.selectionMode = GridSelectionMode.multiple;
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

    public ToggleCol() {
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

    public toggleVis() {
        this.grid1.columnList.forEach(c => c.hidden = !c.hidden);
    }

    public ToggleRow() {
        if (this.localData[0][1] === 0) {
            this.localData.splice(0, 1);
        } else {
            const obj = {};
            for (const col of this.columns) {
                obj[col] = 0;
            }
            this.localData.unshift(obj);
        }
        this.grid1.markForCheck();
    }

    public scrollTo(grid, index) {
        grid.verticalScrollContainer.scrollTo(parseInt(index, 10));
    }
}
