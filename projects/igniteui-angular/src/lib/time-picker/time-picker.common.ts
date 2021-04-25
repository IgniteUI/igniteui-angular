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
    spinLoop: boolean;
    itemsDelta: { hour: number; minute: number; second: number };
    selectedDate: Date;
    maxDropdownValue: Date;
    minDropdownValue: Date;
    isTwelveHourFormat: boolean;
    showHoursList: boolean;
    showMinutesList: boolean;
    showSecondsList: boolean;
    showAmPmList: boolean;
    minDateValue: Date;
    maxDateValue: Date;
    nextHour(delta: number);
    nextMinute(delta: number);
    nextSeconds(delta: number);
    nextAmPm(delta: number);
    close(): void;
    cancelButtonClick(): void;
    onItemClick(item: string, dateType: string): void;
    setSelectedValue(): void;
    getPartValue(value: Date, type: string): string;
    toISOString(value: Date): string;
}
