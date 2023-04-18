import { Pipe, PipeTransform } from '@angular/core';
import { Calendar } from './calendar';

/**
 * @hidden
 */
@Pipe({
    name: 'IgxMonthViewSlots',
    standalone: true
})
export class IgxMonthViewSlotsCalendar implements PipeTransform {
    public transform(monthViews: number) {
        return new Array(monthViews);
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'IgxGetViewDate',
    standalone: true
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
