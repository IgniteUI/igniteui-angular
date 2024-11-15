import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Korean resource strings for IgxCalendar
 */
export const CalendarResourceStringsKO = {
    igx_calendar_previous_month: '이전 달',
    igx_calendar_next_month: '다음 달',
    igx_calendar_previous_year: 'Previous Year',
    igx_calendar_next_year: 'Next Year',
    igx_calendar_previous_years: 'Previous {0} Years',
    igx_calendar_next_years: 'Next {0} Years',
    igx_calendar_select_date: 'Select Date',
    igx_calendar_select_month: '월 선택',
    igx_calendar_select_year: '연도 선택',
    igx_calendar_range_start: '범위 시작',
    igx_calendar_range_end: '범위 끝',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'End',
    igx_calendar_range_placeholder: 'Select Range',
    igx_calendar_selected_month_is: '선택한 달은 ',
    igx_calendar_first_picker_of: '{0} 의 첫 번째 선택기는 다음에서 시작',
    igx_calendar_multi_selection: '{0} 날짜 선택기가있는 다중 선택 달력',
    igx_calendar_range_selection: '{0} 날짜 선택기가있는 범위 선택 달력',
    igx_calendar_single_selection: '{0} 날짜 선택기가있는 달력',
    igx_calendar_singular_multi_selection: '다중 선택 달력',
    igx_calendar_singular_range_selection: '범위 선택 달력',
    igx_calendar_singular_single_selection: '달력'
} satisfies MakeRequired<ICalendarResourceStrings>;
