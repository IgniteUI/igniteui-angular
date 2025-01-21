import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Portuguese resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsPT = {
    igx_time_picker_ok: 'OK',
    igx_time_picker_cancel: 'Cancelar',
    igx_time_picker_change_time: 'Alterar hora',
    igx_time_picker_choose_time: 'Escolher hora'
} satisfies MakeRequired<ITimePickerResourceStrings>;
