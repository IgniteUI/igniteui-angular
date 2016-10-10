import { Directive, Input, Renderer, ElementRef, NgModule, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
    selector: '[igRipple]',
})
class RippleDirective {
    private _centered: boolean = false;

    container: HTMLElement;

    @Input() duration: number = 400;
    @Input('igRippleCentered') set centered(value: boolean) {
        this._centered = value || this.centered;
    }
    @Input('igRipple') rippleColor: string;

    @HostListener('mousedown', ['$event'])
    onClick(event) {
        this._ripple(event);
    }

    constructor(protected el: ElementRef, protected renderer: Renderer) {
        this.container = el.nativeElement;
    }

    _ripple(event) {
        let parent, posX, posY, width,
            height, x, y, wrap;

        parent = this.container.parentElement;
        posX = this.container.offsetLeft;
        posY = this.container.offsetTop;
        width = this.container.offsetWidth;
        height = this.container.offsetHeight;

        this.renderer.setElementClass(this.container, 'ig-ripple-host', true);

        wrap = this.renderer.createElement(this.container, 'span');

        this.renderer.setElementClass(wrap, 'ig-ripple-host__ripple', true);

        if (width >= height) {
            height = width;
        } else {
            width = height;
        }

        x = event.pageX - posX - width / 2;
        y = event.pageY - posY - height / 2;

        this.renderer.setElementStyle(wrap, 'width', `${width}px`);
        this.renderer.setElementStyle(wrap, 'height', `${height}px`);
        this.renderer.setElementStyle(wrap, 'top', `${y}px`);
        this.renderer.setElementStyle(wrap, 'left', `${x}px`);

        if(this._centered) {
            this.renderer.setElementStyle(wrap, 'top', '0');
            this.renderer.setElementStyle(wrap, 'left', '0');
        }

        if (this.rippleColor) {
            this.renderer.setElementStyle(wrap, 'background', this.rippleColor);
        }

        let cb_handler = (ev) => {
            this.renderer.setElementClass(this.container, 'ig-ripple-host', false);
            wrap.remove();
        };

        this.renderer.setElementClass(wrap, 'ig-ripple-host__ripple--animate', true);

        this.container.addEventListener('animationend', cb_handler, false);
        this.container.removeEventListener('animationend', cb_handler, false);
    }
}

@NgModule({
    declarations: [RippleDirective],
    imports: [CommonModule],
    exports: [RippleDirective]
})
export class IgRippleModule { }