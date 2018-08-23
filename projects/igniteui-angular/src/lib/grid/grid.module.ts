import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  IgxBadgeModule } from '../badge/badge.component';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxDatePickerModule } from '../date-picker/date-picker.component';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxFocusModule } from '../directives/focus/focus.directive';
import { IgxForOfModule } from '../directives/for-of/for_of.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxTextHighlightModule } from '../directives/text-highlight/text-highlight.directive';
import { IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxDropDownModule } from '../drop-down/drop-down.component';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule } from '../input-group/input-group.component';
import { IgxGridAPIService } from './grid-api.service';
import { IgxGridCellComponent } from '../grid-common/cell.component';
import { IgxColumnComponent, IgxColumnGroupComponent } from '../grid-common/column.component';
import { IgxColumnHidingModule } from '../grid-common/column-hiding/column-hiding.component';
import { IgxGridFilterComponent } from '../grid-common/grid-filtering.component';
import { IgxGridHeaderComponent } from '../grid-common/grid-header.component';
import { IgxGridSummaryComponent } from '../grid-common/grid-summary.component';
import { IgxGridToolbarComponent } from '../grid-common/grid-toolbar.component';
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
    IgxGroupByRowTemplateDirective
} from './grid.misc';
import { IgxGridComponent } from './grid.component';
import {
    IgxGridPagingPipe,
    IgxGridPostGroupingPipe,
    IgxGridPreGroupingPipe
} from './grid.pipes';
import {
    IgxGridFilteringPipe,
    IgxGridFilterConditionPipe,
    IgxGridSortingPipe
} from '../grid-common/grid-common.pipes';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridRowComponent } from './row.component';
import { IgxChipsModule } from '../chips/chips.module';
import { IgxDragDropModule } from '../directives/dragdrop/dragdrop.directive';
import { IgxGridFilterExpressionComponent } from '../grid-common/grid-filtering-expression.component';
import { IgxButtonGroupModule } from '../buttonGroup/buttonGroup.component';
import { IgxColumnPinningModule } from './column-pinning.component';

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
    IgxGridFilterExpressionComponent
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
  providers: [IgxGridAPIService, IgxSelectionAPIService, IgxColumnMovingService]
})
export class IgxGridModule {
    public static forRoot() {
        return {
            ngModule: IgxGridModule,
            providers: [IgxGridAPIService, IgxSelectionAPIService, IgxColumnMovingService]
        };
    }
}
