import {
    NgModule,
    Component,
    Input,
    HostListener,
    ElementRef,
    HostBinding,
    Output,
    EventEmitter,
    OnInit,
    OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * @hidden
 */
@Component({
    selector: 'igx-thumb',
    templateUrl: 'thumb-slider.component.html'
})
export class IgxSliderThumbComponent implements OnInit, OnDestroy {

    private _timer;
    private _isActiveLabel = false;
    private _destroy$ = new Subject<boolean>();

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
    public stepDistance: number;

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

    /**
     * @hidden
     */
    public ngOnInit() {
        this.onPan
            .pipe(takeUntil(this._destroy$))
            .subscribe(mouseX =>
                this.updateThumbValue(mouseX)
            );
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this._destroy$.next(true);
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

    public showThumbsLabels() {
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
        const updateValue = this.calculateTrackUpdate(mouseX);
        if (this.isActive && updateValue !== 0) {
            this.onThumbValueChange.emit(updateValue);
        }
    }

    private calculateTrackUpdate(mouseX: number): number {
        const scaleX = mouseX - this._thumbPositionX;
        const stepDistanceCenter = this.stepDistance / 2;

        // If the thumb scale range (slider update) is less thàn a half step,
        // the position stays the same.
        const scaleXPositive = Math.abs(scaleX);
        if (scaleXPositive < stepDistanceCenter) {
            return 0;
        }

        return this.stepToProceed(scaleX, this.stepDistance);
    }

    private stepToProceed(scaleX, stepDist) {
        return Math.round(scaleX / stepDist) * this.step;
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
