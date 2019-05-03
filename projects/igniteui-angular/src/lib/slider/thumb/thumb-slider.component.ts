import {
    NgModule,
    Component,
    Input,
    HostListener,
    ElementRef,
    ViewEncapsulation,
    HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';


enum SliderHandle {
    FROM,
    TO
}

export interface IRangeSliderValue {
    lower: number;
    upper: number;
}

export interface ISliderValueChangeEventArgs {
    oldValue: number | IRangeSliderValue;
    value: number | IRangeSliderValue;
}

@Component({
    selector: 'igx-thumb',
    templateUrl: 'thumb-slider.component.html'
})
export class IgxSliderThumbComponent {

    private _disabled = false;
    private _timer;
    private _oldValue;
    private _isActiveLabel = false;

    public isActive = false;

    @Input()
    public value: number;

    @Input()
    public isContinuous: boolean;

    @Input()
    public thumbLabelVisibilityDuration = 750;

    @Input()
    public sliderHandle: SliderHandle;

    @Input()
    public get disabled(): boolean {
        return this._disabled;
    }

    @HostBinding('class.igx-slider__thumb-to')
    public sliderThumbToClass = true;

    @HostBinding('attr.tabindex')
    public tabindex = 1;

    @HostBinding('class.igx-slider__thumb-to--active')
    public get thumbToActiveClass() {
        return this._isActiveLabel;
    }

    public set disabled(disable: boolean) {
        this._disabled = disable;
    }

    public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor (public elementRef: ElementRef) { }

    @HostListener('keydown', ['$event'])
    public onKeyDown($event: KeyboardEvent) {
        this.showThumbsLabels();
    }

    @HostListener('keyup')
    public onKeyUp() {
        this.hideThumbsLabels();
    }

    @HostListener('blur')
    public hideThumbLabelsOnBlur() {
        // console.log('blur');
        if (this._timer !== null) {
            clearInterval(this._timer);
        }

        this._isActiveLabel = false;
        this.isActive = false;
    }

    @HostListener('focus', ['$event'])
    public onFocus($event: FocusEvent) {
        // console.log('focus');
        this.toggleThumbLabel();
    }

    public showThumbsLabels() {
        this._oldValue = this.value;

        if (this.disabled) {
            return;
        }

        if (this.isContinuous) {
            return;
        }

        if (this._timer !== null) {
            clearInterval(this._timer);
        }

        this._isActiveLabel = true;
        this.isActive = true;
    }

    private toggleThumbLabel() {
        this.showThumbsLabels();
        this.hideThumbsLabels();
    }

    private hideThumbsLabels() {
        if (this.disabled) {
            return;
        }

        if (this.isContinuous) {
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
