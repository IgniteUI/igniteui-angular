import { CommonModule } from "@angular/common";
import {
    AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, Input, NgModule, OnInit, Output, Renderer2,
    ViewChild
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

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

enum SliderHandle {
    FROM,
    TO
}

export interface IRangeSliderValue {
    lower: number;
    upper: number;
}

const noop = () => {
};

@Component({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxSlider, multi: true }],
    selector: "igx-slider",
    styleUrls: ["./slider.component.scss"],
    templateUrl: "slider.component.html"
})
export class IgxSlider implements ControlValueAccessor, OnInit, AfterViewInit {
    /**
     * Disables or enables UI interaction.
     */
    @Input()
    public disabled: boolean;

    /**
     * Marks slider as continuous. By default is considered that the slider is discrete.
     * Discrete slider does not have ticks and does not shows bubble labels for values.
     */
    @Input()
    public isContinuous: boolean = false;

    /**
     * The type of the slider. The slider can be SliderType.SLIDER or SliderType.RANGE
     * @type {SliderType}
     */
    @Input()
    public type: SliderType = SliderType.SLIDER;

    /***
     * The duration visibility of thumbs labels. The default value is 750 milliseconds.
     * @type {number}
     */
    @Input()
    public thumbLabelVisibilityDuration: number = 750;

    /**
     * The incremental/decremental step of the value when dragging the thumb.
     * The default step is 1, and step should not be less or equal than 0.
     * @type {number}
     */
    @Input()
    public step: number = 1;

    /**
     * This event is emitted when user has stopped interacting the thumb and value is changed.
     * @type {EventEmitter}
     */
    @Output()
    public onValueChange = new EventEmitter();

    public isActiveLabel: boolean = false;

    private activeHandle: SliderHandle = SliderHandle.TO;

    @ViewChild("slider")
    private slider: ElementRef;

    @ViewChild("track")
    private track: ElementRef;

    @ViewChild("ticks")
    private ticks: ElementRef;

    @ViewChild("thumbFrom")
    private thumbFrom: ElementRef;

    @ViewChild("thumbTo")
    private thumbTo: ElementRef;

    private _minValue: number = 0;

    // Measures & Coordinates
    private width: number = 0;
    private xOffset: number = 0;
    private xPointer: number = 0;
    private pPointer: number = 0;

    // Limit handle travel zone
    private pMin: number = 0;
    private pMax: number = 1;

    // From/upperValue in percent values
    private hasViewInit: boolean = false;
    private timer;
    private _maxValue: number = 100;
    private _lowerBound?: number;
    private _upperBound?: number;
    private _lowerValue: number;
    private _upperValue: number;

    private _onChangeCallback: (_: any) => void = noop;
    private _onTouchedCallback: () => void = noop;

    constructor(private renderer: Renderer2) {
    }

    public get isRange(): boolean {
        const isRange: boolean = this.type === SliderType.RANGE;

        return isRange;
    }

    /**
     * Gets the minimal value for the slider.
     * @returns {number}
     */
    public get minValue(): number {
        return this._minValue;
    }

    /**
     * Sets the minimal value for the slider.
     * The default minimal value is 0.
     * @type {number}
     */
    @Input()
    public set minValue(value: number) {
        if (value >= this.maxValue) {
            this._minValue = this.maxValue - 1;
            return;
        }

        this._minValue = value;
    }

    /**
     * Gets the minimal value for the slider
     * @returns {number}
     */
    public get maxValue(): number {
        return this._maxValue;
    }

    /**
     * Sets the maximal value for the slider
     * @type {number}
     */
    @Input()
    public set maxValue(value: number) {
        if (value <= this._minValue) {
            this._maxValue = this._minValue + 1;

            return;
        }

        this._maxValue = value;
    }

    /**
     * Gets the lower bound of the slider.
     * @returns {number}
     */
    public get lowerBound(): number {
        return this._lowerBound;
    }

    /**
     * Sets the lower boundary of the slider value.
     * If not set is the same as min value.
     * @type {number}
     */
    @Input()
    public set lowerBound(value: number) {
        if (value >= this.upperBound) {
            this._lowerBound = this.minValue;
            return;
        }

        this._lowerBound = value;
    }

