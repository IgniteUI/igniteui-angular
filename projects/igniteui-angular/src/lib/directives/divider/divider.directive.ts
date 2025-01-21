import { Directive, HostBinding, Input, booleanAttribute } from '@angular/core';
import { mkenum } from '../../core/utils';

export const IgxDividerType = /*@__PURE__*/mkenum({
    SOLID: 'solid',
    DASHED: 'dashed'
});
export type IgxDividerType = (typeof IgxDividerType)[keyof typeof IgxDividerType];

let NEXT_ID = 0;

@Directive({
    selector: 'igx-divider',
    standalone: true
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
     * Sets the value of `role` attribute.
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
     * If set to `true` and an `inset` value has been provided,
     * the divider will start shrinking from both ends.
     * ```html
     * <igx-divider [middle]="true"></igx-divider>
     * ```
     */
    @HostBinding('class.igx-divider--inset')
    @Input({ transform: booleanAttribute })
    public middle = false;

    /**
     * Sets the divider in vertical orientation.
     * ```html
     * <igx-divider [vertical]="true"></igx-divider>
     * ```
     */
    @HostBinding('class.igx-divider--vertical')
    @Input({ transform: booleanAttribute })
    public vertical = false;

    /**
     * Sets the inset of the divider from the side(s).
     * If the divider attribute `middle` is set to `true`,
     * it will inset the divider on both sides.
     * ```typescript
     * this.divider.inset = '32px';
     * ```
     */
    @HostBinding('style.--inset')
    @Input()
    public set inset(value: string) {
        this._inset = value;
    }

    /**
     * Gets the current divider inset in terms of
     * inset-inline-start representation as applied to the divider.
     * ```typescript
     * const inset = this.divider.inset;
     * ```
     */
    public get inset() {
        return this._inset;
    }

    /**
     * Sets the value of the `inset` attribute.
     * If not provided it will be set to `'0'`.
     * ```html
     * <igx-divider inset="16px"></igx-divider>
     * ```
     */
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


