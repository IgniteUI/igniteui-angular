import { IgxHintDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';
import { IgxSimpleComboComponent } from './simple-combo.component';
import { IgxComboAddItemDirective, IgxComboClearIconDirective, IgxComboEmptyDirective, IgxComboFooterDirective, IgxComboHeaderDirective, IgxComboHeaderItemDirective, IgxComboItemDirective, IgxComboToggleIconDirective } from 'igniteui-angular/combo';

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
