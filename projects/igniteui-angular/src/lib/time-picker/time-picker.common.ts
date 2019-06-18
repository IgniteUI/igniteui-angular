import { ElementRef } from '@angular/core';
import { InteractionMode } from '../core/enums';

/** @hidden */
export const IGX_TIME_PICKER_COMPONENT = 'IgxTimePickerComponentToken';

/** @hidden */
export interface IgxTimePickerBase {
    hourList: ElementRef;
    minuteList: ElementRef;
    ampmList: ElementRef;
    selectedHour: string;
    selectedMinute: string;
    selectedAmPm: string;
    format: string;
    promptChar: string;
    cleared: boolean;
    mode: InteractionMode;
    showHoursList: boolean;
    showMinutesList: boolean;
    showAmPmList: boolean;
    nextHour();
    prevHour();
    nextMinute();
    prevMinute();
    nextAmPm();
    prevAmPm();
    okButtonClick(): boolean;
    cancelButtonClick(): void;
    scrollHourIntoView(item: string): void;
    scrollMinuteIntoView(item: string): void;
    scrollAmPmIntoView(item: string): void;
    close(): void;
    parseMask(preserveAmPm?: boolean): string;
}

