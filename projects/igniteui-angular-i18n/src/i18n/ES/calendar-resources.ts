import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Spanish resource strings for IgxCalendar
 */
export const CalendarResourceStringsES = {
    igx_calendar_previous_month: 'Mes anterior',
    igx_calendar_next_month: 'Mes siguiente',
    igx_calendar_previous_year: 'Previous Year',
    igx_calendar_next_year: 'Next Year',
    igx_calendar_previous_years: 'Previous {0} Years',
    igx_calendar_next_years: 'Next {0} Years',
    igx_calendar_select_date: 'Select Date',
    igx_calendar_select_month: 'Seleccionar mes',
    igx_calendar_select_year: 'Seleccionar año',
    igx_calendar_range_start: 'Inicio de rango',
    igx_calendar_range_end: 'Fin de rango',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'End',
    igx_calendar_range_placeholder: 'Select Range',
    igx_calendar_selected_month_is: 'El mes seleccionado es ',
    igx_calendar_first_picker_of: 'El primer selector de {0} comienza en',
    igx_calendar_multi_selection: 'Calendario de selección múltiple con {0} selectores de fechas',
    igx_calendar_range_selection: 'Calendario de selección de rango con {0} selectores de fecha',
    igx_calendar_single_selection: 'Calendario con {0} selectores de fechas',
    igx_calendar_singular_multi_selection: 'Calendario de selección múltiple',
    igx_calendar_singular_range_selection: 'Calendario de selección de rango',
    igx_calendar_singular_single_selection: 'Calendario'
} satisfies MakeRequired<ICalendarResourceStrings>;
