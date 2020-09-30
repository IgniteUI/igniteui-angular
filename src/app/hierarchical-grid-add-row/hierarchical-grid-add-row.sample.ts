import { Component, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import {
    IgxHierarchicalGridComponent,
} from 'igniteui-angular';

@Component({
    selector: 'app-hierarchical-grid-add-row-sample',
    templateUrl: 'hierarchical-grid-add-row.sample.html'
})
export class HierarchicalGridAddRowSampleComponent implements AfterViewInit {
    localData = [];

    public columns;
    public childColumns;


    @ViewChild('hGrid', { static: true })
    hGrid: IgxHierarchicalGridComponent;



    constructor(private cdr: ChangeDetectorRef) {
        this.localData = this.generateDataUneven(100, 3);
        this.localData[0].hasChild = false;
        this.localData[1].hasChild = false;
        this.localData[2].childData[0].hasChild = false;
        this.localData[2].childData[1].hasChild = false;
    }


    ngAfterViewInit() {
        this.cdr.detectChanges();
    }


    generateDataUneven(count: number, level: number, parendID: string = null) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
            if (level > 0) {
                // Have child grids for row with even id less rows by not multiplying by 2
                children = this.generateDataUneven(((i % 2) + 1) * Math.round(count / 3), currLevel - 1, rowID);
            }
            prods.push({
                ID: rowID,
                ChildLevels: currLevel,
                ProductName: 'Product: A' + i,
                Col1: i,
                Col2: i,
                Col3: i,
                childData: children,
                childData2: i % 2 ? [] : children,
                hasChild: true
            });
        }
        return prods;
    }



    onMouseOver(event, grid, actionStrip) {
        if (event.target.nodeName.toLowerCase() === 'igx-hierarchical-grid-cell') {
            const rowIndex = parseInt(event.target.attributes['data-rowindex'].value, 10);
            const row = grid.getRowByIndex(rowIndex);
            actionStrip.show(row);
        }
    }

    onMouseLeave(actionstrip, event?) {
        if (!event || event.relatedTarget.nodeName.toLowerCase() !== 'igx-drop-down-item') {
            actionstrip.hide();
        }
    }
}
