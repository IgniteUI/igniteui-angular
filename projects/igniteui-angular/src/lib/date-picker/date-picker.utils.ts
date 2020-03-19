import { isIE } from '../core/utils';
import { DatePart, DatePartInfo } from '../directives/date-time-editor/date-time-editor.common';

/**
 * This enum is used to keep the date validation result.
 *
 *@hidden
 */
export const enum DateState {
    Valid = 'valid',
    Invalid = 'invalid',
}

/**
 *@hidden
 */
const enum FormatDesc {
    Numeric = 'numeric',
    TwoDigits = '2-digit'
}

export interface DateTimeValue {
    state: DateState;
    value: Date;
}

/**
 *@hidden
 */
const enum DateChars {
    YearChar = 'y',
    MonthChar = 'M',
    DayChar = 'd'
}

const TimeCharsArr = ['h', 'H', 'm', 's', 'S', 't', 'T'];
const DateCharsArr = ['d', 'D', 'M', 'y', 'Y'];

/**
 *@hidden
 */
const enum DateParts {
    Day = 'day',
    Month = 'month',
    Year = 'year'
}

/**
 * @hidden
 */
export abstract class DatePickerUtil {
    private static readonly SHORT_DATE_MASK = 'MM/dd/yy';
    private static readonly SEPARATOR = 'literal';
    private static readonly NUMBER_OF_MONTHS = 12;
    private static readonly PROMPT_CHAR = '_';
    private static readonly DEFAULT_LOCALE = 'en';

    public static parseDateTimeArray(dateTimeParts: DatePartInfo[], inputData: string): DateTimeValue {
        const parts: { [key in DatePart]: number } = {} as any;
        dateTimeParts.forEach(dp => {
            let value = parseInt(this.getCleanVal(inputData, dp), 10);
            if (!value) {
                value = dp.type === DatePart.Date || dp.type === DatePart.Month ? 1 : 0;
            }
            parts[dp.type] = value;
        });

        if (parts[DatePart.Month] < 1 || 12 < parts[DatePart.Month]) {
            return { state: DateState.Invalid, value: new Date(NaN) };
        }

        // TODO: Century threshold
        if (parts[DatePart.Year] < 50) {
            parts[DatePart.Year] += 2000;
        }

        if (parts[DatePart.Date] > DatePickerUtil.daysInMonth(parts[DatePart.Year], parts[DatePart.Month])) {
            return { state: DateState.Invalid, value: new Date(NaN) };
        }

        if (parts[DatePart.Hours] > 23 || parts[DatePart.Minutes] > 59 || parts[DatePart.Seconds] > 59) {
            return { state: DateState.Invalid, value: new Date(NaN) };
        }

        return {
            state: DateState.Valid,
            value: new Date(
                parts[DatePart.Year] || 2000,
                parts[DatePart.Month] - 1 || 0,
                parts[DatePart.Date] || 1,
                parts[DatePart.Hours] || 0,
                parts[DatePart.Minutes] || 0,
                parts[DatePart.Seconds] || 0
            )
        };
    }

    public static parseDateTimeFormat(mask: string, locale: string = DatePickerUtil.DEFAULT_LOCALE): DatePartInfo[] {
        let format = DatePickerUtil.setInputFormat(mask);
        let dateTimeData: DatePartInfo[] = [];
        if (!format && !isIE()) {
            dateTimeData = DatePickerUtil.getDefaultLocaleMask(locale);
        } else {
            format = (format) ? format : DatePickerUtil.SHORT_DATE_MASK;
            const formatArray = Array.from(format);
            for (let i = 0; i < formatArray.length; i++) {
                const datePartRange = this.getDatePartInfoRange(formatArray[i], format, i);
                const dateTimeInfo = {
                    type: DatePickerUtil.determineDatePart(formatArray[i]),
                    start: datePartRange.start,
                    end: datePartRange.end,
                    format: mask.match(new RegExp(`${format[i]}+`, 'g'))[0],
                };
                while (DatePickerUtil.isDateOrTimeChar(formatArray[i])) {
                    if (dateTimeData.indexOf(dateTimeInfo) === -1) {
                        dateTimeData.push(dateTimeInfo);
                    }
                    i++;
                }
            }
        }

        return dateTimeData;
    }

