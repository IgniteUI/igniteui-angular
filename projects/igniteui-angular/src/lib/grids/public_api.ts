import {
    IgxColumnActionsComponent,
    IgxColumnHidingDirective,
    IgxColumnPinningDirective
} from './column-actions/public_api';
import {
    IgxFilterCellTemplateDirective,
    IgxSummaryTemplateDirective,
    IgxCellTemplateDirective,
    IgxCellValidationErrorDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellFooterTemplateDirective,
    IgxCellEditorTemplateDirective,
    IgxCollapsibleIndicatorTemplateDirective,
    IgxColumnComponent,
    IgxColumnGroupComponent,
    IgxColumnLayoutComponent
} from './columns/public_api';
import { IgxAdvancedFilteringDialogComponent } from './filtering/advanced-filtering/advanced-filtering-dialog.component';
import {
    IgxGridExcelStyleFilteringComponent,
    IgxExcelStyleHeaderComponent,
    IgxExcelStyleSortingComponent,
    IgxExcelStylePinningComponent,
    IgxExcelStyleHidingComponent,
    IgxExcelStyleSelectingComponent,
    IgxExcelStyleClearFiltersComponent,
    IgxExcelStyleConditionalFilterComponent,
    IgxExcelStyleMovingComponent,
    IgxExcelStyleSearchComponent,
    IgxExcelStyleColumnOperationsTemplateDirective,
    IgxExcelStyleFilterOperationsTemplateDirective,
    IgxExcelStyleLoadingValuesTemplateDirective
} from './filtering/excel-style/public_api';
import { IgxGridFooterComponent } from './grid-footer/grid-footer.component';
import { IgxExcelStyleHeaderIconDirective, IgxHeaderCollapsedIndicatorDirective, IgxHeaderExpandedIndicatorDirective, IgxRowCollapsedIndicatorDirective, IgxRowExpandedIndicatorDirective, IgxSortAscendingHeaderIconDirective, IgxSortDescendingHeaderIconDirective, IgxSortHeaderIconDirective } from './grid.directives';
import {
    IgxGridHeaderComponent,
    IgxGridHeaderGroupComponent,
    IgxGridHeaderRowComponent
} from './headers/public_api';
import { IgxDragIndicatorIconDirective, IgxRowDragGhostDirective } from './row-drag.directive';
import { IgxRowDirective } from './row.directive';
import {
    IgxRowSelectorDirective,
    IgxGroupByRowSelectorDirective,
    IgxHeadSelectorDirective
} from './selection/public_api';
import { IgxGridStateDirective } from './state.directive';
import {
    IgxCSVTextDirective,
    IgxExcelTextDirective,
    IgxGridToolbarActionsComponent,
    IgxGridToolbarAdvancedFilteringComponent,
    IgxGridToolbarComponent,
    IgxGridToolbarExporterComponent,
    IgxGridToolbarHidingComponent,
    IgxGridToolbarPinningComponent,
    IgxGridToolbarTitleComponent,
    IgxGridToolbarDirective
} from './toolbar/public_api';

export { IgxRowDirective } from './row.directive';
export * from './grid.directives';
export * from './grid-public-row';
export * from './grid-public-cell';
export {
    IgxDragIndicatorIconDirective,
    IgxRowDragGhostDirective
} from './row-drag.directive';
export {
    IgxRowEditTextDirective,
    IgxRowAddTextDirective,
    IgxRowEditActionsDirective,
    IgxRowEditTabStopDirective
} from './grid.rowEdit.directive';
export { IGridState, IColumnState, IGridStateCollection, IGridStateOptions, GridFeatures } from './state-base.directive';
export * from './state.directive';
export * from './columns/public_api';
export * from './headers/public_api';
export * from './common/public_api';
export * from './grid-footer/grid-footer.component';
export { IgxAdvancedFilteringDialogComponent } from './filtering/advanced-filtering/advanced-filtering-dialog.component';
export * from './filtering/excel-style/public_api';
export * from './selection/public_api';
export * from './summaries/grid-summary';
export * from './column-actions/public_api';
export * from './toolbar/public_api';

