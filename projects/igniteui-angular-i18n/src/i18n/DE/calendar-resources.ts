import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * German resource strings for IgxCalendar
 */
export const CalendarResourceStringsDE = {
    igx_calendar_previous_month: 'Vorheriger Monat',
    igx_calendar_next_month: 'Nächster Monat',
    igx_calendar_previous_year: 'Previous Year',
    igx_calendar_next_year: 'Next Year',
    igx_calendar_previous_years: 'Previous {0} Years',
    igx_calendar_next_years: 'Next {0} Years',
    igx_calendar_select_date: 'Select Date',
    igx_calendar_select_month: 'Wähle Monat',
    igx_calendar_select_year: 'Wähle Jahr',
    igx_calendar_range_start: 'Datumsperiode Anfang',
    igx_calendar_range_end: 'Datumsperiode Ende',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'End',
    igx_calendar_range_placeholder: 'Select Range',
    igx_calendar_selected_month_is: 'Der ausgewählter Monat ist ',
    igx_calendar_first_picker_of: 'Die erste Auswahl von {0} beginnt am',
    igx_calendar_multi_selection: 'Mehrfachauswahl-Kalender mit {0} Datumswählern',
    igx_calendar_range_selection: 'Datumsperiodenauswahl-Kalender mit {0} Datumswählern',
    igx_calendar_single_selection: 'Kalender mit {0} Datumswählern',
    igx_calendar_singular_multi_selection: 'Mehrfachauswahl-Kalender ',
    igx_calendar_singular_range_selection: 'Datumsperiodenauswahl-Kalender',
    igx_calendar_singular_single_selection: 'Kalender'
} satisfies MakeRequired<ICalendarResourceStrings>;
