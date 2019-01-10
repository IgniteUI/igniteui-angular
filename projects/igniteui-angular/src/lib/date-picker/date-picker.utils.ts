export enum PREDEFINED_FORMAT_OPTIONS {
    SHORT_DATE = 'shortDate',
    MEDIUM_DATE = 'mediumDate',
    LONG_DATE = 'longDate',
    FULL_DATE = 'fullDate'
}

export enum PREDEFINED_FORMATS {
    SHORT_DATE_FORMAT = 'M/d/yy',
    MEDIUM_DATE_FORMAT = 'MMM d, y',
    LONG_DATE_FORMAT = 'MMMM d, y',
    FULL_DATE_FORMAT = 'EEEE, MMMM d, y'
}

export enum PREDEFINED_MASKS {
    SHORT_DATE_MASK = '00/00/00',
    MEDIUM_DATE_MASK = 'LLL 00, 0000',
    LONG_DATE_MASK = 'LLLLLLLLL 00, 0000', // longest month - sep - 9 chars
    FULL_DATE_MASK = 'LLLLLLLLL, LLLLLLLLL 00, 0000' // longest month - sep - 9 characters, longest week day - wed - 9 chars
}

export enum FORMAT_DESC {
    NUMERIC = 'numeric',
    TWO_DIGITS = 'twoDigits',
    SHORT = 'short',
    LONG = 'long',
    NARROW = 'narrow'
}

export enum DATE_CHARS {
    YEAR_CHAR = 'y',
    MONTH_CHAR = 'M',
    DAY_CHAR = 'd',
    WEEKDAY_CHAR = 'E'
}

export enum DATE_PARTS {
    DAY = 'day',
    MONTH = 'month',
    YEAR = 'year',
    WEEKDAY = 'weekday'
}

export class DatePickerUtil {
    public static MAX_MONTH_SYMBOLS = 9;
    public static MAX_WEEKDAY_SYMBOLS = 9;
    public static SEPARATOR = 'separator';

