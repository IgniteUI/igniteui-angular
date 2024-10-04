import { DatePart, DatePartInfo } from '../../directives/date-time-editor/date-time-editor.common';
import { formatDate, FormatWidth, getLocaleDateFormat } from '@angular/common';
import { ValidationErrors } from '@angular/forms';
import { isDate } from '../../core/utils';
import { DataType } from '../../data-operations/data-util';

/** @hidden */
const enum FormatDesc {
    Numeric = 'numeric',
    TwoDigits = '2-digit'
}

const TIME_CHARS = ['h', 'H', 'm', 's', 'S', 't', 'T', 'a'];
const DATE_CHARS = ['d', 'D', 'M', 'y', 'Y'];

/** @hidden */
const enum AmPmValues {
    AM = 'AM',
    A = 'a',
    PM = 'PM',
    P = 'p'
}

/** @hidden */
const enum DateParts {
    Day = 'day',
    Month = 'month',
    Year = 'year',
    Hour = 'hour',
    Minute = 'minute',
    Second = 'second',
    AmPm = 'dayPeriod'
}

/** Maps of the pre-defined date-time format options supported by the Angular DatePipe
 * - predefinedNumericFormats resolve to numeric parts only (and period) for the default 'en' culture
 * - predefinedNonNumericFormats usually contain non-numeric date/time parts, which cannot be
 *   handled for editing by the date/time editors
 *  Ref: https://angular.dev/api/common/DatePipe?tab=usage-notes
 * @hidden
 */
const predefinedNumericFormats = new Map<string, DateParts[]>([
    ['short', [DateParts.Month, DateParts.Day, DateParts.Year, DateParts.Hour, DateParts.Minute]],
    ['shortDate', [DateParts.Month, DateParts.Day, DateParts.Year]],
    ['shortTime', [DateParts.Hour, DateParts.Minute]],
    ['mediumTime', [DateParts.Hour, DateParts.Minute, DateParts.Second]],
]);

const predefinedNonNumericFormats = new Set<string>([
    'medium', 'long', 'full', 'mediumDate', 'longDate', 'fullDate', 'longTime', 'fullTime',
])

/** @hidden */
export abstract class DateTimeUtil {
    public static readonly DEFAULT_INPUT_FORMAT = 'MM/dd/yyyy';
    public static readonly DEFAULT_TIME_INPUT_FORMAT = 'hh:mm tt';
    private static readonly SEPARATOR = 'literal';
    private static readonly DEFAULT_LOCALE = 'en';

