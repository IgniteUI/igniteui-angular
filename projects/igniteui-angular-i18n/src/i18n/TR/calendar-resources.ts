import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Turkish resource strings for IgxCalendar
 */
export const CalendarResourceStringsTR = {
    igx_calendar_previous_month: 'Geçtiğimiz ay',
    igx_calendar_next_month: 'Gelecek ay',
    igx_calendar_previous_year: 'Previous Year',
    igx_calendar_next_year: 'Next Year',
    igx_calendar_previous_years: 'Previous {0} Years',
    igx_calendar_next_years: 'Next {0} Years',
    igx_calendar_select_date: 'Select Date',
    igx_calendar_select_month: 'Ay seç',
    igx_calendar_select_year: 'Yıl Seç',
    igx_calendar_range_start: 'Aralık başlangıcı',
    igx_calendar_range_end: 'Aralık bitişi',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'End',
    igx_calendar_range_placeholder: 'Select Range',
    igx_calendar_selected_month_is: 'Seçilen ay ',
    igx_calendar_first_picker_of: '{0} için ilk seçici başlangıcı',
    igx_calendar_multi_selection: '{0} tarih seçicili çoklu seçim takvimi',
    igx_calendar_range_selection: '{0} tarih seçicili aralık seçim takvimi',
    igx_calendar_single_selection: '{0} tarih seçicili takvim',
    igx_calendar_singular_multi_selection: 'Çoklu seçim takvimi',
    igx_calendar_singular_range_selection: 'Aralık seçim takvimi',
    igx_calendar_singular_single_selection: 'Takvim'
} satisfies MakeRequired<ICalendarResourceStrings>;
