import { CommonModule } from '@angular/common';
import {
    AfterViewInit, Component, ElementRef, EventEmitter,
    forwardRef, HostBinding, Input, NgModule, OnInit, Output, Renderer2,
    ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditorProvider } from '../core/edit-provider';

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

export interface ISliderValueChangeEventArgs {
    oldValue: number | IRangeSliderValue;
    value: number | IRangeSliderValue;
}

const noop = () => {
};

let NEXT_ID = 0;

/**
 * **Ignite UI for Angular Slider** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/slider.html)
 *
 * The Ignite UI Slider allows selection in a given range by moving the thumb along the track. The track
 * can be defined as continuous or stepped, and you can choose between single and range slider types.
 *
 * Example:
 * ```html
 * <igx-slider id="slider"
 *            [minValue]="0" [maxValue]="100"
 *            [isContinuous]=true [(ngModel)]="volume">
 * </igx-slider>
 * ```
 */
@Component({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxSliderComponent, multi: true }],
    selector: 'igx-slider',
    templateUrl: 'slider.component.html'
})
export class IgxSliderComponent implements ControlValueAccessor, EditorProvider, OnInit, AfterViewInit {

    /**
     * An @Input property that sets the value of the `id` attribute.
     * If not provided it will be automatically generated.
     * ```html
     * <igx-slider [id]="'igx-slider-32'" [(ngModel)]="task.percentCompleted" [step]="5" [lowerBound]="20">
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-slider-${NEXT_ID++}`;
    /**
     *An @Input property that disables or enables UI interaction.
     *```html
     *<igx-slider #slider [disabled]="'true'" [(ngModel)]="task.percentCompleted" [step]="5" [lowerBound]="20">
     *```
     */
    @Input()
    public disabled: boolean;

    /**
     * An @Input property that marks the `IgxSliderComponent` as continuous.
     * By default is considered that the `IgxSliderComponent` is discrete.
     * Discrete `IgxSliderComponent` does not have ticks and does not shows bubble labels for values.
     * ```html
     * <igx-slider #slider [isContinuous]="'true'" [(ngModel)]="task.percentCompleted" [step]="5" [lowerBound]="20">
     * ```
     */
    @Input()
    public isContinuous = false;

    /**
     * An @Input property that sets the type of the `IgxSliderComponent`. The slider can be SliderType.SLIDER(default) or SliderType.RANGE.
     * ```typescript
     * sliderType: SliderType = SliderType.RANGE;
     * //...
     * ```
     * ```html
     * <igx-slider #slider2 [type]="sliderType" [(ngModel)]="rangeValue" [minValue]="0" [maxValue]="100">
     * ```
     */
    @Input()
    public type: SliderType = SliderType.SLIDER;

    /**
     *An @Input property that sets the duration visibility of thumbs labels. The default value is 750 milliseconds.
     *```html
     *<igx-slider #slider [thumbLabelVisibilityDuration]="3000" [(ngModel)]="task.percentCompleted" [step]="5">
     *```
     */
    @Input()
    public thumbLabelVisibilityDuration = 750;

    /**
     * An @Input property that sets the incremental/decremental step of the value when dragging the thumb.
     * The default step is 1, and step should not be less or equal than 0.
     * ```html
     * <igx-slider #slider [(ngModel)]="task.percentCompleted" [step]="5">
     * ```
     */
    @Input()
    public step = 1;

    /**
     * This event is emitted when user has stopped interacting the thumb and value is changed.
     * ```typescript
     * public change(event){
     *    alert("The value has been changed!");
     *}
     * ```
     * ```html
     * <igx-slider (onValueChange)="change($event)" #slider [(ngModel)]="task.percentCompleted" [step]="5">
     * ```
     */
    @Output()
    public onValueChange = new EventEmitter<ISliderValueChangeEventArgs>();

    /**
     * @hidden
     */
    public isActiveLabel = false;

    private activeHandle: SliderHandle = SliderHandle.TO;

    @ViewChild('slider')
    private slider: ElementRef;

