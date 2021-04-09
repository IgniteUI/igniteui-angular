import { isIE } from '../core/utils';
import { DatePart, DatePartInfo } from '../directives/date-time-editor/date-time-editor.common';
import { formatDate, FormatWidth, getLocaleDateFormat } from '@angular/common';
import { ValidationErrors } from '@angular/forms';

/**
 * This enum is used to keep the date validation result.
 *
 * @hidden
 */
export const enum DateState {
    Valid = 'valid',
    Invalid = 'invalid',
}

/** @hidden */
const enum FormatDesc {
    Numeric = 'numeric',
    TwoDigits = '2-digit'
}

/** @hidden */
const enum DateChars {
    YearChar = 'y',
    MonthChar = 'M',
    DayChar = 'd'
}

const DATE_CHARS = ['h', 'H', 'm', 's', 'S', 't', 'T'];
const TIME_CHARS = ['d', 'D', 'M', 'y', 'Y'];

/** @hidden */
const enum DateParts {
    Day = 'day',
    Month = 'month',
    Year = 'year'
}


/** @hidden */
export abstract class DatePickerUtil {
    public static readonly DEFAULT_INPUT_FORMAT = 'MM/dd/yyyy';
    static DEFAULT_TIME_INPUT_FORMAT = 'hh:mm tt';
    // TODO: this is the def mask for the date-picker, should remove it during refactoring
    private static readonly SHORT_DATE_MASK = 'MM/dd/yy';
    private static readonly SEPARATOR = 'literal';
    private static readonly NUMBER_OF_MONTHS = 12;
    private static readonly PROMPT_CHAR = '_';
    private static readonly DEFAULT_LOCALE = 'en';
    /**
     *  TODO: (in issue #6483) Unit tests and docs for all public methods.
     */



    /**
     * Parse a Date value from masked string input based on determined date parts
     *
     * @param inputData masked value to parse
     * @param dateTimeParts Date parts array for the mask
     */
    public static parseValueFromMask(inputData: string, dateTimeParts: DatePartInfo[], promptChar?: string): Date | null {
        const parts: { [key in DatePart]: number } = {} as any;
        dateTimeParts.forEach(dp => {
            let value = parseInt(DatePickerUtil.getCleanVal(inputData, dp, promptChar), 10);
            if (!value) {
                value = dp.type === DatePart.Date || dp.type === DatePart.Month ? 1 : 0;
            }
            parts[dp.type] = value;
        });
        parts[DatePart.Month] -= 1;

        if (parts[DatePart.Month] < 0 || 11 < parts[DatePart.Month]) {
            return null;
        }

        // TODO: Century threshold
        if (parts[DatePart.Year] < 50) {
            parts[DatePart.Year] += 2000;
        }

        if (parts[DatePart.Date] > DatePickerUtil.daysInMonth(parts[DatePart.Year], parts[DatePart.Month])) {
            return null;
        }

        if (parts[DatePart.Hours] > 23 || parts[DatePart.Minutes] > 59 || parts[DatePart.Seconds] > 59) {
            return null;
        }

        return new Date(
            parts[DatePart.Year] || 2000,
            parts[DatePart.Month] || 0,
            parts[DatePart.Date] || 1,
            parts[DatePart.Hours] || 0,
            parts[DatePart.Minutes] || 0,
            parts[DatePart.Seconds] || 0
        );
    }

    /**
     * Parse the mask into date/time and literal parts
     */
    public static parseDateTimeFormat(mask: string, locale: string = DatePickerUtil.DEFAULT_LOCALE): DatePartInfo[] {
        const format = mask || DatePickerUtil.getDefaultInputFormat(locale);
        const dateTimeParts: DatePartInfo[] = [];
        const formatArray = Array.from(format);
        let currentPart: DatePartInfo = null;
        let position = 0;

        for (let i = 0; i < formatArray.length; i++, position++) {
            const type = DatePickerUtil.determineDatePart(formatArray[i]);
            if (currentPart) {
                if (currentPart.type === type) {
                    currentPart.format += formatArray[i];
                    if (i < formatArray.length - 1) {
                        continue;
                    }
                }

                DatePickerUtil.ensureLeadingZero(currentPart);
                currentPart.end = currentPart.start + currentPart.format.length;
                position = currentPart.end;
                dateTimeParts.push(currentPart);
            }

            currentPart = {
                start: position,
                end: position + formatArray[i].length,
                type,
                format: formatArray[i]
            };
        }

        return dateTimeParts;
    }

