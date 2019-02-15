import {
    Component,
    Output,
    EventEmitter,
    Input,
    HostListener,
    ViewChildren,
    QueryList,
    HostBinding,
    DoCheck
} from '@angular/core';
import { ICalendarDate } from '../../calendar';
import { trigger, transition, useAnimation } from '@angular/animations';
import { slideInLeft, slideInRight } from '../../animations/main';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxDayItemComponent } from './day-item.component';
import { DateRangeDescriptor, DateRangeType } from '../../core/dates';
import { IgxCalendarBase } from '../calendar-base';

let NEXT_ID = 0;

@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxDaysViewComponent
        }
    ],
    animations: [
        trigger('animateChange', [
            transition('* => prev', useAnimation(slideInLeft, {
                params: {
                    fromPosition: 'translateX(-30%)'
                }
            })),
            transition('* => next', useAnimation(slideInRight, {
                params: {
                    fromPosition: 'translateX(30%)'
                }
            }))
        ])
    ],
    selector: 'igx-days-view',
    templateUrl: 'days-view.component.html'
})
export class IgxDaysViewComponent extends IgxCalendarBase implements DoCheck {
    /**
     * Sets/gets the `id` of the days view.
     * If not set, the `id` will have value `"igx-days-view-0"`.
     * ```html
     * <igx-days-view id="my-days-view"></igx-days-view>
     * ```
     * ```typescript
     * let daysViewId =  this.daysView.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-days-view-${NEXT_ID++}`;

    /**
     * @hidden
     */
    @Input()
    public animationAction: any = '';

    /**
     * @hidden
     */
    @Input()
    public changeDaysView = false;

    /**
     * @hidden
     */
    @Output()
    public onDateSelection = new EventEmitter<ICalendarDate>();

    /**
     * @hidden
     */
    @Output()
    public onViewChanged = new EventEmitter<Date>();

    /**
     * @hidden
     */
    @ViewChildren(IgxDayItemComponent, { read: IgxDayItemComponent })
    public dates: QueryList<IgxDayItemComponent>;

    /**
     * @hidden
     */
    private _nextDate: Date;

    /**
     * @hidden
     */
    private callback: (dates?, next?) => void;

    /**
     * @hidden
     */
    public isKeydownTrigger = false;

    /**
     * @hidden
     */
    public outOfRangeDates: DateRangeDescriptor[];

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding('class.igx-calendar')
    public styleClass = true;

    /**
     * The default `tabindex` attribute for the component.
     *
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * @hidden
     */
    public get getCalendarMonth(): ICalendarDate[][] {
        return this.calendarModel.monthdatescalendar(this.viewDate.getFullYear(), this.viewDate.getMonth(), true);
    }

    /**
     * @hidden
     */
    public ngDoCheck() {
        if (!this.changeDaysView && this.dates) {
            this.disableOutOfRangeDates();
        }
    }

    /**
     * Returns the locale representation of the date in the days view.
     *
     * @hidden
     */
    public formattedDate(value: Date): string {
        return this.formatterDay.format(value);
    }

    /**
     * @hidden
     */
    public generateWeekHeader(): string[] {
        const dayNames = [];
        const rv = this.calendarModel.monthdatescalendar(this.viewDate.getFullYear(), this.viewDate.getMonth())[0];
        for (const day of rv) {
            dayNames.push(this.formatterWeekday.format(day.date));
        }

        return dayNames;
    }

    /**
     * @hidden
     */
    public rowTracker(index, item): string {
        return `${item[index].date.getMonth()}${item[index].date.getDate()}`;
    }

    /**
     * @hidden
     */
    public dateTracker(index, item): string {
        return `${item.date.getMonth()}--${item.date.getDate()}`;
    }

    /**
     * @hidden
     */
    public isCurrentMonth(value: Date): boolean {
        return this.viewDate.getMonth() === value.getMonth();
    }

    /**
     * @hidden
     */
    public isCurrentYear(value: Date): boolean {
        return this.viewDate.getFullYear() === value.getFullYear();
    }

