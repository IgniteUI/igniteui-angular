import { IgxCalendarComponent } from './calendar.component';
import { IgxCalendarHeaderTemplateDirective, IgxCalendarHeaderTitleTemplateDirective, IgxCalendarMonthDirective, IgxCalendarSubheaderTemplateDirective, IgxCalendarYearDirective } from './calendar.directives';
import { IgxDaysViewComponent } from './days-view/days-view.component';
import { IgxMonthPickerComponent } from './month-picker/month-picker.component';
import { IgxMonthsViewComponent } from './months-view/months-view.component';
import { IgxYearsViewComponent } from './years-view/years-view.component';

export * from './calendar';
export * from './calendar.component';
export * from './calendar.directives';
export * from './days-view/days-view.component';
export * from './months-view/months-view.component';
export * from './years-view/years-view.component';
export * from './month-picker/month-picker.component';

/* NOTE: Calendar directives collection for ease-of-use import in standalone components scenario */
export const IGX_CALENDAR_DIRECTIVES = [
    IgxCalendarComponent,
    IgxDaysViewComponent,
    IgxMonthsViewComponent,
    IgxYearsViewComponent,
    IgxMonthPickerComponent,
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarHeaderTitleTemplateDirective,
    IgxCalendarMonthDirective,
    IgxCalendarYearDirective,
    IgxCalendarSubheaderTemplateDirective
] as const;

