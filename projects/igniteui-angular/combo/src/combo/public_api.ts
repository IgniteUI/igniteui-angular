import { IgxHintDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';
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

export * from './combo.api';
export * from './combo.common';
export * from './combo.component';
export * from './combo.directives';
export * from './combo.pipes';
export * from './combo-add-item.component';
export * from './combo-dropdown.component'
export * from './combo-item.component';
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
