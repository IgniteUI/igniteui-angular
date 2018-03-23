import { Directive, ElementRef, HostListener, Input, NgModule, NgZone, Renderer2 } from "@angular/core";

@Directive({
    selector: "[igxRipple]"
})
export class IgxRippleDirective {

    @Input("igxRippleTarget")
    public rippleTarget = "";

    @Input("igxRipple")
    public rippleColor: string;

    @Input("igxRippleDuration")
    public rippleDuration = 600;

    @Input("igxRippleCentered") set centered(value: boolean) {
        this._centered = value || this.centered;
    }

    @Input("igxRippleDisabled")
    public rippleDisabled = false;

    protected get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    private rippleElementClass = "igx-ripple__inner";
    private rippleHostClass = "igx-ripple";

    private animationFrames = [
        { opacity: 0.5, transform: "scale(.3)" },
        { opacity: 0, transform: "scale(2)" }
    ];
    private animationOptions = {
        duration: this.rippleDuration,
        fill: "forwards"
    };

    private _centered = false;
    private animationQueue = [];

    constructor(
        protected elementRef: ElementRef,
        protected renderer: Renderer2,
        private zone: NgZone) { }

    @HostListener("mousedown", ["$event"])
    public onMouseDown(event) {
        this.zone.runOutsideAngular(() => this._ripple(event));
    }

    private setStyles(rippleElement: HTMLElement, styleParams: any) {
        this.renderer.addClass(rippleElement, this.rippleElementClass);
        this.renderer.setStyle(rippleElement, "width", `${styleParams.radius}px`);
        this.renderer.setStyle(rippleElement, "height", `${styleParams.radius}px`);
        this.renderer.setStyle(rippleElement, "top", `${styleParams.top}px`);
        this.renderer.setStyle(rippleElement, "left", `${styleParams.left}px`);
        if (this.rippleColor) {
            this.renderer.setStyle(rippleElement, "background", this.rippleColor);
        }
    }

    private _ripple(event) {
        if (this.rippleDisabled) {
            return;
        }

        event.stopPropagation();

        const target = (this.rippleTarget ? this.nativeElement.querySelector(this.rippleTarget) || this.nativeElement : this.nativeElement);

        const rectBounds = target.getBoundingClientRect();
        const radius = Math.max(rectBounds.width, rectBounds.height);
        let left = event.clientX - rectBounds.left - radius / 2;
        let top = event.clientY - rectBounds.top - radius / 2;

        if (this._centered) {
            left = top = 0;
        }

        const dimensions = {
            radius,
            top,
            left
        };

        const rippleElement = this.renderer.createElement("span");

        this.setStyles(rippleElement, dimensions);
        this.renderer.addClass(target, this.rippleHostClass);
        this.renderer.appendChild(target, rippleElement);

        const animation = rippleElement.animate(this.animationFrames, this.animationOptions);
        this.animationQueue.push(animation);

        animation.onfinish = () => {
            this.animationQueue.splice(this.animationQueue.indexOf(animation), 1);
            target.removeChild(rippleElement);
            if (this.animationQueue.length < 1) {
                this.renderer.removeClass(target, this.rippleHostClass);
            }
        };
    }
}

@NgModule({
    declarations: [IgxRippleDirective],
    exports: [IgxRippleDirective]
})
export class IgxRippleModule { }
