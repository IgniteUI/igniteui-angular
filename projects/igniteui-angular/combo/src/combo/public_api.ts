import { IgxHintDirective } from 'igniteui-angular/directives';
import { IgxLabelDirective } from 'igniteui-angular/directives';
import { IgxPrefixDirective } from 'igniteui-angular/directives';
import { IgxSuffixDirective } from 'igniteui-angular/directives';
import { IgxComboComponent } from './combo.component';
import {
    IgxComboAddItemDirective,
    IgxComboClearIconDirective,
    IgxComboEmptyDirective,
    IgxComboFooterDirective,
    IgxComboHeaderDirective,
    IgxComboHeaderItemDirective,
    IgxComboItemDirective,
    IgxComboToggleIconDirective
} from './combo.directives';

export { IComboFilteringOptions } from './combo.common';
export * from './combo.component';
export * from './combo.directives';
export { comboIgnoreDiacriticsFilter } from './combo.pipes';

/* NOTE: Combo directives collection for ease-of-use import in standalone components scenario */
export const IGX_COMBO_DIRECTIVES = [
    IgxComboComponent,
    IgxComboAddItemDirective,
    IgxComboClearIconDirective,
    IgxComboEmptyDirective,
    IgxComboFooterDirective,
    IgxComboHeaderDirective,
    IgxComboHeaderItemDirective,
    IgxComboItemDirective,
    IgxComboToggleIconDirective,
    IgxLabelDirective,
    IgxPrefixDirective,
    IgxSuffixDirective,
    IgxHintDirective
] as const;
