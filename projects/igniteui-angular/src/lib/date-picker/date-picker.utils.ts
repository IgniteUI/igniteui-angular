import { isIE } from '../core/utils';

/**
 * This enum is used to keep the date validation result.
 *
 *@hidden
 */
export const enum DateState {
    VALID = 'valid',
    INVALID = 'invalid',
}

/**
 *@hidden
 */
const enum FormatDesc {
    NUMERIC = 'numeric',
    TWO_DIGITS = '2-digit'
}

/**
 *@hidden
 */
const enum DateChars {
    YEAR_CHAR = 'y',
    MONTH_CHAR = 'M',
    DAY_CHAR = 'd'
}

/**
 *@hidden
 */
const enum DateParts {
    DAY = 'day',
    MONTH = 'month',
    YEAR = 'year'
}

/**
 *@hidden
 */
export abstract class DatePickerUtil {
    private static readonly SHORT_DATE_MASK = 'MM/dd/yy';
    private static readonly SEPARATOR = 'literal';
    private static readonly NUMBER_OF_MONTHS = 12;
    private static readonly PROMPT_CHAR = '_';
    private static readonly DEFAULT_LOCALE = 'en';

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
            const monthInitPosition = mask.indexOf(DateChars.MONTH_CHAR);
            const dayInitPosition = mask.indexOf(DateChars.DAY_CHAR);
            const yearInitPosition = mask.indexOf(DateChars.YEAR_CHAR);

            if (yearInitPosition !== -1) {
                dateStruct.push({
                    type: DateParts.YEAR,
                    initialPosition: yearInitPosition,
                    formatType: DatePickerUtil.getYearFormatType(mask)
                });
            }

            if (monthInitPosition !== -1) {
                dateStruct.push({
                    type: DateParts.MONTH,
                    initialPosition: monthInitPosition,
                    formatType: DatePickerUtil.getMonthFormatType(mask)
                });
            }

