import { NgModule } from '@angular/core';
import { IgxDateRangePickerComponent } from './igx-date-range.component';
import { IgxCalendarModule } from '../calendar/index';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { CommonModule } from '@angular/common';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxInputGroupModule } from '../input-group/index';
import { IgxIconModule } from '../icon/index';
import {
    IgxDateStartComponent, IgxDateEndComponent,
    DateRangePickerFormatPipe,
    IgxDateSingleComponent,
    IgxPickerToggleComponent,
    IgxDateSeparatorDirective
} from './igx-date-range-inputs.common';
import { IgxDateTimeEditorModule } from '../directives/date-time-editor';

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxDateRangePickerComponent,
        IgxDateStartComponent,
        IgxDateEndComponent,
        IgxDateSingleComponent,
        DateRangePickerFormatPipe,
        IgxPickerToggleComponent,
        IgxDateSeparatorDirective
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
        IgxDateStartComponent,
        IgxDateEndComponent,
        IgxPickerToggleComponent,
        IgxDateSeparatorDirective
    ]
})
export class IgxDateRangePickerModule { }
