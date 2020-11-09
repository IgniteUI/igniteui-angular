import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
    IgxGroupAreaDropDirective,
    IgxGroupByRowTemplateDirective,
    IgxRowExpandedIndicatorDirective,
    IgxExcelStyleHeaderIconDirective,
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
    IgxExcelStyleHeaderIconDirective,
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
    IgxExcelStyleHeaderIconDirective,
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgxGridModule {}
