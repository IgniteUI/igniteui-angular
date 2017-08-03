import { CommonModule } from "@angular/common";
import {
    Component,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnInit,
    Output,
    ViewChild
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IgxCalendarComponent, IgxCalendarModule } from "../calendar/calendar.component";
import { HammerGesturesManager } from "../core/touch";
import { IgxDialog, IgxDialogModule } from "../dialog/dialog.component";
import { IgxInput } from "../input/input.directive";

@Component({
    moduleId: module.id,
    providers:
        [HammerGesturesManager,
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxDatePickerComponent, multi: true }],
    selector: "igx-datePicker",
    templateUrl: "date-picker.component.html"
})
export class IgxDatePickerComponent implements ControlValueAccessor, OnInit {
    @Input() public todayButtonLabel: string;
    @Input() public cancelButtonLabel: string;
    // Custom formatter function
    @Input() public formatter: (val: Date) => string;
    // Disable property for input.
    @Input() public isDisabled: boolean;
    @Input() public value: Date;

    @Output() public onOpen = new EventEmitter();

    get displayData() {
        if (this.value) {
            return this._customFormatChecker(this.formatter, this.value);
        }

        return "";
    }

    @ViewChild(IgxDialog) private alert: IgxDialog;
    @ViewChild(IgxCalendarComponent) private calendar: IgxCalendarComponent;

    public writeValue(value: Date): void {
        this.value = value;
    }

    public registerOnChange(fn: (_: Date) => void) { this._onChangeCallback = fn; }
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    public ngOnInit(): void {
        if (this.value) {
            this.calendar.value = this.value;
            this.calendar.viewDate = this.value;
        }
    }

    /**
     * Selects today's date from calendar and change the input field value, calendar viewDate and calendar value.
     */
    public triggerTodaySelection() {
        const today = new Date(Date.now());
        this.calendar.selectDate(today);
        this.calendar.viewDate = today;
        this.value = today;
        this._handleDialogCloseAction();
    }

    /**
     * Gets the selected date from calendar and sets it to the input.
     * @param event selected value from calendar.
     */
    protected handleSelection(event) {
        this.value = event;
        this._handleDialogCloseAction();
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

    private _focusTheDialog() {
        // Focus the dialog element, after its appearence into DOM.
        setTimeout(() => this.alert.dialogEl.nativeElement.focus(), 60);
    }

    private _setLocaleToDate(value: Date, locale: string = Constants.DEFAULT_LOCALE_DATE): string {
        return value.toLocaleDateString(locale);
    }

    /**
     * Check if passed date as a string is valid.
     * @param date passed date as a string
     */
    private _dateStringChecker(date: string): boolean {
        return (new Date(date).toString() !== Constants.DATE_CHECKER_VALUE);
    }

    /**
     * Apply custom user formatter upon date.
     * @param formatter custom formatter function.
     * @param date passed date
     */
    private _customFormatChecker(formatter: (_: Date) => string, date: Date) {
        return this.formatter ? this.formatter(date) : this._setLocaleToDate(date);
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
    public static readonly TODAY_BUTTON_TEXT = "Today";
    public static readonly DEFAULT_LOCALE_DATE = "en";
    public static readonly DATE_CHECKER_VALUE = "Invalid Date";
}

@NgModule({
    declarations: [IgxDatePickerComponent],
    exports: [IgxDatePickerComponent],
    imports: [CommonModule, IgxInput, IgxDialogModule, IgxCalendarModule]
})
export class IgxDatePickerModule {}
