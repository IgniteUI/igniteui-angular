import {
    Component,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    NgModule,
    Output,
    ViewChild
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";

export enum LabelPosition {
    BEFORE = "before",
    AFTER = "after"
}

const noop = () => { };
let nextId = 0;

@Component({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxCheckboxComponent, multi: true }],
    selector: "igx-checkbox",
    preserveWhitespaces: false,
    templateUrl: "checkbox.component.html"
})
export class IgxCheckboxComponent implements ControlValueAccessor {
    public focused = false;
    protected _value: any;

    @ViewChild("checkbox") public nativeCheckbox;
    @ViewChild("label") public nativeLabel;
    @ViewChild("placeholderLabel") public placeholderLabel;

    @Input() public id = `igx-checkbox-${nextId++}`;
    @Input() public value: any;
    @Input() public name: string;
    @Input() public tabindex: number = null;
    @Input() public labelPosition: LabelPosition | string = LabelPosition.AFTER;
    @Input() public disableRipple = false;

    @HostBinding("class.igx-checkbox")
    public cssClass = "igx-checkbox";

    @HostBinding("class.igx-checkbox--indeterminate")
    @Input() public indeterminate = false;

    @HostBinding("class.igx-checkbox--checked")
    @Input() public checked = false;

    @HostBinding("class.igx-checkbox--disabled")
    @Input() public disabled = false;

    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    public onChange(event) {
        if (this.disabled) {
            return;
        }

        this.indeterminate = false;
        this.checked = !this.checked;
        this._onChangeCallback(this.checked);
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

    public get labelClass(): string {
        switch (this.labelPosition) {
            case LabelPosition.BEFORE:
                return `${this.cssClass}__label--before`;
            case LabelPosition.AFTER:
            default:
                return `${this.cssClass}__label`;
        }
    }

    public registerOnChange(fn: (_: any) => void) { this._onChangeCallback = fn; }
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }
}

@NgModule({
    declarations: [IgxCheckboxComponent],
    exports: [IgxCheckboxComponent],
    imports: [IgxRippleModule]
})
export class IgxCheckboxModule { }
