import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Simplified Chinese (zh-Hans) resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsZHHANS = {
    igx_time_picker_ok: '确定',
    igx_time_picker_cancel: '取消',
    igx_time_picker_change_time: '更改时间',
    igx_time_picker_choose_time: '选择时间'
} satisfies MakeRequired<ITimePickerResourceStrings>;
