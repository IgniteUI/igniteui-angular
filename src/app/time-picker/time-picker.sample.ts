import { Component, ViewChild } from '@angular/core';
import { InteractionMode, IgxTimePickerComponent } from 'igniteui-angular';

@Component({
    selector: 'app-time-picker-sample',
    styleUrls: [ 'time-picker.sample.css' ],
    templateUrl: 'time-picker.sample.html'
})
export class TimePickerSampleComponent {
    max = "19:00";
    min = "09:00";
    itemsDelta = { hours: 1, minutes: 5 };
    format="HH:mm";
    isSpinLoop = false;
    isVertical = false;
    mode = InteractionMode.dropdown;

    date = new Date(2018, 10, 27, 11, 45, 0, 0);
    date1 = new Date();

    @ViewChild('tp', { read: IgxTimePickerComponent })
    public tp: IgxTimePickerComponent;

    @ViewChild('tp1', { read: IgxTimePickerComponent })
    public tp1: IgxTimePickerComponent;


}
