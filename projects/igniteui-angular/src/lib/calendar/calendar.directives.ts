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
    TemplateRef,
    Inject
} from '@angular/core';
import { ICalendarDate, IGX_CALENDAR_COMPONENT, IgxCalendarBase } from './calendar';

/**
 * @hidden
 */
@Directive({
    selector: '[igxCalendarYear]'
})
export class IgxCalendarYearDirective {

    @Input('igxCalendarYear')
    public value: Date;

    @Output()
    public onYearSelection = new EventEmitter<Date>();

    @HostBinding('class.igx-calendar__year')
    get defaultCSS(): boolean {
        return !this.isCurrentYear;
    }

    @HostBinding('class.igx-calendar__year--current')
    get currentCSS(): boolean {
        return this.isCurrentYear;
    }

    get isCurrentYear(): boolean {
        return this.calendar.isCurrentYear(this.value);
    }

    constructor(@Inject(IGX_CALENDAR_COMPONENT) public calendar: IgxCalendarBase) {}

    @HostListener('click')
    public onClick() {
        this.onYearSelection.emit(this.value);
    }
}

@Directive({
    selector: '[igxCalendarMonth]'
})
export class IgxCalendarMonthDirective {

    @Input('igxCalendarMonth')
    public value: Date;

    @Input()
    public index;

    @Output()
    public onMonthSelection = new EventEmitter<Date>();

    @HostBinding('class.igx-calendar__month')
    get defaultCSS(): boolean {
        return !this.isCurrentMonth;
    }

    @HostBinding('class.igx-calendar__month--current')
    get currentCSS(): boolean {
        return this.isCurrentMonth;
    }

    get isCurrentMonth(): boolean {
        return this.calendar.isCurrentMonth(this.value);
    }

    constructor(@Inject(IGX_CALENDAR_COMPONENT) public calendar: IgxCalendarBase) {}

    @HostListener('click')
    public onClick() {
        this.onMonthSelection.emit(this.value);
    }
}

@Directive({
    selector: '[igxCalendarDate]'
})
export class IgxCalendarDateDirective {

    @Input('igxCalendarDate')
    public date: ICalendarDate;

    get selected(): boolean {
        const date = this.date.date;

        if (!this.calendar.value) {
            return;
        }

        if (this.calendar.selection === 'single') {
            this._selected = (this.calendar.value as Date).getTime() === date.getTime();
        } else {
            this._selected = (this.calendar.value as Date[])
                .some((each) => each.getTime() === date.getTime());
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

    get isDisabled(): boolean {
        return this.calendar.isDateDisabled(this.date.date);
    }

    get isSpecial(): boolean {
        return this.calendar.isDateSpecial(this.date.date);
    }

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @HostBinding('class.igx-calendar__date')
    get defaultCSS(): boolean {
        return this.date.isCurrentMonth && !(this.isWeekend && this.selected);
    }

    @HostBinding('class.igx-calendar__date--inactive')
    get isInactiveCSS(): boolean {
        return this.isInactive;
    }

    @HostBinding('class.igx-calendar__date--current')
    get isTodayCSS(): boolean {
        return this.isToday && !this.selected;
    }

    @HostBinding('class.igx-calendar__date--selected')
    get isSelectedCSS(): boolean {
        return this.selected;
    }

    @HostBinding('class.igx-calendar__date--weekend')
    get isWeekendCSS(): boolean {
        return this.isWeekend;
    }

    @HostBinding('class.igx-calendar__date--disabled')
    get isDisabledCSS(): boolean {
        return this.isDisabled;
    }

    @HostBinding('class.igx-calendar__date--special')
    get isSpecialCSS(): boolean {
        return this.isSpecial;
    }

    private _selected = false;

    constructor(@Inject(IGX_CALENDAR_COMPONENT) public calendar: IgxCalendarBase, private elementRef: ElementRef) { }

    @HostListener('click')
    @HostListener('keydown.enter')
    public onSelect() {
        this.onDateSelection.emit(this.date);
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxCalendarHeader]'
})
export class IgxCalendarHeaderTemplateDirective {

    constructor(public template: TemplateRef<any>) {}
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxCalendarSubheader]'
})
export class IgxCalendarSubheaderTemplateDirective {
    constructor(public template: TemplateRef<any>) {}
}
