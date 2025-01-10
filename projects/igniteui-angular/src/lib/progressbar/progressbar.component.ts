import { NgClass, NgTemplateOutlet, NgIf } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    Renderer2,
    ViewChild,
    ContentChild,
    AfterViewInit,
    AfterContentInit,
    Directive,
    booleanAttribute
} from '@angular/core';
import {
    IgxProgressBarTextTemplateDirective,
    IgxProgressBarGradientDirective,
} from './progressbar.common';
import { IBaseEventArgs, mkenum } from '../core/utils';
import { IgxDirectionality } from '../services/direction/directionality';
const ONE_PERCENT = 0.01;
const MIN_VALUE = 0;

export const IgxTextAlign = /*@__PURE__*/mkenum({
    START: 'start',
    CENTER: 'center',
    END: 'end'
});
export type IgxTextAlign = (typeof IgxTextAlign)[keyof typeof IgxTextAlign];

export const IgxProgressType = /*@__PURE__*/mkenum({
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
export const valueInRange = (value: number, max: number, min = 0): number => Math.max(Math.min(value, max), min);

/**
 * @hidden
 */
@Directive()
export abstract class BaseProgressDirective {
    /**
     * An event, which is triggered after a progress is changed.
     * ```typescript
     * public progressChange(event) {
     *     alert("Progress made!");
     * }
     *  //...
     * ```
     * ```html
     * <igx-circular-bar [value]="currentValue" (progressChanged)="progressChange($event)"></igx-circular-bar>
     * <igx-linear-bar [value]="currentValue" (progressChanged)="progressChange($event)"></igx-linear-bar>
     * ```
     */
    @Output()
    public progressChanged = new EventEmitter<IChangeProgressEventArgs>();

    /**
     * Sets/Gets progressbar in indeterminate. By default it is set to false.
     * ```html
     * <igx-linear-bar [indeterminate]="true"></igx-linear-bar>
     * <igx-circular-bar [indeterminate]="true"></igx-circular-bar>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public indeterminate = false;

    /**
     * Sets/Gets progressbar animation duration. By default it is 2000ms.
     * ```html
     * <igx-linear-bar [indeterminate]="true"></igx-linear-bar>
     * ```
     */
    @Input()
    public animationDuration = 2000;

    protected _contentInit = false;
    protected _max = 100;
    protected _value = MIN_VALUE;
    protected _animate = true;
    protected _step: number;
    private _fraction = 0;
    private _integer = 0;

    constructor() { }

    /**
     * Returns the value which update the progress indicator of the `progress bar`.
     * ```typescript
     * @ViewChild("MyProgressBar")
     * public progressBar: IgxLinearProgressBarComponent | IgxCircularBarComponent;
     * public stepValue(event) {
     *     let step = this.progressBar.step;
     *     alert(step);
     * }
     * ```
     */
    @Input()
    public get step(): number {
        if (this._step) {
            return this._step;
        }
        return this._max * ONE_PERCENT;
    }

    /**
     * Sets the value by which progress indicator is updated. By default it is 1.
     * ```html
     * <igx-linear-bar [max]="200" [value]="0" [step]="1"></igx-linear-bar>
     * <igx-circular-bar [max]="200" [value]="0" [step]="1"></igx-circular-bar>
     * ```
     */
    public set step(val: number) {
        const step = Number(val);
        if (step > this.max) {
            return;
        }

        this._step = step;
    }

    /**
     * Animating the progress. By default it is set to true.
     * ```html
     * <igx-linear-bar [animate]="false" [max]="200" [value]="50"></igx-linear-bar>
     * <igx-circular-bar [animate]="false" [max]="200" [value]="50"></igx-circular-bar>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public set animate(animate: boolean) {
        this._animate = animate;
    }

    /**
     * Returns whether the `progress bar` has animation true/false.
     * ```typescript
     * @ViewChild("MyProgressBar")
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
        if (maxNum < MIN_VALUE || this._max === maxNum) {
            return; // Ignore invalid or unchanged max
        }

        this._max = maxNum; // Update max value
        this._value = valueInRange(this._value, this._max); // Revalidate current value
        this._updateProgressValues(); // Refresh CSS variables
    }

    /**
     * Returns the maximum progress value of the `progress bar`.
     * ```typescript
     * @ViewChild("MyProgressBar")
     * public progressBar: IgxLinearProgressBarComponent | IgxCircularBarComponent;
     * public maxValue(event) {
     *     let max = this.progressBar.max;
     *     alert(max);
     * }
     * ```
     */
    public get max() {
        return this._max;
    }

    @HostBinding('style')
    public get hostStyles(): { [key: string]: string } {
        return {
            '--_progress-integer': this._integer.toString(),
            '--_progress-fraction': this._fraction.toString(),
            '--_progress-whole': this.valueInPercent.toFixed(2),
            '--_transition-duration': `${this.animationDuration}ms`,
        };
    }

    protected get hasFraction(): boolean {
        const percentage = this.valueInPercent;
        const integerPart = Math.floor(percentage);
        const fractionalPart = percentage - integerPart;

        return fractionalPart > 0;
    }

    /**
     * Returns the `IgxLinearProgressBarComponent`/`IgxCircularProgressBarComponent` value in percentage.
     * ```typescript
     * @ViewChild("MyProgressBar")
     * public progressBar: IgxLinearProgressBarComponent; // IgxCircularProgressBarComponent
     * public valuePercent(event){
     *     let percentValue = this.progressBar.valueInPercent;
     *     alert(percentValue);
     * }
     * ```
     */
    public get valueInPercent(): number {
        const result = this.max > 0 ? (this._value / this.max) * 100 : 0;
        return Math.round(result * 100) / 100; // Round to two decimal places
    }

    /**
     * Returns value that indicates the current `IgxLinearProgressBarComponent` position.
     * ```typescript
     * @ViewChild("MyProgressBar")
     * public progressBar: IgxLinearProgressBarComponent;
     * public getValue(event) {
     *     let value = this.progressBar.value;
     *     alert(value);
     * }
     * ```
     */
    @HostBinding('attr.aria-valuenow')
    @Input()
    public get value(): number {
        return this._value;
    }

    protected _updateProgressValues(): void {
        const percentage = this.valueInPercent;
        const integerPart = Math.floor(percentage);
        const fractionalPart = Math.round((percentage % 1) * 100);

        // Set CSS variables for animation
        setTimeout(() => {
            this._integer = integerPart;
            this._fraction = fractionalPart;
        }, 0);
    }

    /**
     * Set value that indicates the current `IgxLinearProgressBarComponent` position.
     * ```html
     * <igx-linear-bar [striped]="false" [max]="200" [value]="50"></igx-linear-bar>
     * ```
     */
    public set value(val) {
        const valInRange = valueInRange(val, this.max); // Ensure value is in range

        if (isNaN(valInRange) || this._value === valInRange || this.indeterminate) {
            return; // Avoid redundant updates
        }

        this._value = valInRange; // Update internal value
        this._updateProgressValues(); // Refresh CSS variables
    }
}
let NEXT_LINEAR_ID = 0;
let NEXT_CIRCULAR_ID = 0;
let NEXT_GRADIENT_ID = 0;
@Component({
    selector: 'igx-linear-bar',
    templateUrl: 'templates/linear-bar.component.html',
    imports: [NgClass]
})
export class IgxLinearProgressBarComponent extends BaseProgressDirective implements AfterContentInit {
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
    @Input({ transform: booleanAttribute })
    public striped = false;

    /**
     * @hidden
     * ```
     */
    @HostBinding('class.igx-linear-bar--indeterminate')
    public get isIndeterminate() {
        return this.indeterminate;
    }

    /**
     * Sets the value of the `role` attribute. If not provided it will be automatically set to `progressbar`.
     * ```html
     * <igx-linear-bar role="progressbar"></igx-linear-bar>
     * ```
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'progressbar';

    /**
     * Sets the value of `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-linear-bar [id]="'igx-linear-bar-55'" [striped]="true" [max]="200" [value]="50"></igx-linear-bar>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-linear-bar-${NEXT_LINEAR_ID++}`;

    @HostBinding('class.igx-linear-bar--animation-none')
    public get disableAnimationClass(): boolean {
        return !this._animate;
    }

    @HostBinding('class.igx-linear-bar--hide-counter')
    public get hasText(): boolean {
        return !!this.text;
    }

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
    @Input({ transform: booleanAttribute })
    public textVisibility = true;

    /**
     * Set the position that defines if the text should be aligned above the progress line. By default is set to false.
     * ```html
     *  <igx-linear-bar type="error" [textTop]="true"></igx-linear-bar>
     * ```
     */
    @Input({ transform: booleanAttribute })
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
        this._updateProgressValues();
        this._contentInit = true;
    }
}

@Component({
    selector: 'igx-circular-bar',
    templateUrl: 'templates/circular-bar.component.html',
    imports: [NgTemplateOutlet, NgIf]
})
export class IgxCircularProgressBarComponent extends BaseProgressDirective implements AfterViewInit, AfterContentInit {
    /** @hidden */
    @HostBinding('class.igx-circular-bar')
    public cssClass = 'igx-circular-bar';

    /**
     * Sets the value of `id` attribute. If not provided it will be automatically generated.
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
    @HostBinding('class.igx-circular-bar--animation-none')
    @Input()
    public get isIndeterminate() {
        return this.indeterminate;
    }

    @HostBinding('class.igx-circular-bar--animation-none')
    public get disableAnimationClass(): boolean {
        return !this._animate;
    }

    @HostBinding('class.igx-circular-bar--hide-counter')
    public get hasText(): boolean {
        return !!this.text;
    }

    /**
     * Sets the text visibility. By default it is set to true.
     * ```html
     * <igx-circular-bar [textVisibility]="false"></igx-circular-bar>
     * ```
     */
    @Input({ transform: booleanAttribute })
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

    @ContentChild(IgxProgressBarTextTemplateDirective, { read: IgxProgressBarTextTemplateDirective })
    public textTemplate: IgxProgressBarTextTemplateDirective;

    @ContentChild(IgxProgressBarGradientDirective, { read: IgxProgressBarGradientDirective })
    public gradientTemplate: IgxProgressBarGradientDirective;

    @ViewChild('circle', { static: true })
    private _svgCircle: ElementRef;

    /**
     * @hidden
     */
    public gradientId = `igx-circular-gradient-${NEXT_GRADIENT_ID++}`;

    /**
     * @hidden
     */
    public get context(): any {
        return {
            $implicit: { value: this.value, valueInPercent: this.valueInPercent, max: this.max }
        };
    }

    constructor(private renderer: Renderer2) {
        super();
    }

    public ngAfterContentInit() {
        this._updateProgressValues();
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
    public get textContent(): string {
        return this.text;
    }
}
