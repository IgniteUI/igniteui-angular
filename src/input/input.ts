import {
    Component,
    Provider,
    Input,
    Output,
    EventEmitter,
    NgModule,
    ModuleWithProviders,
    ViewChild,
    OnChanges,
    ElementRef,
    forwardRef,
    AfterContentInit
} from "@angular/core";
import {
    NG_VALUE_ACCESSOR,
    ControlValueAccessor,
    FormsModule
} from "@angular/forms";


const noop = () => {};

export function MakeProvider(type: any) {
    return new Provider(
        NG_VALUE_ACCESSOR, {
            useExisting: forwardRef(() => type),
            multi: true
        }
    );
}

let nextId = 0;

// TODO: Figure out a way to inherit decorated properties
//       while extending the children with custom decorated properties

class BaseInput implements ControlValueAccessor {
    private _value: any = "";
    private _focused: boolean = false;

    @Output('blur') _blur = new EventEmitter();
    @Output('focus') _focus = new EventEmitter();

    @ViewChild("input") _inputElement: ElementRef;

    @Input() id: string = `ig-input-${nextId++}`;
    @Input() name: string = null;
    @Input() placeholder: string = '';
    @Input() required: boolean = false;
    @Input() disabled: boolean = false;
    @Input() tabindex: number = null;


    get value(): any {
        return this._value;
    }

    @Input()
    set value(val: any) {
        if (val !== this._value) {
            this._value = val;
            this._onChangeCallback(val);
        }
    }

    get focused() {
        return this._focused;
    }

    _onFocus(event) {
        this._focused = true;
        this._focus.emit(event);
    }

    _onBlur(event) {
        this._focused = false;
        this._onTouchedCallback();
        this._blur.emit(event);
    }

    /** ControlValueAccessor interface */

    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    registerOnChange(fn: (_: any) => void) { this._onChangeCallback = fn; }
    registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    writeValue(val: any) {
        if (val !== this._value) {
            this._value = val;
        }
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
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: IgInputModule,
            providers: []
        };
    }
}