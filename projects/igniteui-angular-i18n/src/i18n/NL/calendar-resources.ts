import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Dutch resource strings for IgxCalendar
 */
export const CalendarResourceStringsNL = {
    igx_calendar_previous_month: 'Vorige maand',
    igx_calendar_next_month: 'Volgende maand',
    igx_calendar_previous_year: 'Previous Year',
    igx_calendar_next_year: 'Next Year',
    igx_calendar_previous_years: 'Previous {0} Years',
    igx_calendar_next_years: 'Next {0} Years',
    igx_calendar_select_date: 'Select Date',
    igx_calendar_select_month: 'Selecteer maand',
    igx_calendar_select_year: 'Selecteer jaar',
    igx_calendar_range_start: 'Begin van bereik',
    igx_calendar_range_end: 'Einde van bereik',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'End',
    igx_calendar_range_placeholder: 'Select Range',
    igx_calendar_selected_month_is: 'Geselecteerde maand is ',
    igx_calendar_first_picker_of: 'De eerste kiezer van {0} begint vanaf',
    igx_calendar_multi_selection: 'Multi-selectiekalender met {0} datumkiezers',
    igx_calendar_range_selection: 'Bereikkalender met {0} datumkiezers',
    igx_calendar_single_selection: 'Kalender met {0} datumkiezers',
    igx_calendar_singular_multi_selection: 'Multi-selectie kalender',
    igx_calendar_singular_range_selection: 'Bereikselectie kalender',
    igx_calendar_singular_single_selection: 'Kalender'
} satisfies MakeRequired<ICalendarResourceStrings>;
