import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxBadgeModule } from '../badge/badge.component';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxDatePickerModule } from '../date-picker/date-picker.component';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxFocusModule } from '../directives/focus/focus.directive';
import { IgxForOfModule } from '../directives/for-of/for_of.directive';
import { IgxTemplateOutletModule } from '../directives/template-outlet/template_outlet.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxTextHighlightModule } from '../directives/text-highlight/text-highlight.directive';
import { IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxDropDownModule } from '../drop-down/index';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule } from '../input-group/input-group.component';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent, IgxColumnGroupComponent, IgxColumnLayoutComponent } from './column.component';
import { IgxColumnHidingModule } from './column-hiding.component';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxGridToolbarComponent } from './grid-toolbar.component';
import { IgxGridFilteringCellComponent } from './filtering/grid-filtering-cell.component';
import { IgxGridFilteringRowComponent } from './filtering/grid-filtering-row.component';
import { IgxGridFooterComponent } from './grid-footer/grid-footer.component';
import {
    IgxColumnMovingDragDirective,
    IgxColumnMovingDropDirective,
    IgxGridBodyDirective,
    IgxColumnMovingService,
} from './grid.common';
import { IgxGridTransaction } from './grid-base.component';
import { IgxChipsModule } from '../chips/chips.module';
import { IgxDragDropModule } from '../directives/drag-drop/drag-drop.directive';
import { IgxButtonGroupModule } from '../buttonGroup/buttonGroup.component';
import { IgxColumnPinningModule } from './column-pinning.component';
import { IgxBaseTransactionService } from '../services/transaction/base-transaction';
import {
    IgxRowEditTemplateDirective,
    IgxRowEditActionsDirective,
    IgxRowEditTextDirective,
    IgxRowEditTabStopDirective
} from './grid.rowEdit.directive';
import { IgxGridNavigationService } from './grid-navigation.service';
import { IgxGridHeaderGroupComponent } from './grid-header-group.component';
import { IgxGridToolbarCustomContentDirective } from './grid-toolbar.component';
import { IgxSummaryRowComponent } from './summaries/summary-row.component';
import { IgxSummaryCellComponent } from './summaries/summary-cell.component';
import { IgxSummaryDataPipe } from './summaries/grid-root-summary.pipe';
import { IgxGridSelectionService } from '../core/grid-selection';
import { IgxGridSummaryService } from './summaries/grid-summary.service';
import { IgxProgressBarModule } from '../progressbar/progressbar.component';
import { IgxPaginatorModule } from '../paginator/paginator.component';
import { IgxFilterModule } from '../directives/filter/filter.directive';
import { IgxGridPipesModule } from './grid-pipes.module';
import { IgxGridExcelStyleFilteringModule } from './filtering/excel-style/grid.excel-style-filtering.module';
import { IgxGridDragSelectDirective } from './drag-select.directive';
import { IgxRowDragModule } from './row-drag.directive';
import {
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellEditorTemplateDirective,
    IgxCellTemplateDirective,
    IgxFilterCellTemplateDirective
} from './common/templates';
import { IgxRowSelectorsModule } from './igx-row-selectors.module';
import { IgxGridResizingModule } from './resizing/resize.module';
/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxGridCellComponent,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxColumnLayoutComponent,
        IgxGridHeaderComponent,
        IgxGridToolbarComponent,
        IgxGridToolbarCustomContentDirective,
        IgxCellFooterTemplateDirective,
        IgxCellHeaderTemplateDirective,
        IgxCellEditorTemplateDirective,
        IgxCellTemplateDirective,
        IgxRowEditTemplateDirective,
        IgxRowEditActionsDirective,
        IgxRowEditTextDirective,
        IgxRowEditTabStopDirective,
        IgxColumnMovingDragDirective,
        IgxColumnMovingDropDirective,
        IgxGridBodyDirective,
        IgxGridFilteringCellComponent,
        IgxGridFilteringRowComponent,
        IgxSummaryDataPipe,
        IgxGridHeaderGroupComponent,
        IgxSummaryRowComponent,
        IgxSummaryCellComponent,
        IgxGridDragSelectDirective,
        IgxFilterCellTemplateDirective,
        IgxGridFooterComponent
    ],
    entryComponents: [
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxColumnLayoutComponent
    ],
    exports: [
        IgxGridCellComponent,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxColumnLayoutComponent,
        IgxGridHeaderComponent,
        IgxGridToolbarComponent,
        IgxGridToolbarCustomContentDirective,
        IgxCellFooterTemplateDirective,
        IgxCellHeaderTemplateDirective,
        IgxCellEditorTemplateDirective,
        IgxCellTemplateDirective,
        IgxRowEditTemplateDirective,
        IgxRowEditActionsDirective,
        IgxRowEditTextDirective,
        IgxRowEditTabStopDirective,
        IgxColumnMovingDragDirective,
        IgxColumnMovingDropDirective,
        IgxGridBodyDirective,
        IgxSummaryDataPipe,
        IgxButtonModule,
        IgxDatePickerModule,
        IgxIconModule,
        IgxRippleModule,
        IgxInputGroupModule,
        IgxToggleModule,
        IgxForOfModule,
        IgxTemplateOutletModule,
        IgxFocusModule,
        IgxTextHighlightModule,
        IgxTextSelectionModule,
        IgxCheckboxModule,
        IgxBadgeModule,
        IgxChipsModule,
        IgxDragDropModule,
        IgxColumnHidingModule,
        IgxDropDownModule,
        IgxButtonGroupModule,
        IgxColumnPinningModule,
        IgxProgressBarModule,
        IgxGridFilteringCellComponent,
        IgxGridFilteringRowComponent,
        IgxGridHeaderGroupComponent,
        IgxSummaryRowComponent,
        IgxSummaryCellComponent,
        IgxGridDragSelectDirective,
        IgxFilterModule,
        IgxGridPipesModule,
        IgxGridExcelStyleFilteringModule,
        IgxFilterCellTemplateDirective,
        IgxRowDragModule,
        IgxPaginatorModule,
        IgxGridFooterComponent,
        IgxRowSelectorsModule,
        IgxGridResizingModule
    ],
    imports: [
        CommonModule,
        IgxGridResizingModule,
        FormsModule,
        IgxButtonModule,
        IgxDatePickerModule,
        IgxIconModule,
        IgxRippleModule,
        IgxInputGroupModule,
        IgxToggleModule,
        IgxForOfModule,
        IgxTemplateOutletModule,
        IgxFocusModule,
        IgxTextHighlightModule,
        IgxTextSelectionModule,
        IgxCheckboxModule,
        IgxBadgeModule,
        IgxChipsModule,
        IgxDragDropModule,
        IgxColumnHidingModule,
        IgxDropDownModule,
        IgxButtonGroupModule,
        IgxColumnPinningModule,
        IgxProgressBarModule,
        IgxFilterModule,
        IgxGridPipesModule,
        IgxGridExcelStyleFilteringModule,
        IgxRowDragModule,
        IgxPaginatorModule,
        IgxRowSelectorsModule
    ],
    providers: [
        IgxGridSelectionService,
        IgxSelectionAPIService,
        IgxColumnMovingService,
        IgxGridNavigationService,
        IgxGridSummaryService,
        { provide: IgxGridTransaction, useClass: IgxBaseTransactionService }
    ]
})
export class IgxGridCommonModule { }
