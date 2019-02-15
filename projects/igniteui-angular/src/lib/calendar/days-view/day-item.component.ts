import { Component, Input, Output, EventEmitter, HostBinding, ElementRef, HostListener } from '@angular/core';
import { ICalendarDate, isDateInRanges } from '../calendar';
import { DateRangeDescriptor } from '../../core/dates';

/**
 *@hidden
*/
@Component({
    selector: 'igx-day-item',
    templateUrl: 'day-item.component.html'
})
export class IgxDayItemComponent {
    @Input()
    public date: ICalendarDate;

    @Input()
    public selection: string;

    @Input()
    public value: Date | Date[];

    @Input()
    public disabledDates: DateRangeDescriptor[];

    @Input()
    public outOfRangeDates: DateRangeDescriptor[];

    @Input()
    public specialDates: DateRangeDescriptor[];

    @Output()
    public onDateSelection = new EventEmitter<ICalendarDate>();

    get selected(): boolean {
        const date = this.date.date;

        if (!this.value) {
            return;
        }

        if (this.selection === 'single') {
        this._selected = (this.value as Date).getTime() === date.getTime();
        } else {
        this._selected = (this.value as Date[])
            .some((each) => each.getTime() === date.getTime());
        }

        return this._selected;
    }

    set selected(value: boolean) {
        this._selected = value;
    }

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
        if (this.disabledDates === null) {
            return false;
        }

        return isDateInRanges(this.date.date, this.disabledDates);
    }

    get isOutOfRange(): boolean {
        if (!this.outOfRangeDates) {
            return false;
        }

        return isDateInRanges(this.date.date, this.outOfRangeDates);
    }

    get isSpecial(): boolean {
        if (this.specialDates === null) {
            return false;
        }

        return isDateInRanges(this.date.date, this.specialDates);
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
        return this.isDisabled || this.isOutOfRange;
    }

    @HostBinding('class.igx-calendar__date--special')
    get isSpecialCSS(): boolean {
        return this.isSpecial;
    }

    private _selected = false;

    constructor(private elementRef: ElementRef) { }

    @HostListener('click')
    @HostListener('keydown.enter')
    public onSelect() {
        this.onDateSelection.emit(this.date);
    }
}
