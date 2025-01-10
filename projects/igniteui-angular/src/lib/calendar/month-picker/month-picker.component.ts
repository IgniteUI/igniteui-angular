import {
    Component,
    HostListener,
    ViewChild,
    HostBinding,
    Input,
    ElementRef,
    AfterViewInit,
    OnDestroy,
    OnInit,
} from "@angular/core";
import { NgIf, NgTemplateOutlet, DatePipe } from "@angular/common";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import { IgxMonthsViewComponent } from "../months-view/months-view.component";
import { IgxYearsViewComponent } from "../years-view/years-view.component";
import { IgxDaysViewComponent } from "../days-view/days-view.component";
import { IgxIconComponent } from "../../icon/icon.component";
import { IgxCalendarView } from "../calendar";
import { CalendarDay } from "../common/model";
import { IgxCalendarBaseDirective } from "../calendar-base";
import { KeyboardNavigationService } from "../calendar.services";
import { formatToParts } from "../common/helpers";

let NEXT_ID = 0;
@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxMonthPickerComponent,
        },
        {
            multi: false,
            provide: KeyboardNavigationService
        },
    ],
    selector: "igx-month-picker",
    templateUrl: "month-picker.component.html",
    imports: [
        NgIf,
        NgTemplateOutlet,
        DatePipe,
        IgxIconComponent,
        IgxMonthsViewComponent,
        IgxYearsViewComponent,
    ]
})
export class IgxMonthPickerComponent extends IgxCalendarBaseDirective implements OnInit, AfterViewInit, OnDestroy {
    /**
     * Sets/gets the `id` of the month picker.
     * If not set, the `id` will have value `"igx-month-picker-0"`.
     */
    @HostBinding("attr.id")
    @Input()
    public id = `igx-month-picker-${NEXT_ID++}`;

    /**
     * @hidden
     * @internal
     */
    private _activeDescendant: number;

    /**
     * @hidden
     * @internal
     */
    @ViewChild("wrapper")
    public wrapper: ElementRef;

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding("class.igx-month-picker")
    public styleClass = true;

    /**
     * @hidden
     */
    @ViewChild("months", { read: IgxMonthsViewComponent })
    public monthsView: IgxMonthsViewComponent;

    /**
     * @hidden
     */
    @ViewChild("decade", { read: IgxYearsViewComponent })
    public dacadeView: IgxYearsViewComponent;

    /**
     * @hidden
     */
    @ViewChild("days", { read: IgxDaysViewComponent })
    public daysView: IgxDaysViewComponent;

    /**
     * @hidden
     */
    @ViewChild("yearsBtn")
    public yearsBtn: ElementRef;

    /**
     * @hidden
     */
    @HostListener("keydown.pageup", ["$event"])
    public previousPage(event?: KeyboardEvent) {
        event?.preventDefault();
        this.previousViewDate = this.viewDate;

        if (this.isDefaultView) {
            this.viewDate = CalendarDay.from(this.viewDate).add('year', -1).native;
        }

        if (this.isDecadeView) {
            this.viewDate = CalendarDay.from(this.viewDate).add('year', -15).native;
        }

        this.viewDateChanged.emit({
            previousValue: this.previousViewDate,
            currentValue: this.viewDate,
        });
    }

    /**
     * @hidden
     */
    @HostListener("keydown.pagedown", ["$event"])
    public nextPage(event?: KeyboardEvent) {
        event?.preventDefault();
        this.previousViewDate = this.viewDate;

        if (this.isDefaultView) {
            this.viewDate = CalendarDay.from(this.viewDate).add('year', 1).native;
        }

        if (this.isDecadeView) {
            this.viewDate = CalendarDay.from(this.viewDate).add('year', 15).native;
        }

        this.viewDateChanged.emit({
            previousValue: this.previousViewDate,
            currentValue: this.viewDate,
        });
    }

	/**
	 * @hidden
	 * @internal
	 */
	public onActiveViewDecadeKB(date: Date, event: KeyboardEvent, activeViewIdx: number) {
		super.activeViewDecadeKB(event, activeViewIdx);

		if (this.platform.isActivationKey(event)) {
            this.viewDate = date;
            this.wrapper.nativeElement.focus();
		}
	}

	/**
	 * @hidden
	 * @internal
	 */
	public onActiveViewDecade(event: MouseEvent, date: Date, activeViewIdx: number): void {
        event.preventDefault();

		super.activeViewDecade(activeViewIdx);
        this.viewDate = date;
	}

