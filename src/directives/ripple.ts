import { Directive, Input, Renderer, ElementRef, NgModule, HostListener } from '@angular/core';

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
        let target, top, left, radius,
            rippleEl, rectBounds;

        event.stopPropagation();

        if (this.rippleTarget) {
            target = this.container.querySelector(this.rippleTarget) || this.container;
        } else {
            target = this.container;
        }

        rectBounds = target.getBoundingClientRect();

        this.renderer.setElementClass(target, 'ig-ripple-host', true);
        rippleEl = this.renderer.createElement(target, 'span');
        this.renderer.setElementClass(rippleEl, 'ig-ripple-host__ripple', true);

        radius = Math.max(rectBounds.width, rectBounds.height);

        left = event.pageX - rectBounds.left - radius / 2 - document.body.scrollLeft;
        top = event.pageY - rectBounds.top - radius / 2 - document.body.scrollTop;

        this.renderer.setElementStyle(rippleEl, 'width', `${radius}px`);
        this.renderer.setElementStyle(rippleEl, 'height', `${radius}px`);
        this.renderer.setElementStyle(rippleEl, 'top', `${top}px`);
        this.renderer.setElementStyle(rippleEl, 'left', `${left}px`);

        if(this._centered) {
            this.renderer.setElementStyle(rippleEl, 'top', '0');
            this.renderer.setElementStyle(rippleEl, 'left', '0');
        }

        if (this.rippleColor) {
            this.renderer.setElementStyle(rippleEl, 'background', this.rippleColor);
        }

        let FRAMES = [
            {opacity: 0.5, transform: 'scale(0)'},
            {opacity: 0, transform: 'scale(2)'},
        ];

        let animation = rippleEl.animate(FRAMES, {
            duration: this.rippleDuration,
            fill: 'forwards'
        })
        this._remaining++;

        animation.onfinish = (ev?) => {
            target.removeChild(rippleEl);
            this._remaining--;
            if (this._remaining <= 0) {
                this.renderer.setElementClass(target, 'ig-ripple-host', false);
            }
        };
    }
}

@NgModule({
    declarations: [RippleDirective],
    exports: [RippleDirective]
})
export class IgRippleModule { }