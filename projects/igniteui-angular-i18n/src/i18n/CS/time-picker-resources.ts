import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Czech resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsCS = {
    igx_time_picker_ok: 'OK',
    igx_time_picker_cancel: 'Zrušení',
    igx_time_picker_change_time: 'Změnit čas',
    igx_time_picker_choose_time: 'Zvolte čas'
} satisfies MakeRequired<ITimePickerResourceStrings>;
