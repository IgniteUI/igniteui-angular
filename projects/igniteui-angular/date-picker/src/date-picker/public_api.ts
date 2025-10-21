import { IgxCalendarHeaderTemplateDirective, IgxCalendarHeaderTitleTemplateDirective, IgxCalendarSubheaderTemplateDirective } from '../calendar/calendar.directives';
import { IgxPickerActionsDirective, IgxPickerClearComponent, IgxPickerToggleComponent } from '../date-common/picker-icons.common';
import { IgxHintDirective } from 'igniteui-angular/directives';
import { IgxLabelDirective } from 'igniteui-angular/directives';
import { IgxPrefixDirective } from 'igniteui-angular/directives';
import { IgxSuffixDirective } from 'igniteui-angular/directives';
import { IgxDatePickerComponent } from './date-picker.component';

export * from './date-picker.common';
export * from './date-picker.component';
export * from './calendar-container/calendar-container.component';

/* NOTE: Date picker directives collection for ease-of-use import in standalone components scenario */
export const IGX_DATE_PICKER_DIRECTIVES = [
    IgxDatePickerComponent,
    IgxPickerToggleComponent,
    IgxPickerClearComponent,
    IgxPickerActionsDirective,
    IgxLabelDirective,
    IgxPrefixDirective,
    IgxSuffixDirective,
    IgxHintDirective,
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarSubheaderTemplateDirective,
    IgxCalendarHeaderTitleTemplateDirective
] as const;
