import { Directive, ElementRef, HostBinding, Input, NgModule, OnInit, Renderer2 } from '@angular/core';

@Directive({
    selector: '[igxButton]'
})
export class IgxButtonDirective {
    /**
     *@hidden
     */
    private _type = 'flat';
    /**
     *@hidden
     */
    private _cssClass = 'igx-button';
    /**
     *@hidden
     */
    private _color: string;
    /**
     *@hidden
     */
    private _label: string;
    /**
     *@hidden
     */
    private _backgroundColor: string;

    constructor(private _el: ElementRef, private _renderer: Renderer2) { }
    /**
     * Sets/gets the `role` attribute.
     * ```typescript
     * this.button.role = 'navbutton';
     * ```
     * ```typescript
     * let buttonRole =  this.button.role;
     * ```
     * @memberof IgxButtonDirective
     */
    @HostBinding('attr.role') public role = 'button';
    /**
     * Sets the type of the button.
     * ```html
     * <button  igxButton= "icon"></button>
     * ```
     * @memberof IgxButtonDirective
     */
    @Input('igxButton') set type(value: string) {
        this._type = value || this._type;
        this._renderer.addClass(this._el.nativeElement, `${this._cssClass}--${this._type}`);
    }
    /**
     * Sets the button text color.
     * ```html
     * <button igxButton="gradient" igxButtonColor="blue"></button>
     * ```
     * @memberof IgxButtonDirective
     */
    @Input('igxButtonColor') set color(value: string) {
        this._color = value || this._el.nativeElement.style.color;
        this._renderer.setStyle(this._el.nativeElement, 'color', this._color);
    }
    /**
     * Sets the background color of the button.
     * ```html
     * <button igxButton="raised" igxButtonBackground="red"></button>
     * ```
     * @memberof IgxButtonDirective
     */
    @Input('igxButtonBackground') set background(value: string) {
        this._backgroundColor = value || this._backgroundColor;
        this._renderer.setStyle(this._el.nativeElement, 'background', this._backgroundColor);
    }
    /**
     * Sets the `aria-label` attribute.
     * ```html
     * <button igxButton= "flat" igxLabel="Label"></button>
     * ```
     * @memberof IgxButtonDirective
     */
    @Input('igxLabel') set label(value: string) {
        this._label = value || this._label;
        this._renderer.setAttribute(this._el.nativeElement, `aria-label`, this._label);
    }
    /**
     * Enables/disables the button.
     *  ```html
     * <button igxButton= "fab" [disabled]="true"></button>
     * ```
     * @memberof IgxButtonDirective
     */
    @Input() set disabled(val) {
        val = !!val;
        if (val) {
            this._renderer.addClass(this._el.nativeElement, `${this._cssClass}--disabled`);
        } else {
            this._renderer.removeClass(this._el.nativeElement, `${this._cssClass}--disabled`);
        }
    }
}
/**
 * The IgxButtonModule provides the {@link IgxButtonDirective} inside your application.
 */
@NgModule({
    declarations: [IgxButtonDirective],
    exports: [IgxButtonDirective]
})
export class IgxButtonModule { }
