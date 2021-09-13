import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    Output,
    Renderer2,
    ViewChild,
    ContentChild,
    AfterViewInit,
    AfterContentInit,
    Directive
} from '@angular/core';
import {
    IgxProcessBarTextTemplateDirective,
    IgxProgressBarGradientDirective,
} from './progressbar.common';
import { IBaseEventArgs, mkenum } from '../core/utils';
import { IgxDirectionality } from '../services/direction/directionality';

const ONE_PERCENT = 0.01;
const MIN_VALUE = 0;

export const IgxTextAlign = mkenum({
    START: 'start',
    CENTER: 'center',
    END: 'end'
});
export type IgxTextAlign = (typeof IgxTextAlign)[keyof typeof IgxTextAlign];

export const IgxProgressType = mkenum({
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
    SUCCESS: 'success'
});
export type IgxProgressType = (typeof IgxProgressType)[keyof typeof IgxProgressType];

export interface IChangeProgressEventArgs extends IBaseEventArgs {
    previousValue: number;
    currentValue: number;
}

/**
 * @hidden
 */
@Directive()
export abstract class BaseProgressDirective {
    private requestAnimationId: number = undefined;

    protected _initValue = 0;
    protected _contentInit = false;
    protected _valueInPercent = MIN_VALUE;
    protected _max = 100;
    protected _value = MIN_VALUE;
    protected _newVal = MIN_VALUE;
    protected _animate = true;
    protected _step;

    /**
     * An event, which is triggered after a progress is changed.
     * ```typescript
     * public progressChange(event) {
     *     alert("Progress made!");
     * }
     *  //...
     * ```
     * ```html
     * <igx-circular-bar [value]="currentValue" (onProgressChanged)="progressChange($event)"></igx-circular-bar>
     * <igx-linear-bar [value]="currentValue" (onProgressChanged)="progressChange($event)"></igx-linear-bar>
     * ```
     */
    @Output()
    public onProgressChanged = new EventEmitter<IChangeProgressEventArgs>();

    /**
     * Returns the value which update the progress indicator of the `progress bar`.
     * ```typescript
     *  @ViewChild("MyProgressBar")
     * public progressBar: IgxLinearProgressBarComponent | IgxCircularBarComponent;
     * public stepValue(event) {
     *     let step = this.progressBar.step;
     *     alert(step);
     * }
     * ```
     */
    @Input()
    get step(): number {
        if (this._step) {
            return this._step;
        }

        return this._max * ONE_PERCENT;
    }

    /**
     * Sets the value by which progress indicator is updated. By default it is 1% of the maximum value.
     * ```html
     * <igx-linear-bar [max]="200" [value]="0" [step]="1"></igx-linear-bar>
     * <igx-circular-bar [max]="200" [value]="0" [step]="1"></igx-circular-bar>
     * ```
     */
    set step(val: number) {
        this._step = Number(val);
    }

    /**
     * Animating the progress. By default it is set to true.
     * ```html
     * <igx-linear-bar [animate]="false" [max]="200" [value]="50"></igx-linear-bar>
     * <igx-circular-bar [animate]="false" [max]="200" [value]="50"></igx-circular-bar>
     * ```
     */
    @Input()
    public set animate(animate: boolean) {
        this._animate = animate;
    }

    /**
     * Returns whether the `progress bar` has animation true/false.
     * ```typescript
     *  @ViewChild("MyProgressBar")
     * public progressBar: IgxLinearProgressBarComponent | IgxCircularBarComponent;
     * public animationStatus(event) {
     *     let animationStatus = this.progressBar.animate;
     *     alert(animationStatus);
     * }
     * ```
     */
    public get animate(): boolean {
        return this._animate;
    }

