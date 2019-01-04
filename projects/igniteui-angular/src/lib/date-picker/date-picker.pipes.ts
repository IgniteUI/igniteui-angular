import { PipeTransform, Pipe } from '@angular/core';
import { IgxDatePickerComponent } from 'igniteui-angular';
import { DatePickerUtil, DATE_PARTS, FORMAT_DESC, DATE_CHARS } from './date-picker.utils';
import { DatePipe } from '@angular/common';

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
    constructor(public datePicker: IgxDatePickerComponent) { }
    // on blur
    transform(value: any, args?: any): any {
        if (value !== '') {
            if (value === DatePickerUtil.trimMaskSymbols(this.datePicker.mask)) {
                return '';
            }
            this.datePicker.rawData = value;
            return DatePickerUtil.trimUnderlines(value);
        }

        return '';
    }
}

@Pipe({
    name: 'inputValue'
})
export class InputValuePipe implements PipeTransform {
    constructor(public datePicker: IgxDatePickerComponent) { }
    // on focus
    transform(value: any, args?: any): any {
        if (this.datePicker.value !== null && this.datePicker.value !== undefined) {
            let result;
            let offset = 0;
            const dateArray = Array.from(value);
            const monthName = DatePickerUtil.getLongMonthName(this.datePicker.value);
            const dayName = DatePickerUtil.getLongDayName(this.datePicker.value);

            const dateFormatParts = this.datePicker.dateFormatParts;

            for (let i = 0; i < dateFormatParts.length; i++) {
                if (dateFormatParts[i].type === DATE_PARTS.WEEKDAY) {
                    if (dateFormatParts[i].formatType === FORMAT_DESC.LONG) {
                        offset += DatePickerUtil.MAX_WEEKDAY_SYMBOLS - 4;
                        for (let j = dayName.length; j < DatePickerUtil.MAX_WEEKDAY_SYMBOLS; j++) {
                            dateArray.splice(j, 0, '_');
                        }
                        dateArray.join('');
                    }
                }

                if (dateFormatParts[i].type === DATE_PARTS.MONTH) {
                    if (dateFormatParts[i].formatType === FORMAT_DESC.LONG) {
                        const startPos = offset + dateFormatParts[i].initialPosition + monthName.length;
                        const endPos = startPos + DatePickerUtil.MAX_MONTH_SYMBOLS - monthName.length;
                        offset += DatePickerUtil.MAX_MONTH_SYMBOLS - 4;
                        for (let j = startPos; j < endPos; j++) {
                            dateArray.splice(j, 0, '_');
                        }
                        dateArray.join('');
                    }
                    if (dateFormatParts[i].formatType === FORMAT_DESC.NUMERIC
                        || dateFormatParts[i].formatType === FORMAT_DESC.TWO_DIGITS) {
                        const isOneDigit = this.datePicker.isOneDigit(DATE_CHARS.MONTH_CHAR, this.datePicker.value.getMonth() + 1);
                        if (isOneDigit) {
                            const startPos = offset + dateFormatParts[i].initialPosition;
                            dateArray.splice(startPos, 0, DatePickerUtil.getNumericFormatPrefix(dateFormatParts[i].formatType));
                        }
                        offset += 1;
                        dateArray.join('');
                    }
                }

                if (dateFormatParts[i].type === DATE_PARTS.DAY) {
                    if (dateFormatParts[i].formatType === FORMAT_DESC.NUMERIC
                        || dateFormatParts[i].formatType === FORMAT_DESC.TWO_DIGITS) {
                        const isOneDigit = this.datePicker.isOneDigit(DATE_CHARS.DAY_CHAR, this.datePicker.value.getDate());
                        if (isOneDigit) {
                            const startPos = offset + dateFormatParts[i].initialPosition;
                            dateArray.splice(startPos, 0, DatePickerUtil.getNumericFormatPrefix(dateFormatParts[i].formatType));
                        }
                        offset += 1;
                        dateArray.join('');
                    }
                }
            }

            result = dateArray.join('');

            return result;
        }

        return DatePickerUtil.trimMaskSymbols(this.datePicker.mask);
    }
}
