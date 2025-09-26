import { DatePickerResourceStringsEN as ADatePickerResourceStrings } from 'igniteui-i18n-core';
import { convertToIgxResource } from './resources';

export interface IDatePickerResourceStrings {
    igx_date_picker_change_date?: string;
    igx_date_picker_choose_date?: string;
}

export const DatePickerResourceStringsEN: IDatePickerResourceStrings = convertToIgxResource(ADatePickerResourceStrings);
