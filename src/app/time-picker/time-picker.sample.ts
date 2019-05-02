import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { IgxTimePickerComponent, InteractionMode, ConnectedPositioningStrategy, IgxInputDirective } from 'igniteui-angular';

@Component({
    selector: 'app-time-picker-sample',
    styleUrls: ['time-picker.sample.css'],
    templateUrl: 'time-picker.sample.html'
})
export class TimePickerSampleComponent implements AfterViewInit {
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

    myOverlaySettings = {
        modal: false,
        closeOnOutsideClick: true,
        positionStrategy: new ConnectedPositioningStrategy(),
    };

    @ViewChild('tp', { read: IgxTimePickerComponent })
    public tp: IgxTimePickerComponent;

    @ViewChild('target')
    public target: IgxInputDirective;

    ngAfterViewInit() {
        this.myOverlaySettings.positionStrategy.settings.target = this.target.nativeElement;
    }

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
