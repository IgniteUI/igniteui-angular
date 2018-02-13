/**
 * This file contains all the directives used by the @link IgxCalendarComponent.
 * Except for the directives which are used for templating the calendar itself
 * you should generally not use them directly.
 * @preferred
 */
import {
    Directive,
    ElementRef,
    EventEmitter,
    Host,
    HostBinding,
    HostListener,
    Input,
    Output,
    TemplateRef
} from "@angular/core";
import { ICalendarDate } from "./calendar";
import { IgxCalendarComponent } from "./calendar.component";

/**
 * @hidden
 */
@Directive({
    selector: "[igxCalendarYear]"
})
export class IgxCalendarYearDirective {

    @Input("igxCalendarYear")
    public value: Date;

    @Output()
    public onYearSelection = new EventEmitter<Date>();

    @HostBinding("class.igx-calendar__year")
    get defaultCSS(): boolean {
        return !this.isCurrentYear;
    }

    @HostBinding("class.igx-calendar__year--current")
    get currentCSS(): boolean {
        return this.isCurrentYear;
    }

    get isCurrentYear(): boolean {
        return this.calendar.isCurrentYear(this.value);
    }

    constructor(@Host() public calendar: IgxCalendarComponent) {}

    @HostListener("click")
    public onClick() {
        this.onYearSelection.emit(this.value);
    }
}

@Directive({
    selector: "[igxCalendarMonth]"
})
export class IgxCalendarMonthDirective {

    @Input("igxCalendarMonth")
    public value: Date;

    @Input()
    public index;

    @Output()
    public onMonthSelection = new EventEmitter<Date>();

    @HostBinding("class.igx-calendar__month")
    get defaultCSS(): boolean {
        return !this.isCurrentMonth;
    }

    @HostBinding("class.igx-calendar__month--current")
    get currentCSS(): boolean {
        return this.isCurrentMonth;
    }

    get isCurrentMonth(): boolean {
        return this.calendar.isCurrentMonth(this.value);
    }

    constructor(@Host() public calendar: IgxCalendarComponent) {}

    @HostListener("click")
    public onClick() {
        this.onMonthSelection.emit(this.value);
    }
}

@Directive({
    selector: "[igxCalendarDate]"
})
export class IgxCalendarDateDirective {

    @Input("igxCalendarDate")
    public date: ICalendarDate;

    get selected(): boolean {
        const date = this.date.date;

        if (!this.calendar.value) {
            return;
        }

        if (this.calendar.selection === "single") {
            this._selected = (this.calendar.value as Date).toDateString() === date.toDateString();
        } else {
            this._selected = (this.calendar.value as Date[])
                .some((each) => each.toDateString() === date.toDateString());
        }
        return this._selected;
    }

    set selected(value: boolean) {
        this._selected = value;
    }

    @Output()
    public onDateSelection = new EventEmitter<ICalendarDate>();

    get isCurrentMonth(): boolean {
        return this.date.isCurrentMonth;
    }

    get isPreviousMonth(): boolean {
        return this.date.isPrevMonth;
    }

    get isNextMonth(): boolean {
        return this.date.isNextMonth;
    }

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    get isInactive(): boolean {
        return this.date.isNextMonth || this.date.isPrevMonth;
    }

    get isToday(): boolean {
        const today = new Date(Date.now());
        const date = this.date.date;
        return (date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    }

    get isWeekend(): boolean {
        const day = this.date.date.getDay();
        return day === 0 || day === 6;
    }

    @HostBinding("attr.tabindex")
    public tabindex = 0;

    @HostBinding("class.igx-calendar__date")
    get defaultCSS(): boolean {
        return this.date.isCurrentMonth && !(this.isWeekend && this.selected);
    }

    @HostBinding("class.igx-calendar__date--inactive")
    get isInactiveCSS(): boolean {
        return this.isInactive;
    }

    @HostBinding("class.igx-calendar__date--current")
    get isTodayCSS(): boolean {
        return this.isToday && !this.selected;
    }

    @HostBinding("class.igx-calendar__date--selected")
    get isSelectedCSS(): boolean {
        return this.selected;
    }

    @HostBinding("class.igx-calendar__date--weekend")
    get isWeekendCSS(): boolean {
        return this.isWeekend;
    }

    private _selected = false;

    constructor(@Host() public calendar: IgxCalendarComponent, private elementRef: ElementRef) { }

    @HostListener("click")
    @HostListener("keydown.enter")
    public onSelect() {
        this.onDateSelection.emit(this.date);
    }
}

@Directive({
    selector: "[igxCalendarHeader]"
})
export class IgxCalendarHeaderTemplateDirective {

    constructor(public template: TemplateRef<any>) {}
}

@Directive({
    selector: "[igxCalendarSubheader]"
})
export class IgxCalendarSubheaderTemplateDirective {
    constructor(public template: TemplateRef<any>) {}
}
