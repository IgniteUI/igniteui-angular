import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Danish resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsDA = {
    igx_time_picker_ok: 'OK',
    igx_time_picker_cancel: 'Annuller',
    igx_time_picker_change_time: 'Skift klokkeslæt',
    igx_time_picker_choose_time: 'Vælg et klokkeslæt'
} satisfies MakeRequired<ITimePickerResourceStrings>;
