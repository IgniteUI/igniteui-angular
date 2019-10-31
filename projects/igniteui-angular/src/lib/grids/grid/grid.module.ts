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
    IgxGridFilteringPipe
} from './grid.pipes';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridRowComponent } from './grid-row.component';
import { IgxGridCommonModule } from '../grid-common.module';
import { IgxGridSummaryPipe } from './grid.summary.pipe';
import { IgxGridDetailsPipe } from './grid.details.pipe';
import { IgGridExpandableCellComponent } from './expandable-cell.component';

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
    IgxGridSummaryPipe,
    IgxGridDetailsPipe,
    IgGridExpandableCellComponent
  ],
  exports: [
    IgxGridComponent,
    IgGridExpandableCellComponent,
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
    IgxGridSummaryPipe,
    IgxGridDetailsPipe,
    IgxGridCommonModule
  ],
  imports: [
    IgxGridCommonModule,
  ]
})
export class IgxGridModule {}
