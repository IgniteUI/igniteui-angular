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
    ElementRef,
    AfterViewInit,
    OnDestroy,
    NgZone
} from '@angular/core';
import { fromEvent, Subject, interval } from 'rxjs';
import { takeUntil, debounce, tap } from 'rxjs/operators';
import { KEYS } from '../core/utils';

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
    public get defaultCSS(): boolean {
        return !this.isCurrentYear;
    }

    @HostBinding('class.igx-calendar__year--current')
    public get currentCSS(): boolean {
        return this.isCurrentYear;
    }

    public get isCurrentYear(): boolean {
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
    public get defaultCSS(): boolean {
        return !this.isCurrentMonth;
    }

    @HostBinding('class.igx-calendar__month--current')
    public get currentCSS(): boolean {
        return this.isCurrentMonth;
    }

    public get isCurrentMonth(): boolean {
        return this.date.getMonth() === this.value.getMonth();
    }

    public get nativeElement() {
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

/**
 * @hidden
 */
@Directive({
    selector: '[igxCalendarScrollMonth]'
})
export class IgxCalendarScrollMonthDirective implements AfterViewInit, OnDestroy {

    /**
     * A callback function to be invoked when month increment/decrement starts.
     * @hidden
     */
    @Input()
    public startScroll: (keydown?: boolean) => {};

    /**
     * A callback function to be invoked when month increment/decrement stops.
     * @hidden
     */
    @Input()
    public stopScroll: (event: any) => {};

    /**
     * @hidden
     */
    private destroy$ = new Subject<boolean>();

    constructor(private element: ElementRef, private zone: NgZone) { }

    /**
     * @hidden
     */
    public ngAfterViewInit() {

        fromEvent(this.element.nativeElement, 'keyup').pipe(
            debounce(() => interval(100)),
            takeUntil(this.destroy$)
        ).subscribe((event: KeyboardEvent) => {
            this.stopScroll(event);
        });

        this.zone.runOutsideAngular(() => {
            fromEvent(this.element.nativeElement, 'keydown').pipe(
                tap((event: KeyboardEvent) => {
                    if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }),
                debounce(() => interval(100)),
                takeUntil(this.destroy$)
            ).subscribe((event: KeyboardEvent) => {
                if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
                    this.zone.run(() => this.startScroll(true));
                }
            });
        });

    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden
     */
    @HostListener('mousedown')
    public onMouseDown() {
        this.startScroll();
    }

    /**
     * @hidden
     */
    @HostListener('mouseup', ['$event'])
    public onMouseUp(event: MouseEvent) {
        this.stopScroll(event);
    }
}
