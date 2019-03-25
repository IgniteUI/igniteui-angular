import { Component, ViewChild } from '@angular/core';
import { IgxTimePickerComponent, InteractionMode } from 'igniteui-angular';

@Component({
    selector: 'app-time-picker-sample',
    styleUrls: ['time-picker.sample.css'],
    templateUrl: 'time-picker.sample.html'
})
export class TimePickerSampleComponent {
    max = '19:00';
    min = '09:00';

    itemsDelta = { hours: 1, minutes: 5 };
    format = 'hh:mm tt';
    isSpinLoop = true;
    isVertical = true;
    mode = InteractionMode.DropDown;

    date = new Date(2018, 10, 27, 17, 45, 0, 0);
    today = new Date(Date.now());

    isRequired = true;

    @ViewChild('tp', { read: IgxTimePickerComponent })
    public tp: IgxTimePickerComponent;

    showDate(date) {
        return date ? date.toLocaleString() : 'Value is null.';
    }

    change() {
        this.isRequired = !this.isRequired;
    }

    valueChanged(event) {
        console.log(event);
    }

    validationFailed(event) {
        console.log(event);
    }
}
