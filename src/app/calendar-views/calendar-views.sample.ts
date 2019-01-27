import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxCalendarComponent, DateRangeType } from 'igniteui-angular';
import { IgxDaysViewComponent } from 'projects/igniteui-angular/src/lib/calendar/days-view/days-view.component';

@Component({
    selector: 'app-calendar-views-sample',
    templateUrl: 'calendar-views.sample.html',
    styleUrls: ['calendar-views.sample.scss']
})
export class CalendarViewsSampleComponent implements OnInit {
    @ViewChild('calendar') calendar: IgxCalendarComponent;
    @ViewChild('daysView') daysView: IgxDaysViewComponent;

    date = new Date(2018, 8, 5);
    date1 = new Date(2019, 1, 7);
    dates = [
        new Date(2019, 1, 7),
        new Date(2019, 1, 8)
    ];

    locale = 'en';

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
}