    public static setInputFormat(format: string): string {
        if (!format) { return ''; }
        let chars = '';
        let newFormat = '';
        for (let i = 0; ; i++) {
            while (DatePickerUtil.isDateOrTimeChar(format[i])) {
                chars += format[i];
                i++;
            }
            const datePartType = DatePickerUtil.determineDatePart(chars[0]);
            if (datePartType !== DatePart.Year) {
                newFormat += chars[0].repeat(2);
            } else {
                newFormat += chars;
            }

            if (i >= format.length) { break; }

            if (!DatePickerUtil.isDateOrTimeChar(format[i])) {
                newFormat += format[i];
            }
            chars = '';
        }

        return newFormat;
    }

    public static isDateOrTimeChar(char: string): boolean {
        return TimeCharsArr.indexOf(char) !== -1 || DateCharsArr.indexOf(char) !== -1;
    }

    public static calculateDateOnSpin(delta: number, newDate: Date, currentDate: Date, isSpinLoop: boolean): Date {
        if (isSpinLoop) {
            const maxDate = DatePickerUtil.daysInMonth(currentDate.getFullYear(), currentDate.getMonth() + 1);
            const deltaSign = delta > 1 ? delta % (Math.abs(delta) - 1) : delta;
            let date = currentDate.getDate();
            for (let i = Math.abs(delta); i > 0; i--) {
                if (deltaSign > 0) {
                    date = date < maxDate ? date + deltaSign : 1;
                } else {
                    date = date > 1 ? date + deltaSign : maxDate;
                }
            }

            return new Date(currentDate.setDate(date));
        }
        newDate = new Date(newDate.setDate(newDate.getDate() + delta));
        if (currentDate.getMonth() === newDate.getMonth()) {
            return newDate;
        }

        return currentDate;
    }

    public static calculateMonthOnSpin(delta: number, newDate: Date, currentDate: Date, isSpinLoop: boolean): Date {
        const maxDate = DatePickerUtil.daysInMonth(currentDate.getFullYear(), currentDate.getMonth() + 1 + delta);
        if (newDate.getDate() > maxDate) {
            newDate.setDate(maxDate);
        }
        if (isSpinLoop) {
            const deltaSign = delta > 1 ? delta % (Math.abs(delta) - 1) : delta;
            let month = currentDate.getMonth();
            for (let i = Math.abs(delta); i > 0; i--) {
                if (deltaSign > 0) {
                    month = month < 11 ? month + deltaSign : 0;
                } else {
                    month = month > 0 ? month + deltaSign : 11;
                }
            }

            return new Date(newDate.setMonth(month));
        }
        newDate = new Date(newDate.setMonth(newDate.getMonth() + delta));
        if (currentDate.getFullYear() === newDate.getFullYear()) {
            return newDate;
        }

        return currentDate;
    }

    public static calculateYearOnSpin(delta: number, newDate: Date, currentDate: Date): Date {
        const maxDate = DatePickerUtil.daysInMonth(currentDate.getFullYear() + delta, currentDate.getMonth() + 1);
        if (newDate.getDate() > maxDate) {
            newDate.setDate(maxDate);
        }
        return new Date(newDate.setFullYear(newDate.getFullYear() + delta));
    }

    public static calculateHoursOnSpin(delta: number, newDate: Date, currentDate: Date, isSpinLoop: boolean): Date {
        if (isSpinLoop) {
            const deltaSign = delta > 1 ? delta % (Math.abs(delta) - 1) : delta;
            let hours = currentDate.getHours();
            for (let i = Math.abs(delta); i > 0; i--) {
                if (deltaSign > 0) {
                    hours = hours < 23 ? hours + deltaSign : 0;
                } else {
                    hours = hours > 0 ? hours + deltaSign : 23;
                }
            }

            return new Date(currentDate.setHours(hours));
        }
        newDate = new Date(newDate.setHours(newDate.getHours() + delta));
        if (currentDate.getDate() === newDate.getDate()) {
            return newDate;
        }

        return currentDate;
    }

