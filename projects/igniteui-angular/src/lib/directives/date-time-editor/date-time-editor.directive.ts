import {
  Directive, Input, ElementRef, OnInit,
  Renderer2, NgModule, Output, EventEmitter, Inject, HostListener
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, } from '@angular/forms';
import { CommonModule, formatDate, DOCUMENT } from '@angular/common';
import { IgxMaskDirective } from '../mask/mask.directive';
import { MaskParsingService } from '../mask/mask-parsing.service';
import { KEYS } from '../../core/utils';
import {
  DatePickerUtil, DateState, DateTimeValue
} from '../../date-picker/date-picker.utils';
import { IgxDateTimeEditorEventArgs, DatePartInfo, DatePart } from './date-time-editor.common';

@Directive({
  selector: '[igxDateTimeEditor]',
  exportAs: 'igxDateTimeEditor',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: IgxDateTimeEditorDirective, multi: true }
  ]
})
export class IgxDateTimeEditorDirective extends IgxMaskDirective implements OnInit, ControlValueAccessor {
  @Input()
  public locale = 'en';

  @Input()
  public minValue: string | Date;

  @Input()
  public maxValue: string | Date;

  @Input()
  public isSpinLoop = true;

  @Input()
  public displayFormat: string;

  public get inputFormat(): string {
    return this._format;
  }

  @Input(`igxDateTimeEditor`)
  public set inputFormat(value: string) {
    if (value) {
      this._format = value;
    }
    const mask = this.buildMask(this.inputFormat);
    this.mask = value.indexOf('tt') !== -1 ? mask.substring(0, mask.length - 2) + 'LL' : mask;
  }

  public get value() {
    return this._value;
  }

  @Input()
  public set value(value: Date) {
    this._value = value;
    this.updateMask();
  }

  @Output()
  public valueChanged = new EventEmitter<IgxDateTimeEditorEventArgs>();

  @Output()
  public validationFailed = new EventEmitter<IgxDateTimeEditorEventArgs>();

  private _value: Date;
  private _document: Document;
  private _isFocused: boolean;
  private _format = 'dd/MM/yyyy';
  private _oldValue: Date | string;
  private _dateTimeFormatParts: DatePartInfo[];
  private onTouchCallback = (...args: any[]) => { };
  private onChangeCallback = (...args: any[]) => { };

  private get literals() {
    const literals = [];
    for (const char of this.mask) {
      if (char.match(/[^0lL]/)) { literals.push(char); }
    }

    return literals;
  }

  private get emptyMask() {
    return this.maskParser.applyMask(this.inputFormat, this.maskOptions);
  }

  private get targetDatePart(): DatePart {
    if (this._document.activeElement === this.nativeElement) {
      return this._dateTimeFormatParts.find(p => p.start <= this.selectionStart && this.selectionStart <= p.end).type;
    } else {
      if (this._dateTimeFormatParts.some(p => p.type === DatePart.Date)) {
        return DatePart.Date;
      } else if (this._dateTimeFormatParts.some(p => p.type === DatePart.Hours)) {
        return DatePart.Hours;
      }
    }
  }

  constructor(
    protected elementRef: ElementRef,
    protected maskParser: MaskParsingService,
    protected renderer: Renderer2,
    @Inject(DOCUMENT) private document: any) {
    super(elementRef, maskParser, renderer);
    this._document = this.document as Document;
  }

  /** @hidden */
  public ngOnInit(): void {
    this._dateTimeFormatParts = DatePickerUtil.parseDateTimeFormat(this.inputFormat);
    this.renderer.setAttribute(this.nativeElement, 'placeholder', this.inputFormat);
    this.updateMask();
  }

  public clear(): void {
    this.updateValue(null);
    this.updateMask();
  }

  public increment(datePart?: DatePart): void {
    const newValue = datePart
      ? this.calculateValueOnSpin(datePart, 1)
      : this.calculateValueOnSpin(this.targetDatePart, 1);
    this.updateValue(newValue ? newValue : new Date());
    this.updateMask();
  }

  public decrement(datePart?: DatePart): void {
    const newValue = datePart
      ? this.calculateValueOnSpin(datePart, -1)
      : this.calculateValueOnSpin(this.targetDatePart, -1);
    this.updateValue(newValue ? newValue : new Date());
    this.updateMask();
  }

  /** @hidden */
  public writeValue(value: any): void {
    this.value = value;
  }

  /** @hidden */
  public registerOnChange(fn: any): void { this.onChangeCallback = fn; }

  /** @hidden */
  public registerOnTouched(fn: any): void { this.onTouchCallback = fn; }

  /** @hidden */
  public setDisabledState?(isDisabled: boolean): void { }

