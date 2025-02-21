import {
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    Renderer2,
    booleanAttribute,
    AfterContentInit,
    OnDestroy
} from '@angular/core';
import { mkenum } from '../../core/utils';
import { IBaseEventArgs } from '../../core/utils';
import { IgxBaseButtonType, IgxButtonBaseDirective } from './button-base';

const IgxButtonType = /*@__PURE__*/mkenum({
    ...IgxBaseButtonType,
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
export class IgxButtonDirective extends IgxButtonBaseDirective implements AfterContentInit, OnDestroy {
    private static ngAcceptInputType_type: IgxButtonType | '';

    /**
     * Called when the button is selected.
     */
    @Output()
    public buttonSelected = new EventEmitter<IButtonEventArgs>();

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

    private emitSelected() {
        this.buttonSelected.emit({
            button: this
        });
    }

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
            this._selected = value;
            this._renderer.setAttribute(this.nativeElement, 'data-selected', value.toString());
        }
    }

    public get selected(): boolean {
        return this._selected;
    }

    constructor(
        public override element: ElementRef,
        private _renderer: Renderer2,
    ) {
        super(element);
    }

    public ngAfterContentInit() {
        this.nativeElement.addEventListener('click', this.emitSelected.bind(this));
    }

    public ngOnDestroy(): void {
        this.nativeElement.removeEventListener('click', this.emitSelected);
    }

    /**
     * Sets the type of the button.
     *
     * @example
     * ```html
     * <button type="button" igxButton="outlined"></button>
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
    @HostBinding('class.igx-button--contained')
    public get contained(): boolean {
        return this._type === IgxButtonType.Contained;
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
    @HostBinding('class.igx-button--fab')
    public get fab(): boolean {
        return this._type === IgxButtonType.FAB;
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
        this.selected = false;
        this.focused = false;
    }
}

export interface IButtonEventArgs extends IBaseEventArgs {
    button: IgxButtonDirective;
}