    /**
     * Parse a Date value from masked string input based on determined date parts
     *
     * @param inputData masked value to parse
     * @param dateTimeParts Date parts array for the mask
     */
    public static parseValueFromMask(inputData: string, dateTimeParts: DatePartInfo[], promptChar?: string): Date | null {
        const parts: { [key in DatePart]: number } = {} as any;
        dateTimeParts.forEach(dp => {
            let value = parseInt(DateTimeUtil.getCleanVal(inputData, dp, promptChar), 10);
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

        if (parts[DatePart.Date] > DateTimeUtil.daysInMonth(parts[DatePart.Year], parts[DatePart.Month])) {
            return null;
        }

        if (parts[DatePart.Hours] > 23 || parts[DatePart.Minutes] > 59
            || parts[DatePart.Seconds] > 59 || parts[DatePart.FractionalSeconds] > 999) {
            return null;
        }

        const amPm = dateTimeParts.find(p => p.type === DatePart.AmPm);
        if (amPm) {
            parts[DatePart.Hours] %= 12;
        }

        if (amPm) {
            const cleanVal = DateTimeUtil.getCleanVal(inputData, amPm, promptChar);
            if (DateTimeUtil.isPm(cleanVal)) {
                parts[DatePart.Hours] += 12;
            }
        }

        return new Date(
            parts[DatePart.Year] || 2000,
            parts[DatePart.Month] || 0,
            parts[DatePart.Date] || 1,
            parts[DatePart.Hours] || 0,
            parts[DatePart.Minutes] || 0,
            parts[DatePart.Seconds] || 0,
            parts[DatePart.FractionalSeconds] || 0
        );
    }

    /** Parse the mask into date/time and literal parts */
    public static parseDateTimeFormat(mask: string, locale?: string): DatePartInfo[] {
        const format = mask || DateTimeUtil.getDefaultInputFormat(locale);
        const dateTimeParts: DatePartInfo[] = [];
        const formatArray = Array.from(format);
        let currentPart: DatePartInfo = null;
        let position = 0;
        let lastPartAdded = false;
        for (let i = 0; i < formatArray.length; i++, position++) {
            const type = DateTimeUtil.determineDatePart(formatArray[i]);
            if (currentPart) {
                if (currentPart.type === type) {
                    currentPart.format += formatArray[i];
                    if (i < formatArray.length - 1) {
                        continue;
                    }
                }

                if (currentPart.type === DatePart.AmPm && currentPart.format.indexOf('a') !== -1) {
                    currentPart = DateTimeUtil.simplifyAmPmFormat(currentPart);
                }
                DateTimeUtil.addCurrentPart(currentPart, dateTimeParts);
                lastPartAdded = true;
                position = currentPart.end;
                if(i === formatArray.length - 1 && currentPart.type !== type) {
                    lastPartAdded = false;
                }
            }

            currentPart = {
                start: position,
                end: position + formatArray[i].length,
                type,
                format: formatArray[i]
            };
        }

        // make sure the last member of a format like H:m:s is not omitted
        if (!lastPartAdded) {
            if (currentPart.type === DatePart.AmPm) {
                currentPart = DateTimeUtil.simplifyAmPmFormat(currentPart);
            }
            DateTimeUtil.addCurrentPart(currentPart, dateTimeParts);
        }
        // formats like "y" or "yyy" are treated like "yyyy" while editing
        const yearPart = dateTimeParts.filter(p => p.type === DatePart.Year)[0];
        if (yearPart && yearPart.format !== 'yy') {
            yearPart.end += 4 - yearPart.format.length;
            yearPart.format = 'yyyy';
        }

        return dateTimeParts;
    }

    /** Simplifies the AmPm part to as many chars as will be displayed */
    private static simplifyAmPmFormat(currentPart: DatePartInfo){
            currentPart.format = currentPart.format.length === 5 ? 'a' : 'aa';
            currentPart.end = currentPart.start +  currentPart.format.length;
            return { ...currentPart };
    }

    public static getPartValue(value: Date, datePartInfo: DatePartInfo, partLength: number): string {
        let maskedValue;
        const datePart = datePartInfo.type;
        switch (datePart) {
            case DatePart.Date:
                maskedValue = value.getDate();
                break;
            case DatePart.Month:
                // months are zero based
                maskedValue = value.getMonth() + 1;
                break;
            case DatePart.Year:
                if (partLength === 2) {
                    maskedValue = this.prependValue(
                        parseInt(value.getFullYear().toString().slice(-2), 10), partLength, '0');
                } else {
                    maskedValue = value.getFullYear();
                }
                break;
            case DatePart.Hours:
                if (datePartInfo.format.indexOf('h') !== -1) {
                    maskedValue = this.prependValue(
                        this.toTwelveHourFormat(value.getHours().toString()), partLength, '0');
                } else {
                    maskedValue = value.getHours();
                }
                break;
            case DatePart.Minutes:
                maskedValue = value.getMinutes();
                break;
            case DatePart.Seconds:
                maskedValue = value.getSeconds();
                break;
            case DatePart.FractionalSeconds:
                maskedValue = value.getMilliseconds();
                break;
            case DatePart.AmPm:
                maskedValue = DateTimeUtil.getAmPmValue(partLength, value.getHours() < 12);
                break;
        }

        if (datePartInfo.type !== DatePart.AmPm && datePartInfo.type !== DatePart.Literal) {
            return this.prependValue(maskedValue, partLength, '0');
        }

        return maskedValue;
    }

    /** Returns the AmPm part value depending on the part length and a
     * conditional expression indicating whether the value is AM or PM.
     */
    public static getAmPmValue(partLength: number, isAm: boolean) {
        if (isAm) {
            return partLength === 1 ? AmPmValues.A : AmPmValues.AM;
        } else {
            return partLength === 1 ? AmPmValues.P : AmPmValues.PM;
        }
    }

    /** Returns true if a string value indicates an AM period */
    public static isAm(value: string) {
        value = value.toLowerCase();
        return (value === AmPmValues.AM.toLowerCase() || value === AmPmValues.A.toLowerCase());
    }

    /** Returns true if a string value indicates a PM period */
    public static isPm(value: string) {
        value = value.toLowerCase();
        return (value === AmPmValues.PM.toLowerCase() || value === AmPmValues.P.toLowerCase());
    }

    /** Builds a date-time editor's default input format based on provided locale settings and data type. */
    public static getDefaultInputFormat(locale: string, dataType: DataType = DataType.Date): string {
        locale = locale || DateTimeUtil.DEFAULT_LOCALE;
        if (!Intl || !Intl.DateTimeFormat || !Intl.DateTimeFormat.prototype.formatToParts) {
            // TODO: fallback with Intl.format for IE?
            return DateTimeUtil.DEFAULT_INPUT_FORMAT;
        }
        const parts = DateTimeUtil.getDefaultLocaleMask(locale, dataType);
        parts.forEach(p => {
            if (p.type !== DatePart.Year && p.type !== DateTimeUtil.SEPARATOR && p.type !== DatePart.AmPm) {
                p.formatType = FormatDesc.TwoDigits;
            }
        });

        return DateTimeUtil.getMask(parts);
    }

    /** Tries to format a date using Angular's DatePipe. Fallbacks to `Intl` if no locale settings have been loaded. */
    public static formatDate(value: number | Date, format: string, locale: string, timezone?: string): string {
        let formattedDate: string;
        try {
            formattedDate = formatDate(value, format, locale, timezone);
        } catch {
            DateTimeUtil.logMissingLocaleSettings(locale);
            const formatter = new Intl.DateTimeFormat(locale);
            formattedDate = formatter.format(value);
        }

        return formattedDate;
    }

    /**
     * Returns the date format based on a provided locale.
     * Supports Angular's DatePipe format options such as `shortDate`, `longDate`.
     */
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
            DateTimeUtil.logMissingLocaleSettings(locale);
            format = DateTimeUtil.getDefaultInputFormat(locale);
        }

        return format;
    }

