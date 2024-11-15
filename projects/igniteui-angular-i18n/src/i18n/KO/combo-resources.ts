import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Korean resource strings for IgxCombo
 */
export const ComboResourceStringsKO = {
    igx_combo_empty_message: '목록이 비어 있음',
    igx_combo_filter_search_placeholder: '검색어 입력',
    igx_combo_addCustomValues_placeholder: '항목 추가',
    igx_combo_clearItems_placeholder: '선택 지우기'
} satisfies MakeRequired<IComboResourceStrings>;
