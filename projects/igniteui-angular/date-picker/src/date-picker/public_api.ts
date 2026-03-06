import { IgxPickerActionsDirective, IgxPickerClearComponent, IgxPickerToggleComponent } from 'igniteui-angular/core';
import { IgxDatePickerComponent } from './date-picker.component';
import { IgxHintDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';
import { IgxCalendarHeaderTemplateDirective, IgxCalendarSubheaderTemplateDirective, IgxCalendarHeaderTitleTemplateDirective } from 'igniteui-angular/calendar';

export * from './date-picker.common';
export * from './date-picker.component';
export * from './calendar-container/calendar-container.component';
export * from './picker-base.directive';

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
