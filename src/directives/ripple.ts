import { Directive, Input, ElementRef, NgModule, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
    selector: '[igRipple]',
})
class RippleDirective {
    private _wrap: HTMLElement;

    container: HTMLElement;
    @Input('igRipple') rippleColor: string;
    @Input() duration: number = 400;

    @HostListener('mousedown', ['$event'])
    onClick(event) {
        this._ripple(event);
    }

    constructor(protected el: ElementRef) {
        this.container = el.nativeElement;
    }

    _ripple(event) {
        this.container.classList.add('rippleHost');
        let parent = this.container.parentElement;

        let posX = this.container.offsetLeft;
        let posY = this.container.offsetTop;
        let width = this.container.offsetWidth;
        let height = this.container.offsetHeight;

        let wrap = document.createElement('span');
        this._wrap = wrap;

        wrap.classList.add('ripple');

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
        if (this.rippleColor) {
            wrap.style.background = this.rippleColor;
        }

        wrap.classList.add('rippleEffect');
        this.container.addEventListener('animationend', (ev)=> {
            this.container.classList.remove('rippleHost');
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