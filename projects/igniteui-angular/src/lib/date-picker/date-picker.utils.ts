import { DateRangeDescriptor, DateRangeType } from 'igniteui-angular';
import { isIE } from '../core/utils';

/**
 * This enumeration is used to configure whether the date picker has an editable input
 * or is readonly - the date is selected only through a popup calendar.
 */
export enum DatePickerInteractionMode {
    EDITABLE = 'editable',
    READONLY = 'readonly'
}

/**
 * This enumeration is used to configure the date picker to operate with pre-defined format option used in angular DatePipe.
 * 'https://angular.io/api/common/DatePipe'
 * 'shortDate': equivalent to 'M/d/yy' (6/15/15).
 * 'mediumDate': equivalent to 'MMM d, y' (Jun 15, 2015).
 * 'longDate': equivalent to 'MMMM d, y' (June 15, 2015).
 * 'fullDate': equivalent to 'EEEE, MMMM d, y' (Monday, June 15, 2015).
 */
export const enum PREDEFINED_FORMAT_OPTIONS {
    SHORT_DATE = 'shortDate',
    MEDIUM_DATE = 'mediumDate',
    LONG_DATE = 'longDate',
    FULL_DATE = 'fullDate'
}

/**
 *@hidden
 */
export const SHORT_DATE_MASK = 'MM/dd/yy';

/**
 *@hidden
 */
export const enum FORMAT_DESC {
    NUMERIC = 'numeric',
    TWO_DIGITS = '2-digit'
}

/**
 *@hidden
 */
export const enum DATE_CHARS {
    YEAR_CHAR = 'y',
    MONTH_CHAR = 'M',
    DAY_CHAR = 'd'
}

/**
 *@hidden
 */
export const enum DATE_PARTS {
    DAY = 'day',
    MONTH = 'month',
    YEAR = 'year'
}

/**
 *@hidden
 */
export const SEPARATOR = 'literal';
/**
 *@hidden
 */
export const DEFAULT_LOCALE_DATE = 'en';

/**
 *@hidden
 */
export const SPIN_DELTA = 1;

/**
 *@hidden
 */
export const NUMBER_OF_MONTHS = 12;

/**
 *@hidden
 */
export const PROMPT_CHAR = '_';

export interface IFormatViews {
    day?: boolean;
    month?: boolean;
    year?: boolean;
}

export interface IFormatOptions {
    day?: string;
    month?: string;
    weekday?: string;
    year?: string;
}

/**
 *@hidden
 */
export function getYearFormatType(format: string): string {
    switch (format.match(new RegExp(DATE_CHARS.YEAR_CHAR, 'g')).length) {
        case 1: {
            // y (2020)
            return FORMAT_DESC.NUMERIC;
        }
        case 4: {
            // yyyy (2020)
            return FORMAT_DESC.NUMERIC;
        }
        case 2: {
            // yy (20)
            return FORMAT_DESC.TWO_DIGITS;
        }
    }
}

/**
 *@hidden
 */
export function getMonthFormatType(format: string): string {
    switch (format.match(new RegExp(DATE_CHARS.MONTH_CHAR, 'g')).length) {
        case 1: {
            // M (8)
            return FORMAT_DESC.NUMERIC;
        }
        case 2: {
            // MM (08)
            return FORMAT_DESC.TWO_DIGITS;
        }
    }
}

/**
 *@hidden
 */
export function getDayFormatType(format: string): string {
    switch (format.match(new RegExp(DATE_CHARS.DAY_CHAR, 'g')).length) {
        case 1: {
            // d (6)
            return FORMAT_DESC.NUMERIC;
        }
        case 2: {
            // dd (06)
            return FORMAT_DESC.TWO_DIGITS;
        }
    }
}

/**
 *@hidden
 */
