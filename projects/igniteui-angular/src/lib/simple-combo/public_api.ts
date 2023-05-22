import {
    IgxComboAddItemDirective,
    IgxComboClearIconDirective,
    IgxComboEmptyDirective,
    IgxComboFooterDirective,
    IgxComboHeaderDirective,
    IgxComboHeaderItemDirective,
    IgxComboItemDirective,
    IgxComboToggleIconDirective
} from '../combo/combo.directives';
import { IgxHintDirective } from '../directives/hint/hint.directive';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxSimpleComboComponent } from './simple-combo.component';

export * from './simple-combo.component';

/* NOTE: Simple combo directives collection for ease-of-use import in standalone components scenario */
export const IGX_SIMPLE_COMBO_DIRECTIVES = [
    IgxSimpleComboComponent,
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