    @ViewChild('track')
    private track: ElementRef;

    @ViewChild('ticks')
    private ticks: ElementRef;

    @ViewChild('thumbFrom')
    private thumbFrom: ElementRef;

    @ViewChild('thumbTo')
    private thumbTo: ElementRef;


    // Measures & Coordinates
    private width = 0;
    private xOffset = 0;
    private xPointer = 0;
    private pPointer = 0;

    // Limit handle travel zone
    private pMin = 0;
    private pMax = 1;

    // From/upperValue in percent values
    private hasViewInit = false;
    private timer;
    private _minValue = 0;
    private _maxValue = 100;
    private _lowerBound?: number;
    private _upperBound?: number;
    private _lowerValue: number;
    private _upperValue: number;
    private _trackUpperBound: boolean;
    private _trackLowerBound: boolean;

    private _onChangeCallback: (_: any) => void = noop;
    private _onTouchedCallback: () => void = noop;

    constructor(private renderer: Renderer2) {
    }

    /**
     *Returns whether the `IgxSliderComponent` type is RANGE.
     *```typescript
     *@ViewChild("slider")
     *public slider: IgxSliderComponent;
     *ngAfterViewInit(){
     *    let sliderRange = this.slider.isRange;
     *}
     * ```
     */
    public get isRange(): boolean {
        const isRange: boolean = this.type === SliderType.RANGE;

        return isRange;
    }


    /**
     * Returns the maximum value for the `IgxSliderComponent`.
     * ```typescript
     *@ViewChild("slider")
     *public slider: IgxSliderComponent;
     *ngAfterViewInit(){
     *    let sliderMax = this.slider.maxValue;
     *}
     * ```
     */
    public get maxValue(): number {
        return this._maxValue;
    }

    /**
     * Sets the maximal value for the `IgxSliderComponent`.
     * The default maximum value is 100.
     * ```html
     * <igx-slider [type]="sliderType" [minValue]="56" [maxValue]="256">
     * ```
     */
    @Input()
    public set maxValue(value: number) {
        if (value <= this._minValue) {
            this._maxValue = this._minValue + 1;
        } else {
            this._maxValue = value;
        }

        if (this._trackUpperBound) {
            this._upperBound = this._maxValue;
        }
        this.invalidateValue();
    }

    /**
     *Returns the minimal value of the `IgxSliderComponent`.
     *```typescript
     *@ViewChild("slider2")
     *public slider: IgxSliderComponent;
     *ngAfterViewInit(){
     *    let sliderMin = this.slider.minValue;
     *}
     *```
     */
    public get minValue(): number {
        return this._minValue;
    }

    /**
     * Sets the minimal value for the `IgxSliderComponent`.
     * The default minimal value is 0.
     * ```html
     * <igx-slider [type]="sliderType" [minValue]="56" [maxValue]="100">
     * ```
     */
    @Input()
    public set minValue(value: number) {
        if (value >= this.maxValue) {
            this._minValue = this.maxValue - 1;
        } else {
            this._minValue = value;
        }

        if (this._trackLowerBound) {
            this._lowerBound = this._minValue;
        }
        this.invalidateValue();
    }

    /**
     * Returns the lower boundary of the `IgxSliderComponent`.
     *```typescript
     *@ViewChild("slider")
     *public slider: IgxSliderComponent;
     *ngAfterViewInit(){
     *    let sliderLowBound = this.slider.lowerBound;
     *}
     *```
     */
    public get lowerBound(): number {
        return this._lowerBound;
    }

    /**
     * Sets the lower boundary of the `IgxSliderComponent`.
     * If not set is the same as min value.
     * ```html
     * <igx-slider [step]="5" [lowerBound]="20">
     * ```
     */
    @Input()
    public set lowerBound(value: number) {
        if (this._trackLowerBound) {
            this._trackLowerBound = false;
        }

        if (value >= this.upperBound) {
            this._lowerBound = this.minValue;
            return;
        }

        this._lowerBound = this.valueInRange(value, this.minValue, this.maxValue);
    }

