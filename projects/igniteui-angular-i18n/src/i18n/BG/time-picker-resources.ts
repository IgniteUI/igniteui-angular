import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Bulgarian resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsBG = {
    igx_time_picker_ok: 'ОК',
    igx_time_picker_cancel: 'Отмяна',
    igx_time_picker_change_time: 'Промяна на времето',
    igx_time_picker_choose_time: 'Избор на време'
} satisfies MakeRequired<ITimePickerResourceStrings>;
