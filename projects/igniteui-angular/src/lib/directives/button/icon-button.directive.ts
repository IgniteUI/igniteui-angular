import { Directive, HostBinding, Input } from '@angular/core';
import { IgxButtonBaseDirective } from './button-base';
import { mkenum } from '../../core/utils';

const IgxIconButtonType = mkenum({
    Flat: 'flat',
    Contained: 'contained',
    Outlined: 'outlined'
});

/**
 * Determines the Icon Button type.
 */
export type IgxIconButtonType = typeof IgxIconButtonType[keyof typeof IgxIconButtonType];

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
    standalone: true
})
export class IgxIconButtonDirective extends IgxButtonBaseDirective {
    private static ngAcceptInputType_type: IgxIconButtonType | '';

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-icon-button')
    public _cssClass = 'igx-icon-button';

    /**
     * @hidden
     * @internal
     */
    private _type: IgxIconButtonType;

    /**
     * Sets the type of the icon button.
     *
     * @example
     * ```html
     * <button type="button" igxIconButton="flat"></button>
     * ```
     */
    @Input('igxIconButton')
    public set type(type: IgxIconButtonType) {
        const t = type ? type : IgxIconButtonType.Contained;
        if (this._type !== t) {
            this._type = t;
        }
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-icon-button--flat')
    public get flat(): boolean {
        return this._type === IgxIconButtonType.Flat;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-icon-button--contained')
    public get contained(): boolean {
        return this._type === IgxIconButtonType.Contained;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-icon-button--outlined')
    public get outlined(): boolean {
        return this._type === IgxIconButtonType.Outlined;
    }
}
