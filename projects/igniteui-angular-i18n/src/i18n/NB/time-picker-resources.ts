import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Norwegian resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsNB = {
    igx_time_picker_ok: 'OK',
    igx_time_picker_cancel: 'Avbryt',
    igx_time_picker_change_time: 'Endre tid',
    igx_time_picker_choose_time: 'Velg tid'
} satisfies MakeRequired<ITimePickerResourceStrings>;
