import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { IgxTimePickerComponent, PickerInteractionMode, IgxInputDirective, AutoPositionStrategy, OverlaySettings } from 'igniteui-angular';

@Component({
    selector: 'app-time-picker-sample',
    styleUrls: ['time-picker.sample.scss'],
    templateUrl: 'time-picker.sample.html'
})
export class TimePickerSampleComponent implements AfterViewInit {
    @ViewChild('tp', { read: IgxTimePickerComponent, static: true })
    public tp: IgxTimePickerComponent;

    @ViewChild('target')
    public target: IgxInputDirective;

    // public max = '19:00';
    // public min = '09:00';

    public itemsDelta = { hours: 1, minutes: 5, seconds: 1 };
    public format = 'hh:mm:ss tt';
    public isSpinLoop = true;
    public isVertical = true;
    public mode = PickerInteractionMode.DropDown;

    public date1 = new Date(2018, 10, 27, 17, 45, 0, 0);
    public date = new Date(2018, 10, 27, 11, 45, 0, 0);
    public min = new Date(2018, 10, 27, 9, 30, 15, 0);
   // public max = new Date(2018, 10, 27, 14, 20, 30, 0);
    public val = new Date(0, 0, 0, 19, 35, 30, 0);
    public today = new Date(Date.now());

    public isRequired = true;

    public myOverlaySettings: OverlaySettings = {
        modal: false,
        closeOnOutsideClick: true,
        positionStrategy: new AutoPositionStrategy()
    };

    public ngAfterViewInit() {
        // this.myOverlaySettings.target = this.target.nativeElement;
    }

    public showDate(date) {
        return date ? date.toLocaleString() : 'Value is null.';
    }

    public change() {
        this.isRequired = !this.isRequired;
    }

    public valueChanged(event) {
        console.log(event);
    }

    public validationFailed(event) {
        console.log(event);
    }

    public onBlur(inputValue, timePickerValue) {
        const parts = inputValue.split(':');

        if (parts.length === 2) {
            timePickerValue.setHours(parts[0], parts[1]);
        }
    }

    public selectToday(picker: IgxTimePickerComponent) {
        picker.value = new Date(Date.now());
        picker.close();
    }

    public increment(){
        this.tp.increment(DatePart.Hours);
    }
    public decrement(){
        this.tp.decrement(DatePart.Hours);
    }
}
