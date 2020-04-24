import { NgModule } from '@angular/core';
import { IgxDateRangeComponent } from './igx-date-range.component';
import { IgxCalendarModule } from '../calendar/index';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { CommonModule } from '@angular/common';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxInputGroupModule } from '../input-group/index';
import { IgxIconModule } from '../icon/index';
import {
    IgxDateStartComponent, IgxDateEndComponent,
    DateRangeFormatPipe,
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
        IgxDateRangeComponent,
        IgxDateStartComponent,
        IgxDateEndComponent,
        IgxDateSingleComponent,
        DateRangeFormatPipe,
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
        IgxDateRangeComponent,
        IgxDateStartComponent,
        IgxDateEndComponent,
        IgxPickerToggleComponent,
        IgxDateSeparatorDirective
    ]
})
export class IgxDateRangeModule { }
