import {
	Component,
	ContentChild,
	forwardRef,
	HostBinding,
	Input,
	ViewChild,
	ElementRef,
	AfterViewInit,
	ViewChildren,
	QueryList,
	OnDestroy,
	booleanAttribute,
    HostListener,
} from '@angular/core';
import { NgIf, NgTemplateOutlet, NgStyle, NgFor, DatePipe } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import {
	IgxCalendarHeaderTemplateDirective,
	IgxCalendarSubheaderTemplateDirective,
    IgxCalendarScrollPageDirective,
} from './calendar.directives';
import { IgxCalendarView, ScrollDirection } from './calendar';
import { IgxMonthPickerBaseDirective } from './month-picker/month-picker-base';
import { IgxMonthsViewComponent } from './months-view/months-view.component';
import { IgxYearsViewComponent } from './years-view/years-view.component';
import { IgxDaysViewComponent } from './days-view/days-view.component';
import { interval, Subscription } from 'rxjs';
import { takeUntil, debounce, skipLast, switchMap } from 'rxjs/operators';
import { IViewChangingEventArgs } from './days-view/days-view.interface';
import { IgxMonthViewSlotsCalendar, IgxGetViewDateCalendar } from './months-view.pipe';
import { IgxIconComponent } from '../icon/icon.component';
import { IgxDayItemComponent } from './days-view/day-item.component';
import { getClosestActiveDate } from './common/helpers';
import { CalendarDay } from './common/model';

let NEXT_ID = 0;

/**
 * Calendar provides a way to display date information.
 *
 * @igxModule IgxCalendarModule
 *
 * @igxTheme igx-calendar-theme, igx-icon-theme
 *
 * @igxKeywords calendar, datepicker, schedule, date
 *
 * @igxGroup Scheduling
 *
 * @remarks
 * The Ignite UI Calendar provides an easy way to display a calendar and allow users to select dates using single, multiple
 * or range selection.
 *
 * @example:
 * ```html
 * <igx-calendar selection="range"></igx-calendar>
 * ```
 */
@Component({
	providers: [
		{
			multi: true,
			provide: NG_VALUE_ACCESSOR,
			useExisting: IgxCalendarComponent,
		},
	],
	selector: 'igx-calendar',
	templateUrl: 'calendar.component.html',
	standalone: true,
	imports: [NgIf, NgTemplateOutlet, IgxCalendarScrollPageDirective, NgStyle, IgxIconComponent, NgFor, IgxDaysViewComponent, IgxMonthsViewComponent, IgxYearsViewComponent, DatePipe, IgxMonthViewSlotsCalendar, IgxGetViewDateCalendar],
})
export class IgxCalendarComponent extends IgxMonthPickerBaseDirective implements AfterViewInit, OnDestroy {
    /**
     * @hidden
     * @internal
     */
    @ViewChildren("wrapper", { read: HTMLElement })
    private wrapper: QueryList<HTMLElement>;

    /**
     * @hidden
     * @internal
     */
    @ViewChild("body")
    private body: ElementRef;

	/**
	 * Sets/gets the `id` of the calendar.
	 *
	 * @remarks
	 * If not set, the `id` will have value `"igx-calendar-0"`.
	 *
	 * @example
	 * ```html
	 * <igx-calendar id="my-first-calendar"></igx-calendar>
	 * ```
	 * @memberof IgxCalendarComponent
	 */
	@HostBinding('attr.id')
	@Input()
	public id = `igx-calendar-${ NEXT_ID++ }`;

    /**
     * Sets/gets whether the calendar has header.
     * Default value is `true`.
     *
     * @example
     * ```html
     * <igx-calendar [hasHeader]="false"></igx-calendar>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public hasHeader = true;

    /**
     * Sets/gets whether the calendar header will be in vertical position.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-calendar [vertical]="true"></igx-calendar>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public vertical = false;

	/**
	 * Sets/gets the number of month views displayed.
	 * Default value is `1`.
	 *
	 * @example
	 * ```html
	 * <igx-calendar [monthsViewNumber]="2"></igx-calendar>
	 * ```
	 */
	@Input()
	public get monthsViewNumber() {
		return this._monthsViewNumber;
	}