    public static getDefaultInputFormat(locale: string): string {
        if (!Intl || !Intl.DateTimeFormat || !Intl.DateTimeFormat.prototype.formatToParts) {
            // TODO: fallback with Intl.format for IE?
            return DatePickerUtil.SHORT_DATE_MASK;
        }
        const parts = DatePickerUtil.getDefaultLocaleMask(locale);
        parts.forEach(p => {
            if (p.type !== DatePart.Year && p.type !== DatePickerUtil.SEPARATOR) {
                p.formatType = FormatDesc.TwoDigits;
            }
        });

        return DatePickerUtil.getMask(parts);
    }

    public static formatDate(value: number | Date, format: string, locale: string, timezone?: string): string {
        let formattedDate: string;
        try {
            formattedDate = formatDate(value, format, locale, timezone);
        } catch {
            DatePickerUtil.logMissingLocaleSettings(locale);
            const formatter = new Intl.DateTimeFormat(locale);
            formattedDate = formatter.format(value);
        }

        return formattedDate;
    }

    public static getLocaleDateFormat(locale: string, displayFormat?: string): string {
        const formatKeys = Object.keys(FormatWidth) as (keyof FormatWidth)[];
        const targetKey = formatKeys.find(k => k.toLowerCase() === displayFormat?.toLowerCase().replace('date', ''));
        if (!targetKey) {
            // if displayFormat is not shortDate, longDate, etc.
            // or if it is not set by the user
            return displayFormat;
        }
        let format: string;
        try {
            format = getLocaleDateFormat(locale, FormatWidth[targetKey]);
        } catch {
            DatePickerUtil.logMissingLocaleSettings(locale);
            format = DatePickerUtil.getDefaultInputFormat(locale);
        }

        return format;
    }

    public static isDateOrTimeChar(char: string): boolean {
        return DATE_CHARS.indexOf(char) !== -1 || TIME_CHARS.indexOf(char) !== -1;
    }

    public static spinDate(delta: number, newDate: Date, isSpinLoop: boolean): void {
        const maxDate = DatePickerUtil.daysInMonth(newDate.getFullYear(), newDate.getMonth());
        let date = newDate.getDate() + delta;
        if (date > maxDate) {
            date = isSpinLoop ? date % maxDate : maxDate;
        } else if (date < 1) {
            date = isSpinLoop ? maxDate + (date % maxDate) : 1;
        }

        newDate.setDate(date);
    }

    public static spinMonth(delta: number, newDate: Date, isSpinLoop: boolean): void {
        const maxDate = DatePickerUtil.daysInMonth(newDate.getFullYear(), newDate.getMonth() + delta);
        if (newDate.getDate() > maxDate) {
            newDate.setDate(maxDate);
        }

        const maxMonth = 11;
        const minMonth = 0;
        let month = newDate.getMonth() + delta;
        if (month > maxMonth) {
            month = isSpinLoop ? (month % maxMonth) - 1 : maxMonth;
        } else if (month < minMonth) {
            month = isSpinLoop ? maxMonth + (month % maxMonth) + 1 : minMonth;
        }

        newDate.setMonth(month);
    }

    public static spinYear(delta: number, newDate: Date): void {
        const maxDate = DatePickerUtil.daysInMonth(newDate.getFullYear() + delta, newDate.getMonth());
        if (newDate.getDate() > maxDate) {
            // clip to max to avoid leap year change shifting the entire value
            newDate.setDate(maxDate);
        }
        newDate.setFullYear(newDate.getFullYear() + delta);
    }

