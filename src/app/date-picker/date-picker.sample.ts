import { Component, ViewChild } from '@angular/core';
import { IgxDatePickerComponent } from 'igniteui-angular';
import { formatDate } from '@angular/common';

@Component({
    selector: 'app-date-picker-sample',
    styleUrls: ['date-picker.sample.scss'],
    templateUrl: 'date-picker.sample.html'
})

export class DatePickerSampleComponent {
    @ViewChild('datepicker1', { read: IgxDatePickerComponent, static: true })
    private datepicker1: IgxDatePickerComponent;

    @ViewChild('retemplated', { static: true })
    private retemplatedDP;

    @ViewChild('datePicker', { static: true })
    private dp: IgxDatePickerComponent;

    public date = new Date('10/3/2018');
    public formatOptions = {
        day: 'numeric',
        month: 'long',
        weekday: 'short',
        year: 'numeric'
    };
    public date1;
    public date2;
    public date3;
    public date4;
    public testDate = new Date(2000, 3, 5);

    public date5 = new Date('10/5/2020');

    public range = [
        new Date(new Date().getFullYear(), new Date().getMonth(), 3),
        new Date(new Date().getFullYear(), new Date().getMonth(), 8)
    ];

    constructor() {
        const date1 = new Date();
        date1.setDate(8);
        date1.setMonth(5);
        date1.setFullYear(1978);

        const date2 = new Date();
        date2.setDate(6);
        date2.setMonth(4);
        date2.setFullYear(2020);

        const date3 = new Date();
        date3.setDate(14);
        date3.setMonth(10);
        date3.setFullYear(2021);

        this.date1 = date1;
        this.date2 = date2;
        this.date3 = date3;
        this.date4 = date3;
    }

    public formatter = (_: Date) => _.toLocaleString('en');

    public deselect(datePicker) {
        datePicker.deselectDate();
    }

    public setMonthsViewNumber(args: HTMLInputElement) {
        this.datepicker1.monthsViewNumber = parseInt(args.value, 10);
    }

    public changeDate(event) {
        const input = event.target.value;
        const dateParts = input.split(new RegExp('[^0-9]', 'g')).filter((part) => part !== '');

        let date = '';
        for (let i = 0; i < dateParts.length; i++) {
            date += dateParts[i];
            if (i !== dateParts.length - 1) {
                date += '/';
            }
        }

        const parsedDate = (date !== '') ? new Date(formatDate(date, this.retemplatedDP.format, this.retemplatedDP.locale)) : '';
        this.retemplatedDP.value = parsedDate;
    }

    public selectToday(picker: IgxDatePickerComponent) {
        picker.calendar.value = picker.calendar.viewDate = new Date(Date.now());
    }

    public d() {
        this.dp.triggerTodaySelection();
    }
}
