import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Simplified Chinese (zh-Hans) resource strings for IgxCombo
 */
export const ComboResourceStringsZHHANS = {
    igx_combo_empty_message: '列表为空',
    igx_combo_filter_search_placeholder: '输入搜索字符串',
    igx_combo_addCustomValues_placeholder: '添加项目',
    igx_combo_clearItems_placeholder: '清除选择',
    igx_combo_aria_label_options: '选定的选项',
    igx_combo_aria_label_no_options: '没有选定的选项'
} satisfies MakeRequired<IComboResourceStrings>;
