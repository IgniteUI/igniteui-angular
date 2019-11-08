import { Directive } from '@angular/core';
import { IBaseEventArgs } from '../core/utils';

/**
 * Template directive that allows you to set a custom template representing the lower label value of the {@link IgxSliderComponent}
 *
 *```html
 * <igx-slider>
 *  <ng-template igxSliderThumbFrom let-value let-labels>{{value}}</ng-template>
 * </igx-slider>
 * ```
 *
 * @context {@link IgxSliderComponent.context}
 */
@Directive({
    selector: '[igxSliderThumbFrom]'
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
    selector: '[igxSliderThumbTo]'
})
export class IgxThumbToTemplateDirective {}

/**
 * Template directive allowing you to set a custom template represeting primary/secondary ticks of the {@link IgxSliderComponent}
 *
 * @context {@link IgxTicksComponent.context}
 */
@Directive({
    selector: '[igxSliderTickLabel]'
})
export class IgxTickLabelTemplateDirective {}

export interface IRangeSliderValue {
    lower: number;
    upper: number;
}

export interface ISliderValueChangeEventArgs extends IBaseEventArgs {
    oldValue: number | IRangeSliderValue;
    value: number | IRangeSliderValue;
}

export enum SliderType {
    /**
     * Slider with single thumb.
     */
    SLIDER,
    /**
     *  Range slider with multiple thumbs, that can mark the range.
     */
    RANGE
}

export enum SliderHandle {
    FROM,
    TO
}

/**
 * Slider Tick labels Orientation
 */
export enum TickLabelsOrientation {
    horizontal,
    toptobottom,
    bottomtotop
}

/**
 * Slider Ticks orientation
 */
export enum TicksOrientation {
    top,
    bottom,
    mirror
}
