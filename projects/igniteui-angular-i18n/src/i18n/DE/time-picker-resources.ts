import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * German resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsDE = {
    igx_time_picker_ok: 'Ok',
    igx_time_picker_cancel: 'Abbrechen',
    igx_time_picker_change_time: 'Uhrzeit ändern',
    igx_time_picker_choose_time: 'Uhrzeit wählen'
} satisfies MakeRequired<ITimePickerResourceStrings>;
