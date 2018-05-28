import { ElementRef, EventEmitter, OnDestroy, OnInit } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
import { HammerGestureConfig } from "@angular/platform-browser";
export declare class TimePickerHammerConfig extends HammerGestureConfig {
    overrides: {
        pan: {
            direction: number;
            threshold: number;
        };
    };
}
export interface IgxTimePickerValueChangedEventArgs {
    oldValue: Date;
    newValue: Date;
}
export interface IgxTimePickerValidationFailedEventArgs {
    timePicker: IgxTimePickerComponent;
    currentValue: Date;
    setThroughUI: boolean;
}
export declare class IgxTimePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    private _value;
    id: string;
    value: Date;
    isDisabled: boolean;
    okButtonLabel: string;
    cancelButtonLabel: string;
    itemsDelta: {
        hours: number;
        minutes: number;
    };
    minValue: string;
    maxValue: string;
    isSpinLoop: boolean;
    vertical: boolean;
    format: string;
    onValueChanged: EventEmitter<IgxTimePickerValueChangedEventArgs>;
    onValidationFailed: EventEmitter<IgxTimePickerValidationFailedEventArgs>;
    onOpen: EventEmitter<IgxTimePickerComponent>;
    hourList: ElementRef;
    minuteList: ElementRef;
    ampmList: ElementRef;
    private _alert;
    readonly styleClass: string;
    _hourItems: any[];
    _minuteItems: any[];
    _ampmItems: any[];
    private _isHourListLoop;
    private _isMinuteListLoop;
    private _hourView;
    private _minuteView;
    private _ampmView;
    selectedHour: string;
    selectedMinute: string;
    selectedAmPm: string;
    private _prevSelectedHour;
    private _prevSelectedMinute;
    private _prevSelectedAmPm;
    readonly displayTime: string;
    readonly hourView: string[];
    readonly minuteView: string[];
    readonly ampmView: string[];
    onClick(): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    writeValue(value: Date): void;
    registerOnChange(fn: (_: Date) => void): void;
    registerOnTouched(fn: () => void): void;
    private _onTouchedCallback;
    private _onChangeCallback;
    private _scrollItemIntoView(item, items, selectedItem, isListLoop, viewType);
    private _viewToString(view, viewType);
    private _itemToString(item, viewType);
    private _prevItem(items, selectedItem, isListLoop, viewType);
    private _nextItem(items, selectedItem, isListLoop, viewType);
    private _formatTime(value, format);
    private _updateHourView(start, end);
    private _updateMinuteView(start, end);
    private _updateAmPmView(start, end);
    private _addEmptyItems(items);
    private _generateHours();
    private _generateMinutes();
    private _generateAmPm();
    private _getSelectedTime();
    private _convertMinMaxValue(value);
    private _isValueValid(value);
    scrollHourIntoView(item: string): void;
    scrollMinuteIntoView(item: string): void;
    scrollAmPmIntoView(item: string): void;
    nextHour(): void;
    prevHour(): void;
    nextMinute(): void;
    prevMinute(): void;
    nextAmPm(): void;
    prevAmPm(): void;
    okButtonClick(): boolean;
    cancelButtonClick(): void;
    hoursInView(): string[];
    minutesInView(): string[];
    ampmInView(): string[];
}
export declare class IgxTimePickerModule {
}
