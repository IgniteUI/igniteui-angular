import {
    Component,
    Input,
    HostListener,
    ElementRef,
    HostBinding,
    Output,
    EventEmitter,
    OnInit,
    OnDestroy,
    TemplateRef,
    booleanAttribute
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { SliderHandle } from '../slider.common';
import { Subject } from 'rxjs';
import { IgxDirectionality } from '../../services/direction/directionality';
import { NgClass } from '@angular/common';

/**
 * @hidden
 */
@Component({
    selector: 'igx-thumb',
    templateUrl: 'thumb-slider.component.html',
    imports: [NgClass]
})
export class IgxSliderThumbComponent implements OnInit, OnDestroy {
    @Input()
    public value: any;

    @Input({ transform: booleanAttribute })
    public continuous: boolean;

    @Input()
    public thumbLabelVisibilityDuration: number;

    @Input({ transform: booleanAttribute })
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

    @Input({ transform: booleanAttribute })
    public deactiveState: boolean;

    @Input()
    public min: number;

    @Input()
    public max: number;

    @Input()
    public labels: any[];

    @Output()
    public thumbValueChange = new EventEmitter<number>();

    @Output()
    public thumbChange = new EventEmitter<any>();

    @Output()
    public thumbBlur = new EventEmitter<void>();

    @Output()
    public hoverChange = new EventEmitter<boolean>();

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @HostBinding('attr.role')
    public role = 'slider';

    @HostBinding('attr.aria-valuenow')
    public get ariaValueNow() {
        return this.value;
    }

    @HostBinding('attr.aria-valuemin')
    public get ariaValueMin() {
        return this.min;
    }

    @HostBinding('attr.aria-valuemax')
    public get ariaValueMax() {
        return this.max;
    }

    @HostBinding('attr.aria-valuetext')
    public get ariaValueText() {
        if (this.labels && this.labels[this.value] !== undefined) {
            return this.labels[this.value];
        }
        return this.value;
    }

    @HostBinding('attr.aria-label')
    public get ariaLabelAttr() {
        return `Slider thumb ${this.type}`;
    }

    @HostBinding('attr.aria-orientation')
    public ariaOrientation = 'horizontal';

    @HostBinding(`attr.aria-disabled`)
    public get ariaDisabled() {
        return this.disabled;
    }

    @HostBinding('attr.z-index')
    public zIndex = 0;

    @HostBinding('class.igx-slider-thumb-to--focused')
    public focused = false;

    @HostBinding('class.igx-slider-thumb-from')
    public get thumbFromClass() {
        return this.type === SliderHandle.FROM;
    }

    @HostBinding('class.igx-slider-thumb-to')
    public get thumbToClass() {
        return this.type === SliderHandle.TO;
    }

    @HostBinding('class.igx-slider-thumb-from--active')
    public get thumbFromActiveClass() {
        return this.type === SliderHandle.FROM && this._isActive;
    }

    @HostBinding('class.igx-slider-thumb-to--active')
    public get thumbToActiveClass() {
        return this.type === SliderHandle.TO && this._isActive;
    }

    @HostBinding('class.igx-slider-thumb-from--disabled')
    public get thumbFromDisabledClass() {
        return this.type === SliderHandle.FROM && this.disabled;
    }

    @HostBinding('class.igx-slider-thumb-to--disabled')
    public get thumbToDisabledClass() {
        return this.type === SliderHandle.TO && this.disabled;
    }

    @HostBinding('class.igx-slider-thumb-from--pressed')
    public get thumbFromPressedClass() {
        return this.type === SliderHandle.FROM && this.isActive && this._isPressed;
    }

    @HostBinding('class.igx-slider-thumb-to--pressed')
    public get thumbToPressedClass() {
        return this.type === SliderHandle.TO && this.isActive && this._isPressed;
    }

    public get getDotClass() {
        return {
            'igx-slider-thumb-from__dot': this.type === SliderHandle.FROM,
            'igx-slider-thumb-to__dot': this.type === SliderHandle.TO
        };
    }

    public isActive = false;

    public get nativeElement() {
        return this._elementRef.nativeElement;
    }

    public get destroy(): Subject<boolean> {
        return this._destroy$;
    }

    private _isActive = false;
    private _isPressed = false;
    private _destroy$ = new Subject<boolean>();

    private get thumbPositionX() {
        const thumbBounderies = this.nativeElement.getBoundingClientRect();
        const thumbCenter = (thumbBounderies.right - thumbBounderies.left) / 2;
        return thumbBounderies.left + thumbCenter;
    }

    constructor(private _elementRef: ElementRef, private _dir: IgxDirectionality) { }

    @HostListener('pointerenter')
    public onPointerEnter() {
        this.focused = false;
        this.hoverChange.emit(true);
    }

    @HostListener('pointerleave')
    public onPointerLeave() {
        this.hoverChange.emit(false);
    }

    @HostListener('keyup', ['$event'])
    public onKeyUp(event: KeyboardEvent) {
        event.stopPropagation();
        this.focused = true;
    }

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
        if (this.disabled) {
            return;
        }

        let increment = 0;
        const stepWithDir = (rtl: boolean) => rtl ? this.step * -1 : this.step;
        if (event.key.endsWith('Left')) {
            increment = stepWithDir(!this._dir.rtl);
        } else if (event.key.endsWith('Right')) {
            increment = stepWithDir(this._dir.rtl);
        } else {
            return;
        }

        this.thumbChange.emit();
        this.thumbValueChange.emit(increment);
    }

    @HostListener('blur')
    public onBlur() {
        this.isActive = false;
        this.zIndex = 0;
        this.focused = false;
        this.thumbBlur.emit();
    }

    @HostListener('focus')
    public onFocusListener() {
        this.isActive = true;
        this.zIndex = 1;
    }

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

    /**
     * Show thumb label and ripple.
     */
    public showThumbIndicators() {
        this.toggleThumbIndicators(true);
    }

    /**
     * Hide thumb label and ripple.
     */
    public hideThumbIndicators() {
        this.toggleThumbIndicators(false);
    }

    private updateThumbValue(mouseX: number) {
        const updateValue = this.calculateTrackUpdate(mouseX);
        if (this.isActive && updateValue !== 0) {
            this.thumbValueChange.emit(updateValue);
        }
    }

    private calculateTrackUpdate(mouseX: number): number {
        const scaleX = this._dir.rtl ? this.thumbPositionX - mouseX : mouseX - this.thumbPositionX;
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

        if (this.continuous || this.deactiveState) {
            this._isActive = false;
        } else {
            this._isActive = visible;
        }

    }
}
