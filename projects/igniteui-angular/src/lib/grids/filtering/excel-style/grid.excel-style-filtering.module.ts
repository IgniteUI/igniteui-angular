import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxExcelStyleLoadingValuesTemplateDirective } from './excel-style-search.component';
import {
    IgxGridExcelStyleFilteringComponent,
    IgxExcelStyleColumnOperationsTemplateDirective,
    IgxExcelStyleFilterOperationsTemplateDirective
} from './grid.excel-style-filtering.component';
import { IgxExcelStyleSortingComponent } from './excel-style-sorting.component';
import { IgxExcelStyleMovingComponent } from './excel-style-moving.component';
import { IgxExcelStyleSearchComponent } from './excel-style-search.component';
import { IgxExcelStyleCustomDialogComponent } from './excel-style-custom-dialog.component';
import { IgxExcelStyleDefaultExpressionComponent } from './excel-style-default-expression.component';
import { IgxExcelStyleDateExpressionComponent } from './excel-style-date-expression.component';
import { IgxSelectionAPIService } from '../../../core/selection';
import { FormsModule } from '@angular/forms';
import { IgxGridPipesModule } from '../../common/grid-pipes.module';
import { IgxButtonModule } from '../../../directives/button/button.directive';
import { IgxButtonGroupModule } from '../../../buttonGroup/buttonGroup.component';
import { IgxDatePickerModule } from '../../../date-picker/date-picker.component';
import { IgxIconModule } from '../../../icon/public_api';
import { IgxRippleModule } from '../../../directives/ripple/ripple.directive';
import { IgxInputGroupModule } from '../../../input-group/input-group.component';
import { IgxDropDownModule } from '../../../drop-down/public_api';
import { IgxForOfModule } from '../../../directives/for-of/for_of.directive';
import { IgxCheckboxModule } from '../../../checkbox/checkbox.component';
import { IgxFilterModule } from '../../../directives/filter/filter.directive';
import { IgxToggleModule } from '../../../directives/toggle/toggle.directive';
import { IgxListModule } from '../../../list/list.component';
import { IgxProgressBarModule } from '../../../progressbar/progressbar.component';
import { IgxSelectModule } from './../../../select/select.module';
import { IgxExcelStylePinningComponent } from './excel-style-pinning.component';
import { IgxExcelStyleHeaderComponent } from './excel-style-header.component';
import { IgxExcelStyleHidingComponent } from './excel-style-hiding.component';
import { IgxExcelStyleSelectingComponent } from './excel-style-selecting.component';
import { IgxExcelStyleClearFiltersComponent } from './excel-style-clear-filters.component';
import { IgxExcelStyleConditionalFilterComponent } from './excel-style-conditional-filter.component';
import { IgxTimePickerModule } from '../../../time-picker/time-picker.component';
import { IgxFocusModule } from '../../../directives/focus/focus.directive';
import { IgxDateTimeEditorModule } from '../../../directives/date-time-editor/date-time-editor.directive';

/**
 * @hidden
 */
@NgModule({
    declarations: [
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
        IgxExcelStyleCustomDialogComponent,
        IgxExcelStyleDefaultExpressionComponent,
        IgxExcelStyleDateExpressionComponent,
        IgxExcelStyleColumnOperationsTemplateDirective,
        IgxExcelStyleFilterOperationsTemplateDirective,
        IgxExcelStyleLoadingValuesTemplateDirective
    ],
    exports: [
        IgxGridExcelStyleFilteringComponent,
        IgxExcelStyleColumnOperationsTemplateDirective,
        IgxExcelStyleFilterOperationsTemplateDirective,
        IgxExcelStyleLoadingValuesTemplateDirective,
        IgxExcelStyleDateExpressionComponent,
        IgxExcelStyleHeaderComponent,
        IgxExcelStyleSortingComponent,
        IgxExcelStylePinningComponent,
        IgxExcelStyleHidingComponent,
        IgxExcelStyleSelectingComponent,
        IgxExcelStyleClearFiltersComponent,
        IgxExcelStyleConditionalFilterComponent,
        IgxExcelStyleMovingComponent,
        IgxExcelStyleSearchComponent,
        IgxExcelStyleHeaderComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IgxGridPipesModule,
        IgxButtonModule,
        IgxButtonGroupModule,
        IgxDatePickerModule,
        IgxTimePickerModule,
        IgxIconModule,
        IgxRippleModule,
        IgxInputGroupModule,
        IgxDropDownModule,
        IgxForOfModule,
        IgxCheckboxModule,
        IgxFilterModule,
        IgxToggleModule,
        IgxListModule,
        IgxProgressBarModule,
        IgxSelectModule,
        IgxFocusModule,
        IgxDateTimeEditorModule
    ],
    entryComponents: [
        IgxGridExcelStyleFilteringComponent
    ],
    providers: [
        IgxSelectionAPIService
    ]
})
export class IgxGridExcelStyleFilteringModule {

}
