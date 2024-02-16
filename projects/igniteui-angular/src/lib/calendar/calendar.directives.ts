/**
 * This file contains all the directives used by the @link IgxCalendarComponent.
 * Except for the directives which are used for templating the calendar itself
 * you should generally not use them directly.
 *
 * @preferred
 */
import {
    Directive,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    InjectionToken,
    Output,
    TemplateRef,
    ElementRef,
    AfterViewInit,
    OnDestroy,
    NgZone
} from '@angular/core';
import { fromEvent, Subject, interval } from 'rxjs';
import { takeUntil, debounce, tap } from 'rxjs/operators';
import { PlatformUtil } from '../core/utils';

export const IGX_CALENDAR_VIEW_ITEM =
    new InjectionToken<IgxCalendarMonthDirective | IgxCalendarYearDirective>('IgxCalendarViewItem');

/**
 * @hidden
 */
@Directive({
    selector: '[igxCalendarYear]',
    providers: [
        { provide: IGX_CALENDAR_VIEW_ITEM, useExisting: IgxCalendarYearDirective }
    ],
    standalone: true
})
export class IgxCalendarYearDirective {
    @Input('igxCalendarYear')
    public value: Date;

    @Input()
    public date: Date;

    @Output()
    public yearSelection = new EventEmitter<Date>();

    @HostBinding('class.igx-years-view__year--current')
    public get currentCSS(): boolean {
        return this.isCurrentYear;
    }

    @HostBinding('attr.role')
    public get role(): string {
        return this.isCurrentYear ? 'spinbutton' : null;
    }

    @HostBinding('attr.aria-valuenow')
    public get valuenow(): number {
        return this.isCurrentYear ? this.date.getFullYear() : null;
    }

    @HostBinding('attr.tabindex')
    public get tabIndex(): number {
        return this.value.getFullYear() === this.date.getFullYear() ? 0 : -1;
    }


    public get isCurrentYear(): boolean {
        const today = new Date(Date.now());
        const date = this.value;

        return (date.getFullYear() === today.getFullYear() &&
            date.getFullYear() === today.getFullYear()
        );
    }

    public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor(public elementRef: ElementRef) { }

    @HostListener('click')
    public onClick() {
        this.yearSelection.emit(this.value);
    }
}

@Directive({
    selector: '[igxCalendarMonth]',
    providers: [
        { provide: IGX_CALENDAR_VIEW_ITEM, useExisting: IgxCalendarMonthDirective }
    ],
    standalone: true
})
export class IgxCalendarMonthDirective {

    @Input('igxCalendarMonth')
    public value: Date;

    @Input()
    public date: Date;

    @Input()
    public index;

    @Output()
    public monthSelection = new EventEmitter<Date>();

    @HostBinding('class.igx-months-view__month--current')
    public get currentCSS(): boolean {
        return this.isCurrentMonth;
    }

    public get isCurrentMonth(): boolean {
        const today = new Date(Date.now());
        const date = this.value;

        return (date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth()
        );
    }

	public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor(public elementRef: ElementRef) { }

    @HostListener('click')
    public onClick() {
        const date = new Date(this.value.getFullYear(), this.value.getMonth(), this.date.getDate());
        this.monthSelection.emit(date);
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxCalendarHeader]',
    standalone: true
})
export class IgxCalendarHeaderTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxCalendarSubheader]',
    standalone: true
})
export class IgxCalendarSubheaderTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxCalendarScrollPage]',
    standalone: true
})
export class IgxCalendarScrollPageDirective implements AfterViewInit, OnDestroy {
    /**
     * A callback function to be invoked when increment/decrement page is triggered.
     *
     * @hidden
     */
    @Input()
    public startScroll: (keydown?: boolean) => void;

    /**
     * A callback function to be invoked when increment/decrement page stops.
     *
     * @hidden
     */
    @Input()
    public stopScroll: (event: any) => void;

    /**
     * @hidden
     */
    private destroy$ = new Subject<boolean>();

    constructor(private element: ElementRef, private zone: NgZone, protected platform: PlatformUtil) { }

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
                    if (this.platform.isActivationKey(event)) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }),
                debounce(() => interval(100)),
                takeUntil(this.destroy$)
            ).subscribe((event: KeyboardEvent) => {
                if (this.platform.isActivationKey(event)) {
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
}
