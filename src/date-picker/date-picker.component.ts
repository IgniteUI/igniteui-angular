import { CommonModule } from "@angular/common";
import {
    Component,
    EventEmitter,
    Input,
    NgModule,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IgxCalendarModule } from "../calendar/calendar.component";
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
    @Input() public formatter: (val: Date) => string;

    @Output() public onOpen = new EventEmitter();

    private _displayData: string =
    this._customFormatChecker(this.formatter, new Date(Date.now()));
    @ViewChild(IgxDialog) private alert: IgxDialog;

    public writeValue(value: Date): void {
        this.dateValue = value;
    }

    get dateValue(): Date {
        const toDate = new Date(this._displayData);
        const formattedDate = this._customFormatChecker(this.formatter, toDate);
        return new Date(formattedDate);
    }

    @Input() set dateValue(value: Date) {
        const toDate = new Date(this._displayData);
        if (value.toDateString() !== toDate.toDateString() &&
            value instanceof Date &&
            this._dateStringChecker(value.toString())) {
            this._displayData = this._customFormatChecker(this.formatter, value);
            this._onChangeCallback(value);
        }
    }

    public registerOnChange(fn: (_: Date) => void) { this._onChangeCallback = fn; }
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    public ngOnInit(): void {
        this._displayData = this._customFormatChecker(this.formatter, new Date(this._displayData));
    }

    protected handleSelection(event) {
        this.dateValue = event;
        this.alert.close();
    }

    private onOpenEvent(): void {
        this.alert.open();
        this._focusTheDialog();
        this._onTouchedCallback();
        this.onOpen.emit(this);
    }

    private _focusTheDialog() {
        // Get the dialog element after the element appeares into DOM.
        setTimeout(() => this.alert.dialogEl.nativeElement.focus(), 60);
    }

    private _setLocaleToDate(value: Date, locale: string = "en"): string {
        return value.toLocaleDateString(locale);
    }

    private _dateStringChecker(date: string): boolean {
        return (new Date(date).toString() !== "Invalid Date");
    }

    private _customFormatChecker(formatter: (_: Date) => string, date: Date) {
        return this.formatter ? this.formatter(date) : this._setLocaleToDate(date);
    }

    private _onTouchedCallback: () => void = () => { };
    private _onChangeCallback: (_: Date) => void = () => { };
}

@NgModule({
    declarations: [IgxDatePickerComponent],
    exports: [IgxDatePickerComponent],
    imports: [CommonModule, IgxInput, IgxDialogModule, IgxCalendarModule]
})
export class IgxDatePickerModule { }
