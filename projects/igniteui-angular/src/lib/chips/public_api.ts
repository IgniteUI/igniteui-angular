import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxChipComponent } from './chip.component';
import { IgxChipsAreaComponent } from './chips-area.component';

export * from './chip.component';
export * from './chips-area.component';
export * from '../directives/prefix/prefix.directive';
export * from '../directives/suffix/suffix.directive';

/* NOTE: Chips directives collection for ease-of-use import in standalone components scenario */
export const IGX_CHIPS_DIRECTIVES = [
    IgxChipsAreaComponent,
    IgxChipComponent,
    IgxPrefixDirective,
    IgxSuffixDirective
] as const;
