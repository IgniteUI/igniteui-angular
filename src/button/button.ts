import { Directive, ElementRef, Input, Renderer, NgModule, OnInit } from '@angular/core';

@Directive({
    selector: '[igButton]',
    host: {
        'role': 'button'
    }
})
export class IgButton {
    private _type: string = 'flat';
    private _cssClass: string = 'ig-button';
    private _color: string;
    private _backgroundColor: string;

    constructor(private _el: ElementRef, private _renderer: Renderer) {}

    @Input('igButton') set type(value: string) {
        this._type = value || this._type;
        this._renderer.setElementClass(this._el.nativeElement, `${this._cssClass}--${this._type}`, true);
    }

    @Input('igButtonColor') set color(value: string) {
        this._color = value || this._el.nativeElement.style.color;
        this._renderer.setElementStyle(this._el.nativeElement, 'color', this._color);
    }

    @Input('igButtonBackground') set background (value: string) {
        this._backgroundColor = value || this._backgroundColor;
        this._renderer.setElementStyle(this._el.nativeElement, 'background', this._backgroundColor);
    }

    @Input() set disabled(val) {
        this._renderer.setElementClass(this._el.nativeElement, `${this._cssClass}--disabled`, !!val);
    }
}

@NgModule({
    declarations: [IgButton],
    exports: [IgButton]
})
export class ButtonModule {}