import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Spanish resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsES = {
    igx_time_picker_ok: 'Aceptar',
    igx_time_picker_cancel: 'Cancelar',
    igx_time_picker_change_time: 'Cambiar hora',
    igx_time_picker_choose_time: 'Elige hora'
} satisfies MakeRequired<ITimePickerResourceStrings>;
