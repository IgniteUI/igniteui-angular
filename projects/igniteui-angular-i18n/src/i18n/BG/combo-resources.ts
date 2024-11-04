import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Bulgarian resource strings for IgxCombo
 */
export const ComboResourceStringsBG = {
    igx_combo_empty_message: 'Списъкът е празен',
    igx_combo_filter_search_placeholder: 'Въведете термин за търсене',
    igx_combo_addCustomValues_placeholder: 'Добавяне на елемент',
    igx_combo_clearItems_placeholder: 'Изчистване на избора'
} satisfies MakeRequired<IComboResourceStrings>;
