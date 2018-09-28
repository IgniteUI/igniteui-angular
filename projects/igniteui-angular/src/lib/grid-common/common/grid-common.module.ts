import { NgModule, } from '@angular/core';
import { IgxButtonModule } from '../../directives/button/button.directive';
import { IgxDatePickerModule } from '../../date-picker/date-picker.component';
import { IgxIconModule } from '../../icon/index';
import { IgxToggleModule } from '../../directives/toggle/toggle.directive';
import { IgxTextHighlightModule } from '../../directives/text-highlight/text-highlight.directive';
import { IgxTextSelectionModule } from '../../directives/text-selection/text-selection.directive';
import { IgxDropDownModule } from '../../drop-down/drop-down.component';
import { IgxRippleModule } from '../../directives/ripple/ripple.directive';
import { IgxForOfModule } from '../../directives/for-of/for_of.directive';
import { IgxFocusModule } from '../../directives/focus/focus.directive';
import { IgxButtonGroupModule } from '../../buttonGroup/buttonGroup.component';
import { IgxDragDropModule } from '../../directives/dragdrop/dragdrop.directive';
import { IgxBadgeModule } from '../../badge/badge.component';
import { IgxInputGroupModule } from '../../input-group/input-group.component';
import { IgxCheckboxModule } from '../../checkbox/checkbox.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgxGridCellComponent } from '../cell.component';
import { IgxColumnComponent, IgxColumnGroupComponent } from '../column.component';
import { IgxColumnHidingModule } from '../column-hiding/column-hiding.component';
import { IgxColumnPinningModule } from '../column-pinning/column-pinning.component';
import { IgxGridFilterComponent } from '../filtering/grid-filtering.component';
import { IgxGridHeaderComponent } from '../grid-header.component';
import { IgxGridSummaryComponent } from '../summaries/grid-summary.component';
import { IgxGridToolbarComponent } from '../grid-toolbar.component';
import {
    IgxColumnResizerDirective,
    IgxColumnMovingDragDirective,
    IgxColumnMovingDropDirective,
    IgxColumnMovingService,
    IgxDatePipeComponent,
    IgxDecimalPipeComponent,
    IgxCellEditorTemplateDirective,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective
} from './grid-common.misc';
import {
    IgxGridFilteringPipe,
    IgxGridFilterConditionPipe,
    IgxGridSortingPipe
} from './grid-common.pipes';

import { IgxGridFilterExpressionComponent } from '../filtering/grid-filtering-expression.component';
import { IgxSelectionAPIService } from '../../core/selection';
import { IgxRowComponent } from '../row.component';
import { GridBaseAPIService } from '../api.service';
import { IgxTemplateOutletModule } from '../../directives/template-outlet/template_outlet.directive';


@NgModule({
    declarations: [
        IgxGridCellComponent,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxGridHeaderComponent,
        IgxGridSummaryComponent,
        IgxGridToolbarComponent,
        IgxGridFilterComponent,
        IgxGridSortingPipe,
        IgxGridFilteringPipe,
        IgxGridFilterConditionPipe,
        IgxGridFilterExpressionComponent,
        IgxColumnResizerDirective,
        IgxColumnMovingDragDirective,
        IgxColumnMovingDropDirective,
        IgxRowComponent,
        IgxDatePipeComponent,
        IgxDecimalPipeComponent,
        IgxCellEditorTemplateDirective,
        IgxCellFooterTemplateDirective,
        IgxCellHeaderTemplateDirective,
        IgxCellTemplateDirective
    ],
    entryComponents: [
        IgxColumnComponent,
        IgxColumnGroupComponent,
    ],
    exports: [
        IgxGridCellComponent,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxGridHeaderComponent,
        IgxGridFilterComponent,
        IgxGridSortingPipe,
        IgxGridFilteringPipe,
        IgxGridFilterConditionPipe,
        IgxGridSummaryComponent,
        IgxGridToolbarComponent,
        IgxColumnResizerDirective,
        IgxColumnMovingDragDirective,
        IgxColumnMovingDropDirective,
        IgxTemplateOutletModule,
        IgxButtonModule,
        IgxDatePickerModule,
        IgxIconModule,
        IgxRippleModule,
        IgxFocusModule,
        IgxInputGroupModule,
        IgxToggleModule,
        IgxForOfModule,
        IgxTextHighlightModule,
        IgxBadgeModule,
        IgxTextSelectionModule,
        IgxCheckboxModule,
        IgxDragDropModule,
        IgxColumnHidingModule,
        IgxDropDownModule,
        IgxButtonGroupModule,
        IgxColumnPinningModule,
        IgxRowComponent,
        IgxDatePipeComponent,
        IgxDecimalPipeComponent,
        IgxCellEditorTemplateDirective,
        IgxCellFooterTemplateDirective,
        IgxCellHeaderTemplateDirective,
        IgxCellTemplateDirective
    ],
    imports: [
        CommonModule,
        FormsModule,
        IgxButtonModule,
        IgxDatePickerModule,
        IgxIconModule,
        IgxRippleModule,
        IgxFocusModule,
        IgxInputGroupModule,
        IgxToggleModule,
        IgxForOfModule,
        IgxTextHighlightModule,
        IgxTemplateOutletModule,
        IgxBadgeModule,
        IgxTextSelectionModule,
        IgxCheckboxModule,
        IgxDragDropModule,
        IgxColumnHidingModule,
        IgxDropDownModule,
        IgxButtonGroupModule,
        IgxColumnPinningModule
    ],
    providers: [ IgxSelectionAPIService, IgxColumnMovingService ]
  })
  export class IgxGridCommonModule {
    static forRoot(gridType) {
        return {
            ngModule: IgxGridCommonModule,
            providers: [
                { provide: GridBaseAPIService, useClass: gridType }
            ]
        };
    }
  }
