import { NgModule } from '@angular/core';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridRowComponent } from './tree-grid-row.component';
import { IgxGridCommonModule } from '../grid-common.module';
import { IgxTreeGridHierarchizingPipe } from './tree-grid.pipes';
import { IgxTreeGridFlatteningPipe, IgxTreeGridSortingPipe, IgxTreeGridPagingPipe, IgxTreeGridTransactionPipe } from './tree-grid.pipes';
import { IgxTreeGridCellComponent } from './tree-cell.component';
import { IgxTreeGridFilteringPipe } from './tree-grid.filtering.pipe';
import { IgxTreeGridSummaryPipe } from './tree-grid.summary.pipe';
import { IgxRowLoadingIndicatorTemplateDirective } from './tree-grid.directives';

/**
 * @hidden
 */
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
    IgxTreeGridSummaryPipe,
    IgxRowLoadingIndicatorTemplateDirective
  ],
  exports: [
    IgxTreeGridComponent,
    IgxTreeGridRowComponent,
    IgxTreeGridCellComponent,
    IgxRowLoadingIndicatorTemplateDirective,
    IgxGridCommonModule
  ],
  imports: [
    IgxGridCommonModule,
  ]
})
export class IgxTreeGridModule {
}
