import { Directive, HostBinding, NgModule, Input } from '@angular/core';

export enum IgxDividerType {
    DEFAULT = 'default',
    INSET = 'inset',
    VERTICAL = 'vertical',
}

let NEXT_ID = 0;

@Directive({
    // tslint:disable-next-line:directive-selector
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
     * @hidden
     */
    @Input('offset')
    private _offset = '0';

    /**
     * Sets the type of the divider. The default value
     * is `default`. The divider can also be `inset` or `vertical`;
     * ```html
     * <igx-divider type="vertical"></igx-divider>
     * ```
     */
    @HostBinding('class.igx-divider')
    @Input()
    public type: IgxDividerType | string = IgxDividerType.DEFAULT;

    /**
     * Makes the divider dashed when set to `true`.
     * ```html
     * <igx-divider [dashed]="true"></igx-divider>
     * ```
     */
    @HostBinding('class.igx-divider--dashed')
    @Input()
    public dashed = false;

    /**
     * Returns true if the type of the divider is `inset`;
     * ```typescript
     * const isInset = this.divider.isInset;
     * ```
     */
    @HostBinding('class.igx-divider--inset')
    get isInset() {
        return this.type === IgxDividerType.INSET;
    }

    /**
     * Returns true if the type of the divider is `default`;
     * ```typescript
     * const isDefault = this.divider.isDefault;
     * ```
     */
    get isDefault() {
        return this.type === IgxDividerType.DEFAULT;
    }

    /**
     * Returns true if the type of the divider is `vertical`;
     * ```typescript
     * const isVertical = this.divider.isVertical;
     * ```
     */
    @HostBinding('class.igx-divider--vertical')
    get isVertical() {
        return this.type === IgxDividerType.VERTICAL;
    }

    /**
     * Sets the offset of the divider from the side(s).
     * If the divider type is inset, it will offset the
     * divider on both sides.
     * ```typescript
     * this.divider.offset = '32px';
     * ```
     */
    @HostBinding('style.margin')
    set offset(value: string) {
        this._offset = value;
    }

    /**
     * Gets the current divider offset.
     * ```typescript
     * const offset = this.divider.offset;
     * ```
     */
    get offset() {
        const baseMargin = '0';

        if (this.isDefault) {
            return `${baseMargin} ${this._offset}`;
        }

        if (this.isInset) {
            return `${baseMargin} 0 ${baseMargin} ${this._offset}`;
        }

        if (this.isVertical) {
            return `${this._offset} ${baseMargin}`;
        }

        return `${baseMargin} 0`;
    }
}

@NgModule({
    declarations: [IgxDividerDirective],
    exports: [IgxDividerDirective]
})
export class IgxDividerModule { }
