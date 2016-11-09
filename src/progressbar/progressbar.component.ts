import {
    NgModule,
    Component,
    Input,
    ElementRef,
    AfterViewInit,
    ViewChild,
    Renderer,
    OnChanges,
    SimpleChanges,
    Output,
    EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'ig-progressbar',
    template: `
        <div *ngIf="!circeler" class="progress-linear"
            [class.progress-animated]="animated"
            [class.progress-striped]="striped">
            <div #linearBar class="progress-bar progress-bar{{type ? '-' + type : ''}}"
                aria-valuemin="0"
                [attr.aria-valuemax]="max"
                [attr.aria-valuenow]="getValue()"
                [style.width.%]="getPercentValue()">
                <ng-content></ng-content>
            </div>
        </div>
        <svg #svg *ngIf="circeler" class="progress-circular" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <linearGradient id="linear" x1="-10%" y1="0%" x2="50%" y2="150%">
                <stop offset="0%"   stop-color="#0375BE"/>
                <stop offset="100%" stop-color="cyan"/>
                </linearGradient>
            </defs>
            <circle #circle class="progress-circular__circle" cx="50" cy="50" r="46" id="blue-halo"/>
            <text #text class="progress-circular__text" id="myTimer" text-anchor="middle" x="50" y="60">{{_valueInPercent}}%</text>
        </svg>
    `,
    styleUrls: [ 'stylesheet.css' ]
})
export class IgProgressBar implements AfterViewInit, OnChanges {
    private _radius: number = 0;
    private _circumference: number = 0;
    private _interval: number = 15;
    private _percentage = 0;
    private _progress = 0;

    @ViewChild('circle') private _svg_circle: ElementRef;
    @ViewChild('text') private _svg_text: ElementRef;
    @ViewChild('linearBar') private _linear_bar: ElementRef;

    @Input() private _valueInPercent: number = 0;

    @Input() max: number = 100;
    @Input() animated: boolean = false;
    @Input() striped: boolean = false;
    @Input() type: string = 'default';
    @Input() circeler: boolean = false;
    @Input() value: number = 0;

    @Output() onProgressChanged = new EventEmitter();

    constructor(private elementRef: ElementRef, private renderer: Renderer){
    }

    ngOnChanges(changes: SimpleChanges) {
        if(this._linear_bar) {
            if(changes.value) {
                this.onProgressChanged.emit(changes);
            }
        }
        if(this._svg_circle) {
            // Validate percentage value to be between [0...100]
            this._percentage = getValueInRange(this.getPercentValue(), 100);

            if(changes.value){
                // Validate values to be between [0...max]
                this.value = getValueInRange(changes.value.previousValue, this.max);
                let validatePrevValue = getValueInRange(changes.value.previousValue, this.max);
                let validateCurrValue = getValueInRange(changes.value.currentValue, this.max);
                // Get passed value in percent
                this._valueInPercent = convertValueInPercent(this.value, this.max);
                // Get previous value in percent
                let prevValInPercent = convertValueInPercent(validatePrevValue, this.max);
                // Get current value in percent
                let currValInPercent = convertValueInPercent(validateCurrValue, this.max);

                // Change progress bar percent value
                let timer = setInterval(function() {
                    if(this._valueInPercent >= currValInPercent) {
                        clearInterval(timer);

                        // Object that passed to the event
                        let changedValues = {
                            currentValue: currValInPercent,
                            previousValue: prevValInPercent
                        }

                        this.onProgressChanged.emit(changedValues);
                        this.renderer.setElementStyle(this._svg_circle.nativeElement, 'strokeDashoffset', this._percentage);
                    } else {
                        // Update progress bar percent value
                        this._valueInPercent++;
                    }
                }.bind(this), this._interval);

                // Set frames for the animation
                let FRAMES = [{
                    strokeDashoffset: this.getProgress(prevValInPercent),
                    strokeOpacity: (prevValInPercent / 100) + .2
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

    public getValue() {
        return getValueInRange(this.value, this.max);
    }

    public getPercentValue() {
        return convertValueInPercent(this.value, this.max);
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
    declarations: [IgProgressBar],
    exports: [IgProgressBar]
})
export class IgProgressBarModule {
}