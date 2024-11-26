import {
    Directive,
    forwardRef,
    ElementRef,
    HostListener,
    Renderer2
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({ 
    selector: 'igc-rating[ngModel],igc-rating[formControlName]',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IgcFormControlDirective),
            multi: true
        }
    ],
    standalone: true
})
export class IgcFormControlDirective implements ControlValueAccessor {
    /** @hidden @internal */
    private onChange: any = () => { };
    /** @hidden @internal */
    private onTouched: any = () => { };

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2) { }

    /** @hidden @internal */
    @HostListener('blur')
    public onBlur() {
        this.onTouched();
    }

    /** @hidden @internal */
    @HostListener('igcChange', ['$event.detail'])
    public listenForValueChange(value) {
        this.onChange(value);
    }

    /** @hidden @internal */
    public writeValue(value): void {
        if (value) {
            this.elementRef.nativeElement.value = value;
        }
    }

    /** @hidden @internal */
    public registerOnChange(fn): void {
        this.onChange = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn): void {
        this.onTouched = fn;
    }

    /** @hidden @internal */
    public setDisabledState(isDisabled: boolean): void {
        this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
    }
}

