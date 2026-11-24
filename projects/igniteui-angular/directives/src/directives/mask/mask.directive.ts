import { Directive, ElementRef, EventEmitter, HostListener, Output, PipeTransform, Renderer2, Input, OnInit, AfterViewChecked, booleanAttribute, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MaskParsingService, MaskOptions, parseMask } from './mask-parsing.service';
import { MaskEditKind, MaskHistory, MaskHistoryState } from './mask-history';
import { IBaseEventArgs, PlatformUtil } from 'igniteui-angular/core';
import { noop } from 'rxjs';

/** The keys that move the caret or change the selection without editing the text. */
const NAVIGATION_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']);

/** The input types that are always a history step of their own, whichever key started them. */
const ATOMIC_INPUT_TYPES = new Set(['deleteByCut', 'deleteByDrag']);

@Directive({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxMaskDirective, multi: true }],
    selector: '[igxMask]',
    exportAs: 'igxMask',
    standalone: true
})
export class IgxMaskDirective implements OnInit, AfterViewChecked, ControlValueAccessor {
    protected elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
    protected maskParser = inject(MaskParsingService);
    protected renderer = inject(Renderer2);
    protected platform = inject(PlatformUtil);

    /**
     * Sets the input mask.
     * ```html
     * <input [igxMask] = "'00/00/0000'">
     * ```
     */
    @Input('igxMask')
    public get mask(): string {
        return this._mask || this.defaultMask;
    }

    public set mask(val: string) {
        // B.P. 9th June 2021 #7490
        if (val !== this._mask) {
            const cleanInputValue = this.maskParser.parseValueFromMask(this.inputValue, this.maskOptions);
            this.setPlaceholder(val);
            this._mask = val;
            this.updateInputValue(cleanInputValue);
            this.history.clear();
        }
    }

    /**
     * Sets the character representing a fillable spot in the input mask.
     * Default value is "'_'".
     * ```html
     * <input [promptChar] = "'/'">
     * ```
     */
    @Input()
    public promptChar = '_';

    /**
     * Specifies if the bound value includes the formatting symbols.
     * ```html
     * <input [includeLiterals] = "true">
     * ```
     */
    @Input({ transform: booleanAttribute })
    public includeLiterals!: boolean;

    /**
     * Specifies a pipe to be used on blur.
     * ```html
     * <input [displayValuePipe] = "displayFormatPipe">
     * ```
     */
    @Input()
    public displayValuePipe?: PipeTransform;

    /**
     * Specifies a pipe to be used on focus.
     * ```html
     * <input [focusedValuePipe] = "inputFormatPipe">
     * ```
     */
    @Input()
    public focusedValuePipe!: PipeTransform;

    /**
     * Emits an event each time the value changes.
     * Provides `rawValue: string` and `formattedValue: string` as event arguments.
     * ```html
     * <input (valueChanged) = "valueChanged(rawValue: string, formattedValue: string)">
     * ```
     */
    @Output()
    public valueChanged = new EventEmitter<IMaskEventArgs>();

    /** @hidden */
    public get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    /** @hidden @internal; */
    protected get inputValue(): string {
        return this.nativeElement.value;
    }

    /** @hidden @internal */
    protected set inputValue(val: string) {
        this.nativeElement.value = val;
    }

    /** @hidden */
    protected get maskOptions(): MaskOptions {
        const format = this.mask || this.defaultMask;
        const promptChar = this.promptChar && this.promptChar.substring(0, 1);
        return { format, promptChar };
    }

    /** @hidden */
    protected get selectionStart(): number {
        // Edge(classic) and FF don't select text on drop
        return this.nativeElement.selectionStart === this.nativeElement.selectionEnd && this._hasDropAction ?
            this.nativeElement.selectionEnd! - this._droppedData.length :
            this.nativeElement.selectionStart!;
    }

    /** @hidden */
    protected get selectionEnd(): number {
        return this.nativeElement.selectionEnd!;
    }

    /** @hidden */
    protected get start(): number {
        return this._start;
    }

    /** @hidden */
    protected get end(): number {
        return this._end;
    }

