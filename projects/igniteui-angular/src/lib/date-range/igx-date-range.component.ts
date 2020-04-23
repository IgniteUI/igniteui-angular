import {
    AfterViewInit,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    OnDestroy,
    Output,
    QueryList,
    ViewChild
} from '@angular/core';
import {InteractionMode} from '../core/enums';
import {IgxToggleDirective} from '../directives/toggle/toggle.directive';
import {IgxCalendarComponent, WEEKDAYS} from '../calendar/index';
import {AutoPositionStrategy, GlobalPositionStrategy, OverlaySettings} from '../services/index';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {IBaseEventArgs, KEYS} from '../core/utils';
import {PositionSettings} from '../services/overlay/utilities';
import {fadeIn, fadeOut} from '../animations/fade';
import {
    DateRange,
    IgxDateEndComponent,
    IgxDateRangePrefixDirective,
    IgxDateRangeSuffixDirective,
    IgxDateSingleComponent,
    IgxDateStartComponent
} from './igx-date-range-inputs.common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {IToggleView} from '../core/navigation';
import {IgxLabelDirective} from '../input-group';
import {IgxInputGroupBase} from '../input-group/input-group.common';
import {IgxDateTimeEditorEventArgs} from '../directives/date-time-editor';
import {CurrentResourceStrings} from '../core/i18n/resources';

/**
 * Range Date Picker provides the ability to select a range of dates from the calendar UI.
 * It displays the range selection in a single or two input fields.
 * @igxModule IgxDateRangeModule
 *
 * @igxTheme igx-input-group-theme, igx-calendar-theme
 *
 * @igxKeywords date, range, date range, date picker
 *
 * @igxGroup scheduling
 *
 * @remarks
 * Range Date Picker provides the ability to select a range of dates from the calendar UI.
 * It displays the range selection in a single or two input fields.
 *
 * @example:
 * ```html
 * <igx-date-range>
 *  <input igxDateRangeStart>
 *  <input igxDateRangeEnd>
 * </igx-date-range>
 * ```
 * @example:
 * ```html
 * <igx-date-range mode="dropdown"></igx-date-range>
 * ```
 */
@Component({
    selector: 'igx-date-range',
    templateUrl: './igx-date-range.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => IgxDateRangeComponent), multi: true }]
})
export class IgxDateRangeComponent implements IToggleView, AfterViewInit, OnDestroy, ControlValueAccessor {
    @HostBinding('class.igx-date-range')
    public cssClass = 'igx-date-range';
    /**
     * Gets/Sets whether `IgxDateRangeComponent` is in dialog or dropdown mode.
     * @remarks
     * Default mode is `dialog`
     *
     * @example
     * ```html
     * <igx-date-range mode="dropdown"></igx-date-range
     * ```
     */
    @Input()
    public mode = InteractionMode.Dialog;

    /**
     * Gets/Sets the number of displayed month views
     *
     * @remarks
     * Default is `2`.
     *
     * @example
     * ```html
     * <igx-date-range [monthsViewNumber]="3"></igx-date-range>
     * ```
     */
    @Input()
    public monthsViewNumber = 2;

    /**
     * Gets/Sets whether dates that are not part of the current month will be displayed.
     *
     * @remarks
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-date-range [hideOutsideDays]="true"></igx-date-range>
     * ```
     */
    @Input()
    public hideOutsideDays: boolean;

    /**
     * Gets/Sets the start day of the week.
     * @remarks
     * Can be assigned to a numeric value or to `WEEKDAYS` enum value.
     *
     * @example
     * ```html
     * <igx-date-range [weekStart]="1"></igx-date-range>
     * ```
     */
    @Input()
    public weekStart = WEEKDAYS.SUNDAY;

    /**
     * Gets/Sets which gets the `locale` of the calendar.
     * @remarks
     * Default value is `"en"`.
     *
     * @example
     * ```html
     * <igx-date-range locale="jp"></igx-date-range>
     * ```
     */
    @Input()
    public locale = 'en';

