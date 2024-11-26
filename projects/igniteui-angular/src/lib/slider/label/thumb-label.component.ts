import { Component, Input, TemplateRef, HostBinding, ElementRef, booleanAttribute } from '@angular/core';
import { SliderHandle } from '../slider.common';
import { IgxSliderThumbComponent } from '../thumb/thumb-slider.component';
import { NgClass, NgTemplateOutlet } from '@angular/common';

/**
 * @hidden
 */
@Component({
    selector: 'igx-thumb-label',
    templateUrl: 'thumb-label.component.html',
    imports: [NgClass, NgTemplateOutlet]
})
export class IgxThumbLabelComponent {
    @Input()
    public value: any;

    @Input()
    public templateRef: TemplateRef<any>;

    @Input()
    public context: any;

    @Input()
    public type: SliderHandle;

    @Input({ transform: booleanAttribute })
    public continuous: boolean;

    @Input({ transform: booleanAttribute })
    public deactiveState: boolean;

    @Input()
    public thumb: IgxSliderThumbComponent;


    @HostBinding('class.igx-slider-thumb-label-from')
    public get thumbFromClass() {
        return this.type === SliderHandle.FROM;
    }

    @HostBinding('class.igx-slider-thumb-label-to')
    public get thumbToClass() {
        return this.type === SliderHandle.TO;
    }

    @HostBinding('class.igx-slider-thumb-label-from--active')
    public get thumbFromActiveClass() {
        return this.type === SliderHandle.FROM && this.active;
    }

    @HostBinding('class.igx-slider-thumb-label-to--active')
    public get thumbToActiveClass() {
        return this.type === SliderHandle.TO && this.active;
    }

    @HostBinding('class.igx-slider-thumb-label-from--pressed')
    public get labelFromPressedClass() {
        return this.thumb?.thumbFromPressedClass;
    }

    @HostBinding('class.igx-slider-thumb-label-to--pressed')
    public get labelToPressedClass() {
        return this.thumb?.thumbToPressedClass;
    }

    public get getLabelClass() {
        return {
            'igx-slider-thumb-label-from__container': this.type === SliderHandle.FROM,
            'igx-slider-thumb-label-to__container': this.type === SliderHandle.TO
        };
    }

    private _active: boolean;

    constructor(private _elementRef: ElementRef) { }

    public get nativeElement() {
        return this._elementRef.nativeElement;
    }

    public get active() {
        return this._active;
    }

    public set active(val: boolean) {
        if (this.continuous || this.deactiveState) {
            this._active = false;
        } else {
            this._active = val;
        }
    }
}
