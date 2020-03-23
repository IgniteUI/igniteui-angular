import {
    Component, Input, ContentChild, ViewChild,
    AfterViewInit, OnDestroy, EventEmitter, Output, ElementRef, forwardRef, ChangeDetectorRef
} from '@angular/core';
import { InteractionMode } from '../core/enums';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxCalendarComponent, WEEKDAYS } from '../calendar/index';
import { OverlaySettings, GlobalPositionStrategy, AutoPositionStrategy } from '../services/index';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KEYS, isIE, IBaseEventArgs } from '../core/utils';
import { PositionSettings } from '../services/overlay/utilities';
import { fadeIn, fadeOut } from '../animations/fade';
import { IgxDateStartComponent, IgxDateEndComponent, IgxDateSingleComponent, DateRange } from './igx-date-range-inputs.common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IToggleView } from '../core/navigation';
import { IgxSuffixDirective, IgxLabelDirective } from '../input-group';

/**
 * ** Ignite UI for Angular Range Date Picker **
 * [Documentation]()
 *
 * The Ignite UI for Angular Range Date Picker provides the ability to select a range of dates from the calendar UI.
 * It displays the range selection in a single or two input fields.
 *
 * Example:
 * ```html
 * <igx-date-range>
 *  <input igxDateRangeStart>
 *  <input igxDateRangeEnd>
 * </igx-date-range>
 * ```
 */
@Component({
    selector: 'igx-date-range',
    templateUrl: './igx-date-range.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => IgxDateRangeComponent), multi: true }]
})
export class IgxDateRangeComponent implements IToggleView, AfterViewInit, OnDestroy, ControlValueAccessor {
    /**
     * Property which sets whether `IgxDateRangeComponent` is in dialog or dropdown mode.
     *
     * ```html
     * <igx-date-range [mode]="'dropdown'"></igx-date-range
     * ```
     */
    @Input()
    public mode = InteractionMode.Dialog;

    /**
     * Property which sets the number displayed month views.
     * Default is `2`.
     *
     * ```html
     * <igx-date-range [monthsViewNumber]="3"></igx-date-range>
     * ```
     */
    @Input()
    public monthsViewNumber = 2;

    /**
     * Property which sets the whether dates that are not part of the current month will be displayed.
     * Default value is `false`.
     */
    @Input()
    public hideOutsideDays: boolean;

    /**
     * Property which sets the start day of the week.
     * Can be assigned to a numeric value or to `WEEKDAYS` enum value.
     *
     * ```html
     * <igx-date-range [weekStart]="1"></igx-date-range>
     * ```
     */
    @Input()
    public weekStart = WEEKDAYS.SUNDAY;

    /**
     * Property which gets the `locale` of the calendar.
     * Default value is `"en"`.
     *
     * ```html
     * <igx-date-range [locale]="'jp'"></igx-date-range>
     * ```
     */
    @Input()
    public locale = 'en';

    /**
     * Property that applies a custom formatter function on the selected or passed date.
     *
     * ```typescript
     * private dayFormatter = new Intl.DateTimeFormat("en", { weekday: "long" });
     * private monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });
     *
     * public formatter(date: Date): string {
     *  return `${this.dayFormatter.format(date)} - ${this.monthFormatter.format(date)} - ${date.getFullYear()}`;
     * }
     * ```
     *
     * ```html
     * <igx-date-range [formatter]="formatter"></igx-date-range>
     * ```
     */
    @Input()
    public formatter: (val: DateRange) => string;

    /**
     * Property that changes the default text of the `today` button.
     * Default value is `Today`.
     *
     * ```html
     * <igx-date-range [todayButtonText]="'Hoy'"></igx-date-range>
     * ```
     */
    @Input()
    public todayButtonText = 'Today'; // optional

    /**
     * Property that changes the default text of the `done` button.
     * It will show up only in `dialog` mode.
     * Default value is `Done`.
     *
     * ```html
     * <igx-date-range [doneButtonText]="'完了'"></igx-date-range>
     * ```
     */
    @Input()
    public doneButtonText = 'Done'; // optional

    /**
     * Property that changes the default overlay settings used by the `IgxDateRangeComponent`.
     *
     * ```html
     * <igx-date-range [overlaySettings]="customOverlaySettings"></igx-date-range>
     * ```
     */
    @Input()
    public overlaySettings: OverlaySettings;

    // TODO
    @Input()
    public displayFormat: string;

    @Input()
    public inputFormat: string;

