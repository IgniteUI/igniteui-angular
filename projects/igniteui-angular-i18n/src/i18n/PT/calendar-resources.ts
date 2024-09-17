import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Portuguese resource strings for IgxCalendar
 */
export const CalendarResourceStringsPT = {
    igx_calendar_previous_month: 'Mês anterior',
    igx_calendar_next_month: 'Mês seguinte',
    igx_calendar_previous_year: 'Previous Year',
    igx_calendar_next_year: 'Next Year',
    igx_calendar_previous_years: 'Previous {0} Years',
    igx_calendar_next_years: 'Next {0} Years',
    igx_calendar_select_month: 'Selecionar mês',
    igx_calendar_select_date: 'Select Date',
    igx_calendar_select_year: 'Selecionar ano',
    igx_calendar_range_start: 'Início do intervalo',
    igx_calendar_range_end: 'Fim do intervalo',
    igx_calendar_range_label_start: 'Start',
    igx_calendar_range_label_end: 'End',
    igx_calendar_range_placeholder: 'Select Range',
    igx_calendar_selected_month_is: 'O mês selecionado é ',
    igx_calendar_first_picker_of: 'O primeiro selecionador de {0} começa em',
    igx_calendar_multi_selection: 'Calendário de seleção múltipla com {0} selecionadores de data',
    igx_calendar_range_selection: 'Calendário de seleção de intervalo com {0} selecionadores de data',
    igx_calendar_single_selection: 'Calendário com seletores de datas {0}',
    igx_calendar_singular_multi_selection: 'Calendário de seleção múltipla',
    igx_calendar_singular_range_selection: 'Calendário de seleção de intervalo',
    igx_calendar_singular_single_selection: 'Calendário'
} satisfies MakeRequired<ICalendarResourceStrings>;
