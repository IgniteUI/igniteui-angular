import {CommonModule} from "@angular/common";
import {
    Directive,
    DoCheck,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    NgModule,
    OnInit,
    Optional,
    Renderer2,
    Self
} from "@angular/core";
import { FormGroup, NgModel } from "@angular/forms";
import { IgxInputGroupComponent } from "../../main";

@Directive({
    selector: "[igxInput]"
})
export class IgxInputDirective implements OnInit {
    constructor(
        @Inject(forwardRef(() => IgxInputGroupComponent))
        public inputGroup: IgxInputGroupComponent,
        @Optional() @Self() @Inject(NgModel) protected ngModel: NgModel,
        protected element: ElementRef,
        private _renderer: Renderer2) { }

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
        if (this.ngModel) {
            this.inputGroup.isValid = this.inputGroup.isInvalid = false;
            if (!this.ngModel.control.valid && this.ngModel.control.touched) {
                this.inputGroup.isInvalid = true;
            }
        }
    }

    @HostListener("input", ["$event"])
    public onInput(event) {
        const value: string = this.element.nativeElement.value;
        this.inputGroup.isFilled = value && value.length > 0;

        if (this.ngModel && (this.ngModel.validator || this.ngModel.asyncValidator)) {
            if (this.ngModel.control.valid) {
                this.inputGroup.isValid = true;
                this.inputGroup.isInvalid = false;
            } else {
                this.inputGroup.isInvalid = true;
                this.inputGroup.isValid = false;
            }
        }
    }

    ngOnInit() {
        if (this.element.nativeElement.placeholder) {
            this.inputGroup.hasPlaceholder = true;
        }

        if (this.element.nativeElement.required) {
            this.inputGroup.isRequired = true;
        }

        if (this.element.nativeElement.disabled) {
            this.inputGroup.isDisabled = true;
        }

        if (this.element.nativeElement.value &&
            this.element.nativeElement.value.length > 0) {
                this.inputGroup.isFilled = true;
        }

        const elTag = this.element.nativeElement.tagName.toLowerCase();
        if (elTag === "textarea") {
            this.isTextArea = true;
        } else {
            this.isInput = true;
        }
    }

    get isDisabled() {
        return this.element.nativeElement.disabled;
    }

    get isRequired() {
        return  this.element.nativeElement.required;
    }

    get hasPlaceholder() {
        return this.element.nativeElement.placeholder;
    }

    public focus() {
        this.element.nativeElement.focus();
    }
}
