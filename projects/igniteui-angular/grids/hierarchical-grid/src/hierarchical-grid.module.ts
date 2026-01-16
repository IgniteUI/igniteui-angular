import { NgModule } from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';

/* Imports that cannot be resolved from IGX_GRID_COMMON_DIRECTIVES spread
    NOTE: Do not remove! Issue: https://github.com/IgniteUI/igniteui-angular/issues/13310
*/
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
    IgxColumnPatternValidatorDirective,
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
    IgxExcelStyleLoadingValuesTemplateDirective,
    IgxGridActionButtonComponent,
    IgxGridActionsBaseDirective,
    IgxGridEditingActionsComponent,
    IgxGridPinningActionsComponent
} from "igniteui-angular/grids/core";
import {
    IgxPaginatorComponent,
    IgxPageNavigationComponent,
    IgxPageSizeSelectorComponent,
    IgxPaginatorContentDirective,
    IgxPaginatorDirective
} from 'igniteui-angular/paginator';

/* NOTE: Hierarchical grid directives collection for ease-of-use import in standalone components scenario */
export const IGX_HIERARCHICAL_GRID_DIRECTIVES = [
    IgxHierarchicalGridComponent,
    IgxRowIslandComponent,
    IgxRowAddTextDirective,
    IgxRowEditActionsDirective,
    IgxRowEditTextDirective,
    IgxRowEditTabStopDirective,
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
    // IGX_GRID_ACTIONS
    IgxGridPinningActionsComponent,
    IgxGridEditingActionsComponent,
    IgxGridActionsBaseDirective,
    IgxGridActionButtonComponent,
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
    IgxExcelStyleLoadingValuesTemplateDirective,
    // IGX_GRID_VALIDATION_DIRECTIVES:
    IgxColumnRequiredValidatorDirective,
    IgxColumnMinValidatorDirective,
    IgxColumnMaxValidatorDirective,
    IgxColumnEmailValidatorDirective,
    IgxColumnMinLengthValidatorDirective,
    IgxColumnMaxLengthValidatorDirective,
    IgxColumnPatternValidatorDirective,
    // IGX_PAGINATOR_DIRECTIVES:
    IgxPaginatorComponent,
    IgxPageNavigationComponent,
    IgxPageSizeSelectorComponent,
    IgxPaginatorContentDirective,
    IgxPaginatorDirective
] as const;

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_HIERARCHICAL_GRID_DIRECTIVES
    ],
    exports: [
        ...IGX_HIERARCHICAL_GRID_DIRECTIVES
    ]
})
export class IgxHierarchicalGridModule {
}
