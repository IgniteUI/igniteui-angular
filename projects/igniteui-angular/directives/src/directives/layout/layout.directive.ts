import { Directive, HostBinding, Input, booleanAttribute } from '@angular/core';

@Directive({
    selector: '[igxLayout]',
    standalone: true
})
export class IgxLayoutDirective {
    /**
     * Sets the default flow direction of the container's children.
     *
     * Defaults to `rows`.
     */
    @Input('igxLayoutDir') public dir = 'row';

    /**
     * Defines the direction flex children are placed in the flex container.
     *
     * When set to `true`, the `rows` direction goes right to left and `columns` goes bottom to top.
     */
    @Input({ alias: 'igxLayoutReverse', transform: booleanAttribute }) public reverse = false;

    /**
     * By default the immediate children will all try to fit onto one line.
     *
     * The default value `nowrap` sets this behavior.
     *
     * Other accepted values are `wrap` and `wrap-reverse`.
     */
    @Input('igxLayoutWrap') public wrap = 'nowrap';

    /**
     * Defines the alignment along the main axis.
     *
     * Defaults to `flex-start` which packs the children toward the start line.
     *
     * Other possible values are `flex-end`, `center`, `space-between`, `space-around`.
     */
    @Input('igxLayoutJustify') public justify = 'flex-start';

    /**
     * Defines the default behavior for how children are laid out along the corss axis of the current line.
     *
     * Defaults to `flex-start`.
     *
     * Other possible values are `flex-end`, `center`, `baseline`, and `stretch`.
     */
    @Input('igxLayoutItemAlign') public itemAlign = 'stretch';

    /**
     * @hidden
     */
    @HostBinding('style.display') public display = 'flex';

    /**
     * @hidden
     */
    @HostBinding('style.flex-wrap')
    public get flexwrap() {
        return this.wrap;
    }

    /**
     * @hidden
     */
    @HostBinding('style.justify-content')
    public get justifycontent() {
        return this.justify;
    }

    /**
     * @hidden
     */
    @HostBinding('style.align-items')
    public get align() {
        return this.itemAlign;
    }

    /**
     * @hidden
     */
    @HostBinding('style.flex-direction')
    public get direction() {
        if (this.reverse) {
            return (this.dir === 'row') ? 'row-reverse' : 'column-reverse';
        }
        return (this.dir === 'row') ? 'row' : 'column';
    }
}

@Directive({
    selector: '[igxFlex]',
    standalone: true
})
export class IgxFlexDirective {

    /**
     * Applies the `grow` attribute to an element that uses the directive.
     *
     * Default value is `1`.
     */
    @Input('igxFlexGrow') public grow = 1;

    /**
     * Applies the `shrink` attribute to an element that uses the directive.
     *
     * Default value is `1`.
     */
    @Input('igxFlexShrink') public shrink = 1;

    /**
     * Applies the directive to an element.
     *
     * Possible values include `igxFlexGrow`, `igxFlexShrink`, `igxFlexOrder`, `igxFlexBasis`.
     */
    @Input('igxFlex') public flex = '';

    /**
     * Applies the `order` attribute to an element that uses the directive.
     *
     * Default value is `0`.
     */
    @Input('igxFlexOrder') public order = 0;

    /**
     * Applies the `flex-basis` attribute to an element that uses the directive.
     *
     * Default value is `auto`.
     *
     * Other possible values include `content`, `max-content`, `min-content`, `fit-content`.
     */
    @Input('igxFlexBasis') public basis = 'auto';

    /**
     * @hidden
     */
    @HostBinding('style.flex')
    public get style() {
        if (this.flex) {
            return `${this.flex}`;
        }
        return `${this.grow} ${this.shrink} ${this.basis}`;
    }

    /**
     * @hidden
     */
    @HostBinding('style.order')
    public get itemorder() {
        return this.order || 0;
    }
}
