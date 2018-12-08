import { CommonModule } from '@angular/common';
import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    NgModule,
    OnInit,
    Output,
    PipeTransform
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KEYS, MaskHelper } from './mask-helper';

const noop = () => { };

@Directive({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxMaskDirective, multi: true }],
    selector: '[igxMask]'
})
export class IgxMaskDirective implements OnInit, ControlValueAccessor {
    /**
     * Sets the input mask.
     * ```html
     * <input [igxMask] = "'00/00/0000'">
     * ```
     * @memberof IgxMaskDirective
     */
    @Input('igxMask')
    public mask: string;

    /**
     * Sets the character representing a fillable spot in the input mask.
     * Default value is "'_'".
     * ```html
     * <input [promptChar] = "'/'">
     * ```
     * @memberof IgxMaskDirective
     */
    @Input()
    public promptChar: string;

    /**
     * Specifies if the bound value includes the formatting symbols.
     * ```html
     * <input [includeLiterals] = "true">
     * ```
     * @memberof IgxMaskDirective
     */
    @Input()
    public includeLiterals: boolean;

    /**
     * Specifies a placeholder.
     * ```html
     * <input placeholder = "enter text...">
     * ```
     * @memberof IgxMaskDirective
     */
    @Input()
    public placeholder: string;

    /**
     * Specifies a pipe to be used on blur.
     * ```html
     * <input [displayValuePipe] = "displayFormatPipe">
     * ```
     * @memberof IgxMaskDirective
     */
    @Input()
    public displayValuePipe: PipeTransform;

    /**
     * Specifies a pipe to be used on focus.
     * ```html
     * <input [focusedValuePipe] = "inputFormatPipe">
     * ```
     * @memberof IgxMaskDirective
     */
    @Input()
    public focusedValuePipe: PipeTransform;

    /**
     *@hidden
     */
    @Input()
    private dataValue: string;

    /**
     * Emits an event each time the value changes.
     * Provides `rawValue: string` and `formattedValue: string` as event arguments.
     * ```html
     * <input (onValueChange) = "onValueChange(rawValue: string, formattedValue: string)">
     * ```
     */
    @Output()
    public onValueChange = new EventEmitter<IMaskEventArgs>();

    /**
     *@hidden
     */
    private get value() {
        return this.nativeElement.value;
    }

    /**
     *@hidden
     */
    private set value(val) {
        this.nativeElement.value = val;
    }

    /**
     *@hidden
     */
    private get nativeElement() {
        return this.elementRef.nativeElement;
    }

    /**
     *@hidden
     */
    private get selectionStart() {
        return this.nativeElement.selectionStart;
    }

    /**
     *@hidden
     */
    private get selectionEnd() {
        return this.nativeElement.selectionEnd;
    }

    /**
     *@hidden
     */
    private _ctrlDown: boolean;

    /**
     *@hidden
     */
    private _paste: boolean;

    /**
     *@hidden
     */
    private _selection: number;

    /**
     *@hidden
     */
    private _maskOptions = {
        format: '',
        promptChar: ''
    };

    /**
     *@hidden
     */
    private _key;

    /**
     *@hidden
     */
    private _cursorOnPaste;

    /**
     *@hidden
     */
    private _valOnPaste;

    /**
     *@hidden
     */
    private maskHelper: MaskHelper;

    /**
     *@hidden
     */
    private _onTouchedCallback: () => void = noop;

    /**
     *@hidden
     */
    private _onChangeCallback: (_: any) => void = noop;

    constructor(private elementRef: ElementRef) {
        this.maskHelper = new MaskHelper();
    }

    /**
     *@hidden
     */
    public ngOnInit(): void {
        if (this.promptChar && this.promptChar.length > 1) {
            this._maskOptions.promptChar = this.promptChar = this.promptChar.substring(0, 1);
        }

        this._maskOptions.format = this.mask ? this.mask : 'CCCCCCCCCC';
        this._maskOptions.promptChar = this.promptChar ? this.promptChar : '_';
        this.nativeElement.setAttribute('placeholder', this.placeholder ? this.placeholder : this._maskOptions.format);
    }

    /**
     *@hidden
     */
    @HostListener('keydown', ['$event'])
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

    /**
     *@hidden
     */
    @HostListener('keyup', ['$event'])
    public onKeyup(event): void {
        const key = event.keyCode || event.charCode;

        if (key === KEYS.Ctrl) {
            this._ctrlDown = false;
        }
    }

    /**
     *@hidden
     */
    @HostListener('paste', ['$event'])
    public onPaste(event): void {
        this._paste = true;

        this._valOnPaste = this.value;
        this._cursorOnPaste = this.getCursorPosition();
    }

    /**
     *@hidden
     */
    @HostListener('input', ['$event'])
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

            this.value = this._selection && this._selection !== 0 ?
                this.maskHelper.parseValueByMaskUponSelection(this.value, this._maskOptions, currentCursorPos - 1, this._selection) :
                this.maskHelper.parseValueByMask(this.value, this._maskOptions, currentCursorPos - 1);

            this.setCursorPosition(this.maskHelper.cursor);
        }

        const rawVal = this.maskHelper.restoreValueFromMask(this.value, this._maskOptions);

        this.dataValue = this.includeLiterals ? this.value : rawVal;
        this._onChangeCallback(this.dataValue);

        this.onValueChange.emit({ rawValue: rawVal, formattedValue: this.value });
    }

    /**
     *@hidden
     */
    @HostListener('focus', ['$event.target.value'])
    public onFocus(value) {
        if (this.focusedValuePipe) {
            this.value = this.focusedValuePipe.transform(value);
        } else {
            this.value = this.maskHelper.parseValueByMaskOnInit(this.value, this._maskOptions);
        }
    }

    /**
     *@hidden
     */
    @HostListener('blur', ['$event.target.value'])
    public onBlur(value) {
        if (this.displayValuePipe) {
            this.value = this.displayValuePipe.transform(value);
        } else if (value === this.maskHelper.parseMask(this._maskOptions)) {
            this.value = '';
        }
    }

    /**
     *@hidden
     */
    private getCursorPosition(): number {
        return this.nativeElement.selectionStart;
    }

    /**
     *@hidden
     */
    private setCursorPosition(start: number, end: number = start): void {
        this.nativeElement.setSelectionRange(start, end);
    }

    /**
     *@hidden
     */
    public writeValue(value) {
        if (this.promptChar && this.promptChar.length > 1) {
            this._maskOptions.promptChar = this.promptChar.substring(0, 1);
        }

        if (value) {
            this.value = this.maskHelper.parseValueByMaskOnInit(value, this._maskOptions);
        }

        this.dataValue = this.includeLiterals ? this.value : value;
        this._onChangeCallback(this.dataValue);

        this.onValueChange.emit({ rawValue: value, formattedValue: this.value });
    }

    /**
     *@hidden
     */
    public registerOnChange(fn: (_: any) => void) { this._onChangeCallback = fn; }

    /**
     *@hidden
     */
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }
}

/**
 * The IgxMaskModule provides the {@link IgxMaskDirective} inside your application.
 */
export interface IMaskEventArgs {
    rawValue: string;
    formattedValue: string;
}
@NgModule({
    declarations: [IgxMaskDirective],
    exports: [IgxMaskDirective],
    imports: [CommonModule]
})
export class IgxMaskModule { }
