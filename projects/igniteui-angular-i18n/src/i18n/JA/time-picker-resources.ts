import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Japanese resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsJA = {
    igx_time_picker_ok: 'OK',
    igx_time_picker_cancel: 'キャンセル',
    igx_time_picker_change_time: '時間の変更',
    igx_time_picker_choose_time: '時間の選択'
} satisfies MakeRequired<ITimePickerResourceStrings>;
