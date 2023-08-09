import { IGX_GRID_COLUMN_ACTIONS_DIRECTIVES } from './column-actions/public_api';
import { IGX_GRID_COLUMN_DIRECTIVES } from './columns/public_api';
import { IgxAdvancedFilteringDialogComponent } from './filtering/advanced-filtering/advanced-filtering-dialog.component';
import { IGX_GRID_EXCEL_STYLE_FILTER_DIRECTIVES } from './filtering/excel-style/public_api';
import { IgxGridFooterComponent } from './grid-footer/grid-footer.component';
import { IgxExcelStyleHeaderIconDirective, IgxHeaderCollapsedIndicatorDirective, IgxHeaderExpandedIndicatorDirective, IgxRowCollapsedIndicatorDirective, IgxRowExpandedIndicatorDirective, IgxSortAscendingHeaderIconDirective, IgxSortDescendingHeaderIconDirective, IgxSortHeaderIconDirective } from './grid.directives';
import { IGX_GRID_HEADERS_DIRECTIVES } from './headers/public_api';
import { IgxDragIndicatorIconDirective, IgxRowDragGhostDirective } from './row-drag.directive';
import { IgxRowDirective } from './row.directive';
import { IGX_GRID_SELECTION_DIRECTIVES } from './selection/public_api';
import { IgxGridStateDirective } from './state.directive';
import { IGX_GRID_TOOLBAR_DIRECTIVES } from './toolbar/public_api';

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
    ...IGX_GRID_HEADERS_DIRECTIVES,
    ...IGX_GRID_COLUMN_DIRECTIVES,
    ...IGX_GRID_COLUMN_ACTIONS_DIRECTIVES,
    ...IGX_GRID_SELECTION_DIRECTIVES,
    ...IGX_GRID_TOOLBAR_DIRECTIVES,
    ...IGX_GRID_EXCEL_STYLE_FILTER_DIRECTIVES
] as const;
