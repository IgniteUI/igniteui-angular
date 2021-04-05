import { Pipe, PipeTransform } from '@angular/core';
import { Calendar } from './calendar';

@Pipe({
    name: 'IgxMonthViewSlots'
})
export class IgxMonthViewSlotsCalendar implements PipeTransform {
    public transform(monthViews: number) {
        return new Array(monthViews);
    }
}

@Pipe({
    name: 'IgxGetViewDate'
})
export class IgxGetViewDateCalendar implements PipeTransform {
    private calendar: Calendar;
    constructor() {
        this.calendar = new Calendar();
    }

    public transform(index: number, viewDate: Date): Date;
    public transform(index: number, viewDate: Date, wholeDate: false): number;
    public transform(index: number, viewDate: Date, wholeDate = true) {
        const date = this.calendar.timedelta(viewDate, 'month', index);
        return wholeDate ? date : date.getMonth();
    }
}
