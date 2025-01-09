import { NgIf } from '@angular/common';
import {
    AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, ContentChild, ElementRef, EventEmitter,
    HostBinding, HostListener, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, QueryList, Renderer2, SimpleChanges, TemplateRef, ViewChild, ViewChildren, booleanAttribute
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { animationFrameScheduler, fromEvent, interval, merge, noop, Observable, Subject, timer } from 'rxjs';
import { takeUntil, throttle, throttleTime } from 'rxjs/operators';
import { EditorProvider } from '../core/edit-provider';
import { resizeObservable } from '../core/utils';
import { IgxDirectionality } from '../services/direction/directionality';
import { IgxThumbLabelComponent } from './label/thumb-label.component';
import {
    IgxSliderType, IgxThumbFromTemplateDirective,
    IgxThumbToTemplateDirective, IgxTickLabelTemplateDirective, IRangeSliderValue, ISliderValueChangeEventArgs, SliderHandle, TickLabelsOrientation, TicksOrientation
} from './slider.common';
import { IgxSliderThumbComponent } from './thumb/thumb-slider.component';
import { IgxTickLabelsPipe } from './ticks/tick.pipe';
import { IgxTicksComponent } from './ticks/ticks.component';

let NEXT_ID = 0;

/**
 * **Ignite UI for Angular Slider** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/slider/slider)
 *
 * The Ignite UI Slider allows selection in a given range by moving the thumb along the track. The track
 * can be defined as continuous or stepped, and you can choose between single and range slider types.
 *
 * Example:
 * ```html
 * <igx-slider id="slider"
 *            [minValue]="0" [maxValue]="100"
 *            [continuous]=true [(ngModel)]="volume">
 * </igx-slider>
 * ```
 */
@Component({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxSliderComponent, multi: true }],
    selector: 'igx-slider',
    templateUrl: 'slider.component.html',
    imports: [NgIf, IgxTicksComponent, IgxThumbLabelComponent, IgxSliderThumbComponent, IgxTickLabelsPipe]
})
export class IgxSliderComponent implements
    ControlValueAccessor,
    EditorProvider,
    OnInit,
    AfterViewInit,
    AfterContentInit,
    OnChanges,
    OnDestroy {
    /**
     * @hidden
     */
    public get thumbFrom(): IgxSliderThumbComponent {
        return this.thumbs.find(thumb => thumb.type === SliderHandle.FROM);
    }

    /**
     * @hidden
     */
    public get thumbTo(): IgxSliderThumbComponent {
        return this.thumbs.find(thumb => thumb.type === SliderHandle.TO);
    }

    private get labelFrom(): IgxThumbLabelComponent {
        return this.labelRefs.find(label => label.type === SliderHandle.FROM);
    }

    private get labelTo(): IgxThumbLabelComponent {
        return this.labelRefs.find(label => label.type === SliderHandle.TO);
    }

    /**
     * @hidden
     */
    @ViewChild('track', { static: true })
    public trackRef: ElementRef;

    /**
     * @hidden
     */
    @ContentChild(IgxThumbFromTemplateDirective, { read: TemplateRef })
    public thumbFromTemplateRef: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild(IgxThumbToTemplateDirective, { read: TemplateRef })
    public thumbToTemplateRef: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild(IgxTickLabelTemplateDirective, { read: TemplateRef, static: false })
    public tickLabelTemplateRef: TemplateRef<any>;

    /**
     * @hidden
     */
    @HostBinding('class.igx-slider')
    public slierClass = true;

    /**
     * Sets the value of the `id` attribute.
     * If not provided it will be automatically generated.
     * ```html
     * <igx-slider [id]="'igx-slider-32'" [(ngModel)]="task.percentCompleted" [step]="5" [lowerBound]="20">
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-slider-${NEXT_ID++}`;

    /**
     * Sets the duration visibility of thumbs labels. The default value is 750 milliseconds.
     * ```html
     * <igx-slider #slider [thumbLabelVisibilityDuration]="3000" [(ngModel)]="task.percentCompleted" [step]="5">
     * ```
     */
    @Input()
    public thumbLabelVisibilityDuration = 750;

    /**
     * @hidden
     */
    @HostBinding('class.igx-slider--disabled')
    public get disabledClass() {
        return this.disabled;
    }

    /**
     * Gets the type of the `IgxSliderComponent`.
     * The slider can be IgxSliderType.SLIDER(default) or IgxSliderType.RANGE.
     * ```typescript
     * @ViewChild("slider2")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *     let type = this.slider.type;
     * }
     */
    @Input()
    public get type() {
        return this._type as IgxSliderType;
    }

    /**
     * Sets the type of the `IgxSliderComponent`.
     * The slider can be IgxSliderType.SLIDER(default) or IgxSliderType.RANGE.
     * ```typescript
     * sliderType: IgxSliderType = IgxSliderType.RANGE;
     * ```
     * ```html
     * <igx-slider #slider2 [type]="sliderType" [(ngModel)]="rangeValue" [minValue]="0" [maxValue]="100">
     * ```
     */
    public set type(type: IgxSliderType) {
        this._type = type;

        if (type === IgxSliderType.SLIDER) {
            this.lowerValue = 0;
        }

        if (this._hasViewInit) {
            this.updateTrack();
        }
    }


    /**
     * Enables `labelView`, by accepting a collection of primitive values with more than one element.
     * Each element will be equally spread over the slider and it will serve as a thumb label.
     * Once the property is set, it will precendence over {@link maxValue}, {@link minValue}, {@link step}.
     * This means that the manipulation for those properties won't be allowed.
     */
    @Input()
    public get labels() {
        return this._labels;
    }

    public set labels(labels: Array<number | string | boolean | null | undefined>) {
        this._labels = labels;

        this._pMax = this.valueToFraction(this.upperBound, 0, 1);
        this._pMin = this.valueToFraction(this.lowerBound, 0, 1);

        this.positionHandlersAndUpdateTrack();

        if (this._hasViewInit) {
            this.stepDistance = this.calculateStepDistance();
            this.setTickInterval();
        }
    }

    /**
     * Returns the template context corresponding
     * to {@link IgxThumbFromTemplateDirective} and {@link IgxThumbToTemplateDirective} templates.
     *
     * ```typescript
     * return {
     *  $implicit // returns the value of the label,
     *  labels // returns the labels collection the user has passed.
     * }
     * ```
     */
    public get context(): any {
        return {
            $implicit: this.value,
            labels: this.labels
        };
    }

    /**
     * Sets the incremental/decremental step of the value when dragging the thumb.
     * The default step is 1, and step should not be less or equal than 0.
     * ```html
     * <igx-slider #slider [(ngModel)]="task.percentCompleted" [step]="5">
     * ```
     */
    @Input()
    public set step(step: number) {
        this._step = step;

        if (this._hasViewInit) {
            this.stepDistance = this.calculateStepDistance();
            this.normalizeByStep(this._value);
            this.setValue(this._value, true);
            this.positionHandlersAndUpdateTrack();
            this.setTickInterval();
        }
    }

    /**
     * Returns the incremental/decremental dragging step of the {@link IgxSliderComponent}.
     * ```typescript
     * @ViewChild("slider2")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *     let step = this.slider.step;
     * }
     * ```
     */
    public get step() {
        return this.labelsViewEnabled ? 1 : this._step;
    }

    /**
     * Returns if the {@link IgxSliderComponent} is disabled.
     * ```typescript
     * @ViewChild("slider2")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *     let isDisabled = this.slider.disabled;
     * }
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get disabled(): boolean {
        return this._disabled;
    }

    /**
     * Disables the component.
     * ```html
     * <igx-slider #slider [disabled]="true" [(ngModel)]="task.percentCompleted" [step]="5" [lowerBound]="20">
     * ```
     */
    public set disabled(disable: boolean) {
        this._disabled = disable;

        if (this._hasViewInit) {
            this.changeThumbFocusableState(disable);
        }
    }

    /**
     * Returns if the {@link IgxSliderComponent} is set as continuous.
     * ```typescript
     * @ViewChild("slider2")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *     let continuous = this.slider.continuous;
     * }
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get continuous(): boolean {
        return this._continuous;
    }

    /**
     * Sets the {@link IgxSliderComponent} as continuous.
     * By default is considered that the {@link IgxSliderComponent} is discrete.
     * Discrete {@link IgxSliderComponent} slider has step indicators over the track and visible thumb labels during interaction.
     * Continuous {@link IgxSliderComponent} does not have ticks and does not show bubble labels for values.
     * ```html
     * <igx-slider #slider [continuous]="'true'" [(ngModel)]="task.percentCompleted" [step]="5" [lowerBound]="20">
     * ```
     */
    public set continuous(continuous: boolean) {
        this._continuous = continuous;
        if (this._hasViewInit) {
            this.setTickInterval();
        }
    }

    /**
     * Returns the minimal displayed track value of the `IgxSliderComponent`.
     * ```typescript
     *  @ViewChild("slider2")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *     let sliderMin = this.slider.minValue;
     * }
     * ```
     */
    public get minValue(): number {
        if (this.labelsViewEnabled) {
            return 0;
        }

        return this._minValue;
    }

    /**
     * Sets the minimal displayed track value for the `IgxSliderComponent`.
     * The default minimal value is 0.
     * ```html
     * <igx-slider [type]="sliderType" [minValue]="56" [maxValue]="100">
     * ```
     */
    @Input()
    public set minValue(value: number) {
        if (value >= this.maxValue) {
            return;
        } else {
            this._minValue = value;
        }

        if (value > this._upperBound) {
            this.updateUpperBoundAndMaxTravelZone();
            this.lowerBound = value;
        }

        // Refresh min travel zone limit.
        this._pMin = 0;
        // Recalculate step distance.
        this.positionHandlersAndUpdateTrack();
        if (this._hasViewInit) {
            this.stepDistance = this.calculateStepDistance();
            this.setTickInterval();
        }
    }

    /**
     * Returns the maximum displayed track value for the {@link IgxSliderComponent}.
     * ```typescript
     * @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *     let sliderMax = this.slider.maxValue;
     * }
     *  ```
     */
    public get maxValue(): number {
        return this.labelsViewEnabled ?
            this.labels.length - 1 :
            this._maxValue;
    }

    /**
     * Sets the maximal displayed track value for the `IgxSliderComponent`.
     * The default maximum value is 100.
     * ```html
     * <igx-slider [type]="sliderType" [minValue]="56" [maxValue]="256">
     * ```
     */
    @Input()
    public set maxValue(value: number) {
        if (value <= this._minValue) {
            return;
        } else {
            this._maxValue = value;
        }

        if (value < this._lowerBound) {
            this.updateLowerBoundAndMinTravelZone();
            this.upperBound = value;
        }

        // refresh max travel zone limits.
        this._pMax = 1;
        // recalculate step distance.
        this.positionHandlersAndUpdateTrack();
        if (this._hasViewInit) {
            this.stepDistance = this.calculateStepDistance();
            this.setTickInterval();
        }
    }

    /**
     * Returns the lower boundary of settable values of the `IgxSliderComponent`.
     * If not set, will return `minValue`.
     * ```typescript
     * @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *     let sliderLowBound = this.slider.lowerBound;
     * }
     * ```
     */
    public get lowerBound(): number {
        if (!Number.isNaN(this._lowerBound) && this._lowerBound !== undefined) {
            return this.valueInRange(this._lowerBound, this.minValue, this.maxValue);
        }

        return this.minValue;
    }

    /**
     * Sets the lower boundary of settable values of the `IgxSliderComponent`.
     * If not set is the same as min value.
     * ```html
     * <igx-slider [step]="5" [lowerBound]="20">
     * ```
     */
    @Input()
    public set lowerBound(value: number) {
        if (value >= this.upperBound || (this.labelsViewEnabled && value < 0)) {
            return;
        }

        this._lowerBound = this.valueInRange(value, this.minValue, this.maxValue);

        // Refresh min travel zone.
        this._pMin = this.valueToFraction(this._lowerBound, 0, 1);
        this.positionHandlersAndUpdateTrack();
    }

    /**
     * Returns the upper boundary of settable values of the `IgxSliderComponent`.
     * If not set, will return `maxValue`
     * ```typescript
     * @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *    let sliderUpBound = this.slider.upperBound;
     * }
     * ```
     */
    public get upperBound(): number {
        if (!Number.isNaN(this._upperBound) && this._upperBound !== undefined) {
            return this.valueInRange(this._upperBound, this.minValue, this.maxValue);
        }

        return this.maxValue;
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
        if (value <= this.lowerBound || (this.labelsViewEnabled && value > this.labels.length - 1)) {
            return;
        }

        this._upperBound = this.valueInRange(value, this.minValue, this.maxValue);
        // Refresh time travel zone.
        this._pMax = this.valueToFraction(this._upperBound, 0, 1);
        this.positionHandlersAndUpdateTrack();
    }

    /**
     * Returns the slider value. If the slider is of type {@link IgxSliderType.SLIDER} the returned value is number.
     * If the slider type is {@link IgxSliderType.RANGE}.
     * The returned value represents an object of {@link lowerValue} and {@link upperValue}.
     * ```typescript
     * @ViewChild("slider2")
     * public slider: IgxSliderComponent;
     * public sliderValue(event){
     *     let sliderVal = this.slider.value;
     * }
     * ```
     */
    public get value(): number | IRangeSliderValue {
        if (this.isRange) {
            return {
                lower: this.valueInRange(this.lowerValue, this.lowerBound, this.upperBound),
                upper: this.valueInRange(this.upperValue, this.lowerBound, this.upperBound)
            };
        } else {
            return this.valueInRange(this.upperValue, this.lowerBound, this.upperBound);
        }
    }

    /**
     * Sets the slider value.
     * If the slider is of type {@link IgxSliderType.SLIDER}.
     * The argument is number. By default the {@link value} gets the {@link lowerBound}.
     * If the slider type is {@link IgxSliderType.RANGE} the argument
     * represents an object of {@link lowerValue} and {@link upperValue} properties.
     * By default the object is associated with the {@link lowerBound} and {@link upperBound} property values.
     * ```typescript
     * rangeValue = {
     *   lower: 30,
     *   upper: 60
     * };
     * ```
     * ```html
     * <igx-slider [type]="sliderType" [(ngModel)]="rangeValue" [minValue]="56" [maxValue]="256">
     * ```
     */
    @Input()
    public set value(value: number | IRangeSliderValue) {
        this.normalizeByStep(value);

        if (this._hasViewInit) {
            this.setValue(this._value, true);
            this.positionHandlersAndUpdateTrack();
        }
    }

    /**
     * Returns the number of the presented primary ticks.
     * ```typescript
     * const primaryTicks = this.slider.primaryTicks;
     * ```
     */
    @Input()
    public get primaryTicks() {
        if (this.labelsViewEnabled) {
            return this._primaryTicks = this.labels.length;
        }
        return this._primaryTicks;
    }

    /**
     * Sets the number of primary ticks. If {@link @labels} is enabled, this property won't function.
     * Insted enable ticks by {@link showTicks} property.
     * ```typescript
     * this.slider.primaryTicks = 5;
     * ```
     */
    public set primaryTicks(val: number) {
        if (val <= 1) {
            return;
        }

        this._primaryTicks = val;
    }

    /**
     * Returns the number of the presented secondary ticks.
     * ```typescript
     * const secondaryTicks = this.slider.secondaryTicks;
     * ```
     */
    @Input()
    public get secondaryTicks() {
        return this._secondaryTicks;
    }

    /**
     * Sets the number of secondary ticks. The property functions even when {@link labels} is enabled,
     * but all secondary ticks won't present any tick labels.
     * ```typescript
     * this.slider.secondaryTicks = 5;
     * ```
     */
    public set secondaryTicks(val: number) {
        if (val < 1) {
            return;
        }

        this._secondaryTicks = val;
    }

    /**
     * Show/hide slider ticks
     * ```html
     * <igx-slier [showTicks]="true" [primaryTicks]="5"></igx-slier>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public showTicks = false;

    /**
     * show/hide primary tick labels
     * ```html
     * <igx-slider [primaryTicks]="5" [primaryTickLabels]="false"></igx-slider>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public primaryTickLabels = true;

    /**
     * show/hide secondary tick labels
     * ```html
     * <igx-slider [secondaryTicks]="5" [secondaryTickLabels]="false"></igx-slider>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public secondaryTickLabels = true;

    /**
     * Changes ticks orientation:
     * bottom - The default orienation, below the slider track.
     * top - Above the slider track
     * mirror - combines top and bottom orientation.
     * ```html
     * <igx-slider [primaryTicks]="5" [ticksOrientation]="ticksOrientation"></igx-slider>
     * ```
     */
    @Input()
    public ticksOrientation: TicksOrientation = TicksOrientation.Bottom;

    /**
     * Changes tick labels rotation:
     * horizontal - The default rotation
     * toptobottom - Rotates tick labels vertically to 90deg
     * bottomtotop - Rotate tick labels vertically to -90deg
     * ```html
     * <igx-slider [primaryTicks]="5" [secondaryTicks]="3" [tickLabelsOrientation]="tickLabelsOrientaiton"></igx-slider>
     * ```
     */
    @Input()
    public tickLabelsOrientation: TickLabelsOrientation = TickLabelsOrientation.Horizontal;

    /**
     * @hidden
     */
    public get deactivateThumbLabel() {
        return ((this.primaryTicks && this.primaryTickLabels) || (this.secondaryTicks && this.secondaryTickLabels)) &&
            (this.ticksOrientation === TicksOrientation.Top || this.ticksOrientation === TicksOrientation.Mirror);
    }

    /**
     * This event is emitted every time the value is changed.
     * ```typescript
     * public change(event){
     *    alert("The value has been changed!");
     * }
     * ```
     * ```html
     * <igx-slider (valueChange)="change($event)" #slider [(ngModel)]="task.percentCompleted" [step]="5">
     * ```
     */
    @Output()
    public valueChange = new EventEmitter<ISliderValueChangeEventArgs>();

    /**
     * This event is emitted every time the lower value of a range slider is changed.
     * ```typescript
     * public change(value){
     *    alert(`The lower value has been changed to ${value}`);
     * }
     * ```
     * ```html
     * <igx-slider [(lowerValue)]="model.lowervalue" (lowerValueChange)="change($event)" [step]="5">
     * ```
     */
    @Output()
    public lowerValueChange = new EventEmitter<number>();

    /**
     * This event is emitted every time the upper value of a range slider is changed.
     * ```typescript
     * public change(value){
     *    alert(`The upper value has been changed to ${value}`);
     * }
     * ```
     * ```html
     * <igx-slider [(upperValue)]="model.uppervalue" (upperValueChange)="change($event)" [step]="5">
     * ```
     */
    @Output()
    public upperValueChange = new EventEmitter<number>();

    /**
     * This event is emitted at the end of every slide interaction.
     * ```typescript
     * public change(event){
     *    alert("The value has been changed!");
     * }
     * ```
     * ```html
     * <igx-slider (dragFinished)="change($event)" #slider [(ngModel)]="task.percentCompleted" [step]="5">
     * ```
     */
    @Output()
    public dragFinished = new EventEmitter<number | IRangeSliderValue>();

    /**
     * @hidden
     */
    @ViewChild('ticks', { static: true })
    private ticks: ElementRef;

    /**
     * @hidden
     */
    @ViewChildren(IgxSliderThumbComponent)
    private thumbs: QueryList<IgxSliderThumbComponent> = new QueryList<IgxSliderThumbComponent>();

    /**
     * @hidden
     */
    @ViewChildren(IgxThumbLabelComponent)
    private labelRefs: QueryList<IgxThumbLabelComponent> = new QueryList<IgxThumbLabelComponent>();

    /**
     * @hidden
     */
    public onPan: Subject<number> = new Subject<number>();

    /**
     * @hidden
     */
    public stepDistance: number;

    // Limit handle travel zone
    private _pMin = 0;
    private _pMax = 1;

    // From/upperValue in percent values
    private _hasViewInit = false;
    private _minValue = 0;
    private _maxValue = 100;
    private _lowerBound: number;
    private _upperBound: number;
    private _lowerValue: number;
    private _upperValue: number;
    private _continuous = false;
    private _disabled = false;
    private _step = 1;
    private _value: number | IRangeSliderValue = 0;

    // ticks
    private _primaryTicks = 0;
    private _secondaryTicks = 0;
    private _sliding = false;

    private _labels = new Array<number | string | boolean | null | undefined>();
    private _type: IgxSliderType = IgxSliderType.SLIDER;

    private _destroyer$ = new Subject<boolean>();
    private _indicatorsDestroyer$ = new Subject<boolean>();
    private _indicatorsTimer: Observable<any>;

    private _onChangeCallback: (_: any) => void = noop;
    private _onTouchedCallback: () => void = noop;

    constructor(private renderer: Renderer2,
        private _el: ElementRef,
        private _cdr: ChangeDetectorRef,
        private _ngZone: NgZone,
        private _dir: IgxDirectionality) {
        this.stepDistance = this._step;
    }

    /**
     * @hidden
     */
    @HostListener('focus')
    public onFocus() {
        this.toggleSliderIndicators();
    }

    /**
     * Returns whether the `IgxSliderComponent` type is RANGE.
     * ```typescript
     *  @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *     let sliderRange = this.slider.isRange;
     * }
     * ```
     */
    public get isRange(): boolean {
        return this.type === IgxSliderType.RANGE;
    }

    /**
     * Returns the lower value of a RANGE `IgxSliderComponent`.
     * ```typescript
     * @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * public lowValue(event){
     *    let sliderLowValue = this.slider.lowerValue;
     * }
     * ```
     */
    public get lowerValue(): number {
        if (!Number.isNaN(this._lowerValue) && this._lowerValue !== undefined && this._lowerValue >= this.lowerBound) {
            return this._lowerValue;
        }

        return this.lowerBound;
    }

    /**
     * Sets the lower value of a RANGE `IgxSliderComponent`.
     * ```typescript
     * @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * public lowValue(event){
     *    this.slider.lowerValue = value;
     * }
     * ```
     */
    @Input()
    public set lowerValue(value: number) {
        const adjustedValue = this.valueInRange(value, this.lowerBound, this.upperBound);
        if (this._lowerValue !== adjustedValue) {
            this._lowerValue = adjustedValue;
            this.lowerValueChange.emit(this._lowerValue);
            this.value = { lower: this._lowerValue, upper: this._upperValue };
        }
    }

    /**
     * Returns the upper value of a RANGE `IgxSliderComponent`.
     * Returns `value` of a SLIDER `IgxSliderComponent`
     * ```typescript
     *  @ViewChild("slider2")
     * public slider: IgxSliderComponent;
     * public upperValue(event){
     *     let upperValue = this.slider.upperValue;
     * }
     * ```
     */
    public get upperValue() {
        if (!Number.isNaN(this._upperValue) && this._upperValue !== undefined && this._upperValue <= this.upperBound) {
            return this._upperValue;
        }

        return this.upperBound;
    }

    /**
     * Sets the upper value of a RANGE `IgxSliderComponent`.
     * ```typescript
     *  @ViewChild("slider2")
     * public slider: IgxSliderComponent;
     * public upperValue(event){
     *     this.slider.upperValue = value;
     * }
     * ```
     */
    @Input()
    public set upperValue(value: number) {
        const adjustedValue = this.valueInRange(value, this.lowerBound, this.upperBound);
        if (this._upperValue !== adjustedValue) {
            this._upperValue = adjustedValue;
            this.upperValueChange.emit(this._upperValue);
            this.value = { lower: this._lowerValue, upper: this._upperValue };
        }
    }

    /**
     * Returns the value corresponding the lower label.
     * ```typescript
     * @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * let label = this.slider.lowerLabel;
     * ```
     */
    public get lowerLabel() {
        return this.labelsViewEnabled ? this.labels[this.lowerValue] : this.lowerValue;
    }

    /**
     * Returns the value corresponding the upper label.
     * ```typescript
     * @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * let label = this.slider.upperLabel;
     * ```
     */
    public get upperLabel() {
        return this.labelsViewEnabled ? this.labels[this.upperValue] : this.upperValue;
    }

    /**
     * Returns if label view is enabled.
     * If the {@link labels} is set, the view is automatically activated.
     * ```typescript
     * @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * let labelView = this.slider.labelsViewEnabled;
     * ```
     */
    public get labelsViewEnabled(): boolean {
        return !!(this.labels && this.labels.length > 1);
    }

    /**
     * @hidden
     */
    public get showTopTicks() {
        return this.ticksOrientation === TicksOrientation.Top ||
            this.ticksOrientation === TicksOrientation.Mirror;
    }

    /**
     * @hidden
     */
    public get showBottomTicks() {
        return this.ticksOrientation === TicksOrientation.Bottom ||
            this.ticksOrientation === TicksOrientation.Mirror;
    }

    /**
     * @hidden
     */
    public ngOnChanges(changes: SimpleChanges) {
        if (changes.minValue && changes.maxValue &&
            changes.minValue.currentValue < changes.maxValue.currentValue) {
            this._maxValue = changes.maxValue.currentValue;
            this._minValue = changes.minValue.currentValue;
        }

        if (changes.step && changes.step.isFirstChange()) {
            this.normalizeByStep(this._value);
        }
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        /**
         * if {@link SliderType.SLIDER} than the initial value shold be the lowest one.
         */
        if (!this.isRange) {
            this._upperValue = this.lowerBound;
        }

        // Set track travel zone
        this._pMin = this.valueToFraction(this.lowerBound) || 0;
        this._pMax = this.valueToFraction(this.upperBound) || 1;
    }

    public ngAfterContentInit() {
        this.setValue(this._value, false);
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        this._hasViewInit = true;
        this.stepDistance = this.calculateStepDistance();
        this.positionHandlersAndUpdateTrack();
        this.setTickInterval();
        this.changeThumbFocusableState(this.disabled);

        this.subscribeToEvents(this.thumbFrom);
        this.subscribeToEvents(this.thumbTo);

        this.thumbs.changes.pipe(takeUntil(this._destroyer$)).subscribe(change => {
            const thumbFrom = change.find((thumb: IgxSliderThumbComponent) => thumb.type === SliderHandle.FROM);
            this.positionHandler(thumbFrom, null, this.lowerValue);
            this.subscribeToEvents(thumbFrom);
            this.changeThumbFocusableState(this.disabled);
        });

        this.labelRefs.changes.pipe(takeUntil(this._destroyer$)).subscribe(() => {
            const labelFrom = this.labelRefs.find((label: IgxThumbLabelComponent) => label.type === SliderHandle.FROM);
            this.positionHandler(null, labelFrom, this.lowerValue);
        });

        this._ngZone.runOutsideAngular(() => {
            resizeObservable(this._el.nativeElement).pipe(
                throttleTime(40),
                takeUntil(this._destroyer$)).subscribe(() => this._ngZone.run(() => {
                    this.stepDistance = this.calculateStepDistance();
                }));
            fromEvent(this._el.nativeElement, 'pointermove').pipe(
                throttle(() => interval(0, animationFrameScheduler)),
                takeUntil(this._destroyer$)).subscribe(($event: PointerEvent) => this._ngZone.run(() => {
                    this.onPointerMove($event);
                }));
        });
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this._destroyer$.next(true);
        this._destroyer$.complete();

        this._indicatorsDestroyer$.next(true);
        this._indicatorsDestroyer$.complete();
    }

    /**
     * @hidden
     */
    public writeValue(value: IRangeSliderValue | number): void {
        if (this.isNullishButNotZero(value)) {
            return;
        }

        this.normalizeByStep(value);
        this.setValue(this._value, false);
        this.positionHandlersAndUpdateTrack();
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
    public getEditElement() {
        return this.isRange ? this.thumbFrom.nativeElement : this.thumbTo.nativeElement;
    }

    /**
     *
     * @hidden
     */
    public update(mouseX) {
        if (this.disabled) {
            return;
        }

        // Update To/From Values
        this.onPan.next(mouseX);

        // Finally do positionHandlersAndUpdateTrack the DOM
        // based on data values
        this.positionHandlersAndUpdateTrack();
    }

    /**
     * @hidden
     */
    public thumbChanged(value: number, thumbType: string) {
        const oldValue = this.value;

        if (this.isRange) {
            if (thumbType === SliderHandle.FROM) {
                if (this.lowerValue + value > this.upperValue) {
                    this.upperValue = this.lowerValue + value;
                }
                this.lowerValue += value;
            } else {
                if (this.upperValue + value < this.lowerValue) {
                    this.lowerValue = this.upperValue + value;
                }
                this.upperValue += value;
            }

            const newVal: IRangeSliderValue = {
                lower: this.lowerValue,
                upper: this.upperValue
            }

            // Swap the thumbs if a collision appears.
            // if (newVal.lower == newVal.upper) {
            //     this.toggleThumb();
            // }

            this.value = newVal;

        } else {
            const newVal = (this.value as number) + value;
            if (newVal >= this.lowerBound && newVal <= this.upperBound) {
                this.value = newVal;
            }
        }

        if (this.hasValueChanged(oldValue)) {
            this.emitValueChange(oldValue);
        }
    }

    /**
     * @hidden
     */
    public onThumbChange() {
        this.toggleSliderIndicators();
    }

    /**
     * @hidden
     */
    public onHoverChange(state: boolean) {
        return state ? this.showSliderIndicators() : this.hideSliderIndicators();
    }

    public setValue(value: number | IRangeSliderValue, triggerChange: boolean) {
        let res;
        if (!this.isRange) {
            value = value as number;
            if (!isNaN(value)) {
                this._upperValue = value - value % this.step;
                res = this.upperValue;
            }
        } else {
            value = this.validateInitialValue(value as IRangeSliderValue);
            this._upperValue = value.upper;
            this._lowerValue = value.lower;
            res = { lower: this.lowerValue, upper: this.upperValue };
        }

        if (triggerChange) {
            this._onChangeCallback(res);
        }
    }

    @HostListener('pointerdown', ['$event'])
    private onPointerDown($event: PointerEvent) {
        this.findClosestThumb($event);

        if (!this.thumbTo.isActive && this.thumbFrom === undefined) {
            return;
        }

        this._sliding = true;
        const activeThumb = this.thumbTo.isActive ? this.thumbTo : this.thumbFrom;
        activeThumb.nativeElement.setPointerCapture($event.pointerId);
        this.showSliderIndicators();

        $event.preventDefault();
    }

    private onPointerMove($event: PointerEvent) {
        if (this._sliding) {
            this.update($event.clientX);
        }
    }

    @HostListener('pointerup', ['$event'])
    private onPointerUp($event: PointerEvent) {
        if (!this.thumbTo.isActive && this.thumbFrom === undefined) {
            return;
        }

        const activeThumb = this.thumbTo.isActive ? this.thumbTo : this.thumbFrom;
        activeThumb.nativeElement.releasePointerCapture($event.pointerId);

        this._sliding = false;
        this.hideSliderIndicators();
        this.dragFinished.emit(this.value);
    }

    private validateInitialValue(value: IRangeSliderValue) {
        if (value.upper < value.lower) {
            const temp = value.upper;
            value.upper = value.lower;
            value.lower = temp;
        }

        if (value.lower < this.lowerBound) {
            value.lower = this.lowerBound;
        }

        if (value.upper > this.upperBound) {
            value.upper = this.upperBound;
        }

        return value;
    }

    private findClosestThumb(event: PointerEvent) {
        if (this.isRange) {
            this.closestHandle(event);
        } else {
            this.thumbTo.nativeElement.focus();
        }

        this.update(event.clientX);
    }

    private updateLowerBoundAndMinTravelZone() {
        this.lowerBound = this.minValue;
        this._pMin = 0;
    }

    private updateUpperBoundAndMaxTravelZone() {
        this.upperBound = this.maxValue;
        this._pMax = 1;
    }

    private calculateStepDistance() {
        return this._el.nativeElement.getBoundingClientRect().width / (this.maxValue - this.minValue) * this.step;
    }

    // private toggleThumb() {
    //     return this.thumbFrom.isActive ?
    //         this.thumbTo.nativeElement.focus() :
    //         this.thumbFrom.nativeElement.focus();
    // }

    private valueInRange(value, min = 0, max = 100) {
        return Math.max(Math.min(value, max), min);
    }

    private positionHandler(thumbHandle: ElementRef, labelHandle: ElementRef, position: number) {
        const percent = `${this.valueToFraction(position) * 100}%`;
        const dir = this._dir.rtl ? 'right' : 'left';

        if (thumbHandle) {
            thumbHandle.nativeElement.style[dir] = percent;
        }

        if (labelHandle) {
            labelHandle.nativeElement.style[dir] = percent;
        }
    }

    private positionHandlersAndUpdateTrack() {
        if (!this.isRange) {
            this.positionHandler(this.thumbTo, this.labelTo, this.value as number);
        } else {
            this.positionHandler(this.thumbTo, this.labelTo, (this.value as IRangeSliderValue).upper);
            this.positionHandler(this.thumbFrom, this.labelFrom, (this.value as IRangeSliderValue).lower);
        }

        if (this._hasViewInit) {
            this.updateTrack();
        }
    }

    private closestHandle(event: PointerEvent) {
        const fromOffset = this.thumbFrom.nativeElement.offsetLeft + this.thumbFrom.nativeElement.offsetWidth / 2;
        const toOffset = this.thumbTo.nativeElement.offsetLeft + this.thumbTo.nativeElement.offsetWidth / 2;
        const xPointer = event.clientX - this._el.nativeElement.getBoundingClientRect().left;
        const match = this.closestTo(xPointer, [fromOffset, toOffset]);

        if (fromOffset === toOffset && toOffset < xPointer) {
            this.thumbTo.nativeElement.focus();
        } else if (fromOffset === toOffset && toOffset > xPointer) {
            this.thumbFrom.nativeElement.focus();
        } else if (match === fromOffset) {
            this.thumbFrom.nativeElement.focus();
        } else {
            this.thumbTo.nativeElement.focus();
        }
    }

    private setTickInterval() {
        let tickInterval;
        const trackProgress = 100;

        if (this.labelsViewEnabled) {
            // Calc ticks depending on the labels length;
            tickInterval = ((trackProgress / (this.labels.length - 1) * 10)) / 10;
        } else {
            const trackRange = this.maxValue - this.minValue;
            tickInterval = this.step > 1 ?
                (trackProgress / ((trackRange / this.step)) * 10) / 10
                : null;
        }

        this.renderer.setStyle(this.ticks.nativeElement, 'stroke-dasharray', `0, ${tickInterval * Math.sqrt(2)}%`);
        this.renderer.setStyle(this.ticks.nativeElement, 'visibility', this.continuous || tickInterval === null ? 'hidden' : 'visible');
    }

    private showSliderIndicators() {
        if (this.disabled) {
            return;
        }

        if (this._indicatorsTimer) {
            this._indicatorsDestroyer$.next(true);
            this._indicatorsTimer = null;
        }

        this.thumbTo.showThumbIndicators();
        this.labelTo.active = true;
        if (this.thumbFrom) {
            this.thumbFrom.showThumbIndicators();
        }

        if (this.labelFrom) {
            this.labelFrom.active = true;
        }

    }

    private hideSliderIndicators() {
        if (this.disabled) {
            return;
        }

        this._indicatorsTimer = timer(this.thumbLabelVisibilityDuration);
        this._indicatorsTimer.pipe(takeUntil(this._indicatorsDestroyer$)).subscribe(() => {
            this.thumbTo.hideThumbIndicators();
            this.labelTo.active = false;
            if (this.thumbFrom) {
                this.thumbFrom.hideThumbIndicators();
            }

            if (this.labelFrom) {
                this.labelFrom.active = false;
            }
        });
    }

    private toggleSliderIndicators() {
        this.showSliderIndicators();
        this.hideSliderIndicators();
    }

    private changeThumbFocusableState(state: boolean) {
        const value = state ? -1 : 0;

        if (this.isRange) {
            this.thumbFrom.tabindex = value;
        }

        this.thumbTo.tabindex = value;

        this._cdr.detectChanges();
    }

    private closestTo(goal: number, positions: number[]): number {
        return positions.reduce((previous, current) => (Math.abs(goal - current) < Math.abs(goal - previous) ? current : previous));
    }

    private valueToFraction(value: number, pMin = this._pMin, pMax = this._pMax) {
        return this.valueInRange((value - this.minValue) / (this.maxValue - this.minValue), pMin, pMax);
    }

    private isNullishButNotZero(value: any): boolean {
        return !value && value !== 0;
    }

    /**
     * @hidden
     * Normalizе the value when two-way data bind is used and {@link this.step} is set.
     * @param value
     */
    private normalizeByStep(value: IRangeSliderValue | number) {
        if (this.isRange) {
            this._value = {
                lower: Math.floor((value as IRangeSliderValue).lower / this.step) * this.step,
                upper: Math.floor((value as IRangeSliderValue).upper / this.step) * this.step
            };
        } else {
            this._value = Math.floor((value as number) / this.step) * this.step;
        }
    }

    private updateTrack() {
        const fromPosition = this.valueToFraction(this.lowerValue);
        const toPosition = this.valueToFraction(this.upperValue);
        const positionGap = toPosition - fromPosition;

        let trackLeftIndention = fromPosition;
        if (this.isRange) {
            if (positionGap) {
                trackLeftIndention = Math.round((1 / positionGap * fromPosition) * 100);
            }

            trackLeftIndention = this._dir.rtl ? -trackLeftIndention : trackLeftIndention;
            this.renderer.setStyle(this.trackRef.nativeElement, 'transform', `scaleX(${positionGap}) translateX(${trackLeftIndention}%)`);
        } else {
            this.renderer.setStyle(this.trackRef.nativeElement, 'transform', `scaleX(${toPosition})`);
        }
    }

    private subscribeToEvents(thumb: IgxSliderThumbComponent) {
        if (!thumb) {
            return;
        }

        thumb.thumbValueChange
            .pipe(takeUntil(this.unsubscriber(thumb)))
            .subscribe(value => this.thumbChanged(value, thumb.type));

        thumb.thumbBlur
            .pipe(takeUntil(this.unsubscriber(thumb)))
            .subscribe(() => this._onTouchedCallback());
    }

    private unsubscriber(thumb: IgxSliderThumbComponent) {
        return merge(this._destroyer$, thumb.destroy);
    }

    private hasValueChanged(oldValue) {
        const isSliderWithDifferentValue: boolean = !this.isRange && oldValue !== this.value;
        const isRangeWithOneDifferentValue: boolean = this.isRange &&
            ((oldValue as IRangeSliderValue).lower !== (this.value as IRangeSliderValue).lower ||
                (oldValue as IRangeSliderValue).upper !== (this.value as IRangeSliderValue).upper);

        return isSliderWithDifferentValue || isRangeWithOneDifferentValue;
    }

    private emitValueChange(oldValue: number | IRangeSliderValue) {
        this.valueChange.emit({ oldValue, value: this.value });
    }
}

/**
 * @hidden
 */

