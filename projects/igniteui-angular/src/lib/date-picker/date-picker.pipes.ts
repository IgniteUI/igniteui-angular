import { PipeTransform, Pipe, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IGX_DATE_PICKER_COMPONENT, IgxDatePickerBase } from './date-picker.common';
import {
    trimMaskSymbols,
    trimUnderlines,
    getLongMonthName,
    getLongDayName,
    getNumericFormatPrefix,
    isOneDigit,
    DATE_PARTS,
    FORMAT_DESC,
    MAX_WEEKDAY_SYMBOLS,
    MAX_MONTH_SYMBOLS,
    DATE_CHARS,

} from './date-picker.utils';

@Pipe({
    name: 'format'
})
export class DateFormatPipe extends DatePipe implements PipeTransform {
    transform(value: any, args?: any): any {
        return super.transform(value, args);
    }
}
@Pipe({
    name: 'displayValue'
})
export class DisplayValuePipe implements PipeTransform {
    constructor(@Inject(IGX_DATE_PICKER_COMPONENT) private _datePicker: IgxDatePickerBase) { }
    transform(value: any, args?: any): any {
        if (value !== '') {
            if (value === trimMaskSymbols(this._datePicker.mask)) {
                return '';
            }
            this._datePicker.rawData = value;
            return trimUnderlines(value);
        }
        return '';
    }
}

@Pipe({
    name: 'inputValue'
})
export class InputValuePipe implements PipeTransform {
    private PROMPT_CHAR = '_';
    constructor(@Inject(IGX_DATE_PICKER_COMPONENT) private _datePicker: IgxDatePickerBase) { }
    transform(value: any, args?: any): any {
        if (this._datePicker.value !== null && this._datePicker.value !== undefined) {
            let offset = 0;
            const dateArray = Array.from(value);
            const monthName = getLongMonthName(this._datePicker.value);
            const dayName = getLongDayName(this._datePicker.value);
            const dateFormatParts = this._datePicker.dateFormatParts;
            const datePickerFormat = this._datePicker.format;

            for (let i = 0; i < dateFormatParts.length; i++) {
                if (dateFormatParts[i].type === DATE_PARTS.WEEKDAY) {
                    if (dateFormatParts[i].formatType === FORMAT_DESC.LONG) {
                        offset += MAX_WEEKDAY_SYMBOLS - 4;
                        for (let j = dayName.length; j < MAX_WEEKDAY_SYMBOLS; j++) {
                            dateArray.splice(j, 0, this.PROMPT_CHAR);
                        }
                        dateArray.join('');
                    }
                }

                if (dateFormatParts[i].type === DATE_PARTS.MONTH) {
                    if (dateFormatParts[i].formatType === FORMAT_DESC.LONG) {
                        const startPos = offset + dateFormatParts[i].initialPosition + monthName.length;
                        const endPos = startPos + MAX_MONTH_SYMBOLS - monthName.length;
                        offset += MAX_MONTH_SYMBOLS - 4;
                        for (let j = startPos; j < endPos; j++) {
                            dateArray.splice(j, 0, this.PROMPT_CHAR);
                        }
                        dateArray.join('');
                    }
                    if (dateFormatParts[i].formatType === FORMAT_DESC.NUMERIC
                        || dateFormatParts[i].formatType === FORMAT_DESC.TWO_DIGITS) {
                        if (isOneDigit(datePickerFormat, DATE_CHARS.MONTH_CHAR, this._datePicker.value.getMonth() + 1)) {
                            const startPos = offset + dateFormatParts[i].initialPosition;
                            dateArray.splice(startPos, 0, getNumericFormatPrefix(dateFormatParts[i].formatType));
                        }
                        offset += 1;
                        dateArray.join('');
                    }
                }

                if (dateFormatParts[i].type === DATE_PARTS.DAY) {
                    if (dateFormatParts[i].formatType === FORMAT_DESC.NUMERIC
                        || dateFormatParts[i].formatType === FORMAT_DESC.TWO_DIGITS) {
                        if (isOneDigit(datePickerFormat, DATE_CHARS.DAY_CHAR, this._datePicker.value.getDate())) {
                            const startPos = offset + dateFormatParts[i].initialPosition;
                            dateArray.splice(startPos, 0, getNumericFormatPrefix(dateFormatParts[i].formatType));
                        }
                        offset += 1;
                        dateArray.join('');
                    }
                }
            }

            return dateArray.join('');
        }

        return trimMaskSymbols(this._datePicker.mask);
    }
}
