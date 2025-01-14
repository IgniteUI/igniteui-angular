import { ITimePickerResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Korean resource strings for IgxTimePicker
 */
export const TimePickerResourceStringsKO = {
    igx_time_picker_ok: '확인',
    igx_time_picker_cancel: '취소',
    igx_time_picker_change_time: '시간 변경',
    igx_time_picker_choose_time: '시간 선택'
} satisfies MakeRequired<ITimePickerResourceStrings>;
