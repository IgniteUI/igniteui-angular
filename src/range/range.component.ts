import {
    Component, NgModule, Input, ElementRef, ViewChild, OnInit, AfterViewInit, forwardRef, Renderer
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { HammerGesturesManager } from "../core/touch";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export enum SliderType {
    SINGLE_HORIZONTAL,
    DOUBLE_HORIZONTAL,
    SINGLE_VERTICAL,
    DOUBLE_VERTICAL
}

enum SliderHandle {
    FROM,
    TO
}

const noop = () => { };

function MakeProvider(type: any) {
    return {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => type),
        multi: true
    };
}

@Component({
    selector: "igx-range",
    moduleId: module.id,
    templateUrl: "range.component.html",
    providers: [HammerGesturesManager, MakeProvider(IgxRange)]
})
export class IgxRange implements ControlValueAccessor, OnInit, AfterViewInit {
    // Measures & Coordinates
    private width: number = 0;
    private xOffset: number = 0;
    private xPointer: number = 0;
    private pPointer: number = 0;

    // Limit handle travel zone
    private pMin: number = 0;
    private pMax: number = 1;

    // From/upperValue in percent values
    private fromPercent: number = 0;
    private toPercent: number = 0;
    private hasViewInit: boolean = false;
    private timer;

    public isActiveLabel: boolean = false;

    constructor(private renderer: Renderer) {}
    /**
     *
     * @type {number}
     */
    @Input()
    public digitsAfterDecimalPoints: number = 0;

    /**
     * The type of the slider
     * @type {SliderType}
     */
    @Input()
    public type: SliderType = SliderType.SINGLE_HORIZONTAL;

    get isMulti(): boolean {
        let isMulti: boolean = this.type != SliderType.SINGLE_HORIZONTAL &&
            this.type != SliderType.SINGLE_VERTICAL;

        return isMulti;
    }

    @Input()
    public thumbLabelVisibilityDuration: number = 750;

    private _minValue: number = 0;

    public get minValue(): number {
        return this._minValue;
    }

    /**
     *
     * @type {number}
     */
    @Input()
    public set minValue(value: number) {
        if (value >= this.maxValue) {
            console.warn("minValue should be less than maxValue");
            this._minValue = this.maxValue - 1;

            return;
        }

        this._minValue = value;
    }

    private _maxValue: number = 100;

    public get maxValue(): number {
        return this._maxValue;
    }

    /**
     *
     * @type {number}
     */
    @Input()
    public set maxValue(value: number) {
        if (value <= this._minValue) {
            console.warn("maxValue should be greater than minValue");
            this._maxValue = this._minValue + 1;

            return;
        }

        this._maxValue = value;
    }


    private _lowerBound?: number;

    /**
     * Gets the lower bound of the range value
     * @returns {number}
     */
    public get lowerBound(): number {
        return this._lowerBound;
    }

    /**
     * Sets the lower bound of the range value
     * @type {number}
     */
    @Input()
    public set lowerBound(value: number) {
        if (value >= this.upperBound) {
            console.warn("lowerBound should less than upperBound");
            this._lowerBound = this.minValue;
            return;
        }

        this._lowerBound = value;
    }

    private _upperBound?: number;

    get upperBound(): number {
        return this._upperBound;
    }

    /**
     * The upper bound of the range value
     * @type {number}
     */
    @Input()
    set upperBound(value: number) {
        if (value <= this.lowerBound) {
            console.warn("upperBound should greater than lowerBound");
            this._upperBound = this.maxValue;

            return;
        }

        this._upperBound = value;
    }

    private _lowerValue: number;

    public get lowerValue(): number {
        return this._lowerValue;
    }

    /**
     * Lower value of the range
     * @type {number}
     */
    @Input()
    public set lowerValue(value: number) {
        this._lowerValue = value;

        if (this.isMulti && this.hasViewInit) {
            this.positionHandlesAndUpdateTrack();
        }
    }

