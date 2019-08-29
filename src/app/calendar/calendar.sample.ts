import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxCalendarComponent, DateRangeDescriptor, DateRangeType } from 'igniteui-angular';

@Component({
    selector: 'app-calendar-sample',
    templateUrl: 'calendar.sample.html',
    styleUrls: ['calendar.sample.scss']
})
export class CalendarSampleComponent implements OnInit {
    @ViewChild('calendar', { static: true }) calendar: IgxCalendarComponent;
    @ViewChild('calendar1', { read: IgxCalendarComponent, static: true }) calendar1: IgxCalendarComponent;

    ngOnInit() {
        this.calendar.disabledDates = [{
            type: DateRangeType.Between, dateRange: [
                new Date(2019, 7, 2),
                new Date(2019, 7, 5)
            ]
        }];

        this.calendar.specialDates = [{
            type: DateRangeType.Specific, dateRange: [
                new Date(2019, 7, 1),
                new Date(2019, 7, 4),
                new Date(2019, 7, 15),
                new Date(2019, 7, 14)
            ]
        }];
    }

    public select() {
        // Working with range selection type
        // this.calendar1.selectDate([new Date('2018-09-20'), new Date('2018-09-26'), new Date('2018-09-28')]);

        // Working with range/multi selection type
        this.calendar1.selectDate([new Date('2018-09-29'), new Date('2018-09-20'), new Date('2018-09-26'), new Date('2018-09-05')]);

        // Deselect on Range should deselect the range not only passed dates
        // this.calendar1.selectDate([new Date('2018-09-26'), new Date('2018-09-28'), new Date('2018-09-22'), new Date('2018-09-10')]);
    }

    public deselect() {
        // Working with range selection type
        // this.calendar1.deselectDate([new Date('2018-09-20'), new Date('2018-09-26'), new Date('2018-09-28')]);

        // Working with range/multi selection type
        // this.calendar1.deselectDate([new Date('2018-09-29'), new Date('2018-09-20'), new Date('2018-09-26'), new Date('2018-09-05')]);

        // Working
        // this.calendar1.deselectDate();

        // Working - deselect only fraction of the range
        // this.calendar1.deselectDate([new Date('2018-09-26'), new Date('2018-09-28')]);

        // Deselect today
        this.calendar1.deselectDate([new Date(), new Date('2018-09-26')]);

        // Deselect today array
        // this.calendar1.deselectDate([new Date()]);

        // Invalid date
        // this.calendar1.deselectDate(new Date('22/09/18'));

        // Deselect single selection with array of date
        // this.calendar1.deselectDate([new Date()]);

        // Deselect multi selection with array of date
        // this.calendar1.deselectDate([new Date()]);

        // Deselect multi selection with array of date that is in the array and one that isn't
        // this.calendar1.deselectDate(new Date('2018-09-20'));
    }
}
