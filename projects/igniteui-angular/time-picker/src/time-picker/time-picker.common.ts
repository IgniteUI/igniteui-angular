import { ElementRef, InjectionToken } from '@angular/core';
import { DatePart, DatePartDeltas } from 'igniteui-angular/core';

/** @hidden */
export const IGX_TIME_PICKER_COMPONENT = new InjectionToken<IgxTimePickerBase>('IgxTimePickerComponentToken');

/** @hidden */
export type IgxTimePickerListType = 'hourList' | 'minuteList' | 'secondsList' | 'ampmList';

/**
 * @hidden
 * Returns the last value of a minutes/seconds list starting from 0 and generated with the given delta.
 */
export function getLastListValue(delta: number): number {
    return 60 - (60 % delta || delta);
}

/** @hidden */
export interface IgxTimePickerBase {
    hourList: ElementRef;
    minuteList: ElementRef;
    secondsList: ElementRef;
    ampmList: ElementRef;
    itemsDelta: Pick<DatePartDeltas, 'hours' | 'minutes' | 'seconds' | 'fractionalSeconds'>;
    selectedDate: Date;
    maxDropdownValue: Date;
    minDropdownValue: Date;
    isTwelveHourFormat: boolean;
    showAmPmList: boolean;
    /** @hidden @internal */
    appliedFormat: string;
    nextHour(delta: number): void;
    nextMinute(delta: number): void;
    nextSeconds(delta: number): void;
    nextAmPm(delta: number): void;
    cancelButtonClick(): void;
    okButtonClick(): void;
    onItemClick(item: string, dateType: IgxTimePickerListType): void;
    getPartValue(value: Date, type: DatePart): string;
}
