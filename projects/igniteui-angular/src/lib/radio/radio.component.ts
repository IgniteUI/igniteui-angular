import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    Optional,
    Output,
    Renderer2,
    Self,
    ViewChild
} from '@angular/core';
import { ControlValueAccessor, NgControl, Validators } from '@angular/forms';
import { noop, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EditorProvider } from '../core/edit-provider';
import { IBaseEventArgs, mkenum } from '../core/utils';

export interface IChangeRadioEventArgs extends IBaseEventArgs {
    value: any;
    radio: IgxRadioComponent;
}

export const RadioLabelPosition = mkenum({
    BEFORE: 'before',
    AFTER: 'after'
});
export type RadioLabelPosition = (typeof RadioLabelPosition)[keyof typeof RadioLabelPosition];

let nextId = 0;
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
    selector: 'igx-radio',
    templateUrl: 'radio.component.html'
})
export class IgxRadioComponent implements AfterViewInit, ControlValueAccessor, EditorProvider, OnDestroy {
    private static ngAcceptInputType_required: boolean | '';
    private static ngAcceptInputType_disabled: boolean | '';

    /**
     * @hidden
     * @internal
     */
    public destroy$ = new Subject<boolean>();

    /**
     * Returns reference to native radio element.
     * ```typescript
     * let radioElement =  this.radio.nativeRadio;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @ViewChild('radio', { static: true })
    public nativeRadio: ElementRef;

    /**
     * Returns reference to native label element.
     * ```typescript
     * let labelElement =  this.radio.nativeLabel;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @ViewChild('nativeLabel', { static: true })
    public nativeLabel: ElementRef;

    /**
     * Gets the `nativeElement` of the igx-radio.
     *
     * @example
     * ```typescript
     * let igxRadioNativeElement = this.igxRadio.nativeElement;
     * ```
     */
    public get nativeElement() {
        return this.nativeRadio.nativeElement;
    }

    /**
     * Returns reference to the label placeholder element.
     * ```typescript
     * let labelPlaceholder =  this.radio.placeholderLabel;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @ViewChild('placeholderLabel', { static: true })
    public placeholderLabel: ElementRef;

    /**
     * Sets/gets the `id` of the radio component.
     * If not set, the `id` of the first radio component will be `"igx-radio-0"`.
     * ```html
     * <igx-radio id = "my-first-radio"></igx-radio>
     * ```
     * ```typescript
     * let radioId =  this.radio.id;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-radio-${nextId++}`;

    /**
     * Sets/gets the id of the `label` element in the radio component.
     * If not set, the id of the `label` in the first radio component will be `"igx-radio-0-label"`.
     * ```html
     * <igx-radio labelId = "Label1"></igx-radio>
     * ```
     * ```typescript
     * let labelId =  this.radio.labelId;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public labelId = `${this.id}-label`;

    /**
     * Sets/gets the position of the `label` in the radio component.
     * If not set, `labelPosition` will have value `"after"`.
     * ```html
     * <igx-radio labelPosition = "before"></igx-radio>
     * ```
     * ```typescript
     * let labelPosition =  this.radio.labelPosition;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public labelPosition: RadioLabelPosition | string;

    /**
     * Sets/gets the `value` attribute.
     * ```html
     * <igx-radio [value] = "'radioButtonValue'"></igx-radio>
     * ```
     * ```typescript
     * let value =  this.radio.value;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public value: any;

    /**
     * Sets/gets the `name` attribute of the radio component.
     * ```html
     * <igx-radio name = "Radio1"></igx-radio>
     *  ```
     * ```typescript
     * let name =  this.radio.name;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public name: string;

    /**
     * Sets the value of the `tabindex` attribute.
     * ```html
     * <igx-radio [tabindex] = "1"></igx-radio>
     * ```
     * ```typescript
     * let tabIndex =  this.radio.tabindex;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public tabindex: number = null;

    /**
     * Enables/disables the ripple effect on the radio button..
     * If not set, the `disableRipple` will have value `false`.
     * ```html
     * <igx-radio [disableRipple] = "true"></igx-radio>
     * ```
     * ```typescript
     * let isDisabledRipple =  this.radio.disableRipple;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public disableRipple = false;

    /**
     * Sets/gets whether the radio button is required.
     * If not set, `required` will have value `false`.
     * ```html
     * <igx-radio required></igx-radio>
     * ```
     * ```typescript
     * let isRequired =  this.radio.required;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public get required(): boolean {
        return this._required || this.nativeElement.hasAttribute('required');
    }
    public set required(value: boolean) {
        this._required = (value as any === '') || value;
    }

    /**
     * Sets/gets the `aria-labelledby` attribute of the radio component.
     * If not set, the `aria-labelledby` will be equal to the value of `labelId` attribute.
     * ```html
     * <igx-radio aria-labelledby = "Radio1"></igx-radio>
     * ```
     * ```typescript
     * let ariaLabelledBy = this.radio.ariaLabelledBy;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input('aria-labelledby')
    public ariaLabelledBy = this.labelId;

    /**
     * Sets/gets the `aria-label` attribute of the radio component.
     * ```html
     * <igx-radio aria-label = "Radio1"></igx-radio>
     * ```
     * ```typescript
     * let ariaLabel =  this.radio.ariaLabel;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input('aria-label')
    public ariaLabel: string | null = null;

    /**
     * An event that is emitted after the radio `value` is changed.
     * Provides references to the `IgxRadioComponent` and the `value` property as event arguments.
     *
     * @memberof IgxRadioComponent
     */
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() public readonly change: EventEmitter<IChangeRadioEventArgs> = new EventEmitter<IChangeRadioEventArgs>();

