import { Component, Input, ElementRef, HostBinding } from '@angular/core';
import { TicksOrientation, TickLabelsOrientation } from '../slider.common';

@Component({
    selector: 'igx-ticks',
    templateUrl: 'ticks.component.html',
    styles: [`
        :host {
            position: absolute;
            height: 100px;
        }
    }`]
})
export class IgxTicksComponent {
    private _primaryTicksWidth = 16;
    private _secondaryTicksWidth = 8;
    private _defaultTickYOffset = 4;

    @Input()
    public primaryTicks: number;

    @Input()
    public secondaryTicks: number;

    @Input()
    public primaryTickLabels = true;

    @Input()
    public secondaryTickLabels = false;

    @Input()
    public ticksOrientation: TicksOrientation;

    @Input()
    public tickLabelsOrientation: TickLabelsOrientation;

    @Input()
    public ticksContainer: number;

    @Input()
    public track: ElementRef;

    @Input()
    public maxValue: number;

    /**
     * @hidden
     */
    public get ticksStep() {
        const ticksStep = this.ticksContainer / this.ticksLength;
        const stepUnit = ticksStep / (this.ticksLength - 1);

        return this.ticksContainer ?
                ticksStep + stepUnit : 0;
    }

    /**
     * @hidden
     */
    public get horizontalLabel() {
        return this.tickLabelsOrientation === TickLabelsOrientation.horizontal;
    }

    /**
     * @hidden
     */
    public get toToBottomLabel() {
        return this.tickLabelsOrientation === TickLabelsOrientation.toptobottom;
    }

    /**
     * @hidden
     */
    public get tickLabelOrientation() {
        return `rotate(${this.horizontalLabel ? 0 : this.toToBottomLabel ? -90 : 90})`;
    }

    /**
     * @hidden
     */
    public get ticksLength() {
        return this.primaryTicks > 0 ?
                (this.primaryTicks * this.secondaryTicks) + this.primaryTicks + 1 :
                this.secondaryTicks > 0 ? this.secondaryTicks + 1 : 0;
    }

        /**
     * @hidden
     */
    public tickXOffset(idx: number) {
        return idx * this.ticksStep - 1;
    }

    /**
     * @hidden
     */
    public tickYOffset(idx: number) {
        const trackHeight = this.track.nativeElement.offsetHeight;
        const primaryTickOffset = this._primaryTicksWidth / 2 + trackHeight + this._defaultTickYOffset;
        const secondaryTickOffset = this._secondaryTicksWidth / 2 + trackHeight + this._defaultTickYOffset;
        return this.primaryTicks <= 0 ? secondaryTickOffset :
            idx % (this.secondaryTicks + 1) === 0 ? primaryTickOffset : secondaryTickOffset;
    }

    /**
     * @hidden
     */
    public strokeWidth(idx: number) {
        return this.primaryTicks <= 0 ? this._secondaryTicksWidth :
                idx % (this.secondaryTicks + 1) === 0 ? this._primaryTicksWidth : this._secondaryTicksWidth;
    }

    /**
     * @hidden
     */
    public tickLabel(idx: number) {
        const labelStep = this.maxValue / (this.ticksLength - 1);
        const labelVal = labelStep * idx;

        return labelVal % 10 === 0 ? labelVal : labelVal.toFixed(2);
    }

    /**
     * @hidden
     */
    public tickLabelXOffset(index: number) {
        const diffTicksOffset = index % (this.secondaryTicks + 1) === 0 ? 0 : this._defaultTickYOffset;
        const verticalDir = this.toToBottomLabel ? -1 : 1;
        return this.horizontalLabel ?
            this.tickXOffset(index) :
            (this.tickYOffset(index) + this._primaryTicksWidth + diffTicksOffset) * verticalDir;
    }

    /**
     * @hidden
     */
    public tickLabelYOffset(index: number) {
        const diffTicksOffset = index % (this.secondaryTicks + 1) === 0 ? 0 : this._defaultTickYOffset;
        const verticalDir = this.toToBottomLabel ? -1 : 1;
        return this.horizontalLabel ?
            this.tickYOffset(index) + this._primaryTicksWidth + diffTicksOffset :
            (-this.tickXOffset(index)) * verticalDir;
    }

    /**
     * @hidden
     */
    public textAnchor() {
        return this.horizontalLabel ? 'middle' : this.toToBottomLabel ? 'end' : 'start';
    }

    /**
     * @hidden
     */
    public dominantBaseline() {
        return this.horizontalLabel ? 'hanging' : this.toToBottomLabel ? 'central' : 'middle';
    }

}
