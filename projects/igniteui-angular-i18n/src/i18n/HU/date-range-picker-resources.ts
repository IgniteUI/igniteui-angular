import { IDateRangePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Hungarian resource strings for IgxDateRangePicker
 */
export const DateRangePickerResourceStringsHU = {
    igx_date_range_picker_date_separator: '-',
    igx_date_range_picker_done_button: 'Kész',
    igx_date_range_picker_last7Days: 'Az elmúlt 7 nap',
    igx_date_range_picker_currentMonth: 'Aktuális hónap',
    igx_date_range_picker_last30Days: 'Az elmúlt 30 nap',
    igx_date_range_picker_yearToDate: 'Év elejétől napjainkig',
} satisfies MakeRequired<IDateRangePickerResourceStrings>;
