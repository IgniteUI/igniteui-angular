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
import { ControlValueAccessor } from "@angular/forms";
import { IgxCalendarModule } from "../calendar/calendar.component";
import { IgxDialogModule } from "../dialog/dialog.component";
import { IgxInput } from "../input/input.directive";

@Component({
    moduleId: module.id,
    selector: "igx-datePicker",
    templateUrl: "date-picker.component.html"
})
export class IgxDatePickerComponent implements ControlValueAccessor, OnInit {
    @Input() public dateValue: Date;
    @Input() public formatter: (val: Date) => string;

    @Output() public opened = new EventEmitter();

    @ViewChild("alert") private alert;

    private _displayData: string = "";

    public writeValue(value: Date): void {
        this.dateValue = value;
    }

    public registerOnChange(fn: (_: Date) => void) { this._onChangeCallback = fn; }
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    public ngOnInit(): void {
        if (this.dateValue) {
            this.dateValue instanceof Date ?
                this._displayData = this._customFormatChecker(this.formatter, this.dateValue) :
                this._displayData = "Invalid Type";
        }
    }

    protected handleSelection(event) {
        this._displayData = this._customFormatChecker(this.formatter, event);

        this.alert.close();
    }

    private onOpened(): void {
        this.alert.open();
        this.opened.emit(this);
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

    private _onTouchedCallback: () => void = () => {};
    private _onChangeCallback: (_: Date) => void = () => {};
}

@NgModule({
    declarations: [IgxDatePickerComponent],
    exports: [IgxDatePickerComponent],
    imports: [CommonModule, IgxInput, IgxDialogModule, IgxCalendarModule]
})
export class IgxDatePickerModule {}