    public static getYearFormatType(format: string): string {
        let type;
        const occurences = format.match(new RegExp(DATE_CHARS.YEAR_CHAR, 'g')).length;

        switch (occurences) {
            case 1: {
                // y (2020)
                type = FORMAT_DESC.NUMERIC;
                break;
            }
            case 4: {
                // yyyy (2020)
                type = FORMAT_DESC.NUMERIC;
                break;
            }
            case 2: {
                // yy (20)
                type = FORMAT_DESC.TWO_DIGITS;
                break;
            }
        }

        return type;
    }
    public static getMonthFormatType(format: string): string {
        let type;
        const occurences = format.match(new RegExp(DATE_CHARS.MONTH_CHAR, 'g')).length;

        switch (occurences) {
            case 1: {
                // M
                type = FORMAT_DESC.NUMERIC;
                break;
            }
            case 2: {
                // MM
                type = FORMAT_DESC.TWO_DIGITS;
                break;
            }
            case 3: {
                // MMM
                type = FORMAT_DESC.SHORT;
                break;
            }
            case 4: {
                // MMMM
                type = FORMAT_DESC.LONG;
                break;
            }
            case 5: {
                // MMMMM
                type = FORMAT_DESC.NARROW;
                break;
            }
        }

        return type;
    }
    public static getDayFormatType(format: string): string {
        let type;
        const occurences = format.match(new RegExp(DATE_CHARS.DAY_CHAR, 'g')).length;

        switch (occurences) {
            case 1: {
                // d
                type = FORMAT_DESC.NUMERIC;
                break;
            }
            case 2: {
                // dd
                type = FORMAT_DESC.TWO_DIGITS;
                break;
            }
        }

        return type;
    }
    public static getWeekDayFormatType(format: string): string {
        let type;
        const occurences = format.match(new RegExp(DATE_CHARS.WEEKDAY_CHAR, 'g')).length;

        switch (occurences) {
            case 3: {
                // EEE (Tue)
                type = FORMAT_DESC.SHORT;
                break;
            }
            case 4: {
                // EEEE (Tuesday)
                type = FORMAT_DESC.LONG;
                break;
            }
            case 5: {
                // EEEEE (T)
                type = FORMAT_DESC.NARROW;
                break;
            }
        }

        return type;
    }
    public static parseDateFormat(format: string): any[] {
        const dateStruct = [];
        const maskArray = Array.from(format);
        const weekdayInitPosition = format.indexOf(DATE_CHARS.WEEKDAY_CHAR);
        const monthInitPosition = format.indexOf(DATE_CHARS.MONTH_CHAR);
        const dayInitPosition = format.indexOf(DATE_CHARS.DAY_CHAR);
        const yearInitPosition = format.indexOf(DATE_CHARS.YEAR_CHAR);

        if (yearInitPosition !== -1) {
            dateStruct.push({
                type: DATE_PARTS.YEAR,
                initialPosition: yearInitPosition,
                formatType: this.getYearFormatType(format)
            });
        }

        if (weekdayInitPosition !== -1) {
            dateStruct.push({
                type: DATE_PARTS.WEEKDAY,
                initialPosition: weekdayInitPosition,
                formatType: this.getWeekDayFormatType(format)
            });
        }

        if (monthInitPosition !== -1) {
            dateStruct.push({
                type: DATE_PARTS.MONTH,
                initialPosition: monthInitPosition,
                formatType: this.getMonthFormatType(format)
            });
        }

        if (dayInitPosition !== -1) {
            dateStruct.push({
                type: DATE_PARTS.DAY,
                initialPosition: dayInitPosition,
                formatType: this.getDayFormatType(format)
            });
        }

        for (let i = 0; i < maskArray.length; i++) {
            if (!DatePickerUtil.isSpecialSymbol(maskArray[i])) {
                dateStruct.push({
                    type: DatePickerUtil.SEPARATOR,
                    initialPosition: i,
                    value: maskArray[i]
                });
            }
        }

        dateStruct.sort((a, b) => a.initialPosition - b.initialPosition);
        DatePickerUtil.fillDatePartsPositions(dateStruct);

        return dateStruct;
    }
    public static isSpecialSymbol(char: string): boolean {
        return (char !== DATE_CHARS.YEAR_CHAR
            && char !== DATE_CHARS.MONTH_CHAR
            && char !== DATE_CHARS.DAY_CHAR
            && char !== DATE_CHARS.WEEKDAY_CHAR) ? false : true;
    }
    public static getFormatMask(format: string): string {
        const mask = [];
        const dateStruct = DatePickerUtil.parseDateFormat(format);

        for (let i = 0; i < dateStruct.length; i++) {
            if (dateStruct[i].type === DATE_PARTS.DAY) {
                mask.push('00');
            }
            if (dateStruct[i].type === DATE_PARTS.MONTH) {
                switch (dateStruct[i].formatType) {
                    case FORMAT_DESC.SHORT: {
                        mask.push('LLL');
                        break;
                    }
                    case FORMAT_DESC.LONG: {
                        mask.push('LLLLLLLLL');
                        break;
                    }
                    case FORMAT_DESC.NARROW: {
                        mask.push('L');
                        break;
                    }
                    default: {
                        // M && MM
                        mask.push('00');
                        break;
                    }
                }
            }
            if (dateStruct[i].type === DATE_PARTS.YEAR) {
                switch (dateStruct[i].formatType) {
                    case FORMAT_DESC.NUMERIC: {
                        mask.push('0000');
                        break;
                    }
                    case FORMAT_DESC.TWO_DIGITS: {
                        mask.push('00');
                        break;
                    }
                }
            }
            if (dateStruct[i].type === DATE_PARTS.WEEKDAY) {
                switch (dateStruct[i].formatType) {
                    case FORMAT_DESC.SHORT: {
                        mask.push('LLL');
                        break;
                    }
                    case FORMAT_DESC.LONG: {
                        mask.push('LLLLLLLLL');
                        break;
                    }
                    case FORMAT_DESC.NARROW: {
                        mask.push('L');
                        break;
                    }
                }
            }
            if (dateStruct[i].type === DatePickerUtil.SEPARATOR) {
                mask.push(dateStruct[i].value);
            }
        }

        return mask.join('');
    }
    public static createDate(day: number, month: number, year: number): Date {
        const date = new Date();
        date.setDate(day);
        date.setMonth(month);
        date.setFullYear(year);
        return date;
    }
    public static trimMaskSymbols(mask: string): string {
        return mask.replace(/0|L/g, '_');
    }
    public static trimUnderlines(value: string): string {
        return value.replace(/_/g, '');
    }
    public static getLongMonthName(value: Date): string {
        return value.toLocaleString('en', {
            month: 'long'
        });
    }
    public static getLongDayName(value: Date): string {
        return value.toLocaleString('en', {
            weekday: 'long'
        });
    }
    public static getNumericFormatPrefix(formatType: string): string {
        return (formatType === FORMAT_DESC.TWO_DIGITS) ? '0' : '_';
    }
    public static getSpinnedDateInput(dateFormatParts: any[], inputValue: string, position: number, delta: number): string {
        let datePart = DatePickerUtil.getDatePartOnPosition(dateFormatParts, position);
        if ((datePart && datePart.length > 0 && datePart[0].type === DatePickerUtil.SEPARATOR)
            || inputValue.length === position) {
            datePart = this.getDatePartOnPosition(dateFormatParts, position - 1);
        }

        const positionsArray = datePart[0].position;
        const startIdx = positionsArray[0];
        const endIdx = positionsArray[0] + positionsArray.length;
        const datePartType = datePart[0].type;
        const datePartFormatType = datePart[0].formatType;

        let newValue = parseInt(DatePickerUtil.trimUnderlines(inputValue.substring(startIdx, endIdx)), 10);

        let maxValue, minValue = 1;
        if (!isNaN(newValue)) {
            switch (datePartType) {
                case DATE_PARTS.MONTH: {
                    // Max 12 months
                    maxValue = 12;
                    break;
                }
                case DATE_PARTS.DAY: {
                    // Max 31 days
                    maxValue = 31;
                    break;
                }
                case DATE_PARTS.YEAR: {
                    if (datePartFormatType === FORMAT_DESC.TWO_DIGITS) {
                        minValue = 0;
                        maxValue = 99;
                    } else {
                        // Infinite loop
                        minValue = -1;
                        maxValue = -1;
                    }
                    break;
                }
            }
        }

        let tempValue = newValue;
        tempValue += delta;
        if ((tempValue <= maxValue && tempValue >= minValue) || maxValue === -1 || minValue === -1) {
            newValue = tempValue;
        }

        const start = inputValue.slice(0, startIdx);
        const end = inputValue.slice(endIdx, inputValue.length);
        let changedPart: string;

        // Handling leading zero format
        const prefix = DatePickerUtil.getNumericFormatPrefix(datePartFormatType);
        changedPart = (newValue < 10) ? `${prefix}${newValue}` : `${newValue}`;

        return `${start}${changedPart}${end}`;
    }
    public static isOneDigit(input: string, char: string, index: number): boolean {
        return input.match(new RegExp(char, 'g')).length === 1 && index < 10;
    }
    public static daysInMonth(date: Date): number {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }
    private static getDatePartOnPosition(dateFormatParts: any[], position: number) {
        return dateFormatParts.filter((element) => element.position.some(pos => pos === position));
    }
    private static fillDatePartsPositions(dateArray: any[]): void {
        let offset = 0;

        for (let i = 0; i < dateArray.length; i++) {
            if (dateArray[i].type === DATE_PARTS.DAY) {
                dateArray[i].position = DatePickerUtil.fillValues(offset, 2);
                offset += 2;
            }

            if (dateArray[i].type === DATE_PARTS.MONTH) {
                switch (dateArray[i].formatType) {
                    case FORMAT_DESC.SHORT: {
                        dateArray[i].position = DatePickerUtil.fillValues(offset, 3);
                        offset += 3;
                        break;
                    }
                    case FORMAT_DESC.LONG: {
                        dateArray[i].position = DatePickerUtil.fillValues(offset, 9);
                        offset += 9;
                        break;
                    }
                    case FORMAT_DESC.NARROW: {
                        dateArray[i].position = DatePickerUtil.fillValues(offset, 1);
                        offset++;
                        break;
                    }
                    default: {
                        // FORMAT_DESC.NUMERIC || FORMAT_DESC.TWO_DIGITS
                        dateArray[i].position = DatePickerUtil.fillValues(offset, 2);
                        offset += 2;
                        break;
                    }
                }
            }

            if (dateArray[i].type === DatePickerUtil.SEPARATOR) {
                dateArray[i].position = DatePickerUtil.fillValues(offset, 1);
                offset++;
            }

            if (dateArray[i].type === DATE_PARTS.YEAR) {
                switch (dateArray[i].formatType) {
                    case FORMAT_DESC.NUMERIC: {
                        dateArray[i].position = DatePickerUtil.fillValues(offset, 4);
                        offset += 4;
                        break;
                    }
                    case FORMAT_DESC.TWO_DIGITS: {
                        dateArray[i].position = DatePickerUtil.fillValues(offset, 2);
                        offset += 2;
                        break;
                    }
                }
            }
        }
    }
    private static fillValues(start: number, offset: number) {
        const array = [];
        for (let i = start; i < start + offset; i++) {
            array.push(i);
        }
        return array;
    }
}
