import { Component, ViewChild, PipeTransform, Pipe } from '@angular/core';
import { IgxDatePickerComponent } from 'igniteui-angular';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-date-picker-sample',
    styleUrls: ['date-picker.sample.css'],
    templateUrl: 'date-picker.sample.html'
})

export class DatePickerSampleComponent {
    @ViewChild('datePicker') datePicker: IgxDatePickerComponent;
    date = new Date('10/3/2018');

    public date1;

    formatter = (_: Date) => {
        return _.toDateString();
    }

    public deselect() {
        this.datePicker.deselectDate();
    }

    constructor() {
        const date = new Date();
        date.setDate(10);
        date.setMonth(2);
        date.setFullYear(2018);

        this.date1 = date;

        // this.date1.setDate(10);
        // this.date1.setMonth(2);
        // this.date1.setFullYear(2018);

        const test = new DateFormatPipe('en').transform(date, 'd.M.y');
    }
}
@Pipe({
    name: 'format'
})
export class DateFormatPipe extends DatePipe implements PipeTransform {
    transform(value: any, args?: any): any {
        return super.transform(value, args);
    }
}
