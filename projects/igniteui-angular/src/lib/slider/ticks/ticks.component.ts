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
    public ticksOrientation: TicksOrientation = TicksOrientation.bottom;

    @Input()
    public tickLabelsOrientation = TickLabelsOrientation.horizontal;

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
                ticksStep + stepUnit
                : 0;
    }

    /**
     * @hidden
     */
    public get isHorizontal() {
        return this.tickLabelsOrientation === TickLabelsOrientation.horizontal;
    }

    /**
     * @hidden
     */
    public get tickLabelOrientation() {
        return this.isHorizontal ? 'rotate(0)' : 'rotate(90)';
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
        return this.primaryTicks <= 0 ? `${this._secondaryTicksWidth}px` :
                idx % (this.secondaryTicks + 1) === 0 ? `${this._primaryTicksWidth}px` : `${this._secondaryTicksWidth}px`;
    }

    /**
     * @hidden
     */
    public tickLabel(idx: number) {
        const labelStep = this.maxValue / (this.ticksLength - 1);
        return (labelStep * idx).toFixed(2);
    }

    /**
     * @hidden
     */
    public tickLabelXOffset(index: number) {
        // return this.isHorizontal ? this.tickXOffset(index) : this.tickYOffset(index) * 3;
        const diffTicksOffset = index % (this.secondaryTicks + 1) === 0 ? 0 : this._defaultTickYOffset;
        return this.isHorizontal ? this.tickXOffset(index) : this.tickYOffset(index) + this._primaryTicksWidth + 8 + diffTicksOffset;
    }

    /**
     * @hidden
     */
    public tickLabelYOffset(index: number) {
        // const labelOffset = index % (this.secondaryTicks + 1) === 0 ? 8 : 16;
        // return this.isHorizontal ? this.tickYOffset(index) + this._primaryTicksWidth + labelOffset : - (this.tickXOffset(index) - 5);
        const diffTicksOffset = index % (this.secondaryTicks + 1) === 0 ? 0 : this._defaultTickYOffset;
        // const direction = this.isHorizontal ? this.tickYOffset(index) : this.tickXOffset(index);
        return this.isHorizontal ? this.tickYOffset(index) + this._primaryTicksWidth + 8 + diffTicksOffset : -this.tickXOffset(index);
    }

}
