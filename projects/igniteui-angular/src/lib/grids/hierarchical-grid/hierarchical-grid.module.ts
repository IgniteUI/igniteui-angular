import { NgModule } from '@angular/core';
import { IgxGridModule } from '../grid/grid.module';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxGridHierarchicalPipe, IgxGridHierarchicalPagingPipe, IgxGridHierarchicalRowPinning } from './hierarchical-grid.pipes';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxHierarchicalGridCellComponent } from './hierarchical-cell.component';
import { IgxGridComponent } from '../grid/grid.component';
import { IgxHierarchicalGridBaseDirective } from './hierarchical-grid-base.directive';
import { IgxHierarchicalRowGhostComponent } from './hierarchical-row-ghost.component';

/**
 * @hidden
 */
@NgModule({
  declarations: [
    IgxHierarchicalGridBaseDirective,
    IgxHierarchicalGridComponent,
    IgxHierarchicalRowComponent,
    IgxHierarchicalRowGhostComponent,
    IgxRowIslandComponent,
    IgxChildGridRowComponent,
    IgxHierarchicalGridCellComponent,
    IgxGridHierarchicalPipe,
    IgxGridHierarchicalPagingPipe,
    IgxGridHierarchicalRowPinning
  ],
  exports: [
    IgxGridModule,
    IgxHierarchicalGridComponent,
    IgxHierarchicalRowComponent,
    IgxHierarchicalRowGhostComponent,
    IgxHierarchicalGridCellComponent,
    IgxRowIslandComponent,
    IgxChildGridRowComponent
  ],
  imports: [
    IgxGridModule,
  ],
  entryComponents: [
    IgxGridComponent
  ]
})
export class IgxHierarchicalGridModule {
}
