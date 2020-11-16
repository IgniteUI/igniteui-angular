import { NgModule } from '@angular/core';
import { IgxDateRangePickerComponent } from './date-range-picker.component';
import { IgxCalendarModule } from '../calendar/public_api';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { CommonModule } from '@angular/common';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxInputGroupModule } from '../input-group/public_api';
import { IgxIconModule } from '../icon/public_api';
import {
    IgxDateRangeStartComponent, IgxDateRangeEndComponent,
    DateRangePickerFormatPipe,
    IgxPickerToggleComponent,
    IgxDateRangeSeparatorDirective,
    IgxDateRangeInputsBaseComponent
} from './date-range-picker-inputs.common';
import { IgxDateTimeEditorModule } from '../directives/date-time-editor/public_api';

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxDateRangePickerComponent,
        IgxDateRangeStartComponent,
        IgxDateRangeEndComponent,
        IgxDateRangeInputsBaseComponent,
        DateRangePickerFormatPipe,
        IgxPickerToggleComponent,
        IgxDateRangeSeparatorDirective
    ],
    imports: [
        CommonModule,
        IgxIconModule,
        IgxButtonModule,
        IgxToggleModule,
        IgxCalendarModule,
        IgxInputGroupModule,
        IgxDateTimeEditorModule
    ],
    exports: [
        IgxDateRangePickerComponent,
        IgxDateRangeStartComponent,
        IgxDateRangeEndComponent,
        IgxDateRangeSeparatorDirective,
        IgxDateTimeEditorModule,
        IgxPickerToggleComponent,
        IgxInputGroupModule
    ]
})
export class IgxDateRangePickerModule { }
