import { Component } from '@angular/core';
import { InteractionMode } from 'igniteui-angular';

@Component({
    selector: 'app-time-picker-sample',
    styleUrls: [ 'time-picker.sample.css' ],
    templateUrl: 'time-picker.sample.html'
})
export class TimePickerSampleComponent {
    max = "19:00";
    min = "09:00";
    itemsDelta = { hours: 1, minutes: 15 };
    format="hh:mm tt";
    isSpinLoop = true;
    isVertical = false;
    mode = InteractionMode.dropdown;

    date = new Date();
}
