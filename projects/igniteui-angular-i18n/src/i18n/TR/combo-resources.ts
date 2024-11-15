import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Turkish resource strings for IgxCombo
 */
export const ComboResourceStringsTR = {
    igx_combo_empty_message: 'Liste boş',
    igx_combo_filter_search_placeholder: 'Arama terimi girin',
    igx_combo_addCustomValues_placeholder: 'Öğe ekle',
    igx_combo_clearItems_placeholder: 'Seçimi temizle'
} satisfies MakeRequired<IComboResourceStrings>;
