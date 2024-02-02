import { Component, Input, Output, EventEmitter, HostBinding, ElementRef, booleanAttribute } from '@angular/core';
import { CalendarSelection, ICalendarDate, isDateInRanges } from '../calendar';
import { DateRangeDescriptor } from '../../core/dates';

/**
 * @hidden
 */
@Component({
    selector: 'igx-day-item',
    templateUrl: 'day-item.component.html',
    standalone: true
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

    @Input({ transform: booleanAttribute })
    public hideOutsideDays = false;

    @Input({ transform: booleanAttribute })
    @HostBinding('class.igx-days-view__date--last')
    public isLastInRange = false;

    @Input({ transform: booleanAttribute })
    @HostBinding('class.igx-days-view__date--first')
    public isFirstInRange = false;

    @Input({ transform: booleanAttribute })
    @HostBinding('class.igx-days-view__date--preview-first')
    public isFirstInPreviewRange = false;

    @Input({ transform: booleanAttribute })
    @HostBinding('class.igx-days-view__date--preview-last')
    public isLastInPreviewRange = false;

    @Input({ transform: booleanAttribute })
    public isWithinRange = false;

    @Input({ transform: booleanAttribute })
    public isWithinPreviewRange = false;

    @Output()
    public dateSelection = new EventEmitter<ICalendarDate>();

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

    @Input({ transform: booleanAttribute })
    @HostBinding('class.igx-days-view__date--active')
    public isActive = false;

    @HostBinding('class.igx-days-view__date--selected')
    public get isSelectedCSS(): boolean {
        return (!this.isDisabled && this.selected);
    }

    @HostBinding('class.igx-days-view__date--inactive')
    public get isInactive(): boolean {
        return this.date.isNextMonth || this.date.isPrevMonth;
    }

    @HostBinding('class.igx-days-view__date--hidden')
    public get isHidden(): boolean {
        return this.hideOutsideDays && this.isInactive;
    }

    @HostBinding('class.igx-days-view__date--current')
    public get isToday(): boolean {
        const today = new Date(Date.now());
        const date = this.date.date;

        if (date.getDate() === today.getDate()) {
            this.nativeElement.setAttribute('aria-current', 'date');
        }

        return (date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    }

    @HostBinding('class.igx-days-view__date--weekend')
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

    public get isFocusable(): boolean {
        return this.isCurrentMonth && !this.isHidden && !this.isDisabled && !this.isOutOfRange;
    }

    @HostBinding('class.igx-days-view__date--range')
    public get isWithinRangeCSS(): boolean {
        return !this.isSingleSelection && this.isWithinRange;
    }

    @HostBinding('class.igx-days-view__date--range-preview')
    public get isWithinPreviewRangeCSS(): boolean {
        return !this.isSingleSelection && this.isWithinPreviewRange;
    }

    @HostBinding('class.igx-days-view__date--special')
    public get isSpecial(): boolean {
        if (this.specialDates === null) {
            return false;
        }

        return isDateInRanges(this.date.date, this.specialDates);
    }

    @HostBinding('class.igx-days-view__date--disabled')
    public get isDisabledCSS(): boolean {
        return this.isHidden || this.isDisabled || this.isOutOfRange;
    }

    @HostBinding('class.igx-days-view__date--single')
    public get isSingleSelection(): boolean {
        return this.selection !== CalendarSelection.RANGE;
    }

    private _selected = false;

    constructor(private elementRef: ElementRef) { }
}
