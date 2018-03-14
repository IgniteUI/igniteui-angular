/**
 * This file contains all the directives used by the @link IgxTimePickerComponent.
 * You should generally not use them directly.
 * @preferred
 */
import {
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    Host,
    HostBinding,
    HostListener,
    Inject,
    Input,
    Output,
    TemplateRef
} from "@angular/core";
import { IgxTimePickerComponent } from "./time-picker.component";

/**
 * @hidden
 */
@Directive({
    selector: "[igxItemList]"
})
export class IgxItemListDirective {

    @Input("igxItemList")
    public isActive: boolean;

    constructor(@Host() @Inject(forwardRef(()=> IgxTimePickerComponent)) public timePicker: IgxTimePickerComponent, private elementRef: ElementRef) {}

    @HostListener("focus")
    public onFocus() {
        this.isActive = true;
    }

    @HostListener("blur")
    public onBlur() {
        this.isActive = false;
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowdown", ["$event"])
    public onKeydownArrowDown(event: KeyboardEvent) {
        event.preventDefault();

        const listName = (event.target as HTMLElement).className;

        if (listName.indexOf("hourList") !== -1) {
            this.timePicker.nextHour();
        } else if (listName.indexOf("minuteList") !== -1) {
            this.timePicker.nextMinute();
        } else if (listName.indexOf("ampmList") !== -1) {
            this.timePicker.nextAmPm();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowup", ["$event"])
    public onKeydownArrowUp(event: KeyboardEvent) {
        event.preventDefault();

        const listName = (event.target as HTMLElement).className;

        if (listName.indexOf("hourList") !== -1) {
            this.timePicker.prevHour();
        } else if (listName.indexOf("minuteList") !== -1) {
            this.timePicker.prevMinute();
        } else if (listName.indexOf("ampmList") !== -1) {
            this.timePicker.prevAmPm();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowright", ["$event"])
    public onKeydownArrowRight(event: KeyboardEvent) {
        event.preventDefault();

        const listName = (event.target as HTMLElement).className;

        if (listName.indexOf("hourList") !== -1) {
            this.timePicker.minuteList.nativeElement.focus();
        } else if (listName.indexOf("minuteList") !== -1 && this.timePicker._ampmItems.length !== 0) {
            this.timePicker.ampmList.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowleft", ["$event"])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        event.preventDefault();

        const listName = (event.target as HTMLElement).className;

        if (listName.indexOf("minuteList") !== -1) {
            this.timePicker.hourList.nativeElement.focus();
        } else if (listName.indexOf("ampmList") !== -1) {
            this.timePicker.minuteList.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.enter", ["$event"])
    public onKeydownEnter(event: KeyboardEvent) {
        event.preventDefault();

        this.timePicker.OKButtonClick();
    }

    /**
     * @hidden
     */
    @HostListener("keydown.escape", ["$event"])
    public onKeydownEscape(event: KeyboardEvent) {
        event.preventDefault();

        this.timePicker.CancelButtonClick();
    }

    /**
     * @hidden
     */
    @HostListener("mouseover")
    public onHover() {
        this.elementRef.nativeElement.focus();
    }

    /**
     * @hidden
     */
    @HostListener("wheel", ["$event"])
    public onScroll(event) {
        const listName = (event.currentTarget as HTMLElement).className;

        if (event.deltaY > 0) {
            if (listName.indexOf("hourList") !== -1) {
                this.timePicker.nextHour();
            } else if (listName.indexOf("minuteList") !== -1) {
                this.timePicker.nextMinute();
            } else if (listName.indexOf("ampmList") !== -1) {
                this.timePicker.nextAmPm();
            }
        } else if (event.deltaY < 0) {
            if (listName.indexOf("hourList") !== -1) {
                this.timePicker.prevHour();
            } else if (listName.indexOf("minuteList") !== -1) {
                this.timePicker.prevMinute();
            } else if (listName.indexOf("ampmList") !== -1) {
                this.timePicker.prevAmPm();
            }
        }
    }

    /**
     * @hidden
     */
    @HostListener("panmove", ["$event"])
    public onPanMove(event) {
        const listName = (event.target.parentElement as HTMLElement).className;

        if (event.deltaY < 0) {
            if (listName.indexOf("hourList") !== -1) {
                this.timePicker.nextHour();
            } else if (listName.indexOf("minuteList") !== -1) {
                this.timePicker.nextMinute();
            } else if (listName.indexOf("ampmList") !== -1) {
                this.timePicker.nextAmPm();
            }
        } else if (event.deltaY > 0) {
            if (listName.indexOf("hourList") !== -1) {
                this.timePicker.prevHour();
            } else if (listName.indexOf("minuteList") !== -1) {
                this.timePicker.prevMinute();
            } else if (listName.indexOf("ampmList") !== -1) {
                this.timePicker.prevAmPm();
            }
        }
    }
}

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

    constructor(@Host() @Inject(forwardRef(()=> IgxTimePickerComponent)) public timePicker: IgxTimePickerComponent, private itemList: IgxItemListDirective) {}

    @HostListener("click", ["value"])
    public onClick(item) {
        if (item !== "") {
            this.timePicker.scrollHourIntoView(item);
        }
    }
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

    constructor(@Host() @Inject(forwardRef(()=> IgxTimePickerComponent)) public timePicker: IgxTimePickerComponent, private itemList: IgxItemListDirective) {}

    @HostListener("click", ["value"])
    public onClick(item) {
        if (item !== "") {
            this.timePicker.scrollMinuteIntoView(item);
        }
    }
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

    constructor(@Host() @Inject(forwardRef(()=> IgxTimePickerComponent)) public timePicker: IgxTimePickerComponent, private itemList: IgxItemListDirective) {}

    @HostListener("click", ["value"])
    public onClick(item) {
        if (item !== "") {
            this.timePicker.scrollAmPmIntoView(item);
        }
    }
}