    private _upperValue: number;

    public get upperValue() {
        return this._upperValue;
    }

    /**
     * Upper value of the range
     * The default thumb value if the slider has singe thumb
     * @type {number}
     */
    @Input()
    public set upperValue(value: number) {
        this._upperValue = value;
        this._onChangeCallback(this._upperValue);

        if (this.hasViewInit) {
            this.positionHandlesAndUpdateTrack();
        }
    }

    /**
     *
     * @type {number}
     */
    @Input()
    public stepRange: number = 1;

    private activeHandle: SliderHandle = SliderHandle.TO;

    @ViewChild("range")
    private slider: ElementRef;

    @ViewChild("track")
    private track: ElementRef;

    @ViewChild("ticks")
    private ticks: ElementRef;

    @ViewChild("thumbFrom")
    private thumbFrom: ElementRef;

    @ViewChild("thumbTo")
    private thumbTo: ElementRef;

    public ngOnInit() {
        if (this.lowerBound === undefined) {
            this.lowerBound = this.minValue;
        }

        if (this.upperBound === undefined) {
            this.upperBound = this.maxValue;
        }

        if (this.isMulti) {
            this.lowerValue = this.lowerBound;
            this.upperValue = this.upperBound;
        } else {
            this.upperValue = this.lowerBound;
        }

        this.pMin = this.valueToFraction(this.lowerBound) || 0;
        this.pMax = this.valueToFraction(this.upperBound) || 1;
    }

    public ngAfterViewInit() {
        this.hasViewInit = true;
        this.positionHandlesAndUpdateTrack();
        this.setTickInterval();
    }

    private positionHandlesAndUpdateTrack() {
        if (!this.isMulti) {
            this.positionHandle(this.thumbTo, this.upperValue);
        } else {
            this.positionHandle(this.thumbTo, this.upperValue);
            this.positionHandle(this.thumbFrom, this.lowerValue);
        }
        
        this.updateTrack();
    }

    public update($event) {
        // Set width and offset first
        this.setSliderWidth();
        this.setSliderOffset();

        // Then get pointer coordinates
        this.setPointerPosition($event);
        this.setPointerPercent();

        // Find the closest handle
        this.setActiveHandle();
        this.toggleActiveClass($event);

        // Update To/From Values
        this.setValues();
        // this.printInfo();

        // Finally do positionHandlesAndUpdateTrack the DOM
        // based on data values
        this.positionHandlesAndUpdateTrack();
        this._onTouchedCallback();
    }

    private setActiveHandle(): void {
        switch (this.type) {
            case SliderType.SINGLE_HORIZONTAL:
            case SliderType.SINGLE_VERTICAL:
                this.activeHandle = SliderHandle.TO;
                break;

            case SliderType.DOUBLE_HORIZONTAL:
            case SliderType.DOUBLE_VERTICAL:
                this.closestHandle();
                break;

            default:
                console.error('No such Slider Type');
                break;
        }
    }

    private closestHandle() {
        let fromOffset = this.thumbFrom.nativeElement.offsetLeft + this.thumbFrom.nativeElement.offsetWidth / 2,
            toOffset = this.thumbTo.nativeElement.offsetLeft + this.thumbTo.nativeElement.offsetWidth / 2;

        let match = this.closestTo(this.xPointer, [fromOffset, toOffset]);

        if (match === toOffset) {
            this.activeHandle = SliderHandle.TO;
        } else if (match === fromOffset) {
            this.activeHandle = SliderHandle.FROM;
        } else {
            console.warn('No handles close upperValue pointer!');
        }
    }

    private setTickInterval() {
		let interval = this.stepRange > 1 ? 100 / this.stepRange : null;
        // CONSIDER
        // Use the renderer to style all elements of the range component?
        this.renderer.setElementStyle(this.ticks.nativeElement, 'background', this.generateTickMarks('white', interval));
        
        // OTHERWISE uncomment below
        // this.ticks.nativeElement.style.backround = this.generateTickMarks('white', interval);
	}

