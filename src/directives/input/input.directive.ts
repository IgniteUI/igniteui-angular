import {CommonModule} from "@angular/common";
import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    DoCheck,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    NgModule,
    OnDestroy,
    OnInit,
    Optional,
    Renderer2,
    Self
} from "@angular/core";
import { FormGroup, FormsModule, NgControl, NgModel } from "@angular/forms";
import { Subscription } from "rxjs/Subscription";
import { IgxInputGroupComponent, IgxInputGroupState } from "../../main";

const nativeValidationAttributes = ["required", "pattern", "minlength", "maxlength", "min", "max"];

@Directive({
    selector: "[igxInput]"
})
export class IgxInputDirective implements AfterViewInit, OnDestroy {
    private _statusChanges$: Subscription;

    constructor(
        @Inject(forwardRef(() => IgxInputGroupComponent))
        public inputGroup: IgxInputGroupComponent,
        @Optional() @Self() @Inject(NgModel) protected ngModel: NgModel,
        protected element: ElementRef,
        protected cdr: ChangeDetectorRef) { }

    @HostBinding("class.igx-input-group__input")
    public isInput = false;

    @HostBinding("class.igx-input-group__textarea")
    public isTextArea = false;

    @HostListener("focus", ["$event"])
    public onFocus(event) {
        this.inputGroup.isFocused = true;
    }

    @HostListener("blur", ["$event"])
    public onBlur(event) {
        this.inputGroup.isFocused = false;
        this.inputGroup.valid = IgxInputGroupState.INITIAL;
        if (this.ngModel) {
            if (!this.ngModel.valid) {
                this.inputGroup.valid = IgxInputGroupState.INVALID;
            }
        } else if (this._hasValidators() && !this.nativeElement.checkValidity()) {
            this.inputGroup.valid = IgxInputGroupState.INVALID;
        }
    }

    @HostListener("input", ["$event"])
    public onInput(event) {
        const value: string = this.nativeElement.value;
        this.inputGroup.isFilled = value && value.length > 0;
        if (!this.ngModel && this._hasValidators()) {
            if (this.nativeElement.checkValidity()) {
                this.inputGroup.valid = IgxInputGroupState.VALID;
            } else if (this.inputGroup.valid === IgxInputGroupState.VALID) {
                this.inputGroup.valid = IgxInputGroupState.INVALID;
            }
        }
    }

    ngAfterViewInit() {
        if (this.nativeElement.placeholder) {
            this.inputGroup.hasPlaceholder = true;
        }

        if (this.nativeElement.required) {
            this.inputGroup.isRequired = true;
        }

        if (this.nativeElement.disabled) {
            this.inputGroup.isDisabled = true;
        }

        if ((this.nativeElement.value && this.nativeElement.value.length > 0) ||
            (this.ngModel && this.ngModel.model && this.ngModel.model.length > 0)) {
            this.inputGroup.isFilled = true;
        }

        const elTag = this.nativeElement.tagName.toLowerCase();
        if (elTag === "textarea") {
            this.isTextArea = true;
        } else {
            this.isInput = true;
        }

        if (this.ngModel) {
            this._statusChanges$ = this.ngModel.statusChanges.subscribe(this.onStatusChanged.bind(this));
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

    protected onStatusChanged(status: string) {
        if (!this.ngModel.control.pristine && (this.ngModel.validator || this.ngModel.asyncValidator)) {
            this.inputGroup.valid = this.ngModel.valid ? IgxInputGroupState.VALID : IgxInputGroupState.INVALID;
        }
    }

    get isDisabled() {
        return this.nativeElement.disabled;
    }

    get isRequired() {
        return  this.nativeElement.required;
    }

    get hasPlaceholder() {
        return this.nativeElement.placeholder;
    }

    private _hasValidators(): boolean {
        for (const nativeValidationAttribute of nativeValidationAttributes) {
            if (this.nativeElement.hasAttribute(nativeValidationAttribute)) {
                return true;
            }
        }

        return false;
    }
}