    /**
     * Returns the upper boundary of the `IgxSliderComponent`.
     * ```typescript
     *@ViewChild("slider")
     *public slider: IgxSliderComponent;
     *ngAfterViewInit(){
     *    let sliderUpBound = this.slider.upperBound;
     *}
     * ```
     */
    public get upperBound(): number {
        return this._upperBound;
    }

    /**
     * Sets the upper boundary of the `IgxSliderComponent`.
     * If not set is the same as max value.
     * ```html
     * <igx-slider [step]="5" [upperBound]="20">
     * ```
     */
    @Input()
    public set upperBound(value: number) {
        if (this._trackUpperBound) {
            this._trackUpperBound = false;
        }

        if (value <= this.lowerBound) {
            this._upperBound = this.maxValue;

            return;
        }

        this._upperBound = this.valueInRange(value, this.minValue, this.maxValue);
    }

    /**
     * Returns the lower value of the `IgxSliderComponent`.
     * ```typescript
     * @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * public lowValue(event){
     *    let sliderLowValue = this.slider.lowerValue;
     *}
     *```
     */
    public get lowerValue(): number {
        return this._lowerValue;
    }

    /**
     *Sets the lower value of the `IgxSliderComponent`.
     *```typescript
     *@ViewChild("slider2")
     *public slider: IgxSliderComponent;
     *public lowValue(event){
     *    this.slider.lowerValue = 120;
     *}
     *```
     */
    public set lowerValue(value: number) {
        value = this.valueInRange(value, this.lowerBound, this.upperBound);

        if (this.isRange && value > this.upperValue) {
            return;
        }

        this._lowerValue = value;
    }

    /**
     *Returns the upper value of the `IgxSliderComponent`.
     *```typescript
     *@ViewChild("slider2")
     *public slider: IgxSliderComponent;
     *public upperValue(event){
     *    let upperValue = this.slider.upperValue;
     *}
     *```
     */
    public get upperValue() {
        return this._upperValue;
    }

    /**
     *Sets the upper value of the `IgxSliderComponent`.
     *```typescript
     *@ViewChild("slider2")
     *public slider: IgxSliderComponent;
     *public upperValue(event){
     *    this.slider.upperValue = 120;
     *}
     *```
     */
    public set upperValue(value: number) {
        value = this.valueInRange(value, this.lowerBound, this.upperBound);

        if (this.isRange && value < this.lowerValue) {
            return;
        }

        this._upperValue = value;
    }

