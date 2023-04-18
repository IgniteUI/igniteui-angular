import { NgModule } from '@angular/core';
import { IgxCalendarComponent } from './calendar.component';
import {
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarMonthDirective,
    IgxCalendarSubheaderTemplateDirective,
    IgxCalendarYearDirective
} from './calendar.directives';
import { IgxMonthsViewComponent } from './months-view/months-view.component';
import { IgxYearsViewComponent } from './years-view/years-view.component';
import { IgxDaysViewComponent } from './days-view/days-view.component';
import { IgxMonthPickerComponent } from './month-picker/month-picker.component';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        IgxCalendarComponent,
        IgxDaysViewComponent,
        IgxMonthsViewComponent,
        IgxYearsViewComponent,
        IgxMonthPickerComponent,
        IgxCalendarHeaderTemplateDirective,
        IgxCalendarMonthDirective,
        IgxCalendarYearDirective,
        IgxCalendarSubheaderTemplateDirective
    ],
    exports: [
        IgxCalendarComponent,
        IgxDaysViewComponent,
        IgxMonthsViewComponent,
        IgxYearsViewComponent,
        IgxMonthPickerComponent,
        IgxCalendarHeaderTemplateDirective,
        IgxCalendarMonthDirective,
        IgxCalendarYearDirective,
        IgxCalendarSubheaderTemplateDirective
    ]
})
export class IgxCalendarModule { }
