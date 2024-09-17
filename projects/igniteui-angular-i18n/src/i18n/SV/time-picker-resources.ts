import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Swedish resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsSV = {
    igx_time_picker_ok: 'OK',
    igx_time_picker_cancel: 'Avbryt',
    igx_time_picker_change_time: 'Ändra tid',
    igx_time_picker_choose_time: 'Välj tid'
} satisfies MakeRequired<ITimePickerResourceStrings>;
