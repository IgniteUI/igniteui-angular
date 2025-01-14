import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Swedish resource strings for IgxCombo
 */
export const ComboResourceStringsSV = {
    igx_combo_empty_message: 'Listan är tom',
    igx_combo_filter_search_placeholder: 'Ange sökterm',
    igx_combo_addCustomValues_placeholder: 'Lägg till objekt',
    igx_combo_clearItems_placeholder: 'Rensa urval'
} satisfies MakeRequired<IComboResourceStrings>;
