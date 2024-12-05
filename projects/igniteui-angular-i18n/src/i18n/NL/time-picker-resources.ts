import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Dutch resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsNL = {
    igx_time_picker_ok: 'OK',
    igx_time_picker_cancel: 'Annuleren',
    igx_time_picker_change_time: 'Tijd wijzigen',
    igx_time_picker_choose_time: 'Tijd kiezen'
} satisfies MakeRequired<ITimePickerResourceStrings>;
