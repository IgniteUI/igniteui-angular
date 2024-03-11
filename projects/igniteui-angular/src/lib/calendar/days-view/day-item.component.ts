import { Component, Input, Output, EventEmitter, HostBinding, ElementRef, booleanAttribute, ChangeDetectionStrategy } from '@angular/core';
import { CalendarSelection } from '../calendar';
import { DateRangeDescriptor } from '../../core/dates';
import { CalendarDay } from '../common/model'
import { areSameMonth, isNextMonth, isPreviousMonth, isDateInRanges } from '../common/helpers';

/**
 * @hidden
 */
@Component({
    selector: 'igx-day-item',
    templateUrl: 'day-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class IgxDayItemComponent {
    @Input()
    public date: CalendarDay;

    @Input()
    public viewDate: Date;

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
    public isWithinRange = false;

    @Input({ transform: booleanAttribute })
    public isWithinPreviewRange = false;

    @Input({ transform: booleanAttribute })
    public hideLeadingDays = false;

    @Input({ transform: booleanAttribute })
    public hideTrailingDays = false;

    private get hideLeading() {
        return this.hideLeadingDays && this.isPreviousMonth;
    }

    private get hideTrailing() {
        return this.hideTrailingDays && this.isNextMonth;
    }

    @Output()
    public dateSelection = new EventEmitter<CalendarDay>();

    @Output()
    public mouseEnter = new EventEmitter<void>();

    @Output()
    public mouseLeave = new EventEmitter<void>();

    @Output()
    public mouseDown = new EventEmitter<void>();

    public get isCurrentMonth(): boolean {
        return areSameMonth(this.date, this.viewDate);
    }

    public get isPreviousMonth(): boolean {
        return isPreviousMonth(this.date, this.viewDate);
    }

    public get isNextMonth(): boolean {
        return isNextMonth(this.date, this.viewDate);
    }

    public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    @Input({ transform: booleanAttribute })
    @HostBinding('class.igx-days-view__date--active')
    public isActive = false;

    @HostBinding('class.igx-days-view__date--selected')
    public get isSelectedCSS(): boolean {
    const selectable =
        !this.isInactive || (this.isWithinRange && this.selection === "range");
    return !this.isDisabled && selectable && this.selected;
    }

    @HostBinding('class.igx-days-view__date--inactive')
    public get isInactive(): boolean {
        return !this.isCurrentMonth;
    }

    @HostBinding('class.igx-days-view__date--hidden')
    public get isHidden(): boolean {
        return (this.hideLeading || this.hideTrailing) && this.isInactive;
    }

    @HostBinding('class.igx-days-view__date--current')
    public get isToday(): boolean {
        return !this.isInactive && this.date.equalTo(CalendarDay.today);
    }

    @HostBinding('class.igx-days-view__date--weekend')
    public get isWeekend(): boolean {
        return this.date.weekend;
    }

    public get isDisabled(): boolean {
        if (!this.disabledDates) {
            return false;
        }

        return isDateInRanges(this.date, this.disabledDates);
    }

    public get isFocusable(): boolean {
        return this.isCurrentMonth && !this.isHidden && !this.isDisabled;
    }

    protected onMouseEnter() {
        this.mouseEnter.emit();
    }

    protected onMouseLeave() {
        this.mouseLeave.emit();
    }

    protected onMouseDown(event: MouseEvent) {
        event.preventDefault();
        this.mouseDown.emit();
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
        if (!this.specialDates) {
            return false;
        }

        return !this.isInactive && isDateInRanges(this.date, this.specialDates);
    }

    @HostBinding('class.igx-days-view__date--disabled')
    public get isDisabledCSS(): boolean {
        return this.isHidden || this.isDisabled;
    }

    @HostBinding('class.igx-days-view__date--single')
    public get isSingleSelection(): boolean {
        return this.selection !== CalendarSelection.RANGE;
    }

    private _selected = false;

    constructor(private elementRef: ElementRef) { }
}
