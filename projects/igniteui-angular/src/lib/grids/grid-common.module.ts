import { NgModule } from '@angular/core';
import { IgxGridCellComponent } from './cell.component';
import { IgxGridFooterComponent } from './grid-footer/grid-footer.component';
import {
    IgxGridBodyDirective
} from './grid.common';
import {
    IgxRowAddTextDirective,
    IgxRowEditTemplateDirective,
    IgxRowEditActionsDirective,
    IgxRowEditTextDirective,
    IgxRowEditTabStopDirective
} from './grid.rowEdit.directive';
import { IgxPaginatorModule } from '../paginator/public_api';

import { IgxGridExcelStyleFilteringModule } from './filtering/excel-style/grid.excel-style-filtering.module';

import { IgxAdvancedFilteringDialogComponent } from './filtering/advanced-filtering/advanced-filtering-dialog.component';

import { IgxGridResizingModule } from './resizing/resize.module';

import { IgxGridSharedModules } from './common/shared.module';
import { IgxGridSummaryModule } from './summaries/summary.module';
import { IgxColumnActionsModule } from './column-actions/column-actions.module';

import { IgxGridHeadersModule } from './headers/headers.module';
import { IgxGridFilteringModule } from './filtering/base/filtering.module';
import { IgxRowDirective } from './row.directive';
import {
    IgxExcelStyleHeaderIconDirective,
    IgxSortAscendingHeaderIconDirective,
    IgxSortDescendingHeaderIconDirective,
    IgxSortHeaderIconDirective,
    IgxGroupAreaDropDirective,
    IgxHeaderCollapseIndicatorDirective,
    IgxHeaderExpandIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxRowExpandedIndicatorDirective
} from './grid/grid.directives';

import { IgxGroupByMetaPipe } from './grouping/group-by-area.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { IgxTooltipModule } from '../directives/tooltip';

/**
 * @hidden
 */
@NgModule({
    exports: [
    IgxGridCellComponent,
    IgxRowAddTextDirective,
    IgxRowEditTemplateDirective,
    IgxRowEditActionsDirective,
    IgxRowEditTextDirective,
    IgxRowEditTabStopDirective,
    IgxGridBodyDirective,
    IgxColumnActionsModule,
    IgxGridHeadersModule,
    IgxGridFilteringModule,
    IgxGridExcelStyleFilteringModule,
    IgxPaginatorModule,
    IgxGridFooterComponent,
    IgxGridResizingModule,
    IgxGridSummaryModule,
    IgxAdvancedFilteringDialogComponent,
    IgxGridSharedModules,
    IgxRowExpandedIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxHeaderExpandIndicatorDirective,
    IgxHeaderCollapseIndicatorDirective,
    IgxExcelStyleHeaderIconDirective,
    IgxSortAscendingHeaderIconDirective,
    IgxSortDescendingHeaderIconDirective,
    IgxSortHeaderIconDirective,
    IgxGroupAreaDropDirective,
    IgxGroupByMetaPipe
],
    imports: [
    IgxGridHeadersModule,
    IgxGridResizingModule,
    IgxGridSummaryModule,
    IgxColumnActionsModule,
    IgxGridFilteringModule,
    IgxGridExcelStyleFilteringModule,
    IgxPaginatorModule,
    IgxGridSharedModules,
    IgxTooltipModule,
    ReactiveFormsModule,
    IgxRowDirective,
    IgxGridCellComponent,
    IgxRowAddTextDirective,
    IgxRowEditTemplateDirective,
    IgxRowEditActionsDirective,
    IgxRowEditTextDirective,
    IgxRowEditTabStopDirective,
    IgxGridBodyDirective,
    IgxGridFooterComponent,
    IgxAdvancedFilteringDialogComponent,
    IgxRowExpandedIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxHeaderExpandIndicatorDirective,
    IgxHeaderCollapseIndicatorDirective,
    IgxExcelStyleHeaderIconDirective,
    IgxSortAscendingHeaderIconDirective,
    IgxSortDescendingHeaderIconDirective,
    IgxSortHeaderIconDirective,
    IgxGroupAreaDropDirective,
    IgxGroupByMetaPipe
]
})
export class IgxGridCommonModule { }
