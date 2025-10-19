import { IgxPivotDataSelectorComponent } from './pivot-data-selector.component';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { IgxPivotValueChipTemplateDirective } from './pivot-grid.directives';

export * from './pivot-grid.component';
export * from './pivot-grid.interface';
export * from './pivot-grid-aggregate';
export * from './pivot-grid-dimensions';
export * from './pivot-data-selector.component';
export * from './pivot-grid.directives';
export * from '../../data-operations/pivot-strategy';
export * from '../../data-operations/pivot-sort-strategy';

/* Imports that cannot be resolved from IGX_GRID_COMMON_DIRECTIVES spread
    NOTE: Do not remove! Issue: https://github.com/IgniteUI/igniteui-angular/issues/13310
*/
 
import {
    IgxRowDirective,
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

/* NOTE: Pivot grid directives collection for ease-of-use import in standalone components scenario */
export const IGX_PIVOT_GRID_DIRECTIVES = [
    IgxPivotGridComponent,
    IgxPivotDataSelectorComponent,
    IgxPivotValueChipTemplateDirective,
    // IGX_GRID_COMMON_DIRECTIVES:
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
