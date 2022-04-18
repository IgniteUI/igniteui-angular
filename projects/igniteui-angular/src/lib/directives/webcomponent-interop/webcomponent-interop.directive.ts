import {
    Directive,
    forwardRef,
    ElementRef,
    HostListener,
    NgModule
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
    selector: 'igc-rating', /* eslint-disable-line @angular-eslint/directive-selector */
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IgxWebComponentInteropDirective),
            multi: true
        }
    ]
})
export class IgxWebComponentInteropDirective implements ControlValueAccessor {
    public onChange: any = () => { };
    public onTouched: any = () => { };

    private _value: any;

    public get value() {
        return this._value;
    }

    public set value(val) {
        if (val !== this._value) {
            this._value = val;
            this.onChange(this._value);
            this.onTouched();
            this.elementRef.nativeElement.value = val;
        }
    }

    constructor(private elementRef: ElementRef) { }

    @HostListener('igcChange', ['$event.detail'])
    public listenForValueChange(value) {
        this.value = value;
    }

    public writeValue(value) {
        if (value) {
            this.value = value;
        }
    }

    public registerOnChange(fn) {
        this.onChange = fn;
    }

    public registerOnTouched(fn) {
        this.onTouched = fn;
    }
}

@NgModule({
    declarations: [IgxWebComponentInteropDirective],
    exports: [IgxWebComponentInteropDirective]
})
export class IgxWebComponentInteropModule { }