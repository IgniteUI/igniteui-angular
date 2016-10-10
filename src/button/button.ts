import { Directive, ElementRef, HostListener, Input, Renderer, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
    selector: '[igButton]',
    host: {'role': 'button'}
})
export class IgButton {
    private _type: string = 'flat';
    private _cssClass: string = 'ig-button';
    private _el: ElementRef;
    private _renderer: Renderer;
    private _color: string;
    private _backgroundColor: string;

    constructor(private el: ElementRef, private renderer: Renderer) {
        this._el = el;
        this._renderer = renderer;
        this._color = this._el.nativeElement.style.color;
        this._backgroundColor = this._el.nativeElement.style.background;
    }

    @Input('igButton') set type(value: string) {
        this._type = value || this._type;
    }

    @Input('igButtonColor') set color(value: string) {
        this._color = value || this._el.nativeElement.style.color;
    }

    @Input('igButtonBackground') set background (value: string) {
        this._backgroundColor = value || this._backgroundColor;
    }

    @Input() disabled: boolean;

    get type() {
        return this._type;
    }

    get color() {
        return this._color;
    }

    get backgroundColor() {
        return this._backgroundColor;
    }

    get isDisabled() {
        return this.disabled !== undefined;
    }

    set isDisabled(value: boolean) {
        this.disabled = value;
    }

    setButtonStyles(el: ElementRef, renderer: Renderer) {
        renderer.setElementClass(el.nativeElement, `${this._cssClass}--${this._type}`, true);
        renderer.setElementClass(el.nativeElement, `${this._cssClass}--disabled`, this.isDisabled);
        renderer.setElementStyle(el.nativeElement, 'color', this._color);
        renderer.setElementStyle(el.nativeElement, 'background', this._backgroundColor);
    }

    ngAfterContentInit() {
        this.setButtonStyles(this._el, this._renderer);
    }
}

@NgModule({
    declarations: [IgButton],
    imports: [CommonModule],
    exports: [IgButton]
})
export class ButtonModule {}