    /**
     * @hidden
     */
    public override activeViewDecadeKB(event: KeyboardEvent) {
        super.activeViewDecadeKB(event);

        if (event.key === this.platform.KEYMAP.ARROW_RIGHT) {
            this.nextPage(event);
        }

        if (event.key === this.platform.KEYMAP.ARROW_LEFT) {
            this.previousPage(event);
        }
    }

    /**
     * @hidden
     */
    public override activeViewDecade() {
        super.activeViewDecade();

        requestAnimationFrame(() => {
            this.dacadeView.el.nativeElement.focus();
        });
    }

    /**
     * @hidden
     */
    public changePageKB(event: KeyboardEvent, next = true) {
        if (this.platform.isActivationKey(event)) {
            event.stopPropagation();

            if (next) {
                this.nextPage();
            } else {
                this.previousPage();
            }
        }
    }

    /**
     * @hidden
     */
    public selectYear(event: Date) {
        this.previousViewDate = this.viewDate;

        this.viewDate = new Date(
            event.getFullYear(),
            event.getMonth(),
            event.getDate(),
        );

        this.activeView = IgxCalendarView.Year;
        this.wrapper.nativeElement.focus();
    }

    /**
     * @hidden
     */
    public selectMonth(event: Date) {
        this.selectDate(event);
        this.selected.emit(this.selectedDates);
    }

    /**
     * Selects a date.
     * ```typescript
     *  this.monthPicker.selectDate(new Date(`2018-06-12`));
     * ```
     */
    public override selectDate(value: Date) {
        if (!value) {
            return new Date();
        }

        super.selectDate(value);
        this.viewDate = value;
    }

    /**
     * @hidden
     */
    public getNextYear() {
        return CalendarDay.from(this.viewDate).add('year', 1).year;
    }

    /**
     * @hidden
     */
    public getPreviousYear() {
        return CalendarDay.from(this.viewDate).add('year', -1).year;
    }

    /**
     * @hidden
     */
    public updateDate(date: Date) {
        this.previousViewDate = this.viewDate;
        this.viewDate = CalendarDay.from(date).add('year', -this.activeViewIdx).native;

        if (this.isDefaultView) {
            this.viewDateChanged.emit({
                previousValue: this.previousViewDate,
                currentValue: this.viewDate,
            });
        }
    }

    @HostListener('mousedown', ['$event'])
    protected onMouseDown(event: MouseEvent) {
        event.stopPropagation();
        this.wrapper.nativeElement.focus();
    }

    private _showActiveDay: boolean;

	/**
	 * @hidden
	 * @internal
	 */
    protected set showActiveDay(value: boolean) {
        this._showActiveDay = value;
        this.cdr.detectChanges();
    }

    protected get showActiveDay() {
        return this._showActiveDay;
    }

    protected get activeDescendant(): number {
        if (this.activeView === 'month') {
            return (this.value as Date)?.getTime();
        }

        return this._activeDescendant ?? this.viewDate.getTime();
    }

    protected set activeDescendant(date: Date) {
        this._activeDescendant = date.getTime();
    }

    public override get isDefaultView(): boolean {
        return this.activeView === IgxCalendarView.Year;
    }

    public ngOnInit() {
        this.activeView = IgxCalendarView.Year;
    }

    public ngAfterViewInit() {
        this.keyboardNavigation
            .attachKeyboardHandlers(this.wrapper, this)
            .set("ArrowUp", this.onArrowUp)
            .set("ArrowDown", this.onArrowDown)
            .set("ArrowLeft", this.onArrowLeft)
            .set("ArrowRight", this.onArrowRight)
            .set("Enter", this.onEnter)
            .set(" ", this.onEnter)
            .set("Home", this.onHome)
            .set("End", this.onEnd)
            .set("PageUp", this.handlePageUp)
            .set("PageDown", this.handlePageDown);

        this.wrapper.nativeElement.addEventListener('focus', (event: FocusEvent) => this.onWrapperFocus(event));
        this.wrapper.nativeElement.addEventListener('blur', (event: FocusEvent) => this.onWrapperBlur(event));

        this.activeView$.subscribe((view) => {
            this.activeViewChanged.emit(view);

            this.viewDateChanged.emit({
                previousValue: this.previousViewDate,
                currentValue: this.viewDate
            });
        });
    }

