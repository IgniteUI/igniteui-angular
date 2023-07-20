import { IgxPickerToggleComponent } from '../date-common/picker-icons.common';
import { IgxHintDirective } from '../directives/hint/hint.directive';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxDateRangeEndComponent, IgxDateRangeSeparatorDirective, IgxDateRangeStartComponent } from './date-range-picker-inputs.common';
import { IgxDateRangePickerComponent } from './date-range-picker.component';

export * from './date-range-picker-inputs.common';
export * from './date-range-picker.component';

/* NOTE: Date-range picker directives collection for ease-of-use import in standalone components scenario */
export const IGX_DATE_RANGE_PICKER_DIRECTIVES = [
    IgxDateRangePickerComponent,
    IgxPickerToggleComponent,
    IgxDateRangeStartComponent,
    IgxDateRangeEndComponent,
    IgxDateRangeSeparatorDirective,
    IgxLabelDirective,
    IgxPrefixDirective,
    IgxSuffixDirective,
    IgxHintDirective
] as const;
