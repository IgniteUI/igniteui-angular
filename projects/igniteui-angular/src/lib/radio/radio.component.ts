import {
    Component,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    NgModule,
    Output,
    ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';

export interface IChangeRadioEventArgs {
    value: any;
    radio: IgxRadioComponent;
}

export enum RadioLabelPosition {
    BEFORE = 'before',
    AFTER = 'after'
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
    selector: 'igx-radio',
    templateUrl: 'radio.component.html'
})

export class IgxRadioComponent implements ControlValueAccessor {
    /**
     *@hidden
     */
    @ViewChild('radio') public nativeRadio;
    /**
     *@hidden
     */
    @ViewChild('nativeLabel') public nativeLabel;
    /**
     *@hidden
     */
    @ViewChild('placeholderLabel') public placeholderLabel;

    /**
     * Sets the `id` of the radio component.
     * If not set, the `id` of the first radio component will `"igx-radio-0"`.
     * ```html
     * <igx-radio id = "my-first-radio"></igx-radio>
     * ```
     * @memberof IgxRadioComponent
     */
    @HostBinding('attr.id')
    @Input() public id = `igx-radio-${nextId++}`;
    /**
     * Sets the id of the `label` element in the radio component.
     * If not set, the id of the `label` in the first radio component will be `"igx-radio-0-label"`
     * ```html
     * <igx-radio labelId = "Label1"></igx-radio>
     * ```
     * @memberof IgxRadioComponent
     */
    @Input() public labelId = `${this.id}-label`;
    /**
     * Sets the position of the `label` in the radio component.
     * If not set, `labelPosition` will have value `"after"`;
     * ```html
     * <igx-radio labelPosition = "before"></igx-radio>
     * ```
     * @memberof IgxRadioComponent
     */
    @Input() public labelPosition: RadioLabelPosition | string = 'after';
    /**
     * Sets/gets the `value`attribute of the radio component.
     * ```html
     * <igx-radio [value] = "1"></igx-radio>
     * ```
     * ```typescript
     * let value =  this.radio.value;
     * ```
     * @memberof IgxRadioComponent
     */
    @Input() public value: any;
/**
 * Sets/gets the `name` attribute of the radio component.
 * ```html
 * <igx-radio name = "Radio1"></igx-radio>
 *  ```
 * ```typescript
 * let name =  this.radio.name;
 * ```
 * @memberof IgxRadioComponent
 */
@Input() public name: string;
/**
 * Sets the value of the `tabindex` attribute of the radio component.
 * ```html
 * <igx-radio [tabindex] = "1"></igx-radio>
 * ```
 * @memberof IgxRadioComponent
 */
@Input() public tabindex: number = null;
/**
 * Sets the `disableRipple` attribute of the radio component.
 * If not set, the `disableRipple` will have value `false`.
 * ```html
 * <igx-radio [disableRipple] = "true"></igx-radio>
 * ```
 * @memberof IgxRadioComponent
 */
@Input() public disableRipple = false;
/**
 * Sets whether the state of the radio component should be required.
 * If not set, `required` will have value `false`.
 * ```html
 * <igx-radio [required] = "true"></igx-radio>
 * ```
 * @memberof IgxRadioComponent
 */
@Input() public required = false;
/**
 * Sets the `aria-labelledby` attribute of the radio component.
 * If not set, the `aria-labelledby` will be equal to the value of `labelId` attribute.
 * ```html
 * <igx-radio aria-labelledby = "Radio1"></igx-radio>
 * ```
 * @memberof IgxRadioComponent
 */
@Input('aria-labelledby')
    public ariaLabelledBy = this.labelId;
/**
 *Sets the `aria-label` attribute of the radio component.
 * ```html
 * <igx-radio aria-label = "Radio1"></igx-radio>
 * ```
 * @memberof IgxRadioComponent
 */
@Input('aria-label')
    public ariaLabel: string | null = null;
/**
 * An even that is emitted when the radio state is changed.
 * Provides references to the `IgxRadioComponent` and the `value` property as event arguments.
 * @memberof IgxRadioComponent
 */
@Output()
    readonly change: EventEmitter<IChangeRadioEventArgs> = new EventEmitter<IChangeRadioEventArgs>();
/**
 * Return the class of the radio component.
 * ```typescript
 * let radioClass = this.radio.cssClass;
 * ```
 * @memberof IgxRadioComponent
 */
@HostBinding('class.igx-radio')
    public cssClass = 'igx-radio';
/**
 * Sets whether the radio is checked.
 * Default value is `false`.
 * ```html
 * <igx-radio [checked] = "true"></igx-radio>
 * ```
 * @memberof IgxRadioComponent
 */
@HostBinding('class.igx-radio--checked')
    @Input() public checked = false;
/**
 * Sets whether the radio is desabled.
 * Default value is `false`.
 * ```html
 * <igx-radio [desabled] = "true"></igx-radio>
 * ```
 * @memberof IgxRadioComponent
 */
@HostBinding('class.igx-radio--disabled')
    @Input() public disabled = false;
/**
 * Sets whether the radio component is on focus.
 * Default value is `false`.
 * ```typescript
 * this.radio.focus = true;
 * ```
 * @memberof IgxRadioComponent
 */
@HostBinding('class.igx-radio--focused')
    public focused = false;
/**
 * Sets the id of the `input` element in the radio component.
 * If not set, the `input` of the first radio component will have an id = `"igx-radio-0-input"`.
 * ```typescript
 * this.radio.inputId = "Input1";
 * ```
 * @memberof IgxRadioComponent
 */
public inputId = `${this.id}-input`;
    /**
     *@hidden
     */
    protected _value: any = null;

    constructor() { }
/**
 *@hidden
 */
private _onTouchedCallback: () => void = noop;
/**
 *@hidden
 */
private _onChangeCallback: (_: any) => void = noop;
/**
 *@hidden
 */
public _onRadioChange(event) {
        event.stopPropagation();
    }
/**
 *@hidden
 */
public _onRadioClick(event) {
        event.stopPropagation();
        this.select();
    }
/**
 *@hidden
 */
public _onLabelClick() {
        this.select();
    }
/**
 * If `disabled` is `false`, sets the `checked` value of the radio component to `true`.
 * Removes the focus on the radio.
 * Emits an event after the radio is selected.
 * ```typescript
 * this.radio.select();
 * ```
 * @memberof IgxRadioComponent
 */
public select() {
        if (this.disabled) {
            return;
        }

        this.checked = true;
        this.focused = false;
        this.change.emit({ value: this.value, radio: this });
        this._onChangeCallback(this.value);
    }
/**
 *@hidden
 */
public writeValue(value: any) {
        this._value = value;
        this.checked = (this._value === this.value);
    }
/**
 *@hidden
 */
public get labelClass(): string {
        switch (this.labelPosition) {
            case RadioLabelPosition.BEFORE:
                return `${this.cssClass}__label--before`;
            case RadioLabelPosition.AFTER:
            default:
                return `${this.cssClass}__label`;
        }
    }
/**
 *@hidden
 */
public onFocus(event) {
        this.focused = true;
    }
/**
 *@hidden
 */
public onBlur(event) {
        this.focused = false;
        this._onTouchedCallback();
    }
/**
 *@hidden
 */
public registerOnChange(fn: (_: any) => void) { this._onChangeCallback = fn; }
/**
 *@hidden
 */
public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }
}
/**
 *The IgxRadioModule proved the {@link IgxRadioComponent} inside your application.
 */
@NgModule({
    declarations: [IgxRadioComponent],
    exports: [IgxRadioComponent],
    imports: [IgxRippleModule]
})
export class IgxRadioModule { }
