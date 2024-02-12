import { Component, OnInit, ViewChild } from '@angular/core';
import { DateRangeType, IgxButtonDirective, IgxCalendarComponent, IgxCardComponent, IgxDialogComponent, IgxRippleDirective, IViewDateChangeEventArgs } from 'igniteui-angular';


@Component({
    selector: 'app-calendar-sample',
    templateUrl: 'calendar.sample.html',
    styleUrls: ['calendar.sample.scss'],
    standalone: true,
    imports: [IgxButtonDirective, IgxRippleDirective, IgxCardComponent, IgxCalendarComponent, IgxDialogComponent]
})
export class CalendarSampleComponent implements OnInit {
    @ViewChild('calendar', { static: true })
    private calendar: IgxCalendarComponent;
    @ViewChild('calendar1', { static: true })
    private calendar1: IgxCalendarComponent;
    @ViewChild('alert', { static: true })
    private dialog: IgxDialogComponent;

    public range = [];
    public today = new Date();
    public ppNovember = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 10);
    public rangeDisabled = [
        new Date(this.today.getFullYear(), this.today.getMonth(), 10),
        new Date(this.today.getFullYear(), this.today.getMonth(), 13)
    ];
    public selectionType = 'single';

    public ngOnInit() {
        this.calendar1.disabledDates = [{ type: DateRangeType.Between, dateRange: this.rangeDisabled }];
        this.calendar.selectDate([ new Date(this.today.getFullYear(), this.today.getMonth(), 10),
                        new Date(this.today.getFullYear(), this.today.getMonth(), 17),
                        new Date(this.today.getFullYear(), this.today.getMonth(), 27)]);
    }

    public selectPTOdays(dates: Date | Date[]) {
        this.range = dates as Date [];
        console.log(this.range);
    }

    public submitPTOdays() {
        this.calendar1.specialDates =
            [{ type: DateRangeType.Specific, dateRange: this.range }];

        this.range.forEach((item) => {
            this.calendar1.selectDate(item);
        });

        if (this.range.length === 0) {
            this.dialog.message = 'Select dates from the Calendar first.';
        } else {
            this.dialog.message = 'PTO days submitted.';
        }
        this.dialog.open();
    }

    public showHide() {
        this.calendar.hideOutsideDays = !this.calendar.hideOutsideDays;
    }

    public onSelection(event: Date | Date []) {
        console.log(`Selected dates: ${event}`);
    }

    public viewDateChanged(event: IViewDateChangeEventArgs) {
        console.log(event);
    }

    public activeViewChanged(event) {
        const calendarView = event;
        console.log(`Selected date:${calendarView}`);
    }

    public setSelection(args: string) {
        return this.selectionType = this.calendar.selection = args;
    }

    public setMonthsViewNumber(monthsNumber: string) {
        const inputNumber = parseInt(monthsNumber, 10);
        if (!isNaN(inputNumber)) {
            this.calendar.monthsViewNumber = inputNumber;
        } else {
            console.warn("Invalid number input.");
        }
    }

    public select() {
        if (this.calendar.selection === 'single') {
            this.calendar.selectDate(new Date(this.today.getFullYear(), this.today.getMonth() + 1, 11));
        } else {
            this.calendar.selectDate([new Date(this.today.getFullYear(), this.today.getMonth(), 10),
                new Date(this.today.getFullYear(), this.today.getMonth(), 13)]);
        }
    }

    public deselect() {
        this.calendar.deselectDate();
    }

    public changeLocale(locale: string) {
        this.calendar.locale = locale;
    }

    public changeWeekStart(value: number) {
        this.calendar.weekStart = value;
    }
}
