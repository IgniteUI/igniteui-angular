import {
    Component,
    HostListener,
    ViewChild,
    HostBinding,
    Input
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn, scaleInCenter, slideInLeft, slideInRight } from '../../animations/main';
import { KEYS } from '../../core/utils';
import { IgxMonthsViewComponent } from '../months-view/months-view.component';
import { IgxMonthPickerBase, CalendarView } from '../month-picker-base';
import { IgxYearsViewComponent } from '../years-view/years-view.component';
import { IgxDaysViewComponent } from '../days-view/days-view.component';

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
export class IgxMonthPickerComponent extends IgxMonthPickerBase {
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
    @ViewChild('months', { read: IgxMonthsViewComponent, static: false })
    public monthsView: IgxMonthsViewComponent;

    /**
     * @hidden
     */
    @ViewChild('decade', { read: IgxYearsViewComponent, static: false })
    public dacadeView: IgxYearsViewComponent;

    /**
     * @hidden
     */
    @ViewChild('days', { read: IgxDaysViewComponent, static: false })
    public daysView: IgxDaysViewComponent;

    /**
     * @hidden
     */
    public yearAction = '';

    /**
     * @hidden
     */
    public animationDone() {
        this.yearAction = '';
    }

    /**
     * @hidden
     */
    public activeViewDecadeKB(event) {
        super.activeViewDecadeKB(event);

        if (event.key === KEYS.RIGHT_ARROW || event.key === KEYS.RIGHT_ARROW_IE) {
            event.preventDefault();
            this.nextYear();
        }

        if (event.key === KEYS.LEFT_ARROW || event.key === KEYS.LEFT_ARROW_IE) {
            event.preventDefault();
            this.previousYear();
        }

        requestAnimationFrame(() => {
            if (this.dacadeView) { this.dacadeView.el.nativeElement.focus(); }
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
    public nextYear() {
        this.yearAction = 'next';
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', 1);

        this.selectDate(this.viewDate);
        this.onSelection.emit(this.selectedDates);
    }

    /**
     * @hidden
     */
    public nextYearKB(event) {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            event.preventDefault();
            event.stopPropagation();

            this.nextYear();
        }
    }

    /**
     * @hidden
     */
    public previousYear() {
        this.yearAction = 'prev';
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', -1);

        this.selectDate(this.viewDate);
        this.onSelection.emit(this.selectedDates);
    }

    /**
     * @hidden
     */
    public previousYearKB(event) {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            event.preventDefault();
            event.stopPropagation();

            this.previousYear();
        }
    }

    /**
     * @hidden
     */
    public selectYear(event: Date) {
        this.viewDate = new Date(event.getFullYear(), event.getMonth(), event.getDate());
        this.activeView = CalendarView.DEFAULT;

        this.selectDate(event);
        this.onSelection.emit(this.selectedDates);

        requestAnimationFrame(() => {
            if (this.yearsBtn) { this.yearsBtn.nativeElement.focus(); }
        });
    }

    /**
     * @hidden
     */
    public selectMonth(event: Date) {
        this.selectDate(event);
        this.onSelection.emit(this.selectedDates);
    }

    /**
     * Selects a date.
     *```typescript
     * this.monPicker.selectDate(new Date(`2018-06-12`));
     *```
     */
    public selectDate(value: Date) {
        if (!value) {
            return new Date();
        }

        // TO DO: to be refactored after discussion on the desired behavior
        super.selectDate(value);
        this.viewDate = value;
    }

    /**
     * @hidden
     */
    public writeValue(value: Date) {

        // TO DO: to be refactored after discussion on the desired behavior
        if (value) {
            this.viewDate = this.selectedDates = value;
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pageup', ['$event'])
    public onKeydownPageUp(event: KeyboardEvent) {
        event.preventDefault();
        this.yearAction = 'prev';
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', -1);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pagedown', ['$event'])
    public onKeydownPageDown(event: KeyboardEvent) {
        event.preventDefault();
        this.yearAction = 'next';
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', 1);
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
}
