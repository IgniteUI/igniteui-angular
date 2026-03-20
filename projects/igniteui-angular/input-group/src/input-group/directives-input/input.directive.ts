import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, HostBinding, HostListener, Input, OnDestroy, Renderer2, booleanAttribute, inject } from '@angular/core';
import {
    AbstractControl,
    NgControl,
    NgModel,
    TouchedChangeEvent
} from '@angular/forms';
import { filter, Subscription } from 'rxjs';
import { IgxInputGroupBase } from '../input-group.common';

const nativeValidationAttributes = [
    'required',
    'pattern',
    'minlength',
    'maxlength',
    'min',
    'max',
    'step',
];

export enum IgxInputState {
    INITIAL,
    VALID,
    INVALID,
}

/**
 * The `igxInput` directive creates single- or multiline text elements, covering common scenarios when dealing with form inputs.
 */
@Directive({
    selector: '[igxInput]',
    exportAs: 'igxInput',
    standalone: true
})
export class IgxInputDirective implements AfterViewInit, OnDestroy {
    public inputGroup = inject(IgxInputGroupBase);
    protected ngModel = inject<NgModel>(NgModel, { optional: true, self: true });
    protected formControl = inject<NgControl>(NgControl, { optional: true, self: true });
    protected element = inject<ElementRef<HTMLInputElement>>(ElementRef);
    protected cdr = inject(ChangeDetectorRef);
    protected renderer = inject(Renderer2);

    /**
     * Sets/gets whether the `"igx-input-group__input"` class is added to the host element.
     * Default value is `false`.
     */
    @HostBinding('class.igx-input-group__input')
    public isInput = false;
    /**
     * Sets/gets whether the `"class.igx-input-group__textarea"` class is added to the host element.
     * Default value is `false`.
     */
    @HostBinding('class.igx-input-group__textarea')
    public isTextArea = false;

    private _valid = IgxInputState.INITIAL;
    private _statusChanges$: Subscription;
    private _valueChanges$: Subscription;
    private _touchedChanges$: Subscription;
    private _fileNames: string;
    private _disabled = false;

    private get ngControl(): NgControl {
        return this.ngModel ? this.ngModel : this.formControl;
    }

    /**
     * Sets the `value` property.
     */
    @Input()
    public set value(value: any) {
        this.nativeElement.value = value ?? '';
        this.updateValidityState();
    }
    /**
     * Gets the `value` property.
     *
     * @ViewChild('igxInput', {read: IgxInputDirective})
     *  public igxInput: IgxInputDirective;
     * let inputValue = this.igxInput.value;
     */
    public get value() {
        return this.nativeElement.value;
    }
    /**
     * Sets the `disabled` property.
     */
    @Input({ transform: booleanAttribute })
    @HostBinding('disabled')
    public set disabled(value: boolean) {
        this._disabled = this.inputGroup.disabled = value;
        if (this.focused && this._disabled) {
            // Browser focus may not fire in good time and mess with change detection, adjust here in advance:
            this.inputGroup.isFocused = false;
        }
    }
    /**
     * Gets the `disabled` property
     *
     * @ViewChild('igxInput', {read: IgxInputDirective})
     *  public igxInput: IgxInputDirective;
     * let isDisabled = this.igxInput.disabled;
     */
    public get disabled() {
        return this._disabled;
    }

    /**
     * Sets the `required` property.
     */
    @Input({ transform: booleanAttribute })
    public set required(value: boolean) {
        this.nativeElement.required = this.inputGroup.isRequired = value;
    }

    /**
     * Gets whether the igxInput is required.
     */
    public get required() {
        let validation;
        if (this.ngControl && (this.ngControl.control.validator || this.ngControl.control.asyncValidator)) {
            validation = this.ngControl.control.validator({} as AbstractControl);
        }
        return validation && validation.required || this.nativeElement.hasAttribute('required');
    }
    /**
     * @hidden
     * @internal
     */
    @HostListener('focus')
    public onFocus() {
        this.inputGroup.isFocused = true;
    }
    /**
     * @param event The event to invoke the handler
     *
     * @hidden
     * @internal
     */
    @HostListener('blur')
    public onBlur() {
        this.inputGroup.isFocused = false;
        if (this.ngControl?.control) {
            this.ngControl.control.markAsTouched();
        }
        this.updateValidityState();
    }
    /** @hidden @internal */
    @HostListener('input')
    public onInput() {
        this.checkNativeValidity();
    }
    /** @hidden @internal */
    @HostListener('change', ['$event'])
    public change(event: Event) {
        if (this.type === 'file') {
            const fileList: FileList | null = (event.target as HTMLInputElement)
                .files;
            const fileArray: File[] = [];

            if (fileList) {
                for (const file of Array.from(fileList)) {
                    fileArray.push(file);
                }
            }

            this._fileNames = (fileArray || []).map((f: File) => f.name).join(', ');

            if (this.required && fileList?.length > 0) {
                this._valid = IgxInputState.INITIAL;
            }
        }
    }

    /** @hidden @internal */
    public get fileNames() {
        return this._fileNames;
    }

    /** @hidden @internal */
    public clear() {
        this.ngControl?.control?.setValue('');
        this.nativeElement.value = null;
        this._fileNames = '';
    }

