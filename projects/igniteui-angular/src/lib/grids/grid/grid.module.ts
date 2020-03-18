import { NgModule } from '@angular/core';
import {
    IgxGroupAreaDropDirective,
    IgxGroupByRowTemplateDirective,
    IgxRowExpandedIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxHeaderExpandIndicatorDirective,
    IgxHeaderCollapseIndicatorDirective,
    IgxGridDetailTemplateDirective
} from './grid.directives';
import { IgxGridComponent } from './grid.component';
import {
    IgxGridPagingPipe,
    IgxGridGroupingPipe,
    IgxGridSortingPipe,
    IgxGridFilteringPipe,
    IgxGridRowPinningPipe
} from './grid.pipes';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridRowComponent } from './grid-row.component';
import { IgxGridCommonModule } from '../grid-common.module';
import { IgxGridSummaryPipe } from './grid.summary.pipe';
import { IgxGridDetailsPipe } from './grid.details.pipe';
import { IgxGridExpandableCellComponent } from './expandable-cell.component';

/**
 * @hidden
 */
@NgModule({
  declarations: [
    IgxGridComponent,
    IgxGridRowComponent,
    IgxGridGroupByRowComponent,
    IgxGroupByRowTemplateDirective,
    IgxGridDetailTemplateDirective,
    IgxRowExpandedIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxHeaderExpandIndicatorDirective,
    IgxHeaderCollapseIndicatorDirective,
    IgxGroupAreaDropDirective,
    IgxGridGroupingPipe,
    IgxGridPagingPipe,
    IgxGridSortingPipe,
    IgxGridFilteringPipe,
    IgxGridRowPinningPipe,
    IgxGridSummaryPipe,
    IgxGridDetailsPipe,
    IgxGridExpandableCellComponent
  ],
  exports: [
    IgxGridComponent,
    IgxGridExpandableCellComponent,
    IgxGridGroupByRowComponent,
    IgxGridRowComponent,
    IgxGroupByRowTemplateDirective,
    IgxGridDetailTemplateDirective,
    IgxRowExpandedIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxHeaderExpandIndicatorDirective,
    IgxHeaderCollapseIndicatorDirective,
    IgxGroupAreaDropDirective,
    IgxGridGroupingPipe,
    IgxGridPagingPipe,
    IgxGridSortingPipe,
    IgxGridFilteringPipe,
    IgxGridRowPinningPipe,
    IgxGridSummaryPipe,
    IgxGridDetailsPipe,
    IgxGridCommonModule
  ],
  imports: [
    IgxGridCommonModule,
  ]
})
export class IgxGridModule {}
