import { ICalendarResourceStrings } from 'igniteui-angular/core';

// only use `satisfies` operator so export is typed by its schema
/**
 * Romanian resource strings for IgxCalendar
 */
export const CalendarResourceStringsRO = {
    igx_calendar_previous_month: 'Luna trecută',
    igx_calendar_next_month: 'Luna viitoare',
    igx_calendar_previous_year: 'Anul precedent',
    igx_calendar_next_year: 'Anul următor',
    igx_calendar_previous_years: '{0} ani precedenți',
    igx_calendar_next_years: 'Următorii {0} ani',
    igx_calendar_select_date: 'Selectați data',
    igx_calendar_select_month: 'Alege luna',
    igx_calendar_select_year: 'Selectați Anul',
    igx_calendar_range_start: 'Începutul intervalului',
    igx_calendar_range_end: 'Sfârșitul intervalului',
    igx_calendar_range_label_start: 'Sfârșit',
    igx_calendar_range_label_end: 'Sfârșit',
    igx_calendar_range_placeholder: 'Selectați intervalul',
    igx_calendar_selected_month_is: 'Luna selectată este ',
    igx_calendar_first_picker_of: 'Primul selector din {0} începe de la',
    igx_calendar_multi_selection: 'Calendar cu selecție multiplă cu {0} selectoare de date',
    igx_calendar_range_selection: 'Calendar de selecție a intervalului cu {0} selector de date',
    igx_calendar_single_selection: 'Calendar cu {0} selectoare de date',
    igx_calendar_singular_multi_selection: 'Calendar de selecție multiplă',
    igx_calendar_singular_range_selection: 'Calendar de selectare a gamei',
    igx_calendar_singular_single_selection: 'Calendar'
} satisfies MakeRequired<ICalendarResourceStrings>;
