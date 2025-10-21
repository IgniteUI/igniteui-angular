import { IgxPrefixDirective } from 'igniteui-angular/directives';
import { IgxSuffixDirective } from 'igniteui-angular/directives';
import { IgxChipComponent } from './chip.component';
import { IgxChipsAreaComponent } from './chips-area.component';

export * from './chip.component';
export * from './chips-area.component';
export * from 'igniteui-angular/directives';
export * from 'igniteui-angular/directives';

/* NOTE: Chips directives collection for ease-of-use import in standalone components scenario */
export const IGX_CHIPS_DIRECTIVES = [
    IgxChipsAreaComponent,
    IgxChipComponent,
    IgxPrefixDirective,
    IgxSuffixDirective
] as const;
