import {
    Component, Input, ContentChild, ViewChild,
    AfterViewInit, OnDestroy, EventEmitter, Output, ElementRef
} from '@angular/core';
import { InteractionMode } from '../core/enums';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxCalendarComponent, WEEKDAYS } from '../calendar/index';
import { OverlaySettings, GlobalPositionStrategy, AutoPositionStrategy } from '../services/index';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KEYS, isIE } from '../core/utils';
import { PositionSettings } from '../services/overlay/utilities';
import { fadeIn, fadeOut } from '../animations/fade';
import { IgxDateStartComponent, IgxDateEndComponent, IgxDateSingleComponent, DateRange } from './igx-date-range-inputs.common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DateRange {
    start: Date | string;
    end: Date | string;
}

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
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxDateRangeComponent, multi: true }]
})
export class IgxDateRangeComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
    /**
     * Property which sets whether `IgxDateRangeComponent` is in dialog or dropdown mode.
     *
     * ```html
     * <igx-date-range [mode]="'dropdown'">
     *  ...
     * </igx-date-range
     * ```
     */
    @Input()
    public mode: InteractionMode;

    /**
     * Property which sets the number displayed month views.
     * Default is `2`.
     *
     * ```html
     * <igx-date-range [monthsViewNumber]="3">
     *  ...
     * </igx-date-range
     * ```
     */
    @Input()
    public monthsViewNumber: number;

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
     * <igx-date-range [weekStart]="1">
     *  ...
     * </igx-date-range>
     * ```
     */
    @Input()
    public weekStart: number;

    /**
     * Property which gets the `locale` of the calendar.
     * Default value is `"en"`.
     *
     * ```html
     * <igx-date-range [locale]="'jp'">
     *  ...
     * </igx-date-range>
     * ```
     */
    @Input()
    public locale: string;

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
     * <igx-date-range [formatter]="formatter">
     *  ...
     * </igx-date-range>
     * ```
     */
    @Input()
    public formatter: (val: Date) => string;

    /**
     * Property that changes the default text of the `today` button.
     * Default value is `Today`.
     *
     * ```html
     * <igx-date-range [todayButtonText]="'Hoy'">
     *  ...
     * </igx-date-range>
     * ```
     */
    @Input()
    public todayButtonText: string;

    /**
     * Property that changes the default text of the `done` button.
     * It will show up only in `dialog` mode.
     * Default value is `Done`.
     *
     * ```html
     * <igx-date-range [doneButtonText]="'完了'">
     *  ...
     * </igx-date-range>
     * ```
     */
    @Input()
    public doneButtonText: string;

    /**
     * Property that changes the default overlay settings used by the `IgxDateRangeComponent`.
     *
     * ```html
     * <igx-date-range [overlaySettings]="customOverlaySettings">
     *  ...
     * </igx-date-range>
     * ```
     */
    @Input()
    public overlaySettings: OverlaySettings;

    /**
     * An event that is emitted when a full range was selected in the `IgxDateRangeComponent`.
     */
    @Output()
    public rangeSelected: EventEmitter<IgxDateRangeComponent>;

    /**
     * An event that is emitted when the `IgxDateRangeComponent` is opened.
     */
    @Output()
    public onOpened: EventEmitter<IgxDateRangeComponent>;

    /**
     * An event that is emitted when the `IgxDateRangeComponent` is closed.
     */
    @Output()
    public onClosed: EventEmitter<IgxDateRangeComponent>;

    @ViewChild(IgxDateStartComponent, { read: IgxDateStartComponent, static: false })
    public startInput: IgxDateStartComponent;

    @ViewChild(IgxDateEndComponent, { read: IgxDateEndComponent, static: false })
    public endInput: IgxDateEndComponent;

    @ContentChild(IgxDateStartComponent, { read: IgxDateStartComponent, static: false })
    public start: IgxDateStartComponent;

    @ContentChild(IgxDateEndComponent, { read: IgxDateEndComponent, static: false })
    public end: IgxDateEndComponent;

    @ContentChild(IgxDateSingleComponent)
    public single: IgxDateSingleComponent;

    protected get startValue(): IgxDateStartComponent {
        return this.start || this.startInput;
    }

    protected get endValue(): IgxDateEndComponent {
        return this.end || this.endInput;
    }

    /**
     * @hidden
     */
    @ViewChild(IgxCalendarComponent)
    protected calendar: IgxCalendarComponent;

    /**
     * @hidden
     */
    @ViewChild(IgxToggleDirective)
    protected toggle: IgxToggleDirective;

    private _destroy: Subject<boolean>;
    private _positionSettings: PositionSettings;
    private _positionStrategy: AutoPositionStrategy;
    private _dialogOverlaySettings: OverlaySettings;
    private _dropDownOverlaySettings: OverlaySettings;
    private _value: DateRange;
    private _onChangeCallback: (_: any) => void;

    constructor(private element: ElementRef) {
        this.locale = 'en';
        this.monthsViewNumber = 2;
        this.doneButtonText = 'Done';
        this.todayButtonText = 'Today';
        this.weekStart = WEEKDAYS.SUNDAY;
        this.mode = InteractionMode.Dialog;
        this._destroy = new Subject<boolean>();
        this.onOpened = new EventEmitter<IgxDateRangeComponent>();
        this.onClosed = new EventEmitter<IgxDateRangeComponent>();
        this.rangeSelected = new EventEmitter<IgxDateRangeComponent>();
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
     * <igx-date-range [mode]="'dialog'">
     *  ...
     * </igx-date-range>
     *
     * <button (click)="openDialog()">Open Dialog</button
     * ```
     */
    public open(): void {
        this.showCalendar();
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
     * <igx-date-range [mode]="'dialog'">
     *  ...
     * </igx-date-range>
     *
     * <button (click)="closeDialog()">Close Dialog</button>
     * ```
     */
    public close(): void {
        this.hideCalendar();
    }

    /**
     * Selects the today date if no previous selection is made. If there is a previous selection, it does a range selection to today.
     *
     * ```typescript
     * this.dateRange.selectToday();
     * ```
     */
    public selectToday(): void {
        this.showToday();
    }

    /**
     * Gets/Sets the currently selected value / range from the calendar.
     */
    public get value(): DateRange {
        return this._value;
    }

    public set value(value: DateRange) {
        this._value = value;
    }

    /**
     * Selects a range of dates, cancels previous selection.
     *
     * ```typescript
     * public selectFiveDayRange() {
     *  const today = new Date();
     *  const inFiveDays = new Date(new Date().setDate(today.getDate() + 5));
     *  this.dateRange.selectRange(today, inFiveDays);
     * }
     * ```
     */
    public selectRange(startDate: Date, endDate: Date): void {
        const dateRange = [startDate, endDate];
        this.calendar.selectDate(dateRange);
        this.handleSelection(dateRange);
    }

    /**
     * @hidden
     * @internal
     */
    public writeValue(value: DateRange): void {
        this.value = value;
    }

    /**
     * @hidden
     * @internal
     */
    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    /**
     * @hidden
     * @internal
     */
    public registerOnTouched(fn: any): void {
        throw new Error('Method not implemented.');
    }

    /**
     * @hidden
     */
    public showToday(event?: KeyboardEvent): void {
        if (event) {
            event.stopPropagation();
        }
        const today = new Date();
        this.calendar.selectDate(today);
        this.handleSelection(this.calendar.selectedDates);
    }

    /**
     * @hidden
     */
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
        // this.validateNgContent();
        this.configPositionStrategy();
        this.initOverlaySettings();
    }

    /**
     * @hidden
     */
    public ngOnDestroy(): void {
        this._destroy.next(true);
        this._destroy.complete();
    }

    /**
     * @hidden
     */
    public onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case KEYS.UP_ARROW:
            case KEYS.UP_ARROW_IE:
                if (event.altKey) {
                    this.hideCalendar();
                }
                break;
            case KEYS.DOWN_ARROW:
            case KEYS.DOWN_ARROW_IE:
                if (event.altKey) {
                    this.showDropDown();
                }
                break;
            case KEYS.ESCAPE:
            case KEYS.ESCAPE_IE:
                this.hideCalendar();
                break;
        }
    }

    /**
     * @hidden
     */
    public handleSelection(selectionData: Date[]): void {
        this.value = this.extractRange(selectionData);
        if (this.startValue) {
            this.startValue.updateValue(this.value.start);
        }

        if (this.endValue) {
            this.endValue.updateValue(this.value.end);
        }

        if (this.single) {
            this.single.updateValue(this.value);
        }

        // TODO
        this.rangeSelected.emit(this);
    }

    /**
     * @hidden
     */
    public showCalendar(event?: MouseEvent | KeyboardEvent): void {
        switch (this.mode) {
            case InteractionMode.Dialog:
                this.showDialog(event);
                break;
            case InteractionMode.DropDown:
                this.showDropDown(event);
                break;
            default:
                // TODO: better error message
                throw new Error('Unknown mode.');
        }
        this.onOpened.emit(this);
    }

    /**
     * @hidden
     */
    public hideCalendar(): void {
        if (!this.toggle.collapsed) {
            this.toggle.close();
            this.start ? this.start.setFocus() :
                this.single.setFocus();
        }
        this.onClosed.emit(this);
    }

    /**
     * @hidden
     */
    public onCalendarOpened(): void {
        requestAnimationFrame(() => {
            this.calendar.daysView.focusActiveDate();
        });
    }

    /**
     *  @hidden
     */
    protected showDialog(event?: MouseEvent | KeyboardEvent): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.activateToggleOpen(this._dialogOverlaySettings);
    }

    /**
     * @hidden
     */
    protected showDropDown(event?: MouseEvent | KeyboardEvent): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.activateToggleOpen(this._dropDownOverlaySettings);
    }

    private applyFormatting(date: Date): string {
        return this.formatter ? this.formatter(date) : this.applyLocaleToDate(date);
    }

    // TODO: move util
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
            start: selection[0], // this.applyFormatting(selection[0]),
            end: selection[selection.length - 1] // this.applyFormatting(selection[selection.length - 1])
        };
    }

    private activateToggleOpen(overlaySettings: OverlaySettings): void {
        if (this.toggle.collapsed) {
            this.toggle.open(overlaySettings);
        }
    }

    private attachOnKeydown(): void {
        if (this.single) {
            fromEvent(this.single.nativeElement, 'keydown').pipe(
                takeUntil(this._destroy)
            ).subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));
        }
        if (this.start && this.end) {
            fromEvent(this.start.nativeElement, 'keydown').pipe(
                takeUntil(this._destroy)
            ).subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));

            fromEvent(this.end.nativeElement, 'keydown').pipe(
                takeUntil(this._destroy)
            ).subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));
        }
    }

    private applyFocusOnClose() {
        if (this.single) {
            this.toggle.onClosed.pipe(
                takeUntil(this._destroy)
            ).subscribe(() => this.single.setFocus());
        }
        if (this.start) {
            this.toggle.onClosed.pipe(
                takeUntil(this._destroy)
            ).subscribe(() => this.start.setFocus());
        }
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
}