/*
export * from './api.service';

// export * from './common/shared.module';
export * from './columns/interfaces';
// export * from './headers/headers.module';
// export * from './filtering/base/filtering.module';
export * from './grid-base.directive';
export * from './grid.common';
// export * from './grid-common.module';
//
// export * from './toolbar/toolbar.module';
export * from './grid/grid-validation.service';

export { IgxGridCellComponent } from './cell.component';

export * from './resizing/resize.module';
// export * from './summaries/summary.module';
export * from './grouping/tree-grid-group-by-area.component';
export * from './grouping/grid-group-by-area.component';
export * from './grouping/group-by-area.directive';
export { DropPosition } from './moving/moving.service';
*/

/* NOTE: Common grid directives collection for reuse
    Import `IGX_GRID_DIRECTIVES` or `IGX_TREE_GRID_DIRECTIVES` or `IGX_HIERARCHICAL_GRID_DIRECTIVES` instead of `IGX_GRID_COMMON_DIRECTIVES`
*/
export const IGX_GRID_COMMON_DIRECTIVES = [
    IgxRowDirective,
    IgxGridFooterComponent,
    IgxAdvancedFilteringDialogComponent,
    IgxRowExpandedIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxHeaderExpandedIndicatorDirective,
    IgxHeaderCollapsedIndicatorDirective,
    IgxExcelStyleHeaderIconDirective,
    IgxSortAscendingHeaderIconDirective,
    IgxSortDescendingHeaderIconDirective,
    IgxSortHeaderIconDirective,
    IgxDragIndicatorIconDirective,
    IgxRowDragGhostDirective,
    IgxGridStateDirective,
    // IGX_GRID_HEADERS_DIRECTIVES:
    IgxGridHeaderComponent,
    IgxGridHeaderGroupComponent,
    IgxGridHeaderRowComponent,
    // IGX_GRID_COLUMN_DIRECTIVES:
    IgxFilterCellTemplateDirective,
    IgxSummaryTemplateDirective,
    IgxCellTemplateDirective,
    IgxCellValidationErrorDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellFooterTemplateDirective,
    IgxCellEditorTemplateDirective,
    IgxCollapsibleIndicatorTemplateDirective,
    IgxColumnComponent,
    IgxColumnGroupComponent,
    IgxColumnLayoutComponent,
    // IGX_GRID_COLUMN_ACTIONS_DIRECTIVES:
    IgxColumnActionsComponent,
    IgxColumnHidingDirective,
    IgxColumnPinningDirective,
    // IGX_GRID_SELECTION_DIRECTIVES:
    IgxRowSelectorDirective,
    IgxGroupByRowSelectorDirective,
    IgxHeadSelectorDirective,
    // IGX_GRID_TOOLBAR_DIRECTIVES:
    IgxCSVTextDirective,
    IgxExcelTextDirective,
    IgxGridToolbarActionsComponent,
    IgxGridToolbarAdvancedFilteringComponent,
    IgxGridToolbarComponent,
    IgxGridToolbarExporterComponent,
    IgxGridToolbarHidingComponent,
    IgxGridToolbarPinningComponent,
    IgxGridToolbarTitleComponent,
    IgxGridToolbarDirective,
    // IGX_GRID_EXCEL_STYLE_FILTER_DIRECTIVES:
    IgxGridExcelStyleFilteringComponent,
    IgxExcelStyleHeaderComponent,
    IgxExcelStyleSortingComponent,
    IgxExcelStylePinningComponent,
    IgxExcelStyleHidingComponent,
    IgxExcelStyleSelectingComponent,
    IgxExcelStyleClearFiltersComponent,
    IgxExcelStyleConditionalFilterComponent,
    IgxExcelStyleMovingComponent,
    IgxExcelStyleSearchComponent,
    IgxExcelStyleColumnOperationsTemplateDirective,
    IgxExcelStyleFilterOperationsTemplateDirective,
    IgxExcelStyleLoadingValuesTemplateDirective
] as const;
