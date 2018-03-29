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
import { IgxInputGroupComponent } from "../../main";

const nativeValidationAttributes = ["required", "pattern", "minlength", "maxlength", "min", "max", "step"];

export enum IgxInputState {
    INITIAL,
    VALID,
    INVALID
}

@Directive({
    selector: "[igxInput]"
})
export class IgxInputDirective implements AfterViewInit, OnDestroy {
    private _valid = IgxInputState.INITIAL;
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
        this._valid = IgxInputState.INITIAL;
        if (this.ngModel) {
            if (!this.ngModel.valid) {
                this._valid = IgxInputState.INVALID;
            }
        } else if (this._hasValidators() && !this.nativeElement.checkValidity()) {
            this._valid = IgxInputState.INVALID;
        }
    }

    @HostListener("input", ["$event"])
    public onInput(event) {
        const value: string = this.nativeElement.value;
        this.inputGroup.isFilled = value && value.length > 0;
        if (!this.ngModel && this._hasValidators()) {
            this._valid = this.nativeElement.checkValidity() ? IgxInputState.VALID : IgxInputState.INVALID;
        }
    }

    ngAfterViewInit() {
        if (this.nativeElement.hasAttribute("placeholder")) {
            this.inputGroup.hasPlaceholder = true;
        }

        if (this.nativeElement.hasAttribute("required")) {
            this.inputGroup.isRequired = true;
        }

        if (this.nativeElement.hasAttribute("disabled")) {
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

    public get value() {
        return this.element.nativeElement.value;
    }

    public set value(val: string) {
        this.element.nativeElement.value = val;
    }

    public get nativeElement() {
        return this.element.nativeElement;
    }

    protected onStatusChanged(status: string) {
        if (!this.ngModel.control.pristine && (this.ngModel.validator || this.ngModel.asyncValidator)) {
            this._valid = this.ngModel.valid ? IgxInputState.VALID : IgxInputState.INVALID;
        }
    }

    public get disabled() {
        return this.nativeElement.hasAttribute("disabled");
    }

    public set disabled(value: boolean) {
        this.nativeElement.disabled = value;
        this.inputGroup.isDisabled = value;
    }

    public get required() {
        return this.nativeElement.hasAttribute("required");
    }

    public get hasPlaceholder() {
        return this.nativeElement.hasAttribute("placeholder");
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

        return false;
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
