import {Directive, Input, signal} from '@angular/core';
import { IgxBaseButtonType, IgxButtonBaseDirective } from './button-base';

/**
 * Determines the Icon Button type.
 */
export type IgxIconButtonType = typeof IgxBaseButtonType[keyof typeof IgxBaseButtonType];

/**
 * The IgxIconButtonDirective provides a way to use an icon as a fully functional button.
 *
 * @example
 * ```html
 * <button type="button" igxIconButton="outlined">
 *      <igx-icon>home</igx-icon>
 * </button>
 * ```
 */
@Directive({
    selector: '[igxIconButton]',
    standalone: true,
    host: {
        'class': 'igx-icon-button',
        '[class.igx-icon-button--flat]': '_type() === "flat"',
        '[class.igx-icon-button--contained]': '_type() === "contained"',
        '[class.igx-icon-button--outlined]': '_type() === "outlined"',
    }
})
export class IgxIconButtonDirective extends IgxButtonBaseDirective {
    protected readonly _type = signal<IgxIconButtonType>(IgxBaseButtonType.Contained);

    /**
     * Sets the type of the icon button.
     *
     * @example
     * ```html
     * <button type="button" igxIconButton="flat"></button>
     * ```
     */
    @Input({ alias: 'igxIconButton', transform: (value: unknown) => (typeof value === 'string' ? value.trim() : '') || IgxBaseButtonType.Contained })
    public set type(type: IgxIconButtonType) {
        this._type.set(type);
    }
}
