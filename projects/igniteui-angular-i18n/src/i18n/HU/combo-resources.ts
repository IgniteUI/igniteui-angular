import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Hungarian resource strings for IgxCombo
 */
export const ComboResourceStringsHU = {
    igx_combo_empty_message: 'Üres a lista',
    igx_combo_filter_search_placeholder: 'Írjon be egy keresési kifejezést',
    igx_combo_addCustomValues_placeholder: 'Elem hozzáadása',
    igx_combo_clearItems_placeholder: 'Kiválasztás törlése'
} satisfies MakeRequired<IComboResourceStrings>;
