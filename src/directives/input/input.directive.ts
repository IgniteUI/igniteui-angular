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
export class IgxInputDirective implements DoCheck {

    @HostBinding("class.igx-form-group__input")
    public isInput = true;

    @HostBinding("class.igx-form-group__input--focused")
    public focused = false;

    @HostBinding("class.igx-form-group__input--filled")
    public filled = false;
    @HostBinding("class.igx-form-group__input--placeholder")
    public placeholder = false;

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
    declarations: [IgxInputDirective],
    exports: [IgxInputDirective],
    imports: [CommonModule]
})
export class IgxInputModule {}
