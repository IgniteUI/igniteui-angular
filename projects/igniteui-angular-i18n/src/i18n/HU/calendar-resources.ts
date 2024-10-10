import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Hungarian resource strings for IgxCalendar
 */
export const CalendarResourceStringsHU = {
    igx_calendar_previous_month: 'Előző hónap',
    igx_calendar_next_month: 'Következő hónap',
    igx_calendar_previous_year: 'Previous Year',
    igx_calendar_next_year: 'Next Year',
    igx_calendar_previous_years: 'Previous {0} Years',
    igx_calendar_next_years: 'Next {0} Years',
    igx_calendar_select_date: 'Select Date',
    igx_calendar_select_month: 'Hónap kiválasztása',
    igx_calendar_select_year: 'Év kiválasztása',
    igx_calendar_range_start: 'Tartomány kezdete',
    igx_calendar_range_end: 'Tartomány vége',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'End',
    igx_calendar_range_placeholder: 'Select Range',
    igx_calendar_selected_month_is: 'A kiválasztott hónap ',
    igx_calendar_first_picker_of: 'A(z) {0} első választója innen indul:',
    igx_calendar_multi_selection: 'Többszörös időpontválasztó naptár {0} dátumválasztóval',
    igx_calendar_range_selection: 'Időtartamválasztó naptár {0} dátumválasztóval',
    igx_calendar_single_selection: 'Naptár {0} dátumválasztóval',
    igx_calendar_singular_multi_selection: 'Többszörös időpontválasztó naptár',
    igx_calendar_singular_range_selection: 'Időtartamválasztó naptár',
    igx_calendar_singular_single_selection: 'Naptár'
} satisfies MakeRequired<ICalendarResourceStrings>;