    /**
     * An event that is emitted when a range is selected in the `IgxDateRangeComponent`.
     */
    @Output()
    public onSelected = new EventEmitter<DateRange>();

    /**
     * An event that is emitted when the `IgxDateRangeComponent` is opened.
     */
    @Output()
    public onOpened = new EventEmitter<IBaseEventArgs>();

    /**
     * An event that is emitted when the `IgxDateRangeComponent` is closed.
     */
    @Output()
    public onClosed = new EventEmitter<IBaseEventArgs>();

    /** @hidden */
    @ViewChild(IgxDateStartComponent)
    public startInput: IgxDateStartComponent;

    /** @hidden */
    @ViewChild(IgxDateEndComponent)
    public endInput: IgxDateEndComponent;

    /** @hidden */
    @ViewChild(IgxDateSingleComponent)
    public singleInput: IgxDateSingleComponent;

    /** @hidden */
    @ContentChild(IgxDateStartComponent)
    public start: IgxDateStartComponent;

    /** @hidden */
    @ContentChild(IgxDateEndComponent)
    public end: IgxDateEndComponent;

    /** @hidden */
    @ContentChild(IgxSuffixDirective)
    public suffix: IgxSuffixDirective;

    @ContentChild(IgxLabelDirective)
    public label: IgxLabelDirective;

    /** @hidden */
    @ViewChild(IgxCalendarComponent)
    public calendar: IgxCalendarComponent;

    /** @hidden */
    @ViewChild(IgxToggleDirective)
    public toggleDirective: IgxToggleDirective;

    private _value: DateRange;
    private _oldValue: DateRange;
    private _destroy = new Subject<boolean>();
    private _onChangeCallback: (_: any) => void;
    private _positionSettings: PositionSettings;
    private _positionStrategy: AutoPositionStrategy;
    private _dialogOverlaySettings: OverlaySettings;
    private _dropDownOverlaySettings: OverlaySettings;

    constructor(public element: ElementRef) {
        this._onChangeCallback = (_: any) => { };
    }

    /**
     * Opens the date picker's dropdown or dialog.
     *
     * ```typescript
     * public openDialog() {
     *  this.dateRange.open();
     * }
     * ```
     *
     * ```html
     * <igx-date-range [mode]="'dialog'"></igx-date-range>
     *
     * <button (click)="openDialog()">Open Dialog</button
     * ```
     */
    public open(): void {
        if (this.mode === InteractionMode.Dialog) {
            this.activateToggleOpen(this._dialogOverlaySettings);
        }
        if (this.mode === InteractionMode.DropDown) {
            this.activateToggleOpen(this._dropDownOverlaySettings);
        }

        // TODO: add logic for single input; move to updateCalendar
        const startDate = this.start?.dateTimeEditor.value || this.startInput?.dateTimeEditor.value;
        const endDate = this.end?.dateTimeEditor.value || this.endInput?.dateTimeEditor.value;
        if (startDate && endDate) {
            this.calendar.selectDate([startDate, endDate]);
            this._oldValue = { start: startDate, end: endDate };
        } else {
            this.calendar.deselectDate([this._oldValue?.start, this._oldValue?.end]);
        }

        this.onOpened.emit({ owner: this });
    }

    /**
     * Closes the date picker's dropdown or dialog.
     *
     * ```typescript
     * public closeDialog() {
     *  this.dateRange.close();
     * }
     * ```
     *
     * ```html
     * <igx-date-range [mode]="'dialog'"></igx-date-range>
     *
     * <button (click)="closeDialog()">Close Dialog</button>
     * ```
     */
    public close(): void {
        if (!this.toggleDirective.collapsed) {
            this.toggleDirective.close();
            this.onClosed.emit({ owner: this });
        }
    }

    // TODO: Docs
    public toggle(): void {
        if (!this.toggleDirective.collapsed) {
            this.toggleDirective.close();
            this.onClosed.emit({ owner: this });
        } else {
            this.open();
        }
    }

    /**
     * Gets/Sets the currently selected value / range from the calendar.
     */
    public get value(): DateRange {
        return this._value;
    }

    public set value(value: DateRange) {
        this._value = value;
        this._onChangeCallback(value);
        this.updateInputs();
    }

    /**
     * Selects a range of dates, cancels previous selection.
     * ```typescript
     * public selectFiveDayRange() {
     *  const today = new Date();
     *  const inFiveDays = new Date(new Date().setDate(today.getDate() + 5));
     *  this.dateRange.selectRange(today, inFiveDays);
     * }
     * ```
     */
    public selectRange(startDate: Date, endDate?: Date): void { // todo: set value
        endDate = !endDate ? startDate : endDate;
        const dateRange = [startDate, endDate];
        this.calendar.selectDate(dateRange);
        this.handleSelection(dateRange);
    }

