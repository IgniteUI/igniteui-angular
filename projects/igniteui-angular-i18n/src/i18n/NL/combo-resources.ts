import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Dutch resource strings for IgxCombo
 */
export const ComboResourceStringsNL = {
    igx_combo_empty_message: 'De lijst is leeg',
    igx_combo_filter_search_placeholder: 'Typ een zoekterm',
    igx_combo_addCustomValues_placeholder: 'Item toevoegen',
    igx_combo_clearItems_placeholder: 'Selectie wissen'
} satisfies MakeRequired<IComboResourceStrings>;
