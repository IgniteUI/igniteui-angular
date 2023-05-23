import { IgxPickerActionsDirective, IgxPickerClearComponent, IgxPickerToggleComponent } from '../date-common/picker-icons.common';
import { IgxHintDirective } from '../directives/hint/hint.directive';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxDatePickerComponent } from './date-picker.component';

export * from './date-picker.component';

/* NOTE: Date picker directives collection for ease-of-use import in standalone components scenario */
export const IGX_DATE_PICKER_DIRECTIVES = [
    IgxDatePickerComponent,
    IgxPickerToggleComponent,
    IgxPickerClearComponent,
    IgxPickerActionsDirective,
    IgxLabelDirective,
    IgxPrefixDirective,
    IgxSuffixDirective,
    IgxHintDirective
] as const;
