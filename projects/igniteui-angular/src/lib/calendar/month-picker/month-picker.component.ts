import {
    Component,
    HostListener,
    ViewChild,
    HostBinding,
    Input,
    ElementRef,
    AfterViewInit,
} from "@angular/core";
import { NgIf, NgStyle, NgTemplateOutlet } from "@angular/common";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import { IgxMonthsViewComponent } from "../months-view/months-view.component";
import { IgxMonthPickerBaseDirective } from "./month-picker-base";
import { IgxYearsViewComponent } from "../years-view/years-view.component";
import { IgxDaysViewComponent } from "../days-view/days-view.component";
import { IgxIconComponent } from "../../icon/icon.component";
import { IgxCalendarView } from "../calendar";
import { CalendarDay } from "../common/model";

let NEXT_ID = 0;
@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxMonthPickerComponent,
        },
    ],
    selector: "igx-month-picker",
    templateUrl: "month-picker.component.html",
    standalone: true,
    imports: [
        NgIf,
        NgStyle,
        NgTemplateOutlet,
        IgxIconComponent,
        IgxMonthsViewComponent,
        IgxYearsViewComponent,
    ],
})
export class IgxMonthPickerComponent extends IgxMonthPickerBaseDirective implements AfterViewInit {
    /**
     * Sets/gets the `id` of the month picker.
     * If not set, the `id` will have value `"igx-month-picker-0"`.
     */
    @HostBinding("attr.id")
    @Input()
    public id = `igx-month-picker-${NEXT_ID++}`;

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
            this.viewDate = this.calendarModel.getPrevYear(this.viewDate);
        }

        if (this.isDecadeView) {
            this.viewDate = this.calendarModel.getPrevYears(this.viewDate);
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.pagedown", ["$event"])
    public nextPage(event?: KeyboardEvent) {
        event?.preventDefault();
        this.previousViewDate = this.viewDate;

        if (this.isDefaultView) {
            this.viewDate = this.calendarModel.getNextYear(this.viewDate);
        }

        if (this.isDecadeView) {
            this.viewDate = this.calendarModel.getNextYears(this.viewDate);
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.home", ["$event"])
    public onKeydownHome(event: KeyboardEvent) {
        if (this.monthsView) {
            this.monthsView.el.nativeElement.focus();
            this.monthsView.onKeydownHome(event);
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.end", ["$event"])
    public onKeydownEnd(event: KeyboardEvent) {
        if (this.monthsView) {
            this.monthsView.el.nativeElement.focus();
            this.monthsView.onKeydownEnd(event);
        }
    }

    /**
     * @hidden
     */
    public viewRendered(event) {
        if (event.fromState !== "void") {
            this.activeViewChanged.emit(this.activeView);
        }
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

        requestAnimationFrame(() => {
            if (this.dacadeView) {
                this.dacadeView.focusActiveDate();
            }
        });
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

        this.activeView = IgxCalendarView.Month;

        requestAnimationFrame(() => {
            if (this.monthsView) {
                this.monthsView.focusActiveDate();
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
    public override writeValue(value: Date) {
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

    public ngAfterViewInit() {
        this.activeView$.subscribe((view) => {
            this.activeViewChanged.emit(view);
        });
    }
}