    /** Determines if a given character is `d/M/y` or `h/m/s`. */
    public static isDateOrTimeChar(char: string): boolean {
        return DATE_CHARS.indexOf(char) !== -1 || TIME_CHARS.indexOf(char) !== -1;
    }

    /** Spins the date portion in a date-time editor. */
    public static spinDate(delta: number, newDate: Date, spinLoop: boolean): void {
        const maxDate = DateTimeUtil.daysInMonth(newDate.getFullYear(), newDate.getMonth());
        let date = newDate.getDate() + delta;
        if (date > maxDate) {
            date = spinLoop ? date % maxDate : maxDate;
        } else if (date < 1) {
            date = spinLoop ? maxDate + (date % maxDate) : 1;
        }

        newDate.setDate(date);
    }

    /** Spins the month portion in a date-time editor. */
    public static spinMonth(delta: number, newDate: Date, spinLoop: boolean): void {
        const maxDate = DateTimeUtil.daysInMonth(newDate.getFullYear(), newDate.getMonth() + delta);
        if (newDate.getDate() > maxDate) {
            newDate.setDate(maxDate);
        }

        const maxMonth = 11;
        const minMonth = 0;
        let month = newDate.getMonth() + delta;
        if (month > maxMonth) {
            month = spinLoop ? (month % maxMonth) - 1 : maxMonth;
        } else if (month < minMonth) {
            month = spinLoop ? maxMonth + (month % maxMonth) + 1 : minMonth;
        }

        newDate.setMonth(month);
    }

    /** Spins the year portion in a date-time editor. */
    public static spinYear(delta: number, newDate: Date): void {
        const maxDate = DateTimeUtil.daysInMonth(newDate.getFullYear() + delta, newDate.getMonth());
        if (newDate.getDate() > maxDate) {
            // clip to max to avoid leap year change shifting the entire value
            newDate.setDate(maxDate);
        }
        newDate.setFullYear(newDate.getFullYear() + delta);
    }

