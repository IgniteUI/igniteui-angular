import {
    Directive,
    OnInit,
    forwardRef,
    HostBinding,
    ChangeDetectionStrategy,
    Input,
    Output,
    EventEmitter,
    ElementRef,
    HostListener,
    NgModule
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
    selector: 'igc-rating',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IgxWebComponentInteropDirective),
            multi: true
        }
    ]
})
export class IgxWebComponentInteropDirective implements ControlValueAccessor {
    onChange: any = () => { };
    onTouched: any = () => { };

    private _value: any;

    get value() {
        return this._value;
    }

    set value(val) {
        if (val !== this._value) {
            this._value = val;
            this.onChange(this._value);
            this.onTouched();
            this.elementRef.nativeElement.value = val;
        }
    }

    constructor(private elementRef: ElementRef) { }

    @HostListener('igcChange', ['$event.detail'])
    listenForValueChange(value) {
        this.value = value;
    }

    writeValue(value) {
        if (value) {
            this.value = value;
        }
    }

    registerOnChange(fn) {
        this.onChange = fn;
    }

    registerOnTouched(fn) {
        this.onTouched = fn;
    }
}

@NgModule({
    declarations: [IgxWebComponentInteropDirective],
    exports: [IgxWebComponentInteropDirective]
})
export class IgxWebComponentInteropModule { }