    public set monthsViewNumber(val: number) {
        if (val < 1) {
            return;
        }

		this._monthsViewNumber = val;
	}

    /**
     * Show/hide week numbers
     *
     * @example
     * ```html
     * <igx-calendar [showWeekNumbers]="true"></igx-calendar>
     * ``
     */
    @Input({ transform: booleanAttribute })
    public showWeekNumbers = false;

	/**
	 * The default css class applied to the component.
	 *
	 * @hidden
	 * @internal
	 */
	@HostBinding('class.igx-calendar--vertical')
	public get styleVerticalClass(): boolean {
		return this.vertical;
	}

	/**
	 * The default css class applied to the component.
	 *
	 * @hidden
	 * @internal
	 */
	@HostBinding('class.igx-calendar')
	public styleClass = true;

	/**
	 * ViewChild that represents the months view.
	 *
	 * @hidden
	 * @internal
	 */
	@ViewChild('months', { read: IgxMonthsViewComponent })
	public monthsView: IgxMonthsViewComponent;

	/**
	 * Month button, that displays the months view.
	 *
	 * @hidden
	 * @internal
	 */
	@ViewChildren('monthsBtn')
	public monthsBtns: QueryList<ElementRef>;

	/**
	 * ViewChild that represents the decade view.
	 *
	 * @hidden
	 * @internal
	 */
	@ViewChild('decade', { read: IgxYearsViewComponent })
	public dacadeView: IgxYearsViewComponent;

	/**
	 * ViewChild that represents the days view.
	 *
	 * @hidden
	 * @internal
	 */
	@ViewChild('days', { read: IgxDaysViewComponent })
	public daysView: IgxDaysViewComponent;

	/**
	 * ViewChildrenden representing all of the rendered days views.
	 *
	 * @hidden
	 * @internal
	 */
	@ViewChildren('days', { read: IgxDaysViewComponent })
	public monthViews: QueryList<IgxDaysViewComponent>;

	/**
	 * Button for previous month.
	 *
	 * @hidden
	 * @internal
	 */
	@ViewChild('prevPageBtn')
	public prevPageBtn: ElementRef;

	/**
	 * Button for next month.
	 *
	 * @hidden
	 * @internal
	 */
	@ViewChild('nextPageBtn')
	public nextPageBtn: ElementRef;

	/**
	 * Denote if the year view is active.
	 *
	 * @hidden
	 * @internal
	 */
	public get isYearView(): boolean {
		return this.activeView === IgxCalendarView.Year;
	}

	/**
	 * Gets the header template.
	 *
	 * @example
	 * ```typescript
	 * let headerTemplate =  this.calendar.headerTeamplate;
	 * ```
	 * @memberof IgxCalendarComponent
	 */
	public get headerTemplate(): any {
		if (this.headerTemplateDirective) {
			return this.headerTemplateDirective.template;
		}
		return null;
	}

	/**
	 * Sets the header template.
	 *
	 * @example
	 * ```html
	 * <igx-calendar headerTemplateDirective="igxCalendarHeader"></igx-calendar>
	 * ```
	 * @memberof IgxCalendarComponent
	 */
	public set headerTemplate(directive: any) {
		this.headerTemplateDirective = directive;
	}

	/**
	 * Gets the subheader template.
	 *
	 * @example
	 * ```typescript
	 * let subheaderTemplate = this.calendar.subheaderTemplate;
	 * ```
	 */
	public get subheaderTemplate(): any {
		if (this.subheaderTemplateDirective) {
			return this.subheaderTemplateDirective.template;
		}
		return null;
	}

	/**
	 * Sets the subheader template.
	 *
	 * @example
	 * ```html
	 * <igx-calendar subheaderTemplate="igxCalendarSubheader"></igx-calendar>
	 * ```
	 * @memberof IgxCalendarComponent
	 */
	public set subheaderTemplate(directive: any) {
		this.subheaderTemplateDirective = directive;
	}

	/**
	 * Gets the context for the template marked with the `igxCalendarHeader` directive.
	 *
	 * @example
	 * ```typescript
	 * let headerContext =  this.calendar.headerContext;
	 * ```
	 */
	public get headerContext() {
		const date: Date | Date[] = this.headerDate;

		if (Array.isArray(date)) {
			return;
		}
		return this.generateContext(date);
	}

