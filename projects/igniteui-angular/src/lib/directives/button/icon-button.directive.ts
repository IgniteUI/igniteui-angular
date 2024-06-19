import { Directive, HostBinding, Input } from '@angular/core';
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
    standalone: true
})
export class IgxIconButtonDirective extends IgxButtonBaseDirective {
    private static ngAcceptInputType_type: IgxIconButtonType | '';

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-icon-button')
    private _cssClass = 'igx-icon-button';

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
        const t = type ? type : IgxBaseButtonType.Contained;
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
        return this._type === IgxBaseButtonType.Flat;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-icon-button--contained')
    public get contained(): boolean {
        return this._type === IgxBaseButtonType.Contained;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-icon-button--outlined')
    public get outlined(): boolean {
        return this._type === IgxBaseButtonType.Outlined;
    }
}
