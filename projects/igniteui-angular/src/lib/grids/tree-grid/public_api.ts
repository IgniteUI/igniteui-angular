import { IGX_GRID_COMMON_DIRECTIVES, IGX_GRID_VALIDATION_DIRECTIVES } from '../public_api';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridGroupByAreaComponent } from '../grouping/tree-grid-group-by-area.component';
import { IgxTreeGridGroupingPipe } from './tree-grid.grouping.pipe';

export * from './tree-grid.component';
export * from './tree-grid.interfaces';
export * from './tree-grid.filtering.strategy';
export * from './tree-grid.grouping.pipe';
export * from '../grouping/tree-grid-group-by-area.component';
export * from './tree-grid.grouping.pipe';

/* Imports that cannot be resolved from IGX_GRID_COMMON_DIRECTIVES spread
    NOTE: Do not remove! Issue: https://github.com/IgniteUI/igniteui-angular/issues/13310
*/
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    IgxRowDirective,
    IgxRowEditTextDirective,
    IgxRowAddTextDirective,
    IgxRowEditActionsDirective,
    IgxRowEditTabStopDirective,
    IgxGridFooterComponent,
    IgxAdvancedFilteringDialogComponent,
    IgxHeaderCollapsedIndicatorDirective,
    IgxHeaderExpandedIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxRowExpandedIndicatorDirective,
    IgxSortAscendingHeaderIconDirective,
    IgxSortDescendingHeaderIconDirective,
    IgxSortHeaderIconDirective,
    IgxExcelStyleHeaderIconDirective,
    IgxDragIndicatorIconDirective,
    IgxRowDragGhostDirective,
    IgxGridStateDirective,
    IgxGridHeaderComponent,
    IgxGridHeaderGroupComponent,
    IgxGridHeaderRowComponent,
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
    IgxColumnRequiredValidatorDirective,
    IgxColumnMinValidatorDirective,
    IgxColumnMaxValidatorDirective,
    IgxColumnEmailValidatorDirective,
    IgxColumnMinLengthValidatorDirective,
    IgxColumnMaxLengthValidatorDirective,
    IgxColumPatternValidatorDirective,
    IgxColumnActionsComponent,
    IgxColumnHidingDirective,
    IgxColumnPinningDirective,
    IgxRowSelectorDirective,
    IgxGroupByRowSelectorDirective,
    IgxHeadSelectorDirective,
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
} from "../public_api";
import {
    IgxPaginatorComponent,
    IgxPageNavigationComponent,
    IgxPageSizeSelectorComponent,
    IgxPaginatorContentDirective,
    IgxPaginatorDirective,
    IGX_PAGINATOR_DIRECTIVES
} from '../../paginator/public_api';

/* NOTE: Tree grid directives collection for ease-of-use import in standalone components scenario */
export const IGX_TREE_GRID_DIRECTIVES = [
    IgxTreeGridComponent,
    IgxTreeGridGroupByAreaComponent,
    IgxTreeGridGroupingPipe,
    IgxRowAddTextDirective,
    IgxRowEditActionsDirective,
    IgxRowEditTextDirective,
    IgxRowEditTabStopDirective,
    ...IGX_GRID_COMMON_DIRECTIVES,
    ...IGX_GRID_VALIDATION_DIRECTIVES,
    ...IGX_PAGINATOR_DIRECTIVES
] as const;
