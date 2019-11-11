import { Component, Input, ElementRef, AfterViewInit, TemplateRef, HostBinding } from '@angular/core';
import { TicksOrientation, TickLabelsOrientation } from '../slider.common';

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
    @HostBinding('class.igx-slider__tick-labels--horizontal')
    public get labelsHorizontalClass() {
        return this.tickLabelsOrientation === TickLabelsOrientation.horizontal;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-slider__tick-labels--toptobottom')
    public get labelsTopToBottomClass() {
        return this.tickLabelsOrientation === TickLabelsOrientation.toptobottom;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-slider__tick-labels--bottomtotop')
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

    // /**
    //  * @hidden
    //  */
    // public get ticksStep() {
    //     const ticksStep = this.ticksContainer / this.ticksLength;
    //     const stepUnit = ticksStep / (this.ticksLength - 1);

    //     return this.ticksContainer ?
    //             ticksStep + stepUnit : 0;
    // }

    // /**
    //  * @hidden
    //  */
    // public get horizontalLabel() {
    //     return this.tickLabelsOrientation === TickLabelsOrientation.horizontal;
    // }

    // /**
    //  * @hidden
    //  */
    // public get topToBottomLabel() {
    //     return this.tickLabelsOrientation === TickLabelsOrientation.toptobottom;
    // }

    // /**
    //  * @hidden
    //  */
    // public get tickLabelOrientation() {
    //     return `rotate(${this.horizontalLabel ? 0 : this.topToBottomLabel ? 90 : -90})`;
    // }

    /**
     * @hidden
     */
    public get ticksLength() {
        return this.primaryTicks > 0 ?
                (this.primaryTicks * this.secondaryTicks) + this.primaryTicks + 1 :
                this.secondaryTicks > 0 ? this.secondaryTicks + 1 : 0;
    }

    // /**
    //  * @hidden
    //  */
    // public tickXOffset(idx: number) {
    //     return idx * this.ticksStep - 1;
    // }

    // /**
    //  * @hidden
    //  */
    // public tickYOffset(idx: number) {
    //     const trackHeight = this.track.nativeElement.offsetHeight;
    //     const primaryTickOffset = this._primaryTicksWidth / 2 + this._defaultTickYOffset + trackHeight;
    //     const secondaryTickOffset = this._secondaryTicksWidth / 2 + this._defaultTickYOffset + trackHeight;
    //     const yOffset = this.isPrimary(idx) ? primaryTickOffset : secondaryTickOffset;

    //     return this.ticksOrientation === TicksOrientation.top ? - (yOffset - trackHeight) : yOffset;
    // }

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

    // /**
    //  * @hidden
    //  */
    // public strokeWidth(idx: number) {
    //     return this.isPrimary(idx) ? this._primaryTicksWidth : this._secondaryTicksWidth;
    // }

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

    // /**
    //  * @hidden
    //  */
    // public tickLabelXOffset(index: number) {
    //     return this.ticksOrientation === TicksOrientation.top && !this.horizontalLabel ?
    //         this.labelXOffset(index) * -1 :
    //         this.labelXOffset(index);
    // }

    // /**
    //  * @hidden
    //  */
    // public tickLabelYOffset(index: number) {
    //     return this.ticksOrientation === TicksOrientation.top && this.horizontalLabel ?
    //         this.labelYOffset(index) * -1 :
    //         this.labelYOffset(index);
    // }

    // /**
    //  * @hidden
    //  */
    // public textAnchor() {
    //     if (this.horizontalLabel) {
    //         return 'middle';
    //     }

    //     if (this.ticksOrientation === TicksOrientation.top) {
    //         return this.topToBottomLabel ? 'end' : 'start';
    //     }

    //     if (this.ticksOrientation === TicksOrientation.bottom) {
    //         return this.topToBottomLabel ? 'start' : 'end';
    //     }
    // }

    // /**
    //  * @hidden
    //  */
    // public dominantBaseline() {
    //     return this.ticksOrientation === TicksOrientation.top && this.horizontalLabel ? 'baseline' :
    //         this.horizontalLabel ? 'hanging' : !this.topToBottomLabel ? 'central' : 'middle';
    // }

    // private labelXOffset(index: number) {
    //     const diffTicksOffset = index % (this.secondaryTicks + 1) === 0 ? 0 : this._defaultTickYOffset;
    //     const verticalDir = this.topToBottomLabel ? 1 : -1;
    //     return this.horizontalLabel ?
    //         this.tickXOffset(index) :
    //         (Math.abs(this.tickYOffset(index)) + this._primaryTicksWidth + diffTicksOffset) * verticalDir;
    // }

    // private labelYOffset(index: number) {
    //     const diffTicksOffset = index % (this.secondaryTicks + 1) === 0 ? 0 : this._defaultTickYOffset;
    //     const verticalDir = this.topToBottomLabel ? 1 : -1;
    //     return this.horizontalLabel ?
    //         Math.abs(this.tickYOffset(index)) + this._primaryTicksWidth + diffTicksOffset :
    //         (-this.tickXOffset(index)) * verticalDir;

    // }
}
