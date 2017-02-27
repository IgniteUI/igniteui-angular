import { Directive, ElementRef, Input, Renderer, NgModule, OnInit } from '@angular/core';

@Directive({
    selector: '[igxButton]',
    host: {
        'role': 'button'
    }
})
export class IgxButton {
    private _type: string = 'flat';
    private _cssClass: string = 'igx-button';
    private _color: string;
    private _label: string;
    private _backgroundColor: string;

    constructor(private _el: ElementRef, private _renderer: Renderer) {}

    @Input('igxButton') set type(value: string) {
        this._type = value || this._type;
        this._renderer.setElementClass(this._el.nativeElement, `${this._cssClass}--${this._type}`, true);
    }

    @Input('igxButtonColor') set color(value: string) {
        this._color = value || this._el.nativeElement.style.color;
        this._renderer.setElementStyle(this._el.nativeElement, 'color', this._color);
    }

    @Input('igxButtonBackground') set background (value: string) {
        this._backgroundColor = value || this._backgroundColor;
        this._renderer.setElementStyle(this._el.nativeElement, 'background', this._backgroundColor);
    }

    @Input('igxLabel') set label(value: string) {
        this._label = value || this._label;
        this._renderer.setElementAttribute(this._el.nativeElement, `aria-label`, this._label);
    }

    @Input() set disabled(val) {
        this._renderer.setElementClass(this._el.nativeElement, `${this._cssClass}--disabled`, !!val);
    }
}

@NgModule({
    declarations: [IgxButton],
    exports: [IgxButton]
})
export class IgxButtonModule {}