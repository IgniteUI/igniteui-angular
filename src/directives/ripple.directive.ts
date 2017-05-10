import { Directive, ElementRef, HostListener, Input, NgModule, NgZone, Renderer2 } from "@angular/core";

@Directive({
    selector: "[igxRipple]"
})
class IgxRippleDirective {

    private _centered: boolean = false;
    private _remaining: number = 0;

    protected container: HTMLElement;

    @Input("igxRippleTarget") rippleTarget: string = "";

    @Input("igxRippleCentered") set centered(value: boolean) {
        this._centered = value || this.centered;
    }
    @Input("igxRipple") rippleColor: string;
    @Input("igxRippleDuration") rippleDuration: number = 600;

    @HostListener("mousedown", ["$event"])
    onMouseDown(event) {
        this.zone.runOutsideAngular(() => this._ripple(event));
    }

    constructor(protected el: ElementRef, protected renderer: Renderer2, private zone: NgZone) {
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

        this.renderer.addClass(target, "ig-ripple-host");
        rippleEl = this.renderer.createElement("span");
        this.renderer.appendChild(target, rippleEl);
        this.renderer.addClass(rippleEl, "ig-ripple-host__ripple");

        radius = Math.max(rectBounds.width, rectBounds.height);

        left = event.pageX - rectBounds.left - radius / 2 - document.body.scrollLeft;
        top = event.pageY - rectBounds.top - radius / 2 - document.body.scrollTop;

        this.renderer.setStyle(rippleEl, "width", `${radius}px`);
        this.renderer.setStyle(rippleEl, "height", `${radius}px`);
        this.renderer.setStyle(rippleEl, "top", `${top}px`);
        this.renderer.setStyle(rippleEl, "left", `${left}px`);

        if (this._centered) {
            this.renderer.setStyle(rippleEl, "top", "0");
            this.renderer.setStyle(rippleEl, "left", "0");
        }

        if (this.rippleColor) {
            this.renderer.setStyle(rippleEl, "background", this.rippleColor);
        }

        const FRAMES = [
            {opacity: 0.5, transform: "scale(0)"},
            {opacity: 0, transform: "scale(2)"}
        ];

        const animation = rippleEl.animate(FRAMES, {
            duration: this.rippleDuration,
            fill: "forwards"
        });
        this._remaining++;

        animation.onfinish = (ev?) => {
            target.removeChild(rippleEl);
            this._remaining--;
            if (this._remaining <= 0) {
                this.renderer.removeClass(target, "ig-ripple-host");
            }
        };
    }
}

@NgModule({
    declarations: [IgxRippleDirective],
    exports: [IgxRippleDirective]
})
export class IgxRippleModule { }