	/**
	 * Gets the context for the template marked with either `igxCalendarSubHeaderMonth`
	 * or `igxCalendarSubHeaderYear` directive.
	 *
	 * @example
	 * ```typescript
	 * let context =  this.calendar.context;
	 * ```
	 */
	public get context() {
		const date: Date = this.viewDate;
		return this.generateContext(date);
	}

	/**
	 * Date displayed in header
	 *
	 * @hidden
	 * @internal
	 */
	public get headerDate(): Date | Date[] {
		return this.selectedDates ? this.selectedDates: new Date();
	}

    /**
     * @hidden
     * @internal
     */
    @ContentChild(forwardRef(() => IgxCalendarHeaderTemplateDirective), { read: IgxCalendarHeaderTemplateDirective, static: true })
    private headerTemplateDirective: IgxCalendarHeaderTemplateDirective;

    /**
     * @hidden
     * @internal
     */
    // eslint-disable-next-line max-len
    @ContentChild(forwardRef(() => IgxCalendarSubheaderTemplateDirective), { read: IgxCalendarSubheaderTemplateDirective, static: true })
    private subheaderTemplateDirective: IgxCalendarSubheaderTemplateDirective;

	/**
	 * @hidden
	 * @internal
	 */
	public activeDate = new Date();

	/**
	 * @hidden
	 * @internal
	 */
	protected previewRangeDate: Date;

	/**
	 * Used to apply the active date when the calendar view is changed
	 *
	 * @hidden
	 * @internal
	 */
	public nextDate: Date;

	/**
	 * Denote if the calendar view was changed with the keyboard
	 *
	 * @hidden
	 * @internal
	 */
	public isKeydownTrigger = false;

	/**
	 * @hidden
	 * @internal
	 */
	public callback: (next) => void;

	/**
	 * @hidden
	 * @internal
	 */
	private _monthsViewNumber = 1;

	/**
	 * @hidden
	 * @internal
	 */
	private _monthViewsChanges$: Subscription;

    @HostListener('mousedown', ['$event'])
    protected onMouseDown(event: MouseEvent) {
        event.stopPropagation();
        this.body.nativeElement.focus();
    }

	// /**
	//  * Keyboard navigation of the calendar
	//  *
	//  * @hidden
	//  * @internal
	//  */
	// @HostListener('keydown.pagedown', ['$event'])
	// @HostListener('keydown.pageup', ['$event'])
	// public onKeydownPageDown(event: KeyboardEvent) {
	// 	event.preventDefault();
	// 	if (!this.isDefaultView) {
	// 		return;
	// 	}
	//
	// 	const isPageDown = event.key==='PageDown';
	// 	const step = isPageDown ? 1: -1;
	// 	let monthView = this.daysView as IgxDaysViewComponent;
	// 	let activeDate;
	//
	// 	while (!activeDate && monthView) {
	// 		activeDate = monthView.dates.find((date) => date.nativeElement === document.activeElement);
	// 		monthView = monthView.nextMonthView;
	// 	}
	//
	// 	if (activeDate) {
	// 		this.nextDate = new Date(activeDate.date.date);
	//
	// 		let year = this.nextDate.getFullYear();
	//
	// 		let month = this.nextDate.getMonth() + step;
	//
	// 		if (isPageDown) {
	// 			if (month > 11) {
	// 				month = 0;
	// 				year += step;
	// 			}
	// 		} else {
	// 			if (month < 0) {
	// 				month = 11;
	// 				year += step;
	// 			}
	// 		}
	//
	// 		const range = monthRange(this.nextDate.getFullYear(), month);
	//
	// 		let day = this.nextDate.getDate();
	//
	// 		if (day > range[1]) {
	// 			day = range[1];
	// 		}
	//
	// 		this.nextDate.setDate(day);
	// 		this.nextDate.setMonth(month);
	// 		this.nextDate.setFullYear(year);
	//
	// 		this.callback = (next) => {
	// 			monthView = this.daysView as IgxDaysViewComponent;
	// 			let dayItem;
	//
	// 			while ((!dayItem && monthView) || (dayItem && !dayItem.isCurrentMonth)) {
	// 				dayItem = monthView.dates.find((d) => d.date.date.getTime()===next.getTime());
	// 				monthView = monthView.nextMonthView;
	// 			}
	//
	// 			if (dayItem && dayItem.isFocusable) {
	// 				dayItem.nativeElement.focus();
	// 			}
	// 		};
	// 	}
	//
	// 	if (isPageDown) {
	// 		if (event.repeat) {
	// 			requestAnimationFrame(() => this.nextPage(true));
	// 		} else {
	// 			this.nextPage(true);
	// 		}
	// 	} else {
	// 		if (event.repeat) {
	// 			requestAnimationFrame(() => this.previousPage(true));
	// 		} else {
	// 			this.previousPage(true);
	// 		}
	// 	}
	// }