    /**
     * The identity of the mask pattern that the history snapshots are taken against.
     *
     * @hidden @internal
     */
    protected get historySignature(): string {
        const { format, promptChar } = this.maskOptions;
        return `${format} ${promptChar}`;
    }

    /**
     * The undo and redo history. The mask writes the value of the input on each edit,
     * which clears the native undo stack, so this history replaces it.
     *
     * @hidden @internal
     */
    protected history = new MaskHistory(() => this.historySignature);

    protected _composing!: boolean;
    protected _compositionStartIndex!: number;
    protected _focused = false;
    private _compositionValue!: string;
    private _end = 0;
    private _start = 0;
    private _key!: string;
    private _mask!: string;
    private _oldText = '';
    private _dataValue = '';
    private _droppedData!: string;
    private _hasDropAction!: boolean;
    private _pasting = false;
    /** The selection before the browser applied the pending edit. `_start` and `_end` are adjusted per edit. */
    private _selectionBefore: { start: number; end: number } | null = null;
    /** The selection before a native undo or redo command that could not be canceled. */
    private _historyCommandSelection: { start: number; end: number } | null = null;
    /** The selection when an IME composition began. The composition replaces it. */
    private _compositionSelection: { start: number; end: number } | null = null;

    /**
     * The last edit, when it changed no text and so was not recorded. A subclass whose value holds more
     * than the text shows can still record it.
     *
     * @hidden @internal
     */
    protected skippedEdit: { kind: MaskEditKind; state: MaskHistoryState } | null = null;

    private readonly defaultMask = 'CCCCCCCCCC';

    protected _onTouchedCallback: () => void = noop;
    protected _onChangeCallback: (_: any) => void = noop;