    /** Spins the hours portion in a date-time editor. */
    public static spinHours(delta: number, newDate: Date, spinLoop: boolean): void {
        const maxHour = 23;
        const minHour = 0;
        let hours = newDate.getHours() + delta;
        if (hours > maxHour) {
            hours = spinLoop ? hours % maxHour - 1 : maxHour;
        } else if (hours < minHour) {
            hours = spinLoop ? maxHour + (hours % maxHour) + 1 : minHour;
        }

        newDate.setHours(hours);
    }

    /** Spins the minutes portion in a date-time editor. */
    public static spinMinutes(delta: number, newDate: Date, spinLoop: boolean): void {
        const maxMinutes = 59;
        const minMinutes = 0;
        let minutes = newDate.getMinutes() + delta;
        if (minutes > maxMinutes) {
            minutes = spinLoop ? minutes % maxMinutes - 1 : maxMinutes;
        } else if (minutes < minMinutes) {
            minutes = spinLoop ? maxMinutes + (minutes % maxMinutes) + 1 : minMinutes;
        }

        newDate.setMinutes(minutes);
    }

    /** Spins the seconds portion in a date-time editor. */
    public static spinSeconds(delta: number, newDate: Date, spinLoop: boolean): void {
        const maxSeconds = 59;
        const minSeconds = 0;
        let seconds = newDate.getSeconds() + delta;
        if (seconds > maxSeconds) {
            seconds = spinLoop ? seconds % maxSeconds - 1 : maxSeconds;
        } else if (seconds < minSeconds) {
            seconds = spinLoop ? maxSeconds + (seconds % maxSeconds) + 1 : minSeconds;
        }

        newDate.setSeconds(seconds);
    }

     /** Spins the fractional seconds (milliseconds) portion in a date-time editor. */
    public static spinFractionalSeconds(delta: number, newDate: Date, spinLoop: boolean) {
        const maxMs = 999;
        const minMs = 0;
        let ms = newDate.getMilliseconds() + delta;
        if (ms > maxMs) {
            ms = spinLoop ? ms % maxMs - 1 : maxMs;
        } else if (ms < minMs) {
            ms = spinLoop ? maxMs + (ms % maxMs) + 1 : minMs;
        }

        newDate.setMilliseconds(ms);
    }