    protected generateTickMarks(color:string, interval:number) {
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
		)`
	}

    private toggleActiveClass(e) {
        if (e.type == 'panstart' || e.type == 'tap') {
            clearInterval(this.timer);
            this.isActiveLabel = true;
        }

        if (e.type == 'panend' || e.type == 'tap') {
            this.timer = setInterval(
                () => this.isActiveLabel = false,
                this.thumbLabelVisibilityDuration
            );
        }
    }

    private closestTo(goal: number, positions: Array<number>): number {
        return positions.reduce((previous, current) => {
            return (Math.abs(goal - current) < Math.abs(goal - previous) ? current : previous);
        });
    }

    // Set Values for To/From based on active handle
    private setValues() {
        if (this.activeHandle === SliderHandle.TO) {
            this.upperValue = this.fractionToValue(this.pPointer);
            this.toPercent = this.fractionToPercent(this.pPointer);
        }

        if (this.activeHandle === SliderHandle.FROM) {
            this.lowerValue = this.fractionToValue(this.pPointer);
            this.fromPercent = this.fractionToPercent(this.pPointer);
        }
    }

    private setSliderWidth(): void {
        this.width = this.slider.nativeElement.offsetWidth;
    }

    private setPointerPosition(e) {
        this.xPointer = e.center.x - this.getSliderOffset();
    }

    public getPointerPosition(): number {
        return this.xPointer;
    }

    private setSliderOffset() {
        this.xOffset = this.slider.nativeElement.offsetLeft;
    }

    public getSliderOffset(): number {
        return this.xOffset;
    }

    private setPointerPercent() {
        this.pPointer = this.limit(this.toFixed(this.xPointer / this.width));
    }

    public getPointerPercent(): number {
        return this.pPointer;
    }

    private valueToFraction(value: number) {
        return this.limit((value - this.minValue) / (this.maxValue - this.minValue));
    }

    private fractionToValue(fraction: number): number {
        let max: number = this.maxValue,
            min: number = this.minValue;

        return (max - min) * fraction + min;
    }

    private fractionToPercent(fraction: number): number {
        return this.toFixed(fraction * 100);
    }

    private limit(num: number): number {
        return Math.max(this.pMin, Math.min(num, this.pMax));
    }

    toFixed(num: number): number {
        num = parseFloat(num.toFixed(20));
        return num;
    }

    public positionHandle(handle: ElementRef, position: number) {
        handle.nativeElement.style.left = `${this.valueToFraction(position) * 100}%`;
    }

    private formatValue(value: number) {
        if (!value) {
            return
        }

        return value.toFixed(this.digitsAfterDecimalPoints);
    }

    private updateTrack() {
        let fromPosition = this.valueToFraction(this.lowerValue),
            toPosition = this.valueToFraction(this.upperValue),
            positionGap = (this.valueToFraction(this.upperValue) - this.valueToFraction(this.lowerValue));

        if (this.type == SliderType.SINGLE_HORIZONTAL || this.type == SliderType.SINGLE_VERTICAL) {
            this.track.nativeElement.style.transform = `scaleX(${toPosition})`;
        }

        if (this.type == SliderType.DOUBLE_HORIZONTAL || this.type == SliderType.DOUBLE_VERTICAL) {
            this.track.nativeElement.style.transform = `scaleX(${1})`;
            this.track.nativeElement.style.left = `${fromPosition * 100}%`;
            this.track.nativeElement.style.width = `${positionGap * 100}%`;
        }
    }

    writeValue(value: any): void {
        if (!isNaN(value)) {
            this.upperValue = parseFloat(value);

            return;
        }
    }

    private _onChangeCallback: (_: any) => void = noop;
    private _onTouchedCallback: () => void = noop;

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
        this._onTouchedCallback = fn;
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [IgxRange],
    exports: [IgxRange]
})
export class IgxRangeModule {
}