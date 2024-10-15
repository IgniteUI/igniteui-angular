import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Norwegian resource strings for IgxCalendar
 */
export const CalendarResourceStringsNB = {
    igx_calendar_previous_month: 'Forrige måned',
    igx_calendar_next_month: 'Neste måned',
    igx_calendar_previous_year: 'Previous Year',
    igx_calendar_next_year: 'Next Year',
    igx_calendar_previous_years: 'Previous {0} Years',
    igx_calendar_next_years: 'Next {0} Years',
    igx_calendar_select_date: 'Select Date',
    igx_calendar_select_month: 'Velg måned',
    igx_calendar_select_year: 'Velg år',
    igx_calendar_range_start: 'Rekkevidde start',
    igx_calendar_range_end: 'Rekkevidde slutt',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'End',
    igx_calendar_range_placeholder: 'Select Range',
    igx_calendar_selected_month_is: 'Valgt måned er ',
    igx_calendar_first_picker_of: 'Den første plukkeren på {0} starter fra',
    igx_calendar_multi_selection: 'Flervalgskalender med {0} datovelgere',
    igx_calendar_range_selection: 'Områdevalgskalender med {0} datovelgere',
    igx_calendar_single_selection: 'Kalender med {0} datovelgere',
    igx_calendar_singular_multi_selection: 'Kalender med flere valg',
    igx_calendar_singular_range_selection: 'Områdevalgskalender',
    igx_calendar_singular_single_selection: 'Kalender'
} satisfies MakeRequired<ICalendarResourceStrings>;
