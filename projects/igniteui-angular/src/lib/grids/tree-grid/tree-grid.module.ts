import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridRowComponent } from './tree-grid-row.component';
import { IgxChipsModule } from '../../chips/chips.module';
import { IgxGridCommonModule } from '../grid-common.module';
import { IgxTreeGridHierarchizingPipe } from './tree-grid.pipes';
import { IgxTreeGridFlatteningPipe, IgxTreeGridSortingPipe, IgxTreeGridPagingPipe, IgxTreeGridTransactionPipe } from './tree-grid.pipes';
import { IgxTreeGridCellComponent } from './tree-cell.component';
import { IgxTreeGridFilteringPipe } from './tree-grid.filtering.pipe';
import { IgxTreeGridSummaryPipe } from './tree-grid.summary.pipe';

@NgModule({
  declarations: [
    IgxTreeGridComponent,
    IgxTreeGridRowComponent,
    IgxTreeGridCellComponent,
    IgxTreeGridHierarchizingPipe,
    IgxTreeGridFlatteningPipe,
    IgxTreeGridSortingPipe,
    IgxTreeGridFilteringPipe,
    IgxTreeGridPagingPipe,
    IgxTreeGridTransactionPipe,
    IgxTreeGridSummaryPipe
  ],
  exports: [
    IgxTreeGridComponent,
    IgxTreeGridRowComponent,
    IgxTreeGridCellComponent,
    IgxGridCommonModule
  ],
  imports: [
    CommonModule,
    FormsModule,
    IgxChipsModule,
    IgxGridCommonModule
  ]
})
export class IgxTreeGridModule {
}
