import { Directive } from '@angular/core';
import { mkenum } from '../core/utils';

/**
 * Template directive that allows you to set a custom template representing the lower label value of the {@link IgxSliderComponent}
 *
 * ```html
 * <igx-slider>
 *  <ng-template igxSliderThumbFrom let-value let-labels>{{value}}</ng-template>
 * </igx-slider>
 * ```
 *
 * @context {@link IgxSliderComponent.context}
 */
@Directive({
    selector: '[igxSliderThumbFrom]',
    standalone: true
})
export class IgxThumbFromTemplateDirective {}

/**
 * Template directive that allows you to set a custom template representing the upper label value of the {@link IgxSliderComponent}
 *
 * ```html
 * <igx-slider>
 *  <ng-template igxSliderThumbTo let-value let-labels>{{value}}</ng-template>
 * </igx-slider>
 * ```
 *
 * @context {@link IgxSliderComponent.context}
 */
@Directive({
    selector: '[igxSliderThumbTo]',
    standalone: true
})
export class IgxThumbToTemplateDirective {}

/**
 * Template directive that allows you to set a custom template, represeting primary/secondary tick labels of the {@link IgxSliderComponent}
 *
 * @context {@link IgxTicksComponent.context}
 */
@Directive({
    selector: '[igxSliderTickLabel]',
    standalone: true
})
export class IgxTickLabelTemplateDirective {}

export interface IRangeSliderValue {
    lower: number;
    upper: number;
}

export interface ISliderValueChangeEventArgs {
    oldValue: number | IRangeSliderValue;
    value: number | IRangeSliderValue;
}

export const IgxSliderType = /*@__PURE__*/mkenum({
    /**
     * Slider with single thumb.
     */
    SLIDER: 'slider',
    /**
     *  Range slider with multiple thumbs, that can mark the range.
     */
    RANGE: 'range'
});
export type IgxSliderType = (typeof IgxSliderType)[keyof typeof IgxSliderType];

export const SliderHandle = /*@__PURE__*/mkenum({
    FROM: 'from',
    TO: 'to'
});
export type SliderHandle = (typeof SliderHandle)[keyof typeof SliderHandle];

/**
 * Slider Tick labels Orientation
 */
export const TickLabelsOrientation = /*@__PURE__*/mkenum({
    Horizontal: 'horizontal',
    TopToBottom: 'toptobottom',
    BottomToTop: 'bottomtotop'
});
export type TickLabelsOrientation = (typeof TickLabelsOrientation)[keyof typeof TickLabelsOrientation];

/**
 * Slider Ticks orientation
 */
export const TicksOrientation = /*@__PURE__*/mkenum({
    Top: 'top',
    Bottom: 'bottom',
    Mirror: 'mirror'
});
export type TicksOrientation = (typeof TicksOrientation)[keyof typeof TicksOrientation];