  /** @hidden */
  public onKeyDown(event: KeyboardEvent) {
    super.onKeyDown(event);
    if (event.key === KEYS.UP_ARROW || event.key === KEYS.UP_ARROW_IE ||
      event.key === KEYS.DOWN_ARROW || event.key === KEYS.DOWN_ARROW_IE) {
      this.spin(event);
      return;
    }

    if (event.ctrlKey && event.key === KEYS.SEMICOLON) {
      this.updateValue(new Date());
      this.updateMask();
    }

    this.moveCursor(event);
  }

  /** @hidden */
  public onFocus(): void {
    this._isFocused = true;
    this.onTouchCallback();
    this.updateMask();
    super.onFocus();
  }

  /** @hidden */
  public onBlur(event): void {
    this._isFocused = false;
    this.updateValue(this.value);
    this.updateMask();
    this.onTouchCallback();
    super.onBlur(event);
  }

  /** @hidden */
  public onInputChanged(): void {
    // the mask must be updated before any date operations
    super.onInputChanged();
    if (this.inputValue === this.emptyMask) {
      this.updateValue(null);
      return;
    }

    const parsedDate = this.parseDate(this.inputValue);
    if (parsedDate.state === DateState.Valid) {
      this.updateValue(parsedDate.value);
    } else {
      this.validationFailed.emit({ oldValue: this.value, newValue: parsedDate.value });
      this.updateValue(null);
    }
  }

  /** @hidden */
  public updateMask() {
    if (!this.value || !this.isValidDate(this.value)) {
      this.inputValue = this.emptyMask;
      return;
    }
    if (this._isFocused) {
      const cursor = this.selectionEnd;
      let mask = this.emptyMask;
      this._dateTimeFormatParts.forEach(p => {
        const partLength = p.end - p.start;
        let targetValue = this.getMaskedValue(p.type, partLength);

        if (p.type === DatePart.Month) {
          targetValue = this.prependValue(
            parseInt(targetValue.replace(new RegExp(this.promptChar, 'g'), '0'), 10) + 1, partLength, '0');
        }

        if (p.type === DatePart.Hours && p.format.indexOf('h') !== -1) {
          targetValue = this.prependValue(this.toTwelveHourFormat(targetValue), partLength, '0');
        }

        if (p.type === DatePart.Year && p.format.length === 2) {
          targetValue = this.prependValue(parseInt(targetValue.slice(-2), 10), partLength, '0');
        }

        mask = this.maskParser.replaceInMask(mask, targetValue, this.maskOptions, p.start, p.end).value;
      });
      this.inputValue = mask;
      this.setSelectionRange(cursor);
    } else {
      const format = this.displayFormat ? this.displayFormat : this.inputFormat;
      this.inputValue = formatDate(this.value, format.replace('tt', 'aa'), this.locale);
    }
  }

  private buildMask(format: string): string {
    return DatePickerUtil.setInputFormat(format).replace(/\w/g, '0');
  }

  private isDate(value: any): value is Date {
    return value instanceof Date && typeof value === 'object';
  }

  private valueInRange(value: Date): boolean {
    if (!value) { return false; }
    const maxValueAsDate = this.isDate(this.maxValue) ? this.maxValue : this.parseDate(this.maxValue)?.value;
    const minValueAsDate = this.isDate(this.minValue) ? this.minValue : this.parseDate(this.minValue)?.value;
    if (maxValueAsDate && minValueAsDate) {
      return value.getTime() <= maxValueAsDate.getTime() &&
        minValueAsDate.getTime() <= value.getTime();
    }

    return maxValueAsDate && value.getTime() <= maxValueAsDate.getTime() ||
      minValueAsDate && minValueAsDate.getTime() <= value.getTime();
  }

  private calculateValueOnSpin(datePart: DatePart, delta: number): Date {
    if (!this.value || !this.isValidDate(this.value)) { return null; }
    const newDate = new Date(this.value.getFullYear(), this.value.getMonth(), this.value.getDate(),
      this.value.getHours(), this.value.getMinutes(), this.value.getSeconds());
    if (this.isValidDate(this.value)) {
      switch (datePart) {
        case DatePart.Date:
          return DatePickerUtil.calculateDateOnSpin(delta, newDate, this.value, this.isSpinLoop);
        case DatePart.Month:
          return DatePickerUtil.calculateMonthOnSpin(delta, newDate, this.value, this.isSpinLoop);
        case DatePart.Year:
          return DatePickerUtil.calculateYearOnSpin(delta, newDate, this.value);
        case DatePart.Hours:
          return DatePickerUtil.calculateHoursOnSpin(delta, newDate, this.value, this.isSpinLoop);
        case DatePart.Minutes:
          return DatePickerUtil.calculateMinutesOnSpin(delta, newDate, this.value, this.isSpinLoop);
        case DatePart.Seconds:
          return DatePickerUtil.calculateSecondsOnSpin(delta, newDate, this.value, this.isSpinLoop);
        case DatePart.AmPm:
          const formatPart = this._dateTimeFormatParts.find(dp => dp.type === DatePart.AmPm);
          const amPmFromMask = this.inputValue.substring(formatPart.start, formatPart.end);
          return DatePickerUtil.calculateAmPmOnSpin(newDate, this.value, amPmFromMask);
      }
    }

    return this.value;
  }

