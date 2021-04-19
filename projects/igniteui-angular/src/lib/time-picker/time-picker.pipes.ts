import { Pipe, PipeTransform, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IGX_TIME_PICKER_COMPONENT, IgxTimePickerBase } from './time-picker.common';

@Pipe({
    name: 'timeFormatPipe'
})
export class TimeFormatPipe implements PipeTransform {
    constructor(@Inject(IGX_TIME_PICKER_COMPONENT) private timePicker: IgxTimePickerBase) { }

    public transform(value: Date): string {
        const format = this.timePicker.inputFormat.replace('tt', 'aa');
        const datePipe = new DatePipe(this.timePicker.locale);
        return datePipe.transform(value, format);
    }
}
