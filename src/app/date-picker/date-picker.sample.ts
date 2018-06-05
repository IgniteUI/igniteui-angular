import { Component } from '@angular/core';

@Component({
    selector: 'app-date-picker-sample',
    styleUrls: ['date-picker.sample.css'],
    templateUrl: 'date-picker.sample.html'
})
export class DatePickerSampleComponent {

    date = new Date(Date.now());

    formatter = (_: Date) => {
        return _.toDateString();
    }
}
