import { Component, ViewChild } from '@angular/core';
import { IgxDatePickerComponent } from 'igniteui-angular';

@Component({
    selector: 'app-date-picker-sample',
    styleUrls: ['date-picker.sample.css'],
    templateUrl: 'date-picker.sample.html'
})

export class DatePickerSampleComponent {
    @ViewChild('datePicker') datePicker: IgxDatePickerComponent;
    date = new Date('10/3/2018');

    date1 = new Date();

    formatter = (_: Date) => {
        return _.toDateString();
    }

    public deselect() {
        this.datePicker.deselectDate();
    }
}
