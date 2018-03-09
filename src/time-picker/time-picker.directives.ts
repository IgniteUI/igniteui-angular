/**
 * This file contains all the directives used by the @link IgxTimePickerComponent.
 * You should generally not use them directly.
 * @preferred
 */
import {
    Directive,
    ElementRef,
    EventEmitter,
    Host,
    HostBinding,
    HostListener,
    Input,
    Output,
    TemplateRef
} from "@angular/core";
import { IgxTimePickerComponent } from "./time-picker.component";

/**
 * @hidden
 */
@Directive({
    selector: "[igxHourItem]"
})
export class IgxHourItemDirective {

    @Input("igxHourItem")
    public value: string;

    private index;

    @Output()
    public onHourSelection = new EventEmitter<string>();

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    @HostBinding("class.igx-time-picker__item")
    get defaultCSS(): boolean {
        return true;
    }

    @HostBinding("class.igx-time-picker__item--selected")
    get selectedCSS(): boolean {
        return this.isSelectedHour;
    }

    @HostBinding("class.igx-time-picker__item--active")
    get activeCSS(): boolean {
        return this.isSelectedHour && document.activeElement === this.nativeElement.parentElement;
    }

    get isSelectedHour(): boolean {
        return this.timePicker.selectedHour === this.value;
    }

    constructor(@Host() public timePicker: IgxTimePickerComponent, private elementRef: ElementRef) {}

    @HostListener("click")
    public onClick() {
        this.onHourSelection.emit(this.value);
    }
}

@Directive({
    selector: "[igxMinuteItem]"
})
export class IgxMinuteItemDirective {

    @Input("igxMinuteItem")
    public value: string;

    @Output()
    public onMinuteSelection = new EventEmitter<string>();

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    @HostBinding("class.igx-time-picker__item")
    get defaultCSS(): boolean {
        return true;
    }

    @HostBinding("class.igx-time-picker__item--selected")
    get selectedCSS(): boolean {
        return this.isSelectedMinute;
    }

    @HostBinding("class.igx-time-picker__item--active")
    get activeCSS(): boolean {
        return this.isSelectedMinute && document.activeElement === this.nativeElement.parentElement;
    }

    get isSelectedMinute(): boolean {
        return this.timePicker.selectedMinute === this.value;
    }

    constructor(@Host() public timePicker: IgxTimePickerComponent, private elementRef: ElementRef) {}

    @HostListener("click")
    public onClick() {
        this.onMinuteSelection.emit(this.value);
    }
}

@Directive({
    selector: "[igxAmPmItem]"
})
export class IgxAmPmItemDirective {

    @Input("igxAmPmItem")
    public value: string;

    @Output()
    public onAmPmSelection = new EventEmitter<string>();

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    @HostBinding("class.igx-time-picker__item")
    get defaultCSS(): boolean {
        return true;
    }

    @HostBinding("class.igx-time-picker__item--selected")
    get selectedCSS(): boolean {
        return this.isSelectedAmPm;
    }

    @HostBinding("class.igx-time-picker__item--active")
    get activeCSS(): boolean {
        return this.isSelectedAmPm && document.activeElement === this.nativeElement.parentElement;
    }

    get isSelectedAmPm(): boolean {
        return this.timePicker.selectedAmPm === this.value;
    }

    constructor(@Host() public timePicker: IgxTimePickerComponent, private elementRef: ElementRef) {}

    @HostListener("click")
    public onClick() {
        this.onAmPmSelection.emit(this.value);
    }
}
