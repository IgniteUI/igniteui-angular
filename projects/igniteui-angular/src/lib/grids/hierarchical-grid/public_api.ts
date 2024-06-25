import { IGX_GRID_COMMON_DIRECTIVES, IGX_GRID_VALIDATION_DIRECTIVES } from '../public_api';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';

export * from './events';
export * from './hierarchical-grid.component';
export * from './row-island.component';

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

/* NOTE: Hierarchical grid directives collection for ease-of-use import in standalone components scenario */
export const IGX_HIERARCHICAL_GRID_DIRECTIVES = [
    IgxHierarchicalGridComponent,
    IgxRowIslandComponent,
    IgxRowAddTextDirective,
    IgxRowEditActionsDirective,
    IgxRowEditTextDirective,
    IgxRowEditTabStopDirective,
    ...IGX_GRID_COMMON_DIRECTIVES,
    ...IGX_GRID_VALIDATION_DIRECTIVES,
    ...IGX_PAGINATOR_DIRECTIVES
] as const;
