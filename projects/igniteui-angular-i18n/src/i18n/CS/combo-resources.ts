import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 *  Czech resource strings for IgxCombo
 */
export const ComboResourceStringsCS = {
    igx_combo_empty_message: 'Seznam je prázdný',
    igx_combo_addCustomValues_placeholder: 'Přidat položku',
    igx_combo_clearItems_placeholder: 'Vymazat výběr'
} satisfies ExpandRequire<IComboResourceStrings>;
