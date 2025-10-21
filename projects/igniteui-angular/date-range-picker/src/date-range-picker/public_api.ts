import { IgxCalendarHeaderTemplateDirective, IgxCalendarHeaderTitleTemplateDirective, IgxCalendarSubheaderTemplateDirective } from '../calendar/calendar.directives';
import { IgxPickerClearComponent, IgxPickerToggleComponent } from '../date-common/picker-icons.common';
import { IgxHintDirective } from 'igniteui-angular/directives';
import { IgxLabelDirective } from 'igniteui-angular/directives';
import { IgxPrefixDirective } from 'igniteui-angular/directives';
import { IgxSuffixDirective } from 'igniteui-angular/directives';
import { IgxDateRangeEndComponent, IgxDateRangeSeparatorDirective, IgxDateRangeStartComponent } from './date-range-picker-inputs.common';
import { IgxDateRangePickerComponent } from './date-range-picker.component';

export * from './date-range-picker-inputs.common';
export * from './date-range-picker.component';

/* NOTE: Date-range picker directives collection for ease-of-use import in standalone components scenario */
export const IGX_DATE_RANGE_PICKER_DIRECTIVES = [
    IgxDateRangePickerComponent,
    IgxPickerToggleComponent,
    IgxPickerClearComponent,
    IgxDateRangeStartComponent,
    IgxDateRangeEndComponent,
    IgxDateRangeSeparatorDirective,
    IgxLabelDirective,
    IgxPrefixDirective,
    IgxSuffixDirective,
    IgxHintDirective,
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarSubheaderTemplateDirective,
    IgxCalendarHeaderTitleTemplateDirective
] as const;
