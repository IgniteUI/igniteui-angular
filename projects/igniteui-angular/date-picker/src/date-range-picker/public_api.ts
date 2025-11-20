import { IgxPickerClearComponent, IgxPickerToggleComponent } from 'igniteui-angular/core';
import { IgxDateRangeEndComponent, IgxDateRangeSeparatorDirective, IgxDateRangeStartComponent } from './date-range-picker-inputs.common';
import { IgxDateRangePickerComponent } from './date-range-picker.component';
import { IgxHintDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';
import { IgxCalendarHeaderTemplateDirective, IgxCalendarHeaderTitleTemplateDirective, IgxCalendarSubheaderTemplateDirective } from 'igniteui-angular/calendar';

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
