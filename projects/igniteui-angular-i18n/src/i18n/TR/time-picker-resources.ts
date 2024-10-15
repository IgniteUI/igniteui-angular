import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Turkish resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsTR = {
    igx_time_picker_ok: 'OK',
    igx_time_picker_cancel: 'Iptal',
    igx_time_picker_change_time: 'Saati değiştir',
    igx_time_picker_choose_time: 'Saat seçin'
} satisfies MakeRequired<ITimePickerResourceStrings>;