  private updateValue(newDate: Date) {
    this._oldValue = this.value;
    this.value = newDate;
    if (this.minValue || this.maxValue) {
      if (this.valueInRange(this.value)) {
        this.onChangeCallback(this.value);
      } else {
        this.onChangeCallback(null);
        this.validationFailed.emit({ oldValue: this._oldValue, newValue: this.value });
      }
    } else {
      this.onChangeCallback(this.value);
    }
    if (this.inputIsComplete()) {
      this.valueChanged.emit({ oldValue: this._oldValue, newValue: this.value });
    }
  }

  private toTwelveHourFormat(value: string): number {
    let hour = parseInt(value.replace(new RegExp(this.promptChar, 'g'), '0'), 10);
    if (hour > 12) {
      hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }

    return hour;
  }

  private getMaskedValue(datePart: DatePart, partLength: number): string {
    let maskedValue;
    switch (datePart) {
      case DatePart.Date:
        maskedValue = this.value.getDate();
        break;
      case DatePart.Month:
        maskedValue = this.value.getMonth();
        break;
      case DatePart.Year:
        maskedValue = this.value.getFullYear();
        break;
      case DatePart.Hours:
        maskedValue = this.value.getHours();
        break;
      case DatePart.Minutes:
        maskedValue = this.value.getMinutes();
        break;
      case DatePart.Seconds:
        maskedValue = this.value.getSeconds();
        break;
      case DatePart.AmPm:
        maskedValue = this.value.getHours() >= 12 ? 'PM' : 'AM';
        break;
    }

    if (datePart !== DatePart.AmPm) {
      return this.prependValue(maskedValue, partLength, '0');
    }

    return maskedValue;
  }

  private prependValue(value: number, partLength: number, prependChar: string): string {
    return (prependChar + value.toString()).slice(-partLength);
  }

  private spin(event: KeyboardEvent): void {
    event.preventDefault();
    switch (event.key) {
      case KEYS.UP_ARROW:
      case KEYS.UP_ARROW_IE:
        this.increment();
        break;
      case KEYS.DOWN_ARROW:
      case KEYS.DOWN_ARROW_IE:
        this.decrement();
        break;
    }
  }

  private inputIsComplete(): boolean {
    return this.inputValue.indexOf(this.promptChar) === -1;
  }

  private isValidDate(date: Date): boolean {
    return date && date.getTime && !isNaN(date.getTime());
  }

  private parseDate(val: string): DateTimeValue {
    if (!val) { return null; }
    return DatePickerUtil.parseDateTimeArray(this._dateTimeFormatParts, val);
  }

  private moveCursor(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value;
    switch (event.key) {
      case KEYS.LEFT_ARROW:
      case KEYS.LEFT_ARROW_IE:
        if (event.ctrlKey) {
          event.preventDefault();
          this.setSelectionRange(this.getNewPosition(value));
        }
        break;
      case KEYS.RIGHT_ARROW:
      case KEYS.RIGHT_ARROW_IE:
        if (event.ctrlKey) {
          event.preventDefault();
          this.setSelectionRange(this.getNewPosition(value, 1));
        }
        break;
    }
  }

  /**
   * Move the cursor in a specific direction until it reaches a date/time separator.
   * Then return its index.
   *
   * @param value The string it operates on.
   * @param direction 0 is left, 1 is right. Default is 0.
   */
  private getNewPosition(value: string, direction = 0): number {
    let cursorPos = this.selectionStart;
    if (!direction) {
      do {
        cursorPos = cursorPos > 0 ? --cursorPos : cursorPos;
      } while (!this.literals.includes(value[cursorPos - 1]) && cursorPos > 0);
      return cursorPos;
    } else {
      do {
        cursorPos++;
      } while (!this.literals.includes(value[cursorPos]) && cursorPos < value.length);
      return cursorPos;
    }
  }
}

@NgModule({
  declarations: [IgxDateTimeEditorDirective],
  exports: [IgxDateTimeEditorDirective],
  imports: [CommonModule]
})
export class IgxDateTimeEditorModule { }
