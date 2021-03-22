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
import { mkenum } from '../../core/utils';

const IgxButtonType = mkenum({
    Flat: 'flat',
    Raised: 'raised',
    Outlined: 'outlined',
    Icon: 'icon',
    FAB: 'fab'
});

/**
 * Determines the Button type.
 */
export type IgxButtonType = typeof IgxButtonType[keyof typeof IgxButtonType];

/**
 * The Button directive provides the Ignite UI Button functionality to every component that's intended to be used as a button.
 *
 * @igxModule IgxButtonModule
 *
 * @igxParent Data Entry & Display
 *
 * @igxTheme igx-button-theme
 *
 * @igxKeywords button, span, div, click
 *
 * @remarks
 * The Ignite UI Button directive is intended to be used by any button, span or div and turn it into a fully functional button.
 *
 * @example
 * ```html
 * <button igxButton="outlined">A Button</button>
 * ```
 */
@Directive({
    selector: '[igxButton]'
})
export class IgxButtonDirective extends DisplayDensityBase {
    /**
     * Gets or sets whether the button is selected.
     * Mainly used in the IgxButtonGroup component and it will have no effect if set separately.
     *
     * @example
     * ```html
     * <button igxButton="flat" [selected]="button.selected"></button>
     * ```
     */
    @Input()
    public selected = false;

    /**
     * Called when the button is clicked.
     */
    @Output()
    public buttonClick = new EventEmitter<any>();

    /**
     * Sets/gets the `role` attribute.
     *
     * @example
     * ```typescript
     * this.button.role = 'navbutton';
     * let buttonRole = this.button.role;
     * ```
     */
    @HostBinding('attr.role')
    public role = 'button';

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-button')
    public _cssClass = 'igx-button';

    /**
     * @hidden
     * @internal
     */
    public _disabled = false;

    /**
     * @hidden
     * @internal
     */
    private _type: IgxButtonType;

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

    constructor(
        public element: ElementRef,
        private _renderer: Renderer2,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions
    ) {
        super(_displayDensityOptions);
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('click', ['$event'])
    public onClick(ev: MouseEvent) {
        this.buttonClick.emit(ev);
    }

    /**
     * Returns the underlying DOM element.
     */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /**
     * Sets the type of the button.
     *
     * @example
     * ```html
     * <button igxButton="icon"></button>
     * ```
     */
    @Input('igxButton')
    public set type(type: IgxButtonType) {
        const t = type ? type : IgxButtonType.Flat;
        if (this._type !== t) {
            this._type = t;
        }
    }

    /**
     * Sets the button text color.
     *
     * @example
     * ```html
     * <button igxButton igxButtonColor="orange"></button>
     * ```
     */
    @Input('igxButtonColor')
    public set color(value: string) {
        this._color = value || this.nativeElement.style.color;
        this._renderer.setStyle(this.nativeElement, 'color', this._color);
    }

    /**
     * Sets the background color of the button.
     *
     * @example
     *  ```html
     * <button igxButton igxButtonBackground="red"></button>
     * ```
     */
    @Input('igxButtonBackground')
    public set background(value: string) {
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
    @Input('igxLabel')
    public set label(value: string) {
        this._label = value || this._label;
        this._renderer.setAttribute(this.nativeElement, 'aria-label', this._label);
    }

    /**
     * Get the disabled state of the button;
     *
     * @example
     * ```typescript
     * const disabled = this.button.disabled;
     * ```
     */
    @Input()
    @HostBinding('class.igx-button--disabled')
    public get disabled() {
        return this._disabled;
    }

    /**
     * Enables/disables the button.
     *
     * @example
     * ```html
     * <button igxButton= "fab" [disabled]="true"></button>
     * ```
     */
    public set disabled(val: boolean) {
        this._disabled = !!val;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-button--flat')
    public get flat(): boolean {
        return this._type === IgxButtonType.Flat;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-button--raised')
    public get raised(): boolean {
        return this._type === IgxButtonType.Raised;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-button--outlined')
    public get outlined(): boolean {
        return this._type === IgxButtonType.Outlined;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-button--icon')
    public get icon(): boolean {
        return this._type === IgxButtonType.Icon;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-button--fab')
    public get fab(): boolean {
        return this._type === IgxButtonType.FAB;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-button--cosy')
    public get cosy(): boolean {
        return this.displayDensity === DisplayDensity.cosy;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-button--compact')
    public get compact(): boolean {
        return this.displayDensity === DisplayDensity.compact;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.disabled')
    public get disabledAttribute() {
        return this._disabled ? this._disabled : null;
    }
}

/**
 *
 * @hidden
 */
@NgModule({
    declarations: [IgxButtonDirective],
    exports: [IgxButtonDirective]
})
export class IgxButtonModule {}
