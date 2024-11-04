import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Norwegian resource strings for IgxCombo
 */
export const ComboResourceStringsNB = {
    igx_combo_empty_message: 'Listen er tom',
    igx_combo_filter_search_placeholder: 'Skriv inn søkeord',
    igx_combo_addCustomValues_placeholder: 'Legg til element',
    igx_combo_clearItems_placeholder: 'Fjern valg'
} satisfies MakeRequired<IComboResourceStrings>;
