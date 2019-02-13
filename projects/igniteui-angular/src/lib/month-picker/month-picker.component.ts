import {
    Component,
    NgModule,
    HostListener,
    ElementRef,
    ViewChild
} from '@angular/core';
import { IgxCalendarModule, CalendarView, IgxCalendarComponent } from '../calendar/index';
import { IgxIconModule } from '../icon/index';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn, scaleInCenter, slideInLeft, slideInRight } from '../animations/main';
import { KEYS } from '../core/utils';

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
export class IgxMonthPickerComponent extends IgxCalendarComponent {

    /**
     * @hidden
     */
    public yearAction = '';

    /**
     * @hidden
     */
    @ViewChild('yearsBtn')
    public yearsBtn: ElementRef;

    /**
     * @hidden
     */
    public animationDone() {
        this.yearAction = '';
    }

    /**
     * @hidden
     */
    public nextYear() {
        this.yearAction = 'next';
        super.nextYear();
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
        super.previousYear();
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
    public selectMonth(event: Date) {
        this.viewDate = new Date(event.getFullYear(), event.getMonth(), event.getDate());
        this._onChangeCallback(this.viewDate);

        this.onSelection.emit(this.viewDate);
    }

    /**
     * @hidden
     */
    public selectYear(event: Date) {
        this.viewDate = new Date(event.getFullYear(), event.getMonth(), event.getDate());
        this.activeView = CalendarView.DEFAULT;

        requestAnimationFrame(() => {
            this.yearsBtn.nativeElement.focus();
        });
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pageup', ['$event'])
    public onKeydownPageUp(event: KeyboardEvent) {
        super.onKeydownShiftPageUp(event);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pagedown', ['$event'])
    public onKeydownPageDown(event: KeyboardEvent) {
        super.onKeydownShiftPageDown(event);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.shift.pageup', ['$event'])
    @HostListener('keydown.shift.pagedown', ['$event'])
    public onKeydownShiftPageDownUp(event: KeyboardEvent) {
        event.stopPropagation();
    }
}

@NgModule({
    declarations: [IgxMonthPickerComponent],
    exports: [IgxMonthPickerComponent],
    imports: [CommonModule, IgxIconModule, IgxCalendarModule]
})
export class IgxMonthPickerModule { }
