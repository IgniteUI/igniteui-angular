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
    OnDestroy,
    TemplateRef} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SliderHandle } from '../slider.common';

/**
 * @hidden
 */
@Component({
    selector: 'igx-thumb',
    templateUrl: 'thumb-slider.component.html',
})
export class IgxSliderThumbComponent implements OnInit, OnDestroy {

    private _timer;
    private _isActiveLabel = false;
    private _isPressed = false;
    private _destroy$ = new Subject<boolean>();

    private get thumbPositionX() {
        const thumbBounderies = this.nativeElement.getBoundingClientRect();
        const thumbCenter = (thumbBounderies.right - thumbBounderies.left) / 2;
        return thumbBounderies.left + thumbCenter;
    }

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

    @Input()
    public templateRef: TemplateRef<any>;

    @Input()
    public context: any;

    @Input()
    public type: SliderHandle;

    @Output()
    public onThumbValueChange = new EventEmitter<number>();

    @Output()
    public onChange = new EventEmitter<any>();

    @Output()
    public onHoverChange = new EventEmitter<boolean>();

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @HostBinding('attr.z-index')
    public zIndex = 0;

    @HostBinding('class.igx-slider__thumb-from')
    public get thumbFromClass() {
        return this.type === SliderHandle.FROM;
    }

    @HostBinding('class.igx-slider__thumb-to')
    public get thumbToClass() {
        return this.type === SliderHandle.TO;
    }

    @HostBinding('class.igx-slider__thumb-from--active')
    public get thumbFromActiveClass() {
        return this._isActiveLabel;
    }

    @HostBinding('class.igx-slider__thumb-to--active')
    public get thumbToActiveClass() {
        return this._isActiveLabel;
    }

    @HostBinding('class.igx-slider__thumb--pressed')
    public get thumbPressedClass() {
        return this.isActive && this._isPressed;
    }

    public get nativeElement() {
        return this._elementRef.nativeElement;
    }

    public get destroy(): Subject<boolean> {
        return this._destroy$;
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
        this._destroy$.complete();
    }

    @HostListener('pointerenter')
    public onPinterEnter() {
        this.onHoverChange.emit(true);
    }

    @HostListener('pointerleave')
    public onPointerLeave() {
        this.onHoverChange.emit(false);
    }

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
        if (this.disabled) {
            return;
        }

        let increment = 0;
        if (event.key.endsWith('Left')) {
            increment = this.step * - 1;
        } else if (event.key.endsWith('Right')) {
            increment = this.step;
        } else {
            return;
        }

        this.onChange.emit();
        this.onThumbValueChange.emit(increment);
    }

    @HostListener('blur')
    public onBlur() {
        this.isActive = false;
        this.zIndex = 0;
    }

    @HostListener('focus')
    public onFocusListener() {
        this.isActive = true;
        this.zIndex = 1;
        this.onChange.emit();
    }

    /**
     * Show thumb label and ripple.
     */
    public showThumbIndicators() {
        if (this.disabled) {
            return;
        }

        if (this._timer !== null) {
            clearTimeout(this._timer);
        }

        this.toggleThumbIndicators(true);
    }

    /**
     * Hide thumb label and ripple.
     */
    public hideThumbIndicators() {
        if (this.disabled) {
            return;
        }

        this._timer = setTimeout(
            () =>  this.toggleThumbIndicators(false),
            this.thumbLabelVisibilityDuration
        );
    }

    private updateThumbValue(mouseX: number) {
        const updateValue = this.calculateTrackUpdate(mouseX);
        if (this.isActive && updateValue !== 0) {
            this.onThumbValueChange.emit(updateValue);
        }
    }

    private calculateTrackUpdate(mouseX: number): number {
        const scaleX = mouseX - this.thumbPositionX;
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

    private toggleThumbIndicators(visible: boolean) {
        this._isPressed = visible;

        if (!this.continuous) {
            this._isActiveLabel = visible;
        }
    }
}
