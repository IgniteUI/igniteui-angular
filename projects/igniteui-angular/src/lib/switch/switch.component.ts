import {
    Component,
    Directive,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    NgModule,
    Output,
    Provider,
    ViewChild
} from '@angular/core';
import { CheckboxRequiredValidator, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';

export enum SwitchLabelPosition {
    BEFORE = 'before',
    AFTER = 'after'
}

export interface IChangeSwitchEventArgs {
    checked: boolean;
    switch: IgxSwitchComponent;
}

const noop = () => { };
let nextId = 0;
/**
 * **Ignite UI for Angular Switch** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/switch.html)
 *
 * The Ignite UI Switch lets the user toggle between on/off or true/false states.
 *
 * Example:
 * ```html
 * <igx-switch [checked]="true">
 *   Simple switch
 * </igx-switch>
 * ```
 */
@Component({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxSwitchComponent, multi: true }],
    selector: 'igx-switch',
    templateUrl: 'switch.component.html'
})
export class IgxSwitchComponent implements ControlValueAccessor {
    /**
     *@hidden
     */
    protected _value: any;
    /**
     *@hidden
     */
    @ViewChild('checkbox') public nativeCheckbox;
    /**
     *@hidden
     */
    @ViewChild('label') public nativeLabel;
    /**
     *@hidden
     */
    @ViewChild('placeholderLabel') public placeholderLabel;

