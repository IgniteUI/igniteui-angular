import { CommonModule } from "@angular/common";
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgModule,
    OnChanges,
    Output,
    Renderer2,
    ViewChild
} from "@angular/core";

export abstract class BaseProgress {
    protected requestAnimationId: number = undefined;

    protected _valueInPercent: number = 0;
    protected _max: number = 100;
    protected _value = 0;
    protected _animate = true;

    public get valueInPercent(): number {
        return this._valueInPercent;
    }

    public set valueInPercent(valInPercent: number) {
        const valueInRange = getValueInProperRange(valInPercent, this._max);
        const valueIntoPercentage = convertInPercentage(valueInRange, this._max);
        this._valueInPercent = valueIntoPercentage;
    }

    protected runAnimation(val: number) {
        const direction = this.directionFlow(this._value, val);

        if (!this.requestAnimationId) {
            this.requestAnimationId = requestAnimationFrame(
                () => this.updateProgressSmoothly.call(this, val, direction));
        }

    }

    protected updateProgressSmoothly(val: number, direction: number) {
        if (this._value === val) {
            this.requestAnimationId = undefined;
            return;
        }

        this._value += direction;
        this.valueInPercent = this._value;

        requestAnimationFrame(() => this.updateProgressSmoothly.call(this, val, direction));
    }

    protected updateProgressDirectly(val: number) {
        this._value = val;
        this.valueInPercent = this._value;
    }

    protected directionFlow(currentValue: number, prevValue: number): number {
        if (currentValue < prevValue) {
            return 1;
        }

        return -1;
    }
}

@Component({
    selector: "igx-linear-bar",
    styleUrls: ["progressbar.component.scss"],
    templateUrl: "templates/linear-bar.component.html"
})
export class IgxLinearProgressBar extends BaseProgress {

    @Input() public striped: boolean = false;
    @Input() public type: string = "default";
    @Input()
    set animate(animate: boolean) {
        this._animate = animate;
    }

    get animate(): boolean {
        return this._animate;
    }

    @Input()
    set max(maxNum: number) {
        this._max = maxNum;
    }

    get max() {
        return this._max;
    }

    @Input()
    get value(): number {
        return this._value;
    }

    set value(val) {
        if (this._value === val) {
            return;
        }

        const valueInRange = getValueInProperRange(val, this.max);
        const changedValues = {
            currentValue: valueInRange,
            previousValue: this._value
        };

        if (this._animate) {
            super.runAnimation(valueInRange);
        } else {
            super.updateProgressDirectly(valueInRange);
        }

        this.onProgressChanged.emit(changedValues);
    }

    @Output() public onProgressChanged = new EventEmitter();

    constructor(private elementRef: ElementRef) {
        super();
    }
}

@Component({
    selector: "igx-circular-bar",
    styleUrls: ["progressbar.component.scss"],
    templateUrl: "templates/circular-bar.component.html"
})
export class IgxCircularProgressBar extends BaseProgress implements AfterViewInit {

    @Output() public onProgressChanged = new EventEmitter();

    private readonly STROKE_OPACITY_DVIDER = 100;
    private readonly STROKE_OPACITY_ADDITION = .2;

    @Input()
    set animate(animate: boolean) {
        this._animate = animate;
    }

    get animate(): boolean {
        return this._animate;
    }

    @Input()
    set max(maxNum: number) {
        this._max = maxNum;
    }

    get max(): number {
        return this._max;
    }

    @Input()
    get value() {
        return this._value;
    }

    set value(val) {
        if (this._value === val) {
            return;
        }

        const valueInProperRange = getValueInProperRange(val, this.max);
        const changedValues = {
            currentValue: valueInProperRange,
            previousValue: this._value
        };

        if (this.animate) {
            super.runAnimation(valueInProperRange);
        } else {
            this.updateProgressDirectly(valueInProperRange);
        }

        this.onProgressChanged.emit(changedValues);
    }

    private _radius: number = 0;
    private _circumference: number;

    @ViewChild("circle") private _svgCircle: ElementRef;
    @ViewChild("text") private _svgText: ElementRef;

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {
        super();
    }

    public ngAfterViewInit() {
        this._radius = parseInt(this._svgCircle.nativeElement.getAttribute("r"), 10);
        this._circumference = 2 * Math.PI * this._radius;
    }

    public updateProgressSmoothly(val: number, direction: number) {
        // Set frames for the animation
        const FRAMES = [{
            strokeDashoffset: this.getProgress(this._value),
            strokeOpacity: (this._value / this.STROKE_OPACITY_DVIDER) + this.STROKE_OPACITY_ADDITION
        }, {
            strokeDashoffset: this.getProgress(this.valueInPercent),
            strokeOpacity: (this.valueInPercent / this.STROKE_OPACITY_DVIDER) + this.STROKE_OPACITY_ADDITION
        }];
        this._svgCircle.nativeElement.animate(FRAMES, {
            easing: "ease-out",
            fill: "forwards"
        });

        super.updateProgressSmoothly(val, direction);
    }

    public updateProgressDirectly(val: number) {
        super.updateProgressDirectly(val);

        this.renderer.setStyle(
            this._svgCircle.nativeElement,
            "stroke-dashoffset",
            this.getProgress(this.valueInPercent));

        this.renderer.setStyle(
            this._svgCircle.nativeElement,
            "stroke-opacity",
            (this.valueInPercent / this.STROKE_OPACITY_DVIDER) + this.STROKE_OPACITY_ADDITION);
    }

    private getProgress(percentage: number) {
        return this._circumference - (percentage * this._circumference / 100);
    }
}

export function getValueInProperRange(value: number, max: number, min = 0): number {
    return Math.max(Math.min(value, max), min);
}

export function convertInPercentage(value: number, max: number) {
    return Math.floor(100 * value / max);
}

@NgModule({
    declarations: [IgxLinearProgressBar, IgxCircularProgressBar],
    exports: [IgxLinearProgressBar, IgxCircularProgressBar],
    imports: [CommonModule]
})
export class IgxProgressBarModule {
}
