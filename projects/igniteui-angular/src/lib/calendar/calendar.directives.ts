/**
 * This file contains all the directives used by the @link IgxCalendarComponent.
 * Except for the directives which are used for templating the calendar itself
 * you should generally not use them directly.
 * @preferred
 */
import {
    Directive,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    Output,
    TemplateRef,
    ElementRef
} from '@angular/core';

/**
 * @hidden
 */
@Directive({
    selector: '[igxCalendarYear]'
})
export class IgxCalendarYearDirective {

    @Input('igxCalendarYear')
    public value: Date;

    @Input()
    public date: Date;

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
        return this.date.getFullYear() === this.value.getFullYear();
    }

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
    public date: Date;

    @Input()
    public index;

    @Output()
    public onMonthSelection = new EventEmitter<Date>();

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @HostBinding('class.igx-calendar__month')
    get defaultCSS(): boolean {
        return !this.isCurrentMonth;
    }

    @HostBinding('class.igx-calendar__month--current')
    get currentCSS(): boolean {
        return this.isCurrentMonth;
    }

    get isCurrentMonth(): boolean {
        return this.date.getMonth() === this.value.getMonth();
    }

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor(public elementRef: ElementRef) {}

    @HostListener('click')
    public onClick() {
        const date = new Date(this.value.getFullYear(), this.value.getMonth(), this.date.getDate());
        this.onMonthSelection.emit(date);
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
