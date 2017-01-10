import {
    Component,
    NgModule,
    Input,
    Output,
    ViewChild,
    EventEmitter,
    forwardRef
} from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

let nextId = 0;

const noop = () => {};

function MakeProvider(type: any) {
    return {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => type),
        multi: true
    };
}

@Component({
    selector: 'igx-radio',
    moduleId: module.id,
    templateUrl: 'radio.component.html',
    providers: [MakeProvider(IgxRadio)]
})
export class IgxRadio implements ControlValueAccessor {

    @Input() value: any;

    @Input() id: string = `igx-radio-${nextId++}`;

    @Input() name: string;

    @Input() disabled: boolean;

    @Input() tabindex: number = null;

    @Output() change: EventEmitter<any> = new EventEmitter();

    @ViewChild('radio') nativeRadio;

    protected _value: any;

    protected checked: boolean;

    protected focused: boolean;

    onChange(event) {
        this.select();
        this.change.emit(event);
    }

    select() {
        this.checked = true;
        this._onChangeCallback(this.value);
    }

    writeValue(value: any) {
        this._value = value;
        this.checked = (this._value == this.value);
    }

    onFocus(event) {
        this.focused = true;
    }

    onBlur(event) {
        this.focused = false;
        this._onTouchedCallback();
    }

    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    registerOnChange(fn: (_: any) => void) { this._onChangeCallback = fn; }
    registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }
}

@NgModule({
    declarations: [IgxRadio],
    exports: [IgxRadio]
})
export class IgxRadioModule {}