	// /**
	//  * Keyboard navigation of the calendar
	//  *
	//  * @hidden
	//  * @internal
	//  */
	// @HostListener('keydown.shift.pageup', ['$event'])
	// @HostListener('keydown.shift.pagedown', ['$event'])
	// public onKeydownShiftPageUp(event: KeyboardEvent) {
	// 	event.preventDefault();
	//
	// 	if (!this.isDefaultView) {
	// 		return;
	// 	}
	//
	// 	const isPageDown = event.key === 'PageDown';
	// 	const step = isPageDown ? 1: -1;
	// 	this.previousViewDate = this.viewDate;
	// 	this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', step);
	//
	// 	this.isKeydownTrigger = true;
	//
	// 	let monthView = this.daysView as IgxDaysViewComponent;
	// 	let activeDate;
	//
	// 	while (!activeDate && monthView) {
	// 		activeDate = monthView.dates.find((date) => date.nativeElement===document.activeElement);
	// 		monthView = monthView.nextMonthView;
	// 	}
	//
	// 	if (activeDate) {
	// 		this.nextDate = new Date(activeDate.date.date);
	//
	// 		const year = this.nextDate.getFullYear() + step;
	//
	// 		const range = monthRange(year, this.nextDate.getMonth());
	//
	// 		let day = this.nextDate.getDate();
	// 		if (day > range[1]) {
	// 			day = range[1];
	// 		}
	//
	// 		this.nextDate.setDate(day);
	// 		this.nextDate.setFullYear(year);
	//
	// 		this.callback = (next) => {
	// 			monthView = this.daysView as IgxDaysViewComponent;
	// 			let dayItem;
	// 			while ((!dayItem && monthView) || (dayItem && !dayItem.isCurrentMonth)) {
	// 				dayItem = monthView.dates.find((d) => d.date.date.getTime()===next.getTime());
	// 				monthView = monthView.nextMonthView;
	// 			}
	// 			if (dayItem && dayItem.isFocusable) {
	// 				dayItem.nativeElement.focus();
	// 			}
	// 		};
	// 	}
	// }
	//
	// /**
	//  * Stop continuous navigation on mouseup event
	//  *
	//  * @hidden
	//  * @internal
	//  */
	// @HostListener('document:mouseup', ['$event'])
	// public onMouseUp(event: KeyboardEvent) {
	// 	if (this.pageScrollDirection !== ScrollDirection.NONE) {
	// 		this.stopPageScroll(event);
	// 	}
	// }

	public ngAfterViewInit() {
		this.setSiblingMonths(this.monthViews);
		this._monthViewsChanges$ = this.monthViews.changes.subscribe(c => {
			this.setSiblingMonths(c);
		});

        this.keyboardNavigation.attachKeyboardHandlers(this.body);
        this.keyboardNavigation.registerKeyHandler('ArrowUp', (event) => this.onArrowUp(event));
        this.keyboardNavigation.registerKeyHandler('ArrowDown', (event) => this.onArrowDown(event));
        this.keyboardNavigation.registerKeyHandler('ArrowLeft', (event) => this.onArrowLeft(event));
        this.keyboardNavigation.registerKeyHandler('ArrowRight', (event) => this.onArrowRight(event));
        this.keyboardNavigation.registerKeyHandler('Enter', (event) => this.onKeydownEnter(event));
        this.keyboardNavigation.registerKeyHandler('Home', (event) => this.onKeydownHome(event));
        this.keyboardNavigation.registerKeyHandler('End', (event) => this.onKeydownEnd(event));

        this.startPageScroll$.pipe(
            takeUntil(this.stopPageScroll$),
            switchMap(() => this.scrollPage$.pipe(
                skipLast(1),
                debounce(() => interval(300)),
                takeUntil(this.stopPageScroll$)
            ))).subscribe(() => {
                switch (this.pageScrollDirection) {
                    case ScrollDirection.PREV:
                        this.previousPage();
                        break;
                    case ScrollDirection.NEXT:
                        this.nextPage();
                        break;
                    case ScrollDirection.NONE:
                    default:
                        break;
                }
            });

        this.activeView$.subscribe((view) => {
			this.activeViewChanged.emit(view);
        });
    }