    /**
     * Gets/Sets a custom formatter function, applied on the selected or passed in date.
     *
     * @remarks
     * Default is noop()
     *
     * @example
     * ```typescript
     * private dayFormatter = new Intl.DateTimeFormat("en", { weekday: "long" });
     * private monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });
     *
     * public formatter(date: Date): string {
     *  return `${this.dayFormatter.format(date)} - ${this.monthFormatter.format(date)} - ${date.getFullYear()}`;
     * }
     * ```
     * ```html
     * <igx-date-range [formatter]="formatter"></igx-date-range>
     * ```
     */
    @Input()
    public formatter: (val: DateRange) => string;

    /**
     * Gets/Sets the default text of the `done` button.
     *
     * @remarks
     * Default value is `Done`.
     * The button will only show up in `dialog` mode.
     *
     * @example
     * ```html
     * <igx-date-range [doneButtonText]="'完了'"></igx-date-range>
     * ```
     */
    @Input()
    public doneButtonText = 'Done'; // optional

    /**
     * Gets/Sets any custom overlay settings that should be used by the `IgxDateRangeComponent`.
     *
     * @remarks
     * Default is `null`.
     *
     * @example
     * ```html
     * <igx-date-range [overlaySettings]="customOverlaySettings"></igx-date-range>
     * ```
     */
    @Input()
    public overlaySettings: OverlaySettings;

    // TODO
    @Input()
    public displayFormat: string;

    /**
     * Gets/Sets the input format of the default date-range input
     *
     * @remarks
     * Default is `"'dd/MM/yyyy'"`
     *
     * @example
     * ```html
     * <igx-date-range inputFormat="MM/dd/yy"></igx-date-range>
     * ```
     */
    @Input()
    public inputFormat: string;

    /**
     * Emitted when a range is selected in the `IgxDateRangeComponent`.
     *
     * @remakrs
     * Emitted args are of type `DateRange`
     *
     * @example
     * ```html
     * <igx-date-range (onSelected)="handleSelected($event)"></igx-date-range>
     * ```
     */
    @Output()
    public onSelected = new EventEmitter<DateRange>();

    /**
     * Emitted when the `IgxDateRangeComponent` is opened.
     *
     * @remarks
     * Emitted args are of type `IBaseEventArgs`
     *
     * @example
     * ```html
     * <igx-date-range (onOpened)="handleOpened($event)"></igx-date-range>
     * ```
     */
    @Output()
    public onOpened = new EventEmitter<IBaseEventArgs>();

    /**
     * Emitted when the `IgxDateRangeComponent` is closed.
     *
     * @remarks
     * Emitted args are of type `IBaseEventArgs`
     *
     * @example
     * ```html
     * <igx-date-range (onClosed)="handleClosed($event)"></igx-date-range>
     * ```
     */
    @Output()
    public onClosed = new EventEmitter<IBaseEventArgs>();

    /** @hidden */
    @ViewChild(IgxDateSingleComponent)
    public single: IgxDateSingleComponent;

    /** @hidden */
    @ViewChild(IgxCalendarComponent)
    public calendar: IgxCalendarComponent;

    /** @hidden */
    @ViewChild(IgxToggleDirective)
    public toggleDirective: IgxToggleDirective;

    /** @hidden */
    @ContentChildren(IgxInputGroupBase)
    public projectedInputs: QueryList<IgxInputGroupBase>;

    /** @hidden */
    @ContentChild(IgxDateRangePrefixDirective)
    public prefix: IgxDateRangePrefixDirective;

    /** @hidden */
    @ContentChild(IgxDateRangeSuffixDirective)
    public suffix: IgxDateRangeSuffixDirective;

    @ContentChild(IgxLabelDirective)
    public label: IgxLabelDirective;

