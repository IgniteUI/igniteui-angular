import { TimePickerResourceStringsEN as ATimePickerResourceStrings } from 'igniteui-i18n-core';
import { convertToIgxResource } from './resources';

export interface ITimePickerResourceStrings {
    igx_time_picker_ok?: string;
    igx_time_picker_cancel?: string;
    igx_time_picker_change_time?: string;
    igx_time_picker_choose_time?: string;
}

export const TimePickerResourceStringsEN: ITimePickerResourceStrings = convertToIgxResource(ATimePickerResourceStrings);
