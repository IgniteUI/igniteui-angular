import { Component, ViewChild } from '@angular/core';
import { InteractionMode, IgxTimePickerComponent } from 'igniteui-angular';

@Component({
    selector: 'app-time-picker-sample',
    styleUrls: [ 'time-picker.sample.css' ],
    templateUrl: 'time-picker.sample.html'
})
export class TimePickerSampleComponent {
    max = "19:00";
    min = "10:00";
    itemsDelta = { hours: 1, minutes: 15 };
    format="H:mm";
    isSpinLoop = true;
    isVertical = false;
    mode = InteractionMode.dropdown;

    date = new Date();
    date1 = new Date();

    @ViewChild('tp', { read: IgxTimePickerComponent })
    public tp: IgxTimePickerComponent;


}
