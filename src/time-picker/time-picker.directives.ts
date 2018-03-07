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

    @HostBinding("class.igx-time-picker__hourList--1")
    get default0CSS(): boolean {
        var index = this.timePicker.hourItems.indexOf(this.value);
        var selectedHourIndex = this.timePicker.hourItems.indexOf(this.timePicker.selectedHour);
        return !this.isSelectedHour && (index + 1 === selectedHourIndex || index - 1 === selectedHourIndex);
    }

    @HostBinding("class.igx-time-picker__hourList--2")
    get default1CSS(): boolean {
        var index = this.timePicker.hourItems.indexOf(this.value);
        var selectedHourIndex = this.timePicker.hourItems.indexOf(this.timePicker.selectedHour);
        return !this.isSelectedHour && (index + 2 === selectedHourIndex || index - 2 === selectedHourIndex);
    }

    @HostBinding("class.igx-time-picker__hourList--3")
    get default2CSS(): boolean {
        var index = this.timePicker.hourItems.indexOf(this.value);
        var selectedHourIndex = this.timePicker.hourItems.indexOf(this.timePicker.selectedHour);
        return !this.isSelectedHour && (index + 3 === selectedHourIndex || index - 3 === selectedHourIndex);
    }

    @HostBinding("class.igx-time-picker__hourList--selected")
    get selectedCSS(): boolean {
        return this.isSelectedHour;
    }

    @HostBinding("class.igx-time-picker__hourList--active")
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

    @HostBinding("class.igx-time-picker__minuteList--1")
    get default0CSS(): boolean {
        var index = this.timePicker.minuteItems.indexOf(this.value);
        var selectedMinuteIndex = this.timePicker.minuteItems.indexOf(this.timePicker.selectedMinute);
        return !this.isSelectedMinute && (index + 1 === selectedMinuteIndex || index - 1 === selectedMinuteIndex);
    }

    @HostBinding("class.igx-time-picker__minuteList--2")
    get default1CSS(): boolean {
        var index = this.timePicker.minuteItems.indexOf(this.value);
        var selectedMinuteIndex = this.timePicker.minuteItems.indexOf(this.timePicker.selectedMinute);
        return !this.isSelectedMinute && (index + 2 === selectedMinuteIndex || index - 2 === selectedMinuteIndex);
    }

    @HostBinding("class.igx-time-picker__minuteList--3")
    get default2CSS(): boolean {
        var index = this.timePicker.minuteItems.indexOf(this.value);
        var selectedMinuteIndex = this.timePicker.minuteItems.indexOf(this.timePicker.selectedMinute);
        return !this.isSelectedMinute && (index + 3 === selectedMinuteIndex || index - 3 === selectedMinuteIndex);
    }

    @HostBinding("class.igx-time-picker__minuteList--selected")
    get selectedCSS(): boolean {
        return this.isSelectedMinute;
    }

    @HostBinding("class.igx-time-picker__minuteList--active")
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

    @HostBinding("class.igx-time-picker__ampm")
    get default0CSS(): boolean {
        var index = this.timePicker.ampmItems.indexOf(this.value);
        var selectedAmPmIndex = this.timePicker.ampmItems.indexOf(this.timePicker.selectedAmPm);
        return !this.isSelectedAmPm && (index + 1 === selectedAmPmIndex || index - 1 === selectedAmPmIndex);
    }

    @HostBinding("class.igx-time-picker__ampmList--selected")
    get selectedCSS(): boolean {
        return this.isSelectedAmPm;
    }

    @HostBinding("class.igx-time-picker__ampmList--active")
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
