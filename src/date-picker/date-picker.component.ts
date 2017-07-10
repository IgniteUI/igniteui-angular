import { CommonModule } from "@angular/common";
import {
    Component,
    EventEmitter,
    Input,
    NgModule,
    OnInit,
    Output,
    ViewChild
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IgxCalendarModule } from "../calendar/calendar.component";
import { HammerGesturesManager } from "../core/touch";
import { IgxDialogModule } from "../dialog/dialog.component";
import { IgxInput } from "../input/input.directive";

@Component({
    moduleId: module.id,
    providers:
        [HammerGesturesManager,
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxDatePickerComponent, multi: true }],
    selector: "igx-datePicker",
    templateUrl: "date-picker.component.html"
})
export class IgxDatePickerComponent implements ControlValueAccessor {
    @Input() public formatter: (val: Date) => string;

    @Output() public opened = new EventEmitter();

    @ViewChild("alert") private alert;

    private _displayData: string =
        this._customFormatChecker(this.formatter, new Date(Date.now()));

    public writeValue(value: Date): void {
        this.dateValue = value;
    }

    get dateValue(): Date {
        return new Date(this._displayData);
    }

    @Input() set dateValue(value: Date) {
        const toDate = new Date(this._displayData);
        if (value !== toDate && this._dateStringChecker(value.toString())) {
            this._displayData = this.formatter ?
                this._customFormatChecker(this.formatter, value) :
                this._setLocaleToDate(value);

            this._onChangeCallback(value);
        }
    }

    public registerOnChange(fn: (_: Date) => void) { this._onChangeCallback = fn; }
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    protected handleSelection(event) {
        this.dateValue = event;
        this.alert.close();
    }

    private onOpened(): void {
        this.alert.open();
        this._onTouchedCallback();
        this.opened.emit(this);
    }

    private _setLocaleToDate(value: Date, locale: string = "en"): string {
        return value.toLocaleDateString(locale);
    }

    private _dateStringChecker(date: string): boolean {
        return (new Date(date).toString() !== "Invalid Date");
    }

    // TODO: rename function
    private _customFormatChecker(formatter: (_: Date) => string, date: Date) {
        return this.formatter ? this.formatter(date) : this._setLocaleToDate(date);
    }

    private _onTouchedCallback: () => void = () => {};
    private _onChangeCallback: (_: Date) => void = () => {};
}

@NgModule({
    declarations: [IgxDatePickerComponent],
    exports: [IgxDatePickerComponent],
    imports: [CommonModule, IgxInput, IgxDialogModule, IgxCalendarModule]
})
export class IgxDatePickerModule {}
