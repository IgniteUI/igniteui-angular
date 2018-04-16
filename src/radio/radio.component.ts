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

export interface IChangeRadioEventArgs {
    value: any;
    radio: IgxRadioComponent;
}

export enum RadioLabelPosition {
    BEFORE = "before",
    AFTER = "after"
}

let nextId = 0;
const noop = () => { };
/**
 * **Ignite UI for Angular Radio Button** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radio_button.html)
 *
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
    @ViewChild("radio") public nativeRadio;
    @ViewChild("nativeLabel") public nativeLabel;
    @ViewChild("placeholderLabel") public placeholderLabel;

    @Input() public id = `igx-radio-${nextId++}`;
    @Input() public labelId = `${this.id}-label`;
    @Input() public labelPosition: RadioLabelPosition | string = "after";
    @Input() public value: any;
    @Input() public name: string;
    @Input() public tabindex: number = null;
    @Input() public disableRipple = false;
    @Input() public required = false;

    @Input("aria-labelledby")
    public ariaLabelledBy = this.labelId;

    @Input("aria-label")
    public ariaLabel: string | null = null;

    @Output()
    readonly change: EventEmitter<IChangeRadioEventArgs> = new EventEmitter<IChangeRadioEventArgs>();

    @HostBinding("class.igx-radio")
    public cssClass = "igx-radio";

    @HostBinding("class.igx-radio--checked")
    @Input() public checked = false;

    @HostBinding("class.igx-radio--disabled")
    @Input() public disabled = false;

    @HostBinding("class.igx-radio--focused")
    public focused = false;

    protected _value: any = null;

    constructor() { }

    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    public _onRadioChange(event) {
        event.stopPropagation();
    }

    public _onRadioClick(event) {
        event.stopPropagation();
        this.select();
    }

    public _onLabelClick() {
        this.select();
    }

    public select() {
        if (this.disabled) {
            return;
        }

        this.checked = true;
        this.change.emit({ value: this.value, radio: this });
        this._onChangeCallback(this.value);
    }

    public writeValue(value: any) {
        this._value = value;
        this.checked = (this._value === this.value);
    }

    public get labelClass(): string {
        switch (this.labelPosition) {
            case RadioLabelPosition.BEFORE:
                return `${this.cssClass}__label--before`;
            case RadioLabelPosition.AFTER:
            default:
                return `${this.cssClass}__label`;
        }
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
    exports: [IgxRadioComponent],
    imports: [IgxRippleModule]
})
export class IgxRadioModule { }
