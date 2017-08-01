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
    protected _valueInPercent: number;
    protected _prevValue: number;
    protected _currValue: number;
    protected max;
    protected value;

    public getValue() {
        return getValueInRange(this.value, this.max);
    }

    public getPercentValue() {
        return convertValueInPercent(this.getValue(), this.max);
    }

    protected instantiateValAnimation(prevVal: number, currVal: number, max: number) {
        // Validate current and previous value to be in range [0...max]
        const validatePrevValue = getValueInRange(prevVal, max) || 0;
        const validateCurrValue = getValueInRange(currVal, max) || 0;
        // Get prev progress value in percent
        this._valueInPercent = convertValueInPercent(validatePrevValue, max);
        // Get previous value in percent
        this._prevValue = convertValueInPercent(validatePrevValue, max);
        // Get current value in percent
        this._currValue = convertValueInPercent(validateCurrValue, max);
    }

    protected startAnimation(interval: number, circular: ElementRef = null, percentage: number = 0) {
        // Change progress bar percent value
        const timer = setInterval(function animateBar() {
            if (this._valueInPercent >= this._currValue) {
                clearInterval(timer);

                // Object that passed to the event
                const changedValues = {
                    currentValue: this._currValue,
                    previousValue: this._prevValue
                };

                this.onProgressChanged.emit(changedValues);
                if (circular) {
                    this.renderer.setStyle(circular.nativeElement, "strokeDashoffset", percentage);
                }
            } else {
                // Update progress bar percent value
                this._valueInPercent++;
            }
        }.bind(this), interval);
    }
}

@Component({
    moduleId: module.id,
    selector: "igx-linear-bar",
    styleUrls: ["progressbar.component.css"],
    templateUrl: "templates/linear-bar.component.html"
})
export class IgxLinearProgressBar extends BaseProgress implements OnChanges {
    @Input() public max: number = 100;
    @Input() public striped: boolean = false;
    @Input() public type: string = "default";
    @Input() public value: number = 0;

    @Output() public onProgressChanged = new EventEmitter();

    @Input() protected _valueInPercent: number = 0;

    private _interval: number = 15;

    @ViewChild("linearBar") private _linearBar: ElementRef;

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {
        super();
    }

    public ngOnChanges(changes) {
        if (this._linearBar) {
            if (changes.value) {
                super.instantiateValAnimation(changes.value.previousValue, changes.value.currentValue, this.max);

                super.startAnimation(this._interval);
            }
        }
    }
}

@Component({
    moduleId: module.id,
    selector: "igx-circular-bar",
    styleUrls: ["progressbar.component.css"],
    templateUrl: "templates/circular-bar.component.html"
})
export class IgxCircularProgressBar extends BaseProgress implements AfterViewInit, OnChanges {
    @Input() public max: number = 100;
    @Input() public value: number = 0;

    @Output() public onProgressChanged = new EventEmitter();

    @Input() protected _valueInPercent: number = 0;

    private _radius: number = 0;
    private _circumference: number = 289;
    private _interval: number = 15;
    private _percentage = 0;
    private _progress = 0;

    @ViewChild("circle") private _svgCircle: ElementRef;
    @ViewChild("text") private _svgText: ElementRef;

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {
        super();
    }

    public ngOnChanges(changes) {
        if (this._svgCircle) {
            // Validate percentage value to be between [0...100]
            this._percentage = getValueInRange(super.getPercentValue(), 100);

            if (changes.value) {
                super.instantiateValAnimation(changes.value.previousValue, changes.value.currentValue, this.max);

                super.startAnimation(this._interval, this._svgCircle, this._percentage);

                // Set frames for the animation
                const FRAMES = [{
                    strokeDashoffset: this.getProgress(this._prevValue),
                    strokeOpacity: (this._prevValue / 100) + .2
                }, {
                    strokeDashoffset: this.getProgress(this._percentage),
                    strokeOpacity: (this._percentage / 100) + .2
                }];

                // Animate the svg
                this._svgCircle.nativeElement.animate(FRAMES, {
                    duration: (this._percentage * this._interval) + 400,
                    easing: "ease-out",
                    fill: "forwards"
                });
            }
        }
    }

    public ngAfterViewInit() {
        if (this._svgCircle) {
            this._radius = parseInt(this._svgCircle.nativeElement.getAttribute("r"), 10);
            this._circumference = 2 * Math.PI * this._radius;
        }
    }

    private getProgress(percentage: number) {
        return this._circumference - (percentage * this._circumference / 100);
    }
}

export function getValueInRange(value: number, max: number, min = 0): number {
    return Math.max(Math.min(value, max), min);
}

export function convertValueInPercent(value: number, max: number) {
    return Math.floor(100 * value / max);
}

@NgModule({
    declarations: [IgxLinearProgressBar, IgxCircularProgressBar],
    exports: [IgxLinearProgressBar, IgxCircularProgressBar],
    imports: [CommonModule]
})
export class IgxProgressBarModule {
}
