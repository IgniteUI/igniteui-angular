import {
    NgModule,
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    forwardRef
} from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

const noop = () => {};
let nextId = 0;

export function MakeProvider(type: any) {
    return {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => type),
        multi: true
    };
}

@Component({
    selector: "ig-switch",
    moduleId: module.id,
    templateUrl: "switch.html",
    providers: [MakeProvider(IgSwitch)]
})
export class IgSwitch implements ControlValueAccessor {

    @Input() value: any;
    @Input() id: string = `ig-switch-${nextId++}`;
    @Input() name: string;
    @Input() disabled: boolean = false;
    @Input() tabindex: number = null;

    @Output() change = new EventEmitter();

    @ViewChild('checkbox') nativeCheckbox;

    protected _value: any;

    focused: boolean = false;
    checked: boolean = false;

    onChange(event) {
        if (this.disabled) {
            return;
        }

        this.checked = !this.checked;
        this._onChangeCallback(this.checked);
        this.change.emit(event);
    }

    onFocus(event) {
        this.focused = true;
    }

    onBlur(event) {
        this.focused = false;
        this._onTouchedCallback();
    }

    writeValue(value) {
        if (this.disabled) {
            return;
        }
        this._value = value;
        this.checked = this._value;
    }

    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    registerOnChange(fn: (_: any) => void) { this._onChangeCallback = fn; }
    registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }
}


@NgModule({
    declarations: [IgSwitch],
    exports: [IgSwitch]
})
export class SwitchModule {}