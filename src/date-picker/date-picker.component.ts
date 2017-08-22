import { CommonModule } from "@angular/common";
import {
    Component,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { WEEKDAYS } from "../calendar/calendar";
import { IgxCalendarComponent, IgxCalendarModule } from "../calendar/calendar.component";
import { HammerGesturesManager } from "../core/touch";
import { IgxDialog, IgxDialogModule } from "../dialog/dialog.component";
import { IgxInput } from "../input/input.directive";

@Component({
    encapsulation: ViewEncapsulation.None,
    moduleId: module.id,
    providers:
    [HammerGesturesManager,
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxDatePickerComponent, multi: true }],
    selector: "igx-datePicker",
    styleUrls: ["date-picker.component.css"],
    templateUrl: "date-picker.component.html"
})
export class IgxDatePickerComponent implements ControlValueAccessor, OnInit {
    // Custom formatter function
    @Input() public formatter: (val: Date) => string;
    @Input() public isDisabled: boolean;
    @Input() public value: Date;

    /**
     * Propagate calendar properties.
     */
    @Input() public locale: string = Constants.DEFAULT_LOCALE_DATE;
    @Input() public weekStart: WEEKDAYS | number = WEEKDAYS.SUNDAY;
    @Input() public formatOptions = {
        day: "numeric",
        month: "short",
        weekday: "short",
        year: "numeric"
    };
    /**
     * Propagate dialog properties.
     */
    @Input() public todayButtonLabel: string;
    @Input() public cancelButtonLabel: string;

    @Output() public onOpen = new EventEmitter();
    /**
     * Propagate clanedar events.
     */
    @Output() public onSelection = new EventEmitter<Date>();

    private get displayData() {
        if (this.value) {
            return this._customFormatChecker(this.formatter, this.value);
        }

        return "";
    }

    @ViewChild(IgxDialog) private alert: IgxDialog;
    @ViewChild(IgxCalendarComponent) private calendar: IgxCalendarComponent;

    public writeValue(value: Date) {
        this.value = value;
        this.selectDate(value);
    }

    public registerOnChange(fn: (_: Date) => void) { this._onChangeCallback = fn; }
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    public ngOnInit(): void {
        /**
         * If we have passed value from user, update @calendar.value and @calendar.viewDate.
         */
        if (this.value) {
            this.selectDate(this.value);
        }
    }

    /**
     * Selects today's date from calendar and change the input field value, @calendar.viewDate and @calendar.value.
     */
    public triggerTodaySelection() {
        const today = new Date(Date.now());
        this.selectDate(today);
    }

    /**
     * Change the calendar slection and calling this method will emit the @calendar.onSelection event,
     * which will fire @handleSelection method.
     * @param date passed date that has to be set to the calendar.
     */
    public selectDate(date: Date) {
        this.calendar.selectDate(date);
    }

    /**
     * Evaluates when @calendar.onSelection event was fired
     * and update the input value.
     *
     * @param event selected value from calendar.
     */
    protected handleSelection(event) {
        this.value = event;
        this.calendar.viewDate = event;
        this._onChangeCallback(event);
        this._handleDialogCloseAction();
        this.onSelection.emit(event);
    }

    /**
     * Emits the open event and focus the dialog.
     */
    private _onOpenEvent(): void {
        this.alert.open();
        this._focusTheDialog();
        this._onTouchedCallback();
        this.onOpen.emit(this);
    }

    // Focus the dialog element, after its appearence into DOM.
    private _focusTheDialog() {
        requestAnimationFrame(() => this.alert.dialogEl.nativeElement.focus());
    }

    private _setLocaleToDate(value: Date, locale: string = Constants.DEFAULT_LOCALE_DATE): string {
        return value.toLocaleDateString(locale);
    }

    /**
     * Apply custom user formatter upon date.
     * @param formatter custom formatter function.
     * @param date passed date
     */
    private _customFormatChecker(formatter: (_: Date) => string, date: Date) {
        return this.formatter ? this.formatter(date) : this._setLocaleToDate(date, this.locale);
    }

    /**
     * Closes the dialog, after was clearing all calendar items from dom.
     */
    private _handleDialogCloseAction() {
        requestAnimationFrame(() => this.alert.close());
    }

    private _onTouchedCallback: () => void = () => {};
    private _onChangeCallback: (_: Date) => void = () => {};
}

class Constants {
    public static readonly DEFAULT_LOCALE_DATE = "en";
}

@NgModule({
    declarations: [IgxDatePickerComponent],
    exports: [IgxDatePickerComponent],
    imports: [CommonModule, IgxInput, IgxDialogModule, IgxCalendarModule]
})
export class IgxDatePickerModule { }