    public static calculateMinutesOnSpin(delta: number, newDate: Date, currentDate: Date, isSpinLoop: boolean): Date {
        if (isSpinLoop) {
            const deltaSign = delta > 1 ? delta % (Math.abs(delta) - 1) : delta;
            let minutes = currentDate.getMinutes();
            for (let i = Math.abs(delta); i > 0; i--) {
                if (deltaSign > 0) {
                    minutes = minutes < 59 ? minutes + deltaSign : 0;
                } else {
                    minutes = minutes > 0 ? minutes + deltaSign : 59;
                }
            }

            return new Date(currentDate.setMinutes(minutes));
        }
        newDate = new Date(newDate.setMinutes(newDate.getMinutes() + delta));
        if (currentDate.getHours() === newDate.getHours()) {
            return newDate;
        }

        return currentDate;
    }

    public static calculateSecondsOnSpin(delta: number, newDate: Date, currentDate: Date, isSpinLoop: boolean): Date {
        if (isSpinLoop) {
            const deltaSign = delta > 1 ? delta % (Math.abs(delta) - 1) : delta;
            let seconds = currentDate.getSeconds();
            for (let i = Math.abs(delta); i > 0; i--) {
                if (deltaSign > 0) {
                    seconds = seconds < 59 ? seconds + deltaSign : 0;
                } else {
                    seconds = seconds > 0 ? seconds + deltaSign : 59;
                }
            }

            return new Date(currentDate.setSeconds(seconds));
        }
        newDate = new Date(newDate.setSeconds(newDate.getSeconds() + delta));
        if (currentDate.getMinutes() === newDate.getMinutes()) {
            return newDate;
        }

        return currentDate;
    }

    public static calculateAmPmOnSpin(newDate: Date, currentDate: Date, amPmFromMask: string) {
        switch (amPmFromMask) {
            case 'AM':
                newDate = new Date(newDate.setHours(newDate.getHours() + 12 * 1));
                break;
            case 'PM':
                newDate = new Date(newDate.setHours(newDate.getHours() + 12 * -1));
                break;
        }
        if (newDate.getDate() !== currentDate.getDate()) {
            return currentDate;
        }

        return newDate;
    }

    private static getCleanVal(inputData: string, datePart: DatePartInfo): string {
        return DatePickerUtil.trimUnderlines(inputData.substring(datePart.start, datePart.end));
    }

