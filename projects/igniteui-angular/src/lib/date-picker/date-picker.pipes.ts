import { PipeTransform, Pipe, Inject } from '@angular/core';
import { IGX_DATE_PICKER_COMPONENT, IgxDatePickerBase } from './date-picker.common';
import {
    trimMaskSymbols,
    trimUnderlines,
    addPromptCharsEditMode,

} from './date-picker.utils';

@Pipe({
    name: 'displayValue'
})
export class DatePickerDisplayValuePipe implements PipeTransform {
    constructor(@Inject(IGX_DATE_PICKER_COMPONENT) private _datePicker: IgxDatePickerBase) { }
    transform(value: any, args?: any): any {
        if (value !== '') {
            if (value === trimMaskSymbols(this._datePicker.mask)) {
                return '';
            }
            this._datePicker.rawDateString = value;
            return trimUnderlines(value);
        }
        return '';
    }
}

@Pipe({
    name: 'inputValue'
})
export class DatePickerInputValuePipe implements PipeTransform {
    constructor(@Inject(IGX_DATE_PICKER_COMPONENT) private _datePicker: IgxDatePickerBase) { }
    transform(value: any, args?: any): any {
        if (this._datePicker.value !== null && this._datePicker.value !== undefined) {
            return addPromptCharsEditMode(this._datePicker.dateFormatParts, this._datePicker.value, value);
        }
        return trimMaskSymbols(this._datePicker.mask);
    }
}