            if (dayInitPosition !== -1) {
                dateStruct.push({
                    type: DateParts.DAY,
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
            } else if (dateStruct[i].type === DateParts.DAY || dateStruct[i].type === DateParts.MONTH) {
                inputMask.push('00');
            } else if (dateStruct[i].type === DateParts.YEAR) {
                switch (dateStruct[i].formatType) {
                    case FormatDesc.NUMERIC: {
                        inputMask.push('0000');
                        break;
                    }
                    case FormatDesc.TWO_DIGITS: {
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
                case FormatDesc.NUMERIC: {
                    if (dateStruct[i].type === DateParts.DAY) {
                        mask.push('d');
                    } else if (dateStruct[i].type === DateParts.MONTH) {
                        mask.push('M');
                    } else {
                        mask.push('yyyy');
                    }
                    break;
                }
                case FormatDesc.TWO_DIGITS: {
                    if (dateStruct[i].type === DateParts.DAY) {
                        mask.push('dd');
                    } else if (dateStruct[i].type === DateParts.MONTH) {
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
        const yearFormat = DatePickerUtil.getDateFormatPart(dateFormatParts, DateParts.YEAR).formatType;
        const day = (dayStr !== '') ? parseInt(dayStr, 10) : 1;
        const month = (monthStr !== '') ? parseInt(monthStr, 10) - 1 : 0;

        let year;
        if (yearStr === '') {
            year = (yearFormat === FormatDesc.TWO_DIGITS) ? '00' : '2000';
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
        const fullYear = (yearFormat === FormatDesc.TWO_DIGITS) ? yearPrefix.concat(year) : year;

        if ((month < 0) || (month > 11) || (month === NaN)) {
            return { state: DateState.INVALID, value: inputValue };
        }

        if ((day < 1) || (day > DatePickerUtil.daysInMonth(fullYear, month + 1)) || (day === NaN)) {
            return { state: DateState.INVALID, value: inputValue };
        }

        return { state: DateState.VALID, date: new Date(fullYear, month, day) };
    }

    public static maskToPromptChars(mask: string): string {
        return mask.replace(/0|L/g, DatePickerUtil.PROMPT_CHAR);
    }

    /**
     * This method replaces prompt chars with empty string.
     * @param value
     */
    public static trimUnderlines(value: string): string {
        return value.replace(/_/g, '');
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
            if (dateFormatParts[i].formatType === FormatDesc.NUMERIC) {
                if ((dateFormatParts[i].type === DateParts.DAY && date.getDate() < 10)
                    || (dateFormatParts[i].type === DateParts.MONTH && date.getMonth() + 1 < 10)) {
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

    private static getYearFormatType(format: string): string {
        switch (format.match(new RegExp(DateChars.YEAR_CHAR, 'g')).length) {
            case 1: {
                // y (2020)
                return FormatDesc.NUMERIC;
            }
            case 4: {
                // yyyy (2020)
                return FormatDesc.NUMERIC;
            }
            case 2: {
                // yy (20)
                return FormatDesc.TWO_DIGITS;
            }
        }
    }

    private static getMonthFormatType(format: string): string {
        switch (format.match(new RegExp(DateChars.MONTH_CHAR, 'g')).length) {
            case 1: {
                // M (8)
                return FormatDesc.NUMERIC;
            }
            case 2: {
                // MM (08)
                return FormatDesc.TWO_DIGITS;
            }
        }
    }

    private static getDayFormatType(format: string): string {
        switch (format.match(new RegExp(DateChars.DAY_CHAR, 'g')).length) {
            case 1: {
                // d (6)
                return FormatDesc.NUMERIC;
            }
            case 2: {
                // dd (06)
                return FormatDesc.TWO_DIGITS;
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
                case DateParts.DAY: {
                    dateStruct[i].formatType = formatterOptions.day;
                    break;
                }
                case DateParts.MONTH: {
                    dateStruct[i].formatType = formatterOptions.month;
                    break;
                }
                case DateParts.YEAR: {
                    dateStruct[i].formatType = formatterOptions.month;
                    break;
                }
            }
        }
        DatePickerUtil.fillDatePartsPositions(dateStruct);
        return dateStruct;
    }

    private static isDateChar(char: string): boolean {
        return (char === DateChars.YEAR_CHAR || char === DateChars.MONTH_CHAR || char === DateChars.DAY_CHAR);
    }

    private static getNumericFormatPrefix(formatType: string): string {
        switch (formatType) {
            case FormatDesc.TWO_DIGITS: {
                return '0';
            }
            case FormatDesc.NUMERIC: {
                return DatePickerUtil.PROMPT_CHAR;
            }
        }
    }

    private static getMinMaxValue(dateFormatParts: any[], datePart, inputValue: string): any {
        let maxValue, minValue;
        switch (datePart.type) {
            case DateParts.MONTH: {
                minValue = 1;
                maxValue = DatePickerUtil.NUMBER_OF_MONTHS;
                break;
            }
            case DateParts.DAY: {
                minValue = 1;
                maxValue = DatePickerUtil.daysInMonth(
                    DatePickerUtil.getFullYearFromString(DatePickerUtil.getDateFormatPart(dateFormatParts, DateParts.YEAR), inputValue),
                    parseInt(DatePickerUtil.getMonthValueFromInput(dateFormatParts, inputValue), 10));
                break;
            }
            case DateParts.YEAR: {
                if (datePart.formatType === FormatDesc.TWO_DIGITS) {
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

    private static daysInMonth(fullYear: number, month: number): number {
        return new Date(fullYear, month, 0).getDate();
    }

    private static getDateValueFromInput(dateFormatParts: any[], type: DateParts, inputValue: string, trim: boolean = true): string {
        const partPosition = DatePickerUtil.getDateFormatPart(dateFormatParts, type).position;
        const result = inputValue.substring(partPosition[0], partPosition[1]);
        return (trim) ? DatePickerUtil.trimUnderlines(result) : result;
    }

    private static getDayValueFromInput(dateFormatParts: any[], inputValue: string, trim: boolean = true): string {
        return DatePickerUtil.getDateValueFromInput(dateFormatParts, DateParts.DAY, inputValue, trim);
    }

    private static getMonthValueFromInput(dateFormatParts: any[], inputValue: string, trim: boolean = true): string {
        return DatePickerUtil.getDateValueFromInput(dateFormatParts, DateParts.MONTH, inputValue, trim);
    }

    private static getYearValueFromInput(dateFormatParts: any[], inputValue: string, trim: boolean = true): string {
        return DatePickerUtil.getDateValueFromInput(dateFormatParts, DateParts.YEAR, inputValue, trim);
    }

    private static getDateFormatPart(dateFormatParts: any[], type: DateParts): any {
        return dateFormatParts.filter((datePart) => (datePart.type === type))[0];
    }

    private static isFullInput(value: any, input: string): boolean {
        return (value !== '' && input.length === 2 && input.charAt(1) !== DatePickerUtil.PROMPT_CHAR);
    }

    private static isFullYearInput(dateFormatParts: any[], value: any): boolean {
        switch (DatePickerUtil.getDateFormatPart(dateFormatParts, DateParts.YEAR).formatType) {
            case FormatDesc.NUMERIC: {
                return (value !== '' && value.length === 4);
            }
            case FormatDesc.TWO_DIGITS: {
                return (value !== '' && value.length === 2);
            }
            default: {
                return false;
            }
        }
    }

    private static getDatePartOnPosition(dateFormatParts: any[], position: number) {
        return dateFormatParts.filter((element) =>
            element.position[0] <= position && position <= element.position[1] && element.type !== DatePickerUtil.SEPARATOR)[0];
    }

    private static getFullYearFromString(yearPart, inputValue): number {
        return parseInt(inputValue.substring(yearPart.position[0], yearPart.position[1]), 10);
    }

    private static fillDatePartsPositions(dateArray: any[]): void {
        let currentPos = 0;

        for (let i = 0; i < dateArray.length; i++) {
            // Day|Month part positions
            if (dateArray[i].type === DateParts.DAY || dateArray[i].type === DateParts.MONTH) {
                // Offset 2 positions for number
                dateArray[i].position = [currentPos, currentPos + 2];
                currentPos += 2;
            } else if (dateArray[i].type === DateParts.YEAR) {
                // Year part positions
                switch (dateArray[i].formatType) {
                    case FormatDesc.NUMERIC: {
                        // Offset 4 positions for full year
                        dateArray[i].position = [currentPos, currentPos + 4];
                        currentPos += 4;
                        break;
                    }
                    case FormatDesc.TWO_DIGITS: {
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


