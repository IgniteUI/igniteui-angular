import { ElementRef } from '@angular/core';
import { DatePartDeltas } from '../directives/date-time-editor/public_api';
/** @hidden */
export const IGX_TIME_PICKER_COMPONENT = 'IgxTimePickerComponentToken';

/** @hidden */
export interface IgxTimePickerBase {
    hourList: ElementRef;
    locale: string;
    minuteList: ElementRef;
    secondsList: ElementRef;
    ampmList: ElementRef;
    inputFormat: string;
    itemsDelta: Pick<DatePartDeltas, 'hours' | 'minutes' | 'seconds'>;
    selectedDate: Date;
    maxDropdownValue: Date;
    minDropdownValue: Date;
    nextHour(delta: number);
    nextMinute(delta: number);
    nextSeconds(delta: number);
    nextAmPm(delta: number);
    close(): void;
    cancelButtonClick(): void;
    onItemClick(item: string, dateType: string): void;
}
