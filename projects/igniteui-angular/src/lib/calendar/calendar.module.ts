import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxIconModule } from '../icon/index';
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
import { IgxDayItemComponent } from './days-view/day-item.component';
import { IgxMonthPickerComponent } from './month-picker/month-picker.component';

@NgModule({
    declarations: [
        IgxDayItemComponent,
        IgxDaysViewComponent,
        IgxCalendarComponent,
        IgxCalendarHeaderTemplateDirective,
        IgxCalendarMonthDirective,
        IgxCalendarYearDirective,
        IgxCalendarSubheaderTemplateDirective,
        IgxMonthsViewComponent,
        IgxYearsViewComponent,
        IgxMonthPickerComponent
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
    ],
    imports: [CommonModule, FormsModule, IgxIconModule]
})
export class IgxCalendarModule { }
