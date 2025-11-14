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
     *
     * ```html
     *  <div
     *   igxLayout
     *   igxLayoutDir="row">
     *    <div igxFlex>1</div>
     *    <div igxFlex>2</div>
     *    <div igxFlex>3</div>
     *  </div>
     * ```
     */
    @Input('igxLayoutDir') public dir = 'row';

    /**
     * Defines the direction flex children are placed in the flex container.
     *
     * When set to `true`, the `rows` direction goes right to left and `columns` goes bottom to top.
     *
     * ```html
     * <div
     *   igxLayout
     *   igxLayoutReverse="true">
     *    <div igxFlex>1</div>
     *    <div igxFlex>2</div>
     *    <div igxFlex>3</div>
     * </div>
     * ```
     */
    @Input({ alias: 'igxLayoutReverse', transform: booleanAttribute }) public reverse = false;

    /**
     * By default the immediate children will all try to fit onto one line.
     *
     * The default value `nowrap` sets this behavior.
     *
     * Other accepted values are `wrap` and `wrap-reverse`.
     *
     * ```html
     * <div
     *   igxLayout
     *   igxLayoutDir="row"
     *   igxLayoutWrap="wrap">
     *    <div igxFlex igxFlexGrow="0">1</div>
     *    <div igxFlex igxFlexGrow="0">2</div>
     *    <div igxFlex igxFlexGrow="0">3</div>
     * </div>
     * ```
     */
    @Input('igxLayoutWrap') public wrap = 'nowrap';

    /**
     * Defines the alignment along the main axis.
     *
     * Defaults to `flex-start` which packs the children toward the start line.
     *
     * Other possible values are `flex-end`, `center`, `space-between`, `space-around`.
     *
     * ```html
     * <div
     *   igxLayout
     *   igxLayoutDir="column"
     *   igxLayoutJustify="space-between">
     *    <div>1</div>
     *    <div>2</div>
     *    <div>3</div>
     * </div>
     * ```
     */
    @Input('igxLayoutJustify') public justify = 'flex-start';

    /**
     * Defines the default behavior for how children are laid out along the corss axis of the current line.
     *
     * Defaults to `flex-start`.
     *
     * Other possible values are `flex-end`, `center`, `baseline`, and `stretch`.
     *
     * ```html
     * <div
     *   igxLayout
     *   igxLayoutDir="column"
     *   igxLayoutItemAlign="start">
     *    <div igxFlex igxFlexGrow="0">1</div>
     *    <div igxFlex igxFlexGrow="0">2</div>
     *    <div igxFlex igxFlexGrow="0">3</div>
     * </div>
     * ```
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
     *
     * ```html
     * <div>
     *    <div igxFlex igxFlexGrow="0">Content1</div>
     *    <div igxFlex igxFlexGrow="1">Content2</div>
     *    <div igxFlex igxFlexGrow="0">Content3</div>
     * </div>
     * ```
     */
    @Input('igxFlexGrow') public grow = 1;

    /**
     * Applies the `shrink` attribute to an element that uses the directive.
     *
     * Default value is `1`.
     *
     * ```html
     * <div>
     *    <div igxFlex igxFlexShrink="1">Content1</div>
     *    <div igxFlex igxFlexShrink="0">Content2</div>
     *    <div igxFlex igxFlexShrink="1">Content3</div>
     * </div>
     * ```
     */
    @Input('igxFlexShrink') public shrink = 1;

    /**
     * Applies the directive to an element.
     *
     * Possible values include `igxFlexGrow`, `igxFlexShrink`, `igxFlexOrder`, `igxFlexBasis`.
     *
     * ```html
     * <div igxFlex>Content</div>
     * ```
     */
    @Input('igxFlex') public flex = '';

    /**
     * Applies the `order` attribute to an element that uses the directive.
     *
     * Default value is `0`.
     *
     * ```html
     * <div>
     *    <div igxFlex igxFlexOrder="1">Content1</div>
     *    <div igxFlex igxFlexOrder="0">Content2</div>
     *    <div igxFlex igxFlexOrder="2">Content3</div>
     * </div>
     * ```
     */
    @Input('igxFlexOrder') public order = 0;

    /**
     * Applies the `flex-basis` attribute to an element that uses the directive.
     *
     * Default value is `auto`.
     *
     * Other possible values include `content`, `max-content`, `min-content`, `fit-content`.
     *
     * ```html
     * <div igxFlex igxFlexBasis="fit-content">Content</div>
     * ```
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
