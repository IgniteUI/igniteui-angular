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
    ViewChild,
    TemplateRef,
    Optional,
    Inject,
    OnChanges,
    LOCALE_ID,
    SimpleChanges
} from '@angular/core';
import { InteractionMode } from '../core/enums';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxCalendarComponent, WEEKDAYS } from '../calendar/index';
import { AutoPositionStrategy, GlobalPositionStrategy, OverlaySettings } from '../services/index';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IBaseEventArgs, KEYS, CancelableBrowserEventArgs, CancelableEventArgs } from '../core/utils';
import { PositionSettings } from '../services/overlay/utilities';
import { fadeIn, fadeOut } from '../animations/fade';
import {
    DateRange,
    IgxDateRangeEndComponent,
    IgxDateRangeStartComponent,
    IgxPickerToggleComponent,
    IgxDateRangeSeparatorDirective
} from './date-range-picker-inputs.common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IToggleView } from '../core/navigation';
import { IgxLabelDirective } from '../input-group';
import { IgxInputGroupBase } from '../input-group/input-group.common';
import { IgxDateTimeEditorEventArgs } from '../directives/date-time-editor';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions, DisplayDensity } from '../core/density';
import { DatePickerUtil } from '../date-picker/date-picker.utils';

const DEFAULT_INPUT_FORMAT = 'MM/dd/yyyy';

/**
 * Provides the ability to select a range of dates from a calendar UI or editable inputs.
 *
 * @igxModule IgxDateRangeModule
 *
 * @igxTheme igx-input-group-theme, igx-calendar-theme, igx-date-range-picker-theme
 *
 * @igxKeywords date, range, date range, date picker
 *
 * @igxGroup scheduling
 *
 * @remarks
 * It displays the range selection in a single or two input fields.
 * The default template displays a single *readonly* input field
 * while projecting `igx-date-range-picker-start` and `igx-date-range-picker-end`
 * displays two *editable* input fields.
 *
 * @example
 * ```html
 * <igx-date-range-picker mode="dropdown"></igx-date-range-picker>
 * ```
 */