    public static spinHours(delta: number, newDate: Date, isSpinLoop: boolean, minHour = 0, maxHour = 23): void {
        let hours = newDate.getHours() + delta;
        if (hours > maxHour) {
            hours = isSpinLoop ? hours % maxHour - 1 : maxHour;
        } else if (hours < minHour) {
            hours = isSpinLoop ? maxHour + (hours % maxHour) + 1 : minHour;
        }

        newDate.setHours(hours);
    }

    public static spinMinutes(delta: number, newDate: Date, isSpinLoop: boolean): void {
        const maxMinutes = 59;
        const minMinutes = 0;
        let minutes = newDate.getMinutes() + delta;
        if (minutes > maxMinutes) {
            minutes = isSpinLoop ? minutes % maxMinutes - 1 : maxMinutes;
        } else if (minutes < minMinutes) {
            minutes = isSpinLoop ? maxMinutes + (minutes % maxMinutes) + 1 : minMinutes;
        }

        newDate.setMinutes(minutes);
    }

    public static spinSeconds(delta: number, newDate: Date, isSpinLoop: boolean): void {
        const maxSeconds = 59;
        const minSeconds = 0;
        let seconds = newDate.getSeconds() + delta;
        if (seconds > maxSeconds) {
            seconds = isSpinLoop ? seconds % maxSeconds - 1 : maxSeconds;
        } else if (seconds < minSeconds) {
            seconds = isSpinLoop ? maxSeconds + (seconds % maxSeconds) + 1 : minSeconds;
        }

        newDate.setSeconds(seconds);
    }

    public static spinAmPm(newDate: Date, currentDate: Date, amPmFromMask: string): Date {
        switch (amPmFromMask) {
            case 'AM':
                newDate = new Date(newDate.setHours(newDate.getHours() + 12));
                break;
            case 'PM':
                newDate = new Date(newDate.setHours(newDate.getHours() - 12));
                break;
        }
        if (newDate.getDate() !== currentDate.getDate()) {
            return currentDate;
        }

        return newDate;
    }

    /**
     * Determines whether the provided value is greater than the provided max value.
     *
     * @param includeTime set to false if you want to exclude time portion of the two dates
     * @param includeDate set to false if you want to exclude the date portion of the two dates
     * @returns true if provided value is greater than provided maxValue
     */
    public static greaterThanMaxValue(value: Date, maxValue: Date, includeTime = true, includeDate = true): boolean {
        // TODO: check if provided dates are valid dates and not Invalid Date
        // if maxValue is Invalid Date and value is valid date this will return:
        // - false if includeDate is true
        // - true if includeDate is false
        if (includeTime && includeDate) {
            return value.getTime() > maxValue.getTime();
        }

        const _value = new Date(value.getTime());
        const _maxValue = new Date(maxValue.getTime());
        if (!includeTime) {
            _value.setHours(0, 0, 0, 0);
            _maxValue.setHours(0, 0, 0, 0);
        }
        if (!includeDate) {
            _value.setFullYear(0, 0, 0);
            _maxValue.setFullYear(0, 0, 0);
        }

        return _value.getTime() > _maxValue.getTime();
    }

    /**
     * Determines whether the provided value is less than the provided min value.
     *
     * @param includeTime set to false if you want to exclude time portion of the two dates
     * @param includeDate set to false if you want to exclude the date portion of the two dates
     * @returns true if provided value is less than provided minValue
     */
    public static lessThanMinValue(value: Date, minValue: Date, includeTime = true, includeDate = true): boolean {
        // TODO: check if provided dates are valid dates and not Invalid Date
        // if value is Invalid Date and minValue is valid date this will return:
        // - false if includeDate is true
        // - true if includeDate is false
        if (includeTime && includeDate) {
            return value.getTime() < minValue.getTime();
        }

        const _value = new Date(value.getTime());
        const _minValue = new Date(minValue.getTime());
        if (!includeTime) {
            _value.setHours(0, 0, 0, 0);
            _minValue.setHours(0, 0, 0, 0);
        }
        if (!includeDate) {
            _value.setFullYear(0, 0, 0);
            _minValue.setFullYear(0, 0, 0);
        }

        return _value.getTime() < _minValue.getTime();
    }

