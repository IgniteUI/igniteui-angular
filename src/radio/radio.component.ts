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

let nextId = 0;

const noop = () => { };

/**
* **Ignite UI for Angular Radio Button** - [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radio_button.html)  
* The Ignite UI Radio Button allows the user to select a single option from an available set of options that are listed side by side.
*
* Example:
* ```html
* <igx-radio>
*   Simple radio button
* </igx-radio>
* ```
*/
@Component({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxRadioComponent, multi: true }],
    selector: "igx-radio",
    templateUrl: "radio.component.html"
})
export class IgxRadioComponent implements ControlValueAccessor {

    @Input() public value: any;

    @Input() public id = `igx-radio-${nextId++}`;

    @Input() public name: string;

    @Input() public disabled: boolean;

    @Input() public tabindex: number = null;

    @Output() public change: EventEmitter<any> = new EventEmitter();

    @ViewChild("radio") public nativeRadio;

    public get checked(): boolean {
        return this._checked;
    }

    public set checked(value: boolean) {
        this._checked = value;
    }

    protected _value: any;

    protected _checked: boolean;

    protected focused: boolean;

    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    public onChange(event) {
        this.select();
        this.change.emit(event);
    }

    public select() {
        this.checked = true;
        this._onChangeCallback(this.value);
    }

    public writeValue(value: any) {
        this._value = value;
        this.checked = (this._value === this.value);
    }

    public onFocus(event) {
        this.focused = true;
    }

    public onBlur(event) {
        this.focused = false;
        this._onTouchedCallback();
    }

    public registerOnChange(fn: (_: any) => void) { this._onChangeCallback = fn; }
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }
}

@NgModule({
    declarations: [IgxRadioComponent],
    exports: [IgxRadioComponent]
})
export class IgxRadioModule { }
