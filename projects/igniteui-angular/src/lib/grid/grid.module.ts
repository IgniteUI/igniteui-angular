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
import { IgxIconModule } from '../icon';
import { IgxInputGroupModule } from '../input-group/input-group.component';
import { IgxGridAPIService } from './api.service';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent } from './column.component';
import { IgxGridFilterComponent } from './grid-filtering.component';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxGridSummaryComponent } from './grid-summary.component';
import {
    IgxCellEditorTemplateDirective,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective,
    IgxColumnResizerDirective,
    IgxColumnMovingDragDirective,
    IgxColumnMovingDropDirective,
    IgxColumnMovingService,
    IgxGroupByRowTemplateDirective
} from './grid.common';
import { IgxGridComponent } from './grid.component';
import {
    IgxGridFilterConditionPipe,
    IgxGridFilteringPipe,
    IgxGridPagingPipe,
    IgxGridPostGroupingPipe,
    IgxGridPreGroupingPipe,
    IgxGridSortingPipe
} from './grid.pipes';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridRowComponent } from './row.component';
import { IgxChipsModule } from '../chips/chips.module';

@NgModule({
  declarations: [
    IgxGridCellComponent,
    IgxColumnComponent,
    IgxGridComponent,
    IgxGridRowComponent,
    IgxGridGroupByRowComponent,
    IgxGridHeaderComponent,
    IgxGridSummaryComponent,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxGroupByRowTemplateDirective,
    IgxCellEditorTemplateDirective,
    IgxCellTemplateDirective,
    IgxColumnResizerDirective,
    IgxColumnMovingDragDirective,
    IgxColumnMovingDropDirective,
    IgxGridFilterComponent,
    IgxGridPreGroupingPipe,
    IgxGridPostGroupingPipe,
    IgxGridSortingPipe,
    IgxGridPagingPipe,
    IgxGridFilteringPipe,
    IgxGridFilterConditionPipe
  ],
  entryComponents: [
    IgxColumnComponent
  ],
  exports: [
    IgxGridComponent,
    IgxGridCellComponent,
    IgxGridGroupByRowComponent,
    IgxGridRowComponent,
    IgxColumnComponent,
    IgxGridHeaderComponent,
    IgxGridFilterComponent,
    IgxGridSummaryComponent,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxGroupByRowTemplateDirective,
    IgxCellEditorTemplateDirective,
    IgxCellTemplateDirective,
    IgxColumnResizerDirective,
    IgxColumnMovingDragDirective,
    IgxColumnMovingDropDirective
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
    IgxChipsModule
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
