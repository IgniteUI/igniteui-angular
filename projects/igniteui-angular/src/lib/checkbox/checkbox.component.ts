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
export class IgxCheckboxComponent implements ControlValueAccessor, EditorProvider {
    /**
     *@hidden
     */
    protected _value: any;
    /**
     * Returns reference to the native checkbox element.
     * ```typescript
     * let checkboxElement =  this.checkbox.checkboxElement;
     * ```
     * @memberof IgxSwitchComponent
     */
    @ViewChild('checkbox') public nativeCheckbox: ElementRef;
    /**
     * Returns reference to the native label element.
     * ```typescript
     * let labelElement =  this.checkbox.nativeLabel;
     * ```
     * @memberof IgxSwitchComponent
     */
    @ViewChild('label') public nativeLabel;
    /**
     * Returns reference to the label placeholder element.
     * ```typescript
     * let labelPlaceholder =  this.checkbox.placeholderLabel;
     * ```
     * @memberof IgxSwitchComponent
     */
    @ViewChild('placeholderLabel') public placeholderLabel;
    /**
     * Sets/gets the `id` of the checkbox component.
     * If not set, the `id` of the first checkbox component will be `"igx-checkbox-0"`.
     * ```html
     * <igx-checkbox id="my-first-checkbox"></igx-checkbox>
     * ```
     * ```typescript
     * let checkboxId =  this.checkbox.id;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @HostBinding('attr.id')
    @Input() public id = `igx-checkbox-${nextId++}`;
    /**
     * Sets/gets the id of the `label` element.
     * If not set, the id of the `label` in the first checkbox component will be `"igx-checkbox-0-label"`.
     * ```html
     * <igx-checkbox labelId = "Label1"></igx-checkbox>
     * ```
     * ```typescript
     * let labelId =  this.checkbox.labelId;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input() public labelId = `${this.id}-label`;
    /**
     * Sets/gets the `value` attribute.
     * ```html
     * <igx-checkbox [value] = "'CheckboxValue'"></igx-checkbox>
     * ```
     * ```typescript
     * let value =  this.checkbox.value;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input() public value: any;
    /**
     * Sets/gets the `name` attribute.
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
     * Sets/gets the value of the `tabindex` attribute.
     * ```html
     * <igx-checkbox [tabindex] = "1"></igx-checkbox>
     * ```
     * ```typescript
     * let tabIndex =  this.checkbox.tabindex;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input() public tabindex: number = null;
    /**
     *  Sets/gets the position of the `label`.
     *  If not set, the `labelPosition` will have value `"after"`.
     * ```html
     * <igx-checkbox labelPosition = "before"></igx-checkbox>
     * ```
     * ```typescript
     * let labelPosition =  this.checkbox.labelPosition;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input() public labelPosition: LabelPosition | string = LabelPosition.AFTER;
    /**
     * Enables/Disables the ripple effect.
     * If not set, `disableRipple` will have value `false`.
     * ```html
     * <igx-checkbox [disableRipple] = "true"></igx-checkbox>
     * ```
     * ```typescript
     * let isRippleDisabled = this.checkbox.desableRipple;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input() public disableRipple = false;
    /**
     * Sets/gets whether the checkbox is required.
     * If not set, `required` will have value `false`.
     * ```html
     * <igx-checkbox [required] = "true"></igx-checkbox>
     * ```
     * ```typescript
     * let isRequired =  this.checkbox.required;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input() public required = false;
    /**
     * Sets/gets the `aria-labelledby` attribute.
     * If not set, the `aria-labelledby` will be equal to the value of `labelId` attribute.
     * ```html
     * <igx-checkbox aria-labelledby = "Checkbox1"></igx-checkbox>
     * ```
     * ```typescript
     * let ariaLabelledBy =  this.checkbox.ariaLabelledBy;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input('aria-labelledby')
    public ariaLabelledBy = this.labelId;
    /**
     * Sets/gets the value of the `aria-label` attribute.
     * ```html
     * <igx-checkbox aria-label = "Checkbox1"></igx-checkbox>
     * ```
     * ```typescript
     * let ariaLabel = this.checkbox.aruaLabel;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @Input('aria-label')
    public ariaLabel: string | null = null;
    /**
     * An event that is emitted after the checkbox state is changed.
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
     * Sets/gets whether the checkbox component is on focus.
     * Default value is `false`.
     * ```typescript
     * this.checkbox.focused =  true;
     * ```
     * ```typescript
     * let isFocused =  this.checkbox.focused;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @HostBinding('class.igx-checkbox--focused')
    public focused = false;
    /**
     * Sets/gets the checkbox indeterminate visual state.
     * Default value is `false`;
     * ```html
     * <igx-checkbox [indeterminate] = "true"></igx-checkbox>
     * ```
     * ```typescript
     * let isIndeterminate = this.checkbox.indeterminate;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @HostBinding('class.igx-checkbox--indeterminate')
    @Input() public indeterminate = false;
    /**
     * Sets/gets whether the checkbox is checked.
     * Default value is `false`.
     * ```html
     * <igx-checkbox [checked] = "true"></igx-checkbox>
     * ```
     * ```typescript
     * let isChecked =  this.checkbox.checked;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @HostBinding('class.igx-checkbox--checked')
    @Input() public checked = false;
    /**
     * Sets/gets whether the checkbox is disabled.
     * Default value is `false`.
     * ```html
     * <igx-checkbox [disabled] = "true"></igx-checkbox>
     * ```
     * ```typescript
     * let isDesabled = this.checkbox.disabled;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @HostBinding('class.igx-checkbox--disabled')
    @Input() public disabled = false;
    /**
     * Sets/gets whether the checkbox should disable all css transitions.
     * Default value is `false`.
     * ```html
     * <igx-checkbox [disableTransitions]="true"></igx-checkbox>
     * ```
     * ```typescript
     * let disableTransitions = this.checkbox.disableTransitions;
     * ```
     * @memberof IgxCheckboxComponent
     */
    @HostBinding('class.igx-checkbox--plain')
    @Input() public disableTransitions = false;
    /**
     *@hidden
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
     * If `disabled` is `false`, switches the `checked` state.
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

        if (isIE()) {
            this.nativeCheckbox.nativeElement.blur();
        }

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

    /** @hidden */
    getEditElement() {
        return this.nativeCheckbox.nativeElement;
    }
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
 *The IgxCheckboxModule provides the {@link IgxCheckboxComponent} inside your application.
 */
@NgModule({
    declarations: [IgxCheckboxComponent, IgxCheckboxRequiredDirective],
    exports: [IgxCheckboxComponent, IgxCheckboxRequiredDirective],
    imports: [IgxRippleModule]
})
export class IgxCheckboxModule { }
