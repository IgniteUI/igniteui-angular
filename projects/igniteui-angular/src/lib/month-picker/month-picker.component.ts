import {
    Component,
    NgModule
} from '@angular/core';
import { IgxCalendarModule, CalendarView, IgxCalendarComponent } from '../calendar/index';
import { IgxIconModule } from '../icon/index';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn, scaleInCenter, slideInLeft, slideInRight } from '../animations/main';

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
export class IgxMonthPickerComponent extends IgxCalendarComponent implements ControlValueAccessor {

    public animateAction = '';

    public previousYear() {
        this.animateAction = 'prev';
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', -1);
    }

    public nextYear() {
        this.animateAction = 'next';
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', 1);
    }

    public selectMonth(event: Date) {
        this.viewDate = new Date(event.getFullYear(), event.getMonth(), event.getDate());
        this._onChangeCallback(this.viewDate);
    }

    public selectYear(event: Date) {
        this.viewDate = new Date(event.getFullYear(), event.getMonth(), event.getDate());
        this.activeView = CalendarView.DEFAULT;

        requestAnimationFrame(() => {
            this.monthsView.el.nativeElement.focus();
        });
    }
}

@NgModule({
    declarations: [IgxMonthPickerComponent],
    exports: [IgxMonthPickerComponent],
    imports: [CommonModule, IgxIconModule, IgxCalendarModule]
})
export class IgxMonthPickerModule { }
