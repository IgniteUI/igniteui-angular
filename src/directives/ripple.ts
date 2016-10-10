import { Directive, Input, ElementRef, NgModule, HostListener } from '@angular/core';
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

    constructor(protected el: ElementRef) {
        this.container = el.nativeElement;
    }

    _ripple(event) {
        this.container.classList.add('ig-ripple-host');
        let parent = this.container.parentElement;

        let posX = this.container.offsetLeft;
        let posY = this.container.offsetTop;
        let width = this.container.offsetWidth;
        let height = this.container.offsetHeight;

        // !! should create ripple specific instance of wrap
        let wrap = document.createElement('span');

        wrap.classList.add('ig-ripple-host__ripple');

        this.container.appendChild(wrap);

        if (width >= height) {
            height = width;
        } else {
            width = height;
        }

        let x = event.pageX - posX - width / 2;
        let y = event.pageY - posY - height / 2;

        wrap.style.width = `${width}px`;
        wrap.style.height = `${height}px`;
        wrap.style.top = `${y}px`;
        wrap.style.left = `${x}px`;

        if(this._centered) {
            wrap.style.top = `0`;
            wrap.style.left = `0`;
        }

        if (this.rippleColor) {
            wrap.style.background = this.rippleColor;
        }

        wrap.classList.add('ig-ripple-host__ripple--animate');
        this.container.addEventListener('animationend', (ev)=> {
            this.container.classList.remove('ig-ripple-host');
            // !! should remove only ripple specific instance of the wrapper
            // to avoid canceling any other active animations !!
            wrap.remove();
        }, false);
    }
}

@NgModule({
    declarations: [RippleDirective],
    imports: [CommonModule],
    exports: [RippleDirective]
})
export class IgRippleModule { }