export function parseDateFormat(maskValue: string, locale: string = DEFAULT_LOCALE_DATE): any[] {
    let dateStruct = [];
    if (maskValue === undefined && !isIE()) {
        dateStruct = getDefaultLocaleMask(locale);
    } else {
        const mask = (maskValue !== undefined) ? maskValue : SHORT_DATE_MASK;
        const maskArray = Array.from(mask);
        const monthInitPosition = mask.indexOf(DATE_CHARS.MONTH_CHAR);
        const dayInitPosition = mask.indexOf(DATE_CHARS.DAY_CHAR);
        const yearInitPosition = mask.indexOf(DATE_CHARS.YEAR_CHAR);

        if (yearInitPosition !== -1) {
            dateStruct.push({
                type: DATE_PARTS.YEAR,
                initialPosition: yearInitPosition,
                formatType: getYearFormatType(mask)
            });
        }

        if (monthInitPosition !== -1) {
            dateStruct.push({
                type: DATE_PARTS.MONTH,
                initialPosition: monthInitPosition,
                formatType: getMonthFormatType(mask)
            });
        }

        if (dayInitPosition !== -1) {
            dateStruct.push({
                type: DATE_PARTS.DAY,
                initialPosition: dayInitPosition,
                formatType: getDayFormatType(mask)
            });
        }

        for (let i = 0; i < maskArray.length; i++) {
            if (!isSpecialSymbol(maskArray[i])) {
                dateStruct.push({
                    type: SEPARATOR,
                    initialPosition: i,
                    value: maskArray[i]
                });
            }
        }

        dateStruct.sort((a, b) => a.initialPosition - b.initialPosition);
        fillDatePartsPositions(dateStruct);
    }
    return dateStruct;
}

/**
 *@hidden
 */
export function getDefaultLocaleMask(locale: string) {
    const dateStruct = [];
    const formatter = new Intl.DateTimeFormat(locale);
    const formatToParts = formatter.formatToParts(new Date());
    for (let i = 0; i < formatToParts.length; i++) {
        if (formatToParts[i].type === SEPARATOR) {
            dateStruct.push({
                type: SEPARATOR,
                value: formatToParts[i].value
            });
        } else {
            dateStruct.push({
                type: formatToParts[i].type,
            });
        }
    }
    const formatterOptions = formatter.resolvedOptions();
    for (let i = 0; i < dateStruct.length; i++) {
        switch (dateStruct[i].type) {
            case DATE_PARTS.DAY: {
                dateStruct[i].formatType = formatterOptions.day;
                break;
            }
            case DATE_PARTS.MONTH: {
                dateStruct[i].formatType = formatterOptions.month;
                break;
            }
            case DATE_PARTS.YEAR: {
                dateStruct[i].formatType = formatterOptions.month;
                break;
            }
        }
    }
    fillDatePartsPositions(dateStruct);
    return dateStruct;
}

/**
 *@hidden
 */
export function isSpecialSymbol(char: string): boolean {
    return (char !== DATE_CHARS.YEAR_CHAR
        && char !== DATE_CHARS.MONTH_CHAR
        && char !== DATE_CHARS.DAY_CHAR) ? false : true;
}

/**
 *@hidden
 */
export function getInputMask(dateStruct: any[]): string {
    const inputMask = [];
    for (let i = 0; i < dateStruct.length; i++) {
        if (dateStruct[i].type === DATE_PARTS.DAY || dateStruct[i].type === DATE_PARTS.MONTH) {
            inputMask.push('00');
        }
        if (dateStruct[i].type === DATE_PARTS.YEAR) {
            switch (dateStruct[i].formatType) {
                case FORMAT_DESC.NUMERIC: {
                    inputMask.push('0000');
                    break;
                }
                case FORMAT_DESC.TWO_DIGITS: {
                    inputMask.push('00');
                    break;
                }
            }
        }

        if (dateStruct[i].type === SEPARATOR) {
            inputMask.push(dateStruct[i].value);
        }
    }

    return inputMask.join('');
}

/**
 *@hidden
 */
