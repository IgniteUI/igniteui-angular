import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Polish resource strings for IgxCalendar
 */
export const CalendarResourceStringsPL = {
    igx_calendar_previous_month: 'Poprzedni miesiąc',
    igx_calendar_next_month: 'W przyszłym miesiącu',
    igx_calendar_previous_year: 'Poprzedni rok',
    igx_calendar_next_year: 'Następny rok',
    igx_calendar_previous_years: 'Poprzednie {0} lata',
    igx_calendar_next_years: 'Następne {0} lata',
    igx_calendar_select_month: 'Wybierz miesiąc',
    igx_calendar_select_date: 'Wybierz datę',
    igx_calendar_select_year: 'Wybierz rok',
    igx_calendar_range_start: 'Początek zakresu',
    igx_calendar_range_end: 'Koniec zakresu',
    igx_calendar_range_label_start: 'Początek',
    igx_calendar_range_label_end: 'Koniec',
    igx_calendar_range_placeholder: 'Wybierz zakres',
    igx_calendar_selected_month_is: 'Wybrany miesiąc to ',
    igx_calendar_first_picker_of: 'Pierwszy wybór {0} zaczyna się od',
    igx_calendar_multi_selection: 'Kalendarz wielokrotnego wyboru z {0} selektorami dat',
    igx_calendar_range_selection: 'Kalendarz wyboru ciągłego z {0} selektorami dat',
    igx_calendar_single_selection: 'Kalendarz z {0} selektorami dat',
    igx_calendar_singular_multi_selection: 'Kalendarz wielokrotnego wyboru',
    igx_calendar_singular_range_selection: 'Kalendarz wyboru ciągłego',
    igx_calendar_singular_single_selection: 'Kalendarz'
} satisfies MakeRequired<ICalendarResourceStrings>;
