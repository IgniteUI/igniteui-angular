import { IGX_PAGINATOR_DIRECTIVES } from '../paginator/public_api';
import { IgxGridCellComponent } from './cell.component';
import { IGX_GRID_COLUMN_DIRECTIVES, IGX_GRID_VALIDATION_DIRECTIVES } from './columns/public_api';
import { IgxAdvancedFilteringDialogComponent } from './filtering/advanced-filtering/advanced-filtering-dialog.component';
import { IGX_GRID_EXCEL_STYLE_FILTER_DIRECTIVES } from './filtering/excel-style/public_api';
import { IgxGridFooterComponent } from './grid-footer/grid-footer.component';
import { IgxRowAddTextDirective, IgxRowEditActionsDirective, IgxRowEditTabStopDirective, IgxRowEditTemplateDirective, IgxRowEditTextDirective } from './grid.rowEdit.directive';
import { IgxExcelStyleHeaderIconDirective, IgxGroupAreaDropDirective, IgxHeaderCollapseIndicatorDirective, IgxHeaderExpandIndicatorDirective, IgxRowCollapsedIndicatorDirective, IgxRowExpandedIndicatorDirective, IgxSortAscendingHeaderIconDirective, IgxSortDescendingHeaderIconDirective, IgxSortHeaderIconDirective } from './grid/grid.directives';
import { IGX_GRID_HEADERS_DIRECTIVES } from './headers/public_api';
import { IgxDragIndicatorIconDirective, IgxRowDragGhostDirective } from './row-drag.directive';
import { IgxRowDirective } from './row.directive';
import { IGX_GRID_SELECTION_DIRECTIVES } from './selection/public_api';
import { IGX_GRID_TOOLBAR_DIRECTIVES } from './toolbar/public_api';

export * from './api.service';
export * from './columns/column.component';
// export * from './common/shared.module';
export * from './columns/interfaces';
// export * from './headers/headers.module';
export * from './common/events';
export * from './common/strategy';
// export * from './filtering/base/filtering.module';
// export { IgxGridExcelStyleFilteringModule } from './filtering/excel-style/grid.excel-style-filtering.module';
export { IgxAdvancedFilteringDialogComponent } from './filtering/advanced-filtering/advanced-filtering-dialog.component';
export * from './grid-base.directive';
export * from './grid.common';
export * from './grid-public-row';
export * from './grid-public-cell';
export {
    CellType, RowType, IGX_GRID_BASE, ValidationStatus, IGridFormGroupCreatedEventArgs, IGridValidationState, IGridValidationStatusEventArgs, IRecordValidationState, IFieldValidationState, ColumnType,
    IgxGridMasterDetailContext, IgxGroupByRowTemplateContext, IgxGridTemplateContext, IgxGridRowTemplateContext, IgxGridRowDragGhostContext, IgxGridEmptyTemplateContext, IgxGridRowEditTemplateContext,
    IgxGridRowEditTextTemplateContext, IgxGridRowEditActionsTemplateContext, IgxGridHeaderTemplateContext, IgxColumnTemplateContext, IgxCellTemplateContext, IgxGroupByRowSelectorTemplateContext,
    IgxHeadSelectorTemplateContext, IgxSummaryTemplateContext, IgxHeadSelectorTemplateDetails, IgxGroupByRowSelectorTemplateDetails, IgxRowSelectorTemplateContext, IgxRowSelectorTemplateDetails
} from './common/grid.interface';
export * from './summaries/grid-summary';
// export * from './grid-common.module';
export * from './grid.rowEdit.directive';
export * from './row-drag.directive';
// export * from './column-actions/column-actions.module';
export * from './state.directive';
// export * from './toolbar/toolbar.module';
export * from './grid/grid-validation.service';

export { IgxGridCellComponent } from './cell.component';

export * from './grid-footer/grid-footer.component';
export * from './resizing/resize.module';
// export * from './summaries/summary.module';
export * from './grouping/tree-grid-group-by-area.component';
export * from './grouping/grid-group-by-area.component';
export * from './grouping/group-by-area.directive';
export { DropPosition } from './moving/moving.service';

/* NOTE: Common grid directives collection for ease-of-use import in standalone components scenario */
export const IGX_GRID_COMMON_DIRECTIVES = [
    IgxRowDirective,
    IgxGridCellComponent,
    IgxRowAddTextDirective,
    IgxRowEditTemplateDirective,
    IgxRowEditActionsDirective,
    IgxRowEditTextDirective,
    IgxRowEditTabStopDirective,
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
    IgxDragIndicatorIconDirective,
    IgxRowDragGhostDirective,
    ...IGX_GRID_HEADERS_DIRECTIVES,
    ...IGX_GRID_COLUMN_DIRECTIVES,
    ...IGX_GRID_VALIDATION_DIRECTIVES,
    ...IGX_GRID_SELECTION_DIRECTIVES,
    ...IGX_GRID_TOOLBAR_DIRECTIVES,
    ...IGX_GRID_EXCEL_STYLE_FILTER_DIRECTIVES,
    ...IGX_PAGINATOR_DIRECTIVES
] as const;
