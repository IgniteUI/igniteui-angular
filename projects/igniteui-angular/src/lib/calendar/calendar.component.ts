import { transition, trigger, useAnimation } from '@angular/animations';
import {
    Component,
    ContentChild,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    ViewChild,
    ElementRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { fadeIn, scaleInCenter } from '../animations/main';
import {
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarSubheaderTemplateDirective
} from './calendar.directives';
import { IgxMonthsViewComponent } from './months-view/months-view.component';
import { KEYS } from '../core/utils';
import { ICalendarDate } from './calendar';
import { CalendarView, IgxMonthPickerBase } from './month-picker-base';

let NEXT_ID = 0;

/**
 * **Ignite UI for Angular Calendar** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/calendar.html)
 *
 * The Ignite UI Calendar provides an easy way to display a calendar and allow users to select dates using single, multiple
 * or range selection.
 *
 * Example:
 * ```html
 * <igx-calendar selection="range"></igx-calendar>
 * ```
 */
@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxCalendarComponent
        }
    ],
    animations: [
        trigger('animateView', [
            transition('void => 0', useAnimation(fadeIn)),
            transition('void => *', useAnimation(scaleInCenter, {
                params: {
                    duration: '.2s',
                    fromScale: .9
                }
            }))
        ])
    ],
    selector: 'igx-calendar',
    templateUrl: 'calendar.component.html'
})
export class IgxCalendarComponent extends IgxMonthPickerBase {
    /**
     * Sets/gets the `id` of the calendar.
     * If not set, the `id` will have value `"igx-calendar-0"`.
     * ```html
     * <igx-calendar id = "my-first-calendar"></igx-calendar>
     * ```
     * ```typescript
     * let calendarId =  this.calendar.id;
     * ```
     * @memberof IgxCalendarComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-calendar-${NEXT_ID++}`;

    /**
     * Sets/gets whether the calendar header will be in vertical position.
     * Default value is `false`.
     * ```html
     * <igx-calendar [vertical] = "true"></igx-calendar>
     * ```
     * ```typescript
     * let isVertical = this.calendar.vertical;
     * ```
     */
    @Input()
    public vertical = false;

    /**
     * The default `tabindex` attribute for the component.
     *
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * The default aria role attribute for the component.
     *
     * @hidden
     */
    @HostBinding('attr.role')
    public role = 'grid';

    /**
     * The default aria lebelled by attribute for the component.
     *
     * @hidden
     */
    @HostBinding('attr.aria-labelledby')
    public ariaLabelledBy = 'calendar';

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding('class.igx-calendar--vertical')
    get styleVerticalClass(): boolean {
        return this.vertical;
    }

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding('class.igx-calendar')
    public styleClass = true;

    /**
     * @hidden
     */
    @ViewChild('months', {read: IgxMonthsViewComponent})
    public monthsView: IgxMonthsViewComponent;

    /**
     * @hidden
     */
    @ViewChild('monthsBtn')
    public monthsBtn: ElementRef;

    /**
     * @hidden
     */
    get isYearView(): boolean {
        return this.activeView === CalendarView.YEAR;
    }

    /**
     * @hidden
     */
    get monthAction(): string {
        return this._monthAction;
    }
    /**
     * @hidden
     */
    set monthAction(val: string) {
        this._monthAction = val;
    }

    /**
     * Gets the header template.
     * ```typescript
     * let headerTemplate =  this.calendar.headerTeamplate;
     * ```
     * @memberof IgxCalendarComponent
     */
    get headerTemplate(): any {
        if (this.headerTemplateDirective) {
            return this.headerTemplateDirective.template;
        }
        return null;
    }

    /**
     * Sets the header template.
     * ```html
     * <igx-calendar headerTemplateDirective = "igxCalendarHeader"></igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
     */
    set headerTemplate(directive: any) {
        this.headerTemplateDirective = directive;
    }

    /**
     * Gets the subheader template.
     * ```typescript
     * let subheaderTemplate = this.calendar.subheaderTemplate;
     * ```
     */
    get subheaderTemplate(): any {
        if (this.subheaderTemplateDirective) {
            return this.subheaderTemplateDirective.template;
        }
        return null;
    }

    /**
     * Sets the subheader template.
     * ```html
     * <igx-calendar subheaderTemplate = "igxCalendarSubheader"></igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
     */
    set subheaderTemplate(directive: any) {
        this.subheaderTemplateDirective = directive;
    }

    /**
     * Gets the context for the template marked with the `igxCalendarHeader` directive.
     * ```typescript
     * let headerContext =  this.calendar.headerContext;
     * ```
     */
    get headerContext() {
        const date: Date = this.headerDate;
        return this.generateContext(date);
    }

    /**
     * Gets the context for the template marked with either `igxCalendarSubHeaderMonth`
     * or `igxCalendarSubHeaderYear` directive.
     * ```typescript
     * let context =  this.calendar.context;
     * ```
     */
    get context() {
        const date: Date = this.viewDate;
        return this.generateContext(date);
    }

    /**
     * @hidden
     */
    get headerDate(): Date {
        return this.selectedDates ? this.selectedDates : new Date();
    }