    /** @hidden */
    public prepTo = CurrentResourceStrings.RangeDatePickerResStrings.igx_range_date_picker_to;

    /** @hidden @internal */
    public get appliedFormat() {
        // TODO: apply formatter if present
        if (!this.hasProjectedInputs) {
            // TODO: use displayFormat - see how shortDate, longDate can be defined
            return this.inputFormat
                ? `${this.inputFormat} - ${this.inputFormat}`
                : `${this._defaultInputFormat} - ${this._defaultInputFormat}`;
        } else {
            return this.inputFormat ? this.inputFormat : this._defaultInputFormat;
        }
    }

    /** @hidden @internal */
    public get hasProjectedInputs(): boolean {
        return this.projectedInputs.some(i => i instanceof IgxDateStartComponent || i instanceof IgxDateEndComponent);
    }

    // TODO: use default input format from date-time-editor.common?
    private _defaultInputFormat = 'dd/MM/yyyy';
    private _value: DateRange;
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
     * Opens the date range picker's dropdown or dialog.
     *
     * @example
     * ```html
     * <igx-date-range #dateRange mode="dialog"></igx-date-range>
     *
     * <button (click)="dateRange.open()">Open Dialog</button
     * ```
     */
    public open(): void {
        if (this.value && this.value.start?.getTime() > this.value.end?.getTime()) {
            this.value = { start: this.value.end, end: this.value.start };
        }
        this.updateCalendar();
        if (this.mode === InteractionMode.Dialog) {
            this.activateToggleOpen(this._dialogOverlaySettings);
        }
        if (this.mode === InteractionMode.DropDown) {
            this.activateToggleOpen(this._dropDownOverlaySettings);
        }

        this.onOpened.emit({ owner: this });
    }

    /**
     * Closes the date range picker's dropdown or dialog.
     *
     * @example
     * ```html
     * <igx-date-range #dateRange [mode]="'dialog'"></igx-date-range>
     *
     * <button (click)="dateRange.close()">Close Dialog</button>
     * ```
     */
    public close(): void {
        if (!this.toggleDirective.collapsed) {
            this.toggleDirective.close();
            this.onClosed.emit({ owner: this });
        }
    }

