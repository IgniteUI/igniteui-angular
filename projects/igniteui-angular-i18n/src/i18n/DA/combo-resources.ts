import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Danish resource strings for IgxCombo
 */
export const ComboResourceStringsDA = {
    igx_combo_empty_message: 'Listen er tom',
    igx_combo_filter_search_placeholder: 'Indtast en søgeterm',
    igx_combo_addCustomValues_placeholder: 'Tilføj element',
    igx_combo_clearItems_placeholder: 'Ryd markering'
} satisfies MakeRequired<IComboResourceStrings>;
