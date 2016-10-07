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

    constructor(private el: ElementRef, private renderer: Renderer) {
        this._el = el;
        this._renderer = renderer;
    }

    @Input('igButton') set type(value: string) {
        this._type = value || this._type;
    }

    get type() {
        return this._type;
    }

    @Input() disabled: boolean;

    get isDisabled() {
        return this.disabled !== undefined;
    }

    set isDisabled(value: boolean) {
        this.disabled = value;
    }

    setButtonStyles(el: ElementRef, renderer: Renderer) {
        renderer.setElementClass(el.nativeElement, `${this._cssClass}--${this._type}`, true);
        renderer.setElementClass(el.nativeElement, `${this._cssClass}--disabled`, this.isDisabled);
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