    /**
     * Toggles the date range picker's dropdown or dialog
     *
     * @example
     * ```html
     * <igx-date-range #dateRange [mode]="'dialog'"></igx-date-range>
     *
     * <button (click)="dateRange.toggle()">Toggle Dialog</button>
     * ```
     */
    public toggle(): void {
        if (!this.toggleDirective.collapsed) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Gets/Sets the currently selected value / range from the calendar
     *
     * @remarks
     * The current value is of type `DateRange`
     *
     * @example
     * ```typescript
     * const newValue: DateRange = { start: new Date("2/2/2012"), end: new Date("3/3/2013")};
     * this.dateRangePicker.value = newValue;
     * ```
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
     * Selects a range of dates. If no `endDate` is passed, range is 1 day (only `startDate`)
     *
     * @example
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
                this.subscribeToDateEditorEvents();
                break;
            case InteractionMode.Dialog:
                this.applyFocusOnClose();
                break;
        }
        this.configPositionStrategy();
        this.configOverlaySettings();
    }

    /** @hidden */
    public ngOnDestroy(): void {
        this._destroy.next(true);
        this._destroy.complete();
    }

    /**
     * @hidden
     * @internal
     * Handles the toggle's onClosing event.
     */
    public onClosing() {
        if (this.value && !this.value.end) {
            this.value = { start: this.value.start, end: this.value.start };
        }
    }

    /** @hidden @internal */
    public onKeyDown(event: KeyboardEvent): void {
        // TODO: make sure IgxDateTimeEditorDirective doesn't spin if ALT is pressed
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

    /** @hidden @internal */
    public handleSelection(selectionData: Date[]): void {
        this.value = this.extractRange(selectionData);
        this._onChangeCallback(this.value);
        this.onSelected.emit(this.value);
    }

    /** @hidden @internal */
    public selectToday(): void {
        this.selectRange(new Date());
    }

    /** @hidden @internal */
    public onClick(event: MouseEvent): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.open();
    }

    /** @hidden @internal */
    public onCalendarOpened(): void {
        requestAnimationFrame(() => {
            this.calendar.daysView.focusActiveDate();
        });
    }

    private updateCalendar() {
        if (this.value && this.value.start && this.value.end) {
            this.calendar.selectDate([this.value.start, this.value.end]);
        } else {
            if (this.value && this.value.start) {
                this.calendar.selectDate(this.value.start);
            } else if (this.value && this.value.end) {
                this.calendar.selectDate(this.value.end);
                this.value = { start: this.value.end, end: this.value.end };
            } else {
                this.calendar.deselectDate();
            }
        }
        if (this.value) {
            this.calendar.viewDate = this.value.start;
        }
    }

    private extractRange(selection: Date[]): DateRange {
        return {
            start: selection[0],
            end: selection.length > 1 ? selection[selection.length - 1] : null
        };
    }

    private activateToggleOpen(overlaySettings: OverlaySettings): void {
        if (this.toggleDirective.collapsed) {
            this.toggleDirective.open(overlaySettings);
        }
    }

    private attachOnKeydown(): void {
        fromEvent(this.element.nativeElement, 'keydown')
            .pipe(takeUntil(this._destroy))
            .subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));
    }

    private applyFocusOnClose() {
        this.toggleDirective.onClosed
            .pipe(takeUntil(this._destroy))
            .subscribe(() => (
                this.single || this.projectedInputs.find(i => i instanceof IgxDateStartComponent) as IgxDateStartComponent
            )?.setFocus());
    }

    private subscribeToDateEditorEvents() {
        if (this.hasProjectedInputs) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateStartComponent) as IgxDateStartComponent;
            const end = this.projectedInputs.find(i => i instanceof IgxDateEndComponent) as IgxDateEndComponent;
            start.dateTimeEditor.valueChange
                .pipe(takeUntil(this._destroy))
                .subscribe((event: Date) => {
                    // TODO: update
                    // this.value = { start: event.newValue as Date, end: this.value?.end };
                });
            end.dateTimeEditor.valueChange
                .pipe(takeUntil(this._destroy))
                .subscribe((event: Date) => {
                    // TODO: update
                    // this.value = { start: this.value?.start, end: event.newValue as Date };
                });
            start.dateTimeEditor.validationFailed
                .pipe(takeUntil(this._destroy))
                .subscribe((event: IgxDateTimeEditorEventArgs) => {
                    this.value = { start: event.newValue as Date, end: this.value?.end };
                });
            end.dateTimeEditor.validationFailed
                .pipe(takeUntil(this._destroy))
                .subscribe((event: IgxDateTimeEditorEventArgs) => {
                    this.value = { start: this.value?.start, end: event.newValue as Date };
                });
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

    private configOverlaySettings(): void {
        this._dropDownOverlaySettings = this.overlaySettings ? this.overlaySettings : {
            closeOnOutsideClick: true,
            modal: false,
            positionStrategy: this._positionStrategy
        };
        this._dialogOverlaySettings = this.overlaySettings ? this.overlaySettings : {
            closeOnOutsideClick: true,
            modal: true,
            positionStrategy: new GlobalPositionStrategy()
        };
    }

    private updateInputs() {
        const start = this.projectedInputs?.find(i => i instanceof IgxDateStartComponent) as IgxDateStartComponent;
        const end = this.projectedInputs?.find(i => i instanceof IgxDateEndComponent) as IgxDateEndComponent;
        if (start && end && this.value) {
            start.updateInput(this.value.start);
            end.updateInput(this.value.end);
        } else if (this.single && this.value) {
            this.single.updateInput(this.value, this.inputFormat, this.locale);
        }
    }
}