    /**
     * Validates a value within a given min and max value range.
     *
     * @param value The value to validate
     * @param minValue The lowest possible value that `value` can take
     * @param maxValue The largest possible value that `value` can take
     */
    public static validateMinMax(value: Date, minValue: Date | string, maxValue: Date | string, includeTime = false, includeDate = true): ValidationErrors | null {
        const errors = {};
        const min = DatePickerUtil.parseDate(minValue);
        const max = DatePickerUtil.parseDate(maxValue);
        if ((min && value && DatePickerUtil.lessThanMinValue(value, min, includeTime, includeDate))
            || (min && value && DatePickerUtil.lessThanMinValue(value, min, includeTime, includeDate))) {
            Object.assign(errors, { minValue: true });
        }
        if ((max && value && DatePickerUtil.greaterThanMaxValue(value, max, includeTime, includeDate))
            || (max && value && DatePickerUtil.greaterThanMaxValue(value, max, includeTime, includeDate))) {
            Object.assign(errors, { maxValue: true });
        }

        return errors;
    }

    /**
     * This method generates date parts structure based on editor mask and locale.
     *
     * @param maskValue: string
     * @param locale: string
     * @returns array containing information about date parts - type, position, format
     */
    public static parseDateFormat(maskValue: string, locale: string = DatePickerUtil.DEFAULT_LOCALE): any[] {
        let dateStruct = [];
        if (maskValue === undefined && !isIE()) {
            dateStruct = DatePickerUtil.getDefaultLocaleMask(locale);
        } else {
            const mask = (maskValue) ? maskValue : DatePickerUtil.SHORT_DATE_MASK;
            const maskArray = Array.from(mask);
            const monthInitPosition = mask.indexOf(DateChars.MonthChar);
            const dayInitPosition = mask.indexOf(DateChars.DayChar);
            const yearInitPosition = mask.indexOf(DateChars.YearChar);

            if (yearInitPosition !== -1) {
                dateStruct.push({
                    type: DateParts.Year,
                    initialPosition: yearInitPosition,
                    formatType: DatePickerUtil.getYearFormatType(mask)
                });
            }

            if (monthInitPosition !== -1) {
                dateStruct.push({
                    type: DateParts.Month,
                    initialPosition: monthInitPosition,
                    formatType: DatePickerUtil.getMonthFormatType(mask)
                });
            }

            if (dayInitPosition !== -1) {
                dateStruct.push({
                    type: DateParts.Day,
                    initialPosition: dayInitPosition,
                    formatType: DatePickerUtil.getDayFormatType(mask)
                });
            }

            for (let i = 0; i < maskArray.length; i++) {
                if (!DatePickerUtil.isDateChar(maskArray[i])) {
                    dateStruct.push({
                        type: DatePickerUtil.SEPARATOR,
                        initialPosition: i,
                        value: maskArray[i]
                    });
                }
            }

            dateStruct.sort((a, b) => a.initialPosition - b.initialPosition);
            DatePickerUtil.fillDatePartsPositions(dateStruct);
        }
        return dateStruct;
    }

    /**
     * This method generates input mask based on date parts.
     *
     * @param dateStruct array
     * @returns input mask
     */
    public static getInputMask(dateStruct: any[]): string {
        const inputMask = [];
        for (const part of dateStruct) {
            if (part.type === DatePickerUtil.SEPARATOR) {
                inputMask.push(part.value);
            } else if (part.type === DateParts.Day || part.type === DateParts.Month) {
                inputMask.push('00');
            } else if (part.type === DateParts.Year) {
                switch (part.formatType) {
                    case FormatDesc.Numeric: {
                        inputMask.push('0000');
                        break;
                    }
                    case FormatDesc.TwoDigits: {
                        inputMask.push('00');
                        break;
                    }
                }
            }
        }
        return inputMask.join('');
    }

