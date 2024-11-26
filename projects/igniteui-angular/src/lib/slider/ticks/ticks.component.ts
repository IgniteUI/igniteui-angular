import { Component, Input, TemplateRef, HostBinding, booleanAttribute } from '@angular/core';
import { TicksOrientation, TickLabelsOrientation } from '../slider.common';
import { NgFor, NgClass, NgTemplateOutlet } from '@angular/common';

/**
 * @hidden
 */
@Component({
    selector: 'igx-ticks',
    templateUrl: 'ticks.component.html',
    imports: [NgFor, NgClass, NgTemplateOutlet]
})
export class IgxTicksComponent {
    @Input()
    public primaryTicks: number;

    @Input()
    public secondaryTicks: number;

    @Input({ transform: booleanAttribute })
    public primaryTickLabels: boolean;

    @Input({ transform: booleanAttribute })
    public secondaryTickLabels: boolean;

    @Input()
    public ticksOrientation: TicksOrientation;

    @Input()
    public tickLabelsOrientation: TickLabelsOrientation;

    @Input()
    public maxValue: number;

    @Input()
    public minValue: number;

    @Input({ transform: booleanAttribute })
    public labelsViewEnabled: boolean;

    @Input()
    public labels: Array<number | string | boolean | null | undefined>;

    @Input()
    public tickLabelTemplateRef: TemplateRef<any>;

    /**
     * @hidden
     */
    @HostBinding('class.igx-slider__ticks')
    public ticksClass = true;

    /**
     * @hidden
     */
    @HostBinding('class.igx-slider__ticks--top')
    public get ticksTopClass() {
        return this.ticksOrientation === TicksOrientation.Top;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-slider__ticks--tall')
    public get hasPrimaryClass() {
        return this.primaryTicks > 0;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-slider__tick-labels--top-bottom')
    public get labelsTopToBottomClass() {
        return this.tickLabelsOrientation === TickLabelsOrientation.TopToBottom;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-slider__tick-labels--bottom-top')
    public get labelsBottomToTopClass() {
        return this.tickLabelsOrientation === TickLabelsOrientation.BottomToTop;
    }

    /**
     * Returns the template context corresponding to
     * {@link IgxTickLabelTemplateDirective}
     *
     * ```typescript
     * return {
     *  $implicit //returns the value per each tick label.
     *  isPrimery //returns if the tick is primary.
     *  labels // returns the {@link labels} collection.
     *  index // returns the index per each tick of the whole sequence.
     * }
     * ```
     *
     * @param idx the index per each tick label.
     */
    public context(idx: number): any {
        return {
            $implicit: this.tickLabel(idx),
            isPrimary: this.isPrimary(idx),
            labels: this.labels,
            index: idx
        };
    }

    /**
     * @hidden
     */
    public get ticksLength() {
        return this.primaryTicks > 0 ?
            ((this.primaryTicks - 1) * this.secondaryTicks) + this.primaryTicks :
            this.secondaryTicks > 0 ? this.secondaryTicks : 0;
    }

    public hiddenTickLabels(idx: number) {
        return this.isPrimary(idx) ? this.primaryTickLabels : this.secondaryTickLabels;
    }

    /**
     * @hidden
     */
    public isPrimary(idx: number) {
        return this.primaryTicks <= 0 ? false :
            idx % (this.secondaryTicks + 1) === 0;
    }

    /**
     * @hidden
     */
    public tickLabel(idx: number) {
        if (this.labelsViewEnabled) {
            return this.labels[idx];
        }

        const labelStep = (Math.max(this.minValue, this.maxValue) - Math.min(this.minValue, this.maxValue)) / (this.ticksLength - 1);
        const labelVal = labelStep * idx;

        return (this.minValue + labelVal).toFixed(2);
    }
}
