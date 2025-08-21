import { IDateRangePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Dutch resource strings for IgxDateRangePicker
 */
export const DateRangePickerResourceStringsNL = {
    igx_date_range_picker_date_separator: 'tot',
    igx_date_range_picker_done_button: 'Gereed',
    igx_date_range_picker_last7Days: 'Laatste 7 dagen',
    igx_date_range_picker_currentMonth: 'Huidige maand',
    igx_date_range_picker_last30Days: 'Laatste 30 dagen',
    igx_date_range_picker_yearToDate: 'Jaar tot datum',
} satisfies MakeRequired<IDateRangePickerResourceStrings>;
