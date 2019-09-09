import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxChipsModule } from '../../chips/chips.module';
import { IgxGridModule } from '../grid/grid.module';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxGridHierarchicalPipe, IgxGridHierarchicalPagingPipe } from './hierarchical-grid.pipes';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxHierarchicalGridCellComponent } from './hierarchical-cell.component';
import { IgxRowIslandAPIService } from './row-island-api.service';
import { IgxSelectModule } from '../../select/index';
import { IgxGridComponent } from '../grid/grid.component';

/**
 * @hidden
 */
@NgModule({
  declarations: [
    IgxHierarchicalGridComponent,
    IgxHierarchicalRowComponent,
    IgxRowIslandComponent,
    IgxChildGridRowComponent,
    IgxHierarchicalGridCellComponent,
    IgxGridHierarchicalPipe,
    IgxGridHierarchicalPagingPipe
  ],
  exports: [
    IgxGridModule,
    IgxHierarchicalGridComponent,
    IgxHierarchicalRowComponent,
    IgxHierarchicalGridCellComponent,
    IgxRowIslandComponent,
    IgxChildGridRowComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IgxChipsModule,
    IgxGridModule,
    IgxSelectModule
  ],
  providers: [
    IgxRowIslandAPIService
  ],
  entryComponents: [
    IgxGridComponent
  ]
})
export class IgxHierarchicalGridModule {
}