export function getMask(dateStruct: any[]): string {
    const mask = [];
    for (let i = 0; i < dateStruct.length; i++) {
        switch (dateStruct[i].formatType) {
            case FORMAT_DESC.NUMERIC: {
                if (dateStruct[i].type === DATE_PARTS.DAY) {
                    mask.push('d');
                }
                if (dateStruct[i].type === DATE_PARTS.MONTH) {
                    mask.push('M');
                }
                if (dateStruct[i].type === DATE_PARTS.YEAR) {
                    mask.push('yyyy');
                }
                break;
            }
            case FORMAT_DESC.TWO_DIGITS: {
                if (dateStruct[i].type === DATE_PARTS.DAY) {
                    mask.push('dd');
                }
                if (dateStruct[i].type === DATE_PARTS.MONTH) {
                    mask.push('MM');
                }
                if (dateStruct[i].type === DATE_PARTS.YEAR) {
                    mask.push('yy');
                }
            }
        }

        if (dateStruct[i].type === SEPARATOR) {
            mask.push(dateStruct[i].value);
        }
    }

    return mask.join('');
}

/**
 *@hidden
 */
export function parseDateArray(dateFormatParts: any[], prevDateValue: Date, inputValue: string): any[] {
    const dayStr = getDayValueFromInput(dateFormatParts, inputValue);
    const monthStr = getMonthValueFromInput(dateFormatParts, inputValue);
    const yearStr = getYearValueFromInput(dateFormatParts, inputValue);
    const yearFormat = getDateFormatPart(dateFormatParts, DATE_PARTS.YEAR).formatType;
    const day = (dayStr !== '') ? Number(dayStr) : 1;
    const month = (monthStr !== '') ? Number(monthStr) - 1 : 0;

    let year;
    if (yearStr === '') {
        year = (yearFormat === FORMAT_DESC.TWO_DIGITS) ? '00' : '2000';
    } else {
        year = yearStr;
    }
    let yearPrefix;
    if (prevDateValue !== null && prevDateValue !== undefined) {
        const originalYear = prevDateValue.getFullYear().toString();
        if (originalYear.length === 4) {
            yearPrefix = originalYear.substring(0, 2);
        }
    } else {
        yearPrefix = '20';
    }
    const fullYear = (yearFormat === FORMAT_DESC.TWO_DIGITS) ? yearPrefix.concat(year) : year;

    if ((month < 0) || (month > 11)) {
        return ['invalid', inputValue];
    }

    if ((day < 1) || (day > daysInMonth(fullYear, month))) {
        return ['invalid', inputValue];
    }

    const date = new Date();
    date.setDate(day);
    date.setMonth(month);
    date.setFullYear(fullYear);

    return ['valid', date];
}

/**
 *@hidden
 */
export function maskToPromptChars(mask: string): string {
    return mask.replace(/0|L/g, PROMPT_CHAR);
}

/**
 *@hidden
 */
export function trimUnderlines(value: string): string {
    return value.replace(/_/g, '');
}

/**
 *@hidden
 */
export function getNumericFormatPrefix(formatType: string): string {
    switch (formatType) {
        case FORMAT_DESC.TWO_DIGITS: {
            return '0';
        }
        case FORMAT_DESC.NUMERIC: {
            return PROMPT_CHAR;
        }
    }
}

/**
 *@hidden
 */
export function getModifiedDateInput(dateFormatParts: any[],
    inputValue: string,
    position: number,
    delta: number,
    isSpinLoop: boolean): string {
    const datePart = getDatePartOnPosition(dateFormatParts, position);
    const datePartType = datePart.type;
    const datePartFormatType = datePart.formatType;
    let newValue;

    const datePartValue = getDateValueFromInput(dateFormatParts, datePartType, inputValue);
    newValue = parseInt(datePartValue, 10);

    let maxValue, minValue;
    const minMax = getMinMaxValue(dateFormatParts, datePart, inputValue);
    minValue = minMax[0];
    maxValue = minMax[1];

    if (isNaN(newValue)) {
        if (minValue === 'infinite') {
            newValue = 2000;
        } else {
            newValue = minValue;
        }
    }
    let tempValue = newValue;
    tempValue += delta;

    // Infinite loop for full years
    if (maxValue === 'infinite' && minValue === 'infinite') {
        newValue = tempValue;
    }

    if (isSpinLoop) {
        if (tempValue > maxValue) {
            tempValue = minValue;
        }
        if (tempValue < minValue) {
            tempValue = maxValue;
        }
        newValue = tempValue;
    } else {
        if (tempValue <= maxValue && tempValue >= minValue) {
            newValue = tempValue;
        }
    }

    const startIdx = datePart.position[0];
    const endIdx = datePart.position[1];
    const start = inputValue.slice(0, startIdx);
    const end = inputValue.slice(endIdx, inputValue.length);
    let changedPart: string;

    const prefix = getNumericFormatPrefix(datePartFormatType);
    changedPart = (newValue < 10) ? `${prefix}${newValue}` : `${newValue}`;

    return `${start}${changedPart}${end}`;
}

