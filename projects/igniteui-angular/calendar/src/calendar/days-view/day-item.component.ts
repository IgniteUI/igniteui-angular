import { Component, Input, Output, EventEmitter, HostBinding, ElementRef, booleanAttribute, ChangeDetectionStrategy, inject } from '@angular/core';
import { CalendarSelection } from '../calendar';
import { IgxCalendarDayTemplateContext } from '../calendar.directives';
import { areSameMonth, CalendarDay, DateRangeDescriptor, isDateInRanges, isNextMonth, isPreviousMonth } from 'igniteui-angular/core';

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
    private elementRef = inject(ElementRef);

    @Input()
    public date!: CalendarDay;

    @Input()
    public viewDate!: Date;

    @Input()
    public selection!: string;

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
    public disabledDates!: DateRangeDescriptor[];

    @Input()
    public specialDates!: DateRangeDescriptor[];

    @Input({ transform: booleanAttribute })
    public hideOutsideDays = false;

    @Input({ transform: booleanAttribute })
    @HostBinding('class.igx-day-item--last')
    public isLastInRange = false;

    @Input({ transform: booleanAttribute })
    @HostBinding('class.igx-day-item--first')
    public isFirstInRange = false;

    @Input({ transform: booleanAttribute })
    public isWithinRange = false;

    @Input({ transform: booleanAttribute })
    public isWithinPreviewRange = false;

    @Input({ transform: booleanAttribute })
    public hideLeadingDays = false;

    @Input({ transform: booleanAttribute })
    public hideTrailingDays = false;

    /** The id of the templated content, which describes the day cell for assistive technologies. */
    @Input()
    @HostBinding('attr.aria-describedby')
    public contentId: string | null = null;

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
    @HostBinding('class.igx-day-item--active')
    public isActive = false;

    @HostBinding('class.igx-day-item--selected')
    public get isSelectedCSS(): boolean {
        return !this.isDisabled && this.isSelectable && this.selected;
    }

    private get isSelectable(): boolean {
        return !this.isInactive || this.isWithinPreviewRange ||
            (this.isWithinRange && this.selection === "range");
    }

    @HostBinding('class.igx-day-item--inactive')
    public get isInactive(): boolean {
        return !this.isCurrentMonth;
    }

    @HostBinding('class.igx-day-item--hidden')
    public get isHidden(): boolean {
        return (this.hideLeading || this.hideTrailing) && this.isInactive;
    }

    @HostBinding('class.igx-day-item--current')
    public get isToday(): boolean {
        return !this.isInactive && this.date.equalTo(CalendarDay.today);
    }

    @HostBinding('class.igx-day-item--weekend')
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

    @HostBinding('class.igx-day-item--range')
    public get isWithinRangeCSS(): boolean {
        return !this.isSingleSelection && this.isWithinRange;
    }

    @HostBinding('class.igx-day-item--range-preview')
    public get isWithinPreviewRangeCSS(): boolean {
        return !this.isSingleSelection && this.isWithinPreviewRange;
    }

    @HostBinding('class.igx-day-item--special')
    public get isSpecial(): boolean {
        if (!this.specialDates) {
            return false;
        }

        return !this.isInactive && isDateInRanges(this.date, this.specialDates);
    }

    @HostBinding('class.igx-day-item--disabled')
    public get isDisabledCSS(): boolean {
        return this.isHidden || this.isDisabled;
    }

    @HostBinding('class.igx-day-item--single')
    public get isSingleSelection(): boolean {
        return this.selection !== CalendarSelection.RANGE;
    }

    /**
     * Returns the context for the day template.
     * The same object is updated in place on every call, and each date range is checked once.
     *
     * @hidden
     * @internal
     */
    public getTemplateContext(formattedDate: string): IgxCalendarDayTemplateContext {
        const context = this._templateContext;
        const disabled = this.isDisabled;

        if (context.date?.getTime() !== this.date.timestamp) {
            context.$implicit = context.date = this.date.native;
        }
        context.formattedDate = formattedDate;
        context.selected = !disabled && this.isSelectable && !!this.selected;
        context.disabled = disabled;
        context.special = this.isSpecial;
        context.today = this.isToday;
        context.weekend = this.isWeekend;
        context.currentMonth = this.isCurrentMonth;
        context.active = this.isActive;
        context.firstInRange = this.isFirstInRange;
        context.lastInRange = this.isLastInRange;
        context.withinRange = this.isWithinRangeCSS;
        context.withinPreviewRange = this.isWithinPreviewRange;

        return context;
    }

    private _selected = false;
    private _templateContext = {} as IgxCalendarDayTemplateContext;
}
