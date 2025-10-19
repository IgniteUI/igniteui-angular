import { IgxPickerActionsDirective, IgxPickerClearComponent, IgxPickerToggleComponent } from '../date-common/picker-icons.common';
import { IgxHintDirective } from '../directives/hint/hint.directive';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxTimePickerComponent } from './time-picker.component';

export * from './time-picker.component';
export * from './time-picker.directives';

/* NOTE: Time picker directives collection for ease-of-use import in standalone components scenario */
export const IGX_TIME_PICKER_DIRECTIVES = [
    IgxTimePickerComponent,
    IgxPickerActionsDirective,
    IgxPickerToggleComponent,
    IgxPickerClearComponent,
    IgxLabelDirective,
    IgxPrefixDirective,
    IgxSuffixDirective,
    IgxHintDirective
] as const;
