import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { IgxColumnComponent } from 'igniteui-angular';
import { IgxGridComponent } from '../../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';

@Component({
    selector: 'app-shadow-grid-sample',
    templateUrl: './shadow-grid-sample.html',
    styleUrls: ['./shadow-grid-sample.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    imports: [IgxGridComponent]
})
export class ShadowGridSampleComponent implements OnInit {
  public localData: any[];
  public selectedCell;

  public ngOnInit(): void {
    this.localData = [
      { ID: 1, Name: 'A' },
      { ID: 2, Name: 'B' },
      { ID: 3, Name: 'C' },
      { ID: 4, Name: 'D' },
      { ID: 5, Name: 'E' }
    ];
  }

  public initColumns(event: IgxColumnComponent) {
    const column: IgxColumnComponent = event;
    if (column.field === 'Name') {
      column.filterable = true;
      column.sortable = true;
      column.editable = true;
    }
  }

  public selectCell(event) {
    this.selectedCell = event;
  }
}
