import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Romanian resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsRO = {
    igx_time_picker_ok: 'OK',
    igx_time_picker_cancel: 'Anulare',
    igx_time_picker_change_time: 'Schimbați ora',
    igx_time_picker_choose_time: 'Alegeți ora'
} satisfies MakeRequired<ITimePickerResourceStrings>;
