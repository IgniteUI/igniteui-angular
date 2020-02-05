import { Pipe, PipeTransform } from '@angular/core';
import { Calendar } from './calendar';

@Pipe({
    name: 'monthViewsSlots'
})
export class IgxMonthViewsGen implements PipeTransform {
    public transform(monthViews) {
        return new Array(monthViews);
    }
}

@Pipe({
    name: 'getViewDate'
})
export class IgxGetViewDate implements PipeTransform {
    private calendar: Calendar;
    constructor() {
        this.calendar = new Calendar();
    }
    public transform(index: number, viewDate: Date, isDate = true) {
        const date = this.calendar.timedelta(viewDate, 'month', index);
        return isDate ? date : date.getMonth();
    }
}
