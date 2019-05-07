import {
    NgModule,
    Component,
    Input,
    HostListener,
    ElementRef,
    HostBinding,
    Output,
    EventEmitter,
    OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';


// enum SliderHandle {
//     FROM,
//     TO
// }

/**
 * @hidden
 */
@Component({
    selector: 'igx-thumb',
    templateUrl: 'thumb-slider.component.html'
})
export class IgxSliderThumbComponent implements OnInit {

    private _timer;
    private _oldValue;
    private _isActiveLabel = false;

    public isActive = false;

    @Input()
    public value: number;

    @Input()
    public continuous: boolean;

    @Input()
    public thumbLabelVisibilityDuration;

    @Input()
    public disabled: boolean;

    @Input()
    public onPan: Subject<number>;

    @Input()
    public distancePerStep: number;

    @Input()
    public step: number;

    @Output()
    public onThumbValueChange = new EventEmitter<number>();

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @HostBinding('class.igx-slider__thumb-to')
    public sliderThumbToClass = true;

    @HostBinding('class.igx-slider__thumb-to--active')
    public get thumbToActiveClass() {
        return this._isActiveLabel;
    }

    public get nativeElement() {
        return this._elementRef.nativeElement;
    }

    private get _thumbPositionX() {
        const thumbBounderies = this.nativeElement.getBoundingClientRect();
        const thumbCenter = (thumbBounderies.right - thumbBounderies.left) / 2;
        return thumbBounderies.x + thumbCenter;
    }

    constructor (private _elementRef: ElementRef) { }

    public ngOnInit() {
        this.onPan.subscribe(value =>
            this.updateValue(value)
        );
    }

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
        if (event.key.endsWith('Left') || event.key.endsWith('Right')) {
            this.showThumbsLabels();
        }
    }

    @HostListener('keyup')
    public onKeyUp() {
        this.hideThumbsLabels();
    }

    @HostListener('blur')
    public hideThumbLabelsOnBlur() {
        if (this._timer !== null) {
            clearInterval(this._timer);
        }

        this._isActiveLabel = false;
        this.isActive = false;
    }

    @HostListener('focus', ['$event'])
    public onFocus($event: FocusEvent) {
        this.toggleThumbLabel();
    }

    public updateValue(mouseX: number) {
        this.updateThumbValue(mouseX);
    }

    public showThumbsLabels() {
        this._oldValue = this.value;

        if (this.disabled) {
            return;
        }

        if (this.continuous) {
            return;
        }

        if (this._timer !== null) {
            clearInterval(this._timer);
        }

        this._isActiveLabel = true;
        this.isActive = true;
    }

    private updateThumbValue(mouseX: number) {
        const updateRange = this.fractionToValue(mouseX);
        if (this.isActive && updateRange !== 0) {
            this.onThumbValueChange.emit(updateRange);
        }
    }

    private stepToProceed(scaleX, stepDist, direction) {
        const increment = Math.round(scaleX / stepDist) * this.step;
        return direction < 0 ? -increment : increment;
    }

    private fractionToValue(mouseX: number): number {
        const scaleX = Math.abs(mouseX - this._thumbPositionX);
        const distancePerStep = this.distancePerStep;
        const stepRangeCenter = distancePerStep / 2;

        return scaleX > stepRangeCenter ? this.stepToProceed(scaleX, distancePerStep, mouseX - this._thumbPositionX) : 0;
    }


    private toggleThumbLabel() {
        this.showThumbsLabels();
        this.hideThumbsLabels();
    }

    private hideThumbsLabels() {
        if (this.disabled) {
            return;
        }

        if (this.continuous) {
            return;
        }

        this._timer = setTimeout(
            () => this._isActiveLabel = false,
            this.thumbLabelVisibilityDuration
        );
    }

}
@NgModule({
    declarations: [IgxSliderThumbComponent],
    imports: [CommonModule],
    exports: [IgxSliderThumbComponent]
})
export class IgxSliderThumbModule {}
