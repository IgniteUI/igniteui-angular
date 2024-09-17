import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Italian resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsIT = {
    igx_time_picker_ok: 'OK',
    igx_time_picker_cancel: 'Annulla',
    igx_time_picker_change_time: 'Modifica orario',
    igx_time_picker_choose_time: 'Scegli orario'
} satisfies MakeRequired<ITimePickerResourceStrings>;