    private static getDatePartInfoRange(datePartChars: string, mask: string, index: number): any {
        const start = mask.indexOf(datePartChars, index);
        let end = start;
        while (this.isDateOrTimeChar(mask[end])) {
            end++;
        }

        return { start, end };
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
        }
    }

    /**
     * This method generates date parts structure based on editor mask and locale.
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
     * @param dateStruct array
     * @returns input mask
     */
    public static getInputMask(dateStruct: any[]): string {
        const inputMask = [];
        for (let i = 0; i < dateStruct.length; i++) {
            if (dateStruct[i].type === DatePickerUtil.SEPARATOR) {
                inputMask.push(dateStruct[i].value);
            } else if (dateStruct[i].type === DateParts.Day || dateStruct[i].type === DateParts.Month) {
                inputMask.push('00');
            } else if (dateStruct[i].type === DateParts.Year) {
                switch (dateStruct[i].formatType) {
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
     * @param dateStruct
     * @returns editor mask
     */
    public static getMask(dateStruct: any[]): string {
        const mask = [];
        for (let i = 0; i < dateStruct.length; i++) {
            switch (dateStruct[i].formatType) {
                case FormatDesc.Numeric: {
                    if (dateStruct[i].type === DateParts.Day) {
                        mask.push('d');
                    } else if (dateStruct[i].type === DateParts.Month) {
                        mask.push('M');
                    } else {
                        mask.push('yyyy');
                    }
                    break;
                }
                case FormatDesc.TwoDigits: {
                    if (dateStruct[i].type === DateParts.Day) {
                        mask.push('dd');
                    } else if (dateStruct[i].type === DateParts.Month) {
                        mask.push('MM');
                    } else {
                        mask.push('yy');
                    }
                }
            }

            if (dateStruct[i].type === DatePickerUtil.SEPARATOR) {
                mask.push(dateStruct[i].value);
            }
        }

        return mask.join('');
    }
    /**
  * This method parses an input string base on date parts and returns a date and its validation state.
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

        if ((month < 0) || (month > 11) || (month === NaN)) {
            return { state: DateState.Invalid, value: inputValue };
        }

        if ((day < 1) || (day > DatePickerUtil.daysInMonth(fullYear, month + 1)) || (day === NaN)) {
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
     * @param value
     */
    public static trimUnderlines(value: string): string {
        const result = value.replace(/_/g, '');
        return result;
    }

    /**
     * This method is used for spinning date parts.
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

        let maxValue, minValue;
        const minMax = DatePickerUtil.getMinMaxValue(dateFormatParts, datePart, inputValue);
        minValue = minMax.min;
        maxValue = minMax.max;

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

        const prefix = DatePickerUtil.getNumericFormatPrefix(datePartFormatType);
        changedPart = (newValue < 10) ? `${prefix}${newValue}` : `${newValue}`;

        return `${start}${changedPart}${end}`;
    }

    /**
     * This method returns date input with prompt chars.
     * @param dateFormatParts
     * @param date
     * @param inputValue
     * @returns date input including prompt chars
     */
    public static addPromptCharsEditMode(dateFormatParts: any[], date: Date, inputValue: string): string {
        const dateArray = Array.from(inputValue);
        for (let i = 0; i < dateFormatParts.length; i++) {
            if (dateFormatParts[i].formatType === FormatDesc.Numeric) {
                if ((dateFormatParts[i].type === DateParts.Day && date.getDate() < 10)
                    || (dateFormatParts[i].type === DateParts.Month && date.getMonth() + 1 < 10)) {
                    dateArray.splice(dateFormatParts[i].position[0], 0, DatePickerUtil.PROMPT_CHAR);
                    dateArray.join('');
                }
            }
        }
        return dateArray.join('');
    }

    /**
     * This method checks if date input is done.
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
        return new Date(fullYear, month, 0).getDate();
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
        for (let i = 0; i < formatToParts.length; i++) {
            if (formatToParts[i].type === DatePickerUtil.SEPARATOR) {
                dateStruct.push({
                    type: DatePickerUtil.SEPARATOR,
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
                case DateParts.Day: {
                    dateStruct[i].formatType = formatterOptions.day;
                    break;
                }
                case DateParts.Month: {
                    dateStruct[i].formatType = formatterOptions.month;
                    break;
                }
                case DateParts.Year: {
                    dateStruct[i].formatType = formatterOptions.month;
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
        let maxValue, minValue;
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
        return (trim) ? DatePickerUtil.trimUnderlines(result) : result;
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

        for (let i = 0; i < dateArray.length; i++) {
            // Day|Month part positions
            if (dateArray[i].type === DateParts.Day || dateArray[i].type === DateParts.Month) {
                // Offset 2 positions for number
                dateArray[i].position = [currentPos, currentPos + 2];
                currentPos += 2;
            } else if (dateArray[i].type === DateParts.Year) {
                // Year part positions
                switch (dateArray[i].formatType) {
                    case FormatDesc.Numeric: {
                        // Offset 4 positions for full year
                        dateArray[i].position = [currentPos, currentPos + 4];
                        currentPos += 4;
                        break;
                    }
                    case FormatDesc.TwoDigits: {
                        // Offset 2 positions for short year
                        dateArray[i].position = [currentPos, currentPos + 2];
                        currentPos += 2;
                        break;
                    }
                }
            } else if (dateArray[i].type === DatePickerUtil.SEPARATOR) {
                // Separator positions
                dateArray[i].position = [currentPos, currentPos + 1];
                currentPos++;
            }
        }
    }
}


