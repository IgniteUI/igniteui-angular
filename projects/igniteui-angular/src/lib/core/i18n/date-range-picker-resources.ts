import { DateRangePickerResourceStringsEN as ADateRangePickerResourceStrings } from 'igniteui-i18n-core';
import { convertToIgxResource } from './resources';

export interface IDateRangePickerResourceStrings {
    igx_date_range_picker_date_separator?: string;
    igx_date_range_picker_done_button?: string;
    igx_date_range_picker_cancel_button?: string;
    igx_date_range_picker_last7Days?: string;
    igx_date_range_picker_currentMonth?: string;
    igx_date_range_picker_last30Days?: string;
    igx_date_range_picker_yearToDate?: string;
}

export const DateRangePickerResourceStringsEN: IDateRangePickerResourceStrings = convertToIgxResource(ADateRangePickerResourceStrings);
