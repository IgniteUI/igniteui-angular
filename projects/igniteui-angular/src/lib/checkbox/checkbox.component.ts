import {
    Component,
    Directive,
    EventEmitter,
    HostListener,
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
import { IBaseEventArgs, mkenum } from '../core/utils';
import { EditorProvider } from '../core/edit-provider';
import { noop } from 'rxjs';

export const LabelPosition = mkenum({
    BEFORE: 'before',
    AFTER: 'after'
});
export type LabelPosition = typeof LabelPosition[keyof typeof LabelPosition];

export interface IChangeCheckboxEventArgs extends IBaseEventArgs {
    checked: boolean;
    checkbox: IgxCheckboxComponent;
}

let nextId = 0;
/**
 * Allows users to make a binary choice for a certain condition.
 *
 * @igxModule IgxCheckboxModule
 *
 * @igxTheme igx-checkbox-theme
 *
 * @igxKeywords checkbox, label
 *
 * @igxGroup Data entry and display
 *
 * @remarks
 * The Ignite UI Checkbox is a selection control that allows users to make a binary choice for a certain condition.It behaves similarly
 * to the native browser checkbox.
 *
 * @example
 * ```html
 * <igx-checkbox [checked]="true">
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
    private static ngAcceptInputType_required: boolean | '';
    private static ngAcceptInputType_disabled: boolean | '';
    /**
     * An event that is emitted after the checkbox state is changed.
     * Provides references to the `IgxCheckboxComponent` and the `checked` property as event arguments.
     */
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() public readonly change: EventEmitter<IChangeCheckboxEventArgs> = new EventEmitter<IChangeCheckboxEventArgs>();
    /**
     * Returns reference to the native checkbox element.
     *
     * @example
     * ```typescript
     * let checkboxElement =  this.checkbox.checkboxElement;
     * ```
     */
    @ViewChild('checkbox', { static: true }) public nativeCheckbox: ElementRef;
    /**
     * Returns reference to the native label element.
     * ```typescript
     *
     * @example
     * let labelElement =  this.checkbox.nativeLabel;
     * ```
     */
    @ViewChild('label', { static: true })
    public nativeLabel: ElementRef;
    /**
     * Returns reference to the label placeholder element.
     * ```typescript
     *
     * @example
     * let labelPlaceholder =  this.checkbox.placeholderLabel;
     * ```
     */
    @ViewChild('placeholderLabel', { static: true })
    public placeholderLabel: ElementRef;
    /**
     * Sets/gets the `id` of the checkbox component.
     * If not set, the `id` of the first checkbox component will be `"igx-checkbox-0"`.
     *
     * @example
     * ```html
     * <igx-checkbox id="my-first-checkbox"></igx-checkbox>
     * ```
     * ```typescript
     * let checkboxId =  this.checkbox.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-checkbox-${nextId++}`;
    /**
     * Sets/gets the id of the `label` element.
     * If not set, the id of the `label` in the first checkbox component will be `"igx-checkbox-0-label"`.
     *
     * @example
     * ```html
     * <igx-checkbox labelId = "Label1"></igx-checkbox>
     * ```
     * ```typescript
     * let labelId =  this.checkbox.labelId;
     * ```
     */
    @Input() public labelId = `${this.id}-label`;
    /**
     * Sets/gets the `value` attribute.
     *
     * @example
     * ```html
     * <igx-checkbox [value] = "'CheckboxValue'"></igx-checkbox>
     * ```
     * ```typescript
     * let value =  this.checkbox.value;
     * ```
     */
    @Input() public value: any;
    /**
     * Sets/gets the `name` attribute.
     *
     * @example
     * ```html
     * <igx-checkbox name = "Checkbox1"></igx-checkbox>
     * ```
     * ```typescript
     * let name =  this.checkbox.name;
     * ```
     */
    @Input() public name: string;
    /**
     * Sets/gets the value of the `tabindex` attribute.
     *
     * @example
     * ```html
     * <igx-checkbox [tabindex] = "1"></igx-checkbox>
     * ```
     * ```typescript
     * let tabIndex =  this.checkbox.tabindex;
     * ```
     */
    @Input() public tabindex: number = null;
    /**
     *  Sets/gets the position of the `label`.
     *  If not set, the `labelPosition` will have value `"after"`.
     *
     * @example
     * ```html
     * <igx-checkbox labelPosition = "before"></igx-checkbox>
     * ```
     * ```typescript
     * let labelPosition =  this.checkbox.labelPosition;
     * ```
     */
    @Input() public labelPosition: LabelPosition | string = LabelPosition.AFTER;
    /**
     * Enables/Disables the ripple effect.
     * If not set, `disableRipple` will have value `false`.
     *
     * @example
     * ```html
     * <igx-checkbox [disableRipple] = "true"></igx-checkbox>
     * ```
     * ```typescript
     * let isRippleDisabled = this.checkbox.desableRipple;
     * ```
     */
    @Input() public disableRipple = false;
    /**
     * Sets/gets whether the checkbox is required.
     * If not set, `required` will have value `false`.
     *
     * @example
     * ```html
     * <igx-checkbox required></igx-checkbox>
     * ```
     * ```typescript
     * let isRequired =  this.checkbox.required;
     * ```
     */
     @Input()
     public get required(): boolean {
         return this._required;
     }
     public set required(value: boolean) {
         this._required = (value as any === '') || value;
     }
    /**
     * Sets/gets the `aria-labelledby` attribute.
     * If not set, the `aria-labelledby` will be equal to the value of `labelId` attribute.
     *
     * @example
     * ```html
     * <igx-checkbox aria-labelledby = "Checkbox1"></igx-checkbox>
     * ```
     * ```typescript
     * let ariaLabelledBy =  this.checkbox.ariaLabelledBy;
     * ```
     */
    @Input('aria-labelledby')
    public ariaLabelledBy = this.labelId;
    /**
     * Sets/gets the value of the `aria-label` attribute.
     *
     * @example
     * ```html
     * <igx-checkbox aria-label = "Checkbox1"></igx-checkbox>
     * ```
     * ```typescript
     * let ariaLabel = this.checkbox.ariaLabel;
     * ```
     */
    @Input('aria-label')
    public ariaLabel: string | null = null;
    /**
     * Returns the class of the checkbox component.
     *
     * @example
     * ```typescript
     * let class =  this.checkbox.cssClass;
     * ```
     */
    @HostBinding('class.igx-checkbox')
    public cssClass = 'igx-checkbox';
    /**
     * Sets/gets whether the checkbox component is on focus.
     * Default value is `false`.
     *
     * @example
     * ```typescript
     * this.checkbox.focused =  true;
     * ```
     * ```typescript
     * let isFocused =  this.checkbox.focused;
     * ```
     */
    @HostBinding('class.igx-checkbox--focused')
    public focused = false;
    /**
     * Sets/gets the checkbox indeterminate visual state.
     * Default value is `false`;
     *
     * @example
     * ```html
     * <igx-checkbox [indeterminate] = "true"></igx-checkbox>
     * ```
     * ```typescript
     * let isIndeterminate = this.checkbox.indeterminate;
     * ```
     */
    @HostBinding('class.igx-checkbox--indeterminate')
    @Input()
    public indeterminate = false;
    /**
     * Sets/gets whether the checkbox is checked.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-checkbox [checked] = "true"></igx-checkbox>
     * ```
     * ```typescript
     * let isChecked =  this.checkbox.checked;
     * ```
     */
    @HostBinding('class.igx-checkbox--checked')
    @Input()
    public get checked() {
        return this._checked;
    }
    public set checked(value: boolean) {
        if(this._checked !== value) {
            this._checked = value;
            this._onChangeCallback(this._checked);
        }
    }

    /**
     * Sets/gets whether the checkbox is disabled.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-checkbox disabled></igx-checkbox>
     * ```
     * ```typescript
     * let isDisabled = this.checkbox.disabled;
     * ```
     */
    @HostBinding('class.igx-checkbox--disabled')
    @Input()
    public get disabled(): boolean {
        return this._disabled;
    }
    public set disabled(value: boolean) {
        this._disabled = (value as any === '') || value;
    }
    /**
     * Sets/gets whether the checkbox is readonly.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-checkbox [readonly]="true"></igx-checkbox>
     * ```
     * ```typescript
     * let readonly = this.checkbox.readonly;
     * ```
     */
    @Input() public readonly = false;
    /**
     * Sets/gets whether the checkbox should disable all css transitions.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-checkbox [disableTransitions]="true"></igx-checkbox>
     * ```
     * ```typescript
     * let disableTransitions = this.checkbox.disableTransitions;
     * ```
     */
    @HostBinding('class.igx-checkbox--plain')
    @Input()
    public disableTransitions = false;
    /** @hidden @internal */
    public inputId = `${this.id}-input`;
    /**
     * @hidden
     * @internal
     */
    private _checked = false;
    /**
     * @hidden
     * @internal
     */
    private _required = false;
    /**
     * @hidden
     * @internal
     */
    private _disabled = false;
    /**
     * @hidden
     */
    private _onTouchedCallback: () => void = noop;
    /**
     * @hidden
     */
    private _onChangeCallback: (_: any) => void = noop;
    /** @hidden @internal */
    @HostListener('keyup', ['$event'])
    public onKeyUp(event: KeyboardEvent) {
        event.stopPropagation();
        this.focused = true;
    }
    /** @hidden @internal */
    @HostListener('click', ['$event'])
    public _onCheckboxClick(event: MouseEvent) {
        // Since the original checkbox is hidden and the label
        // is used for styling and to change the checked state of the checkbox,
        // we need to prevent the checkbox click event from bubbling up
        // as it gets triggered on label click
        // NOTE: The above is no longer valid, as the native checkbox is not labeled
        // by the SVG anymore.
        if (this.disabled || this.readonly) {
            // readonly prevents the component from changing state (see toggle() method).
            // However, the native checkbox can still be activated through user interaction (focus + space, label click)
            // Prevent the native change so the input remains in sync
            event.preventDefault();
            return;
        }

        this.nativeCheckbox.nativeElement.focus();

        this.indeterminate = false;
        this.checked = !this.checked;
        // K.D. March 23, 2021 Emitting on click and not on the setter because otherwise every component
        // bound on change would have to perform self checks for weather the value has changed because
        // of the initial set on initialization
        this.change.emit({ checked: this._checked, checkbox: this });
    }

    /**
     * @hidden
     * @internal
     */
    public get ariaChecked() {
       if (this.indeterminate) {
           return 'mixed';
       } else {
           return this.checked;
       }
    }

    /** @hidden @internal */
    public _onCheckboxChange(event: Event) {
        // We have to stop the original checkbox change event
        // from bubbling up since we emit our own change event
        event.stopPropagation();
    }

    /** @hidden @internal */
    public onBlur() {
        this.focused = false;
        this._onTouchedCallback();
    }

    /** @hidden @internal */
    public writeValue(value: boolean) {
        if (typeof value === 'boolean') {
            this._checked = value;
        }
    }

    /** @hidden @internal */
    public get labelClass(): string {
        switch (this.labelPosition) {
            case LabelPosition.BEFORE:
                return `${this.cssClass}__label--before`;
            case LabelPosition.AFTER:
            default:
                return `${this.cssClass}__label`;
        }
    }

    /** @hidden @internal */
    public registerOnChange(fn: (_: any) => void) {
        this._onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: () => void) {
        this._onTouchedCallback = fn;
    }

    /** @hidden @internal */
    public getEditElement() {
        return this.nativeCheckbox.nativeElement;
    }
}

export const IGX_CHECKBOX_REQUIRED_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => IgxCheckboxRequiredDirective),
    multi: true
};

/* eslint-disable  @angular-eslint/directive-selector */
@Directive({
    selector: `igx-checkbox[required][formControlName],
    igx-checkbox[required][formControl],
    igx-checkbox[required][ngModel]`,
    providers: [IGX_CHECKBOX_REQUIRED_VALIDATOR]
})
export class IgxCheckboxRequiredDirective extends CheckboxRequiredValidator {}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxCheckboxComponent, IgxCheckboxRequiredDirective],
    exports: [IgxCheckboxComponent, IgxCheckboxRequiredDirective],
    imports: [IgxRippleModule]
})
export class IgxCheckboxModule {}
