import { AfterViewInit, EventEmitter, OnInit, Renderer2 } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
export declare enum SliderType {
    SLIDER = 0,
    RANGE = 1,
}
export interface IRangeSliderValue {
    lower: number;
    upper: number;
}
export interface ISliderValueChangeEventArgs {
    oldValue: number | IRangeSliderValue;
    value: number | IRangeSliderValue;
}
export declare class IgxSliderComponent implements ControlValueAccessor, OnInit, AfterViewInit {
    private renderer;
    id: string;
    disabled: boolean;
    isContinuous: boolean;
    type: SliderType;
    thumbLabelVisibilityDuration: number;
    step: number;
    onValueChange: EventEmitter<ISliderValueChangeEventArgs>;
    isActiveLabel: boolean;
    private activeHandle;
    private slider;
    private track;
    private ticks;
    private thumbFrom;
    private thumbTo;
    private _minValue;
    private width;
    private xOffset;
    private xPointer;
    private pPointer;
    private pMin;
    private pMax;
    private hasViewInit;
    private timer;
    private _maxValue;
    private _lowerBound?;
    private _upperBound?;
    private _lowerValue;
    private _upperValue;
    private _onChangeCallback;
    private _onTouchedCallback;
    constructor(renderer: Renderer2);
    readonly isRange: boolean;
    minValue: number;
    maxValue: number;
    lowerBound: number;
    upperBound: number;
    lowerValue: number;
    upperValue: number;
    value: number | IRangeSliderValue;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    writeValue(value: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    showThumbsLabels(): void;
    onFocus($event: FocusEvent): void;
    onPanEnd($event: any): void;
    hideThumbLabelsOnBlur(): void;
    onKeyDown($event: KeyboardEvent): boolean;
    onTap($event: any): void;
    update($event: any): void;
    hideThumbsLabels(): void;
    private generateTickMarks(color, interval);
    private toggleThumbLabel();
    private getSliderOffset();
    private toFixed(num);
    private positionHandle(handle, position);
    private positionHandlesAndUpdateTrack();
    private closestHandle();
    private setTickInterval();
    private snapValueToStep(value);
    private closestTo(goal, positions);
    private setValues();
    private setSliderWidth();
    private setPointerPosition(e);
    private setSliderOffset();
    private setPointerPercent();
    private valueToFraction(value);
    private fractionToValue(fraction);
    private fractionToPercent(fraction);
    private limit(num);
    private updateTrack();
    private hasValueChanged(oldValue);
    private emitValueChanged(oldValue);
}
export declare class IgxSliderModule {
}
