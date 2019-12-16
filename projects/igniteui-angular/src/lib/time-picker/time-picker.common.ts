import { ElementRef } from '@angular/core';
import { InteractionMode } from '../core/enums';

/** @hidden */
export const IGX_TIME_PICKER_COMPONENT = 'IgxTimePickerComponentToken';

/** @hidden */
export interface IgxTimePickerBase {
    hourList: ElementRef;
    minuteList: ElementRef;
    secondsList: ElementRef;
    ampmList: ElementRef;
    selectedHour: string;
    selectedMinute: string;
    selectedSeconds: string;
    selectedAmPm: string;
    format: string;
    promptChar: string;
    cleared: boolean;
    mode: InteractionMode;
    showHoursList: boolean;
    showMinutesList: boolean;
    showSecondsList: boolean;
    showAmPmList: boolean;
    nextHour();
    prevHour();
    nextMinute();
    prevMinute();
    nextSeconds();
    prevSeconds();
    nextAmPm();
    prevAmPm();
    okButtonClick(): boolean;
    cancelButtonClick(): void;
    scrollHourIntoView(item: string): void;
    scrollMinuteIntoView(item: string): void;
    scrollSecondsIntoView(item: string): void;
    scrollAmPmIntoView(item: string): void;
    close(): void;
    parseMask(preserveAmPm?: boolean): string;
}

