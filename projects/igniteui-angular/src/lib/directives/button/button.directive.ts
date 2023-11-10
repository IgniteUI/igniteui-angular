import {
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    Renderer2,
    HostListener,
    Optional,
    Inject,
    booleanAttribute
} from '@angular/core';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../../core/density';
import { mkenum } from '../../core/utils';
import { IBaseEventArgs } from '../../core/utils';

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
 * <button type="button" igxButton="outlined">A Button</button>
 * ```
 */
@Directive({
    selector: '[igxButton]',
    standalone: true
})
export class IgxButtonDirective extends DisplayDensityBase {
    private static ngAcceptInputType_type: IgxButtonType | '';

    /**
     * Called when the button is clicked.
     */
    @Output()
    public buttonClick = new EventEmitter<any>();

    /**
     * Called when the button is selected.
     */
    @Output()
    public buttonSelected = new EventEmitter<IButtonEventArgs>();

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

    /**
     * @hidden
     * @internal
     */
    private _selected = false;

    /**
     * Gets or sets whether the button is selected.
     * Mainly used in the IgxButtonGroup component and it will have no effect if set separately.
     *
     * @example
     * ```html
     * <button type="button" igxButton="flat" [selected]="button.selected"></button>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public set selected(value: boolean) {
        if (this._selected !== value) {
            if (!this._selected) {
                this.buttonSelected.emit({
                    button: this
                });
            }

            this._selected = value;
        }
    }

    public get selected(): boolean {
        return this._selected;
    }

    constructor(
        public element: ElementRef,
        private _renderer: Renderer2,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions
    ) {
        super(_displayDensityOptions, element);
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
     * <button type="button" igxButton="icon"></button>
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
     * <button type="button" igxButton igxButtonColor="orange"></button>
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
     * <button type="button" igxButton igxButtonBackground="red"></button>
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
     * <button type="button" igxButton="flat" igxLabel="Label"></button>
     * ```
     */
    @Input('igxLabel')
    public set label(value: string) {
        this._label = value || this._label;
        this._renderer.setAttribute(this.nativeElement, 'aria-label', this._label);
    }

    /**
      * Enables/disables the button.
      *
      * @example
      * ```html
      * <button igxButton="fab" disabled></button>
      * ```
      */
    @Input({ transform: booleanAttribute })
    @HostBinding('class.igx-button--disabled')
    public disabled = false;

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
    @HostBinding('style.--component-size')
    public get componentSize() {
        return this.getComponentSizeStyles();
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.disabled')
    public get disabledAttribute() {
        return this.disabled ? this.disabled : null;
    }

    /**
     * @hidden
     * @internal
     */
    public select() {
        this.selected = true;
    }

    /**
     * @hidden
     * @internal
     */
    public deselect() {
        this._selected = false;
    }
}

export interface IButtonEventArgs extends IBaseEventArgs {
    button: IgxButtonDirective;
}