    /**
     * Set maximum value that can be passed. By default it is set to 100.
     * ```html
     * <igx-linear-bar [max]="200" [value]="0"></igx-linear-bar>
     * <igx-circular-bar [max]="200" [value]="0"></igx-circular-bar>
     * ```
     */
    @HostBinding('attr.aria-valuemax')
    @Input()
    public set max(maxNum: number) {
        if(maxNum < this._value) {
            return;
        }
        this._max = maxNum;
        this._valueInPercent = toPercent(this._value, this._max);
    }

    /**
     * Returns the the maximum progress value of the `progress bar`.
     * ```typescript
     *  @ViewChild("MyProgressBar")
     * public progressBar: IgxLinearProgressBarComponent | IgxCircularBarComponent;
     * public maxValue(event) {
     *     let max = this.progressBar.max;
     *     alert(max);
     * }
     * ```
     */
    get max() {
        return this._max;
    }

    /**
     * Sets the `IgxLinearProgressBarComponent`/`IgxCircularProgressBarComponent` value in percentage.
     * ```typescript
     *  @ViewChild("MyProgressBar")
     * public progressBar: IgxLinearProgressBarComponent; // IgxCircularProgressBarComponent
     *     public setValue(event){
     *     this.progressBar.valueInPercent = 56;
     * }
     * ```
     */
    public set valueInPercent(value: number) {
        if (value < 0 || value > 100) {
            return;
        }
        this._valueInPercent = value;
        this._value = toValue(value, this._max);
    }

    /**
     * Returns the `IgxLinearProgressBarComponent`/`IgxCircularProgressBarComponent` value in percentage.
     * ```typescript
     *  @ViewChild("MyProgressBar")
     * public progressBar: IgxLinearProgressBarComponent; // IgxCircularProgressBarComponent
     * public valuePercent(event){
     *     let percentValue = this.progressBar.valueInPercent;
     *     alert(percentValue);
     * }
     * ```
     */
    public get valueInPercent(): number {
        return this._valueInPercent;
    }

    protected triggerProgressTransition(oldVal, newVal) {
        if (oldVal === newVal) {
            return;
        }

        const changedValues = {
            currentValue: newVal,
            previousValue: oldVal
        };

        const stepDirection = this.directionFlow(oldVal, newVal);
        if (this._animate) {
            this.runAnimation(newVal, stepDirection);
        } else {
            this.updateProgressDirectly(newVal);
        }

        this.onProgressChanged.emit(changedValues);
    }

    /**
     * @hidden
     */
    protected runAnimation(val: number, step: number) {
        this.requestAnimationId = requestAnimationFrame(
            () => this.updateProgressSmoothly.call(this, val, step));
    }

    /**
     * @hidden
     */
    protected updateProgressSmoothly(val: number, step: number) {
        this._value = valueInRange(this._value, this._max) + step;
        const passedValue = toPercent(val, this._max);
        const progressValue = toPercent(this._value, this._max);
        if (this.valueInPercent === passedValue) {
            this.updateProgress(val);
            cancelAnimationFrame(this.requestAnimationId);
        } else if (this.isInLimitRange(progressValue, passedValue, step)) {
            this.updateProgress(val);
            cancelAnimationFrame(this.requestAnimationId);
        } else {
            this._valueInPercent = progressValue;
            this.requestAnimationId = requestAnimationFrame(() => this.updateProgressSmoothly.call(this, val, step));
        }
    }

    /**
     * @hidden
     */
    protected updateProgressDirectly(val: number) {
        this._value = valueInRange(val, this._max);
        this._valueInPercent = toPercent(this._value, this._max);
    }

    /**
     * @hidden
     */
    protected directionFlow(currentValue: number, prevValue: number): number {
        return currentValue < prevValue ? this.step : -this.step;
    }

    /**
     * @hidden
     */
    private isInLimitRange(val: number, comparator: number, step: number) {
        return this.isExceedingUpperLimit(val, comparator, step) || this.isExceedingLowerLimit(val, comparator, step);
    }