    /**
     * Gets the upper bound of the slider.
     * @returns {number}
     */
    public get upperBound(): number {
        return this._upperBound;
    }

    /**
     * Sets the upper bound of the slider value.
     * If not set is the same as max value.
     * @type {number}
     */
    @Input()
    public set upperBound(value: number) {
        if (value <= this.lowerBound) {
            this._upperBound = this.maxValue;

            return;
        }

        this._upperBound = value;
    }

    public get lowerValue(): number {
        return this._lowerValue;
    }

    public set lowerValue(value: number) {
        if (value < this.lowerBound || this.upperBound < value) {
            return;
        }

        if (this.isRange && value > this.upperValue) {
            return;
        }

        this._lowerValue = value;
    }

    public get upperValue() {
        return this._upperValue;
    }

    public set upperValue(value: number) {
        if (value < this.lowerBound || this.upperBound < value) {
            return;
        }

        if (this.isRange && value < this.lowerValue) {
            return;
        }

        this._upperValue = value;
    }

    /**
     * Returns the slider value. If the slider is of type SLIDER the returned value is number.
     * If the slider type is RANGE the returned value is object containing lower and upper properties for the values.
     * @returns {any}
     */
    public get value(): number | IRangeSliderValue {
        if (this.isRange) {
            return {
                lower: this.snapValueToStep(this.lowerValue),
                upper: this.snapValueToStep(this.upperValue)
            };
        } else {
            const val = this.snapValueToStep(this.upperValue);
            return val;
        }
    }

    /**
     * Sets the slider value.
     * If the slider is of type SLIDER the argument is number. By default if no value is set the default value is
     * same as lower upper bound.
     * If the slider type is RANGE the the argument is object containing lower and upper properties for the values.
     * By default if no value is set the default value is for lower value it is the same as lower bound and if no
     * value is set for the upper value it is the same as the upper bound.
     * @param value
     */
    @Input()
    public set value(value: number | IRangeSliderValue) {
        if (!this.isRange) {
            this.upperValue = this.snapValueToStep(value as number);
        } else {
            this.upperValue =
                this.snapValueToStep((value as IRangeSliderValue) == null ? null : (value as IRangeSliderValue).upper);
            this.lowerValue =
                this.snapValueToStep((value as IRangeSliderValue) == null ? null : (value as IRangeSliderValue).lower);
        }

        this._onChangeCallback(this.value);

        if (this.hasViewInit) {
            this.positionHandlesAndUpdateTrack();
        }
    }

    public ngOnInit() {
        if (this.lowerBound === undefined) {
            this.lowerBound = this.minValue;
        }

        if (this.upperBound === undefined) {
            this.upperBound = this.maxValue;
        }

        if (this.isRange) {
            if (Number.isNaN((this.value as IRangeSliderValue).lower)) {
                this.value = {
                    lower: this.lowerBound,
                    upper: (this.value as IRangeSliderValue).upper
                };
            }

            if (Number.isNaN((this.value as IRangeSliderValue).upper)) {
                this.value = {
                    lower: (this.value as IRangeSliderValue).lower,
                    upper: this.upperBound
                };
            }
        } else {
            if (Number.isNaN(this.value as number)) {
                this.value = this.lowerBound;
            }
        }

        this.pMin = this.valueToFraction(this.lowerBound) || 0;
        this.pMax = this.valueToFraction(this.upperBound) || 1;
    }

    public ngAfterViewInit() {
        this.hasViewInit = true;
        this.positionHandlesAndUpdateTrack();
        this.setTickInterval();
    }

    public writeValue(value: any): void {
        this.value = value;
    }

    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    public registerOnTouched(fn: any): void {
        this._onTouchedCallback = fn;
    }

    public showThumbsLabels() {
        if (this.disabled) {
            return;
        }

        if (this.isContinuous) {
            return;
        }

        if (this.timer !== null) {
            clearInterval(this.timer);
        }

        this.isActiveLabel = true;
    }

    public onFocus($event: FocusEvent) {
        if (this.isRange && $event.target === this.thumbFrom.nativeElement) {
            this.activeHandle = SliderHandle.FROM;
        }

        if ($event.target === this.thumbTo.nativeElement) {
            this.activeHandle = SliderHandle.TO;
        }

        this.toggleThumbLabel();
    }