    private handleArrowKeydown(event: KeyboardEvent, delta: number) {
        event.preventDefault();
        event.stopPropagation();

        const date = getClosestActiveDate(
            CalendarDay.from(this.activeDate),
            delta,
            this.disabledDates,
        );

        this.activeDate = date.native;

        const dates = this.monthViews.toArray().flatMap(view => view.dates.toArray()).filter(d => d.isCurrentMonth);
        const isDateInView = dates.some(d => d.date.date.getTime() === this.activeDate.getTime());

        if (!isDateInView) {
            delta > 0 ? this.nextPage(true) : this.previousPage(true);
        }
    }

    private onArrowUp(event: KeyboardEvent) {
        if (this.activeView === IgxCalendarView.Month) {
            this.handleArrowKeydown(event, -7);
        }
    }

    private onArrowDown(event: KeyboardEvent) {
        if (this.activeView === IgxCalendarView.Month) {
            this.handleArrowKeydown(event, 7);
        }
    }

    private onArrowLeft(event: KeyboardEvent) {
        if (this.activeView === IgxCalendarView.Month) {
            this.handleArrowKeydown(event, -1);
        }
    }

    private onArrowRight(event: KeyboardEvent) {
        if (this.activeView === IgxCalendarView.Month) {
            this.handleArrowKeydown(event, 1);
        }
    }

    private onKeydownEnter(event: KeyboardEvent) {
        event.stopPropagation();
        this.selectDateFromClient(this.activeDate);
        this.selected.emit(this.selectedDates);

        // TODO: Should clear the preview range on enter
        // this.clearPreviewRange();
    }

    private onKeydownHome(event: KeyboardEvent) {
        event.stopPropagation();

        const dates = this.monthViews.toArray()
            .flatMap((view) => view.dates.toArray())
            .filter((d) => d.isCurrentMonth && d.isFocusable);

        this.activeDate = dates.at(0).date.date;
    }

    private onKeydownEnd(event: KeyboardEvent) {
        event.stopPropagation();

        const dates = this.monthViews.toArray()
            .flatMap((view) => view.dates.toArray())
            .filter((d) => d.isCurrentMonth && d.isFocusable);

        this.activeDate = dates.at(-1).date.date;
    }

	/**
	 * Returns the locale representation of the month in the month view if enabled,
	 * otherwise returns the default `Date.getMonth()` value.
	 *
	 * @hidden
	 * @internal
	 */
	public formattedMonth(value: Date): string {
		if (this.formatViews.month) {
			return this.formatterMonth.format(value);
		}

		return `${ value.getMonth() }`;
	}

	/**
	 * Change to previous page
	 *
	 * @hidden
	 * @internal
	 */
	public previousPage(isKeydownTrigger = false) {
		if (isKeydownTrigger && this.pageScrollDirection === ScrollDirection.NEXT) {
			return;
		}

        this.changePage(isKeydownTrigger, ScrollDirection.PREV);
	}

	/**
	 * Change to next page
	 *
	 * @hidden
	 * @internal
	 */
	public nextPage(isKeydownTrigger = false) {
		if (isKeydownTrigger && this.pageScrollDirection === ScrollDirection.PREV) {
			return;
		}

        this.changePage(isKeydownTrigger, ScrollDirection.NEXT);
	}

