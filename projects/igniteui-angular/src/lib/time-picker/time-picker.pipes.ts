import { Pipe, PipeTransform, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IGX_TIME_PICKER_COMPONENT } from './time-picker.common';
import { IgxTimePickerComponent } from './time-picker.component';

@Pipe({
    name: 'timeFormatPipe'
})
export class TimeFormatPipe implements PipeTransform {
    constructor(@Inject(IGX_TIME_PICKER_COMPONENT) private timePicker: IgxTimePickerComponent) { }

    public transform(value: Date): string {
        const format = this.timePicker.inputFormat.replace('tt', 'aa');
        const datePipe = new DatePipe(this.timePicker.locale);
        return datePipe.transform(value, format);
    }
}