/**
 *@hidden
 */
export function getMinMaxValue(dateFormatParts: any[], datePart, inputValue: string): any[] {
    let maxValue, minValue;
    switch (datePart.type) {
        case DATE_PARTS.MONTH: {
            minValue = 1;
            maxValue = NUMBER_OF_MONTHS;
            break;
        }
        case DATE_PARTS.DAY: {
            minValue = 1;
            maxValue = daysInMonth(
                getFullYearFromString(getDateFormatPart(dateFormatParts, DATE_PARTS.YEAR), inputValue),
                Number(getMonthValueFromInput(dateFormatParts, inputValue)));
            break;
        }
        case DATE_PARTS.YEAR: {
            if (datePart.formatType === FORMAT_DESC.TWO_DIGITS) {
                minValue = 0;
                maxValue = 99;
            } else {
                // Infinite loop
                minValue = 'infinite';
                maxValue = 'infinite';
            }
            break;
        }
    }
    return [minValue, maxValue];
}


/**
 *@hidden
 */
export function daysInMonth(fullYear: number, month: number): number {
    return new Date(fullYear, month, 0).getDate();
}

/**
 *@hidden
 */
export function addPromptCharsEditMode(dateFormatParts: any[], date: Date, inputValue: string): string {
    const dateArray = Array.from(inputValue);
    for (let i = 0; i < dateFormatParts.length; i++) {
        if (dateFormatParts[i].formatType === FORMAT_DESC.NUMERIC) {
            if ((dateFormatParts[i].type === DATE_PARTS.DAY && date.getDate() < 10)
                || (dateFormatParts[i].type === DATE_PARTS.MONTH && date.getMonth() + 1 < 10)) {
                dateArray.splice(dateFormatParts[i].position[0], 0, PROMPT_CHAR);
                dateArray.join('');
            }
        }
    }
    return dateArray.join('');
}

/**
 *@hidden
 */
export function getDateValueFromInput(dateFormatParts: any[], type: string, inputValue: string, trim: boolean = true): string {
    const partPosition = getDateFormatPart(dateFormatParts, type).position;
    const result = inputValue.substring(partPosition[0], partPosition[1]);
    return (trim) ? trimUnderlines(result) : result;
}

/**
 *@hidden
 */
export function getDayValueFromInput(dateFormatParts: any[], inputValue: string, trim: boolean = true): string {
    return getDateValueFromInput(dateFormatParts, DATE_PARTS.DAY, inputValue, trim);
}

/**
 *@hidden
 */
export function getMonthValueFromInput(dateFormatParts: any[], inputValue: string, trim: boolean = true): string {
    return getDateValueFromInput(dateFormatParts, DATE_PARTS.MONTH, inputValue, trim);
}

/**
 *@hidden
 */
export function getYearValueFromInput(dateFormatParts: any[], inputValue: string, trim: boolean = true): string {
    return getDateValueFromInput(dateFormatParts, DATE_PARTS.YEAR, inputValue, trim);
}

/**
 *@hidden
 */
export function getDateFormatPart(dateFormatParts: any[], type: string): any {
    return dateFormatParts.filter((datePart) => (datePart.type === type))[0];
}

/**
 *@hidden
 */
export function isFullInput(value: any, input: string): boolean {
    if (value !== '' && input.length === 2 && input.charAt(1) !== PROMPT_CHAR) {
        return true;
    }
    return false;
}

/**
 *@hidden
 */
export function isFullYearInput(dateFormatParts: any[], value: any): boolean {
    switch (getDateFormatPart(dateFormatParts, DATE_PARTS.YEAR).formatType) {
        case FORMAT_DESC.NUMERIC: {
            return (value !== '' && value.length === 4) ? true : false;
        }
        case FORMAT_DESC.TWO_DIGITS: {
            return (value !== '' && value.length === 2) ? true : false;
        }
        default: {
            return false;
        }
    }
}

