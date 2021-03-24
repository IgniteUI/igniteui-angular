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
    ElementRef,
    HostListener
} from '@angular/core';
import { CheckboxRequiredValidator, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IBaseEventArgs, mkenum } from '../core/utils';
import { EditorProvider } from '../core/edit-provider';
import { noop } from 'rxjs';

export const SwitchLabelPosition = mkenum({
    BEFORE: 'before',
    AFTER: 'after'
});
export type SwitchLabelPosition = (typeof SwitchLabelPosition)[keyof typeof SwitchLabelPosition];

export interface IChangeSwitchEventArgs extends IBaseEventArgs {
    checked: boolean;
    switch: IgxSwitchComponent;
}

let nextId = 0;
/**
 *
 * The Switch component is a binary choice selection component.
 *
 * @igxModule IgxSwitchModule
 *
 * @igxTheme igx-switch-theme, igx-tooltip-theme
 *
 * @igxKeywords switch, states, tooltip
 *
 * @igxGroup Data Entry & Display
 *
 * @remarks
 *
 * The Ignite UI Switch lets the user toggle between on/off or true/false states.
 *
 * @example
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
    private static ngAcceptInputType_required: boolean | '';
    private static ngAcceptInputType_disabled: boolean | '';
    /**
     * Returns a reference to the native checkbox element.
     *
     * @example
     * ```typescript
     * let checkboxElement =  this.switch.nativeCheckbox;
     * ```
     */
    @ViewChild('checkbox', { static: true }) public nativeCheckbox: ElementRef;
    /**
     * Returns reference to the native label element.
     *
     * @example
     * ```typescript
     * let labelElement =  this.switch.nativeLabel;
     * ```
     */
    @ViewChild('label', { static: true })
    public nativeLabel: ElementRef;
    /**
     * Returns reference to the label placeholder element.
     *
     * @example
     * ```typescript
     * let labelPlaceholder = this.switch.placeholderLabel;
     * ```
     */
    @ViewChild('placeholderLabel', { static: true })
    public placeholderLabel: ElementRef;

    /**
     * Sets/gets the `id` of the switch component.
     * If not set, the `id` of the first switch component will be `"igx-switch-0"`.
     *
     * @example
     * ```html
     * <igx-switch id="my-first-switch"></igx-switch>
     * ```
     */
    @HostBinding('attr.id')
    @Input() public id = `igx-switch-${nextId++}`;
    /**
     * Sets/gets the id of the `label` element of the switch component.
     * If not set, the label of the first switch component will have value `"igx-switch-0-label"`.
     *
     * @example
     * ```html
     * <igx-switch labelId="Label1"></igx-switch>
     * ```
     */
    @Input() public labelId = `${this.id}-label`;
    /**
     * Sets/gets the `value` attribute of the switch component.
     *
     * @example
     * ```html
     * <igx-switch [value]="switchValue"></igx-switch>
     * ```
     */
    @Input() public value: any;
    /**
     * Sets/gets the `name` attribute of the switch component.
     *
     * @example
     * ```html
     * <igx-switch name="Switch1"></igx-switch>
     * ```
     */
    @Input() public name: string;
    /**
     * Sets/gets the value of the `tabindex` attribute.
     *
     * @example
     * ```html
     * <igx-switch [tabindex]="1"></igx-switch>
     * ```
     */
    @Input() public tabindex: number = null;
    /**
     * Sets/gets the position of the `label` in the switch component.
     * If not set, `labelPosition` will have value `"after"`.
     *
     * @example
     * ```html
     * <igx-switch labelPosition="before"></igx-switch>
     * ```
     */
    @Input() public labelPosition: SwitchLabelPosition | string = 'after';
    /**
     * Enables/Disables the ripple effect
     * If not set, `disableRipple` will have value `false`.
     *
     * @example
     * ```html
     * <igx-switch [disableRipple]="true"></igx-switch>
     * ```
     */
    @Input() public disableRipple = false;
    /**
     * Sets/gets whether switch is required.
     * If not set, `required` will have value `false`.
     *
     * @example
     * ```html
     * <igx-switch required></igx-switch>
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
     * Sets/gets the `aria-labelledBy` attribute.
     * If not set, the  value of `aria-labelledBy` will be equal to the value of `labelId` attribute.
     *
     * @example
     * ```html
     * <igx-switch aria-labelledby = "Label1"></igx-switch>
     * ```
     */
    @Input('aria-labelledby')
    public ariaLabelledBy = this.labelId;
    /**
     * Sets/gets the value of the `aria-label` attribute.
     *
     * @example
     * ```html
     * <igx-switch aria-label="Label1"></igx-switch>
     * ```
     */
    @Input('aria-label')
    public ariaLabel: string | null = null;
    /**
     * An event that is emitted after the switch state is changed.
     * Provides references to the `IgxSwitchComponent` and the `checked` property as event arguments.
     */
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output()
    public readonly change: EventEmitter<IChangeSwitchEventArgs> = new EventEmitter<IChangeSwitchEventArgs>();
    /**
     * Returns the class of the switch component.
     *
     * @example
     * ```typescript
     * let switchClass = this.switch.cssClass;
     * ```
     */
    @HostBinding('class.igx-switch')
    public cssClass = 'igx-switch';
    /**
     * Sets/gets whether the switch is on or off.
     * Default value is 'false'.
     *
     * @example
     * ```html
     *  <igx-switch [checked]="true"></igx-switch>
     * ```
     */
    @HostBinding('class.igx-switch--checked')
    @Input()
    public set checked(value: boolean) {
        if(this._checked !== value) {
            this._checked = value;
            this.change.emit({ checked: this.checked, switch: this });
            this._onChangeCallback(this.checked);
        }
    }
    public get checked() {
        return this._checked;
    }
    /**
     * Sets/gets the `disabled` attribute.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-switch disabled><igx-switch>
     * ```
     */
    @HostBinding('class.igx-switch--disabled')
    @Input()
    public get disabled(): boolean {
        return this._disabled;
    }
    public set disabled(value: boolean) {
        this._disabled = (value as any === '') || value;
    }
    /**
     * Sets/gets whether the switch component is on focus.
     * Default value is `false`.
     *
     * @example
     * ```typescript
     * this.switch.focused = true;
     * ```
     */
    @HostBinding('class.igx-switch--focused')
    public focused = false;
    /**
     * @hidden
     * @internal
     */
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
     * @internal
     */
    private _onTouchedCallback: () => void = noop;
    /**
     * @hidden
     * @internal
     */
    private _onChangeCallback: (_: any) => void = noop;
    /**
     * @hidden
     * @internal
     */
    @HostListener('keyup', ['$event'])
    public onKeyUp(event: KeyboardEvent) {
        event.stopPropagation();
        this.focused = true;
    }
    /**
     * @hidden
     * @internal
     */
    @HostListener('click')
    public _onSwitchClick() {
        this.toggle();
    }

    /**
     * Toggles the checked state of the switch.
     *
     * @example
     * ```typescript
     * this.switch.toggle();
     * ```
     */
    public toggle() {
        if (this.disabled) {
            return;
        }

        this.nativeCheckbox.nativeElement.focus();

        this.checked = !this.checked;
    }
    /**
     * @hidden
     * @internal
     */
    public _onSwitchChange(event: Event) {
        event.stopPropagation();
    }
    /**
     * @hidden
     * @internal
     */
    public onBlur() {
        this.focused = false;
        this._onTouchedCallback();
    }
    /**
     * @hidden
     * @internal
     */
    public writeValue(value: boolean) {
        if (typeof value === 'boolean') {
            this._checked = value;
        }
    }
    /**
     * @hidden
     * @internal
     */
    public getEditElement() {
        return this.nativeCheckbox.nativeElement;
    }
    /**
     * @hidden
     * @internal
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
     * @hidden
     * @internal
     */
    public registerOnChange(fn: (_: any) => void) {
        this._onChangeCallback = fn;
    }
    /**
     * @hidden
     * @internal
     */
    public registerOnTouched(fn: () => void) {
        this._onTouchedCallback = fn;
    }
}

export const IGX_SWITCH_REQUIRED_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => IgxSwitchRequiredDirective),
    multi: true
};

/* eslint-disable  @angular-eslint/directive-selector */
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
