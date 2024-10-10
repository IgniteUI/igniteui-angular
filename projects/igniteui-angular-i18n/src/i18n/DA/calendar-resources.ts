import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Danish resource strings for IgxCalendar
 */
export const CalendarResourceStringsDA = {
    igx_calendar_previous_month: 'Forrige måned',
    igx_calendar_next_month: 'Næste måned',
    igx_calendar_previous_year: 'Previous Year',
    igx_calendar_next_year: 'Next Year',
    igx_calendar_previous_years: 'Previous {0} Years',
    igx_calendar_next_years: 'Next {0} Years',
    igx_calendar_select_date: 'Select Date',
    igx_calendar_select_month: 'Vælg måned',
    igx_calendar_select_year: 'Vælg år',
    igx_calendar_range_start: 'Interval start',
    igx_calendar_range_end: 'Interval slut',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'End',
    igx_calendar_range_placeholder: 'Select Range',
    igx_calendar_selected_month_is: 'Den valgte måned er ',
    igx_calendar_first_picker_of: 'Første vælger af {0} starter fra',
    igx_calendar_multi_selection: 'Kalender med flere markeringer med {0} datovælgere',
    igx_calendar_range_selection: 'Kalender med intervalmarkering med {0} datovælgere',
    igx_calendar_single_selection: 'Kalender med {0} datovælgere',
    igx_calendar_singular_multi_selection: 'Kalender med flere markeringer',
    igx_calendar_singular_range_selection: 'Kalender med intervalmarkering',
    igx_calendar_singular_single_selection: 'Kalender'
} satisfies MakeRequired<ICalendarResourceStrings>;
