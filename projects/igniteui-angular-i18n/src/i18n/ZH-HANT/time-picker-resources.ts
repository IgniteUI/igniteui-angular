import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Traditional Chinese (zh-Hant) resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsZHHANT = {
    igx_time_picker_ok: '確定',
    igx_time_picker_cancel: '取消',
    igx_time_picker_change_time: '變更時間',
    igx_time_picker_choose_time: '選擇時間'
} satisfies MakeRequired<ITimePickerResourceStrings>;
