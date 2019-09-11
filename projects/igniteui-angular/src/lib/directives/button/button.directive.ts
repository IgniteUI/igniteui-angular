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
     *@hidden
     */
    private _type: string;

    /**
     *@hidden
     */
    private _defaultType = 'flat';

    /**
     *@hidden
     */
    private _cssClassPrefix = 'igx-button';

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

    /**
     *@hidden
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
     * ```typescript
     * this.button.role = 'navbutton';
     * ```
     * ```typescript
     * let buttonRole =  this.button.role;
     * ```
     * @memberof IgxButtonDirective
     */
    @HostBinding('attr.role')
    public role = 'button';

    /**
     * Sets the type of the button.
     * ```html
     * <button  igxButton= "icon"></button>
     * ```
     * @memberof IgxButtonDirective
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
     * ```html
     * <button igxButton="gradient" igxButtonColor="blue"></button>
     * ```
     * @memberof IgxButtonDirective
     */
    @Input('igxButtonColor') set color(value: string) {
        this._color = value || this.nativeElement.style.color;
        this._renderer.setStyle(this.nativeElement, 'color', this._color);
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
        this._renderer.setStyle(this.nativeElement, 'background', this._backgroundColor);
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
        this._renderer.setAttribute(this.nativeElement, `aria-label`, this._label);
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
        this._disabled = val;
        if (val) {
            this._renderer.addClass(this.nativeElement, `${this._cssClassPrefix}--disabled`);
        } else {
            this._renderer.removeClass(this.nativeElement, `${this._cssClassPrefix}--disabled`);
        }
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-button--cosy')
    public get cssClassCosy(): boolean {
        return (this._type === 'flat' || this._type === 'raised' || this._type === 'outlined') &&
            this.displayDensity === DisplayDensity.cosy;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-button--compact')
    public get cssClassCompact(): boolean {
        return (this._type === 'flat' || this._type === 'raised' || this._type === 'outlined') &&
            this.displayDensity === DisplayDensity.compact;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-button--fab-cosy')
    public get cssClassCosyFab(): boolean {
        return this._type === 'fab' && this.displayDensity === DisplayDensity.cosy;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-button--fab-compact')
    public get cssClassCompactFab(): boolean {
        return this._type === 'fab' && this.displayDensity === DisplayDensity.compact;
    }

    /**
     * @hidden
     */
    @HostBinding('attr.tabIndex')
    public get tabIndex(): number {
        return this._disabled ? -1 : 0;
    }

    /**
     * Gets or sets whether the button is selected.
     * Mainly used in the IgxButtonGroup component and it will have no effect if set separately.
     * ```html
     * <button igxButton="flat" [selected]="button.selected"></button>
     * ```
     * @memberof IgxButtonDirective
     */
    @Input() public selected = false;

    /**
     *@hidden
     */
    @HostListener('click', ['$event'])
    public onClick(ev) {
        this.buttonClick.emit(ev);
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxButtonDirective],
    exports: [IgxButtonDirective]
})
export class IgxButtonModule { }