    /**
     * @hidden
     */
    @ContentChild(forwardRef(() => IgxCalendarHeaderTemplateDirective), { read: IgxCalendarHeaderTemplateDirective })
    private headerTemplateDirective: IgxCalendarHeaderTemplateDirective;

    /**
     * @hidden
     */
    // tslint:disable-next-line:max-line-length
    @ContentChild(forwardRef(() => IgxCalendarSubheaderTemplateDirective), { read: IgxCalendarSubheaderTemplateDirective })
    private subheaderTemplateDirective: IgxCalendarSubheaderTemplateDirective;

    /**
     *@hidden
     */
    private _monthAction = '';

    /**
     * Returns the locale representation of the month in the month view if enabled,
     * otherwise returns the default `Date.getMonth()` value.
     *
     * @hidden
     */
    public formattedMonth(value: Date): string {
        if (this.formatViews.month) {
            return this.formatterMonth.format(value);
        }
        return `${value.getMonth()}`;
    }

    /**
     * @hidden
     */
    public previousMonth(isKeydownTrigger: boolean = false) {
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'month', -1);
        this._monthAction = 'prev';

        if (this.daysView) {
            this.daysView.isKeydownTrigger = isKeydownTrigger;
        }
    }

    /**
     * @hidden
     */
    public previousMonthKB(event) {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            event.preventDefault();
            event.stopPropagation();

            this.previousMonth(true);
        }
    }

    /**
     * @hidden
     */
    public nextMonth(isKeydownTrigger: boolean = false) {
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'month', 1);
        this._monthAction = 'next';

        if (this.daysView) {
            this.daysView.isKeydownTrigger = isKeydownTrigger;
        }
    }

    /**
     * @hidden
     */
    public nextMonthKB(event) {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            event.preventDefault();
            event.stopPropagation();

            this.nextMonth(true);
        }
    }

    /**
     * @hidden
     */
    public getFormattedDate(): { weekday: string, monthday: string } {

        const date = this.headerDate;

        return {
            monthday: this.formatterMonthday.format(date),
            weekday: this.formatterWeekday.format(date),
        };
    }

    /**
     * @hidden
     */
    public childClicked(instance: ICalendarDate) {
        if (instance.isPrevMonth) {
            this.previousMonth();
        }

        if (instance.isNextMonth) {
            this.nextMonth();
        }

        this.selectDateFromClient(instance.date);
        this.onSelection.emit(this.selectedDates);
    }

    /**
     * @hidden
     */
    public viewChanged(event) {
        this.viewDate = this.calendarModel.timedelta(event, 'month', 0);
    }

    /**
     * @hidden
     */
    public changeMonth(event: Date) {
        this.viewDate = new Date(this.viewDate.getFullYear(), event.getMonth());
        this.activeView = CalendarView.DEFAULT;

        requestAnimationFrame(() => {
            this.monthsBtn.nativeElement.focus();
        });
    }

    /**
     * @hidden
     */
    public activeViewYear(): void {
        this.activeView = CalendarView.YEAR;
        requestAnimationFrame(() => {
            this.monthsView.dates.find((date) => date.isCurrentMonth).nativeElement.focus();
        });
    }

    /**
     * @hidden
     */
    public activeViewYearKB(event): void {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            event.preventDefault();
            this.activeViewYear();
        }
    }

    /**
     * Deselects date(s) (based on the selection type).
     *```typescript
     * this.calendar.deselectDate(new Date(`2018-06-12`));
     *````
     */
    public deselectDate(value?: Date | Date[]) {
        super.deselectDate(value);

        this.daysView.selectedDates = this.selectedDates;
        this._onChangeCallback(this.selectedDates);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pageup', ['$event'])
    public onKeydownPageUp(event: KeyboardEvent) {
        event.preventDefault();
        this.previousMonth();

        if (this.daysView) {
            this.daysView.isKeydownTrigger = true;
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pagedown', ['$event'])
    public onKeydownPageDown(event: KeyboardEvent) {
        event.preventDefault();
        this.nextMonth();

        if (this.daysView) {
            this.daysView.isKeydownTrigger = true;
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.shift.pageup', ['$event'])
    public onKeydownShiftPageUp(event: KeyboardEvent) {
        this.keydownPageUpHandler(event);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.shift.pagedown', ['$event'])
    public onKeydownShiftPageDown(event: KeyboardEvent) {
        this.keydownPageDownHandler(event);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.home', ['$event'])
    public onKeydownHome(event: KeyboardEvent) {
        if (this.daysView) {
            this.daysView.onKeydownHome(event);
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.end', ['$event'])
    public onKeydownEnd(event: KeyboardEvent) {
        if (this.daysView) {
            this.daysView.onKeydownEnd(event);
        }
    }

    /**
     * Helper method building and returning the context object inside
     * the calendar templates.
     * @hidden
     */
    private generateContext(value: Date) {
        const formatObject = {
            monthView: () => this.activeViewYear(),
            yearView: () => this.activeViewDecade(),
            ...this.calendarModel.formatToParts(value, this.locale, this.formatOptions,
                ['era', 'year', 'month', 'day', 'weekday'])
        };
        return { $implicit: formatObject };
    }
}
