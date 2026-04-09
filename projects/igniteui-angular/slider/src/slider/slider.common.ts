import { Directive } from '@angular/core';

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

export const IgxSliderType = {
    /**
     * Slider with single thumb.
     */
    SLIDER: 'slider',
    /**
     *  Range slider with multiple thumbs, that can mark the range.
     */
    RANGE: 'range'
} as const;
export type IgxSliderType = (typeof IgxSliderType)[keyof typeof IgxSliderType];

export const SliderHandle = {
    FROM: 'from',
    TO: 'to'
} as const;
export type SliderHandle = (typeof SliderHandle)[keyof typeof SliderHandle];

/**
 * Slider Tick labels Orientation
 */
export const TickLabelsOrientation = {
    Horizontal: 'horizontal',
    TopToBottom: 'toptobottom',
    BottomToTop: 'bottomtotop'
} as const;
export type TickLabelsOrientation = (typeof TickLabelsOrientation)[keyof typeof TickLabelsOrientation];

/**
 * Slider Ticks orientation
 */
export const TicksOrientation = {
    Top: 'top',
    Bottom: 'bottom',
    Mirror: 'mirror'
} as const;
export type TicksOrientation = (typeof TicksOrientation)[keyof typeof TicksOrientation];
