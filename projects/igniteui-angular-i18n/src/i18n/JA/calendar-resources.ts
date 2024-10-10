import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Japanese resource strings for IgxCalendar
 */
export const CalendarResourceStringsJA = {
    igx_calendar_previous_month: '前月',
    igx_calendar_next_month: '翌月',
    igx_calendar_previous_year: 'Previous Year',
    igx_calendar_next_year: 'Next Year',
    igx_calendar_previous_years: 'Previous {0} Years',
    igx_calendar_next_years: 'Next {0} Years',
    igx_calendar_select_date: 'Select Date',
    igx_calendar_select_month: '月の選択',
    igx_calendar_select_year: '年の選択',
    igx_calendar_range_start: '範囲開始',
    igx_calendar_range_end: '範囲終了',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'End',
    igx_calendar_range_placeholder: 'Select Range',
    igx_calendar_selected_month_is: '選択した月: ',
    igx_calendar_first_picker_of: '{0} の最初のピッカーの開始: ',
    igx_calendar_multi_selection: '{0} 日付ピッカーの複数選択カレンダー',
    igx_calendar_range_selection: '{0} 日付ピッカーの範囲選択カレンダー',
    igx_calendar_single_selection: '{0} 日付ピッカーのカレンダー',
    igx_calendar_singular_multi_selection: '複数選択カレンダー',
    igx_calendar_singular_range_selection: '範囲選択カレンダー',
    igx_calendar_singular_single_selection: 'カレンダー'
} satisfies MakeRequired<ICalendarResourceStrings>;
