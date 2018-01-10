import { Component, Input } from '@angular/core';
import { VirtualVericalItemComponent } from "../../lib/main";
import { myCell } from './cell';

@Component({
    template: `
    <tr [style.height.px]='height' class='row'>
    <ng-template ngFor let-col [ngForOf]="columns" let-colIndex="index + 1">
        <cell [data]="rowData[col.field]" [width]='col.width'></cell>
    </ng-template>
    </tr>
  `,
    styleUrls: ['./row.css']
})

export class myRow implements VirtualVericalItemComponent {
    @Input() rowData: any;
    @Input() columns: any;
    @Input() height: any;
}