    public onPanEnd($event) {
        this.hideThumbsLabels();
        this.emitValueChanged();
    }

    public hideThumbLabelsOnBlur() {
        if (this.timer !== null) {
            clearInterval(this.timer);
        }

        this.isActiveLabel = false;
    }

    public onKeyDown($event: KeyboardEvent) {
        if (this.disabled) {
            return true;
        }

        let incrementSign;

        if ($event.key.endsWith("Left")) {
            incrementSign = -1;
        } else if ($event.key.endsWith("Right")) {
            incrementSign = 1;
        } else {
            return;
        }

        const value = this.value;

        if (this.isRange) {
            if (this.activeHandle === SliderHandle.FROM) {
                const newLower = (this.value as IRangeSliderValue).lower + incrementSign * this.step;

                if (newLower >= (this.value as IRangeSliderValue).upper) {
                    this.thumbTo.nativeElement.focus();
                    return;
                }

                this.value = {
                    lower: newLower,
                    upper: (this.value as IRangeSliderValue).upper
                };
            } else {
                const newUpper = (this.value as IRangeSliderValue).upper + incrementSign * this.step;

                if (newUpper <= (this.value as IRangeSliderValue).lower) {
                    this.thumbFrom.nativeElement.focus();
                    return;
                }

                this.value = {
                    lower: (this.value as IRangeSliderValue).lower,
                    upper: (this.value as IRangeSliderValue).upper + incrementSign * this.step
                };
            }
        } else {
            this.value = this.value as number + incrementSign * this.step;
        }

        if (this.hasValueChanged(value)) {
            this.emitValueChanged();
        }

        this.showThumbsLabels();
    }

    public onTap($event) {
        const value = this.value;
        this.update($event);

        if (this.hasValueChanged(value)) {
            this.emitValueChanged();
        }
    }

    public update($event) {
        if (this.disabled) {
            return;
        }

        if ($event.type === "tap") {
            this.toggleThumbLabel();
        }

        // Set width and offset first
        this.setSliderWidth();
        this.setSliderOffset();

        // Then get pointer coordinates
        this.setPointerPosition($event);
        this.setPointerPercent();

        // Find the closest handle if dual slider
        if (this.isRange) {
            this.closestHandle();
        }

        // Update To/From Values
        this.setValues();
        // this.printInfo();

        // Finally do positionHandlesAndUpdateTrack the DOM
        // based on data values
        this.positionHandlesAndUpdateTrack();
        this._onTouchedCallback();
    }

    public hideThumbsLabels() {
        if (this.disabled) {
            return;
        }

        if (this.isContinuous) {
            return;
        }

        this.timer = setTimeout(
            () => this.isActiveLabel = false,
            this.thumbLabelVisibilityDuration
        );
    }

    private generateTickMarks(color: string, interval: number) {
        return `repeating-linear-gradient(
            ${"to left"},
            ${color},
            ${color} 1.5px,
            transparent 1.5px,
            transparent ${interval}%
        ), repeating-linear-gradient(
            ${"to right"},
            ${color},
            ${color} 1.5px,
            transparent 1.5px,
            transparent ${interval}%
        )`;
    }

    private toggleThumbLabel() {
        this.showThumbsLabels();
        this.hideThumbsLabels();
    }

    private getSliderOffset(): number {
        return this.xOffset;
    }

    private toFixed(num: number): number {
        num = parseFloat(num.toFixed(20));
        return num;
    }

    private positionHandle(handle: ElementRef, position: number) {
        handle.nativeElement.style.left = `${this.valueToFraction(position) * 100}%`;
    }

    private positionHandlesAndUpdateTrack() {
        if (!this.isRange) {
            this.positionHandle(this.thumbTo, this.value as number);
        } else {
            this.positionHandle(this.thumbTo, (this.value as IRangeSliderValue).upper);
            this.positionHandle(this.thumbFrom, (this.value as IRangeSliderValue).lower);
        }

        this.updateTrack();
    }

