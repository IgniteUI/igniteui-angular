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






import { IgxDropDownModule } from '../../../drop-down/public_api';



import { IgxToggleModule } from '../../../directives/toggle/toggle.directive';


import { IgxSelectModule } from './../../../select/select.module';
import { IgxExcelStylePinningComponent } from './excel-style-pinning.component';
import { IgxExcelStyleHeaderComponent } from './excel-style-header.component';
import { IgxExcelStyleHidingComponent } from './excel-style-hiding.component';
import { IgxExcelStyleSelectingComponent } from './excel-style-selecting.component';
import { IgxExcelStyleClearFiltersComponent } from './excel-style-clear-filters.component';
import { IgxExcelStyleConditionalFilterComponent } from './excel-style-conditional-filter.component';

import { IgxTimePickerModule } from '../../../time-picker/time-picker.component';




/**
 * @hidden
 */
@NgModule({
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
    IgxTimePickerModule,
    IgxDropDownModule,
    IgxToggleModule,
    IgxSelectModule,
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
    providers: [
        IgxSelectionAPIService
    ]
})
export class IgxGridExcelStyleFilteringModule { }