    /** Spins the AM/PM portion in a date-time editor. */
    public static spinAmPm(newDate: Date, currentDate: Date, amPmFromMask: string): Date {
        if(DateTimeUtil.isAm(amPmFromMask)) {
            newDate = new Date(newDate.setHours(newDate.getHours() + 12));
        } else if(DateTimeUtil.isPm(amPmFromMask)) {
            newDate = new Date(newDate.setHours(newDate.getHours() - 12));
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
    public static validateMinMax(value: Date, minValue: Date | string, maxValue: Date | string,
        includeTime = true, includeDate = true): ValidationErrors {
        if (!value) {
            return null;
        }
        const errors = {};
        const min = DateTimeUtil.isValidDate(minValue) ? minValue : DateTimeUtil.parseIsoDate(minValue);
        const max = DateTimeUtil.isValidDate(maxValue) ? maxValue : DateTimeUtil.parseIsoDate(maxValue);
        if (min && value && DateTimeUtil.lessThanMinValue(value, min, includeTime, includeDate)) {
            Object.assign(errors, { minValue: true });
        }
        if (max && value && DateTimeUtil.greaterThanMaxValue(value, max, includeTime, includeDate)) {
            Object.assign(errors, { maxValue: true });
        }

        return errors;
    }

    /** Parse an ISO string to a Date */
    public static parseIsoDate(value: string): Date | null {
        let regex = /^\d{4}/g;
        const timeLiteral = 'T';
        if (regex.test(value)) {
            return new Date(value + `${value.indexOf(timeLiteral) === -1 ? 'T00:00:00' : ''}`);
        }

        regex = /^\d{2}/g;
        if (regex.test(value)) {
            const dateNow = new Date().toISOString();
            // eslint-disable-next-line prefer-const
            let [datePart, _timePart] = dateNow.split(timeLiteral);
            return new Date(`${datePart}T${value}`);
        }

        return null;
    }

    /**
     * Returns whether the input is valid date
     *
     * @param value input to check
     * @returns true if provided input is a valid date
     */
    public static isValidDate(value: any): value is Date {
        if (isDate(value)) {
            return !isNaN(value.getTime());
        }

        return false;
    }

    public static isFormatNumeric(locale: string, inputFormat: string): boolean {
        const dateParts = DateTimeUtil.parseDateTimeFormat(inputFormat);
        if (predefinedNonNumericFormats.has(inputFormat) || dateParts.every(p => p.type === DatePart.Literal)) {
            return false;
        }
        for (let i = 0; i < dateParts.length; i++) {
            if (dateParts[i].type === DatePart.AmPm || dateParts[i].type === DatePart.Literal) {
                continue;
            }
            const transformedValue = formatDate(new Date(), dateParts[i].format, locale);
            // check if the transformed date/time part contains any kind of letter from any language
            if (/\p{L}+/gu.test(transformedValue)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns an input format that can be used by the date-time editors, as
     * - if the format is already numeric, return it as is
     * - if it is among the predefined numeric ones, return it as the equivalent locale-based format
     *   for the corresponding numeric date parts
     * - otherwise, return an empty string
     */
    public static getNumericInputFormat(locale: string, format: string): string {
        let resultFormat = '';
        if (!format) {
            return resultFormat;
        }
        if (predefinedNumericFormats.has(format)) {
            resultFormat = DateTimeUtil.getLocaleInputFormatFromParts(locale, predefinedNumericFormats.get(format));

        } else if (DateTimeUtil.isFormatNumeric(locale, format)) {
            resultFormat = format;
        }
        return resultFormat;
    }

    /** Gets the locale-based format from an array of date parts */
    private static getLocaleInputFormatFromParts(locale: string, dateParts: DateParts[]): string {
        const options = {};
        dateParts.forEach(p => {
            if (p === DateParts.Year) {
                options[p] = FormatDesc.Numeric;
            } else if (p !== DateParts.AmPm) {
                options[p] = FormatDesc.TwoDigits;
            }
        });
        const formatter = new Intl.DateTimeFormat(locale, options);
        const dateStruct = DateTimeUtil.getDateStructFromParts(formatter.formatToParts(new Date()), formatter);
        DateTimeUtil.fillDatePartsPositions(dateStruct);
        return DateTimeUtil.getMask(dateStruct);
    }

    private static addCurrentPart(currentPart: DatePartInfo, dateTimeParts: DatePartInfo[]): void {
        DateTimeUtil.ensureLeadingZero(currentPart);
        currentPart.end = currentPart.start + currentPart.format.length;
        dateTimeParts.push(currentPart);
    }

    private static daysInMonth(fullYear: number, month: number): number {
        return new Date(fullYear, month + 1, 0).getDate();
    }

    private static trimEmptyPlaceholders(value: string, promptChar?: string): string {
        const result = value.replace(new RegExp(promptChar || '_', 'g'), '');
        return result;
    }

    private static getMask(dateStruct: any[]): string {
        const mask = [];
        for (const part of dateStruct) {
            if (part.formatType === FormatDesc.Numeric) {
                switch (part.type) {
                    case DateParts.Day:
                        mask.push('d');
                        break;
                    case DateParts.Month:
                        mask.push('M');
                        break;
                    case DateParts.Year:
                        mask.push('yyyy');
                        break;
                    case DateParts.Hour:
                        mask.push(part.hour12 ? 'h' : 'H');
                        break;
                    case DateParts.Minute:
                        mask.push('m');
                        break;
                    case DateParts.Second:
                        mask.push('s');
                        break;
                }
            } else if (part.formatType === FormatDesc.TwoDigits) {
                switch (part.type) {
                    case DateParts.Day:
                        mask.push('dd');
                        break;
                    case DateParts.Month:
                        mask.push('MM');
                        break;
                    case DateParts.Year:
                        mask.push('yy');
                        break;
                    case DateParts.Hour:
                        mask.push(part.hour12 ? 'hh' : 'HH');
                        break;
                    case DateParts.Minute:
                        mask.push('mm');
                        break;
                    case DateParts.Second:
                        mask.push('ss');
                        break;
                }
            }

            if (part.type === DateParts.AmPm) {
                mask.push('tt');
            }

            if (part.type === DateTimeUtil.SEPARATOR) {
                mask.push(part.value);
            }
        }

        return mask.join('');
    }

    private static logMissingLocaleSettings(locale: string): void {
        console.warn(`Missing locale data for the locale ${locale}. Please refer to https://angular.io/guide/i18n#i18n-pipes`);
        console.warn('Using default browser locale settings.');
    }

    private static prependValue(value: number, partLength: number, prependChar: string): string {
        return (prependChar + value.toString()).slice(-partLength);
    }

    private static toTwelveHourFormat(value: string, promptChar = '_'): number {
        let hour = parseInt(value.replace(new RegExp(promptChar, 'g'), '0'), 10);
        if (hour > 12) {
            hour -= 12;
        } else if (hour === 0) {
            hour = 12;
        }

        return hour;
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
            case DatePart.FractionalSeconds:
                part.format = part.format[0].repeat(3);
                break;
        }
    }

    private static getCleanVal(inputData: string, datePart: DatePartInfo, promptChar?: string): string {
        return DateTimeUtil.trimEmptyPlaceholders(inputData.substring(datePart.start, datePart.end), promptChar);
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
                return DatePart.Seconds;
            case 'S':
                return DatePart.FractionalSeconds;
            case 'a':
            case 't':
            case 'T':
                return DatePart.AmPm;
            default:
                return DatePart.Literal;
        }
    }

    private static getFormatOptions(dataType: DataType) {
        const dateOptions = {
            day: FormatDesc.TwoDigits,
            month: FormatDesc.TwoDigits,
            year: FormatDesc.Numeric
        };
        const timeOptions = {
            hour: FormatDesc.TwoDigits,
            minute: FormatDesc.TwoDigits
        };
        switch (dataType) {
            case DataType.Date:
                return dateOptions;
            case DataType.Time:
                return timeOptions;
            case DataType.DateTime:
                return {
                    ...dateOptions,
                    ...timeOptions,
                    second: FormatDesc.TwoDigits
                };
            default:
                return { };
        }
    }

    private static getDefaultLocaleMask(locale: string, dataType: DataType = DataType.Date) {
        const options = DateTimeUtil.getFormatOptions(dataType);
        const formatter = new Intl.DateTimeFormat(locale, options);
        const formatToParts = formatter.formatToParts(new Date());
        const dateStruct = DateTimeUtil.getDateStructFromParts(formatToParts, formatter);
        DateTimeUtil.fillDatePartsPositions(dateStruct);
        return dateStruct;
    }

    private static getDateStructFromParts(parts: Intl.DateTimeFormatPart[], formatter: Intl.DateTimeFormat): any[] {
        const dateStruct = [];
        for (const part of parts) {
            if (part.type === DateTimeUtil.SEPARATOR) {
                dateStruct.push({
                    type: DateTimeUtil.SEPARATOR,
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
                case DateParts.Hour: {
                    part.formatType = formatterOptions.hour;
                    if (formatterOptions.hour12) {
                        part.hour12 = true;
                    }
                    break;
                }
                case DateParts.Minute: {
                    part.formatType = formatterOptions.minute;
                    break;
                }
                case DateParts.Second: {
                    part.formatType = formatterOptions.second;
                    break;
                }
                case DateParts.AmPm: {
                    part.formatType = formatterOptions.dayPeriod;
                    break;
                }
            }
        }
        return dateStruct;
    }

    private static fillDatePartsPositions(dateArray: any[]): void {
        let currentPos = 0;

        for (const part of dateArray) {
            // Day|Month|Hour|Minute|Second|AmPm part positions
            if (part.type === DateParts.Day || part.type === DateParts.Month ||
                part.type === DateParts.Hour || part.type === DateParts.Minute || part.type === DateParts.Second ||
                part.type === DateParts.AmPm
            ) {
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
            } else if (part.type === DateTimeUtil.SEPARATOR) {
                // Separator positions
                part.position = [currentPos, currentPos + 1];
                currentPos++;
            }
        }
    }
}
