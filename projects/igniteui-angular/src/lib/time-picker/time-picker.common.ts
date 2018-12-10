import { ElementRef } from '@angular/core';

/** @hidden */
export const IGX_TIME_PICKER_COMPONENT = 'IgxTimePickerComponentToken';

/** @hidden */
export interface IgxTimePickerBase {
    _ampmItems: any[];
    hourList: ElementRef;
    minuteList: ElementRef;
    ampmList: ElementRef;
    selectedHour: string;
    selectedMinute: string;
    selectedAmPm: string;
    mode: InteractionMode;
    format: string;
    promptChar: string;
    cleared: boolean;
    collapsed: boolean;
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
    hideOverlay(): void;
    parseMask(preserveAmPm?: boolean): string;
}

/**
 * Defines the posible values of the igxTimePicker's time slelection mode.
 */
export enum InteractionMode {
    dialog,
    dropdown
}

