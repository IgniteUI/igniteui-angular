import {
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    NgModule,
    Renderer2,
    HostListener,
    Optional,
    Inject
} from '@angular/core';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions, DisplayDensity } from '../../core/density';

@Directive({
    selector: '[igxButton]'
})
export class IgxButtonDirective extends DisplayDensityBase {

    /**
     * @hidden
     * @internal
     */
    private _type: string;

    /**
     * @hidden
     * @internal
     */
    private _defaultType = 'flat';

    /**
     * @hidden
     * @internal
     */
    private _cssClassPrefix = 'igx-button';

    /**
     * @hidden
     * @internal
     */
    private _color: string;

    /**
     * @hidden
     * @internal
     */
    private _label: string;

    /**
     * @hidden
     * @internal
     */
    private _backgroundColor: string;

    /**
     * @hidden
     * @internal
     */
    private _disabled: boolean;

    constructor(public element: ElementRef, private _renderer: Renderer2,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(_displayDensityOptions);
    }

    /**
     * Returns the underlying DOM element
     */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /**
     * Called when the button is clicked
     */
    @Output()
    public buttonClick = new EventEmitter<any>();

    /**
     * Sets/gets the `role` attribute.
     * 
     * @example
     * ```typescript
     * this.button.role = 'navbutton';
     * let buttonRole =  this.button.role;
     * ```
     */
    @HostBinding('attr.role')
    public role = 'button';

    /**
     * Sets the type of the button.
     *
     * @example
     * ```html
     * <button  igxButton= "icon"></button>
     * ```
     */
    @Input('igxButton')
    set type(value: string) {
        const newValue = value ? value : this._defaultType;
        if (this._type !== newValue) {
            this._renderer.removeClass(this.nativeElement, `${this._cssClassPrefix}--${this._type}`);
            this._type = newValue;
            this._renderer.addClass(this.nativeElement, `${this._cssClassPrefix}--${this._type}`);
        }
    }

    /**
     * Sets the button text color.
     *
     * @example
     * ```html
     * <button igxButton="gradient" igxButtonColor="blue"></button>
     * ```
     */
    @Input('igxButtonColor') set color(value: string) {
        this._color = value || this.nativeElement.style.color;
        this._renderer.setStyle(this.nativeElement, 'color', this._color);
    }

    /**
     * Sets the background color of the button.
     *
     * @example
     *  ```html
     * <button igxButton="raised" igxButtonBackground="red"></button>
     * ```
     */
    @Input('igxButtonBackground') set background(value: string) {
        this._backgroundColor = value || this._backgroundColor;
        this._renderer.setStyle(this.nativeElement, 'background', this._backgroundColor);
    }

    /**
     * Sets the `aria-label` attribute.
     *
     * @example
     *  ```html
     * <button igxButton= "flat" igxLabel="Label"></button>
     * ```
     */
    @Input('igxLabel') set label(value: string) {
        this._label = value || this._label;
        this._renderer.setAttribute(this.nativeElement, `aria-label`, this._label);
    }

    /**
     * Enables/disables the button.
     *
     * @example
     * ```html
     * <button igxButton= "fab" [disabled]="true"></button>
     * ```
     */
    @Input() set disabled(val) {
        val = !!val;
        this._disabled = val;
        if (val) {
            this._renderer.addClass(this.nativeElement, `${this._cssClassPrefix}--disabled`);
        } else {
            this._renderer.removeClass(this.nativeElement, `${this._cssClassPrefix}--disabled`);
        }
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-button--cosy')
    public get cssClassCosy(): boolean {
        return (this._type === 'flat' || this._type === 'raised' || this._type === 'outlined') &&
            this.displayDensity === DisplayDensity.cosy;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-button--compact')
    public get cssClassCompact(): boolean {
        return (this._type === 'flat' || this._type === 'raised' || this._type === 'outlined') &&
            this.displayDensity === DisplayDensity.compact;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-button--fab-cosy')
    public get cssClassCosyFab(): boolean {
        return this._type === 'fab' && this.displayDensity === DisplayDensity.cosy;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-button--fab-compact')
    public get cssClassCompactFab(): boolean {
        return this._type === 'fab' && this.displayDensity === DisplayDensity.compact;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.disabled')
    public get disabledAttribute() {
        return this._disabled ? this._disabled : null;
    }

    /**
     * Gets or sets whether the button is selected.
     * Mainly used in the IgxButtonGroup component and it will have no effect if set separately.
     *
     * @example
     * ```html
     * <button igxButton="flat" [selected]="button.selected"></button>
     * ```
     */
    @Input() public selected = false;

    /**
     * @hidden
     * @internal
     */
    @HostListener('click', ['$event'])
    public onClick(ev) {
        this.buttonClick.emit(ev);
    }
}

/**
 * @hidden
 * @internal
 */
@NgModule({
    declarations: [IgxButtonDirective],
    exports: [IgxButtonDirective]
})
export class IgxButtonModule { }
