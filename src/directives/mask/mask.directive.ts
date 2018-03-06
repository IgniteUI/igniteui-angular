import {CommonModule} from "@angular/common";
import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    NgModule,
    OnInit,
    Output
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IgxMaskService } from "./mask.service";
import { KEYS } from "./maskflags";

const noop = () => { };

@Directive({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxMaskDirective, multi: true }],
    selector: "[igxMask]"
})
export class IgxMaskDirective implements OnInit, ControlValueAccessor {

    @Input("igxMask")
    public mask: string;

    @Input()
    public promptChar: string;

    @Input()
    public includeLiterals: boolean;

    @Input()
    public dataValue: string;

    @Output()
    public dataValueChange = new EventEmitter<{rowValue: string, formattedVal: string}>();

    private get value() {
        return this.nativeElement.value;
    }
    private set value(val) {
        this.nativeElement.value = val;
    }

    private get nativeElement() {
        return this.elementRef.nativeElement;
    }

    private get selectionStart() {
        return this.nativeElement.selectionStart;
    }
    private get selectionEnd() {
        return this.nativeElement.selectionEnd;
    }

    private _ctrlDown: boolean;
    private _cachedVal: string;
    private _paste: boolean;
    private _selection: number;
    private _maskOptions = {
        format: "",
        promptChar: ""
    };
    private _key;
    private _cursorOnPaste;
    private _valOnPaste;

    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    constructor(private maskHelper: IgxMaskService, private elementRef: ElementRef) {}

    public ngOnInit(): void {
        this._maskOptions.format = this.mask ? this.mask : "CCCCCCCCCC";
        this._maskOptions.promptChar = this.promptChar ? this.promptChar : "_";
    }

    @HostListener("keydown", ["$event"])
    public onKeydown(event): void {
        const key = event.keyCode || event.charCode;

        if (key === KEYS.Ctrl) {
            this._ctrlDown = true;
        }

        if ((this._ctrlDown && key === KEYS.Z) || (this._ctrlDown && key === KEYS.Y)) {
            event.preventDefault();
        }

        this._key = key;
        this._selection = Math.abs(this.selectionEnd - this.selectionStart);
    }

    @HostListener("keyup", ["$event"])
    public onKeyup(event): void {
        const key = event.keyCode || event.charCode;

        if (key === KEYS.Ctrl) {
            this._ctrlDown = false;
        }
    }

    @HostListener("paste", ["$event"])
    public onPaste(event): void {
        this._paste = true;

        this._valOnPaste = this.value;
        this._cursorOnPaste = this.getCursorPosition();
    }

    @HostListener("input", ["$event"])
    public onInputChanged(event): void {
        if (this._paste) {
            this._paste = false;

            const clipboardData = this.value.substring(this._cursorOnPaste, this.getCursorPosition());
            this.value = this.maskHelper.parseValueByMaskUponCopyPaste(
                this._valOnPaste, this._maskOptions, this._cursorOnPaste, clipboardData, this._selection);

            this.setCursorPosition(this.maskHelper.cursor);
        } else {
            const currentCursorPos = this.getCursorPosition();

            this.maskHelper.data = (this._key === KEYS.BACKSPACE) || (this._key === KEYS.DELETE);

            this.value = this._selection === 0 ? this.maskHelper.parseValueByMask(this.value, this._maskOptions, currentCursorPos - 1) :
                this.value = this.maskHelper.parseValueByMaskUponSelection
                    (this.value, this._maskOptions, currentCursorPos - 1, this._selection);

            this.setCursorPosition(this.maskHelper.cursor);
        }

        const rowVal = this.maskHelper.restoreValueFromMask(this.value, this._maskOptions);

        this.dataValue = this.includeLiterals ? this.value : rowVal;
        this._onChangeCallback(this.dataValue);

        this.dataValueChange.emit({rowValue: rowVal, formattedVal: this.value});
    }

    @HostListener("focus", ["$event"])
    public onFocus(event) {
        this.value = this.maskHelper.parseValueByMaskOnInit(this.value, this._maskOptions);
    }

    private getCursorPosition(): number {
        return this.nativeElement.selectionStart;
    }
    private setCursorPosition(start: number, end: number = start): void {
        this.nativeElement.setSelectionRange(start, end);
    }

    public writeValue(value) {
        this.value = this.maskHelper.parseValueByMaskOnInit(value, this._maskOptions);

        const rowVal = this.maskHelper.restoreValueFromMask(this.value, this._maskOptions);

        this.dataValueChange.emit({rowValue: rowVal, formattedVal: this.value});
    }

    public registerOnChange(fn: (_: any) => void) { this._onChangeCallback = fn; }
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }
}

@NgModule({
    declarations: [IgxMaskDirective],
    exports: [IgxMaskDirective],
    imports: [CommonModule],
    providers: [IgxMaskService]
})
export class IgxMaskModule {}