    /**
     * Sets the `id` of the switch component.
     * If not set, the `id` of the first switch component will be `"igx-switch-0"`.
     * ```html
     * <igx-switch id="my-first-switch"></igx-switch>
     * ```
     * @memberof IgxSwitchComponent
     */
    @HostBinding('attr.id')
    @Input() public id = `igx-switch-${nextId++}`;
    /**
     * Sets the id of the `label` element in the switch component.
     * If not set, the label of the first switch component will have an id=`"igx-switch-0-label"`;
     * ```html
     * <igx-switch labrlId="Label1"></igx-switch>
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input() public labelId = `${this.id}-label`;
    /**
     * Sets/gets the `value` attribute of the switch component.
     * ```html
     * <igx-switch [value] = "1"></igx-switch>
     * ```
     * ```typescript
     * let value =  this.switch.value;
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input() public value: any;
    /**
     * Sets/gets the `name` attribute of the switch component.
     * ```html
     * <igx-switch name = "switch1"></igx-switch>
     * ```
     * ```typescript
     * let name =  this.switch.name;
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input() public name: string;
    /**
     * Sets the value of the `tabindex` attribute of the switch component.
     * ```html
     * <igx-switch [labelPosition]="1"></igx-switch>
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input() public tabindex: number = null;
    /**
     * Sets the position of the `label` in the switch component.
     * If not set, `labelPosition` will have value `"after"`.
     * ```html
     * <igx-switch labelPosition="before"></igx-switch>
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input() public labelPosition: SwitchLabelPosition | string = 'after';
    /**
     * Sets the `disableRipple` attribute of the switch component.
     * If not set, `disableRipple` will have value `false`.
     * ```html
     * <igx-switch [disableRipple]="true"></igx-switch>
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input() public disableRipple = false;
    /**
     * Sets the required state of the switch component.
     * If not set, the required state will have value `false`.
     * ```html
     * <igx-switch [required]="true"></igx-switch>
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input() public required = false;
    /**
     * Sets the `aria-labelledBy` attribute of the switch component.
     * If not set, the  value of `aria-labelledBy` will be equal to the value of `labelId` attribute.
     * ```
     * <igx-switch aria-labelledby = "Switch1"></igx-switch>
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input('aria-labelledby')
    public ariaLabelledBy = this.labelId;
    /**
     * Sets the value of the `aria-label` attribute of the switch component.
     * ```html
     * <igx-switch aria-label="Switch1"></igx-switch>
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input('aria-label')
    public ariaLabel: string | null = null;
    /**
     * An event that is emitted when the switch state is changed.
     * Provides references to the `IgxSwitchComponent` and the `checked` property as event arguments.
     * @memberof IgxSwitchComponent
     */
    @Output()
    readonly change: EventEmitter<IChangeSwitchEventArgs> = new EventEmitter<IChangeSwitchEventArgs>();
    /**
     *@hidden
     * @memberof IgxSwitchComponent
     */
    private _onTouchedCallback: () => void = noop;
    /**
     *@hidden
     * @memberof IgxSwitchComponent
     */
    private _onChangeCallback: (_: any) => void = noop;
    /**
     * Returns the class of the switch component.
     * ```typescript
     * let switchClass = this.switch.cssClass;
     * ```
     * @memberof IgxSwitchComponent
     */
    @HostBinding('class.igx-switch')
    public cssClass = 'igx-switch';
    /**
     * Sets whether the switch is on or off.
     * Default value is 'false'.
     * ```html
     *  <igx-switch [checked] = "true"></igx-switch>
     * ```
     * @memberof IgxSwitchComponent
     */
    @HostBinding('class.igx-switch--checked')
    @Input() public checked = false;
    /**
     * Sets whether the switch is desabled.
     * Default value is `false`.
     * ```html
     * <igx-switch [desabled] = "true"><igx-switch>
     * ```
     * @memberof IgxSwitchComponent
     */
    @HostBinding('class.igx-switch--disabled')
    @Input() public disabled = false;
    /**
     * Sets whether the switch component is on focus.
     * Default value is `false`.
     * ```typescript
     * this.switch.focused = true;
     * ```
     * @memberof IgxSwitchComponent
     */
    @HostBinding('class.igx-switch--focused')
    public focused = false;
    /**
     * Sets the id of the `input` element in the switch component.
     * If not set, the `input` of the first switch component will have na id=`"igx-switch-0-input"`.
     * ```typescript
     * this.switch.inputId = "Input1";
     * ```
     * @memberof IgxSwitchComponent
     */
    public inputId = `${this.id}-input`;
    /**
     * If `disabled` is `false`, inverts the `checked` value of the switch component.
     * Removes the focus on the switch.
     * Emits an event after the switch is toggled.
     * ```typescript
     * this.switch.toggle();
     * ```
     * @memberof IgxSwitchComponent
     */
    public toggle() {
        if (this.disabled) {
            return;
        }

        this.checked = !this.checked;
        this.focused = false;
        this.change.emit({ checked: this.checked, switch: this });
        this._onChangeCallback(this.checked);
    }
    /**
     *@hidden
     */
    public _onSwitchChange(event) {
        event.stopPropagation();
    }
    /**
     *@hidden
     */
    public _onSwitchClick(event) {
        event.stopPropagation();
        this.toggle();
    }
    /**
     *@hidden
     */
    public _onLabelClick(event) {
        this.toggle();
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
    public writeValue(value) {
        this._value = value;
        this.checked = !!this._value;
    }
    /**
     *@hidden
     */
    public get labelClass(): string {
        switch (this.labelPosition) {
            case SwitchLabelPosition.BEFORE:
                return `${this.cssClass}__label--before`;
            case SwitchLabelPosition.AFTER:
            default:
                return `${this.cssClass}__label`;
        }
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

export const IGX_SWITCH_REQUIRED_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => IgxSwitchRequiredDirective),
    multi: true
};

/* tslint:disable directive-selector */
@Directive({
    selector: `igx-switch[required][formControlName],
    igx-switch[required][formControl],
    igx-switch[required][ngModel]`,
    providers: [IGX_SWITCH_REQUIRED_VALIDATOR]
})
export class IgxSwitchRequiredDirective extends CheckboxRequiredValidator { }
/**
 * The IgxSwitchModule proved the {@link IgxSwitchComponent} inside your application.
 */
@NgModule({
    declarations: [IgxSwitchComponent, IgxSwitchRequiredDirective],
    exports: [IgxSwitchComponent, IgxSwitchRequiredDirective],
    imports: [IgxRippleModule]
})
export class IgxSwitchModule { }
