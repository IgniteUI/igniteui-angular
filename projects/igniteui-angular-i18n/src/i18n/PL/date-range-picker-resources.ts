import { IDateRangePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Polish resource strings for IgxDateRangePicker
 */
export const DateRangePickerResourceStringsPL = {
    igx_date_range_picker_date_separator: 'do',
    igx_date_range_picker_done_button: 'Gotowe',
    igx_date_range_picker_last7Days: 'Ostatnie 7 dni',
    igx_date_range_picker_currentMonth: 'Bieżący miesiąc',
    igx_date_range_picker_last30Days: 'Ostatnie 30 dni',
    igx_date_range_picker_yearToDate: 'Od początku roku',
} satisfies MakeRequired<IDateRangePickerResourceStrings>;