	/**
	 * Changes the current page
	 *
	 * @hidden
	 * @internal
	 */
    protected changePage(isKeydownTrigger = false, direction: ScrollDirection) {
		this.previousViewDate = this.viewDate;
		this.isKeydownTrigger = isKeydownTrigger;

        if (!this.isKeydownTrigger) {
            requestAnimationFrame(() => {
                this.resetActiveDate();
            });
        }

        switch (this.activeView) {
            case "month":
                if (direction === ScrollDirection.PREV) {
                    this.viewDate = this.calendarModel.getPrevMonth(this.viewDate)
                }

                if (direction === ScrollDirection.NEXT) {
                    this.viewDate = this.calendarModel.getNextMonth(this.viewDate);
                }

                break;
            case "year":
                if (direction === ScrollDirection.PREV) {
                    this.viewDate = this.calendarModel.getPrevYear(this.viewDate)
                }

                if (direction === ScrollDirection.NEXT) {
                    this.viewDate = this.calendarModel.getNextYear(this.viewDate);
                }

                break;
            case "decade":
                if (direction === ScrollDirection.PREV) {
                    this.viewDate = this.calendarModel.getPrevYears(this.viewDate)
                }

                if (direction === ScrollDirection.NEXT) {
                    this.viewDate = this.calendarModel.getNextYears(this.viewDate);
                }

                break;
        }
    }

	/**
	 * Continious navigation through the previous pages
	 *
	 * @hidden
	 * @internal
	 */
	public startPrevPageScroll = (isKeydownTrigger = false) => {
		this.startPageScroll$.next();
		this.pageScrollDirection = ScrollDirection.PREV;
		this.previousPage(isKeydownTrigger);
	}

	/**
	 * Continious navigation through the next pages
	 *
	 * @hidden
	 * @internal
	 */
	public startNextPageScroll = (isKeydownTrigger = false) => {
		this.startPageScroll$.next();
		this.pageScrollDirection = ScrollDirection.NEXT;
		this.nextPage(isKeydownTrigger);
	}

	/**
	 * Stop continuous navigation
	 *
	 * @hidden
	 * @internal
	 */
	public stopPageScroll = (event: KeyboardEvent) => {
		event.stopPropagation();

        // We call the stopPageScroll on the view instead of directly on the calendar as otherwise a
		// strange bug is introduced --> after changing number of months, continuous scrolling on mouse click stops working
		this.stopPageScroll$.next(true);
		this.stopPageScroll$.complete();


		if (this.pageScrollDirection === ScrollDirection.PREV) {
			this.prevPageBtn.nativeElement.focus();
		} else if (this.pageScrollDirection === ScrollDirection.NEXT) {
			this.nextPageBtn.nativeElement.focus();
		}

		if (this.platform.isActivationKey(event)) {
			this.resetActiveDate();
		}

		this.pageScrollDirection = ScrollDirection.NONE;
	}

	public suppressBlur() {
		this.monthViews?.forEach(d => d.shouldResetDate = false);
		if (this.daysView) {
			this.daysView.shouldResetDate = false;
		}
	}

	/**
	 * @hidden
	 * @internal
	 */
	public onActiveViewDecade(args: Date, activeViewIdx: number) {
		super.activeViewDecade(activeViewIdx);

		requestAnimationFrame(() => {
			if (this.dacadeView) {
				this.dacadeView.date = args;
			}
		});
	}

	/**
	 * @hidden
	 * @internal
	 */
	public onActiveViewDecadeKB(event, args: Date, activeViewIdx: number) {
		super.activeViewDecadeKB(event, activeViewIdx);

        requestAnimationFrame(() => {
            if (this.dacadeView) {
				this.dacadeView.date = args;
                this.dacadeView.focusActiveDate();
            }
        });
	}

	/**
	 * @hidden
	 * @internal
	 */
    public onYearsViewClick(event: MouseEvent) {
        const path = event.composed ? event.composedPath() : [event.target];
        const years = this.dacadeView.viewItems.toArray();
        const validTarget = years.some(year => path.includes(year.nativeElement));

        if (validTarget) {
            this.activeView = IgxCalendarView.Year;
        }
    }

