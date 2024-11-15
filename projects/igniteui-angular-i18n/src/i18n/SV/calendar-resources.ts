import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Swedish resource strings for IgxCalendar
 */
export const CalendarResourceStringsSV = {
    igx_calendar_previous_month: 'Förra månaden',
    igx_calendar_next_month: 'Nästa månad',
    igx_calendar_previous_year: 'Previous Year',
    igx_calendar_next_year: 'Next Year',
    igx_calendar_previous_years: 'Previous {0} Years',
    igx_calendar_next_years: 'Next {0} Years',
    igx_calendar_select_date: 'Select Date',
    igx_calendar_select_month: 'Välj månad',
    igx_calendar_select_year: 'Välj år',
    igx_calendar_range_start: 'Områdesstart',
    igx_calendar_range_end: 'Områdesslut',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'End',
    igx_calendar_range_placeholder: 'Select Range',
    igx_calendar_selected_month_is: 'Vald månad är ',
    igx_calendar_first_picker_of: 'Första väljaren av {0} börjar från',
    igx_calendar_multi_selection: 'Flervalskalender med {0} datumväljare',
    igx_calendar_range_selection: 'Områdesvalskalender med {0} datumväljare',
    igx_calendar_single_selection: 'Kalender med {0} datumväljare',
    igx_calendar_singular_multi_selection: 'Flervalskalender',
    igx_calendar_singular_range_selection: 'Områdesvalskalender',
    igx_calendar_singular_single_selection: 'Kalender'
} satisfies MakeRequired<ICalendarResourceStrings>;