    /**
     *@hidden
     */
    public focusActiveDate() {
        let date = this.dates.find((d) => d.selected);

        if (!date) {
            date = this.dates.find((d) => d.isToday);
        }

        if (date) {
            date.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    public selectDay(event) {
        this.selectDateFromClient(event.date);
        this.onDateSelection.emit(event);
    }

    /**
     * @hidden
     */
    public animationDone(event, isLast: boolean) {
        if (isLast) {
            const date = this.dates.find((d) => d.selected);
            if (date && !this.isKeydownTrigger) {
                setTimeout(() => {
                    date.nativeElement.focus();
                }, parseInt(slideInRight.options.params.duration, 10));
            } else if (this.callback && (event.toState === 'next' || event.toState === 'prev')) {
                this.callback(this.dates, this._nextDate);
            }
        }
    }

    /**
     * @hidden
     */
    private focusPreviousUpDate(target, prevView = false) {
        const node = this.dates.find((date) => date.nativeElement === target);
        if (!node) { return; }

        const dates = this.dates.toArray();
        for (let index = dates.indexOf(node); index - 7 > -1; index -= 7) {
            const date = prevView ? dates[index] : dates[index - 7];
            if (!date.isDisabled) {
                if (!date.isOutOfRange) {
                    date.nativeElement.focus();
                    break;
                }
            }
        }

        if (this.changeDaysView && dates.indexOf(node) - 7 < 0) {
            const dayItem = dates[dates.indexOf(node)];
            this._nextDate = new Date(dayItem.date.date);

            this._nextDate.setDate(this._nextDate.getDate() - 7);

            this.isKeydownTrigger = true;
            this.animationAction = 'prev';

            this.callback = (items?, next?) => {
                const day = items.find((item) => item.date.date.getTime() === next.getTime());
                if (day) {
                    this.focusPreviousUpDate(day.nativeElement, true);
                }
            };

            this.onViewChanged.emit(this._nextDate);
        }
    }

    /**
     * @hidden
     */
    private focusNextDownDate(target, nextView = false) {
        const node = this.dates.find((date) => date.nativeElement === target);
        if (!node) { return; }

        const dates = this.dates.toArray();
        for (let index = dates.indexOf(node); index + 7 < this.dates.length; index += 7) {
            const date = nextView ? dates[index] : dates[index + 7];
            if (!date.isDisabled) {
                if (!date.isOutOfRange) {
                    date.nativeElement.focus();
                    break;
                }
            }
        }

        if (this.changeDaysView && dates.indexOf(node) + 7 > this.dates.length - 1) {
            const dayItem = dates[dates.indexOf(node)];
            this._nextDate = new Date(dayItem.date.date);

            this._nextDate.setDate(this._nextDate.getDate() + 7);

            this.isKeydownTrigger = true;
            this.animationAction = 'next';

            this.callback = (items?, next?) => {
                const day = items.find((item) => item.date.date.getTime() === next.getTime());
                if (day) {
                    this.focusNextDownDate(day.nativeElement, true);
                }
            };

            this.onViewChanged.emit(this._nextDate);
        }
    }

    /**
     * @hidden
     */
    private focusPreviousDate(target) {
        const node = this.dates.find((date) => date.nativeElement === target);
        if (!node) { return; }

        const dates = this.dates.toArray();
        for (let index = dates.indexOf(node); index > 0; index--) {
            const date = dates[index - 1];
            if (!date.isDisabled) {
                if (!date.isOutOfRange) {
                    date.nativeElement.focus();
                    break;
                }
            }
        }

        if (this.changeDaysView && dates.indexOf(node) === 0) {
            const dayItem = dates[dates.indexOf(node)];
            this._nextDate = new Date(dayItem.date.date);

            this.isKeydownTrigger = true;
            this.animationAction = 'prev';

            this.callback = (items?, next?) => {
                const day = items.find((item) => item.date.date.getTime() === next.getTime());
                if (day) {
                    this.focusPreviousDate(day.nativeElement);
                }
            };

            this.onViewChanged.emit(this._nextDate);
        }
    }

    /**
     * @hidden
     */
    private focusNextDate(target) {
        const node = this.dates.find((date) => date.nativeElement === target);
        if (!node) { return; }

        const dates = this.dates.toArray();

        for (let index = dates.indexOf(node); index < this.dates.length - 1; index++) {
            const date = dates[index + 1];
            if (!date.isDisabled) {
                if (!date.isOutOfRange) {
                    date.nativeElement.focus();
                    break;
                }
            }
        }

        if (this.changeDaysView && dates.indexOf(node) === this.dates.length - 1) {
            const dayItem = dates[dates.indexOf(node)];
            this._nextDate = new Date(dayItem.date.date);

            this.isKeydownTrigger = true;
            this.animationAction = 'next';

            this.callback = (items?, next?) => {
                const day = items.find((item) => item.date.date.getTime() === next.getTime());
                if (day) {
                    this.focusNextDate(day.nativeElement);
                }
            };

            this.onViewChanged.emit(this._nextDate);
        }
    }

    /**
     * @hidden
     */
    private disableOutOfRangeDates() {
        const dateRange = [];
        this.dates.toArray().forEach((date) => {
            if (!date.isCurrentMonth) {
                dateRange.push(date.date.date);
            }
        });

        this.outOfRangeDates = [{
            type: DateRangeType.Specific,
            dateRange: dateRange
        }];
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowup', ['$event'])
    public onKeydownArrowUp(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.focusPreviousUpDate(event.target);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowdown', ['$event'])
    public onKeydownArrowDown(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.focusNextDownDate(event.target);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowleft', ['$event'])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.focusPreviousDate(event.target);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowright', ['$event'])
    public onKeydownArrowRight(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.focusNextDate(event.target);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.home', ['$event'])
    public onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const dates = this.dates.filter(d => d.isCurrentMonth);
        for (let i = 0; i < dates.length; i++) {
            if (!dates[i].isDisabled) {
                dates[i].nativeElement.focus();
                break;
            }
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.end', ['$event'])
    public onKeydownEnd(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const dates = this.dates.filter(d => d.isCurrentMonth);
        for (let i = dates.length - 1; i >= 0; i--) {
            if (!dates[i].isDisabled) {
                dates[i].nativeElement.focus();
                break;
            }
        }
    }
}