    /**
     * This method generates editor mask.
     *
     * @param dateStruct
     * @returns editor mask
     */
    public static getMask(dateStruct: any[]): string {
        const mask = [];
        for (const part of dateStruct) {
            switch (part.formatType) {
                case FormatDesc.Numeric: {
                    if (part.type === DateParts.Day) {
                        mask.push('d');
                    } else if (part.type === DateParts.Month) {
                        mask.push('M');
                    } else {
                        mask.push('yyyy');
                    }
                    break;
                }
                case FormatDesc.TwoDigits: {
                    if (part.type === DateParts.Day) {
                        mask.push('dd');
                    } else if (part.type === DateParts.Month) {
                        mask.push('MM');
                    } else {
                        mask.push('yy');
                    }
                }
            }

            if (part.type === DatePickerUtil.SEPARATOR) {
                mask.push(part.value);
            }
        }

        return mask.join('');
    }
    /**
     * This method parses an input string base on date parts and returns a date and its validation state.
     *
     * @param dateFormatParts
     * @param prevDateValue
     * @param inputValue
     * @returns object containing a date and its validation state
     */
    public static parseDateArray(dateFormatParts: any[], prevDateValue: Date, inputValue: string): any {
        const dayStr = DatePickerUtil.getDayValueFromInput(dateFormatParts, inputValue);
        const monthStr = DatePickerUtil.getMonthValueFromInput(dateFormatParts, inputValue);
        const yearStr = DatePickerUtil.getYearValueFromInput(dateFormatParts, inputValue);
        const yearFormat = DatePickerUtil.getDateFormatPart(dateFormatParts, DateParts.Year).formatType;
        const day = (dayStr !== '') ? parseInt(dayStr, 10) : 1;
        const month = (monthStr !== '') ? parseInt(monthStr, 10) - 1 : 0;

        let year;
        if (yearStr === '') {
            year = (yearFormat === FormatDesc.TwoDigits) ? '00' : '2000';
        } else {
            year = yearStr;
        }
        let yearPrefix;
        if (prevDateValue) {
            const originalYear = prevDateValue.getFullYear().toString();
            if (originalYear.length === 4) {
                yearPrefix = originalYear.substring(0, 2);
            }
        } else {
            yearPrefix = '20';
        }
        const fullYear = (yearFormat === FormatDesc.TwoDigits) ? yearPrefix.concat(year) : year;

        if ((month < 0) || (month > 11) || isNaN(month)) {
            return { state: DateState.Invalid, value: inputValue };
        }

        if ((day < 1) || (day > DatePickerUtil.daysInMonth(fullYear, month)) || isNaN(day)) {
            return { state: DateState.Invalid, value: inputValue };
        }

        return { state: DateState.Valid, date: new Date(fullYear, month, day) };
    }

    public static maskToPromptChars(mask: string): string {
        const result = mask.replace(/0|L/g, DatePickerUtil.PROMPT_CHAR);
        return result;
    }

    /**
     * This method replaces prompt chars with empty string.
     *
     * @param value
     */
    public static trimEmptyPlaceholders(value: string, promptChar?: string): string {
        const result = value.replace(new RegExp(promptChar || '_', 'g'), '');
        return result;
    }

