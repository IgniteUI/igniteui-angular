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
	spinLoop: boolen;
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
