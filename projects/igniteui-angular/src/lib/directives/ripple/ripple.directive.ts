import { Directive, ElementRef, HostListener, Input, NgModule, NgZone, Renderer2 } from '@angular/core';
import { AnimationBuilder, style, animate } from '@angular/animations';

@Directive({
    selector: '[igxRipple]'
})
export class IgxRippleDirective {
    /**
     * Sets/gets the ripple target.
     * ```html
     * <div  #rippleContainer class="div-1" igxRipple [igxRippleTarget] = "'.div-1'"></div>
     * ```
     * ```typescript
     * @ViewChild('rippleContainer', {read: IgxRippleDirective})
     * public ripple: IgxRippleDirective;
     * let rippleTarget = this.ripple.rippleTarget;
     * ```
     * Can set the ripple to activate on a child element inside the parent where igxRipple is defined.
     * ```html
     * <div #rippleContainer [igxRippleTarget] = "'#child"'>
     *  <button id="child">Click</button>
     * </div>
     * ```
     * @memberof IgxRippleDirective
     */
    @Input('igxRippleTarget')
    public rippleTarget = '';
    /**
     * Sets/gets the ripple color.
     * ```html
     * <button #rippleContainer [igxRipple] = "'red'" ></button>
     * ```
     * ```typescript
     * @ViewChild('rippleContainer', {read: IgxRippleDirective})
     * public ripple: IgxRippleDirective;
     * let rippleColor = this.ripple.rippleColor;
     * ```
     * @memberof IgxRippleDirective
     */
    @Input('igxRipple')
    public rippleColor: string;
    /**
     * Sets/gets the ripple duration(in milliseconds).
     * Default value is `600`.
     * ```html
     * <button #rippleContainer igxRipple [igxRippleDuration] = "800"></button>
     * ```
     * ```typescript
     * @ViewChild('rippleContainer', {read: IgxRippleDirective})
     * public ripple: IgxRippleDirective;
     * let rippleDuration = this.ripple.rippleDuration;
     * ```
     * @memberof IgxRippleDirective
     */
    @Input('igxRippleDuration')
    public rippleDuration = 600;
    /**
     * Enables/disables the ripple to be centered.
     * ```html
     * <button #rippleContainer igxRipple [igxRippleCentered] = "true"></button>
     * ```
     * @memberof IgxRippleDirective
     */
    @Input('igxRippleCentered') set centered(value: boolean) {
        this._centered = value || this.centered;
    }
    /**
     * Sets/gets whether the ripple is disabled.
     * Default value is `false`.
     * ```html
     * <button #rippleContainer igxRipple [igxRippleDisabled] = "true"></button>
     * ```
     * ```typescript
     * @ViewChild('rippleContainer', {read: IgxRippleDirective})
     * public ripple: IgxRippleDirective;
     * let isRippleDisabled = this.ripple.rippleDisabled;
     * ```
     * @memberof IgxRippleDirective
     */
    @Input('igxRippleDisabled')
    public rippleDisabled = false;

    protected get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    private rippleElementClass = 'igx-ripple__inner';
    private rippleHostClass = 'igx-ripple';
    private _centered = false;
    private animationQueue = [];

    constructor(
        protected builder: AnimationBuilder,
        protected elementRef: ElementRef,
        protected renderer: Renderer2,
        private zone: NgZone) { }
    /**
     *@hidden
     */
    @HostListener('mousedown', ['$event'])
    public onMouseDown(event) {
        this.zone.runOutsideAngular(() => this._ripple(event));
    }

    private setStyles(rippleElement: HTMLElement, styleParams: any) {
        this.renderer.addClass(rippleElement, this.rippleElementClass);
        this.renderer.setStyle(rippleElement, 'width', `${styleParams.radius}px`);
        this.renderer.setStyle(rippleElement, 'height', `${styleParams.radius}px`);
        this.renderer.setStyle(rippleElement, 'top', `${styleParams.top}px`);
        this.renderer.setStyle(rippleElement, 'left', `${styleParams.left}px`);
        if (this.rippleColor) {
            this.renderer.setStyle(rippleElement, 'background', this.rippleColor);
        }
    }

    private _ripple(event) {
        if (this.rippleDisabled) {
            return;
        }

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

        const rippleElement = this.renderer.createElement('span');

        this.setStyles(rippleElement, dimensions);
        this.renderer.addClass(target, this.rippleHostClass);
        this.renderer.appendChild(target, rippleElement);

        const animation = this.builder.build([
            style({ opacity: 0.5, transform: 'scale(.3)' }),
            animate(this.rippleDuration, style({ opacity: 0, transform: 'scale(2)' }))
        ]).create(rippleElement);

        this.animationQueue.push(animation);

        animation.onDone(() => {
            this.animationQueue.splice(this.animationQueue.indexOf(animation), 1);
            target.removeChild(rippleElement);
            if (this.animationQueue.length < 1) {
                this.renderer.removeClass(target, this.rippleHostClass);
            }
        });

        animation.play();

    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxRippleDirective],
    exports: [IgxRippleDirective]
})
export class IgxRippleModule { }