    /**
     * @hidden
     *
     *
     * @param val
     * @param comparator
     * @param step
     */
    private isExceedingUpperLimit(val: number, comparator: number, step: number) {
        return val > comparator && step > 0;
    }

    /**
     * @hidden
     *
     * @param val
     * @param comparator
     * @param step
     */
    private isExceedingLowerLimit(val: number, comparator: number, step: number) {
        return val < comparator && step < 0;
    }

    /**
     * @hidden
     * @param step
     */
    private updateProgress(val: number) {
        this._value = valueInRange(val, this._max);
        this._valueInPercent = toPercent(this._value, this._max);
    }
}
let NEXT_LINEAR_ID = 0;
let NEXT_CIRCULAR_ID = 0;
let NEXT_GRADIENT_ID = 0;
@Component({
    selector: 'igx-linear-bar',
    templateUrl: 'templates/linear-bar.component.html'
})
export class IgxLinearProgressBarComponent extends BaseProgressDirective implements AfterContentInit {

    constructor() {
        super();
    }

    @HostBinding('attr.aria-valuemin')
    public valueMin = 0;

    @HostBinding('class.igx-linear-bar')
    public cssClass = 'igx-linear-bar';

    /**
     * Set `IgxLinearProgressBarComponent` to have striped style. By default it is set to false.
     * ```html
     * <igx-linear-bar [striped]="true" [max]="200" [value]="50"></igx-linear-bar>
     * ```
     */
    @HostBinding('class.igx-linear-bar--striped')
    @Input()
    public striped = false;

    /**
     * Set `IgxLinearProgressBarComponent` to have indeterminate. By default it is set to false.
     * ```html
     * <igx-linear-bar [indeterminate]="true"></igx-linear-bar>
     * ```
     */
    @HostBinding('class.igx-linear-bar--indeterminate')
    @Input()
    public indeterminate = false;

    /**
     * An @Input property that sets the value of the `role` attribute. If not provided it will be automatically set to `progressbar`.
     * ```html
     * <igx-linear-bar role="progressbar"></igx-linear-bar>
     * ```
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'progressbar';

    /**
     * An @Input property that sets the value of `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-linear-bar [id]="'igx-linear-bar-55'" [striped]="true" [max]="200" [value]="50"></igx-linear-bar>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-linear-bar-${NEXT_LINEAR_ID++}`;

    /**
     * Set the position that defines where the text is aligned.
     * Possible options - `IgxTextAlign.START` (default), `IgxTextAlign.CENTER`, `IgxTextAlign.END`.
     * ```typescript
     * public positionCenter: IgxTextAlign;
     * public ngOnInit() {
     *     this.positionCenter = IgxTextAlign.CENTER;
     * }
     *  //...
     * ```
     *  ```html
     * <igx-linear-bar type="warning" [text]="'Custom text'" [textAlign]="positionCenter" [striped]="true"></igx-linear-bar>
     * ```
     */
    @Input()
    public textAlign: IgxTextAlign = IgxTextAlign.START;

    /**
     * Set the text to be visible. By default it is set to true.
     * ```html
     *  <igx-linear-bar type="default" [textVisibility]="false"></igx-linear-bar>
     * ```
     */
    @Input()
    public textVisibility = true;

    /**
     * Set the position that defines if the text should be aligned above the progress line. By default is set to false.
     * ```html
     *  <igx-linear-bar type="error" [textTop]="true"></igx-linear-bar>
     * ```
     */
    @Input()
    public textTop = false;

    /**
     * Set a custom text that is displayed according to the defined position.
     *  ```html
     * <igx-linear-bar type="warning" [text]="'Custom text'" [textAlign]="positionCenter" [striped]="true"></igx-linear-bar>
     * ```
     */
    @Input()
    public text: string;

    /**
     * Set type of the `IgxLinearProgressBarComponent`. Possible options - `default`, `success`, `info`, `warning`, and `error`.
     * ```html
     * <igx-linear-bar [striped]="false" [max]="100" [value]="0" type="error"></igx-linear-bar>
     * ```
     */
    @Input()
    public type = 'default';

