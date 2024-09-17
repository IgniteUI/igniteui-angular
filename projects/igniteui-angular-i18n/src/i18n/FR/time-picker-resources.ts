import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * French resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsFR = {
    igx_time_picker_ok: 'Ok',
    igx_time_picker_cancel: 'Annuler',
    igx_time_picker_change_time: 'Modifier l’heure',
    igx_time_picker_choose_time: 'Choisir l’heure'
} satisfies MakeRequired<ITimePickerResourceStrings>;
