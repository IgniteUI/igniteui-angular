import { Directive, ElementRef, HostListener, Input, NgModule, NgZone, Renderer2 } from "@angular/core";

@Directive({
    selector: "[igxRipple]"
})
export class IgxRippleDirective {
    @Input("igxRippleTarget") public rippleTarget = "";
    @Input("igxRipple") public rippleColor: string;
    @Input("igxRippleDuration") public rippleDuration = 600;

    protected container: HTMLElement;

    private _centered = false;
    private animationQueue = [];

    @Input("igxRippleCentered") set centered(value: boolean) {
        this._centered = value || this.centered;
    }

    constructor(protected el: ElementRef, protected renderer: Renderer2, private zone: NgZone) {
        this.container = el.nativeElement;
    }

    @HostListener("mousedown", ["$event"])
    public onMouseDown(event) {
        this.zone.runOutsideAngular(() => this._ripple(event));
    }

    private _ripple(event) {
        let target;
        let top;
        let left;
        let radius;
        let rippleEl;
        let rectBounds;

        // document.body.scrollX always returns 0 in Firefox. Use documentElement instead.
        const scrollLeft = (document.body.scrollLeft || document.documentElement.scrollLeft);
        const scrollTop = (document.body.scrollTop || document.documentElement.scrollTop);

        event.stopPropagation();

        target = (this.rippleTarget ?
            this.container.querySelector(this.rippleTarget) || this.container
            : this.container);

        rectBounds = target.getBoundingClientRect();

        this.renderer.addClass(target, "ig-ripple-host");
        rippleEl = this.renderer.createElement("span");
        this.renderer.appendChild(target, rippleEl);
        this.renderer.addClass(rippleEl, "ig-ripple-host__ripple");

        radius = Math.max(rectBounds.width, rectBounds.height);

        left = event.pageX - rectBounds.left - radius / 2 - scrollLeft;
        top = event.pageY - rectBounds.top - radius / 2 - scrollTop;

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
        this.animationQueue.push(animation);

        animation.onfinish = () => {
            this.animationQueue.splice(this.animationQueue.indexOf(animation), 1);
            target.removeChild(rippleEl);
            if (this.animationQueue.length < 1) {
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
