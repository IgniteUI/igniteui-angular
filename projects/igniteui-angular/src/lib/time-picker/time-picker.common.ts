import { ElementRef } from '@angular/core';
/** @hidden */
export const IGX_TIME_PICKER_COMPONENT = 'IgxTimePickerComponentToken';

/** @hidden */
export interface IgxTimePickerBase {
    hourList: ElementRef;
    minuteList: ElementRef;
    secondsList: ElementRef;
    ampmList: ElementRef;
    inputFormat: string;
    selectedDate: Date;
    nextHour(delta: number);
    nextMinute(delta: number);
    nextSeconds(delta: number);
    nextAmPm(delta: number);
    close(): void;
    cancelButtonClick(): void;
    onItemClick(item: string, dateType: string): void;
}
