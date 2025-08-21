import { IDateRangePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Italian resource strings for IgxDateRangePicker
 */
export const DateRangePickerResourceStringsIT = {
    igx_date_range_picker_date_separator: 'a',
    igx_date_range_picker_done_button: 'Fine',
    igx_date_range_picker_last7Days: 'Ultimi 7 giorni',
    igx_date_range_picker_currentMonth: 'Mese corrente',
    igx_date_range_picker_last30Days: 'Ultimi 30 giorni',
    igx_date_range_picker_yearToDate: 'Anno fino ad oggi',
} satisfies MakeRequired<IDateRangePickerResourceStrings>;
