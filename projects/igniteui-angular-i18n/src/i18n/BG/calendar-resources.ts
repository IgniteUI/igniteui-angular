import { ICalendarResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Bulgarian resource strings for IgxCalendar
 */
export const CalendarResourceStringsBG = {
    igx_calendar_previous_month: 'Предходен месец',
    igx_calendar_next_month: 'Следващ месец',
    igx_calendar_previous_year: 'Предходна година',
    igx_calendar_next_year: 'Следваща година',
    igx_calendar_previous_years: 'Предходни {0} години',
    igx_calendar_next_years: 'Следващи {0} години',
    igx_calendar_select_date: 'Избор на дата',
    igx_calendar_select_month: 'Избор на месец',
    igx_calendar_select_year: 'Избор на година',
    igx_calendar_range_start: 'Начало на диапазона',
    igx_calendar_range_end: 'Край на диапазона',
    igx_calendar_range_label_start: 'Начало',
    igx_calendar_range_label_end: 'Край',
    igx_calendar_range_placeholder: 'Избери диапазон',
    igx_calendar_selected_month_is: 'Избраният месец е ',
    igx_calendar_first_picker_of: 'Първия селектор от {0} започва от',
    igx_calendar_multi_selection: 'Календар с множествен избор с {0} избирачи на дати',
    igx_calendar_range_selection: 'Календар с избор на диапазон с {0} избирачи на дати',
    igx_calendar_single_selection: 'Календар с {0} избирачи на дати',
    igx_calendar_singular_multi_selection: 'Календар с множествен избор',
    igx_calendar_singular_range_selection: 'Календар с избор на диапазон',
    igx_calendar_singular_single_selection: 'Календар',
} satisfies MakeRequired<ICalendarResourceStrings>;
