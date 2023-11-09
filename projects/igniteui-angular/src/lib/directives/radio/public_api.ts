import { IgxRadioComponent } from '../../radio/radio.component';
import { IgxRadioGroupDirective } from './radio-group.directive';

export * from './radio-group.directive';

/* NOTE: Radio Group directives collection for ease-of-use import in standalone components scenario */
export const IGX_RADIO_GROUP_DIRECTIVES = [
    IgxRadioGroupDirective,
    IgxRadioComponent
] as const;
