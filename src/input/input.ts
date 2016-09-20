import {
    Component,
    Input,
    Output,
    EventEmitter,
    NgModule,
    ViewChild,
    ElementRef,
    forwardRef
} from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from "@angular/forms";


const noop = () => {};

export function MakeProvider(type: any) {
    return {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => type),
        multi: true
    };
}

let nextId = 0;

// TODO: Figure out a way to inherit decorated properties
//       while extending the children with custom decorated properties

class BaseInput implements ControlValueAccessor {

    @ViewChild("input") nativeInput: ElementRef;

    @Input() id: string = `ig-input-${nextId++}`;
    @Input() name: string = null;
    @Input() placeholder: string = '';
    @Input() required: boolean = false;
    @Input() disabled: boolean = false;
    @Input() tabindex: number = null;


    focused: boolean = false;

    protected _value: any;


    @Input() get value() {
        return this._value;
    }

    set value(val) {
        if (val != this._value) {
            this._value = val;
            this._onChangeCallback(this._value);
        }
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

    writeValue(val: any) {
        this._value = val;
    }
}


@Component({
    selector: 'ig-text',
    moduleId: module.id,
    templateUrl: 'igtext.html',
    providers: [MakeProvider(TextInput)]
})
export class TextInput extends BaseInput {
}


@Component({
    selector: 'ig-password',
    moduleId: module.id,
    templateUrl: 'igpassword.html',
    providers: [MakeProvider(PasswordInput)]
})
export class PasswordInput extends BaseInput {
}


@Component({
    selector: 'ig-textarea',
    moduleId: module.id,
    templateUrl: 'igtextarea.html',
    providers: [MakeProvider(TextArea)]
})
export class TextArea extends BaseInput {
}


/** Export as module */
@NgModule({
    declarations: [TextInput, PasswordInput, TextArea],
    imports: [FormsModule],
    exports: [TextInput, PasswordInput, TextArea]
})
export class IgInputModule {
}