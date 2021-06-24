import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
    IgxGroupByRowTemplateDirective,
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
import { IgxGridGroupByAreaComponent } from '../grouping/grid-group-by-area.component';
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
    IgxGridGroupingPipe,
    IgxGridPagingPipe,
    IgxGridSortingPipe,
    IgxGridFilteringPipe,
    IgxGridSummaryPipe,
    IgxGridDetailsPipe,
    IgxGridExpandableCellComponent,
    IgxGridGroupByAreaComponent,
  ],
  exports: [
    IgxGridComponent,
    IgxGridExpandableCellComponent,
    IgxGridGroupByRowComponent,
    IgxGridRowComponent,
    IgxGroupByRowTemplateDirective,
    IgxGridDetailTemplateDirective,
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
