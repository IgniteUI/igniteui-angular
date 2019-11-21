import {
    Component, Input, ContentChild, ViewChild,
    AfterViewInit, OnDestroy, EventEmitter, Output
} from '@angular/core';
import { InteractionMode } from '../core/enums';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxCalendarComponent, WEEKDAYS } from '../calendar/index';
import { OverlaySettings, GlobalPositionStrategy, AutoPositionStrategy } from '../services/index';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KEYS, isIE } from '../core/utils';
import { IgxDateRangeStartDirective, IgxDateRangeEndDirective, IgxDateRangeDirective } from './igx-date-range.directives';
import { PositionSettings } from '../services/overlay/utilities';
import { fadeIn, fadeOut } from '../animations/fade';

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
    templateUrl: './igx-date-range.component.html'
})
export class IgxDateRangeComponent implements AfterViewInit, OnDestroy {
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
     * Property that changes the default text on the `today` button.
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
     * Property that changes the default text on the `done` button.
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

    /**
     * @hidden
     */
    @ContentChild(IgxDateRangeStartDirective, { read: IgxDateRangeStartDirective, static: false })
    public startInput: IgxDateRangeStartDirective;

    /**
     * @hidden
     */
    @ContentChild(IgxDateRangeEndDirective, { read: IgxDateRangeEndDirective, static: false })
    public endInput: IgxDateRangeEndDirective;

    /**
     * @hidden
     */
    @ContentChild(IgxDateRangeDirective, { read: IgxDateRangeDirective, static: false })
    public singleInput: IgxDateRangeDirective;

    /**
     * @hidden
     */
    @ViewChild(IgxCalendarComponent, { read: IgxCalendarComponent, static: false })
    protected calendar: IgxCalendarComponent;

    /**
     * @hidden
     */
    @ViewChild(IgxToggleDirective, { read: IgxToggleDirective, static: false })
    protected toggle: IgxToggleDirective;

    private _destroy: Subject<boolean>;
    private _positionSettings: PositionSettings;
    private _dialogOverlaySettings: OverlaySettings;
    private _positionStrategy: AutoPositionStrategy;
    private _dropDownOverlaySettings: OverlaySettings;

    constructor() {
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
     * Gets the currently selected value / range from the calendar.
     */
    public get value(): Date | Date[] {
        return this.calendar.value;
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
        this.validateNgContent();
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
        if (selectionData.length > 1) {
            // range selection
            this.startInput || this.endInput ?
                this.handleTwoInputSelection(selectionData) :
                this.handleSingleInputSelection(selectionData);
            this.rangeSelected.emit(this);
        } else {
            // first selection in the range
            this.startInput || this.endInput ?
                this.handleTwoInputSelection([selectionData[0], null]) :
                this.handleSingleInputSelection([selectionData[0], null]);
        }
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
            this.startInput ? this.startInput.nativeElement.focus() :
                this.singleInput.nativeElement.focus();
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

    private handleSingleInputSelection(selectionData: Date[]): void {
        if (this.singleInput) {
            this.singleInput.value = this.extractRange(selectionData);
        }
    }

    private handleTwoInputSelection(selectionData: Date[]): void {
        const selectionRange = this.extractRange(selectionData);
        if (this.startInput) {
            this.startInput.value = selectionRange[0];
        }
        if (this.endInput) {
            this.endInput.value = selectionRange[selectionRange.length - 1];
        }
    }

    private getPositionTarget(): HTMLElement {
        if (this.startInput && this.endInput) {
            return this.startInput.nativeElement;
        }
        if (this.startInput) {
            return this.startInput.nativeElement;
        }
        if (this.endInput) {
            return this.endInput.nativeElement;
        }

        return this.singleInput.nativeElement;
    }

    private applyFormatting(date: Date): string {
        return this.formatter ? this.formatter(date) : this.applyLocaleToDate(date);
    }

    private applyLocaleToDate(value: Date): string {
        if (isIE() && value) {
            const localeDateStrIE = new Date(value.getFullYear(), value.getMonth(), value.getDate(),
                value.getHours(), value.getMinutes(), value.getSeconds(), value.getMilliseconds());
            return localeDateStrIE.toLocaleDateString(this.locale);
        }

        return value ? value.toLocaleDateString(this.locale) : null;
    }

    private extractRange(selection: Date[]): string[] {
        return [this.applyFormatting(selection[0]), this.applyFormatting(selection[selection.length - 1])];
    }

    private activateToggleOpen(overlaySettings: OverlaySettings): void {
        if (this.toggle.collapsed) {
            this.toggle.open(overlaySettings);
        }
    }

    private validateNgContent(): void {
        if (!this.singleInput && (!this.startInput || !this.endInput)) {
            // TODO: better error message
            throw new Error('You must apply both igxDateRangeStart and igxDateRangeEnd if you are using two input elements.');
        }
    }

    private attachOnKeydown(): void {
        if (this.singleInput) {
            fromEvent(this.singleInput.nativeElement, 'keydown').pipe(
                takeUntil(this._destroy)
            ).subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));
        }
        if (this.startInput && this.endInput) {
            fromEvent(this.startInput.nativeElement, 'keydown').pipe(
                takeUntil(this._destroy)
            ).subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));

            fromEvent(this.endInput.nativeElement, 'keydown').pipe(
                takeUntil(this._destroy)
            ).subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));
        }
    }

    private applyFocusOnClose() {
        if (this.singleInput) {
            this.toggle.onClosed.pipe(
                takeUntil(this._destroy)
            ).subscribe(() => this.singleInput.setFocus());
        }
        if (this.startInput) {
            this.toggle.onClosed.pipe(
                takeUntil(this._destroy)
            ).subscribe(() => this.startInput.setFocus());
        }
    }

    private configPositionStrategy(): void {
        this._positionSettings = {
            openAnimation: fadeIn,
            closeAnimation: fadeOut,
            target: this.getPositionTarget()
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
