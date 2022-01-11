import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IgxGridModule } from '../grid/grid.module';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { IgxPivotRowComponent } from './pivot-row.component';
import { IgxPivotRowPipe, IgxPivotColumnPipe, IgxPivotGridFilterPipe,
   IgxPivotRowExpansionPipe, IgxPivotGridSortingPipe, IgxPivotGridColumnSortingPipe } from './pivot-grid.pipes';
import { IgxGridComponent } from '../grid/grid.component';
import { IgxPivotHeaderRowComponent } from './pivot-header-row.component';
import { IgxPivotRowDimensionContentComponent } from './pivot-row-dimension-content.component';
import { IgxPivotRowDimensionHeaderGroupComponent } from './pivot-row-dimension-header-group.component';
import { IgxPivotDataSelectorComponent } from './pivot-data-selector.component';
import { IgxExpansionPanelModule } from '../../expansion-panel/expansion-panel.module';
import { IgxPivotRowDimensionHeaderComponent } from './pivot-row-dimension-header.component';

/**
 * @hidden
 */
@NgModule({
  declarations: [
    IgxPivotGridComponent,
    IgxPivotRowComponent,
    IgxPivotHeaderRowComponent,
    IgxPivotRowDimensionContentComponent,
    IgxPivotRowDimensionHeaderComponent,
    IgxPivotRowDimensionHeaderGroupComponent,
    IgxPivotRowPipe,
    IgxPivotRowExpansionPipe,
    IgxPivotColumnPipe,
    IgxPivotGridFilterPipe,
    IgxPivotGridSortingPipe,
    IgxPivotGridColumnSortingPipe,
    IgxPivotDataSelectorComponent
  ],
  exports: [
    IgxGridModule,
    IgxPivotGridComponent,
    IgxPivotRowComponent,
    IgxPivotHeaderRowComponent,
    IgxPivotRowDimensionContentComponent,
    IgxPivotRowDimensionHeaderComponent,
    IgxPivotRowDimensionHeaderGroupComponent,
    IgxPivotRowExpansionPipe,
    IgxPivotRowPipe,
    IgxPivotColumnPipe,
    IgxPivotGridFilterPipe,
    IgxPivotGridSortingPipe,
    IgxPivotGridColumnSortingPipe,
    IgxPivotDataSelectorComponent
  ],
  imports: [
    IgxGridModule,
    IgxExpansionPanelModule
  ],
  entryComponents: [
    IgxGridComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgxPivotGridModule {
}