    /** @hidden @internal */
    public writeValue(value: DateRange): void {
        this.value = value;
    }

    /** @hidden @internal */
    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: any): void { }

    /** @hidden */
    public ngAfterViewInit(): void {
        switch (this.mode) {
            case InteractionMode.DropDown:
                this.attachOnKeydown();
                this.applyFocusOnClose();
                break;
            case InteractionMode.Dialog:
                this.applyFocusOnClose();
                break;
        }
        this.configPositionStrategy();
        this.initOverlaySettings();
    }

    /** @hidden */
    public ngOnDestroy(): void {
        this._destroy.next(true);
        this._destroy.complete();
    }

    /** @hidden */
    public onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case KEYS.UP_ARROW:
            case KEYS.UP_ARROW_IE:
                if (event.altKey) {
                    this.close();
                }
                break;
            case KEYS.DOWN_ARROW:
            case KEYS.DOWN_ARROW_IE:
                if (event.altKey) {
                    this.open();
                }
                break;
            case KEYS.ESCAPE:
            case KEYS.ESCAPE_IE:
                this.close();
                break;
        }
    }

    /** @hidden */
    public handleSelection(selectionData: Date[]): void {
        this.value = this.extractRange(selectionData);
        this._onChangeCallback(this.value);
        this.updateInputs();
        this.onSelected.emit(this.value);
    }

    /** @hidden @internal */
    public selectToday(): void {
        this.selectRange(new Date());
    }

    /** @hidden */
    public onClick(event: MouseEvent): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.open();
    }

    /** @hidden */
    public onCalendarOpened(): void {
        requestAnimationFrame(() => {
            this.calendar.daysView.focusActiveDate();
        });
    }

    /** @hidden @internal */
    public applyFormatting(range: DateRange): string {
        if (this.formatter) {
            return this.formatter(range);
        }
        return null;
        // TODO:
        // return range ? this.applyLocaleToDate(range) : '';
    }

    private applyLocaleToDate(value: Date): string {
        if (isIE() && value) {
            const localeDateStrIE = new Date(value.getFullYear(), value.getMonth(), value.getDate(),
                value.getHours(), value.getMinutes(), value.getSeconds(), value.getMilliseconds());
            return localeDateStrIE.toLocaleDateString(this.locale);
        }

        return value ? value.toLocaleDateString(this.locale) : null;
    }

    private extractRange(selection: Date[]): DateRange {
        return {
            start: selection[0],
            end: selection[selection.length - 1]
        };
    }

    private activateToggleOpen(overlaySettings: OverlaySettings): void {
        if (this.toggleDirective.collapsed) {
            this.toggleDirective.open(overlaySettings);
        }
    }

    private attachOnKeydown(): void {
        fromEvent(this.element.nativeElement, 'keydown').pipe(
            takeUntil(this._destroy)
        ).subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));
    }

    private applyFocusOnClose() {
        this.toggleDirective.onClosed.pipe(
            takeUntil(this._destroy)
        ).subscribe(() => (this.singleInput || this.start || this.startInput).setFocus());
    }

    private configPositionStrategy(): void {
        this._positionSettings = {
            openAnimation: fadeIn,
            closeAnimation: fadeOut,
            target: this.element.nativeElement
        };
        this._positionStrategy = new AutoPositionStrategy(this._positionSettings);
    }

    private initOverlaySettings(): void {
        this._dropDownOverlaySettings = this.overlaySettings ? this.overlaySettings : {
            closeOnOutsideClick: true,
            modal: false,
            positionStrategy: this._positionStrategy
        };
        this._dialogOverlaySettings = this.overlaySettings ? this.overlaySettings : {
            closeOnOutsideClick: true,
            modal: false,
            positionStrategy: new GlobalPositionStrategy()
        };
    }

    private updateInputs() {
        if (this.startInput) {
            this.startInput.updateInput(this.value?.start);
        }
        if (this.endInput) {
            this.endInput.updateInput(this.value?.end);
        }
        if (this.start) {
            this.start.updateInput(this.value?.start);
        }
        if (this.end) {
            this.end.updateInput(this.value?.end);
        }
        if (this.singleInput) {
            this.singleInput.updateInput(this?.value);
        }
    }
}
