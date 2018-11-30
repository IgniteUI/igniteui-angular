import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxChipsModule } from '../../chips/chips.module';
import { IgxGridCommonModule } from '../grid-common.module';
import { IgxGridModule } from '../grid/grid.module';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxGridHierarchicalPipe } from './hierarchical-grid.pipes';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxHirarchicalGridCellComponent } from './hierarchical-cell.component';
import { IgxHierarchicalSelectionAPIService } from './selection';

@NgModule({
  declarations: [
    IgxHierarchicalGridComponent,
    IgxHierarchicalRowComponent,
    IgxRowIslandComponent,
    IgxChildGridRowComponent,
    IgxHirarchicalGridCellComponent,
    IgxGridHierarchicalPipe
  ],
  exports: [
    IgxGridModule,
    IgxHierarchicalGridComponent,
    IgxHierarchicalRowComponent,
    IgxHirarchicalGridCellComponent,
    IgxRowIslandComponent,
    IgxChildGridRowComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IgxChipsModule,
    IgxGridModule.forRoot()
  ],
  providers: [
    IgxHierarchicalSelectionAPIService
  ]
})
export class IgxHierarchicalGridModule {
}
