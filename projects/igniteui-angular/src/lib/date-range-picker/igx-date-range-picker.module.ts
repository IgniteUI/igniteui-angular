import { NgModule } from '@angular/core';
import { IgxDateRangePickerComponent } from './igx-date-range-picker.component';
import { IgxCalendarModule } from '../calendar/index';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { CommonModule } from '@angular/common';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxInputGroupModule } from '../input-group/index';
import { IgxIconModule } from '../icon/index';
import {
    IgxDateRangeStartComponent, IgxDateRangeEndComponent,
    DateRangePickerFormatPipe,
    IgxDateRangeSingleComponent,
    IgxPickerToggleComponent,
    IgxDateRangeSeparatorDirective
} from './igx-date-range-picker-inputs.common';
import { IgxDateTimeEditorModule } from '../directives/date-time-editor';

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxDateRangePickerComponent,
        IgxDateRangeStartComponent,
        IgxDateRangeEndComponent,
        IgxDateRangeSingleComponent,
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
        IgxPickerToggleComponent
    ]
})
export class IgxDateRangePickerModule { }
