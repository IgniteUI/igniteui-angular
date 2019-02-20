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
    ViewChild,
    ElementRef
} from '@angular/core';
import { CheckboxRequiredValidator, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { isIE } from '../core/utils';
import { EditorProvider } from '../core/edit-provider';

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
export class IgxSwitchComponent implements ControlValueAccessor, EditorProvider {
    /**
     *@hidden
     */
    protected _value: any;
    /**
     * Returns reference to the native checkbox element.
     * ```typescript
     * let checkboxElement =  this.switch.nativeCheckbox;
     * ```
     * @memberof IgxSwitchComponent
     */
    @ViewChild('checkbox') public nativeCheckbox: ElementRef;
    /**
     * Returns reference to the native label element.
     * ```typescript
     * let labelElement =  this.switch.nativeLabel;
     * ```
     * @memberof IgxSwitchComponent
     */
    @ViewChild('label') public nativeLabel;
    /**
     * Returns reference to the label placeholder element.
     * ```typescript
     * let labelPlaceholder =  this.switch.placeholderLabel;
     * ```
     * @memberof IgxSwitchComponent
     */
    @ViewChild('placeholderLabel') public placeholderLabel;

    /**
     * Sets/gets the `id` of the switch component.
     * If not set, the `id` of the first switch component will be `"igx-switch-0"`.
     * ```html
     * <igx-switch id="my-first-switch"></igx-switch>
     * ```
     * ```typescript
     * let switchId =  this.switch.id;
     * ```
     * @memberof IgxSwitchComponent
     */
    @HostBinding('attr.id')
    @Input() public id = `igx-switch-${nextId++}`;
    /**
     * Sets/gets the id of the `label` element in the switch component.
     * If not set, the label of the first switch component will have value `"igx-switch-0-label"`.
     * ```html
     * <igx-switch labelId="Label1"></igx-switch>
     * ```
     * ```typescript
     * let labelId =  this.switch.labelId;
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input() public labelId = `${this.id}-label`;
    /**
     * Sets/gets the `value` attribute of the switch component.
     * ```html
     * <igx-switch [value] = "switchValue"></igx-switch>
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
     * <igx-switch name = "Switch1"></igx-switch>
     * ```
     * ```typescript
     * let name =  this.switch.name;
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input() public name: string;
    /**
     * Sets/gets the value of the `tabindex` attribute.
     * ```html
     * <igx-switch [tabindex]="1"></igx-switch>
     * ```
     * ```typescript
     * let tabIndex =  this.switch.tabindex;
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input() public tabindex: number = null;
    /**
     * Sets/gets the position of the `label` in the switch component.
     * If not set, `labelPosition` will have value `"after"`.
     * ```html
     * <igx-switch labelPosition="before"></igx-switch>
     * ```
     * ```typescript
     * let labelPosition =  this.switch.labelPosition;
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input() public labelPosition: SwitchLabelPosition | string = 'after';
    /**
     * Enables/Disables the ripple effect
     * If not set, `disableRipple` will have value `false`.
     * ```html
     * <igx-switch [disableRipple]="true"></igx-switch>
     * ```
     * ```typescript
     * let isRippleDisabled = this.switch.disableRipple;
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input() public disableRipple = false;
    /**
     * Sets/gets whether switch is required.
     * If not set, `required` will have value `false`.
     * ```html
     * <igx-switch [required]="true"></igx-switch>
     * ```
     * ```typescript
     * let isRequired = this.switch.required;
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input() public required = false;
    /**
     * Sets/gets the `aria-labelledBy` attribute.
     * If not set, the  value of `aria-labelledBy` will be equal to the value of `labelId` attribute.
     * ```html
     * <igx-switch aria-labelledby = "Label1"></igx-switch>
     * ```
     * ```typescript
     * let ariaLabelledBy = this.switch.ariaLabelledBy;
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input('aria-labelledby')
    public ariaLabelledBy = this.labelId;
    /**
     * Sets/gets the value of the `aria-label` attribute.
     * ```html
     * <igx-switch aria-label="Label1"></igx-switch>
     * ```
     * ```typescript
     * let ariaLabel =  this.switch.ariaLabel;
     * ```
     * @memberof IgxSwitchComponent
     */
    @Input('aria-label')
    public ariaLabel: string | null = null;
    /**
     * An event that is emitted after the switch state is changed.
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
     * Sets/gets whether the switch is on or off.
     * Default value is 'false'.
     * ```html
     *  <igx-switch [checked] = "true"></igx-switch>
     * ```
     * ```typescript
     * let isChecked =  this.switch.checked;
     * ```
     * @memberof IgxSwitchComponent
     */
    @HostBinding('class.igx-switch--checked')
    @Input() public checked = false;
    /**
     * Sets/gets the `disabled` attribute.
     * Default value is `false`.
     * ```html
     * <igx-switch [disabled] = "true"><igx-switch>
     * ```
     * ```typescript
     * let isDisabled =  this.switch.disabled;
     * ```
     * @memberof IgxSwitchComponent
     */
    @HostBinding('class.igx-switch--disabled')
    @Input() public disabled = false;
    /**
     * Sets/gets whether the switch component is on focus.
     * Default value is `false`.
     * ```typescript
     * this.switch.focused = true;
     * ```
     * ```typescript
     * let isFocused =  this.switch.focused;
     * ```
     * @memberof IgxSwitchComponent
     */
    @HostBinding('class.igx-switch--focused')
    public focused = false;
    /**
     *@hidden
     */
    public inputId = `${this.id}-input`;
    /**
     * Toggles the checked state of the switch.
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

        if (isIE()) {
            this.nativeCheckbox.nativeElement.blur();
        }
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
    /** @hidden */
    getEditElement() {
        return this.nativeCheckbox.nativeElement;
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
 * @hidden
 */
@NgModule({
    declarations: [IgxSwitchComponent, IgxSwitchRequiredDirective],
    exports: [IgxSwitchComponent, IgxSwitchRequiredDirective],
    imports: [IgxRippleModule]
})
export class IgxSwitchModule { }
