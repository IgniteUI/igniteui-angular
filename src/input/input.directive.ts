import {
    Directive,
    ElementRef,
    HostListener,
    NgModule
} from "@angular/core";

@Directive({
    selector: '[igxInput]',
    host: {
        '[class.igx-form-group__input]': 'true',
        '[class.igx-form-group__input--filled]': 'filled',
        '[class.igx-form-group__input--focused]': 'focused',
        '[class.igx-form-group__input--placeholder]': 'placeholder'
    }
})
export class IgxInputClass {

    focused: boolean;

    constructor(protected el: ElementRef) {}

    @HostListener('focus', ['$event'])
    onFocus(event) {
        this.focused = true;
    }

    @HostListener('blur', ['$event'])
    onBlur(event) {
        this.focused = false;
    }

    get filled() {
        let value = this.el.nativeElement.value;
        return value && (value !== '');
    }


    get placeholder() {
        return this.el.nativeElement.getAttribute('placeholder') && !this.filled;
    }
}

@NgModule({
    declarations: [IgxInputClass],
    exports: [IgxInputClass]
})
export class IgxInput {}