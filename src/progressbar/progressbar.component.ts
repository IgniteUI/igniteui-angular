import {
    NgModule,
    Component,
    Input,
    ElementRef,
    AfterViewInit,
    ViewChild,
    Renderer,
    OnChanges,
    Output,
    EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';

export abstract class BaseProgress {
    protected _valueInPercent: number;
    protected _prevValue: number;
    protected _currValue: number;
    protected max;
    protected value;

    protected instantiateValAnimation(prevVal: number, currVal: number, max:number) {
        // Valide current and previous value to be in ragne [0...max]
        let validatePrevValue = getValueInRange(prevVal, max) || 0;
        let validateCurrValue = getValueInRange(currVal, max) || 0;
        // Get prev progress value in percent
        this._valueInPercent = convertValueInPercent(validatePrevValue, max);
        // Get previous value in percent
        this._prevValue = convertValueInPercent(validatePrevValue, max);
        // Get current value in percent
        this._currValue = convertValueInPercent(validateCurrValue, max);
    }

    protected startAnimation(interval:number, circular:ElementRef = null, percentage:number = 0) {
        // Change progress bar percent value
        let timer = setInterval(function() {
            if(this._valueInPercent >= this._currValue) {
                clearInterval(timer);

                // Object that passed to the event
                let changedValues = {
                    currentValue: this._currValue,
                    previousValue: this._prevValue
                }

                this.onProgressChanged.emit(changedValues);
                if(circular){
                    this.renderer.setElementStyle(circular.nativeElement, 'strokeDashoffset', percentage);
                }
            } else {
                // Update progress bar percent value
                this._valueInPercent++;
            }
        }.bind(this), interval);
    }

    public getValue() {
        return getValueInRange(this.value, this.max);
    }

    public getPercentValue() {
        return convertValueInPercent(this.getValue(), this.max);
    }
}

@Component({
    moduleId: module.id,
    selector: 'igx-linear-bar',
    templateUrl: 'templates/linear-bar.component.html'
})
export class IgxLinearProgressBar extends BaseProgress implements OnChanges {
    private _interval: number = 15;

    @ViewChild('linearBar') private _linear_bar: ElementRef;

    @Input() protected _valueInPercent: number = 0;

    @Input() max: number = 100;
    @Input() striped: boolean = false;
    @Input() type: string = 'default';
    @Input() value: number = 0;

    @Output() onProgressChanged = new EventEmitter();

    constructor(private elementRef: ElementRef, private renderer: Renderer){
        super();
    }

    ngOnChanges(changes) {
        if(this._linear_bar) {
            if(changes.value){
                super.instantiateValAnimation(changes.value.previousValue, changes.value.currentValue, this.max);

                super.startAnimation(this._interval);
            }
        }
    }
}

@Component({
    moduleId: module.id,
    selector: 'igx-circular-bar',
    templateUrl: 'templates/circular-bar.component.html'
})
export class IgxCircularProgressBar extends BaseProgress implements AfterViewInit, OnChanges {
    private _radius: number = 0;
    private _circumference: number = 289;
    private _interval: number = 15;
    private _percentage = 0;
    private _progress = 0;

    @ViewChild('circle') private _svg_circle: ElementRef;
    @ViewChild('text') private _svg_text: ElementRef;

    @Input() protected _valueInPercent: number = 0;

    @Input() max: number = 100;
    @Input() value: number = 0;

    @Output() onProgressChanged = new EventEmitter();

    constructor(private elementRef: ElementRef, private renderer: Renderer) {
        super();
    }

    ngOnChanges(changes) {
        if(this._svg_circle) {
            // Validate percentage value to be between [0...100]
            this._percentage = getValueInRange(super.getPercentValue(), 100);

            if(changes.value){
                super.instantiateValAnimation(changes.value.previousValue, changes.value.currentValue, this.max);

                super.startAnimation(this._interval, this._svg_circle, this._percentage);

                // Set frames for the animation
                let FRAMES = [{
                    strokeDashoffset: this.getProgress(this._prevValue),
                    strokeOpacity: (this._prevValue / 100) + .2
                }, {
                    strokeDashoffset: this.getProgress(this._percentage),
                    strokeOpacity: (this._percentage / 100) + .2
                }];

                // Animate the svg
                this._svg_circle.nativeElement.animate(FRAMES, {
                    duration: (this._percentage * this._interval) + 400,
                    fill: 'forwards',
                    easing: 'ease-out'
                })
            }
        }
    }

    ngAfterViewInit() {
        if(this._svg_circle) {
            this._radius = parseInt(this._svg_circle.nativeElement.getAttribute('r'));
            this._circumference = 2 * Math.PI * this._radius;
        }
    }

    private getProgress(percentage:number) {
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
    imports: [ CommonModule],
    declarations: [IgxLinearProgressBar, IgxCircularProgressBar],
    exports: [IgxLinearProgressBar, IgxCircularProgressBar]
})
export class IgxProgressBarModule {
}