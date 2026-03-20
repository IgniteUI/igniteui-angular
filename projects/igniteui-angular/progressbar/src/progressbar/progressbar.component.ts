import { NgClass, NgTemplateOutlet } from '@angular/common';
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
    AfterContentInit,
    Directive,
    booleanAttribute,
    inject,
    ChangeDetectorRef,
    NgZone,
} from '@angular/core';
import {
    IgxProgressBarTextTemplateDirective,
    IgxProgressBarGradientDirective,
} from './progressbar.common';
import { IBaseEventArgs } from 'igniteui-angular/core';
const ONE_PERCENT = 0.01;
const MIN_VALUE = 0;

export const IgxTextAlign = {
    START: 'start',
    CENTER: 'center',
    END: 'end'
} as const;
export type IgxTextAlign = (typeof IgxTextAlign)[keyof typeof IgxTextAlign];

export const IgxProgressType = {
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
    SUCCESS: 'success'
} as const;
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
     * An event, which is triggered after progress is changed.
     */
    @Output()
    public progressChanged = new EventEmitter<IChangeProgressEventArgs>();

    /**
     * Sets/Gets progressbar animation duration. By default, it is 2000ms.
     */
    @Input()
    public animationDuration = 2000;

    protected _contentInit = false;
    protected _indeterminate = false;
    protected _text: string;
    protected _max = 100;
    protected _value = MIN_VALUE;
    protected _animate = true;
    protected _step: number;
    protected _fraction = 0;
    protected _integer = 0;
    protected _cdr = inject(ChangeDetectorRef);
    protected _zone = inject(NgZone);

    /**
     * Sets progressbar in indeterminate. By default, it is set to false.
     */
    @Input({ transform: booleanAttribute })
    public set indeterminate(isIndeterminate: boolean) {
        this._indeterminate = isIndeterminate;
        this._resetCounterValues(this._indeterminate); // Use the helper for indeterminate condition
    }

    /**
     * Gets the current state of the progress bar:
     * - `true` if in the indeterminate state (no progress value displayed),
     * - `false` if the progress bar shows the actual progress.
    */
    public get indeterminate(): boolean {
        return this._indeterminate;
    }

    /**
     * Returns the value which update the progress indicator of the `progress bar`.
     */
    @Input()
    public get step(): number {
        if (this._step) {
            return this._step;
        }
        return this._max * ONE_PERCENT;
    }

    /**
     * Sets the value by which progress indicator is updated. By default, it is 1.
     */
    public set step(val: number) {
        const step = Number(val);
        if (step > this.max) {
            return;
        }

        this._step = step;
    }


    /**
     * Set a custom text. This will hide the counter value.
     */
    @Input()
    public set text(value: string) {
        this._text = value;
        this._resetCounterValues(!!this._text); // Use the helper for text condition
    }

    /**
     * Gets a custom text.
     */
    public get text(): string {
        return this._text;
    }

    /**
     * Animating the progress. By default, it is set to true.
     */
    @Input({ transform: booleanAttribute })
    public set animate(animate: boolean) {
        this._animate = animate;
    }

    /**
     * Returns whether the `progress bar` has animation true/false.
     */
    public get animate(): boolean {
        return this._animate;
    }

    /**
     * Set maximum value that can be passed. By default it is set to 100.
     */
    @HostBinding('attr.aria-valuemax')
    @Input()
    public set max(maxNum: number) {
        // Ignore invalid or unchanged max
        if (maxNum < MIN_VALUE || this._max === maxNum) {
            return;
        }

        this._max = maxNum;

        // Revalidate current value
        this._value = valueInRange(this._value, this._max);

        // Refresh CSS variables
        this._updateProgressValues();
    }

    /**
     * Returns the maximum progress value of the `progress bar`.
     */
    public get max() {
        return this._max;
    }

    @HostBinding('style.--_progress-integer')
    private get progressInteger() {
        return this._integer.toString();
    }

    @HostBinding('style.--_progress-fraction')
    private get progressFraction() {
        return this._fraction.toString();
    }

    @HostBinding('style.--_progress-whole')
    private get progressWhole() {
        return this.valueInPercent.toFixed(2);
    }

    @HostBinding('style.--_transition-duration')
    private get transitionDuration() {
        return `${this.animationDuration}ms`;
    }

    /**
     * @hidden
     */
    protected get hasFraction(): boolean {
        const percentage = this.valueInPercent;
        const integerPart = Math.floor(percentage);
        const fractionalPart = percentage - integerPart;

        return fractionalPart > 0;
    }

    /**
     * Returns the `IgxLinearProgressBarComponent`/`IgxCircularProgressBarComponent` value in percentage.
     */
    public get valueInPercent(): number {
        const result = this.max > 0 ? (this._value / this.max) * 100 : 0;
        return Math.round(result * 100) / 100; // Round to two decimal places
    }

    /**
     * Returns value that indicates the current `IgxLinearProgressBarComponent`/`IgxCircularProgressBarComponent` position.
     */
    @HostBinding('attr.aria-valuenow')
    @Input()
    public get value(): number {
        return this._value;
    }

    /**
     * @hidden
     */
    protected _updateProgressValues(): void {
        const percentage = this.valueInPercent;
        const integerPart = Math.floor(percentage);
        const fractionalPart = Math.round((percentage % 1) * 100);

        this._integer = integerPart;
        this._fraction = fractionalPart;
    }

    private _resetCounterValues(condition: boolean) {
        if (condition) {
            this._integer = 0;
            this._fraction = 0;
        } else {
            this._zone.runOutsideAngular(() => {
                setTimeout(() => {
                    this._updateProgressValues();
                    this._cdr.markForCheck();
                });
            });
        }
    }

    /**
     * Set value that indicates the current `IgxLinearProgressBarComponent / IgxCircularProgressBarComponent` position.
     */
    public set value(val) {
        const valInRange = valueInRange(val, this.max); // Ensure value is in range

        // Avoid redundant updates
        if (isNaN(valInRange) || this._value === valInRange) {
            return;
        }

        const previousValue = this._value;

        // Update internal value
        this._value = valInRange;

        this._zone.runOutsideAngular(() => {
            setTimeout(() => {
                this._updateProgressValues();
                this._cdr.markForCheck();
            });
        });

        // Emit the progressChanged event
        this.progressChanged.emit({
            previousValue,
            currentValue: this._value,
        });
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
     */
    @HostBinding('class.igx-linear-bar--striped')
    @Input({ transform: booleanAttribute })
    public striped = false;

    /**
     * @hidden
     */
    @HostBinding('class.igx-linear-bar--indeterminate')
    public get isIndeterminate() {
        return this.indeterminate;
    }

    /**
     * Sets the value of the `role` attribute. If not provided it will be automatically set to `progressbar`.
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'progressbar';

    /**
     * Sets the value of `id` attribute. If not provided it will be automatically generated.
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-linear-bar-${NEXT_LINEAR_ID++}`;

    /**
     * @hidden
     */
    @HostBinding('class.igx-linear-bar--animation-none')
    public get disableAnimationClass(): boolean {
        return !this._animate;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-linear-bar--hide-counter')
    public get hasText(): boolean {
        return !!this.text;
    }

    /**
     * Set the position that defines where the text is aligned.
     * Possible options - `IgxTextAlign.START` (default), `IgxTextAlign.CENTER`, `IgxTextAlign.END`.
     */
    @Input()
    public textAlign: IgxTextAlign = IgxTextAlign.START;

    /**
     * Set the text to be visible. By default, it is set to true.
     */
    @Input({ transform: booleanAttribute })
    public textVisibility = true;

    /**
     * Set the position that defines if the text should be aligned above the progress line. By default, is set to false.
     */
    @Input({ transform: booleanAttribute })
    public textTop = false;

    /**
     * Set type of the `IgxLinearProgressBarComponent`. Possible options - `default`, `success`, `info`, `warning`, and `error`.
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
        this._contentInit = true;
    }
}

@Component({
    selector: 'igx-circular-bar',
    templateUrl: 'templates/circular-bar.component.html',
    imports: [NgTemplateOutlet, NgClass]
})
export class IgxCircularProgressBarComponent extends BaseProgressDirective implements AfterContentInit {
    private renderer = inject(Renderer2);

    /**
     * @hidden
     */
    @HostBinding('class.igx-circular-bar')
    public cssClass = 'igx-circular-bar';

    /**
     * Sets the value of `id` attribute. If not provided it will be automatically generated.
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-circular-bar-${NEXT_CIRCULAR_ID++}`;

    /**
     * @hidden
     */
    @HostBinding('class.igx-circular-bar--indeterminate')
    public get isIndeterminate() {
        return this.indeterminate;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-circular-bar--animation-none')
    public get disableAnimationClass(): boolean {
        return !this._animate;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-circular-bar--hide-counter')
    public get hasText(): boolean {
        return !!this.text;
    }

    /**
     * Sets the text visibility. By default, it is set to true.
     */
    @Input({ transform: booleanAttribute })
    public textVisibility = true;

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

    /**
     * @hidden
     */
    public get textContent(): string {
        return this.text;
    }

    /**
     * Set type of the `IgxCircularProgressBarComponent`. Possible options - `default`, `success`, `info`, `warning`, and `error`.
     */
    @Input()
    public type = 'default';

    /**
     * @hidden
     */
    @HostBinding('class.igx-circular-bar--danger')
    public get error() {
        return this.type === IgxProgressType.ERROR;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-circular-bar--info')
    public get info() {
        return this.type === IgxProgressType.INFO;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-circular-bar--warning')
    public get warning() {
        return this.type === IgxProgressType.WARNING;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-circular-bar--success')
    public get success() {
        return this.type === IgxProgressType.SUCCESS;
    }

    /**
     * @hidden
     */
    @HostBinding('style.stroke')
    public get strokeStyle() {
        return this.type === 'default' ? `url(#${this.gradientId})` : 'none';
    }

    public ngAfterContentInit() {
        this._contentInit = true;
    }

}
