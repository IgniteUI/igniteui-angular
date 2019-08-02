import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';
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

  public loadColumnValues = (columnField: string, done: (uniqueValues: string[]) => void) => {
    this.esfService.getData(columnField, uniqueValues => done(uniqueValues));
  }

  public ngOnInit(): void {
      this.displayDensities = [
          { label: 'comfortable', selected: this.density === 'comfortable', togglable: true },
          { label: 'cosy', selected: this.density === 'cosy', togglable: true },
          { label: 'compact', selected: this.density === 'compact', togglable: true }
      ];

      this.data = SAMPLE_DATA.slice(0);
  }

  public selectDensity(event) {
      this.density = this.displayDensities[event.index].label;
  }
}
