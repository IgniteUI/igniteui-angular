import { ElementRef, EventEmitter, OnInit } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
export declare class IgxMaskDirective implements OnInit, ControlValueAccessor {
    private elementRef;
    mask: string;
    promptChar: string;
    includeLiterals: boolean;
    private dataValue;
    onValueChange: EventEmitter<{
        rawValue: string;
        formattedValue: string;
    }>;
    private value;
    private readonly nativeElement;
    private readonly selectionStart;
    private readonly selectionEnd;
    private _ctrlDown;
    private _cachedVal;
    private _paste;
    private _selection;
    private _maskOptions;
    private _key;
    private _cursorOnPaste;
    private _valOnPaste;
    private maskHelper;
    private _onTouchedCallback;
    private _onChangeCallback;
    constructor(elementRef: ElementRef);
    ngOnInit(): void;
    onKeydown(event: any): void;
    onKeyup(event: any): void;
    onPaste(event: any): void;
    onInputChanged(event: any): void;
    onFocus(event: any): void;
    private getCursorPosition();
    private setCursorPosition(start, end?);
    writeValue(value: any): void;
    registerOnChange(fn: (_: any) => void): void;
    registerOnTouched(fn: () => void): void;
}
export declare class IgxMaskModule {
}
