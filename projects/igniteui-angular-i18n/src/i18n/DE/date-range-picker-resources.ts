import { IDateRangePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * German resource strings for IgxDateRangePicker
 */
export const DateRangePickerResourceStringsDE = {
    igx_date_range_picker_date_separator: 'bis',
    igx_date_range_picker_done_button: 'Fertig',
    igx_date_range_picker_last7Days: 'Letzte 7 Tage',
    igx_date_range_picker_currentMonth: 'Aktueller Monat',
    igx_date_range_picker_last30Days: 'Letzte 30 Tage',
    igx_date_range_picker_yearToDate: 'Jahr bis heute',
} satisfies MakeRequired<IDateRangePickerResourceStrings>;