    /** @hidden @internal */
    private blurRadio = new EventEmitter();

    /**
     * Returns the class of the radio component.
     * ```typescript
     * let radioClass = this.radio.cssClass;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio')
    public cssClass = 'igx-radio';

    /**
     * Sets/gets  the `checked` attribute.
     * Default value is `false`.
     * ```html
     * <igx-radio [checked] = "true"></igx-radio>
     * ```
     * ```typescript
     * let isChecked =  this.radio.checked;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio--checked')
    @Input()
    public checked = false;

    /**
     * Sets/gets  the `disabled` attribute.
     * Default value is `false`.
     * ```html
     * <igx-radio disabled></igx-radio>
     * ```
     * ```typescript
     * let isDisabled =  this.radio.disabled;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio--disabled')
    @Input()
    public get disabled(): boolean {
        return this._disabled || false;
    }
    public set disabled(value: boolean) {
        this._disabled = (value as any === '') || value;
    }

    /**
     * Sets/gets whether the radio button is invalid.
     * Default value is `false`.
     * ```html
     * <igx-radio invalid></igx-radio>
     * ```
     * ```typescript
     * let isInvalid =  this.radio.invalid;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio--invalid')
    @Input()
    public get invalid(): boolean {
        return this._invalid || false;
    }
    public set invalid(value: boolean) {
        this._invalid = !!value;
    }

    /**
     * Sets/gets whether the radio component is on focus.
     * Default value is `false`.
     * ```typescript
     * this.radio.focus = true;
     * ```
     * ```typescript
     * let isFocused =  this.radio.focused;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio--focused')
    public focused = false;

    /**
     * @hidden
     */
    public inputId = `${this.id}-input`;
    /**
     * @hidden
     * @internal
     */
    private _required = false;
    /**
     * @hidden
     * @internal
     */
    private _invalid = false;
    /**
     * @hidden
     * @internal
     */
    private _disabled: boolean;
    /**
     * @hidden
     */
    private _onTouchedCallback: () => void = noop;

    /**
     * @hidden
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
     public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden
     * @internal
    */
    public ngAfterViewInit() {
        if (this.ngControl) {
            this.ngControl.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(this.onStatusChanged.bind(this));

            if (this.ngControl.control.validator || this.ngControl.control.asyncValidator) {
                this._required = this.ngControl?.control?.hasValidator(Validators.required);
                this.cdr.detectChanges();
            }
        }
    }

    protected onStatusChanged() {
        if (this.disabled !== this.ngControl.disabled) {
            this.disabled = this.ngControl.disabled;
        }

        this.updateValidityState();
    }

     /**
     * @hidden
     * @internal
     */
      @HostListener('change', ['$event'])
      public _changed(event: Event){
          if(event instanceof Event){
            event.preventDefault();
          }
      }

    /**
     * @hidden
     * @internal
     */
    @HostListener('keyup', ['$event'])
    public onKeyUp(event: KeyboardEvent) {
        event.stopPropagation();

        if (!this.focused) {
            this.focused = true;
        }
    }

    /**
     * @hidden
     */
    @HostListener('click')
    public _clicked() {
        this.select();
    }

    /**
     * Selects the current radio button.
     * ```typescript
     * this.radio.select();
     * ```
     *
     * @memberof IgxRadioComponent
     */
    public select() {
        if(!this.checked) {
            this.checked = true;
            this.invalid = false;
            this.change.emit({ value: this.value, radio: this });
            this._onChangeCallback(this.value);
        }
    }

    /**
     * Deselects the current radio button.
     * ```typescript
     * this.radio.deselect();
     * ```
     *
     * @memberof IgxRadioComponent
     */
    public deselect() {
        this.checked = false;
        this.focused = false;
        this.cdr.markForCheck();
    }

    /**
     * Checks whether the provided value is consistent to the current radio button.
     * If it is, the checked attribute will have value `true`;
     * ```typescript
     * this.radio.writeValue('radioButtonValue');
     * ```
     */
    public writeValue(value: any) {
        this.value = this.value || value;

        if (value === this.value) {
            this.select();
        } else {
            this.deselect();
        }
    }

    /** @hidden */
    public getEditElement() {
        return this.nativeRadio.nativeElement;
    }

    /**
     * @hidden
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
     * @hidden
     */
    @HostListener('blur')
    public onBlur() {
        this.focused = false;
        this._onTouchedCallback();
        this.updateValidityState();
        this.blurRadio.emit();
    }

    /**
     * @hidden
     */
    public registerOnChange(fn: (_: any) => void) {
        this._onChangeCallback = fn;
    }

    /**
     * @hidden
     */
    public registerOnTouched(fn: () => void) {
        this._onTouchedCallback = fn;
    }

    /**
     * @hidden
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
                if (this.checked) {
                    this._invalid = this.ngControl.invalid;
                } else {
                    this._invalid = this.required ? true : false;
                }
            } else {
                //  if control is untouched, pristine, or disabled its state is initial. This is when user did not interact
                //  with the radio or when form/control is reset
                this._invalid = false;
            }
        } else {
            this.checkNativeValidity();
        }
    }

    /**
     * A function to assign a native validity property of a radio.
     * This should be used when there's no ngControl
     *
     * @hidden
     * @internal
     */
    private checkNativeValidity() {
        if (!this.disabled && this._required && !this.checked) {
            this._invalid = !this.focused;
        }
    }
}
