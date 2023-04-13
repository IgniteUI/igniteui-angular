import {
    Component,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    Output,
    ViewChild,
    ElementRef,
    HostListener,
    AfterViewInit,
    ChangeDetectorRef,
    Renderer2,
    Self,
    Optional
} from '@angular/core';
import { ControlValueAccessor, NgControl, Validators } from '@angular/forms';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IBaseEventArgs, mkenum } from '../core/utils';
import { EditorProvider, EDITOR_PROVIDER } from '../core/edit-provider';
import { noop, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    providers: [{
        provide: EDITOR_PROVIDER,
        useExisting: IgxSwitchComponent,
        multi: true 
    }],
    selector: 'igx-switch',
    templateUrl: 'switch.component.html'
})
export class IgxSwitchComponent implements ControlValueAccessor, EditorProvider, AfterViewInit {
    private static ngAcceptInputType_required: boolean | '';
    private static ngAcceptInputType_disabled: boolean | '';

    /**
     * @hidden
     * @internal
     */
    public destroy$ = new Subject<boolean>();

    /**
     * Returns a reference to the native checkbox element.
     *
     * @example
     * ```typescript
     * let checkboxElement =  this.switch.nativeCheckbox;
     * ```
     */
    @ViewChild('checkbox', { static: true })
    public nativeCheckbox: ElementRef;
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
     * Returns reference to the `nativeElement` of the igx-switch.
     *
     * @example
     * ```typescript
     * let nativeElement = this.switch.nativeElement;
     * ```
     */
    public get nativeElement() {
        return this.nativeCheckbox.nativeElement;
    }
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
        return this._required || this.nativeElement.hasAttribute('required');
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
     * <igx-switch aria-label = "Label1"></igx-switch>
     * ```
     */
    @Input('aria-label')
    public ariaLabel: string | null = null;
    /**
     * An event that is emitted after the switch state is changed.
     * Provides references to the `IgxSwitchComponent` and the `checked` property as event arguments.
     */
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() public readonly change: EventEmitter<IChangeSwitchEventArgs> = new EventEmitter<IChangeSwitchEventArgs>();
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
     * Sets/gets whether the switch component is invalid.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-switch invalid></igx-switch>
     * ```
     * ```typescript
     * let isInvalid = this.switch.invalid;
     * ```
     */
    @HostBinding('class.igx-switch--invalid')
    @Input()
    public get invalid(): boolean {
        return this._invalid || false;
    }
    public set invalid(value: boolean) {
        this._invalid = !!value;
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
    private _invalid = false;
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

    constructor(
        private cdr: ChangeDetectorRef,
        protected renderer: Renderer2,
        @Optional() @Self() public ngControl: NgControl,
    ) {
        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }
    }

    /**
     * @hidden
     * @internal
    */
    public ngAfterViewInit() {
        if (this.ngControl) {
            this.ngControl.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(this.updateValidityState.bind(this));

            if (this.ngControl.control.validator || this.ngControl.control.asyncValidator) {
                this._required = this.ngControl?.control?.hasValidator(Validators.required);
                this.cdr.detectChanges();
            }
        }
    }
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
        if (this.disabled) {
            return;
        }

        this.nativeCheckbox.nativeElement.focus();

        this.checked = !this.checked;
        this.updateValidityState();
        // K.D. March 23, 2021 Emitting on click and not on the setter because otherwise every component
        // bound on change would have to perform self checks for weather the value has changed because
        // of the initial set on initialization
        this.change.emit({ checked: this.checked, switch: this });
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
    @HostListener('blur')
    public onBlur() {
        this.focused = false;
        this._onTouchedCallback();
        this.updateValidityState();
    }
    /**
     * @hidden
     * @internal
     */
    public writeValue(value: boolean) {
        this._checked = value;
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
    /**
     * @hidden
     * @internal
     */
    public setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }
    /**
     * @hidden
     * @internal
     */
    protected updateValidityState() {
        if (this.ngControl) {
            if (!this.disabled && (this.ngControl.control.touched || this.ngControl.control.dirty)) {
                // the control is not disabled and is touched or dirty
                this._invalid = this.ngControl.invalid;
            } else {
                //  if the control is untouched, pristine, or disabled, its state is initial. This is when the user did not interact
                //  with the switch or when the form/control is reset
                this._invalid = false;
            }
        } else {
            this.checkNativeValidity();
        }
    }

    /**
     * A function to assign a native validity property of a swicth.
     * This should be used when there's no ngControl
     *
     * @hidden
     * @internal
     */
    private checkNativeValidity() {
        if (!this.disabled && this._required && !this.checked) {
            this._invalid = true;
        } else {
            this._invalid = false;
        }
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxSwitchComponent],
    exports: [IgxSwitchComponent],
    imports: [IgxRippleModule]
})
export class IgxSwitchModule { }