    /** @hidden */
    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent): void {
        const key = event.key;
        if (!key) {
            return;
        }

        const historyAction = this.getHistoryAction(event);
        if (historyAction) {
            // The native undo stack is empty, because the mask writes the input value on each edit.
            event.preventDefault();
            // An IME composition owns the text until it is committed.
            if (!this._composing && !event.isComposing) {
                this.historyStep(historyAction);
            }
            return;
        }

        // The caret can come back to where it was before the next edit, which would hide that it has moved.
        if (NAVIGATION_KEYS.has(key)) {
            this.history.endRun();
        }

        this._key = key;
        this._start = this.selectionStart;
        this._end = this.selectionEnd;
        this._selectionBefore = { start: this._start, end: this._end };
        this._pasting = false;
    }

    /** @hidden @internal */
    @HostListener('pointerdown')
    public onPointerDown(): void {
        // A click moves the caret or changes the selection, so the next edit starts a new history step.
        this.history.endRun();
    }

    /** @hidden @internal */
    @HostListener('compositionstart')
    public onCompositionStart(): void {
        if (!this._composing) {
            this._compositionStartIndex = this._start;
            this._compositionSelection = {
                start: this.nativeElement.selectionStart!,
                end: this.nativeElement.selectionEnd!
            };
            this._composing = true;
        }
    }

    /** @hidden @internal */
    @HostListener('compositionend')
    public onCompositionEnd(): void {
        this._start = this._compositionStartIndex;
        const end = this.selectionEnd;
        const valueToParse = this.inputValue.substring(this._start, end);
        // The whole composition is a single undo step. Its snapshot keeps the selection that the composition
        // replaced, so that an undo restores the selected text as selected.
        this._selectionBefore = this._compositionSelection ?? { start: this._start, end: this._start };
        this._compositionSelection = null;
        this.updateInput(valueToParse, 'atomic');
        this._end = this.selectionEnd;
        this._compositionValue = this.inputValue;
    }

    /** @hidden @internal */
    @HostListener('input', ['$event'])
    public onInputChanged(event: InputEvent): void {
        /**
         * '!this._focused' is a fix for #8165
         * On page load IE triggers input events before focus events and
         * it does so for every single input on the page.
         * The mask needs to be prevented from doing anything while this is happening because
         * the end user will be unable to blur the input.
         * https://stackoverflow.com/questions/21406138/input-event-triggered-on-internet-explorer-when-placeholder-changed
         */

        if (this._composing) {
            if (this.inputValue.length < this._oldText.length) {
                // software keyboard input delete
                this._key = this.platform.KEYMAP.BACKSPACE;
            }
            return;
        }

        if (event.inputType === 'historyUndo' || event.inputType === 'historyRedo') {
            // Reached only where `beforeinput` cannot be canceled. The native undo stack does not match the mask,
            // so drop what the command did to the text and step the history instead.
            const selection = this._historyCommandSelection;
            this._historyCommandSelection = null;
            this.inputValue = this._oldText;
            // Writing the text moves the caret to its end. The step must see the selection as it was.
            if (selection) {
                this.setSelectionRange(selection.start, selection.end);
            }
            this.historyStep(event.inputType === 'historyUndo' ? 'undo' : 'redo');
            return;
        }

        // After the compositionend event Chromium triggers input events of type 'deleteContentBackward' and
        // we need to adjust the start and end indexes to include mask literals
        if (event.inputType === 'deleteContentBackward' && this._key !== this.platform.KEYMAP.BACKSPACE) {
            const isInputComplete = this._compositionStartIndex === 0 && this._end === this.mask.length;
            let numberOfMaskLiterals = 0;
            const literalPos = parseMask(this.maskOptions.format).literals.keys();
            for (const index of literalPos) {
                if (index >= this._compositionStartIndex && index <= this._end) {
                    numberOfMaskLiterals++;
                }
            }
            this.inputValue = isInputComplete ?
                this.inputValue.substring(0, this.selectionEnd - numberOfMaskLiterals) + this.inputValue.substring(this.selectionEnd)
                : this._compositionValue?.substring(0, this._compositionStartIndex) || this.inputValue;

            if (this._compositionValue) {
                this._start = this.selectionStart;
                this._end = this.selectionEnd;
                this.nativeElement.selectionStart = isInputComplete ? this._start - numberOfMaskLiterals : this._compositionStartIndex;
                this.nativeElement.selectionEnd = this._end - numberOfMaskLiterals;
                this.nativeElement.selectionEnd = this._end;
                this._start = this.selectionStart;
                this._end = this.selectionEnd;
            }
        }

        if (this._hasDropAction) {
            this._start = this.selectionStart;
            // A drop from outside has no selection of its own in this input.
            this._selectionBefore = { start: this._start, end: this._start };
        }

        const kind = this.getEditKind(event);
        let valueToParse = '';
        switch (this._key) {
            case this.platform.KEYMAP.DELETE:
                this._end = this._start === this._end ? ++this._end : this._end;
                break;
            case this.platform.KEYMAP.BACKSPACE:
                this._start = this.selectionStart;
                break;
            default:
                valueToParse = this.inputValue.substring(this._start, this.selectionEnd);
                break;
        }

        this.updateInput(valueToParse, kind);
    }

    /** @hidden @internal */
    @HostListener('beforeinput', ['$event'])
    public onBeforeInput(event: InputEvent): void {
        const inputType = event.inputType;
        if (inputType !== 'historyUndo' && inputType !== 'historyRedo') {
            // The selection that the edit is about to replace. An edit that comes with no `keydown`,
            // for example from a software keyboard or the context menu, has no other source for it.
            if (!this._composing) {
                this._selectionBefore = { start: this.nativeElement.selectionStart!, end: this.nativeElement.selectionEnd! };
            }
            return;
        }

        // Where the command cannot be canceled, the `input` event that follows handles it. Stepping here too
        // would move two steps for a single command. Keep the selection, which the command is about to change.
        if (!event.cancelable) {
            this._historyCommandSelection = {
                start: this.nativeElement.selectionStart!,
                end: this.nativeElement.selectionEnd!
            };
            return;
        }

        // Undo and redo from the context menu, the Edit menu or a software keyboard never reach `keydown`.
        event.preventDefault();
        if (!this._composing) {
            this.historyStep(inputType === 'historyUndo' ? 'undo' : 'redo');
        }
    }

    /** @hidden */
    @HostListener('paste')
    public onPaste(): void {
        this._oldText = this.inputValue;
        this._start = this.selectionStart;
        this._selectionBefore = { start: this._start, end: this.selectionEnd };
        this._pasting = true;
    }

    /** @hidden */
    @HostListener('focus')
    public onFocus(): void {
        if (this.nativeElement.readOnly) {
            return;
        }
        this._focused = true;
        this.showMask(this.inputValue);
        // The history survives a blur as long as the focus brings the same text back.
        this.history.resync(this.inputValue);
    }

    /** @hidden */
    @HostListener('blur', ['$event'])
    public onBlur(event: FocusEvent): void {
        const value = (event.target as HTMLInputElement).value;
        this._focused = false;
        this.showDisplayValue(value);
        this._onTouchedCallback();
    }

    /** @hidden */
    @HostListener('dragenter')
    public onDragEnter(): void {
        if (!this._focused && !this._dataValue) {
            this.showMask(this._dataValue);
        }
    }

    /** @hidden */
    @HostListener('dragleave')
    public onDragLeave(): void {
        if (!this._focused) {
            this.showDisplayValue(this.inputValue);
        }
    }

    /** @hidden */
    @HostListener('drop', ['$event'])
    public onDrop(event: DragEvent): void {
        this._hasDropAction = true;
        this._droppedData = event.dataTransfer!.getData('text');
    }

    /** @hidden */
    public ngOnInit(): void {
        this.setPlaceholder(this.maskOptions.format);
    }

    /**
     * TODO: Remove after date/time picker integration refactor
     *
     * @hidden
     */
    public ngAfterViewChecked(): void {
        if (this._composing) {
            return;
        }
        this._oldText = this.inputValue;
    }

    /** @hidden */
    public writeValue(value: string): void {
        this.history.clear();

        if (this.promptChar && this.promptChar.length > 1) {
            this.maskOptions.promptChar = this.promptChar.substring(0, 1);
        }

        this.inputValue = value ? this.maskParser.applyMask(value, this.maskOptions) : '';
        if (this.displayValuePipe) {
            this.inputValue = this.displayValuePipe.transform(this.inputValue);
        }

        this._dataValue = this.includeLiterals ? this.inputValue : value;

        this.valueChanged.emit({ rawValue: value, formattedValue: this.inputValue });
    }

    /** @hidden */
    public registerOnChange(fn: (_: any) => void): void {
        this._onChangeCallback = fn;
    }

    /** @hidden */
    public registerOnTouched(fn: () => void): void {
        this._onTouchedCallback = fn;
    }

    /** @hidden */
    protected showMask(value: string): void {
        if (this.focusedValuePipe) {
            // TODO(D.P.): focusedValuePipe should be deprecated or force-checked to match mask format
            this.inputValue = this.focusedValuePipe.transform(value);
        } else {
            this.inputValue = this.maskParser.applyMask(value, this.maskOptions);
        }

        this._oldText = this.inputValue;
    }

    /** @hidden */
    protected setSelectionRange(start: number, end: number = start): void {
        this.nativeElement.setSelectionRange(start, end);
    }

    /** @hidden */
    protected afterInput(): void {
        this._oldText = this.inputValue;
        this._hasDropAction = false;
        this._start = 0;
        this._end = 0;
        this._key = null!;
        this._composing = false;
        this._pasting = false;
        this._selectionBefore = null;
    }

    /**
     * Captures a history snapshot of the given text and selection.
     * Override it to attach data that the text alone cannot restore.
     *
     * @hidden @internal
     */
    protected createHistoryState(value: string, start: number, end: number): MaskHistoryState {
        return { value, start, end };
    }

    /**
     * Puts a history snapshot back in the input, updates the bound value and emits `valueChanged`.
     *
     * @hidden @internal
     */
    protected restoreHistoryState(state: MaskHistoryState): void {
        this.inputValue = state.value;
        this.setSelectionRange(state.start, state.end);
        this.settleHistory(state.start);
        this.emitValue();
        this.afterInput();
    }

    /**
     * Reports the text and the caret that an edit settled on to the history.
     * Call it again when the text is rewritten after the edit.
     *
     * @hidden @internal
     */
    protected settleHistory(caret = this.selectionEnd): void {
        this.history.settle(this.inputValue, caret);
    }

    /**
     * Restores the neighboring history step in the given direction.
     *
     * @hidden @internal
     */
    protected historyStep(direction: 'undo' | 'redo'): void {
        if (this.nativeElement.readOnly) {
            return;
        }

        const current = this.createHistoryState(this.inputValue, this.selectionStart, this.selectionEnd);
        const state = direction === 'undo' ? this.history.undo(current) : this.history.redo(current);

        if (state) {
            this.restoreHistoryState(state);
        }
    }

    /** @hidden */
    protected setPlaceholder(value: string): void {
        const placeholder = this.nativeElement.placeholder;
        if (!placeholder || placeholder === this.mask) {
            this.renderer.setAttribute(this.nativeElement, 'placeholder', parseMask(value ?? '').mask || this.defaultMask);
        }
    }

    private updateInputValue(value: string) {
        if (this._focused) {
            this.showMask(value);
        } else if (!this.displayValuePipe) {
            this.inputValue = this.inputValue ? this.maskParser.applyMask(value, this.maskOptions) : '';
        }
    }

    private updateInput(valueToParse: string, kind: MaskEditKind = 'atomic') {
        const replacedData = this.maskParser.replaceInMask(this._oldText, valueToParse, this.maskOptions, this._start, this._end);

        // Only an edit that the mask accepts is a history step. The snapshot is the state that the edit overwrites.
        const { start, end } = this._selectionBefore ?? { start: this._start, end: Math.max(this._start, this._end) };
        const before = this.createHistoryState(this._oldText, start, end);
        if (replacedData.value !== this._oldText) {
            this.history.record(kind, before);
            this.skippedEdit = null;
        } else {
            this.history.pass(kind, before);
            this.skippedEdit = { kind, state: before };
        }

        this.inputValue = replacedData.value;
        if (this._key === this.platform.KEYMAP.BACKSPACE) {
            replacedData.end = this._start;
        }

        this.setSelectionRange(replacedData.end);
        // Settle even when the text is the same: a delete over a literal only moves the caret.
        this.settleHistory(replacedData.end);
        this.emitValue();
        this.afterInput();
    }

    private emitValue(): void {
        const rawVal = this.maskParser.parseValueFromMask(this.inputValue, this.maskOptions);
        this._dataValue = this.includeLiterals ? this.inputValue : rawVal;
        this._onChangeCallback(this._dataValue);

        this.valueChanged.emit({ rawValue: rawVal, formattedValue: this.inputValue });
    }

    private getHistoryAction(event: KeyboardEvent): 'undo' | 'redo' | null {
        // AltGr reports both `ctrlKey` and `altKey`.
        if (event.altKey || !(event.ctrlKey || event.metaKey)) {
            return null;
        }

        // With Shift the key comes in upper case.
        const key = event.key.toLowerCase();
        if (key === this.platform.KEYMAP.Z) {
            return event.shiftKey ? 'redo' : 'undo';
        }

        return key === this.platform.KEYMAP.Y && event.ctrlKey && !event.shiftKey ? 'redo' : null;
    }

    private getEditKind(event: InputEvent): MaskEditKind {
        // A cut can come from a key that deletes otherwise, such as Shift + Delete.
        if (this._pasting || this._hasDropAction || ATOMIC_INPUT_TYPES.has(event.inputType)) {
            return 'atomic';
        }

        switch (this._key) {
            case this.platform.KEYMAP.BACKSPACE:
                return 'delete-backward';
            case this.platform.KEYMAP.DELETE:
                return 'delete-forward';
        }

        // A synthetic input event carries no `inputType`. The pressed key tells a typed character then.
        const typed = event.inputType === undefined ? this._key?.length === 1 : event.inputType === 'insertText';
        return typed ? 'insert' : 'atomic';
    }

    private showDisplayValue(value: string) {
        if (this.displayValuePipe) {
            this.inputValue = this.displayValuePipe.transform(value);
        } else if (value === this.maskParser.applyMask(null!, this.maskOptions)) {
            this.inputValue = '';
        }
    }
}

/**
 * The IgxMaskModule provides the {@link IgxMaskDirective} inside your application.
 */
export interface IMaskEventArgs extends IBaseEventArgs {
    rawValue: string;
    formattedValue: string;
}
