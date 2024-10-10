import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Italian resource strings for IgxCalendar
 */
export const CalendarResourceStringsIT = {
    igx_calendar_previous_month: 'Mese precedente',
    igx_calendar_next_month: 'Mese prossimo',
    igx_calendar_previous_year: 'L\'anno precedente',
    igx_calendar_next_year: 'L\'anno prossimo',
    igx_calendar_previous_years: '{0} anni precedenti',
    igx_calendar_next_years: 'Prossimi {0} anni',
    igx_calendar_select_date: 'Select Date',
    igx_calendar_select_month: 'Selezionare il mese',
    igx_calendar_select_year: 'Selezionare l\'anno',
    igx_calendar_range_start: 'Inizio intervallo',
    igx_calendar_range_end: 'Fine intervallo',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'End',
    igx_calendar_range_placeholder: 'Select Range',
    igx_calendar_selected_month_is: 'Mese selezionato: ',
    igx_calendar_first_picker_of: 'Il primo selettore di {0} inizia da',
    igx_calendar_multi_selection: 'Calendario a selezione multipla con {0} selettori di data',
    igx_calendar_range_selection: 'Calendario di selezione intervallo con {0} selettori di data',
    igx_calendar_single_selection: 'Calendario con {0} selettori di data',
    igx_calendar_singular_multi_selection: 'Calendario a selezione multipla',
    igx_calendar_singular_range_selection: 'Calendario di selezione intervallo ',
    igx_calendar_singular_single_selection: 'Calendario'
} satisfies MakeRequired<ICalendarResourceStrings>;