@Component({
    selector: 'igx-date-range-picker',
    templateUrl: './date-range-picker.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => IgxDateRangePickerComponent), multi: true }]
})
export class IgxDateRangePickerComponent extends DisplayDensityBase
    implements IToggleView, OnChanges, AfterViewInit, OnDestroy, ControlValueAccessor {
    /**
     * Display calendar in either `dialog` or `dropdown` mode.
     * @remarks
     * Default mode is `dialog`
     *
     * @example
     * ```html
     * <igx-date-range-picker mode="dropdown"></igx-date-range-picker>
     * ```
     */
    @Input()
    public mode = InteractionMode.Dialog;

    /**
     * The number of displayed month views.
     *
     * @remarks
     * Default is `2`.
     *
     * @example
     * ```html
     * <igx-date-range-picker [monthsViewNumber]="3"></igx-date-range-picker>
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
     * <igx-date-range-picker [hideOutsideDays]="true"></igx-date-range-picker>
     * ```
     */
    @Input()
    public hideOutsideDays: boolean;

    /**
     * The start day of the week.
     *
     * @remarks
     * Can be assigned to a numeric value or to `WEEKDAYS` enum value.
     *
     * @example
     * ```html
     * <igx-date-range-picker [weekStart]="1"></igx-date-range-picker>
     * ```
     */
    @Input()
    public weekStart = WEEKDAYS.SUNDAY;

    /**
     * The `locale` of the calendar.
     *
     * @remarks
     * Default value is `"en"`.
     *
     * @example
     * ```html
     * <igx-date-range-picker locale="jp"></igx-date-range-picker>
     * ```
     */
    @Input()
    public locale: string;

    /**
     * A custom formatter function, applied on the selected or passed in date.
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
     * <igx-date-range-picker [formatter]="formatter"></igx-date-range-picker>
     * ```
     */
    @Input()
    public formatter: (val: DateRange) => string;

    /**
     * The default text of the calendar dialog `done` button.
     *
     * @remarks
     * Default value is `Done`.
     * The button will only show up in `dialog` mode.
     *
     * @example
     * ```html
     * <igx-date-range-picker doneButtonText="完了"></igx-date-range-picker>
     * ```
     */
    @Input()
    public doneButtonText = 'Done';

    /**
     * Custom overlay settings that should be used to display the calendar.
     *
     * @example
     * ```html
     * <igx-date-range-picker [overlaySettings]="customOverlaySettings"></igx-date-range-picker>
     * ```
     */
    @Input()
    public overlaySettings: OverlaySettings;

    /**
     * The format used when editable inputs are not focused.
     *
     * @remarks
     * Uses Angular's DatePipe.
     *
     * @example
     * ```html
     * <igx-date-range-picker displayFormat="EE/M/yy"></igx-date-range-picker>
     * ```
     *
     */
    @Input()
    public displayFormat: string;

    /**
     * The expected user input format and placeholder.
     *
     * @remarks
     * Default is `"'MM/dd/yyyy'"`
     *
     * @example
     * ```html
     * <igx-date-range-picker inputFormat="dd/MM/yy"></igx-date-range-picker>
     * ```
     */
    @Input()
    public inputFormat: string;

    /**
     * Emitted when a range is selected.
     *
     * @example
     * ```html
     * <igx-date-range-picker (rangeSelected)="handleSelected($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public rangeSelected = new EventEmitter<DateRange>();

    /**
     * Emitted when the calendar starts opening, cancelable.
     *
     * @example
     * ```html
     * <igx-date-range-picker (onOpening)="handleOpening($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public onOpening = new EventEmitter<CancelableBrowserEventArgs & IBaseEventArgs>();

    /**
     * Emitted when the `IgxDateRangeComponent` is opened.
     *
     * @example
     * ```html
     * <igx-date-range-picker (onOpened)="handleOpened($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public onOpened = new EventEmitter<IBaseEventArgs>();

    /**
     * Emitted when the calendar starts closing, cancelable.
     *
     * @example
     * ```html
     * <igx-date-range-picker (onClosing)="handleClosing($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public onClosing = new EventEmitter<CancelableBrowserEventArgs & IBaseEventArgs>();

    /**
     * Emitted when the `IgxDateRangeComponent` is closed.
     *
     * @example
     * ```html
     * <igx-date-range-picker (onClosed)="handleClosed($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public onClosed = new EventEmitter<IBaseEventArgs>();

    /** @hidden */
    @HostBinding('class.igx-date-range-picker')
    public cssClass = 'igx-date-range-picker';

    /** @hidden */
    @ViewChild(IgxCalendarComponent)
    public calendar: IgxCalendarComponent;

    /** @hidden */
    @ViewChild(IgxToggleDirective)
    public toggleDirective: IgxToggleDirective;

    /** @hidden */
    @ContentChildren(IgxPickerToggleComponent, { descendants: true })
    public toggleComponents: QueryList<IgxPickerToggleComponent>;

    /** @hidden */
    @ContentChildren(IgxInputGroupBase)
    public projectedInputs: QueryList<IgxInputGroupBase>;

    @ContentChild(IgxLabelDirective)
    public label: IgxLabelDirective;

    /** @hidden */
    @ContentChild(IgxDateRangeSeparatorDirective, { read: TemplateRef })
    public dateSeparatorTemplate: TemplateRef<any>;

    /** @hidden */
    public dateSeparator = CurrentResourceStrings.DateRangePickerResStrings.igx_date_range_picker_date_separator;

    /** @hidden @internal */
    public get appliedFormat(): string {
        // TODO: apply formatter if present
        if (!this.hasProjectedInputs) {
            // TODO: use displayFormat - see how shortDate, longDate can be defined
            return this.inputFormat
                ? `${this.inputFormat} - ${this.inputFormat}`
                : `${DEFAULT_INPUT_FORMAT} - ${DEFAULT_INPUT_FORMAT}`;
        } else {
            return this.inputFormat || DEFAULT_INPUT_FORMAT;
        }
    }

    /** @hidden @internal */
    public get hasProjectedInputs(): boolean {
        return this.projectedInputs.length > 0;
    }

    private get dropdownOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dropDownOverlaySettings, this.overlaySettings);
    }

    private get dialogOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dialogOverlaySettings, this.overlaySettings);
    }

    private _value: DateRange;
    private $destroy = new Subject();
    private $toggleClickNotifier = new Subject();
    private _onChangeCallback: (...args: any[]) => void;
    private _positionSettings: PositionSettings;
    private _dialogOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: true
    };
    private _dropDownOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false
    };

    constructor(public element: ElementRef,
        @Inject(LOCALE_ID) private _locale: any,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(_displayDensityOptions);
        this._onChangeCallback = (...args: any[]) => { };
        this.locale = this.locale || this._locale;
    }

    /**
     * Opens the date range picker's dropdown or dialog.
     *
     * @example
     * ```html
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button (click)="dateRange.open()">Open Dialog</button
     * ```
     */
    public open(overlaySettings?: OverlaySettings): void {
        const range: Date[] = [];
        if (this.value) {
            if (this.value.start) {
                range.push(this.value.start);
                if (this.value.end) {
                    range.push(this.value.end);
                }
            } else {
                this.value = { start: null, end: null };
            }
        }
        if (range.length > 0) {
            this.value = { start: range[0], end: range[range.length - 1] };
        }

        this.updateCalendar();
        const settings = this.mode === InteractionMode.Dialog ? this.dialogOverlaySettings : this.dropdownOverlaySettings;
        if (this.toggleDirective.collapsed) {
            this.toggleDirective.open(Object.assign(settings, overlaySettings));
        }
    }

    /**
     * Closes the date range picker's dropdown or dialog.
     *
     * @example
     * html```
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button (click)="dateRange.close()">Close Dialog</button>
     * ```
     */
    public close(): void {
        if (!this.toggleDirective.collapsed) {
            this.toggleDirective.close();
        }
    }

    /**
     * Toggles the date range picker's dropdown or dialog
     *
     * @example
     * html```
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button (click)="dateRange.toggle()">Toggle Dialog</button>
     * ```
     */
    public toggle(overlaySettings?: OverlaySettings): void {
        if (!this.toggleDirective.collapsed) {
            this.close();
        } else {
            this.open(overlaySettings);
        }
    }

    /**
     * Gets calendar state.
     *
     * ```typescript
     * let state = this.dateRange.collapsed;
     * ```
     */
    public get collapsed(): boolean {
        return this.toggleDirective.collapsed;
    }

    /**
     * The currently selected value / range from the calendar
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

    @Input()
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
    public selectRange(startDate: Date, endDate?: Date): void {
        endDate = endDate ?? startDate;
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

    /** @hidden @internal */
    get separatorClass(): string {
        return this.getComponentDensityClass('igx-date-range-picker__label');
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        switch (this.mode) {
            case InteractionMode.DropDown:
                this.attachOnKeydown();
                this.subscribeToDateEditorEvents();
                break;
        }
        this.configPositionStrategy();
        this.configOverlaySettings();

        const subsToClicked = () => {
            this.$toggleClickNotifier.next();
            this.toggleComponents.forEach(toggle => {
                toggle.clicked.pipe(takeUntil(this.$toggleClickNotifier)).subscribe(() => this.open());
            });
        };

        this.toggleComponents.changes.pipe(takeUntil(this.$destroy)).subscribe(() => subsToClicked());
        subsToClicked();
        this.updateInputs();
    }

    /** @hidden @internal */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['locale']) {
            this.inputFormat = DatePickerUtil.getDefaultInputFormat(this.locale || 'en') || DEFAULT_INPUT_FORMAT;
        }
    }

    /** @hidden @internal */
    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
        this.$toggleClickNotifier.next();
        this.$toggleClickNotifier.complete();
    }

    /** @hidden @internal */
    public handleOpening(event: CancelableEventArgs): void {
        this.onOpening.emit(event);
    }

    /** @hidden @internal */
    public handleOpened(): void {
        requestAnimationFrame(() => {
            this.calendar.daysView.focusActiveDate();
            this.onOpened.emit({ owner: this });
        });
    }

    /** @hidden @internal */
    public handleClosing(event: CancelableEventArgs): void {
        this.onClosing.emit(event);
    }

    /** @hidden @internal */
    public handleClosed(): void {
        if (this.value && !this.value.end) {
            this.value = { start: this.value.start, end: this.value.start };
        }
        (this.projectedInputs
            .find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent)?.setFocus();
        this.onClosed.emit({ owner: this });
    }

    /** @hidden @internal */
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

    /** @hidden @internal */
    public handleSelection(selectionData: Date[]): void {
        this.value = this.extractRange(selectionData);
        this._onChangeCallback(this.value);
        this.rangeSelected.emit(this.value);
    }

    private updateCalendar() {
        const range: Date[] = [];
        if (this.value) {
            if (this.value.start) {
                range.push(this.value.start);
            }
            if (this.value.end) {
                range.push(this.value.end);
            }
        }
        if (range.length > 0) {
            this.calendar.selectDate(range);
            this.value = { start: range[0], end: range[range.length - 1] };
            this.calendar.viewDate = this.value.start;
        } else {
            this.calendar.deselectDate();
        }
    }

    private extractRange(selection: Date[]): DateRange {
        return {
            start: selection[0],
            end: selection.length > 1 ? selection[selection.length - 1] : null
        };
    }

    private attachOnKeydown(): void {
        fromEvent(this.element.nativeElement, 'keydown')
            .pipe(takeUntil(this.$destroy))
            .subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));
    }

    private subscribeToDateEditorEvents() {
        if (this.hasProjectedInputs) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
            if (start && end) {
                start.dateTimeEditor.valueChange
                    .pipe(takeUntil(this.$destroy))
                    .subscribe((date: Date) => {
                        this.value = { start: date as Date, end: this.value?.end };
                    });
                end.dateTimeEditor.valueChange
                    .pipe(takeUntil(this.$destroy))
                    .subscribe((date: Date) => {
                        this.value = { start: this.value?.start, end: date as Date };
                    });
                start.dateTimeEditor.validationFailed
                    .pipe(takeUntil(this.$destroy))
                    .subscribe((event: IgxDateTimeEditorEventArgs) => {
                        this.value = { start: event.newValue as Date, end: this.value?.end };
                    });
                end.dateTimeEditor.validationFailed
                    .pipe(takeUntil(this.$destroy))
                    .subscribe((event: IgxDateTimeEditorEventArgs) => {
                        this.value = { start: this.value?.start, end: event.newValue as Date };
                    });
            }
        }
    }

    private configPositionStrategy(): void {
        this._positionSettings = {
            openAnimation: fadeIn,
            closeAnimation: fadeOut,
            target: this.element.nativeElement
        };
        this._dropDownOverlaySettings.positionStrategy = new AutoPositionStrategy(this._positionSettings);
    }

    private configOverlaySettings(): void {
        if (this.overlaySettings !== null) {
            this._dropDownOverlaySettings = Object.assign({}, this._dropDownOverlaySettings, this.overlaySettings);
            this._dialogOverlaySettings = Object.assign({}, this._dialogOverlaySettings, this.overlaySettings);
        }
    }

    private updateInputs() {
        const start = this.projectedInputs?.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
        const end = this.projectedInputs?.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
        if (start && end && this.value) {
            start.updateInput(this.value.start);
            end.updateInput(this.value.end);
        }
    }
}
