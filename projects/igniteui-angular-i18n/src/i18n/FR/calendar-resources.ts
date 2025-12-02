import { ICalendarResourceStrings } from 'igniteui-angular/core';

// only use `satisfies` operator so export is typed by its schema
/**
 * French resource strings for IgxCalendar
 */
export const CalendarResourceStringsFR = {
    igx_calendar_previous_month: 'Mois précédent',
    igx_calendar_next_month: 'Mois suivant',
    igx_calendar_previous_year: 'Année précédente',
    igx_calendar_next_year: 'Mois suivant',
    igx_calendar_previous_years: '{0} années précédentes',
    igx_calendar_next_years: '{0} années suivantes',
    igx_calendar_select_date: 'Sélectionner une date',
    igx_calendar_select_month: 'Sélectionner un mois',
    igx_calendar_select_year: 'Sélectionner une année',
    igx_calendar_range_start: 'Début de l\'intervalle',
    igx_calendar_range_end: 'Fin de l\'intervalle',
    igx_calendar_range_label_start: 'Début',
    igx_calendar_range_label_end: 'Fin',
    igx_calendar_range_placeholder: 'Sélectionner une intervalle',
    igx_calendar_selected_month_is: 'Le mois sélectionné est ',
    igx_calendar_first_picker_of: 'Le premier sélecteur de {0} commence à partir de',
    igx_calendar_multi_selection: 'Calendrier à sélection multiple avec {0} sélecteurs de dates',
    igx_calendar_range_selection: 'Calendrier de sélection de la période avec {0} sélecteurs de dates',
    igx_calendar_single_selection: 'Calendrier avec {0} sélecteurs de dates',
    igx_calendar_singular_multi_selection: 'Calendrier multi-sélection',
    igx_calendar_singular_range_selection: 'Calendrier de sélection de la période de date',
    igx_calendar_singular_single_selection: 'Calendrier',
} satisfies MakeRequired<ICalendarResourceStrings>;
