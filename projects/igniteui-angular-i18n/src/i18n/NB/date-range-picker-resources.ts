import { IDateRangePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Norwegian resource strings for IgxDateRangePicker
 */
export const DateRangePickerResourceStringsNB = {
    igx_date_range_picker_date_separator: 'til',
    igx_date_range_picker_done_button: 'Ferdig',
    igx_date_range_picker_last7Days: 'Siste 7 dager',
    igx_date_range_picker_currentMonth: 'Denne måneden',
    igx_date_range_picker_last30Days: 'Siste 30 dager',
    igx_date_range_picker_yearToDate: 'Året til dato',
} satisfies MakeRequired<IDateRangePickerResourceStrings>;