    /**
     * This method is used for spinning date parts.
     *
     * @param dateFormatParts
     * @param inputValue
     * @param position
     * @param delta
     * @param isSpinLoop
     * @return modified text input
     */
    public static getModifiedDateInput(dateFormatParts: any[],
        inputValue: string,
        position: number,
        delta: number,
        isSpinLoop: boolean): string {
        const datePart = DatePickerUtil.getDatePartOnPosition(dateFormatParts, position);
        const datePartType = datePart.type;
        const datePartFormatType = datePart.formatType;
        let newValue;

        const datePartValue = DatePickerUtil.getDateValueFromInput(dateFormatParts, datePartType, inputValue);
        newValue = parseInt(datePartValue, 10);

        const minMax = DatePickerUtil.getMinMaxValue(dateFormatParts, datePart, inputValue);
        const minValue = minMax.min;
        const maxValue = minMax.max;

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
        const prefix = DatePickerUtil.getNumericFormatPrefix(datePartFormatType);
        const changedPart = (newValue < 10) ? `${prefix}${newValue}` : `${newValue}`;

        return `${start}${changedPart}${end}`;
    }

    /**
     * This method returns date input with prompt chars.
     *
     * @param dateFormatParts
     * @param date
     * @param inputValue
     * @returns date input including prompt chars
     */
    public static addPromptCharsEditMode(dateFormatParts: any[], date: Date, inputValue: string): string {
        const dateArray = Array.from(inputValue);
        for (const part of dateFormatParts) {
            if (part.formatType === FormatDesc.Numeric) {
                if ((part.type === DateParts.Day && date.getDate() < 10)
                    || (part.type === DateParts.Month && date.getMonth() + 1 < 10)) {
                    dateArray.splice(part.position[0], 0, DatePickerUtil.PROMPT_CHAR);
                    dateArray.join('');
                }
            }
        }
        return dateArray.join('');
    }

    /**
     * This method checks if date input is done.
     *
     * @param dateFormatParts
     * @param input
     * @returns input completeness
     */
    public static checkForCompleteDateInput(dateFormatParts: any[], input: string): string {
        const dayValue = DatePickerUtil.getDayValueFromInput(dateFormatParts, input);
        const monthValue = DatePickerUtil.getMonthValueFromInput(dateFormatParts, input);
        const yearValue = DatePickerUtil.getYearValueFromInput(dateFormatParts, input);
        const dayStr = DatePickerUtil.getDayValueFromInput(dateFormatParts, input, false);
        const monthStr = DatePickerUtil.getMonthValueFromInput(dateFormatParts, input, false);

        if (DatePickerUtil.isFullInput(dayValue, dayStr)
            && DatePickerUtil.isFullInput(monthValue, monthStr)
            && DatePickerUtil.isFullYearInput(dateFormatParts, yearValue)) {
            return 'complete';
        } else if (dayValue === '' && monthValue === '' && yearValue === '') {
            return 'empty';
        } else if (dayValue === '' || monthValue === '' || yearValue === '') {
            return 'partial';
        }
        return '';
    }

    public static daysInMonth(fullYear: number, month: number): number {
        return new Date(fullYear, month + 1, 0).getDate();
    }

    /**
     * Parse provided input to Date.
     *
     * @param value input to parse
     * @returns Date if parse succeed or null
     */
    public static parseDate(value: any): Date | null {
        if (typeof value === 'number') {
            return new Date(value);
        }

        // if value is Invalid Date we should return null
        if (DatePickerUtil.isDate(value)) {
            return DatePickerUtil.isValidDate(value) ? value : null;
        }

        return value ? new Date(Date.parse(value)) : null;
    }

    /**
     * Returns whether provided input is date
     *
     * @param value input to check
     * @returns true if provided input is date
     */
    public static isDate(value: any): boolean {
        return Object.prototype.toString.call(value) === '[object Date]';
    }

    /**
     * Returns whether the input is valid date
     *
     * @param value input to check
     * @returns true if provided input is a valid date
     */
    public static isValidDate(value: any): boolean {
        if (DatePickerUtil.isDate(value)) {
            return !isNaN(value.getTime());
        }

        return false;
    }

    private static logMissingLocaleSettings(locale: string): void {
        console.warn(`Missing locale data for the locale ${locale}. Please refer to https://angular.io/guide/i18n#i18n-pipes`);
        console.warn('Using default browser locale settings.');
    }

