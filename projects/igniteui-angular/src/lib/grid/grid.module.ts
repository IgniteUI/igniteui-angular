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
import { IgxDropDownModule } from '../drop-down/drop-down.component';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule } from '../input-group/input-group.component';
import { IgxGridAPIService } from './api.service';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent, IgxColumnGroupComponent } from './column.component';
import { IgxColumnHidingModule } from './column-hiding.component';
import { IgxGridFilterComponent } from './grid-filtering.component';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxGridSummaryComponent } from './grid-summary.component';
import { IgxGridToolbarComponent } from './grid-toolbar.component';
import {
    IgxCellEditorTemplateDirective,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective,
    IgxColumnResizerDirective,
    IgxColumnMovingDragDirective,
    IgxColumnMovingDropDirective,
    IgxGroupAreaDropDirective,
    IgxColumnMovingService,
    IgxGroupByRowTemplateDirective,
    IgxDecimalPipeComponent,
    IgxDatePipeComponent
} from './grid.common';
import { IgxGridComponent, IgxGridTransaction } from './grid.component';
import {
    IgxGridFilterConditionPipe,
    IgxGridFilteringPipe,
    IgxGridPagingPipe,
    IgxGridPostGroupingPipe,
    IgxGridPreGroupingPipe,
    IgxGridSortingPipe,
    IgxGridTransactionPipe
} from './grid.pipes';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridRowComponent } from './row.component';
import { IgxChipsModule } from '../chips/chips.module';
import { IgxDragDropModule } from '../directives/dragdrop/dragdrop.directive';
import { IgxGridFilterExpressionComponent } from './grid-filtering-expression.component';
import { IgxButtonGroupModule } from '../buttonGroup/buttonGroup.component';
import { IgxColumnPinningModule } from './column-pinning.component';
import { TransactionService } from '../services';
import { IgxBaseTransactionService } from '../services/transaction/base-transaction';
import { IgxRowEditTemplateDirective, IgxRowEditTabStopDirective} from './grid.rowEdit.directive';

@NgModule({
    declarations: [
        IgxGridCellComponent,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxGridComponent,
        IgxGridRowComponent,
        IgxGridGroupByRowComponent,
        IgxGridHeaderComponent,
        IgxGridSummaryComponent,
        IgxGridToolbarComponent,
        IgxCellFooterTemplateDirective,
        IgxCellHeaderTemplateDirective,
        IgxGroupByRowTemplateDirective,
        IgxCellEditorTemplateDirective,
        IgxCellTemplateDirective,
        IgxRowEditTemplateDirective,
        IgxRowEditTabStopDirective,
        IgxColumnResizerDirective,
        IgxColumnMovingDragDirective,
        IgxColumnMovingDropDirective,
        IgxGroupAreaDropDirective,
        IgxGridFilterComponent,
        IgxGridPreGroupingPipe,
        IgxGridPostGroupingPipe,
        IgxGridSortingPipe,
        IgxGridPagingPipe,
        IgxGridFilteringPipe,
        IgxGridFilterConditionPipe,
        IgxGridFilterExpressionComponent,
        IgxGridTransactionPipe,
        IgxDatePipeComponent,
        IgxDecimalPipeComponent

    ],
    entryComponents: [
        IgxColumnComponent,
        IgxColumnGroupComponent,
    ],
    exports: [
        IgxGridComponent,
        IgxGridCellComponent,
        IgxGridGroupByRowComponent,
        IgxGridRowComponent,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxGridHeaderComponent,
        IgxGridFilterComponent,
        IgxGridSummaryComponent,
        IgxGridToolbarComponent,
        IgxCellFooterTemplateDirective,
        IgxCellHeaderTemplateDirective,
        IgxGroupByRowTemplateDirective,
        IgxCellEditorTemplateDirective,
        IgxCellTemplateDirective,
        IgxRowEditTemplateDirective,
        IgxRowEditTabStopDirective,
        IgxColumnResizerDirective,
        IgxColumnMovingDragDirective,
        IgxColumnMovingDropDirective,
        IgxGroupAreaDropDirective
    ],
    imports: [
        CommonModule,
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
        IgxColumnPinningModule
    ],
    providers: [
        IgxGridAPIService,
        IgxSelectionAPIService,
        IgxColumnMovingService,
        { provide: IgxGridTransaction, useClass: IgxBaseTransactionService }
    ]
})
export class IgxGridModule {
    public static forRoot() {
        return {
            ngModule: IgxGridModule,
            providers: [
                IgxGridAPIService,
                IgxSelectionAPIService,
                IgxColumnMovingService
            ]
        };
    }
}
