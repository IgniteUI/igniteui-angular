import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Hungarian resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsHU = {
    igx_time_picker_ok: 'OK',
    igx_time_picker_cancel: 'Mégse',
    igx_time_picker_change_time: 'Idő módosítása',
    igx_time_picker_choose_time: 'Idő beállítása'
} satisfies MakeRequired<ITimePickerResourceStrings>;
