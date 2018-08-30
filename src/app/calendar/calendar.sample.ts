import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxCalendarComponent, DateRangeDescriptor, DateRangeType } from 'igniteui-angular';

@Component({
    selector: 'app-calendar-sample',
    templateUrl: 'calendar.sample.html',
    styleUrls: ['calendar.sample.scss']
})
export class CalendarSampleComponent implements OnInit {
    @ViewChild('calendar') calendar: IgxCalendarComponent;

    ngOnInit() {
        this.calendar.disabledDates = [{ type: DateRangeType.Between, dateRange:  [
            new Date(2018, 8, 2),
            new Date(2018, 8, 8)
        ]}];

        this.calendar.specialDates = [{ type: DateRangeType.Specific, dateRange: [
            new Date(2018, 7, 4),
            new Date(2018, 7, 14),
            new Date(2018, 7, 15),
            new Date(2018, 8, 14)
        ]}];
    }
}
