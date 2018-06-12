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

export enum LabelPosition {
    BEFORE = 'before',
    AFTER = 'after'
}

export interface IChangeCheckboxEventArgs {
    checked: boolean;
    checkbox: IgxCheckboxComponent;
}

const noop = () => { };
let nextId = 0;
/**
 * **Ignite UI for Angular Checkbox** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/checkbox.html)
 *
 * The Ignite UI Checkbox is a selection control that allows users to make a binary choice. It behaves similarly
 * to the native browser checkbox.
 *
 * Example:
 * ```html
 * <igx-checkbox checked="true">
 *   simple checkbox
 * </igx-checkbox>
 * ```
 */
@Component({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxCheckboxComponent, multi: true }],
    selector: 'igx-checkbox',
    preserveWhitespaces: false,
    templateUrl: 'checkbox.component.html'
})
export class IgxCheckboxComponent implements ControlValueAccessor {
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
     * Sets the `id` of the checkbox component.
     * If not set, the `id` of the first checkbox component will be `"igx-checkbox-0"`.
     * ```html
     * <igx-checkbox id="my-first-checkbox"></igx-checkbox>
     * ```
     * @memberof IgxCheckboxComponent
     */
    @HostBinding('attr.id')
    @Input() public id = `igx-checkbox-${nextId++}`;
    /**
     * Sets the id of the `label` element in the checkbox component.
     * If not set, the id of the `label` in the first component will be `"igx-checkbox-0-label"`.
     * ```html
     * <igx-checkbox labelId = "Label1"></igx-checkbox>
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input() public labelId = `${this.id}-label`;
    /**
     * Sets/gets the `value` attribute of the checkbox component.
     * ```html
     * <igx-checkbox [value] = "1"></igx-checkbox>
     * ```
     * ```typescript
     * let value =  this.checkbox.value;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input() public value: any;
    /**
     * Sets/gets the `name` attribute of the checkbox component.
     * ```html
     * <igx-checkbox name = "Checkbox1"></igx-checkbox>
     * ```
     * ```typescript
     * let name =  this.checkbox.name;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input() public name: string;
    /**
     * Sets the value of the `tabindex` attribute of the checkbox component.
     * ```html
     * <igx-checkbox [tabindex] = "1"></igx-checkbox>
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input() public tabindex: number = null;
    /**
     *  Sets the position of the `label` in the checkbox component.
     *  If not set, the `labelPosition` will have value `"after"`.
     * ```html
     * <igx-checkbox labelPosition = "before"></igx-checkbox>
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input() public labelPosition: LabelPosition | string = LabelPosition.AFTER;
    /**
     * Sets the `disableRipple` attribute of the checkbox component.
     * If not set, `disableRipple` will have value `false`.
     * ```html
     * <igx-checkbox [disableRipple] = "true"></igx-checkbox>
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input() public disableRipple = false;
    /**
     * Sets the whether state of the checkbox component should be required.
     * If not set, `required` will have value `false`.
     * ```html
     * <igx-checkbox [required] = "true"></igx-checkbox>
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input() public required = false;
    /**
     * Sets the `aria-labelledby` attribute of the checkbox component.
     * If not set, the `aria-labelledby` will be equal to the value of `labelId` attribute.
     * ```html
     * <igx-checkbox aria-labelledby = "Checkbox1"></igx-checkbox>
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input('aria-labelledby')
    public ariaLabelledBy = this.labelId;
    /**
     * Sets the value of the `aria-label` attribute of the checkbox component.
     * ```html
     * <igx-checkbox aria-label = "Checkbox1"></igx-checkbox>
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input('aria-label')
    public ariaLabel: string | null = null;
    /**
     * An even that is emitted when the checkbox state is changed.
     * Provides references to the `IgxCheckboxComponent` and the `checked` property as event arguments.
     * @memberof IgxCheckboxComponent
     */
    @Output()
    readonly change: EventEmitter<IChangeCheckboxEventArgs> = new EventEmitter<IChangeCheckboxEventArgs>();
    /**
     * Returns the class of the checkbox component.
     * ```typescript
     * let class =  this.checkbox.cssClass;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @HostBinding('class.igx-checkbox')
    public cssClass = 'igx-checkbox';
    /**
     * Sets whether the checkbox component is on focus.
     * Default value is `false`.
     * ```typescript
     * this.checkbox.focused =  true;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @HostBinding('class.igx-checkbox--focused')
    public focused = false;
    /**
     * Indicates if the state of the checkbox is not determined.
     * Default value is `false`;
     * ```html
     * <igx-checkbox [indeterminate] = "true"></igx-checkbox>
     * ```
     * @memberof IgxCheckboxComponent
     */
    @HostBinding('class.igx-checkbox--indeterminate')
    @Input() public indeterminate = false;
    /**
     * Sets whether the checkbox is checked.
     * Default value is `false`.
     * ```html
     * <igx-checkbox [checked] = "true"></igx-checkbox>
     * ```
     * @memberof IgxCheckboxComponent
     */
    @HostBinding('class.igx-checkbox--checked')
    @Input() public checked = false;
    /**
     * Sets whether the checkbox is disabled.
     * Default value is `false`.
     * ```html
     * <igx-checkbox [disabled] = "true"></igx-checkbox>
     * ```
     * @memberof IgxCheckboxComponent
     */
    @HostBinding('class.igx-checkbox--disabled')
    @Input() public disabled = false;
    /**
     * Sets the id of the `input` element in the checkbox component.
     * If not set, the `input` of the first component will have an id=`"igx-checkbox-0-input"`.
     * ```typescript
     * this.checkbox.inputId = "Input1";
     * ```
     * @memberof IgxCheckboxComponent
     */
    public inputId = `${this.id}-input`;
    /**
     *@hidden
     */
    private _onTouchedCallback: () => void = noop;
    /**
     * @hidden
     */
    private _onChangeCallback: (_: any) => void = noop;
    /**
     * If `disabled` is `false`, inverts the `checked` value of the checkbox component.
     * Removes the focus on the checkbox.
     * Removes the indeterminate state of the checkbox.
     * Emits an event after the checkbox is toggled.
     * ```typescript
     * this.checkbox.toggle();
     * ```
     * @memberof IgxCheckboxComponent
     */
    public toggle() {
        if (this.disabled) {
            return;
        }

        this.indeterminate = false;
        this.focused = false;
        this.checked = !this.checked;

        this.change.emit({ checked: this.checked, checkbox: this });
        this._onChangeCallback(this.checked);
    }
    /**
     *@hidden
     */
    public _onCheckboxChange(event) {
        // We have to stop the original checkbox change event
        // from bubbling up since we emit our own change event
        event.stopPropagation();
    }
    /**
     *@hidden
     */
    public _onCheckboxClick(event) {
        // Since the original checkbox is hidden and the label
        // is used for styling and to change the checked state of the checkbox,
        // we need to prevent the checkbox click event from bubbling up
        // as it gets triggered on label click
        event.stopPropagation();
        this.toggle();
    }
    /**
     *@hidden
     */
    public _onLabelClick(event) {
        // We use a span element as a placeholder label
        // in place of the native label, we need to emit
        // the change event separately here alongside
        // the click event emitted on click
        this.toggle();
    }
    /**
     *hidden
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
            case LabelPosition.BEFORE:
                return `${this.cssClass}__label--before`;
            case LabelPosition.AFTER:
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

export const IGX_CHECKBOX_REQUIRED_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => IgxCheckboxRequiredDirective),
    multi: true
};

/* tslint:disable directive-selector */
@Directive({
    selector: `igx-checkbox[required][formControlName],
    igx-checkbox[required][formControl],
    igx-checkbox[required][ngModel]`,
    providers: [IGX_CHECKBOX_REQUIRED_VALIDATOR]
})
export class IgxCheckboxRequiredDirective extends CheckboxRequiredValidator { }
/**
 *The IgxCheckboxModule proved the {@link IgxCheckboxComponent} inside your application.
 */
@NgModule({
    declarations: [IgxCheckboxComponent, IgxCheckboxRequiredDirective],
    exports: [IgxCheckboxComponent, IgxCheckboxRequiredDirective],
    imports: [IgxRippleModule]
})
export class IgxCheckboxModule { }
