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
    Renderer2
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { IgxInputGroupComponent } from "../../main";

@Directive({
    selector: "[igxInput]"
})
export class IgxInputDirective {
    constructor(@Inject(forwardRef(() => IgxInputGroupComponent))
        public inputGroup: IgxInputGroupComponent,
                protected element: ElementRef,
                private _renderer: Renderer2) {
        if (this.element.nativeElement.placeholder) {
            inputGroup.hasPlaceholder = true;
        }

        if (this.element.nativeElement.required) {
            inputGroup.isRequired = true;
        }

        if (this.element.nativeElement.disabled) {
            inputGroup.isDisabled = true;
        }

        if (this.element.nativeElement.value &&
            this.element.nativeElement.value.length > 0) {
            inputGroup.isFilled = true;
        }

        const elTag = this.element.nativeElement.tagName.toLowerCase();
        if (elTag === "textarea") {
            this.isTextArea = true;
        } else {
            this.isInput = true;
        }
    }

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
    }

    @HostListener("input", ["$event"])
    public onInput(event) {
        const value: string = this.element.nativeElement.value;
        this.inputGroup.isFilled = value && value.length > 0;
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
