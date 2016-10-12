import { Directive, Input, Renderer, ElementRef, NgModule, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
    selector: '[igRipple]',
})
class RippleDirective {

    private _centered: boolean = false;
    private _remaining: number = 0;

    protected container: HTMLElement;

    @Input("igRippleTarget") rippleTarget: string = "";

    @Input('igRippleCentered') set centered(value: boolean) {
        this._centered = value || this.centered;
    }
    @Input('igRipple') rippleColor: string;
    @Input('igRippleDuration') rippleDuration: number = 600;


    @HostListener('mousedown', ['$event'])
    onMouseDown(event) {
        this._ripple(event);
    }

    constructor(protected el: ElementRef, protected renderer: Renderer) {
        this.container = el.nativeElement;
    }

    _ripple(event) {
        let target, x, y, rippler, rectBounds;

        if (this.rippleTarget) {
            target = this.container.querySelector(this.rippleTarget) || this.container;
        } else {
            target = this.container;
        }

        rectBounds = target.getBoundingClientRect();

        let {top, left, width, height} = rectBounds;


        this.renderer.setElementClass(target, 'ig-ripple-host', true);
        rippler = this.renderer.createElement(target, 'span');
        this.renderer.setElementClass(rippler, 'ig-ripple-host__ripple', true);

        if (width >= height) {
            height = width;
        } else {
            width = height;
        }

        x = event.pageX - left - width / 2;
        y = event.pageY - top - height / 2;

        this.renderer.setElementStyle(rippler, 'width', `${width}px`);
        this.renderer.setElementStyle(rippler, 'height', `${height}px`);
        this.renderer.setElementStyle(rippler, 'top', `${y}px`);
        this.renderer.setElementStyle(rippler, 'left', `${x}px`);

        if(this._centered) {
            this.renderer.setElementStyle(rippler, 'top', '0');
            this.renderer.setElementStyle(rippler, 'left', '0');
        }

        if (this.rippleColor) {
            this.renderer.setElementStyle(rippler, 'background', this.rippleColor);
        }

        let FRAMES = [
            {opacity: 0.5, transform: 'scale(0)'},
            {opacity: 0, transform: 'scale(2)'},
        ];

        let animation = rippler.animate(FRAMES, this.rippleDuration);
        this._remaining++;

        animation.onfinish = (ev?) => {
            target.removeChild(rippler);
            this._remaining--;
            if (this._remaining <= 0) {
                this.renderer.setElementClass(target, 'ig-ripple-host', false);
            }
        };
    }
}

@NgModule({
    declarations: [RippleDirective],
    imports: [CommonModule],
    exports: [RippleDirective]
})
export class IgRippleModule { }