import {
    Component,
    HostListener,
    ViewChild,
    HostBinding,
    Input,
    ElementRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn, scaleInCenter, slideInLeft, slideInRight } from '../../animations/main';
import { KEYS } from '../../core/utils';
import { IgxMonthsViewComponent } from '../months-view/months-view.component';
import { IgxMonthPickerBaseDirective, IgxCalendarView } from '../month-picker-base';
import { IgxYearsViewComponent } from '../years-view/years-view.component';
import { IgxDaysViewComponent } from '../days-view/days-view.component';
import { ScrollMonth } from '../calendar-base';

let NEXT_ID = 0;
@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxMonthPickerComponent
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
        ]),
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
    selector: 'igx-month-picker',
    templateUrl: 'month-picker.component.html'
})
export class IgxMonthPickerComponent extends IgxMonthPickerBaseDirective {
    /**
     * Sets/gets the `id` of the month picker.
     * If not set, the `id` will have value `"igx-month-picker-0"`.
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-month-picker-${NEXT_ID++}`;

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
    @ViewChild('months', { read: IgxMonthsViewComponent })
    public monthsView: IgxMonthsViewComponent;

    /**
     * @hidden
     */
    @ViewChild('decade', { read: IgxYearsViewComponent })
    public dacadeView: IgxYearsViewComponent;

    /**
     * @hidden
     */
    @ViewChild('days', { read: IgxDaysViewComponent })
    public daysView: IgxDaysViewComponent;

    /**
     * @hidden
     */
    @ViewChild('yearsBtn')
    public yearsBtn: ElementRef;

    /**
     * @hidden
     */
    public yearAction = '';

    /**
     * @hidden
     */
    @HostListener('keydown.pageup', ['$event'])
    public previousYear(event?: KeyboardEvent) {
        event?.preventDefault();
        if (event && this.yearAction === 'next') {
            return;
        }
        this.yearAction = 'prev';
        this.previousViewDate = this.viewDate;
        this.viewDate = this.calendarModel.getPrevYear(this.viewDate);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pagedown', ['$event'])
    public nextYear(event?: KeyboardEvent) {
        event?.preventDefault();
        if (event && this.yearAction === 'prev') {
            return;
        }
        this.yearAction = 'next';
        this.previousViewDate = this.viewDate;
        this.viewDate = this.calendarModel.getNextYear(this.viewDate);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.home', ['$event'])
    public onKeydownHome(event: KeyboardEvent) {
        if (this.monthsView) {
            this.monthsView.el.nativeElement.focus();
            this.monthsView.onKeydownHome(event);
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.end', ['$event'])
    public onKeydownEnd(event: KeyboardEvent) {
        if (this.monthsView) {
            this.monthsView.el.nativeElement.focus();
            this.monthsView.onKeydownEnd(event);
        }
    }

    /**
     * @hidden
     */
    public animationDone(event) {
        if ((event.fromState === 'void' && event.toState === '') ||
        (event.fromState === '' && (event.toState === ScrollMonth.PREV || event.toState === ScrollMonth.NEXT))) {
            this.viewDateChanged.emit({ previousValue: this.previousViewDate, currentValue: this.viewDate });
        }
        this.yearAction = '';
    }

    /**
     * @hidden
     */
    public viewRendered(event) {
        if (event.fromState !== 'void') {
            this.activeViewChanged.emit(this.activeView);
        }
    }

    /**
     * @hidden
     */
    public activeViewDecadeKB(event) {
        super.activeViewDecadeKB(event);

        if (event.key === KEYS.RIGHT_ARROW || event.key === KEYS.RIGHT_ARROW_IE) {
            this.nextYear(event);
        }

        if (event.key === KEYS.LEFT_ARROW || event.key === KEYS.LEFT_ARROW_IE) {
            this.previousYear(event);
        }

        requestAnimationFrame(() => {
            if (this.dacadeView) {
                this.dacadeView.el.nativeElement.focus();
            }
        });
    }

    /**
     * @hidden
     */
    public activeViewDecade() {
        super.activeViewDecade();

        requestAnimationFrame(() => {
            this.dacadeView.el.nativeElement.focus();
        });
    }

    /**
     * @hidden
     */
    public changeYearKB(event, next = true) {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            event.stopPropagation();
            if (next) {
                this.nextYear();
            } else {
                this.previousYear();
            }
        }
    }

    /**
     * @hidden
     */
    public selectYear(event: Date) {
        this.previousViewDate = this.viewDate;
        this.viewDate = new Date(event.getFullYear(), event.getMonth(), event.getDate());
        this.activeView = IgxCalendarView.Month;

        requestAnimationFrame(() => {
            if (this.yearsBtn) {
                this.yearsBtn.nativeElement.focus();
            }
        });
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
    public selectDate(value: Date) {
        if (!value) {
            return new Date();
        }
        super.selectDate(value);
        this.viewDate = value;
    }

    /**
     * @hidden
     */
    public writeValue(value: Date) {
        if (value) {
            this.viewDate = this.selectedDates = value;
        }
    }

    /**
     * @hidden
     */
    public getNextYear() {
        return this.calendarModel.getNextYear(this.viewDate).getFullYear();
    }

    /**
     * @hidden
     */
    public getPreviousYear() {
        return this.calendarModel.getPrevYear(this.viewDate).getFullYear();
    }
}
