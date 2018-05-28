import { ComponentFactoryResolver, ComponentRef, EventEmitter, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
import { IgxCalendarComponent, IgxCalendarHeaderTemplateDirective, IgxCalendarSubheaderTemplateDirective, WEEKDAYS } from "../calendar";
import { IgxDialogComponent } from "../dialog/dialog.component";
export declare class IgxDatePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    private resolver;
    id: string;
    formatter: (val: Date) => string;
    isDisabled: boolean;
    value: Date;
    locale: string;
    weekStart: WEEKDAYS | number;
    formatOptions: object;
    formatViews: object;
    vertical: boolean;
    todayButtonLabel: string;
    cancelButtonLabel: string;
    onOpen: EventEmitter<IgxDatePickerComponent>;
    onClose: EventEmitter<IgxDatePickerComponent>;
    onSelection: EventEmitter<Date>;
    readonly displayData: string;
    headerTemplate: IgxCalendarHeaderTemplateDirective;
    subheaderTemplate: IgxCalendarSubheaderTemplateDirective;
    container: ViewContainerRef;
    alert: IgxDialogComponent;
    calendarRef: ComponentRef<IgxCalendarComponent>;
    readonly calendar: IgxCalendarComponent;
    private _formatOptions;
    private _formatViews;
    constructor(resolver: ComponentFactoryResolver);
    writeValue(value: Date): void;
    registerOnChange(fn: (_: Date) => void): void;
    registerOnTouched(fn: () => void): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    triggerTodaySelection(): void;
    selectDate(date: Date): void;
    onOpenEvent(event: any): void;
    handleDialogCloseAction(): void;
    handleSelection(event: any): void;
    private updateCalendarInstance();
    private _focusTheDialog();
    private _setLocaleToDate(value, locale?);
    private _customFormatChecker(formatter, date);
    private _onTouchedCallback;
    private _onChangeCallback;
}
export declare class IgxDatePickerModule {
}
