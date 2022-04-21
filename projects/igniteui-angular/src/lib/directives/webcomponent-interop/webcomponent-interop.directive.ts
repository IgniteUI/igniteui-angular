import {
    Directive,
    forwardRef,
    ElementRef,
    HostListener,
    NgModule,
    Renderer2,
    AfterViewInit,
    OnDestroy
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class IgxWebComponentInteropDirective implements ControlValueAccessor, AfterViewInit, OnDestroy {
    /** @hidden @internal */
    public onChange: any = () => { };
    /** @hidden @internal */
    public onTouched: any = () => { };

    protected _destroy$ = new Subject();

    private _value: any;

    /** @hidden @internal */
    public get value(): any {
        return this.elementRef.nativeElement.value;
    }
    public set value(val) {
        if (val !== this._value) {
            this._value = val;
            this.onChange(this._value);
            this.elementRef.nativeElement.value = val;
        }
    }

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2) { }

    /** @hidden @internal */
    public ngAfterViewInit(): void {
        fromEvent(this.elementRef.nativeElement, 'blur')
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                this.onTouched();
            });
    }

    /** @hidden @internal */
    public ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    @HostListener('igcChange', ['$event.detail'])
    public listenForValueChange(value) {
        this.onChange(value);
    }

    /** @hidden @internal */
    public writeValue(value): void {
        if (value) {
            this._value = value;
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

@NgModule({
    declarations: [IgxWebComponentInteropDirective],
    exports: [IgxWebComponentInteropDirective]
})
export class IgxWebComponentInteropModule { }