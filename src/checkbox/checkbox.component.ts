import {
    Component,
    EventEmitter,
    forwardRef,
    Input,
    NgModule,
    Output,
    ViewChild
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

const noop = () => { };
let nextId = 0;

@Component({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxCheckbox, multi: true }],
    selector: "igx-checkbox",
    templateUrl: "checkbox.component.html"
})
export class IgxCheckbox implements ControlValueAccessor {
    public focused: boolean = false;

    @Input() public value: any;
    @Input() public id: string = `igx-checkbox-${nextId++}`;
    @Input() public name: string;
    @Input() public disabled: boolean = false;
    @Input() public tabindex: number = null;
    @Input() public checked: boolean = false;

    @Output() public change = new EventEmitter();

    @ViewChild("checkbox") public nativeCheckbox;

    protected _value: any;

    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    public onChange(event) {
        if (this.disabled) {
            return;
        }

        this.checked = !this.checked;
        this._onChangeCallback(this.checked);
        this.change.emit(event);
    }

    public onFocus(event) {
        this.focused = true;
    }

    public onBlur(event) {
        this.focused = false;
        this._onTouchedCallback();
    }

    public writeValue(value) {
        if (this.disabled) {
            return;
        }
        this._value = value;
        this.checked = !!this._value;
    }

    public registerOnChange(fn: (_: any) => void) { this._onChangeCallback = fn; }
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }
}

@NgModule({
    declarations: [IgxCheckbox],
    exports: [IgxCheckbox]
})
export class IgxCheckboxModule { }
