import { Directive, HostBinding, NgModule, Input } from '@angular/core';
import { mkenum } from '../../core/utils';

export const IgxDividerType = mkenum({
    SOLID: 'solid',
    DASHED: 'dashed'
});
export type IgxDividerType = (typeof IgxDividerType)[keyof typeof IgxDividerType];

let NEXT_ID = 0;

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-divider'
})
export class IgxDividerDirective {
    /**
     * Sets/gets the `id` of the divider.
     * If not set, `id` will have value `"igx-divider-0"`;
     * ```html
     * <igx-divider id="my-divider"></igx-divider>
     * ```
     * ```typescript
     * let dividerId =  this.divider.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-divider-${NEXT_ID++}`;

    /**
     * An @Input property that sets the value of `role` attribute.
     * If not the default value of `separator` will be used.
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'separator';

    /**
     * Sets the type of the divider. The default value
     * is `default`. The divider can also be `dashed`;
     * ```html
     * <igx-divider type="dashed"></igx-divider>
     * ```
     */
    @HostBinding('class.igx-divider')
    @Input()
    public type: IgxDividerType | string = IgxDividerType.SOLID;

    @HostBinding('class.igx-divider--dashed')
    public get isDashed() {
        return this.type === IgxDividerType.DASHED;
    }

    /**
     * An @Input that sets the `middle` attribute of the divider.
     * If set to `true` and an `inset` value has been provided,
     * the divider will start shrinking from both ends.
     * ```html
     * <igx-divider [middle]="true"></igx-divider>
     * ```
     */
    @HostBinding('class.igx-divider--inset')
    @Input()
    public middle = false;

    /**
     * An @Input that sets the vertical attribute of the divider.
     * ```html
     * <igx-divider [vertical]="true"></igx-divider>
     * ```
     */
    @HostBinding('class.igx-divider--vertical')
    @Input()
    public vertical = false;

    /**
     * Sets the inset of the divider from the side(s).
     * If the divider attribute `middle` is set to `true`,
     * it will inset the divider on both sides.
     * ```typescript
     * this.divider.inset = '32px';
     * ```
     */
    @HostBinding('style.margin')
    public set inset(value: string) {
        this._inset = value;
    }

    /**
     * Gets the current divider inset in terms of
     * margin representation as applied to the divider.
     * ```typescript
     * const inset = this.divider.inset;
     * ```
     */
    public get inset() {
        const baseMargin = '0';

        if (this.middle) {
            if (this.vertical) {
                return `${this._inset} ${baseMargin}`;
            }
            return `${baseMargin} ${this._inset}`;
        } else {
            if (this.vertical) {
                return `${this._inset} ${baseMargin} 0 ${baseMargin}`;
            }
            return `${baseMargin} 0 ${baseMargin} ${this._inset}`;
        }
    }


    /**
     * An @Input property that sets the value of the `inset` attribute.
     * If not provided it will be set to `'0'`.
     * ```html
     * <igx-divider inset="16px"></igx-divider>
     * ```
     */
    @Input('inset')
    private _inset = '0';

    /**
     * A getter that returns `true` if the type of the divider is `default`;
     * ```typescript
     * const isDefault = this.divider.isDefault;
     * ```
     */
    public get isSolid() {
        return this.type === IgxDividerType.SOLID;
    }
}

@NgModule({
    declarations: [IgxDividerDirective],
    exports: [IgxDividerDirective]
})
export class IgxDividerModule { }