    /** @hidden @internal */
    public ngAfterViewInit() {
        this.inputGroup.hasPlaceholder = this.nativeElement.hasAttribute(
            'placeholder'
        );

        if (this.ngControl && this.ngControl.disabled !== null) {
            this.disabled = this.ngControl.disabled;
        }
        this.inputGroup.disabled =
            this.inputGroup.disabled ||
            this.nativeElement.hasAttribute('disabled');
        this.inputGroup.isRequired = this.nativeElement.hasAttribute(
            'required'
        );

        // Make sure we do not invalidate the input on init
        if (!this.ngControl) {
            this._valid = IgxInputState.INITIAL;
        }
        // Also check the control's validators for required
        if (this.required && !this.inputGroup.isRequired) {
            this.inputGroup.isRequired = this.required;
        }

        this.renderer.setAttribute(this.nativeElement, 'aria-required', this.required.toString());

        const elTag = this.nativeElement.tagName.toLowerCase();
        if (elTag === 'textarea') {
            this.isTextArea = true;

            if (this.nativeElement.getAttribute('rows') === null) {
                this.renderer.setAttribute(this.nativeElement, 'rows', '3');
            }
        } else {
            this.isInput = true;
        }

        if (this.ngControl) {
            this._statusChanges$ = this.ngControl.statusChanges.subscribe(
                this.onStatusChanged.bind(this)
            );

            this._valueChanges$ = this.ngControl.valueChanges.subscribe(
                this.onValueChanged.bind(this)
            );

            if (this.ngControl.control) {
                this._touchedChanges$ = this.ngControl.control.events
                    .pipe(filter(e => e instanceof TouchedChangeEvent))
                    .subscribe(
                        this.updateValidityState.bind(this)
                    );
            }
        }

        this.cdr.detectChanges();
    }
    /** @hidden @internal */
    public ngOnDestroy() {
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }

        if (this._valueChanges$) {
            this._valueChanges$.unsubscribe();
        }

        if (this._touchedChanges$) {
            this._touchedChanges$.unsubscribe();
        }
    }
    /**
     * Sets a focus on the igxInput.
     */
    public focus() {
        this.nativeElement.focus();
    }
    /**
     * Gets the `nativeElement` of the igxInput.
     */
    public get nativeElement() {
        return this.element.nativeElement;
    }
    /** @hidden @internal */
    protected onStatusChanged() {
        // Enable/Disable control based on ngControl #7086
        if (this.disabled !== this.ngControl.disabled) {
            this.disabled = this.ngControl.disabled;
        }
        this.updateValidityState();
    }

    /** @hidden @internal */
    protected onValueChanged() {
        if (this._fileNames && !this.value) {
            this._fileNames = '';
        }
    }

    /**
     * @hidden
     * @internal
     */
    protected updateValidityState() {
        if (this.ngControl) {
            if (!this.disabled && this.isTouchedOrDirty) {
                if (this.hasValidators) {
                    // Run the validation with empty object to check if required is enabled.
                    const error = this.ngControl.control.validator({} as AbstractControl);
                    this.inputGroup.isRequired = error && error.required;
                    if (this.focused) {
                        this._valid = this.ngControl.valid ? IgxInputState.VALID : IgxInputState.INVALID;
                    } else {
                        this._valid = this.ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
                    }
                } else {
                    // If validator is dynamically cleared, reset label's required class(asterisk) and IgxInputState #10010
                    this.inputGroup.isRequired = false;
                    this._valid = this.ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
                }
            } else {
                this._valid = IgxInputState.INITIAL;
            }
            this.renderer.setAttribute(this.nativeElement, 'aria-required', this.required.toString());
            const ariaInvalid = this.valid === IgxInputState.INVALID;
            this.renderer.setAttribute(this.nativeElement, 'aria-invalid', ariaInvalid.toString());
        } else {
            this.checkNativeValidity();
        }
    }

    private get isTouchedOrDirty(): boolean {
        return (this.ngControl.control.touched || this.ngControl.control.dirty);
    }

    private get hasValidators(): boolean {
        return (!!this.ngControl.control.validator || !!this.ngControl.control.asyncValidator);
    }

    /**
     * Gets whether the igxInput has a placeholder.
     */
    public get hasPlaceholder() {
        return this.nativeElement.hasAttribute('placeholder');
    }
    /**
     * Gets the placeholder element of the igxInput.
     */
    public get placeholder() {
        return this.nativeElement.placeholder;
    }

    /**
     * @returns An indicator of whether the input has validator attributes or not
     *
     * @hidden
     * @internal
     */
    private _hasValidators(): boolean {
        for (const nativeValidationAttribute of nativeValidationAttributes) {
            if (this.nativeElement.hasAttribute(nativeValidationAttribute)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Gets whether the igxInput is focused.
     */
    public get focused() {
        return this.inputGroup.isFocused;
    }
    /**
     * Gets the state of the igxInput.
     */
    public get valid(): IgxInputState {
        return this._valid;
    }

    /**
     * Sets the state of the igxInput.
     */
    public set valid(value: IgxInputState) {
        this._valid = value;
    }

    /**
     * Gets whether the igxInput is valid.
     */
    public get isValid(): boolean {
        return this.valid !== IgxInputState.INVALID;
    }

    /**
     * A function to assign a native validity property of an input.
     * This should be used when there's no ngControl
     *
     * @hidden
     * @internal
     */
    private checkNativeValidity() {
        if (!this.disabled && this._hasValidators()) {
            this._valid = this.nativeElement.checkValidity() ?
                this.focused ? IgxInputState.VALID : IgxInputState.INITIAL :
                IgxInputState.INVALID;
        }
    }

    /**
     * Returns the input type.
     *
     * @hidden
     * @internal
     */
    public get type() {
        return this.nativeElement.type;
    }
}