    private closestHandle() {
        const fromOffset = this.thumbFrom.nativeElement.offsetLeft + this.thumbFrom.nativeElement.offsetWidth / 2;
        const toOffset = this.thumbTo.nativeElement.offsetLeft + this.thumbTo.nativeElement.offsetWidth / 2;
        const match = this.closestTo(this.xPointer, [fromOffset, toOffset]);

        if (match === toOffset) {
            this.thumbTo.nativeElement.focus();
        } else if (match === fromOffset) {
            this.thumbFrom.nativeElement.focus();
        }
    }

    private setTickInterval() {
        if (this.isContinuous) {
            return;
        }

        const interval = this.step > 1 ? this.step : null;
        this.renderer.setStyle(this.ticks.nativeElement, "background", this.generateTickMarks("white", interval));
    }

    private snapValueToStep(value: number): number {
        const valueModStep = (value - this.minValue) % this.step;
        let snapValue = value - valueModStep;

        if (Math.abs(valueModStep) * 2 >= this.step) {
            snapValue += (valueModStep > 0) ? this.step : (-this.step);
        }

        return parseFloat(snapValue.toFixed(20));
    }

    private closestTo(goal: number, positions: number[]): number {
        return positions.reduce((previous, current) => {
            return (Math.abs(goal - current) < Math.abs(goal - previous) ? current : previous);
        });
    }

    // Set Values for To/From based on active handle
    private setValues() {
        if (this.activeHandle === SliderHandle.TO) {
            if (this.isRange) {
                this.value = {
                    lower: (this.value as IRangeSliderValue).lower,
                    upper: this.fractionToValue(this.pPointer)
                };
            } else {
                this.value = this.fractionToValue(this.pPointer);
            }
        }

        if (this.activeHandle === SliderHandle.FROM) {
            this.value = {
                lower: this.fractionToValue(this.pPointer),
                upper: (this.value as IRangeSliderValue).upper
            };
        }
    }

    private setSliderWidth(): void {
        this.width = this.slider.nativeElement.offsetWidth;
    }

    private setPointerPosition(e) {
        this.xPointer = e.center.x - this.getSliderOffset();
    }

    private setSliderOffset() {
        const rect = this.slider.nativeElement.getBoundingClientRect();
        this.xOffset = rect.left;
    }

    private setPointerPercent() {
        this.pPointer = this.limit(this.toFixed(this.xPointer / this.width));
    }

    private valueToFraction(value: number) {
        return this.limit((value - this.minValue) / (this.maxValue - this.minValue));
    }

    private fractionToValue(fraction: number): number {
        const max: number = this.maxValue;
        const min: number = this.minValue;

        return (max - min) * fraction + min;
    }

    private fractionToPercent(fraction: number): number {
        return this.toFixed(fraction * 100);
    }

    private limit(num: number): number {
        return Math.max(this.pMin, Math.min(num, this.pMax));
    }

    private updateTrack() {
        const fromPosition = this.valueToFraction(this.lowerValue);
        const toPosition = this.valueToFraction(this.upperValue);
        const positionGap = (this.valueToFraction(this.upperValue) - this.valueToFraction(this.lowerValue));

        if (!this.isRange) {
            this.track.nativeElement.style.transform = `scaleX(${toPosition})`;
        }

        if (this.isRange) {
            this.track.nativeElement.style.transform = `scaleX(${1})`;
            this.track.nativeElement.style.left = `${fromPosition * 100}%`;
            this.track.nativeElement.style.width = `${positionGap * 100}%`;
        }
    }
    private hasValueChanged(oldValue) {
        const isSliderWithDifferentValue: boolean = !this.isRange && oldValue !== this.value;
        const isRangeWithOneDifferentValue: boolean = this.isRange &&
            ((oldValue as IRangeSliderValue).lower !== (this.value as IRangeSliderValue).lower ||
                (oldValue as IRangeSliderValue).upper !== (this.value as IRangeSliderValue).upper);

        return isSliderWithDifferentValue || isRangeWithOneDifferentValue;
    }

    private emitValueChanged() {
        this.onValueChange.emit({ value: this.value });
    }
}

@NgModule({
    declarations: [IgxSlider],
    exports: [IgxSlider],
    imports: [CommonModule]
})
export class IgxSliderModule {
}
