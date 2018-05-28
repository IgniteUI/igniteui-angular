import { ElementRef } from "@angular/core";
import { IgxTimePickerComponent } from "./time-picker.component";
export declare class IgxItemListDirective {
    timePicker: IgxTimePickerComponent;
    private elementRef;
    type: string;
    isActive: boolean;
    constructor(timePicker: IgxTimePickerComponent, elementRef: ElementRef);
    tabindex: number;
    readonly defaultCSS: boolean;
    readonly hourCSS: boolean;
    readonly minuteCSS: boolean;
    readonly ampmCSS: boolean;
    onFocus(): void;
    onBlur(): void;
    private nextItem();
    private prevItem();
    onKeydownArrowDown(event: KeyboardEvent): void;
    onKeydownArrowUp(event: KeyboardEvent): void;
    onKeydownArrowRight(event: KeyboardEvent): void;
    onKeydownArrowLeft(event: KeyboardEvent): void;
    onKeydownEnter(event: KeyboardEvent): void;
    onKeydownEscape(event: KeyboardEvent): void;
    onHover(): void;
    onScroll(event: any): void;
    onPanMove(event: any): void;
}
export declare class IgxHourItemDirective {
    timePicker: IgxTimePickerComponent;
    private itemList;
    value: string;
    readonly defaultCSS: boolean;
    readonly selectedCSS: boolean;
    readonly activeCSS: boolean;
    readonly isSelectedHour: boolean;
    constructor(timePicker: IgxTimePickerComponent, itemList: IgxItemListDirective);
    onClick(item: any): void;
}
export declare class IgxMinuteItemDirective {
    timePicker: IgxTimePickerComponent;
    private itemList;
    value: string;
    readonly defaultCSS: boolean;
    readonly selectedCSS: boolean;
    readonly activeCSS: boolean;
    readonly isSelectedMinute: boolean;
    constructor(timePicker: IgxTimePickerComponent, itemList: IgxItemListDirective);
    onClick(item: any): void;
}
export declare class IgxAmPmItemDirective {
    timePicker: IgxTimePickerComponent;
    private itemList;
    value: string;
    readonly defaultCSS: boolean;
    readonly selectedCSS: boolean;
    readonly activeCSS: boolean;
    readonly isSelectedAmPm: boolean;
    constructor(timePicker: IgxTimePickerComponent, itemList: IgxItemListDirective);
    onClick(item: any): void;
}
