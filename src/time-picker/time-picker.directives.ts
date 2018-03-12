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
        return this.isSelectedHour && this.itemList.isActive;
    }

    get isSelectedHour(): boolean {
        return this.timePicker.selectedHour === this.value;
    }

    constructor(@Host() public timePicker: IgxTimePickerComponent, private itemList: IgxItemListDirective) {}
}

@Directive({
    selector: "[igxMinuteItem]"
})
export class IgxMinuteItemDirective {

    @Input("igxMinuteItem")
    public value: string;

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
        return this.isSelectedMinute && this.itemList.isActive;
    }

    get isSelectedMinute(): boolean {
        return this.timePicker.selectedMinute === this.value;
    }

    constructor(@Host() public timePicker: IgxTimePickerComponent, private itemList: IgxItemListDirective) {}
}

@Directive({
    selector: "[igxAmPmItem]"
})
export class IgxAmPmItemDirective {

    @Input("igxAmPmItem")
    public value: string;

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
        return this.isSelectedAmPm && this.itemList.isActive;
    }

    get isSelectedAmPm(): boolean {
        return this.timePicker.selectedAmPm === this.value;
    }

    constructor(@Host() public timePicker: IgxTimePickerComponent, private itemList: IgxItemListDirective) {}
}

@Directive({
    selector: "[igxItemList]"
})
export class IgxItemListDirective {

    @Input("igxItemList")
    public isActive: boolean;

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor(@Host() public timePicker: IgxTimePickerComponent, private elementRef: ElementRef) {}

    @HostListener("focus")
    public onFocus() {
        this.isActive = true;
    }

    @HostListener("blur")
    public onBlur() {
        this.isActive = false;
    }
}