    /**
     * Returns the slider value. If the slider is of type SLIDER the returned value is number.
     * If the slider type is RANGE the returned value is object containing lower and upper properties for the values.
     *```typescript
     *@ViewChild("slider2")
     *public slider: IgxSliderComponent;
     *public sliderValue(event){
     *    let sliderVal = this.slider.value;
     *}
     *```
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
     * ```typescript
     *rangeValue = {
     *   lower: 30,
     *   upper: 60
     *};
     * ```
     * ```html
     * <igx-slider [type]="sliderType" [(ngModel)]="rangeValue" [minValue]="56" [maxValue]="256">
     * ```
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

    /**
     * @hidden
     */
    public ngOnInit() {
        if (this.lowerBound === undefined) {
            this.lowerBound = this.minValue;
            this._trackLowerBound = true;
        }

        if (this.upperBound === undefined) {
            this.upperBound = this.maxValue;
            this._trackUpperBound = true;
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

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        this.hasViewInit = true;
        this.positionHandlesAndUpdateTrack();
        this.setTickInterval();
    }

    /**
     * @hidden
     */
    public writeValue(value: any): void {
        this.value = value;
    }

    /**
     * @hidden
     */
    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    /**
     * @hidden
     */
    public registerOnTouched(fn: any): void {
        this._onTouchedCallback = fn;
    }

    /** @hidden */
    getEditElement() {
        return this.isRange ? this.thumbFrom.nativeElement : this.thumbTo.nativeElement;
    }

    /**
     * @hidden
     */
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

    /**
     *
     * @hidden
     */
    public onFocus($event: FocusEvent) {
        if (this.isRange && $event.target === this.thumbFrom.nativeElement) {
            this.activeHandle = SliderHandle.FROM;
        }

        if ($event.target === this.thumbTo.nativeElement) {
            this.activeHandle = SliderHandle.TO;
        }

        this.toggleThumbLabel();
    }
    /**
     *
     * @hidden
     */
    public onPanEnd($event) {
        this.hideThumbsLabels();
        this.emitValueChanged(null);
    }
    /**
     *
     * @hidden
     */
    public hideThumbLabelsOnBlur() {
        if (this.timer !== null) {
            clearInterval(this.timer);
        }

        this.isActiveLabel = false;
    }
    /**
     *
     * @hidden
     */
    public onKeyDown($event: KeyboardEvent) {
        if (this.disabled) {
            return true;
        }

        let incrementSign;

        if ($event.key.endsWith('Left')) {
            incrementSign = -1;
        } else if ($event.key.endsWith('Right')) {
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
            this.emitValueChanged(value);
        }

        this.showThumbsLabels();
    }
    /**
     *
     * @hidden
     */
    public onTap($event) {
        const value = this.value;
        this.update($event);

        if (this.hasValueChanged(value)) {
            this.emitValueChanged(value);
        }
    }

    /**
     *
     * @hidden
     */
    public update($event) {
        if (this.disabled) {
            return;
        }

        if ($event.type === 'tap') {
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

    /**
     * @hidden
     */
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

    private valueInRange(value, min = 0, max = 100) {
        return Math.max(Math.min(value, max), min);
    }

    private invalidateValue() {
        if (!this.isRange) {
            if (this.value >= this._lowerBound && this.value <= this._upperBound) {
                this.positionHandlesAndUpdateTrack();
            } else if (this.value < this._lowerBound) {
                this.value = this._lowerBound;
            } else if (this.value > this._upperBound) {
                this.value = this._upperBound;
            }
        } else {
            const value = this.value as IRangeSliderValue;

            if (value.lower >= this._lowerBound && value.lower <= this._upperBound) {
                this.positionHandlesAndUpdateTrack();
            } else if (value.lower < this._lowerBound) {
                this.value = {
                    lower: this._lowerBound,
                    upper: value.upper
                };
            } else if (value.lower > this._upperBound) {
                this.value = {
                    lower: value.lower,
                    upper: this._upperBound
                };
            }

            if (value.upper >= this._lowerBound && value.upper <= this._upperBound) {
                this.positionHandlesAndUpdateTrack();
            } else if (value.upper < this._lowerBound) {
                this.value = {
                    lower: this._lowerBound,
                    upper: value.upper
                };
            } else if (value.upper > this._upperBound) {
                this.value = {
                    lower: value.lower,
                    upper: this._upperBound
                };
            }
        }
    }

    private generateTickMarks(color: string, interval: number) {
        return `repeating-linear-gradient(
            ${'to left'},
            ${color},
            ${color} 1.5px,
            transparent 1.5px,
            transparent ${interval}%
        ), repeating-linear-gradient(
            ${'to right'},
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
        this.renderer.setStyle(this.ticks.nativeElement, 'background', this.generateTickMarks('white', interval));
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
        this.pPointer = this.valueInRange(this.toFixed(this.xPointer / this.width), this.pMin, this.pMax);
    }

    private valueToFraction(value: number) {
        return this.valueInRange((value - this.minValue) / (this.maxValue - this.minValue), this.pMin, this.pMax);
    }

    private fractionToValue(fraction: number): number {
        const max: number = this.maxValue;
        const min: number = this.minValue;

        return (max - min) * fraction + min;
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

    private emitValueChanged(oldValue: number | IRangeSliderValue) {
        this.onValueChange.emit({ oldValue, value: this.value });
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxSliderComponent],
    exports: [IgxSliderComponent],
    imports: [CommonModule]
})
export class IgxSliderModule {
}
