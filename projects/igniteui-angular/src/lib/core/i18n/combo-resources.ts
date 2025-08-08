import { ComboResourceStringsEN as AComboResourceStrings } from 'igniteui-i18n-core';
import { convertToIgxResource } from './resources';

export interface IComboResourceStrings {
    igx_combo_empty_message?: string;
    igx_combo_filter_search_placeholder?: string;
    igx_combo_addCustomValues_placeholder?: string;
    igx_combo_clearItems_placeholder?: string;
    igx_combo_aria_label_options?: string;
    igx_combo_aria_label_no_options?: string;
}

export const ComboResourceStringsEN: IComboResourceStrings = convertToIgxResource(AComboResourceStrings);
