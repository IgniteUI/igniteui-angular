import { Component, OnInit, ViewChild } from '@angular/core';
import {
    IgxCalendarComponent,
    DateRangeType,
    IgxDaysViewComponent
} from 'igniteui-angular';

@Component({
    selector: 'app-calendar-views-sample',
    templateUrl: 'calendar-views.sample.html',
    styleUrls: ['calendar-views.sample.scss']
})
export class CalendarViewsSampleComponent implements OnInit {
    @ViewChild('calendar', { static: true })
    private calendar: IgxCalendarComponent;
    @ViewChild('daysView', { static: true })
    private daysView: IgxDaysViewComponent;

    public dates: Date | Date[];
    public date = new Date(2018, 8, 5);
    public date1 = new Date(2019, 1, 7);
    public viewDate = new Date(2019, 1, 7);
    public selection = new Date(2018, 1, 13);
    public locale = 'en';
    public localeFr = 'fr';
    public localeDe = 'de';

    public formatOptions = {
        day: '2-digit',
        month: 'short',
        weekday: 'short',
        year: '2-digit'
    };

    public formatViews = {
        day: false,
        month: true,
        year: false
    };

    public disabledDates = [{
        type: DateRangeType.Between,
        dateRange: [
            new Date(2019, 0, 14),
            new Date(2019, 0, 21)
        ]
    }];

    public specialDates = [{
        type: DateRangeType.Specific,
        dateRange: [
            new Date(2019, 0, 7),
            new Date(2019, 0, 9)
        ]
    }];

    public ngOnInit() {
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

    public onSelection(date) {
        console.log(`selected date: ${date}`);
    }

    public select() {
        // this.calendar.selectDate(new Date(2019, 1, 13));
        this.calendar.selectDate([new Date(2019, 1, 13), new Date(2019, 1, 14)]);
    }

    public deselect() {
        // this.calendar.deselectDate(new Date(2019, 1, 13));
        this.calendar.deselectDate([new Date(2019, 1, 7), new Date(2019, 1, 8), new Date(2019, 1, 13), new Date(2019, 1, 14)]);
    }

    public selectDV() {
        this.daysView.selectDate(new Date(2019, 1, 13));
        // this.daysView.selectDate([new Date(2019, 1, 13), new Date(2019, 1, 14)]);
    }

    public deselectDV() {
        this.daysView.deselectDate(new Date(2019, 1, 13));
        // this.daysView.deselectDate([new Date(2019, 1, 13), new Date(2019, 1, 14)]);
    }
}
