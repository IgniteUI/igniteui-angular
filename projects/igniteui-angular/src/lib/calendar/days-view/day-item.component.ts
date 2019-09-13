import { Component, Input, Output, EventEmitter, HostBinding, ElementRef, HostListener } from '@angular/core';
import { ICalendarDate, isDateInRanges } from '../calendar';
import { DateRangeDescriptor } from '../../core/dates';
import { CalendarSelection } from '../calendar-base';

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

    /**
     * Returns boolean indicating if the day is selected
     *
     */
    @Input()
    public get selected(): any {
        return this._selected;
    }

    /**
     * Selects the day
     */
    public set selected(value: any) {
        this._selected = value;
    }

    @Input()
    public disabledDates: DateRangeDescriptor[];

    @Input()
    public outOfRangeDates: DateRangeDescriptor[];

    @Input()
    public specialDates: DateRangeDescriptor[];

    @Input()
    public hideOutsideDays = false;

    @Input()
    @HostBinding('class.igx-calendar__date--last')
    public isLastInRange = false;

    @Input()
    @HostBinding('class.igx-calendar__date--first')
    public isFirstInRange = false;

    @Input()
    @HostBinding('class.igx-calendar__date--firstday')
    public isFirstInMonth = false;

    @Input()
    @HostBinding('class.igx-calendar__date--lastday')
    public isLastInMonth = false;

    @Input()
    @HostBinding('class.igx-calendar__date--range')
    public isWithinRange = false;

    @Output()
    public onDateSelection = new EventEmitter<ICalendarDate>();


    public get isCurrentMonth(): boolean {
        return this.date.isCurrentMonth;
    }

    public get isPreviousMonth(): boolean {
        return this.date.isPrevMonth;
    }

    public get isNextMonth(): boolean {
        return this.date.isNextMonth;
    }

    public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    public get isInactive(): boolean {
        return this.date.isNextMonth || this.date.isPrevMonth;
    }

    public get isHidden(): boolean {
        return this.hideOutsideDays && this.isInactive;
    }

    public get isToday(): boolean {
        const today = new Date(Date.now());
        const date = this.date.date;
        return (date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    }

    public get isWeekend(): boolean {
        const day = this.date.date.getDay();
        return day === 0 || day === 6;
    }

    public get isDisabled(): boolean {
        if (this.disabledDates === null) {
            return false;
        }

        return isDateInRanges(this.date.date, this.disabledDates);
    }

    public get isOutOfRange(): boolean {
        if (!this.outOfRangeDates) {
            return false;
        }

        return isDateInRanges(this.date.date, this.outOfRangeDates);
    }

    public get isSpecial(): boolean {
        if (this.specialDates === null) {
            return false;
        }

        return isDateInRanges(this.date.date, this.specialDates);
    }

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @HostBinding('class.igx-calendar__date')
    public get defaultCSS(): boolean {
        return this.date.isCurrentMonth && !(this.isWeekend && this.selected);
    }

    @HostBinding('class.igx-calendar__date--inactive')
    public get isInactiveCSS(): boolean {
        return this.isInactive;
    }

    @HostBinding('class.igx-calendar__date--hidden')
    get isHiddenCSS(): boolean {
        return this.isHidden;
    }

    @HostBinding('class.igx-calendar__date--current')
    public get isTodayCSS(): boolean {
        return this.isToday;
    }

    @HostBinding('class.igx-calendar__date--selected')
    public get isSelectedCSS(): boolean {
        return this.isCurrentMonth && this.selected;
    }

    @HostBinding('class.igx-calendar__date--selected-dimmed')
    public get isSelectedDimmedCSS(): boolean {
        return !this.isCurrentMonth && this.isSingleSelection && this.selected;
    }

    @HostBinding('class.igx-calendar__date--weekend')
    public get isWeekendCSS(): boolean {
        return this.isWeekend;
    }

    @HostBinding('class.igx-calendar__date--disabled')
    public get isDisabledCSS(): boolean {
        return this.isHidden || this.isDisabled || this.isOutOfRange;
    }


    @HostBinding('class.igx-calendar__date--special')
    public get isSpecialCSS(): boolean {
        return this.isSpecial;
    }

    @HostBinding('class.igx-calendar__date--single')
    public get isSingleSelection(): boolean {
        return this.selection !== CalendarSelection.RANGE;
    }


    private _selected = false;

    constructor(private elementRef: ElementRef) { }

    @HostListener('click')
    @HostListener('keydown.enter')
    public onSelect() {
        this.onDateSelection.emit(this.date);
    }
}