    private static ensureLeadingZero(part: DatePartInfo) {
        switch (part.type) {
            case DatePart.Date:
            case DatePart.Month:
            case DatePart.Hours:
            case DatePart.Minutes:
            case DatePart.Seconds:
                if (part.format.length === 1) {
                    part.format = part.format.repeat(2);
                }
                break;
        }
    }

    private static getCleanVal(inputData: string, datePart: DatePartInfo, promptChar?: string): string {
        return DatePickerUtil.trimEmptyPlaceholders(inputData.substring(datePart.start, datePart.end), promptChar);
    }

    private static determineDatePart(char: string): DatePart {
        switch (char) {
            case 'd':
            case 'D':
                return DatePart.Date;
            case 'M':
                return DatePart.Month;
            case 'y':
            case 'Y':
                return DatePart.Year;
            case 'h':
            case 'H':
                return DatePart.Hours;
            case 'm':
                return DatePart.Minutes;
            case 's':
            case 'S':
                return DatePart.Seconds;
            case 't':
            case 'T':
                return DatePart.AmPm;
            default:
                return DatePart.Literal;
        }
    }

    private static getYearFormatType(format: string): string {
        switch (format.match(new RegExp(DateChars.YearChar, 'g')).length) {
            case 1: {
                // y (2020)
                return FormatDesc.Numeric;
            }
            case 4: {
                // yyyy (2020)
                return FormatDesc.Numeric;
            }
            case 2: {
                // yy (20)
                return FormatDesc.TwoDigits;
            }
        }
    }

    private static getMonthFormatType(format: string): string {
        switch (format.match(new RegExp(DateChars.MonthChar, 'g')).length) {
            case 1: {
                // M (8)
                return FormatDesc.Numeric;
            }
            case 2: {
                // MM (08)
                return FormatDesc.TwoDigits;
            }
        }
    }

    private static getDayFormatType(format: string): string {
        switch (format.match(new RegExp(DateChars.DayChar, 'g')).length) {
            case 1: {
                // d (6)
                return FormatDesc.Numeric;
            }
            case 2: {
                // dd (06)
                return FormatDesc.TwoDigits;
            }
        }
    }

    private static getDefaultLocaleMask(locale: string) {
        const dateStruct = [];
        const formatter = new Intl.DateTimeFormat(locale);
        const formatToParts = formatter.formatToParts(new Date());
        for (const part of formatToParts) {
            if (part.type === DatePickerUtil.SEPARATOR) {
                dateStruct.push({
                    type: DatePickerUtil.SEPARATOR,
                    value: part.value
                });
            } else {
                dateStruct.push({
                    type: part.type
                });
            }
        }
        const formatterOptions = formatter.resolvedOptions();
        for (const part of dateStruct) {
            switch (part.type) {
                case DateParts.Day: {
                    part.formatType = formatterOptions.day;
                    break;
                }
                case DateParts.Month: {
                    part.formatType = formatterOptions.month;
                    break;
                }
                case DateParts.Year: {
                    part.formatType = formatterOptions.year;
                    break;
                }
            }
        }
        DatePickerUtil.fillDatePartsPositions(dateStruct);
        return dateStruct;
    }

    private static isDateChar(char: string): boolean {
        return (char === DateChars.YearChar || char === DateChars.MonthChar || char === DateChars.DayChar);
    }

    private static getNumericFormatPrefix(formatType: string): string {
        switch (formatType) {
            case FormatDesc.TwoDigits: {
                return '0';
            }
            case FormatDesc.Numeric: {
                return DatePickerUtil.PROMPT_CHAR;
            }
        }
    }

