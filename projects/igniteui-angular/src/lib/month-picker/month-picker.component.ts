import {
    Component,
    NgModule,
    HostListener,
    ElementRef,
    ViewChild,
    HostBinding,
    Input
} from '@angular/core';
import { IgxCalendarModule, CalendarView, IgxCalendarComponent, IgxMonthsViewComponent } from '../calendar/index';
import { IgxIconModule } from '../icon/index';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn, scaleInCenter, slideInLeft, slideInRight } from '../animations/main';
import { KEYS } from '../core/utils';

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
export class IgxMonthPickerComponent extends IgxCalendarComponent {
    /**
     * Sets/gets the `id` of the month picker.
     * If not set, the `id` will have value `"igx-month-picker-0"`.
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-month-picker-${NEXT_ID++}`;

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
    @ViewChild('months', {read: IgxMonthsViewComponent})
    public monthsView: IgxMonthsViewComponent;

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
        this.viewDate.setMonth(value.getMonth());
    }

    /**
     * @hidden
     */
    public writeValue(value: Date) {

        // TO DO: to be refactored after discussion on the desired behavior
        if (value) {
            this.viewDate.setMonth(value.getMonth());
        }
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

@NgModule({
    declarations: [IgxMonthPickerComponent],
    exports: [IgxMonthPickerComponent],
    imports: [CommonModule, IgxIconModule, IgxCalendarModule]
})
export class IgxMonthPickerModule { }