	/**
	 * @hidden
	 * @internal
	 */
    public onYearsViewKeydown(event: KeyboardEvent) {
        if (this.platform.isActivationKey(event)) {
            this.activeView = IgxCalendarView.Year;

            requestAnimationFrame(() => {
                if (this.monthsView) {
                    // this.monthsView.focusActiveDate();
                }
            });
        }
    }

	/**
	 * @hidden
	 * @internal
	 */
	public getFormattedDate(): { weekday: string; monthday: string } {
		const date = this.headerDate;

		return {
			monthday: this.formatterMonthday.format(date),
			weekday: this.formatterWeekday.format(date),
		};
	}

	public getFormattedRange(): { start: string; end: string } {
		const dates = this.selectedDates as unknown as Date[];

		return {
			start: this.formatterRangeday.format(dates[0]),
			end: this.formatterRangeday.format(dates[dates.length - 1])
		};
	}

	/**
	 * Handles invoked on date selection
	 *
	 * @hidden
	 * @internal
	 */
	public childClicked(date: Date) {
		// selectDateFromClient is called both here and in days-view.component
		// when multiple months are in view, 'shiftKey' and 'lastSelectedDate'
		// should be set before and after selectDateFromClient
		// in order all views to have the same values for these properties
		this.monthViews.forEach(m => {
			m.shiftKey = this.shiftKey;
			m.lastSelectedDate = this.lastSelectedDate;
		});

		this.selectDateFromClient(date);

		if (this.selection === 'multi' && this._deselectDate) {
			this.deselectDateInMonthViews(date);
		}

		this.selected.emit(this.selectedDates);

		this.monthViews.forEach(m => {
			m.shiftKey = this.shiftKey;
			m.lastSelectedDate = this.lastSelectedDate;
		});
	}

	/**
	 * @hidden
	 * @internal
	 */
	public updateDay(args: IViewChangingEventArgs) {
		this.isKeydownTrigger = true;
		this.nextDate = args.nextDate;
		this.previousViewDate = this.viewDate;
		this.viewDate = this.nextDate;

        this.viewDateChanged.emit({
            previousValue: this.previousViewDate,
            currentValue: this.viewDate
        });
	}

	/**
	 * @hidden
	 * @intenal
	 */
	public changeMonth(event: Date) {
		this.previousViewDate = this.viewDate;
		this.viewDate = this.calendarModel.getFirstViewDate(event, 'month', this.activeViewIdx);
		this.activeView = IgxCalendarView.Month;

        requestAnimationFrame(() => {
            this.resetActiveDate();
            this.focusDay();
        });
	}

	/**
	 * @hidden
	 * @intenal
	 */
    public override changeYear(event: Date) {
        this.previousViewDate = this.viewDate;
        this.viewDate = this.calendarModel.getFirstViewDate(event, 'month', this.activeViewIdx);
    }

	/**
	 * @hidden
	 * @intenal
	 */
	public updateYear(event: Date) {
		this.previousViewDate = this.viewDate;
		this.viewDate = this.calendarModel.getFirstViewDate(event, 'year', this.activeViewIdx);
	}

	/**
	 * @hidden
	 * @internal
	 */
	public onActiveViewYear(args: Date, activeViewIdx: number): void {
		this.activeView = IgxCalendarView.Year;
		this.activeViewIdx = activeViewIdx;

		requestAnimationFrame(() => {
			this.monthsView.date = args;
		});
	}

	/**
	 * @hidden
	 * @internal
	 */
	public onActiveViewYearKB(args: Date, event: KeyboardEvent, activeViewIdx: number): void {
		if (this.platform.isActivationKey(event)) {
			event.preventDefault();
            this.activeView = IgxCalendarView.Year;
            this.activeViewIdx = activeViewIdx;

            requestAnimationFrame(() => {
                if (this.monthsView) {
			        this.monthsView.date = args;
                    // this.monthsView.focusActiveDate();
                }
            });
		}
	}

	/**
	 * Deselects date(s) (based on the selection type).
	 *
	 * @example
	 * ```typescript
	 *  this.calendar.deselectDate(new Date(`2018-06-12`));
	 * ````
	 */
	public override deselectDate(value?: Date | Date[]) {
		super.deselectDate(value);

		this.monthViews.forEach((view) => {
			view.selectedDates = this.selectedDates;
			view.rangeStarted = false;
		});
		this._onChangeCallback(this.selectedDates);
	}

