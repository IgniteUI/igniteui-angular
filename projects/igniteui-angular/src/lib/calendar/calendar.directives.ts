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
import { CalendarDay } from './common/model';

export const IGX_CALENDAR_VIEW_ITEM =
    new InjectionToken<IgxCalendarMonthDirective | IgxCalendarYearDirective>('IgxCalendarViewItem');

@Directive()
export abstract class IgxCalendarViewBaseDirective {
    @Input()
    public value: Date;

    @Input()
    public date: Date;

    @Input()
    public showActive = false;

    @Output()
    public itemSelection = new EventEmitter<Date>();

    public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor(public elementRef: ElementRef) { }

    @HostListener('mousedown', ['$event'])
    public onMouseDown(event: MouseEvent) {
        event.preventDefault();
        this.itemSelection.emit(this.value);
    }

    public abstract get isCurrent(): boolean;
    public abstract get isSelected(): boolean;
    public abstract get isActive(): boolean;
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxCalendarYear]',
    providers: [
        { provide: IGX_CALENDAR_VIEW_ITEM, useExisting: IgxCalendarYearDirective }
    ],
    exportAs: 'igxCalendarYear',
    standalone: true
})
export class IgxCalendarYearDirective extends IgxCalendarViewBaseDirective {
    @HostBinding('class.igx-calendar-view__item--current')
    public get isCurrent(): boolean {
        return CalendarDay.today.year === this.value.getFullYear();
    }

    @HostBinding('class.igx-calendar-view__item--selected')
    public get isSelected(): boolean {
        return this.value.getFullYear() === this.date.getFullYear();
    }

    @HostBinding('class.igx-calendar-view__item--active')
    public get isActive(): boolean {
        return this.isSelected && this.showActive;
    }
}

@Directive({
    selector: '[igxCalendarMonth]',
    providers: [
        { provide: IGX_CALENDAR_VIEW_ITEM, useExisting: IgxCalendarMonthDirective }
    ],
    exportAs: 'igxCalendarMonth',
    standalone: true
})
export class IgxCalendarMonthDirective extends IgxCalendarViewBaseDirective {
    @HostBinding('class.igx-calendar-view__item--current')
    public get isCurrent(): boolean {
        const today = CalendarDay.today;
        const date = CalendarDay.from(this.value);
        return date.year === today.year && date.month === today.month;
    }

    @HostBinding('class.igx-calendar-view__item--selected')
    public get isSelected(): boolean {
        return (this.value.getFullYear() === this.date.getFullYear() &&
            this.value.getMonth() === this.date.getMonth()
        );
    }

    @HostBinding('class.igx-calendar-view__item--active')
    public get isActive(): boolean {
        return this.isSelected && this.showActive;
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxCalendarHeaderTitle]',
    standalone: true
})
export class IgxCalendarHeaderTitleTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
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
    @HostListener('mousedown', ['$event'])
    public onMouseDown(event: MouseEvent) {
        event.preventDefault();
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
