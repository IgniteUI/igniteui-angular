import { IDateRangePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Korean resource strings for IgxDateRangePicker
 */
export const DateRangePickerResourceStringsKO = {
    igx_date_range_picker_date_separator: '에',
    igx_date_range_picker_done_button: '완료',
    igx_date_range_picker_last7Days: '지난 7일',
    igx_date_range_picker_currentMonth: '이번 달',
    igx_date_range_picker_last30Days: '지난 30일',
    igx_date_range_picker_yearToDate: '올해 초부터 현재까지',
} satisfies MakeRequired<IDateRangePickerResourceStrings>;
