import { Component, Input, ElementRef, AfterViewInit, TemplateRef, HostBinding } from '@angular/core';
import { TicksOrientation, TickLabelsOrientation } from '../slider.common';

/**
 * @hidden
 */
@Component({
    selector: 'igx-ticks',
    templateUrl: 'ticks.component.html',
})
export class IgxTicksComponent {
    @Input()
    public primaryTicks: number;

    @Input()
    public secondaryTicks: number;

    @Input()
    public primaryTickLabels: boolean;

    @Input()
    public secondaryTickLabels: boolean;

    @Input()
    public ticksOrientation: TicksOrientation;

    @Input()
    public tickLabelsOrientation: TickLabelsOrientation;

    @Input()
    public maxValue: number;

    @Input()
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
        return this.ticksOrientation === TicksOrientation.top;
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
        return this.tickLabelsOrientation === TickLabelsOrientation.toptobottom;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-slider__tick-labels--bottom-top')
    public get labelsBottomToTopClass() {
        return this.tickLabelsOrientation === TickLabelsOrientation.bottomtotop;
    }

    /**
     * Returns the template context corresponding to
     * {@link IgxTickLabelTemplateDirective}
     *
     * ```typescript
     * return {
     *  $implicit //returns tick labels value
     *  isPrimery //returns if the tick is primary.
     *  labels // returns the labels collection.
     *  index // returns the index of every tick on the tick series.
     * }
     * ```
     *
     * @param idx the index of the tick series that are rendered.
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
                (this.primaryTicks * this.secondaryTicks) + this.primaryTicks + 1 :
                this.secondaryTicks > 0 ? this.secondaryTicks + 1 : 0;
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

        const labelStep = this.maxValue / (this.ticksLength - 1);
        const labelVal = labelStep * idx;

        return labelVal.toFixed(2);
    }
}
