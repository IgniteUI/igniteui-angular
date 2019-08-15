import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxGridComponent, IgxColumnComponent, IFilteringExpressionsTree } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';
import { GridESFLoadOnDemandService } from './grid-esf-load-on-demand.service';

@Component({
  selector: 'app-grid-esf-load-on-demand',
  templateUrl: './grid-esf-load-on-demand.component.html',
  styleUrls: ['./grid-esf-load-on-demand.component.scss']
})
export class GridEsfLoadOnDemandComponent implements OnInit {

  private esfService = new GridESFLoadOnDemandService();

  public data: Array<any>;
  public density = 'comfortable';
  public displayDensities;
  
  @ViewChild('grid1', { static: true })
  public grid1: IgxGridComponent;

  public columnValuesStrategy = (column: IgxColumnComponent,
                                 columnExprTree: IFilteringExpressionsTree,
                                 done: (uniqueValues: any[]) => void) => {
    this.esfService.getColumnData(column, columnExprTree, uniqueValues => done(uniqueValues));
  }

  public ngOnInit(): void {
      this.displayDensities = [
          { label: 'comfortable', selected: this.density === 'comfortable', togglable: true },
          { label: 'cosy', selected: this.density === 'cosy', togglable: true },
          { label: 'compact', selected: this.density === 'compact', togglable: true }
      ];

      this.data = this.esfService.getRecordsData();
  }

  public selectDensity(event) {
      this.density = this.displayDensities[event.index].label;
  }
}
