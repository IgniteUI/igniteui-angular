import {
    Directive,
    ElementRef,
    HostListener,
    HostBinding,
    NgModule,
    DoCheck
} from "@angular/core";
import {CommonModule} from '@angular/common';

@Directive({
    selector: '[igxInput]',
})
export class IgxInputClass implements DoCheck {

    @HostBinding("class.igx-form-group__input")
    isInput: boolean = true;

    @HostBinding("class.igx-form-group__input--focused")
    focused: boolean = false;

    @HostBinding("class.igx-form-group__input--filled")
    filled: boolean = false;
    @HostBinding("class.igx-form-group__input--placeholder")
    placeholder: boolean = false;

    constructor(protected el: ElementRef) {}

    @HostListener('focus', ['$event'])
    onFocus(event) {
        this.focused = true;
    }

    @HostListener('blur', ['$event'])
    onBlur(event) {
        this.focused = false;
    }


    ngDoCheck() {
        let value = this.el.nativeElement.value;

        this.filled = value && (value !== '');
        this.placeholder = this.el.nativeElement.getAttribute('placeholder') && !this.filled;
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [IgxInputClass],
    exports: [IgxInputClass]
})
export class IgxInput {}
