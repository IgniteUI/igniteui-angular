import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    HostBinding,
    HostListener,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Self,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { AbstractControl, FormControlName, NgControl, NgModel } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IgxInputGroupBase } from '../../input-group/input-group.common';

const nativeValidationAttributes = ['required', 'pattern', 'minlength', 'maxlength', 'min', 'max', 'step'];

export enum IgxInputState {
    INITIAL,
    VALID,
    INVALID
}

@Directive({
    selector: '[igxInput]'
})
export class IgxInputDirective implements AfterViewInit, OnChanges, OnDestroy {
    private _valid = IgxInputState.INITIAL;
    private _statusChanges$: Subscription;

    constructor(
        public inputGroup: IgxInputGroupBase,
        @Optional() @Self() @Inject(NgModel) protected ngModel: NgModel,
        @Optional() @Self() @Inject(FormControlName) protected formControl: FormControlName,
        protected element: ElementRef,
        protected cdr: ChangeDetectorRef) { }

    private get ngControl(): NgControl {
        return this.ngModel ? this.ngModel : this.formControl;
    }
    /**
     * Sets the `value` property.
     * ```html
     * <input-group>
     *  <input igxInput #igxInput [value]="'IgxInput Value'">
     * </input-group>
     * ```
     * @memberof IgxInputDirective
     */
    @Input('value')
    set value(value: any) {
        this.nativeElement.value = value;
    }
    /**
     * Gets the `value` propery.
     * ```typescript
     * @ViewChild('igxInput', {read: IgxInputDirective})
     *  public igxInput: IgxInputDirective;
     * let inputValue = this.igxInput.value;
     * ```
     * @memberof IgxInputDirective
     */
    get value() {
        return this.nativeElement.value;
    }
    /**
     * Sets the `disabled` property.
     * ```html
     * <input-group>
     *  <input igxInput #igxInput [disabled]="true">
     * </input-group>
     * ```
     * @memberof IgxInputDirective
     */
    @Input()
    public set disabled(value: boolean) {
        this.nativeElement.disabled = value;
        this.inputGroup.disabled = value;
    }
    /**
     * Gets the `disabled` property
     * ```typescript
     * @ViewChild('igxInput', {read: IgxInputDirective})
     *  public igxInput: IgxInputDirective;
     * let isDisabled = this.igxInput.disabled;
     * ```
     * @memberof IgxInputDirective
     */
    public get disabled() {
        return this.nativeElement.hasAttribute('disabled');
    }
    /**
     * Sets/gets whether the `"igx-input-group__input"` class is added to the host element.
     * Default value is `false`.
     * ```typescript
     * this.igxInput.isInput = true;
     * ```
     * ```typescript
     * let isCLassAdded = this.igxInput.isInput;
     * ```
     * @memberof IgxInputDirective
     */
    @HostBinding('class.igx-input-group__input')
    public isInput = false;
    /**
     * Sets/gets whether the `"class.igx-input-group__textarea"` class is added to the host element.
     * Default value is `false`.
     * ```typescript
     * this.igxInput.isTextArea = true;
     * ```
     * ```typescript
     * let isCLassAdded = this.igxInput.isTextArea;
     * ```
     * @memberof IgxInputDirective
     */
    @HostBinding('class.igx-input-group__textarea')
    public isTextArea = false;
    /**
     *@hidden
     */
    @HostListener('focus', ['$event'])
    public onFocus(event) {
        this.inputGroup.isFocused = true;
    }
    /**
     *@hidden
     */
    @HostListener('blur', ['$event'])
    public onBlur(event) {
        this.inputGroup.isFocused = false;
        this._valid = IgxInputState.INITIAL;
        if (this.ngControl) {
            if (!this.ngControl.valid) {
                this._valid = IgxInputState.INVALID;
            }
        } else if (this._hasValidators() && !this.nativeElement.checkValidity()) {
            this._valid = IgxInputState.INVALID;
        }
    }
    /**
     *@hidden
     */
    @HostListener('input')
    public onInput() {
        this.checkValidity();
    }
    /**
     *@hidden
     */
    ngAfterViewInit() {
        this.inputGroup.hasPlaceholder = this.nativeElement.hasAttribute('placeholder');
        this.inputGroup.disabled = this.inputGroup.disabled || this.nativeElement.hasAttribute('disabled');
        this.inputGroup.isRequired = this.nativeElement.hasAttribute('required');

        // Also check the control's validators for required
        if (!this.inputGroup.isRequired && this.ngControl && this.ngControl.control.validator) {
            const validation = this.ngControl.control.validator({} as AbstractControl);
            this.inputGroup.isRequired = validation && validation.required;
        }


        const elTag = this.nativeElement.tagName.toLowerCase();
        if (elTag === 'textarea') {
            this.isTextArea = true;
        } else {
            this.isInput = true;
        }

        if (this.ngControl) {
            this._statusChanges$ = this.ngControl.statusChanges.subscribe(this.onStatusChanged.bind(this));
        }

        this.cdr.detectChanges();
    }
    /**
     *@hidden
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes.value && !changes.value.firstChange) {
            this.checkValidity();
        }
    }
    /**
     *@hidden
     */
    ngOnDestroy() {
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
    }
    /**
     * Sets a focus on the igxInput.
     * ```typescript
     * this.igxInput.focus();
     * ```
     * @memberof IgxInputDirective
     */
    public focus() {
        this.nativeElement.focus();
    }
    /**
     * Gets the `nativeElement` of the igxInput.
     * ```typescript
     * let igxInputNativeElement = this.igxInput.nativeElement;
     * ```
     * @memberof IgxInputDirective
     */
    public get nativeElement() {
        return this.element.nativeElement;
    }
    /**
     *@hidden
     */
    protected onStatusChanged() {
        if (this.ngControl.control.validator || this.ngControl.control.asyncValidator) {
            if (this.ngControl.control.touched || this.ngControl.control.dirty) {
                if (this.inputGroup.isFocused) {
                    // the user is still typing in the control
                    this._valid = this.ngControl.valid ? IgxInputState.VALID : IgxInputState.INVALID;
                } else {
                    // the user had touched the control previosly but now the value is changing due to changes in the form
                    this._valid = this.ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
                }
            } else if (this._valid !== IgxInputState.INITIAL) {
                this._valid = this.ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
            } else if (this._valid === IgxInputState.INITIAL && this.ngControl.value !== undefined && this.ngControl.invalid) {
                this._valid = IgxInputState.INVALID;
            }
        }
    }
    /**
     * Gets whether the igxInput is required.
     * ```typescript
     * let isRequired = this.igxInput.required;
     * ```
     * @memberof IgxInputDirective
     */
    public get required() {
        return this.nativeElement.hasAttribute('required');
    }
    /**
     * Gets whether the igxInput has a placeholder.
     * ```typescript
     * let hasPlaceholder = this.igxInput.hasPlaceholder;
     * ```
     * @memberof IgxInputDirective
     */
    public get hasPlaceholder() {
        return this.nativeElement.hasAttribute('placeholder');
    }
    /**
     * Gets the placeholder element of the igxInput.
     * ```typescript
     * let igxInputPlaceholder = this.igxInput.placeholder;
     * ```
     * @memberof IgxInputDirective
     */
    public get placeholder() {
        return this.nativeElement.placeholder;
    }

