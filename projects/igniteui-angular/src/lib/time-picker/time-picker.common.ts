import { ElementRef } from '@angular/core';
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
    itemsDelta: { hour: number; minute: number; second: number };
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