/**
 *@hidden
 */
export function getDatePartOnPosition(dateFormatParts: any[], position: number) {
    return dateFormatParts.filter((element) =>
        element.position[0] <= position && position <= element.position[1] && element.type !== SEPARATOR)[0];
}

/**
 *@hidden
 */
export function isDateInRanges(date: Date, ranges: DateRangeDescriptor[]): boolean {
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dateInMs = date.getTime();

    for (const descriptor of ranges) {
        const dRanges = descriptor.dateRange ? descriptor.dateRange.map(
            r => new Date(r.getFullYear(), r.getMonth(), r.getDate())) : undefined;
        switch (descriptor.type) {
            case (DateRangeType.After):
                if (dateInMs > dRanges[0].getTime()) {
                    return true;
                }

                break;
            case (DateRangeType.Before):
                if (dateInMs < dRanges[0].getTime()) {
                    return true;
                }

                break;
            case (DateRangeType.Between):
                const dRange = dRanges.map(d => d.getTime());
                const min = Math.min(dRange[0], dRange[1]);
                const max = Math.max(dRange[0], dRange[1]);
                if (dateInMs >= min && dateInMs <= max) {
                    return true;
                }

                break;
            case (DateRangeType.Specific):
                const datesInMs = dRanges.map(d => d.getTime());
                for (const specificDateInMs of datesInMs) {
                    if (dateInMs === specificDateInMs) {
                        return true;
                    }
                }

                break;
            case (DateRangeType.Weekdays):
                const day = date.getDay();
                if (day % 6 !== 0) {
                    return true;
                }

                break;
            case (DateRangeType.Weekends):
                const weekday = date.getDay();
                if (weekday % 6 === 0) {
                    return true;
                }

                break;
            default:
                return false;
        }
    }

    return false;
}

export function checkForCompleteDateInput(dateFormatParts: any[], input: string): string {
    const dayValue = getDayValueFromInput(dateFormatParts, input);
    const monthValue = getMonthValueFromInput(dateFormatParts, input);
    const yearValue = getYearValueFromInput(dateFormatParts, input);
    const dayStr = getDayValueFromInput(dateFormatParts, input, false);
    const monthStr = getMonthValueFromInput(dateFormatParts, input, false);

    if (isFullInput(dayValue, dayStr)
        && isFullInput(monthValue, monthStr)
        && isFullYearInput(dateFormatParts, yearValue)) {
        return 'complete';
    }

    if (dayValue === '' && monthValue === '' && yearValue === '') {
        return 'empty';
    }

    if (dayValue === '' || monthValue === '' || yearValue === '') {
        return 'partial';
    }

    return '';
}

/**
 *@hidden
 */
function fillDatePartsPositions(dateArray: any[]): void {
    let currentPos = 0;

    for (let i = 0; i < dateArray.length; i++) {
        // Day|Month part positions
        if (dateArray[i].type === DATE_PARTS.DAY || dateArray[i].type === DATE_PARTS.MONTH) {
            // Offset 2 positions for number
            dateArray[i].position = [currentPos, currentPos + 2];
            currentPos += 2;
        }

        // Separator positions
        if (dateArray[i].type === SEPARATOR) {
            dateArray[i].position = [currentPos, currentPos + 1];
            currentPos++;
        }

        // Year part positions
        if (dateArray[i].type === DATE_PARTS.YEAR) {
            switch (dateArray[i].formatType) {
                case FORMAT_DESC.NUMERIC: {
                    // Offset 4 positions for full year
                    dateArray[i].position = [currentPos, currentPos + 4];
                    currentPos += 4;
                    break;
                }
                case FORMAT_DESC.TWO_DIGITS: {
                    // Offset 2 positions for short year
                    dateArray[i].position = [currentPos, currentPos + 2];
                    currentPos += 2;
                    break;
                }
            }
        }
    }
}

/**
 *@hidden
 */
function getFullYearFromString(yearPart, inputValue): number {
    return Number(inputValue.substring(yearPart.position[0], yearPart.position[1]));
}

