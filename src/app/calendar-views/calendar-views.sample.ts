import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxCalendarComponent, DateRangeType, IgxMonthPickerComponent } from 'igniteui-angular';
import { IgxDaysViewComponent } from 'projects/igniteui-angular/src/lib/calendar/days-view/days-view.component';

@Component({
    selector: 'app-calendar-views-sample',
    templateUrl: 'calendar-views.sample.html',
    styleUrls: ['calendar-views.sample.scss']
})
export class CalendarViewsSampleComponent implements OnInit {
    @ViewChild('calendar') calendar: IgxCalendarComponent;
    @ViewChild('daysView') daysView: IgxDaysViewComponent;
    @ViewChild('mp') monthPicker: IgxMonthPickerComponent;

    dates: Date | Date[];
    date = new Date(2018, 8, 5);
    date1 = new Date(2019, 1, 7);

    viewDate = new Date(2019, 1, 7);
    selection = new Date(2018, 1, 13);

    locale = 'en';
    localeFr = 'fr';
    localeDe = 'de'

    formatOptions = {
        day: '2-digit',
        month: 'long',
        weekday: 'long',
        year: 'numeric'
    }

    disabledDates = [{
        type: DateRangeType.Between,
        dateRange: [
            new Date(2019, 0, 14),
            new Date(2019, 0, 21)
        ]
    }];

    specialDates = [{
        type: DateRangeType.Specific,
        dateRange: [
            new Date(2019, 0, 7),
            new Date(2019, 0, 9)
        ]
    }];

    ngOnInit() {
        this.dates = [
            new Date(2019, 1, 7),
            new Date(2019, 1, 8)
        ];

        this.daysView.disabledDates = [{
            type: DateRangeType.Between, dateRange: [
                new Date(2019, 1, 22),
                new Date(2019, 1, 25)
            ]
        }];
        this.daysView.specialDates = [{
            type: DateRangeType.Specific, dateRange: [
                new Date(2019, 0, 7),
                new Date(2019, 1, 11)
            ]
        }];
    }

    onSelection(event) {
        console.log(event);
    }

    select() {
        // this.calendar.selectDate(new Date(2019, 1, 13));
        this.calendar.selectDate([new Date(2019, 1, 13), new Date(2019, 1, 14)]);
    }

    deselect() {
        // this.calendar.deselectDate(new Date(2019, 1, 13));
        this.calendar.deselectDate([new Date(2019, 1, 7), new Date(2019, 1, 8), new Date(2019, 1, 13), new Date(2019, 1, 14)]);
    }

    selectDV() {
        this.daysView.selectDate(new Date(2019, 1, 13));
        // this.daysView.selectDate([new Date(2019, 1, 13), new Date(2019, 1, 14)]);
    }

    deselectDV() {
        this.daysView.deselectDate(new Date(2019, 1, 13));
        // this.daysView.deselectDate([new Date(2019, 1, 13), new Date(2019, 1, 14)]);
    }
}