	/**
	 * @hidden
	 * @internal
	 */
	public getViewDate(i: number): Date {
		const date = this.calendarModel.timedelta(this.viewDate, 'month', i);
		return date;
	}

	/**
	 * Getter for the context object inside the calendar templates.
	 *
	 * @hidden
	 * @internal
	 */
	public getContext(i: number) {
		const date = this.getViewDate(i);
		return this.generateContext(date, i);
	}

	/**
	 * @hidden
	 * @internal
	 */
	public resetActiveDate() {
		if (this.activeView !== IgxCalendarView.Month) {
			return;
		}

        let idx = 0;
		const dates = this.getMonthDays();

        for (let i = 0; i < dates.length - 1; i++) {
            const date = dates[i].date.date.getDate();
            const activeDate = new Date(this.activeDate).getDate();

            if (activeDate === date) {
                idx = i;
            }
        }


        if (dates[idx]) {
            this.activeDate = dates[idx].date.date;
        }
	}

	/**
	 * @hidden
	 * @internal
	 */
	public ngOnDestroy(): void {
		if (this._monthViewsChanges$) {
			this._monthViewsChanges$.unsubscribe();
		}

        this.keyboardNavigation.detachKeyboardHandlers();
	}

	/**
	 * @hidden
	 * @internal
	 */
	public getPrevMonth(date): Date {
		return this.calendarModel.getPrevMonth(date);
	}

	/**
	 * @hidden
	 * @internal
	 */
	public getNextMonth(date, viewIndex): Date {
		return this.calendarModel.getDateByView(date, 'Month', viewIndex);
	}

	/**
	 * Helper method building and returning the context object inside
	 * the calendar templates.
	 *
	 * @hidden
	 * @internal
	 */
	private generateContext(value: Date | Date[], i?: number) {
		let formatObject;

		if (Array.isArray(value)) {
			formatObject = value.map((date, index) => {
				return {
					index: index,
					monthView: () => this.onActiveViewYear(date, index),
					yearView: () => this.onActiveViewDecade(date, index),
					...this.calendarModel.formatToParts(date, this.locale, this.formatOptions,
						['era', 'year', 'month', 'day', 'weekday']),
				};
			});
		} else {
			formatObject = {
				index: i,
				monthView: () => this.onActiveViewYear(value, i),
				yearView: () => this.onActiveViewDecade(value, i),
				...this.calendarModel.formatToParts(value, this.locale, this.formatOptions,
					['era', 'year', 'month', 'day', 'weekday']),
			};
		}

		return { $implicit: formatObject };
	}

	/**
	 * Helper method that sets references for prev/next months for each month in the view
	 *
	 * @hidden
	 * @internal
	 */
	private setSiblingMonths(monthViews: QueryList<IgxDaysViewComponent>) {
		monthViews.forEach((item, index) => {
			const prevMonthView = this.getMonthView(index - 1);
			const nextMonthView = this.getMonthView(index + 1);
			item.nextMonthView = nextMonthView;
			item.prevMonthView = prevMonthView;
		});
	}

    /**
     * Helper method returning previous/next day views
     *
     * @hidden
     * @internal
     */
    private getMonthView(index: number): IgxDaysViewComponent {
        if (index === -1 || index === this.monthViews.length) {
            return null;
        } else {
            return this.monthViews.toArray()[index];
        }
    }

    private getMonthDays(): IgxDayItemComponent[] {
		let dates = [];

		this.monthViews.map(mv => mv.dates).forEach(days => {
			dates = dates.concat(days.toArray()).filter(
                day => day.isCurrentMonth && day.isFocusable
            )
		});

        return dates;
    }

    /**
     * Helper method that does deselection for all month views when selection is "multi"
     * If not called, selection in other month views stays
     *
     * @hidden
     * @internal
     */
    private deselectDateInMonthViews(value: Date) {
        this.monthViews.forEach(m => {
            m.deselectMultipleInMonth(value);
        });
    }

    private focusDay() {
        const day = this.getMonthDays().find(
            d => d.date.date.getDate() === this.activeDate.getDate()
        );

        if (day) {
            day.nativeElement.focus();
        }
    }
}