    private onWrapperFocus(event: FocusEvent) {
        event.stopPropagation();
        this.showActiveDay = true;
    }

    private onWrapperBlur(event: FocusEvent) {
        event.stopPropagation();

        this.showActiveDay = false;
        this._onTouchedCallback();
    }

    private handlePageUpDown(event: KeyboardEvent, delta: number) {
        event.preventDefault();
        event.stopPropagation();

        if (this.isDefaultView && event.shiftKey) {
            this.viewDate = CalendarDay.from(this.viewDate).add('year', delta).native;
            this.cdr.detectChanges();
        } else {
            delta > 0 ? this.nextPage() : this.previousPage();
        }
    }

    private handlePageUp(event: KeyboardEvent) {
        this.handlePageUpDown(event, -1);
    }

    private handlePageDown(event: KeyboardEvent) {
        this.handlePageUpDown(event, 1);
    }

    private onArrowUp(event: KeyboardEvent) {
        if (this.isDefaultView) {
            this.monthsView.onKeydownArrowUp(event);
        }

        if (this.isDecadeView) {
            this.dacadeView.onKeydownArrowUp(event);
        }
    }

    private onArrowDown(event: KeyboardEvent) {
        if (this.isDefaultView) {
            this.monthsView.onKeydownArrowDown(event);
        }

        if (this.isDecadeView) {
            this.dacadeView.onKeydownArrowDown(event);
        }
    }

    private onArrowLeft(event: KeyboardEvent) {
        if (this.isDefaultView) {
            this.monthsView.onKeydownArrowLeft(event);
        }

        if (this.isDecadeView) {
            this.dacadeView.onKeydownArrowLeft(event);
        }
    }

    private onArrowRight(event: KeyboardEvent) {
        if (this.isDefaultView) {
            this.monthsView.onKeydownArrowRight(event);
        }

        if (this.isDecadeView) {
            this.dacadeView.onKeydownArrowRight(event);
        }
    }

    private onEnter(event: KeyboardEvent) {
        event.stopPropagation();

        if (this.isDefaultView) {
            this.monthsView.onKeydownEnter(event);
        }

        if (this.isDecadeView) {
            this.dacadeView.onKeydownEnter(event);
        }
    }

    private onHome(event: KeyboardEvent) {
        event.stopPropagation();
        if (this.isDefaultView) {
            this.monthsView.onKeydownHome(event);
        }

        if (this.isDecadeView) {
            this.dacadeView.onKeydownHome(event);
        }
    }

    private onEnd(event: KeyboardEvent) {
        event.stopPropagation();
        if (this.isDefaultView) {
            this.monthsView.onKeydownEnd(event);
        }

        if (this.isDecadeView) {
            this.dacadeView.onKeydownEnd(event);
        }
    }

	/**
	 * @hidden
	 * @internal
	 */
	public ngOnDestroy(): void {
        this.keyboardNavigation.detachKeyboardHandlers();
        this.wrapper?.nativeElement.removeEventListener('focus', this.onWrapperFocus);
        this.wrapper?.nativeElement.removeEventListener('blur', this.onWrapperBlur);
	}

	/**
	 * @hidden
	 * @internal
	 */
	public getPrevYearDate(date: Date): Date {
		return CalendarDay.from(date).add('year', -1).native;
	}

	/**
	 * @hidden
	 * @internal
	 */
	public getNextYearDate(date: Date): Date {
        return CalendarDay.from(date).add('year', 1).native;
	}

	/**
	 * Getter for the context object inside the calendar templates.
	 *
	 * @hidden
	 * @internal
	 */
	public getContext(i: number) {
        const date = CalendarDay.from(this.viewDate).add('month', i).native;
		return this.generateContext(date, i);
	}

	/**
	 * Helper method building and returning the context object inside the calendar templates.
	 *
	 * @hidden
	 * @internal
	 */
	private generateContext(value: Date | Date[], i?: number) {
        const construct = (date: Date, index: number) => ({
            index: index,
            date,
            ...formatToParts(date, this.locale, this.formatOptions, [
                "era",
                "year",
                "month",
                "day",
                "weekday",
            ]),
        });

        const formatObject = Array.isArray(value)
            ? value.map((date, index) => construct(date, index))
            : construct(value, i);

        return { $implicit: formatObject };
	}
}
