import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Norwegian resource strings for IgxCalendar
 */
export const CalendarResourceStringsNB = {
    igx_calendar_previous_month: 'Forrige måned',
    igx_calendar_next_month: 'Neste måned',
    igx_calendar_previous_year: 'Forrige år',
    igx_calendar_next_year: 'Neste år',
    igx_calendar_previous_years: 'Forrige {0} år',
    igx_calendar_next_years: 'Neste {0} år',
    igx_calendar_select_date: 'Velg dato',
    igx_calendar_select_month: 'Velg måned',
    igx_calendar_select_year: 'Velg år',
    igx_calendar_range_start: 'Rekkevidde start',
    igx_calendar_range_end: 'Rekkevidde slutt',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'Slutt',
    igx_calendar_range_placeholder: 'Velg rekkevidde',
    igx_calendar_selected_month_is: 'Valgt måned er ',
    igx_calendar_first_picker_of: 'Den første plukkeren på {0} starter fra',
    igx_calendar_multi_selection: 'Flervalgskalender med {0} datovelgere',
    igx_calendar_range_selection: 'Områdevalgskalender med {0} datovelgere',
    igx_calendar_single_selection: 'Kalender med {0} datovelgere',
    igx_calendar_singular_multi_selection: 'Kalender med flere valg',
    igx_calendar_singular_range_selection: 'Områdevalgskalender',
    igx_calendar_singular_single_selection: 'Kalender'
} satisfies MakeRequired<ICalendarResourceStrings>;
