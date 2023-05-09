import { Component, ViewChild } from '@angular/core';

import { IgxRowDirective } from 'projects/igniteui-angular/src/lib/grids/row.directive';
import { DATA } from './nwindData';
import { IgxColumnComponent } from '../../../projects/igniteui-angular/src/lib/grids/columns/column.component';
import { IgxDropDirective } from '../../../projects/igniteui-angular/src/lib/directives/drag-drop/drag-drop.directive';
import { IgxGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';


@Component({
    selector: 'app-grid-row-reorder-sample',
    templateUrl: 'grid-row-reorder.sample.html',
    styleUrls: ['grid-row-reorder.sample.scss'],
    standalone: true,
    imports: [IgxGridComponent, IgxDropDirective, IgxColumnComponent]
})
export class GridRowReorderComponent {

    @ViewChild('grid', { read: IgxGridComponent, static : true })
    private grid: IgxGridComponent;
    public data: any[];


    constructor() {
        this.data = DATA;
    }

    public onDropAllowed(args) {
        const event = args.originalEvent;
        const currRowIndex = this.getCurrentRowIndex(this.grid.rowList.toArray(),
            { x: event.clientX, y: event.clientY });
        if (currRowIndex === -1) {
            return;
        }
        // remove the row that was dragged and place it onto its new location
        this.grid.deleteRow(args.dragData.key);
        this.grid.data.splice(currRowIndex, 0, args.dragData.data);
    }

    private getCurrentRowIndex(rowList: IgxRowDirective[], cursorPosition) {
        for (const row of rowList) {
            const rowRect = row.nativeElement.getBoundingClientRect();
            if (cursorPosition.y > rowRect.top + window.scrollY && cursorPosition.y < rowRect.bottom + window.scrollY &&
                cursorPosition.x > rowRect.left + window.scrollX && cursorPosition.x < rowRect.right + window.scrollX) {
                // return the index of the targeted row
                return this.grid.data.indexOf(this.grid.data.find((r) => r.ProductID === row.key));
            }
        }

        return -1;
    }
}
