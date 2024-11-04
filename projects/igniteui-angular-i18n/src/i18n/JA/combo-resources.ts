import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Japanese resource strings for IgxCombo
 */
export const ComboResourceStringsJA = {
    igx_combo_empty_message: 'リストが空です',
    igx_combo_filter_search_placeholder: '検索条件の入力',
    igx_combo_addCustomValues_placeholder: '項目の追加',
    igx_combo_clearItems_placeholder: '選択のクリア'
} satisfies MakeRequired<IComboResourceStrings>;
