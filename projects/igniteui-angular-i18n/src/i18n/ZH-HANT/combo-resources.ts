import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Traditional Chinese (zh-Hant) resource strings for IgxCombo
 */
export const ComboResourceStringsZHHANT = {
    igx_combo_empty_message: '清單是空的',
    igx_combo_filter_search_placeholder: '輸入搜尋字串',
    igx_combo_addCustomValues_placeholder: '新增項目',
    igx_combo_clearItems_placeholder: '清除選擇'
} satisfies MakeRequired<IComboResourceStrings>;
