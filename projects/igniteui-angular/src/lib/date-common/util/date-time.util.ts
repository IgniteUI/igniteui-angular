import { DatePart, DatePartInfo } from '../../directives/date-time-editor/date-time-editor.common';
import { formatDate, FormatWidth, getLocaleDateFormat } from '@angular/common';
import { ValidationErrors } from '@angular/forms';
import { isDate } from '../../core/utils';
import { MaskParsingService } from '../../directives/mask/mask-parsing.service';

/** @hidden */
const enum FormatDesc {
    Numeric = 'numeric',
    TwoDigits = '2-digit'
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
export abstract class DateTimeUtil {
    public static readonly DEFAULT_INPUT_FORMAT = 'MM/dd/yyyy';
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

    /** Parse the mask into date/time and literal parts */
    public static parseDateTimeFormat(mask: string, locale?: string): DatePartInfo[] {
        const format = mask || DateTimeUtil.getDefaultInputFormat(locale);
        const dateTimeParts: DatePartInfo[] = [];
        const formatArray = Array.from(format);
        let currentPart: DatePartInfo = null;
        let position = 0;

        for (let i = 0; i < formatArray.length; i++, position++) {
            const type = DateTimeUtil.determineDatePart(formatArray[i]);
            if (currentPart) {
                if (currentPart.type === type) {
                    currentPart.format += formatArray[i];
                    if (i < formatArray.length - 1) {
                        continue;
                    }
                }

                DateTimeUtil.ensureLeadingZero(currentPart);
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

    /** Builds a date-time editor's default input format based on provided locale settings. */
    public static getDefaultInputFormat(locale: string): string {
        locale = locale || DateTimeUtil.DEFAULT_LOCALE;
        if (!Intl || !Intl.DateTimeFormat || !Intl.DateTimeFormat.prototype.formatToParts) {
            // TODO: fallback with Intl.format for IE?
            return DateTimeUtil.DEFAULT_INPUT_FORMAT;
        }
        const parts = DateTimeUtil.getDefaultLocaleMask(locale);
        parts.forEach(p => {
            if (p.type !== DatePart.Year && p.type !== DateTimeUtil.SEPARATOR) {
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

    /** Spins the AM/PM portion in a date-time editor. */
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
        const errors = {};
        const min = DateTimeUtil.isValidDate(minValue) ? minValue : DateTimeUtil.parseIsoDate(minValue);
        const max = DateTimeUtil.isValidDate(maxValue) ? maxValue : DateTimeUtil.parseIsoDate(maxValue);
        if ((min && value && DateTimeUtil.lessThanMinValue(value, min, includeTime, includeDate))
            || (min && value && DateTimeUtil.lessThanMinValue(value, min, includeTime, includeDate))) {
            Object.assign(errors, { minValue: true });
        }
        if ((max && value && DateTimeUtil.greaterThanMaxValue(value, max, includeTime, includeDate))
            || (max && value && DateTimeUtil.greaterThanMaxValue(value, max, includeTime, includeDate))) {
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
            let [datePart, timePart] = dateNow.split(timeLiteral);
            // transform the provided value to a numeric mask
            // and use the mask parser to update it with the value
            const format = timePart.replace(/\d/g, '0');
            timePart = new MaskParsingService().replaceInMask(timePart, value,
                { format, promptChar: '' }, 0, value.length).value;
            return new Date(`${datePart}T${timePart}`);
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
            case 'S':
                return DatePart.Seconds;
            case 't':
            case 'T':
                return DatePart.AmPm;
            default:
                return DatePart.Literal;
        }
    }

    private static getDefaultLocaleMask(locale: string) {
        const dateStruct = [];
        const formatter = new Intl.DateTimeFormat(locale);
        const formatToParts = formatter.formatToParts(new Date());
        for (const part of formatToParts) {
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
            }
        }
        DateTimeUtil.fillDatePartsPositions(dateStruct);
        return dateStruct;
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
            } else if (part.type === DateTimeUtil.SEPARATOR) {
                // Separator positions
                part.position = [currentPos, currentPos + 1];
                currentPos++;
            }
        }
    }
}
