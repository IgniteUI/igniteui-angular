import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Romanian resource strings for IgxCombo
 */
export const ComboResourceStringsRO = {
    igx_combo_empty_message: 'Lista este goală',
    igx_combo_filter_search_placeholder: 'Introduceți termenul de căutare',
    igx_combo_addCustomValues_placeholder: 'Adăugați element',
    igx_combo_clearItems_placeholder: 'Ștergeți selecția'
} satisfies MakeRequired<IComboResourceStrings>;