    private _hasValidators(): boolean {
        for (const nativeValidationAttribute of nativeValidationAttributes) {
            if (this.nativeElement.hasAttribute(nativeValidationAttribute)) {
                return true;
            }
        }

        return !!this.ngControl && (!!this.ngControl.control.validator || !!this.ngControl.control.asyncValidator);
    }
    /**
     * Gets whether the igxInput is focused.
     * ```typescript
     * let isFocused = this.igxInput.focused;
     * ```
     * @memberof IgxInputDirective
     */
    public get focused() {
        return this.inputGroup.isFocused;
    }
    /**
     * Gets the state of the igxInput.
     * ```typescript
     * let igxInputState = this.igxInput.valid;
     * ```
     * @memberof IgxInputDirective
     */
    public get valid(): IgxInputState {
        return this._valid;
    }
    /**
     * Sets the state of the igxInput.
     * ```typescript
     * this.igxInput.valid = IgxInputState.INVALID;
     * ```
     * @memberof IgxInputDirective
     */
    public set valid(value: IgxInputState) {
        this._valid = value;
    }

    private checkValidity() {
        if (!this.ngControl && this._hasValidators) {
            this._valid = this.nativeElement.checkValidity() ? IgxInputState.VALID : IgxInputState.INVALID;
        }
    }
}
