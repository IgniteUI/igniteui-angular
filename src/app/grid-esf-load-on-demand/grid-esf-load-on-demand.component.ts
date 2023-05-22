import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxGridComponent, IgxColumnComponent, IFilteringExpressionsTree, GridSelectionMode, DisplayDensity } from 'igniteui-angular';
import { GridESFLoadOnDemandService } from './grid-esf-load-on-demand.service';
import { IgxColumnComponent as IgxColumnComponent_1 } from '../../../projects/igniteui-angular/src/lib/grids/columns/column.component';
import { IgxGridToolbarHidingComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-hiding.component';
import { IgxGridToolbarPinningComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-pinning.component';
import { IgxGridToolbarActionsComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/common';
import { IgxGridToolbarComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar.component';
import { IgxGridComponent as IgxGridComponent_1 } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';
import { IgxButtonGroupComponent } from '../../../projects/igniteui-angular/src/lib/buttonGroup/buttonGroup.component';

@Component({
    selector: 'app-grid-esf-load-on-demand',
    templateUrl: './grid-esf-load-on-demand.component.html',
    styleUrls: ['./grid-esf-load-on-demand.component.scss'],
    standalone: true,
    imports: [IgxButtonGroupComponent, IgxGridComponent_1, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxColumnComponent_1]
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
