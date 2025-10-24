import { IgxPickerActionsDirective, IgxPickerClearComponent, IgxPickerToggleComponent } from '../date-common/picker-icons.common';
import { IgxHintDirective } from 'igniteui-angular/directives';
import { IgxLabelDirective } from 'igniteui-angular/directives';
import { IgxPrefixDirective } from 'igniteui-angular/directives';
import { IgxSuffixDirective } from 'igniteui-angular/directives';
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
