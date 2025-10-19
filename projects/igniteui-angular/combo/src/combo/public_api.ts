import { IgxHintDirective } from '../directives/hint/hint.directive';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
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
