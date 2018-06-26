import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Self
} from '@angular/core';
import { AbstractControl, FormControlName, NgControl, NgModel } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IgxInputGroupComponent } from '../../input-group/input-group.component';

const nativeValidationAttributes = ['required', 'pattern', 'minlength', 'maxlength', 'min', 'max', 'step'];

export enum IgxInputState {
    INITIAL,
    VALID,
    INVALID
}

@Directive({
    selector: '[igxInput]'
})
export class IgxInputDirective implements AfterViewInit, OnDestroy {
    private _valid = IgxInputState.INITIAL;
    private _statusChanges$: Subscription;

    constructor(
        @Inject(forwardRef(() => IgxInputGroupComponent))
        public inputGroup: IgxInputGroupComponent,
        @Optional() @Self() @Inject(NgModel) protected ngModel: NgModel,
        @Optional() @Self() @Inject(FormControlName) protected formControl: FormControlName,
        protected element: ElementRef,
        protected cdr: ChangeDetectorRef) { }

    private get ngControl(): NgControl {
        return this.ngModel ? this.ngModel : this.formControl;
    }

    @Input('value')
    set value(value: any) {
        this.nativeElement.value = value;
        this.inputGroup.isFilled = value && value.length > 0;
    }
    get value() {
        return this.nativeElement.value;
    }

    @Input()
    public set disabled(value: boolean) {
        this.nativeElement.disabled = value;
        this.inputGroup.isDisabled = value;
    }

    public get disabled() {
        return this.nativeElement.hasAttribute('disabled');
    }

    @HostBinding('class.igx-input-group__input')
    public isInput = false;

    @HostBinding('class.igx-input-group__textarea')
    public isTextArea = false;

    @HostListener('focus', ['$event'])
    public onFocus(event) {
        this.inputGroup.isFocused = true;
    }

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

    @HostListener('input', ['$event'])
    public onInput(event) {
        const value: string = this.nativeElement.value;
        this.inputGroup.isFilled = value && value.length > 0;
        if (!this.ngControl && this._hasValidators()) {
            this._valid = this.nativeElement.checkValidity() ? IgxInputState.VALID : IgxInputState.INVALID;
        }
    }

    ngAfterViewInit() {
        this.inputGroup.hasPlaceholder = this.nativeElement.hasAttribute('placeholder');
        this.inputGroup.isDisabled = this.nativeElement.hasAttribute('disabled');
        this.inputGroup.isRequired = this.nativeElement.hasAttribute('required');

        // Also check the control's validators for required
        if (!this.inputGroup.isRequired && this.ngControl && this.ngControl.control.validator) {
            const validation = this.ngControl.control.validator({} as AbstractControl);
            this.inputGroup.isRequired = validation && validation.required;
        }

        if ((this.nativeElement.value && this.nativeElement.value.length > 0) ||
            (this.ngModel && this.ngModel.model !== '' &&
                this.ngModel.model !== undefined && this.ngModel.model !== null)) {
            this.inputGroup.isFilled = true;
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

    ngOnDestroy() {
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
    }

    public focus() {
        this.nativeElement.focus();
    }

    public get nativeElement() {
        return this.element.nativeElement;
    }

    protected onStatusChanged() {
        if ((this.ngControl.control.touched || this.ngControl.control.dirty) &&
            (this.ngControl.control.validator || this.ngControl.control.asyncValidator)) {
            this._valid = this.ngControl.valid ? IgxInputState.VALID : IgxInputState.INVALID;
        }
    }

    public get required() {
        return this.nativeElement.hasAttribute('required');
    }

    public get hasPlaceholder() {
        return this.nativeElement.hasAttribute('placeholder');
    }

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

    public get focused() {
        return this.inputGroup.isFocused;
    }

    public get valid(): IgxInputState {
        return this._valid;
    }

    public set valid(value: IgxInputState) {
        this._valid = value;
    }
}
