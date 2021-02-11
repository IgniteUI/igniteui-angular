import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IgxCalendarComponent, IgxDialogComponent, DateRangeType, IViewDateChangeEventArgs } from 'igniteui-angular';

@Component({
    selector: 'app-calendar-sample',
    templateUrl: 'calendar.sample.html',
    styleUrls: ['calendar.sample.scss']
})
export class CalendarSampleComponent implements OnInit, AfterViewInit {
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

    public ngAfterViewInit() {
    }

    public selectPTOdays(dates: Date[]) {
        this.range = dates;
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

    public onSelection(event: Date) {
        console.log(`Selected date\s:${event}`);
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

    public setMonthsViewNumber(args: HTMLInputElement) {
        this.calendar.monthsViewNumber = parseInt(args.value, 10);
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
}
