import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Polish resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsPL = {
    igx_time_picker_ok: 'OK',
    igx_time_picker_cancel: 'Anuluj',
    igx_time_picker_change_time: 'Zmień czas',
    igx_time_picker_choose_time: 'Wybierz czas'
} satisfies MakeRequired<ITimePickerResourceStrings>;
