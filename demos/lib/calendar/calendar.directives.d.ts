import { ElementRef, EventEmitter, TemplateRef } from "@angular/core";
import { ICalendarDate } from "./calendar";
import { IgxCalendarComponent } from "./calendar.component";
export declare class IgxCalendarYearDirective {
    calendar: IgxCalendarComponent;
    value: Date;
    onYearSelection: EventEmitter<Date>;
    readonly defaultCSS: boolean;
    readonly currentCSS: boolean;
    readonly isCurrentYear: boolean;
    constructor(calendar: IgxCalendarComponent);
    onClick(): void;
}
export declare class IgxCalendarMonthDirective {
    calendar: IgxCalendarComponent;
    value: Date;
    index: any;
    onMonthSelection: EventEmitter<Date>;
    readonly defaultCSS: boolean;
    readonly currentCSS: boolean;
    readonly isCurrentMonth: boolean;
    constructor(calendar: IgxCalendarComponent);
    onClick(): void;
}
export declare class IgxCalendarDateDirective {
    calendar: IgxCalendarComponent;
    private elementRef;
    date: ICalendarDate;
    selected: boolean;
    onDateSelection: EventEmitter<ICalendarDate>;
    readonly isCurrentMonth: boolean;
    readonly isPreviousMonth: boolean;
    readonly isNextMonth: boolean;
    readonly nativeElement: any;
    readonly isInactive: boolean;
    readonly isToday: boolean;
    readonly isWeekend: boolean;
    tabindex: number;
    readonly defaultCSS: boolean;
    readonly isInactiveCSS: boolean;
    readonly isTodayCSS: boolean;
    readonly isSelectedCSS: boolean;
    readonly isWeekendCSS: boolean;
    private _selected;
    constructor(calendar: IgxCalendarComponent, elementRef: ElementRef);
    onSelect(): void;
}
export declare class IgxCalendarHeaderTemplateDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
}
export declare class IgxCalendarSubheaderTemplateDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
}
