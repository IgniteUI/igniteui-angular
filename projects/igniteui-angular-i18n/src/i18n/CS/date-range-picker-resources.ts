import { IDateRangePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Czech resource strings for IgxDateRangePicker
 */
export const DateRangePickerResourceStringsCS = {
    igx_date_range_picker_date_separator: 'na',
    igx_date_range_picker_done_button: 'Hotovo',
    igx_date_range_picker_last7Days: 'Posledních 7 dní',
    igx_date_range_picker_currentMonth: 'Tento měsíc',
    igx_date_range_picker_last30Days: 'Posledních 30 dní',
    igx_date_range_picker_yearToDate: 'Od začátku roku',
} satisfies MakeRequired<IDateRangePickerResourceStrings>;
