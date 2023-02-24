import { NgModule } from '@angular/core';
import { IgxDateRangePickerComponent } from './date-range-picker.component';

import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { CommonModule } from '@angular/common';



import {
    IgxDateRangeStartComponent, IgxDateRangeEndComponent,
    DateRangePickerFormatPipe,
    IgxDateRangeSeparatorDirective,
    IgxDateRangeInputsBaseComponent
} from './date-range-picker-inputs.common';




/** @hidden */
@NgModule({
    imports: [
    CommonModule,
    IgxToggleModule,
    IgxDateRangePickerComponent,
    IgxDateRangeStartComponent,
    IgxDateRangeEndComponent,
    IgxDateRangeInputsBaseComponent,
    DateRangePickerFormatPipe,
    IgxDateRangeSeparatorDirective
],
    exports: [
    IgxDateRangePickerComponent,
    IgxDateRangeStartComponent,
    IgxDateRangeEndComponent,
    IgxDateRangeSeparatorDirective
]
})
export class IgxDateRangePickerModule { }
