import { Directive, EventEmitter, Input, Output, Renderer2, booleanAttribute, inject, signal } from '@angular/core';
import { IBaseEventArgs } from 'igniteui-angular/core';
import { IgxBaseButtonType, IgxButtonBaseDirective } from './button-base';

const IgxButtonType = { ...IgxBaseButtonType, FAB: 'fab' } as const;

/** The type of the button. */
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
    standalone: true,
    host: {
        'class': 'igx-button',
        '[class.igx-button--flat]': '_type() === "flat"',
        '[class.igx-button--contained]': '_type() === "contained"',
        '[class.igx-button--outlined]': '_type() === "outlined"',
        '[class.igx-button--fab]': '_type() === "fab"',
        '[class.igx-button--ready]': '_hasRendered()',
        '[attr.data-selected]': '_selected() ? "true" : "false"',
        '(click)': 'buttonSelected.emit({ button: this })',
    }
})
export class IgxButtonDirective extends IgxButtonBaseDirective {
    private readonly _renderer = inject(Renderer2);
    protected readonly _type = signal<IgxButtonType>(IgxButtonType.Flat);
    protected readonly _selected = signal(false);
    /** The aria-label last written by igxLabel. */
    private _label: string | null = null;

    /** Emitted when the button is selected. */
    @Output()
    public readonly buttonSelected = new EventEmitter<IButtonEventArgs>();

    /**
     * Gets or sets whether the button is selected.
     * Mainly used in the button group component and it will have no effect if set separately.
     *
     * @example
     * ```html
     * <button type="button" igxButton="flat" [selected]="button.selected"></button>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public set selected(value: boolean) {
        this._selected.set(value);
    }

    public get selected(): boolean {
        return this._selected();
    }

    /**
     * Sets the type of the button.
     *
     * @example
     * ```html
     * <button type="button" igxButton="outlined"></button>
     * ```
     */
    @Input({ alias: 'igxButton', transform: (value: IgxButtonType | '' | null | undefined) => value || IgxButtonType.Flat })
    public set type(type: IgxButtonType) {
        this._type.set(type);
    }

    /**
     * Sets the `aria-label` attribute. While it has a value, it replaces any other `aria-label` on the button.
     *
     * @deprecated in version 22.2.8. Use the native `aria-label` attribute instead.
     *
     * @example
     *  ```html
     * <button type="button" igxButton="flat" aria-label="Label"></button>
     * ```
     */
    @Input({ alias: 'igxLabel' })
    public set label(value: string | null | undefined) {
        const label = value || null;
        const element = this.nativeElement;

        if (label) {
            this._renderer.setAttribute(element, 'aria-label', label);
        } else if (this._label !== null && element.getAttribute('aria-label') === this._label) {
            // Remove only the value igxLabel wrote; a newer aria-label belongs to someone else.
            this._renderer.removeAttribute(element, 'aria-label');
        }

        this._label = label;
    }
}

export interface IButtonEventArgs extends IBaseEventArgs {
    button: IgxButtonDirective;
}