   /**
    * Returns value that indicates the current `IgxLinearProgressBarComponent` position.
    * ```typescript
    *  @ViewChild("MyProgressBar")
    * public progressBar: IgxLinearProgressBarComponent;
    * public getValue(event) {
    *     let value = this.progressBar.value;
    *     alert(value);
    * }
    * ```
    */
    @HostBinding('attr.aria-valuenow')
    @Input()
    get value(): number {
        return this._value;
    }

    /**
     * Set value that indicates the current `IgxLinearProgressBarComponent` position.
     * ```html
     * <igx-linear-bar [striped]="false" [max]="200" [value]="50"></igx-linear-bar>
     * ```
     */
    set value(val) {
        const valInRange = valueInRange(val, this.max);
        if (isNaN(valInRange) || this._value === valInRange || this.indeterminate) {
            return;
        }

        if (this._contentInit) {
            this.triggerProgressTransition(this._value, valInRange);
        } else {
            this._initValue = valInRange;
        }

    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-linear-bar--danger')
    public get error() {
        return this.type === IgxProgressType.ERROR;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-linear-bar--info')
    public get info() {
        return this.type === IgxProgressType.INFO;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-linear-bar--warning')
    public get warning() {
        return this.type === IgxProgressType.WARNING;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-linear-bar--success')
    public get success() {
        return this.type === IgxProgressType.SUCCESS;
    }

    public ngAfterContentInit() {
        this.triggerProgressTransition(MIN_VALUE, this._initValue);
        this._contentInit = true;
    }
}

@Component({
    selector: 'igx-circular-bar',
    templateUrl: 'templates/circular-bar.component.html'
})
export class IgxCircularProgressBarComponent extends BaseProgressDirective implements AfterViewInit, AfterContentInit {

    private readonly STROKE_OPACITY_DVIDER = 100;
    private readonly STROKE_OPACITY_ADDITION = .2;

    /** @hidden */
    @HostBinding('class.igx-circular-bar')
    public cssClass = 'igx-circular-bar';

    /**
     * An @Input property that sets the value of `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-circular-bar [id]="'igx-circular-bar-55'" [value]="50"></igx-circular-bar>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-circular-bar-${NEXT_CIRCULAR_ID++}`;

    /**
     * @hidden
     */
    public gradientId = `igx-circular-gradient-${NEXT_GRADIENT_ID++}`;

    /**
     * An @Input property that sets the value of the `indeterminate` attribute. If not provided it will be automatically set to false.
     * ```html
     * <igx-circular-bar [indeterminate]="true"></igx-circular-bar>
     * ```
     */
    @HostBinding('class.igx-circular-bar--indeterminate')
    @Input()
    public indeterminate = false;

    /**
     * Sets the text visibility. By default it is set to true.
     * ```html
     * <igx-circular-bar [textVisibility]="false"></igx-circular-bar>
     * ```
     */
    @Input()
    public textVisibility = true;

    /**
     * Sets/gets the text to be displayed inside the `igxCircularBar`.
     * ```html
     * <igx-circular-bar text="Progress"></igx-circular-bar>
     * ```
     * ```typescript
     * let text = this.circularBar.text;
     * ```
     */
    @Input()
    public text: string;

    @ContentChild(IgxProcessBarTextTemplateDirective, { read: IgxProcessBarTextTemplateDirective })
    public textTemplate: IgxProcessBarTextTemplateDirective;

    @ContentChild(IgxProgressBarGradientDirective, { read: IgxProgressBarGradientDirective })
    public gradientTemplate: IgxProgressBarGradientDirective;

    /**
     * @hidden
     */
    public get context(): any {
        return {
            $implicit: { value: this.value, valueInPercent: this.valueInPercent, max: this.max }
        };
    }

    /**
     * Returns value that indicates the current `IgxCircularProgressBarComponent` position.
     * ```typescript
     *  @ViewChild("MyProgressBar")
     * public progressBar: IgxCircularProgressBarComponent;
     * public getValue(event) {
     *     let value = this.progressBar.value;
     *     alert(value);
     * }
     * ```
     * ```html
     * <button igxButton="fab" igxRipple="" (click)="getValue()">Click</button>
     * ```
     */
    @Input()
    get value(): number {
        return this._value;
    }

    /**
     * Set value that indicates the current `IgxCircularProgressBarComponent` position.
     * ```html
     * <igx-circular-bar [value]="50"></igx-circular-bar>
     * ```
     */
    set value(val: number) {
        const valInRange = valueInRange(val, this.max);
        if (isNaN(valInRange) || this._value === val || this.indeterminate) {
            return;
        }

        if (this._contentInit) {
            this.triggerProgressTransition(this._value, valInRange);
        } else {
            this._initValue = valInRange;
        }

    }

    private _circleRadius = 46;
    private _circumference = 2 * Math.PI * this._circleRadius;

    @ViewChild('circle', { static: true })
    private _svgCircle: ElementRef;

    constructor(private renderer: Renderer2, private _directionality: IgxDirectionality) {
        super();
    }

    public ngAfterContentInit() {
        this.triggerProgressTransition(MIN_VALUE, this._initValue);
        this._contentInit = true;
    }

    public ngAfterViewInit() {
        this.renderer.setStyle(
            this._svgCircle.nativeElement,
            'stroke',
            `url(#${this.gradientId})`
        );
    }

    /**
     * @hidden
     */
    public updateProgressSmoothly(val: number, step: number) {
        // Set frames for the animation
        const FRAMES = [{
            strokeDashoffset: this.getProgress(this._value),
            strokeOpacity: (this._value / this.STROKE_OPACITY_DVIDER) + this.STROKE_OPACITY_ADDITION
        }, {
            strokeDashoffset: this.getProgress(this.valueInPercent),
            strokeOpacity: (this.valueInPercent / this.STROKE_OPACITY_DVIDER) + this.STROKE_OPACITY_ADDITION
        }];
        this._svgCircle.nativeElement.animate(FRAMES, {
            easing: 'ease-out',
            fill: 'forwards'
        });

        super.updateProgressSmoothly(val, step);
    }

    /**
     * @hidden
     */
    public get textContent(): string {
        return this.text;
    }

    /**
     * @hidden
     */
    public updateProgressDirectly(val: number) {
        super.updateProgressDirectly(val);

        this.renderer.setStyle(
            this._svgCircle.nativeElement,
            'stroke-dashoffset',
            this.getProgress(this.valueInPercent));

        this.renderer.setStyle(
            this._svgCircle.nativeElement,
            'stroke-opacity',
            (this.valueInPercent / this.STROKE_OPACITY_DVIDER) + this.STROKE_OPACITY_ADDITION);
    }

    private getProgress(percentage: number) {
        return this._directionality.rtl ?
            this._circumference + (percentage * this._circumference / 100) :
            this._circumference - (percentage * this._circumference / 100);
    }
}

export function valueInRange(value: number, max: number, min = 0): number {
    return Math.max(Math.min(value, max), min);
}

export const toPercent = (value: number, max: number) => Math.floor(100 * value / max);

export const toValue = (value: number, max: number) => Math.floor(max * value / 100);

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxLinearProgressBarComponent,
        IgxCircularProgressBarComponent,
        IgxProcessBarTextTemplateDirective,
        IgxProgressBarGradientDirective,
    ],
    exports: [
        IgxLinearProgressBarComponent,
        IgxCircularProgressBarComponent,
        IgxProcessBarTextTemplateDirective,
        IgxProgressBarGradientDirective,
    ],
    imports: [CommonModule]
})
export class IgxProgressBarModule { }

