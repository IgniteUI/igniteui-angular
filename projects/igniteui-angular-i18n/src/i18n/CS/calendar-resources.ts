import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Czech resource strings for IgxCalendar
 */
export const CalendarResourceStringsCS = {
    igx_calendar_previous_month: 'Předchozí měsíc',
    igx_calendar_next_month: 'Příští měsíc',
    igx_calendar_previous_year: 'Previous Year',
    igx_calendar_next_year: 'Next Year',
    igx_calendar_previous_years: 'Previous {0} Years',
    igx_calendar_next_years: 'Next {0} Years',
    igx_calendar_select_date: 'Select Date',
    igx_calendar_select_month: 'Vyberte měsíc',
    igx_calendar_select_year: 'Vyberte rok',
    igx_calendar_range_start: 'Začátek dosahu',
    igx_calendar_range_end: 'Konec rozsahu',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'End',
    igx_calendar_range_placeholder: 'Select Range',
    igx_calendar_selected_month_is: 'Vybraný měsíc je ',
    igx_calendar_first_picker_of: 'První výběr z {0} začíná od',
    igx_calendar_multi_selection: 'Kalendář s více výběry s {0} nástroji pro výběr data',
    igx_calendar_range_selection: 'Kalendář výběru rozsahu s {0} nástroji pro výběr data',
    igx_calendar_single_selection: 'Kalendář s {0} nástroji pro výběr data',
    igx_calendar_singular_multi_selection: 'Kalendář s více výběry',
    igx_calendar_singular_range_selection: 'Kalendář výběru rozsahu',
    igx_calendar_singular_single_selection: 'Kalendář'
} satisfies MakeRequired<ICalendarResourceStrings>;
