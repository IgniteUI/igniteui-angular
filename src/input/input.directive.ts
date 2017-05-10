import {CommonModule} from "@angular/common";
import {
    Directive,
    DoCheck,
    ElementRef,
    HostBinding,
    HostListener,
    NgModule
} from "@angular/core";

@Directive({
    selector: "[igxInput]"
})
export class IgxInputClass implements DoCheck {

    @HostBinding("class.igx-form-group__input")
    public isInput: boolean = true;

    @HostBinding("class.igx-form-group__input--focused")
    public focused: boolean = false;

    @HostBinding("class.igx-form-group__input--filled")
    public filled: boolean = false;
    @HostBinding("class.igx-form-group__input--placeholder")
    public placeholder: boolean = false;

    constructor(protected el: ElementRef) {}

    @HostListener("focus", ["$event"])
    public onFocus(event) {
        this.focused = true;
    }

    @HostListener("blur", ["$event"])
    public onBlur(event) {
        this.focused = false;
    }

    public ngDoCheck() {
        const value = this.el.nativeElement.value;

        this.filled = value && (value !== "");
        this.placeholder = this.el.nativeElement.getAttribute("placeholder") && !this.filled;
    }
}

@NgModule({
    declarations: [IgxInputClass],
    exports: [IgxInputClass],
    imports: [CommonModule]
})
export class IgxInput {}
