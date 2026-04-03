import { IgxPickerActionsDirective, IgxPickerClearComponent, IgxPickerToggleComponent } from 'igniteui-angular/core';
import { IgxTimePickerComponent } from './time-picker.component';
import { IgxHintDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';

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
