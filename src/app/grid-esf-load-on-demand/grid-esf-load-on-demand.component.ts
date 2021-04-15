import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxGridComponent, IgxColumnComponent, IFilteringExpressionsTree, GridSelectionMode, DisplayDensity } from 'igniteui-angular';
import { GridESFLoadOnDemandService } from './grid-esf-load-on-demand.service';

@Component({
  selector: 'app-grid-esf-load-on-demand',
  templateUrl: './grid-esf-load-on-demand.component.html',
  styleUrls: ['./grid-esf-load-on-demand.component.scss']
})
export class GridEsfLoadOnDemandComponent implements OnInit {
  @ViewChild('grid1', { static: true })
  public grid1: IgxGridComponent;

  public data: Array<any>;
  public density: DisplayDensity = 'comfortable';
  public displayDensities;
  public selectionMode;

  private esfService = new GridESFLoadOnDemandService();

  public columnValuesStrategy = (column: IgxColumnComponent,
                                 columnExprTree: IFilteringExpressionsTree,
                                 done: (uniqueValues: any[]) => void) => {
    this.esfService.getColumnData(column, columnExprTree, uniqueValues => done(uniqueValues));
  };

  public ngOnInit(): void {
      this.displayDensities = [
          { label: 'comfortable', selected: this.density === 'comfortable', togglable: true },
          { label: 'cosy', selected: this.density === 'cosy', togglable: true },
          { label: 'compact', selected: this.density === 'compact', togglable: true }
      ];

      this.data = this.esfService.getRecordsData();
      this.selectionMode = GridSelectionMode.multiple;
  }

  public selectDensity(event) {
      this.density = this.displayDensities[event.index].label;
  }
}
