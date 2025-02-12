import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Polish resource strings for IgxCombo
 */
export const ComboResourceStringsPL = {
    igx_combo_empty_message: 'Lista jest pusta',
    igx_combo_filter_search_placeholder: 'Wprowadź tekst wyszukiwania',
    igx_combo_addCustomValues_placeholder: 'Dodaj element',
    igx_combo_clearItems_placeholder: 'Wyczyść wybór'
} satisfies MakeRequired<IComboResourceStrings>;
