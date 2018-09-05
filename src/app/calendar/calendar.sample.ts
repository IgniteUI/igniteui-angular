import { Component, ViewChild } from '@angular/core';
import { IgxCalendarComponent } from 'igniteui-angular';

@Component({
    selector: 'app-calendar-sample',
    templateUrl: 'calendar.sample.html'
})

export class CalendarSampleComponent {
    @ViewChild('calendar') calendar: IgxCalendarComponent;
    @ViewChild('calendar1', { read: IgxCalendarComponent }) calendar1: IgxCalendarComponent;

    public select() {
        // Working with range selection type
        // this.calendar1.selectDate([new Date('2018-09-20'), new Date('2018-09-26'), new Date('2018-09-28')]);

        // Working with range selection type
        // this.calendar1.selectDate([new Date('2018-09-29'), new Date('2018-09-20'), new Date('2018-09-26'), new Date('2018-09-05')]);

        // Deselect on Range should deselect the range not only passed dates
        this.calendar1.selectDate([new Date('2018-09-26'), new Date('2018-09-28'), new Date('2018-09-22'), new Date('2018-09-10')]);
    }

    public deselect() {
        // Working with range selection type
        // this.calendar1.deselectDate([new Date('2018-09-20'), new Date('2018-09-26'), new Date('2018-09-28')]);

        // Working with range selection type
        // this.calendar1.deselectDate([new Date('2018-09-29'), new Date('2018-09-20'), new Date('2018-09-26'), new Date('2018-09-05')]);

        // Working
        // this.calendar1.deselectDate();

        // Working - deselect only fraction of the range
        // this.calendar1.deselectDate([new Date('2018-09-26'), new Date('2018-09-28')]);

        // Deselect today
        // this.calendar1.deselectDate(new Date());

        // Deselect today array
        // this.calendar1.deselectDate([new Date()]);

        // Invalid date
        // this.calendar1.deselectDate(new Date('22/09/18'));

        // Deselect single selection with array of date
        // this.calendar1.deselectDate([new Date()]);

        // Deselect multi selection with array of date
        // this.calendar1.deselectDate([new Date()]);

        // Deselect multi selection with array of date that is in the array and one that isn't
        this.calendar1.deselectDate(new Date('2018-09-20'));
    }
}
