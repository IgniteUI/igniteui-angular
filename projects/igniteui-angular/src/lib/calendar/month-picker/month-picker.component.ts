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
    @ViewChild('months', {read: IgxMonthsViewComponent})
    public monthsView: IgxMonthsViewComponent;

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
        this.keydownPageUpHandler(event);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pagedown', ['$event'])
    public onKeydownPageDown(event: KeyboardEvent) {
        this.keydownPageDownHandler(event);
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