    private static getMinMaxValue(dateFormatParts: any[], datePart, inputValue: string): any {
        let maxValue; let minValue;
        switch (datePart.type) {
            case DateParts.Month: {
                minValue = 1;
                maxValue = DatePickerUtil.NUMBER_OF_MONTHS;
                break;
            }
            case DateParts.Day: {
                minValue = 1;
                maxValue = DatePickerUtil.daysInMonth(
                    DatePickerUtil.getFullYearFromString(DatePickerUtil.getDateFormatPart(dateFormatParts, DateParts.Year), inputValue),
                    parseInt(DatePickerUtil.getMonthValueFromInput(dateFormatParts, inputValue), 10));
                break;
            }
            case DateParts.Year: {
                if (datePart.formatType === FormatDesc.TwoDigits) {
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
        return { min: minValue, max: maxValue };
    }

    private static getDateValueFromInput(dateFormatParts: any[], type: DateParts, inputValue: string, trim: boolean = true): string {
        const partPosition = DatePickerUtil.getDateFormatPart(dateFormatParts, type).position;
        const result = inputValue.substring(partPosition[0], partPosition[1]);
        return (trim) ? DatePickerUtil.trimEmptyPlaceholders(result) : result;
    }

    private static getDayValueFromInput(dateFormatParts: any[], inputValue: string, trim: boolean = true): string {
        return DatePickerUtil.getDateValueFromInput(dateFormatParts, DateParts.Day, inputValue, trim);
    }

    private static getMonthValueFromInput(dateFormatParts: any[], inputValue: string, trim: boolean = true): string {
        return DatePickerUtil.getDateValueFromInput(dateFormatParts, DateParts.Month, inputValue, trim);
    }

    private static getYearValueFromInput(dateFormatParts: any[], inputValue: string, trim: boolean = true): string {
        return DatePickerUtil.getDateValueFromInput(dateFormatParts, DateParts.Year, inputValue, trim);
    }

    private static getDateFormatPart(dateFormatParts: any[], type: DateParts): any {
        const result = dateFormatParts.filter((datePart) => (datePart.type === type))[0];
        return result;
    }

    private static isFullInput(value: any, input: string): boolean {
        return (value !== '' && input.length === 2 && input.charAt(1) !== DatePickerUtil.PROMPT_CHAR);
    }

    private static isFullYearInput(dateFormatParts: any[], value: any): boolean {
        switch (DatePickerUtil.getDateFormatPart(dateFormatParts, DateParts.Year).formatType) {
            case FormatDesc.Numeric: {
                return (value !== '' && value.length === 4);
            }
            case FormatDesc.TwoDigits: {
                return (value !== '' && value.length === 2);
            }
            default: {
                return false;
            }
        }
    }

    private static getDatePartOnPosition(dateFormatParts: any[], position: number) {
        const result = dateFormatParts.filter((element) =>
            element.position[0] <= position && position <= element.position[1] && element.type !== DatePickerUtil.SEPARATOR)[0];
        return result;
    }

    private static getFullYearFromString(yearPart, inputValue): number {
        return parseInt(inputValue.substring(yearPart.position[0], yearPart.position[1]), 10);
    }

    private static fillDatePartsPositions(dateArray: any[]): void {
        let currentPos = 0;

        for (const part of dateArray) {
            // Day|Month part positions
            if (part.type === DateParts.Day || part.type === DateParts.Month) {
                // Offset 2 positions for number
                part.position = [currentPos, currentPos + 2];
                currentPos += 2;
            } else if (part.type === DateParts.Year) {
                // Year part positions
                switch (part.formatType) {
                    case FormatDesc.Numeric: {
                        // Offset 4 positions for full year
                        part.position = [currentPos, currentPos + 4];
                        currentPos += 4;
                        break;
                    }
                    case FormatDesc.TwoDigits: {
                        // Offset 2 positions for short year
                        part.position = [currentPos, currentPos + 2];
                        currentPos += 2;
                        break;
                    }
                }
            } else if (part.type === DatePickerUtil.SEPARATOR) {
                // Separator positions
                part.position = [currentPos, currentPos + 1];
                currentPos++;
            }
        }
    }
}

