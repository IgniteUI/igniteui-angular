import { Directive, EventEmitter, Input, Output, booleanAttribute, signal } from '@angular/core';
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
        '[attr.aria-label]': '_label() || null',
        '[attr.data-selected]': '_selected() ? "true" : "false"',
        '(click)': 'buttonSelected.emit({ button: this })',
    }
})
export class IgxButtonDirective extends IgxButtonBaseDirective {
    protected readonly _type = signal<IgxButtonType>(IgxButtonType.Flat);
    protected readonly _label = signal('');
    protected readonly _selected = signal(false);

    /** Emitted when the button is selected. */
    @Output()
    public readonly buttonSelected = new EventEmitter<IButtonEventArgs>();


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
    @Input({ alias: 'igxButton', transform: (value: string) => value.trim() || IgxButtonType.Flat })
    public set type(type: IgxButtonType) {
        this._type.set(type);
    }

    /**
     * Sets the `aria-label` attribute.
     *
     * @example
     *  ```html
     * <button type="button" igxButton="flat" igxLabel="Label"></button>
     * ```
     */
    @Input({ alias: 'igxLabel' })
    public set label(value: string) {
        this._label.set(value || '');
    }
}

export interface IButtonEventArgs extends IBaseEventArgs {
    button: IgxButtonDirective;
}
