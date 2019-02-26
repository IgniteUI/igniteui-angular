import { Component, ViewChild, PipeTransform, Pipe, OnInit } from '@angular/core';
import { IgxDatePickerComponent, DateRangeType } from 'igniteui-angular';
import { DatePipe, formatDate } from '@angular/common';

// import { registerLocaleData } from '@angular/common';
// import localeDE from '@angular/common/locales/de';
// import localeJA from '@angular/common/locales/ja';

@Component({
    selector: 'app-date-picker-sample',
    styleUrls: ['date-picker.sample.css'],
    templateUrl: 'date-picker.sample.html'
})

export class DatePickerSampleComponent {
    date = new Date('10/3/2018');

    public formatOptions = {
        day: 'numeric',
        month: 'long',
        weekday: 'short',
        year: 'numeric'
    };
    // @ViewChild('dp99') public datePicker99: IgxDatePickerComponent;

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

    formatter = (_: Date) => {
        return _.toLocaleString('en');
    }

    public deselect(datePicker) {
        datePicker.deselectDate();
    }

    constructor() {
        // registerLocaleData(localeJA);
        // registerLocaleData(localeDE);
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
}
